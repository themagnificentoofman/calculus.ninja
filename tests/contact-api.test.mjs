import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { contactRetryAfter, reserveContactQuota, createContactApi, resendContactSender, CONTACT_RECIPIENT } from '../lib/server/contact-api.ts';

function database() {
  const sql = new DatabaseSync(':memory:');
  sql.exec('CREATE TABLE ai_quota (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL)');
  return { sql, db: { prepare: statement => ({ bind: (...values) => ({ statement, values }) }), batch: async statements => {
    sql.exec('BEGIN');
    try { const result = statements.map(({statement,values}) => ({results:sql.prepare(statement).all(...values)})); sql.exec('COMMIT'); return result; }
    catch(error) { sql.exec('ROLLBACK'); throw error; }
  } } };
}
const body = { topic: 'bug', message: 'The equation is clipped on my phone.', requestId: '00000000-0000-4000-8000-000000000001' };
const request = (input = body, headers = {}, method = 'POST') => new Request('https://calculus.ninja/api/contact', { method, headers: {authorization:'Bearer test',origin:'https://calculus.ninja','content-type':'application/json',...headers}, ...(method === 'POST' ? {body:JSON.stringify(input)} : {}) });
function setup(options = {}) {
  const {sql,db} = database(); let now = 86401000, sent = 0;
  const api = createContactApi({verify:async()=>({sub:'player-a',email:'player@example.com'}),reserve:(uid,time)=>reserveContactQuota(db,uid,time),status:(uid,time)=>contactRetryAfter(db,uid,time),send:async()=>{sent++;},now:()=>now,...options});
  return {sql,db,api,sent:()=>sent,setNow:value=>{now=value;}};
}

test('contact cooldown permits one concurrent send and survives new API instances', async()=>{
  const s = setup();
  try {
    const results = await Promise.all(Array.from({length:20},()=>s.api(request())));
    assert.equal(results.filter(r=>r.status===200).length,1);
    assert.equal(s.sent(),1);
    assert.ok(results.filter(r=>r.status===429).every(r=>r.headers.get('retry-after')==='60'));
    assert.equal(await contactRetryAfter(s.db,'player-a',86402000),59);
    assert.equal(await reserveContactQuota(s.db,'player-a',86460999),1);
    assert.equal(await reserveContactQuota(s.db,'player-a',86461000),0);
  } finally { s.sql.close(); }
});

test('contact daily and site limits stay separate from AI budgets', async()=>{
  const {sql,db}=database();
  try {
    for(let i=0;i<10;i++) assert.equal(await reserveContactQuota(db,'a',86401000+i*60000),0);
    assert.ok(await reserveContactQuota(db,'a',86401000+10*60000)>60);
    assert.equal(await reserveContactQuota(db,'b',86401000),0);
    for(let i=0;i<89;i++) assert.equal(await reserveContactQuota(db,`other-${i}`,86401000),0);
    assert.ok(await reserveContactQuota(db,'beyond-site-cap',86401000)>60);
    assert.equal(await reserveContactQuota(db,'a',172801000),0);
    assert.equal(sql.prepare("SELECT COUNT(*) AS n FROM ai_quota WHERE key NOT LIKE 'contact:%'").get().n,0);
  } finally {sql.close();}
});

test('contact status exposes server cooldown without consuming a slot',async()=>{
  const s=setup();try {
    assert.deepEqual(await (await s.api(request(null,{},'GET'))).json(),{retryAfter:0});
    await s.api(request());s.setNow(86411000);
    assert.deepEqual(await (await s.api(request(null,{},'GET'))).json(),{retryAfter:50});
    assert.equal(s.sent(),1);
  }finally{s.sql.close();}
});

test('unauthenticated, forged, cross-site, and malformed submissions never deliver',async()=>{
  const s=setup();try{
    assert.equal((await s.api(request(body,{authorization:''}))).status,401);
    assert.equal((await s.api(request(body,{origin:'https://evil.example'}))).status,403);
    assert.equal((await s.api(request(body,{'sec-fetch-site':'cross-site'}))).status,403);
    for(const invalid of [null,[],{...body,to:'other@example.com'},{...body,email:'forged@example.com'},{...body,topic:'__proto__'},{...body,message:'short'},{...body,message:'x'.repeat(4001)},{...body,message:'bad\u0000message'},{...body,requestId:'bad'}]) assert.equal((await s.api(request(invalid))).status,400);
    assert.equal((await s.api(new Request('https://calculus.ninja/api/contact',{method:'POST',headers:{authorization:'Bearer test','content-type':'application/json'},body:'x'.repeat(20001)}))).status,400);
    assert.equal(s.sent(),0);
    assert.equal(sqlCount(s.sql),0);
  }finally{s.sql.close();}
  const invalid=setup({verify:async()=>{throw new Error('bad token');}});
  try{assert.equal((await invalid.api(request())).status,401);assert.equal(invalid.sent(),0);}finally{invalid.sql.close();}
});
const sqlCount=sql=>sql.prepare('SELECT COUNT(*) AS n FROM ai_quota').get().n;

test('delivery failures never report success or leak credentials and retain cooldown',async()=>{
  const s=setup({send:async()=>{throw new Error('secret-provider-response');}});
  try{
    const result=await s.api(request());assert.equal(result.status,503);assert.equal(result.headers.get('retry-after'),'60');
    const payload=await result.json();assert.equal(payload.ok,undefined);assert.equal(payload.retryAfter,60);assert.ok(!JSON.stringify(payload).includes('secret-provider-response'));
    assert.equal((await s.api(request({...body,requestId:'00000000-0000-4000-8000-000000000002'}))).status,429);
  }finally{s.sql.close();}
});

test('email adapter fixes recipient, uses account reply-to, sends plain text and stable idempotency keys',async()=>{
  const calls=[];
  const sender=resendContactSender('test-key','Calculus Ninja <contact@example.com>',async(url,options)=>{calls.push({url,...options,body:JSON.parse(options.body)});return Response.json({id:'test-delivery'});});
  const input={uid:'player-a',email:'player@example.com',topic:'bug',message:'<script>plain text</script>',requestId:body.requestId};
  await sender(input);await sender(input);
  assert.equal(calls[0].url,'https://api.resend.com/emails');
  assert.deepEqual(calls[0].body.to,[CONTACT_RECIPIENT]);assert.equal(calls[0].body.reply_to,input.email);assert.equal(calls[0].body.html,undefined);
  assert.ok(calls[0].body.text.includes(input.message));assert.equal(calls[0].headers['Idempotency-Key'],calls[1].headers['Idempotency-Key']);
  await assert.rejects(resendContactSender('test','sender',async()=>Response.json({error:'private'},{status:429}))(input),/unavailable/);
});

test('contextual report categories bind only the saved reference or entered lesson and section', async () => {
  const deliveries = [];
  const id = 'cn_0123456789abcdef0123';
  const accepted = [
    {topic:'problem', problemId:id, problemRevision:3},
    {topic:'problem', problemId:id},
    {topic:'problem'},
    {topic:'study', studyLesson:' Series ', studySection:' Ratio test '},
    {topic:'other'},
    {topic:'balance'},
    {topic:'question'},
  ];
  for (const input of accepted) {
    const s = setup({send:async payload=>deliveries.push(payload)});
    try { assert.equal((await s.api(request({...body,...input}))).status,200); }
    finally { s.sql.close(); }
  }
  assert.equal(deliveries[0].problemRevision,3);
  assert.equal(deliveries[1].problemRevision,undefined);
  assert.equal(deliveries[2].problemId,undefined);
  assert.equal(deliveries[3].studyLesson,'Series');
  assert.equal(deliveries[3].studySection,'Ratio test');
  const s = setup();
  try {
    for (const bad of [
      {topic:'study'}, {topic:'study',studyLesson:'Only a lesson'}, {topic:'study',studyLesson:'A',studySection:' '},
      {topic:'study',studyLesson:'A',studySection:'B\nC'}, {topic:'study',studyLesson:'A'.repeat(121),studySection:'B'},
      {topic:'problem',problemId:id,problemRevision:-1}, {topic:'problem',problemId:id,problemRevision:'3'},
      {topic:'problem',problemRevision:4}, {topic:'problem',problemId:'forged'}, {topic:'other',problemId:id},
      {topic:'problem',studyLesson:'A',studySection:'B'}, {topic:'unknown'}, {topic:'__proto__'},
    ]) assert.equal((await s.api(request({...body,...bad}))).status,400,JSON.stringify(bad));
    assert.equal(s.sent(),0);assert.equal(sqlCount(s.sql),0);
  } finally {s.sql.close();}
  const sent = [];
  const mock=resendContactSender('test','Test sender',async(_,init)=>{sent.push(JSON.parse(init.body));return Response.json({id:'local-only'});});
  for (const d of deliveries) await mock(d);
  assert.ok(sent[0].text.includes('Problem ID: '+id+'\nSaved revision: 3'));
  assert.ok(!sent[1].text.includes('Saved revision:'));
  assert.ok(sent[3].text.includes('Lesson: Series\nSection: Ratio test'));
  assert.ok(sent[4].subject.endsWith('Other'));
});

test('contextual sign-in returns and drafts are exact, bounded and local', async () => {
  const {afterSignIn}=await import('../lib/study/practice-link.mjs');
  const {problemReportHref}=await import('../lib/contact-link.mjs');
  const {freshContactDraft,readContactDraft,draftFields}=await import('../lib/contact-client.ts');
  const id='cn_0123456789abcdef0123', p=problemReportHref(id,7), q=problemReportHref(id);
  assert.equal(p,'/contact?topic=problem&problemId='+id+'&revision=7');
  assert.equal(q,'/contact?topic=problem&problemId='+id);
  assert.equal(afterSignIn(p),p);assert.equal(afterSignIn(q),q);
  const initial=freshContactDraft(p);
  assert.deepEqual(draftFields(initial),{problemId:id,problemRevision:7});
  assert.deepEqual(draftFields(freshContactDraft(q)),{problemId:id});
  assert.deepEqual(draftFields(freshContactDraft(problemReportHref())),{});
  const draft={...initial,topic:'study',lesson:'Power series',section:'Endpoints',message:'The lower endpoint appears to be included.',requestId:body.requestId};
  const stored=JSON.stringify({path:p,draft});
  assert.deepEqual(readContactDraft(p,stored),draft);
  assert.deepEqual(draftFields(draft),{studyLesson:'Power series',studySection:'Endpoints'});
  assert.deepEqual(readContactDraft(q,stored),freshContactDraft(q));
  assert.deepEqual(readContactDraft(p,'invalid'),initial);
  for(const suffix of ['&revision=8','&next=https://elsewhere','#x','&extra=x'])assert.equal(afterSignIn(p+suffix),'/contact');
  for(const rev of ['0','-1','1.2','007','9007199254740992'])assert.equal(afterSignIn(q+'&revision='+rev),'/contact');
  assert.equal(afterSignIn('//example.org/contact'),'/');
  assert.equal(afterSignIn('/contact?topic=problem&revision=2'),'/contact');
});

test('a token arriving after contact cancellation cannot send or expose an upstream error',async()=>{
  const {contactRequest}=await import('../lib/contact-client.ts');
  let deliver, calls=0;
  const c=new AbortController();
  const p=contactRequest(()=>new Promise(resolve=>{deliver=resolve;}),c.signal,body,async()=>{calls++;return Response.json({ok:true});});
  c.abort();await assert.rejects(p);deliver('late-token');
  await new Promise(resolve=>setImmediate(resolve));assert.equal(calls,0);
  const safe=await contactRequest(async()=>'local',new AbortController().signal,body,async()=>Response.json({error:'private service detail',retryAfter:60},{status:503}));
  assert.deepEqual(safe,{ok:false,status:503,retryAfter:60});
});
