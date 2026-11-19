// Bind current first-party source and pinned dependency inputs to the private
// issuance policy. Refreshing this artifact is not admission or release review.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,relative,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import ts from 'typescript';
import {assertNoHeldAssessmentRevisions} from '../../lib/bank/free-response-assessment-holds.mjs';
import {canonical} from '../../lib/bank/compact-codec.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const output='lib/server/round-creation-policy.json';
const sha=v=>createHash('sha256').update(v).digest('hex');
const entries=['scripts/bank/free-response.mjs','scripts/bank/free-response-storage.mjs','scripts/bank/free-response-index.mjs','app/api/rounds/route.ts','app/api/questions/route.ts','app/api/games/route.ts','app/api/social/route.ts','lib/server/round-creation.mjs','lib/server/round-intents.ts','lib/server/round-authorizations.mjs','lib/server/prepared-authorization.mjs','lib/server/authorization-catalog.mjs','lib/server/mixed-question-selection.mjs','lib/server/round-creation-policy.mjs','lib/server/catalog-writer.mjs','lib/server/content-release.mjs'];
export function requireLiteralSource(source,name,value,file='policy-source.ts'){
 // Parse declarations without evaluating modules. Comments, strings and nested
 // declarations cannot stand in for the actual exported protocol constant.
 const syntax=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
 const declarations=syntax.statements.filter(ts.isVariableStatement).flatMap(statement=>
  statement.declarationList.declarations.filter(declaration=>ts.isIdentifier(declaration.name)&&declaration.name.text===name).map(declaration=>({statement,declaration})));
 const match=declarations.length===1?declarations[0]:undefined;
 const literal=match?.declaration.initializer;
 const exported=match?.statement.modifiers?.some(modifier=>modifier.kind===ts.SyntaxKind.ExportKeyword);
 const ambient=syntax.isDeclarationFile||match?.statement.modifiers?.some(modifier=>modifier.kind===ts.SyntaxKind.DeclareKeyword);
 const constant=match&&(match.statement.declarationList.flags&ts.NodeFlags.Const)!==0;
 const exact=literal&&(typeof value==='string'?ts.isStringLiteral(literal)&&literal.text===value:typeof value==='number'&&ts.isNumericLiteral(literal)&&Number(literal.text)===value);
 if(syntax.parseDiagnostics.length||ambient||!exported||!constant||!exact)throw Error('Review the creation-policy contract label for '+name);
}
function requireLiteral(file,name,value){
 requireLiteralSource(readFileSync(resolve(root,file),'utf8'),name,value,file);
}
export async function expectedCreationPolicy(){
 // Metadata resolves all local imports without executing application modules.
 // Only the generated manifest is excluded to avoid hashing itself.
 requireLiteral('lib/server/round-intents.ts','ROUND_INTENT_VERSION','round-intent-1');
 requireLiteral('lib/server/round-authorizations.mjs','AUTHORIZATION_VERSION',1);
 requireLiteral('lib/math-answer/v2/grade.mjs','GRADER_VERSION','exact-algebra-2');
 requireLiteral('lib/math-answer/v2/grade.mjs','PARSER_VERSION','bounded-latex-2');
 const graph=await build({absWorkingDir:root,entryPoints:entries,bundle:true,write:false,metafile:true,packages:'external',platform:'neutral',format:'esm',outdir:'/unused-policy-output',logLevel:'silent',plugins:[{name:'policy-manifest-cycle',setup(b){b.onResolve({filter:/round-creation-policy\.json$/},args=>resolve(args.resolveDir,args.path)===resolve(root,output)?{path:output,external:true}:undefined);}}]});
 const files=[...new Set([...Object.keys(graph.metafile.inputs),'package-lock.json','package.json','scripts/milestone4/creation-policy.mjs','scripts/run-framework.mjs','scripts/bank/checker-source.mjs','scripts/bank/compile-practice-cells.mjs','scripts/milestone4/checker-policy.mjs','lib/math-answer/checker-sources.json','lib/math-answer/versioned-contracts.ts','lib/math-answer/contracts.ts','drizzle/0008_free_response_storage.sql','drizzle/0009_free_response_selection_metadata.sql','drizzle/0010_round_authorizations.sql','drizzle/0011_competitive_catalog_window.sql','scripts/milestone4/round-control.mjs','firestore.rules'])].sort();
 if(files.some(p=>p===output||relative(root,resolve(root,p)).startsWith('..')||p.includes('node_modules/')))throw Error('Unexpected policy source boundary');
 const sourceHashes=Object.fromEntries(files.map(p=>[p,sha(readFileSync(resolve(root,p)))]));
 const registry=JSON.parse(readFileSync(resolve(root,'lib/server/free-response-admissions.json'),'utf8'));
 assertNoHeldAssessmentRevisions(registry);
 const body={version:'round-creation-policy-v1',policy:{selection:'joint-capped-v2',authorizationCatalog:'mixed-catalog-cell-v3-or-complete-fallback',authorization:1,intent:'round-intent-1',maxRoundSize:20,familyCap:2,rounds:{easy:5,medium:5,hard:5,olympiad:10},qualificationRoundSize:20,recovery:'original-binding-before-current-gates',legacy:'exact-admission-and-account-opt-in',activationModes:['test','rapid'],competitiveCatalog:'closed-writer-window-v1'},registryHash:sha(canonical(registry)),sourceHashes};
 return {...body,digest:sha(canonical(body))};
}
export async function verifyCreationPolicy(){
 const expected=await expectedCreationPolicy();
 if(!existsSync(resolve(root,output))||canonical(JSON.parse(readFileSync(resolve(root,output),'utf8')))!==canonical(expected))throw Error('Creation-policy source changed. Review the delta, then explicitly regenerate its private manifest.');
 return {digest:expected.digest,sourceFiles:Object.keys(expected.sourceHashes).length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.includes('--write')){const value=await expectedCreationPolicy();writeFileSync(resolve(root,output),JSON.stringify(value,null,2)+'\n');console.log(JSON.stringify({digest:value.digest,sourceFiles:Object.keys(value.sourceHashes).length,status:'private source binding only; not admission or deployment'}));}
 else console.log(JSON.stringify(await verifyCreationPolicy()));
}
