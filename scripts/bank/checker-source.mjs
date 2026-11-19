// Source identities are private admission evidence, not mutable runtime labels.
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import ts from 'typescript';
import {canonical} from '../../lib/bank/compact-codec.mjs';
import {CHECKERS} from '../../lib/math-answer/versioned-grade.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const sha=value=>createHash('sha256').update(value).digest('hex');
export const CHECKER_FILES=Object.freeze(['lib/math-answer/contracts.ts','lib/math-answer/parser.mjs','lib/math-answer/rational.mjs','lib/math-answer/algebra.mjs','lib/math-answer/domain.mjs','lib/math-answer/grade.mjs']);
const legacy=CHECKERS[0];
const source=path=>readFileSync(resolve(root,path),'utf8');
const identity=value=>typeof value==='string'?CHECKERS.find(c=>c.key===value):CHECKERS.find(c=>c.graderVersion===value?.graderVersion&&c.parserVersion===value?.parserVersion);
export function checkerSourceFiles(version=legacy.key,readSource=source){
 const checker=identity(version);if(!checker)throw Error('Unknown checker source identity');
 // Frozen legacy aggregate retains both its original paths and exact bytes.
 if(checker===legacy)return [...CHECKER_FILES];
 const seen=new Set(),pending=['lib/math-answer/v2/grade.mjs','lib/math-answer/versioned-contracts.ts'];
 while(pending.length){
  const path=pending.pop();if(seen.has(path))continue;seen.add(path);
  const syntax=ts.createSourceFile(path,readSource(path),ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
  if(syntax.parseDiagnostics.length)throw Error('Cannot parse checker source '+path);
  const dependencies=[];
  const visit=node=>{
   if(ts.isImportEqualsDeclaration(node)||ts.isExternalModuleReference(node))throw Error('Unsupported checker import form');
   if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier){
    if(!ts.isStringLiteral(node.moduleSpecifier))throw Error('Nonliteral checker import');
    dependencies.push(node.moduleSpecifier.text);
   }
   if(ts.isCallExpression(node)&&(node.expression.kind===ts.SyntaxKind.ImportKeyword||ts.isIdentifier(node.expression)&&node.expression.text==='require'))throw Error('Dynamic checker dependency');
   if(ts.isImportTypeNode(node))throw Error('Use a static checker type import');
   ts.forEachChild(node,visit);
  };
  visit(syntax);
  for(const name of dependencies){
   if(!name.startsWith('.'))throw Error('External checker dependency');
   const absolute=resolve(root,dirname(path),name),candidate=[absolute,absolute+'.mjs',absolute+'.ts'].find(p=>existsSync(p));
   const target=candidate&&relative(root,candidate);
   if(!target?.startsWith('lib/math-answer/')||!/\.(mjs|ts)$/.test(target))throw Error('Unexpected checker source boundary');
   pending.push(target);
  }
 }
 return [...seen].sort();
}
export function currentCheckerSourceHash(version=legacy.key,readSource=source){
 return sha(canonical(Object.fromEntries(checkerSourceFiles(version,readSource).map(path=>[path,sha(readSource(path))]))));
}
