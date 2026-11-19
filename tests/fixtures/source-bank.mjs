import {gzipSync} from 'node:zlib';
import {canonical} from '../../lib/bank/compact-codec.mjs';
import {frDigest} from '../../lib/bank/free-response-record.mjs';

// Storage-only synthetic MC input. It is never added to a real bank or registry.
export async function sourceFixture(db,{corruptPayload=false,completePresentation=false}={}){
 const problemId='cn_11111111111111111111',semanticHash='a'.repeat(64);
 const body={schemaVersion:2,familyId:'mc-fixture',difficulty:'medium',topic:'differentiation',statement:'Find the derivative of x squared.',choices:[{choiceId:'a',math:'2x'},{choiceId:'b',math:'x'},{choiceId:'c',math:'2'},{choiceId:'d',math:'0'}],answerChoiceId:'a',solutionSteps:['2x'],legacy:false};
 if(completePresentation)Object.assign(body,{assumptions:['All variables are real.'],subtopic:'Isolated derivative fixture',techniqueTags:['power-rule'],parameters:{},templateVersion:'fixture-only'});
 const contentHash=await frDigest({...body,problemId,problemRevision:1,semanticHash});
 db.prepare("INSERT INTO cbank_shared VALUES(1,?,'{}')").run(Buffer.alloc(32,1));
 db.prepare('INSERT INTO cbank_problems VALUES(1,?,1,?,?,1,?)').run(problemId,Buffer.from(contentHash,'hex'),Buffer.from(semanticHash,'hex'),gzipSync(canonical(corruptPayload?{...body,statement:'Different unbound source task.'}:body)));
 db.exec("INSERT INTO cbank_publication VALUES(1,'approved',NULL); INSERT INTO cbank_releases VALUES('source-mc','{}',1,'published'); INSERT INTO cbank_releases VALUES('policy-update','{}',1,'published'); INSERT INTO cbank_pools VALUES(1,'source-mc','differentiation','medium','*','mc-fixture',1); INSERT INTO cbank_slots VALUES(1,0,1); INSERT INTO cbank_config VALUES('active_release','source-mc'); INSERT INTO cbank_family_lineage VALUES('mc-fixture','fixture-derivative');");
 db.prepare('INSERT INTO cbank_problem_lineage VALUES(?,?)').run(problemId,'fixture-derivative-square');
 return {kind:'bank',problemId,problemRevision:1,contentHash,familyId:'mc-fixture',constructionFamilyId:'fixture-derivative',lineageId:'fixture-derivative-square',bankRelease:'source-mc',mcDifficulty:'medium'};
}

