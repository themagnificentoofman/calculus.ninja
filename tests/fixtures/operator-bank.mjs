// Three synthetic integration tasks exercise the real compact selector and
// codec. These rows exist only in the temporary QA database.
import {gzipSync} from 'node:zlib';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {openCompact} from '../../scripts/bank/compact.mjs';
import {canonical} from '../../lib/bank/compact-codec.mjs';

const hash = value => createHash('sha256').update(canonical(value)).digest('hex');
export const operatorTestRelease = 'isolated-operator-gameplay-v2';

export function openOperatorTestBank(path) {
  const db = openCompact(path);
  db.exec(readFileSync(new URL('../../drizzle/0000_dazzling_tenebrous.sql',import.meta.url),'utf8'));
  db.prepare("INSERT INTO cbank_releases VALUES(?,'{}',3,'published')").run(operatorTestRelease);
  db.prepare("INSERT INTO cbank_config VALUES('active_release',?)").run(operatorTestRelease);
  const tasks = [
    ['power-rule',String.raw`\int_0^2 x^2\,dx`,[String.raw`\frac{8}{3}`,'4','8','2'],String.raw`\left[\frac{x^3}{3}\right]_0^2=\frac{8}{3}`],
    ['linear-substitution',String.raw`\int_0^1 2e^{2x}\,dx`,['e^2-1','e^2','2e-2','1'],String.raw`\left[e^{2x}\right]_0^1=e^2-1`],
    ['odd-symmetry',String.raw`\int_{-1}^{1} x^3\,dx`,['0','1','2','-1'],String.raw`\left[\frac{x^4}{4}\right]_{-1}^{1}=0`],
  ];
  for (const [index,[technique,statement,answers,step]] of tasks.entries()) {
    const ref = index+1, family = 'qa-'+technique;
    const choices = answers.map((math,i)=>({choiceId:'choice-'+i,math}));
    const payload = {schemaVersion:2,templateVersion:'fixture-1',topic:'integration',difficulty:'easy',familyId:family,
      assumptions:['Use real variables.'],subtopic:'Definite integrals',techniqueTags:[technique],parameters:{},
      statement,choices,answerChoiceId:choices[0].choiceId,solutionSteps:[step],legacy:false};
    const problemId='cn_'+hash(statement).slice(0,20),semanticHash=hash([statement,answers[0]]);
    const contentHash=hash({...payload,problemId,problemRevision:1,semanticHash});
    db.prepare("INSERT INTO cbank_shared VALUES(?,?,'{}')").run(ref,Buffer.alloc(32,ref));
    db.prepare('INSERT INTO cbank_problems VALUES(?,?,1,?,?,?,?)')
      .run(ref,problemId,Buffer.from(contentHash,'hex'),Buffer.from(semanticHash,'hex'),ref,gzipSync(canonical(payload)));
    db.prepare("INSERT INTO cbank_publication VALUES(?,'approved',NULL)").run(ref);
    db.prepare("INSERT INTO cbank_pools VALUES(?,?,'integration','easy','*',?,1)").run(ref,operatorTestRelease,family);
    db.prepare('INSERT INTO cbank_slots VALUES(?,0,?)').run(ref,ref);
    db.prepare('INSERT INTO cbank_selection_features VALUES(?,?,?,?,?,?)').run(ref,technique,family,technique,'execution:'+technique,1);
  }
  return db;
}
