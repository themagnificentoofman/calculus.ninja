const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function studySyllabusState(search) {
  const query = new URLSearchParams(typeof search === 'string' && search.length <= 1500 ? search : '');
  const one = key => query.getAll(key).length === 1 ? (query.get(key) ?? '') : '';
  const term = (one('q') || '').trim().slice(0,100);
  const kind = one('kind'), tier = one('tier'), topic = one('topic');
  return {q:term, kind:['module','reading','exercise'].includes(kind) ? kind : '',
    tier:['easy','medium','hard','olympiad'].includes(tier) ? tier : '',
    topic:topic && topic.length<=80 && slug.test(topic) ? topic : ''};
}
export function syllabusQuery(state) {
  const q = new URLSearchParams();
  for (const key of ['q','kind','tier','topic']) if(state[key]) q.set(key,state[key]);
  return new URLSearchParams(Object.entries(studySyllabusState(q.toString())).filter(([,v])=>v)).toString();
}
export function syllabusHref(query, item='') {
  const qs=new URLSearchParams(syllabusQuery(studySyllabusState(query)));
  const anchor=slug.test(item) && item.length<=180 ? item : 'syllabus';
  if(anchor!=='syllabus')qs.set('result',anchor);
  return '/study'+(qs.size?'?'+qs:'')+'#'+anchor;
}
export function withSyllabus(href, state, result) {
  const url=new URL(href, 'https://study.invalid');
  if(url.origin!=='https://study.invalid'||!url.pathname.startsWith('/study/')) throw new TypeError('Invalid Study destination');
  const query=syllabusQuery(state);
  if(query)url.searchParams.set('syllabus',query);
  if(slug.test(result)&&result.length<=180)url.searchParams.set('result',result);
  return url.pathname+url.search+url.hash;
}

