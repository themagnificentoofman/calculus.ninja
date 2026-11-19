// Write a public projection commitment only after verifying the full private evidence.
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {verifyPrivateMenuProjection} from './verify-m4-presentation.mjs';
const [manifestFile,menuFile,proofFile,output]=process.argv.slice(2);
if(!output)throw Error('Pass private binding, public menu projection, private evidence archive and a new output path');
const binding=JSON.parse(readFileSync(manifestFile)),menuBytes=readFileSync(menuFile);
verifyPrivateMenuProjection(JSON.parse(menuBytes),binding,readFileSync(proofFile));
const presentation={format:'source-bound-menu-projection-v1',sha256:createHash('sha256').update(menuBytes).digest('hex')};
writeFileSync(output,JSON.stringify({...binding,presentation},null,2)+'\n',{flag:'wx'});
