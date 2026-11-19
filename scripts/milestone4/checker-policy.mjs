import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {canonical} from '../../lib/bank/compact-codec.mjs';
import {CHECKERS} from '../../lib/math-answer/versioned-grade.mjs';
import {checkerSourceFiles,currentCheckerSourceHash} from '../bank/checker-source.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const target=resolve(root,'lib/math-answer/checker-sources.json');
export function expectedCheckerSources(){
 const checkers=Object.fromEntries(CHECKERS.map(c=>[c.key,{graderVersion:c.graderVersion,parserVersion:c.parserVersion,sourceHash:currentCheckerSourceHash(c),sources:Object.fromEntries(checkerSourceFiles(c).map(p=>[p,createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')]))}]));
 if(checkers['exact-algebra-1/bounded-latex-1'].sourceHash!=='1ae21d694037ba320151199e0020fff9175d1d11ccc6e10fa9489766024290fd')throw Error('Frozen v1 checker source changed');
 return {version:'checker-sources-1',checkers};
}
export function verifyCheckerSources(){
 const expected=expectedCheckerSources();
 if(canonical(JSON.parse(readFileSync(target,'utf8')))!==canonical(expected))throw Error('Checker source changed. Review the delta before explicitly regenerating its private manifest.');
 return Object.fromEntries(Object.entries(expected.checkers).map(([key,value])=>[key,value.sourceHash]));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.includes('--write')){writeFileSync(target,JSON.stringify(expectedCheckerSources(),null,2)+'\n');console.log('Saved private checker source identities; no admission or activation.');}
 else console.log(JSON.stringify(verifyCheckerSources()));
}
