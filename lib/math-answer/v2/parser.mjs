// bounded-latex-2: indexed roots desugar exactly to a rational power.
import {LIMITS,MathInputError,decimal,rat} from './rational.mjs';
const functions=new Set(['sqrt','ln','exp','sin','cos','tan','arcsin','arccos','arctan','sinh','cosh','tanh','abs']);
const safe=new Set([...functions,'frac','dfrac','tfrac','pi','cdot','times','left','right','lvert','rvert','vert','operatorname','mathrm','quad','qquad']);
const forbidden=/\\(?:html\w*|href|url|include\w*|input|def|gdef|edef|newcommand|renewcommand|require|style|class|css\w*|textcolor|color|bbox)\b|[<>`#$&]|(?:__proto__|constructor|prototype)/;
export function preflight(source){
 if(typeof source!=='string'||!source.trim())throw new MathInputError('invalid','Enter an answer first.');
 if(source.length>LIMITS.source)throw new MathInputError('indeterminate','Keep the answer under 2,048 characters. Your draft has been kept.');
 if(forbidden.test(source)||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(source))throw new MathInputError('invalid','Only mathematical notation is allowed. Remove formatting or executable commands.');
 let depth=0;for(const c of source){if('({['.includes(c)&&++depth>LIMITS.depth)throw new MathInputError('indeterminate','Use fewer nested groups.');if(')}]'.includes(c))depth--;}
 if(/\d{65}/.test(source))throw new MathInputError('indeterminate','Use at most 64 digits in one number.');
}
export function parse(source,{variables=[],constant=false,allowedOperators=[]}={},work){
 preflight(source);
 source=source.replace(/[−–]/g,'-');
 if(/(?:\d|\.)\s*[eE]\s*[+-]?\s*\d/.test(source))throw new MathInputError('invalid','Use 2*10^{-3} for scientific notation, or an explicit multiplication sign for Euler’s number.');
 if(/\^(?:\d{2,}|[-+(]|[A-Za-z]{2,})/.test(source))throw new MathInputError('invalid','Put a signed, multidigit or compound exponent inside braces, for example x^{-2} or x^{12}.');
 // No arbitrary macro expansion, assignments, evaluation, or ambient symbol table.
 source=source.replace(/\\operatorname\{(arcsin|arccos|arctan|sinh|cosh|tanh|abs|exp)\}/g,'\\$1').replace(/\\mathrm\{(e|C)\}/g,'$1');
 for(const [,cmd]of source.matchAll(/\\([A-Za-z]+)/g))if(!safe.has(cmd))throw new MathInputError('unsupported',`The ${cmd} notation is not supported for this answer. You can edit or reveal the solution.`);
 source=source.replace(/\\(?:left|right)\b/g,'').replace(/\\(?:[,;! ]|quad\b|qquad\b)/g,' ').replace(/\\(?:cdot|times)\b/g,'*').replace(/\\(?:lvert|rvert|vert)\b/g,'|').replace(/\\(?:dfrac|tfrac)\b/g,'\\frac').replace(/[−–]/g,'-').replace(/π/g,'\\pi');
 const tokens=[];let p=0;while(p<source.length){if(/\s/.test(source[p])){p++;continue;}const m=/^(\\[A-Za-z]+|(?:\d+(?:\.\d*)?|\.\d+)|[A-Za-z]+|[+\-*/^(){}\[\]|!,])/.exec(source.slice(p));if(!m)throw new MathInputError('invalid','Check the syntax near '+source.slice(p,p+12)+'.');tokens.push(m[0]);p+=m[0].length;if(tokens.length>LIMITS.tokens)throw new MathInputError('indeterminate','The answer has too many parts.');}
 let i=0,nodes=0,depth=0;const node=(op,...args)=>{work?.spend();if(++nodes>LIMITS.nodes)throw new MathInputError('indeterminate','The answer has too many parts.');return {op,args};};
 const take=t=>{if(tokens[i]!==t)throw new MathInputError('invalid',`Expected ${t}.`);i++;};
 const group=()=>{const open=tokens[i++];if(!['(','{'].includes(open))throw new MathInputError('invalid','Use parentheses around this function argument.');const a=expr();take(open==='('?')':'}');return a;};
 function atom(){if(++depth>LIMITS.depth)throw new MathInputError('indeterminate','Use fewer nested groups.');let t=tokens[i++],a;
  if(!t)throw new MathInputError('invalid','Finish the expression.');
  if(/^(?:\d|\.)/.test(t))a=node('q',decimal(t,work));
  else if(t==='('||t==='{'){i--;a=group();}
  else if(t==='|'){if(!allowedOperators.includes('abs'))throw new MathInputError('unsupported','Absolute-value form is not supported for this answer.');a=expr();take('|');a=node('abs',a);}
  else if(t==='\\frac'){const x=group(),y=group();a=node('/',x,y);}
  else if(t==='\\sqrt'&&tokens[i]==='['){
   if(!allowedOperators.includes('root'))throw new MathInputError('unsupported','Indexed roots are not supported for this answer.');
   i++;const degree=tokens[i++];
   if(!/^[1-9][0-9]?$/.test(degree||''))throw new MathInputError('invalid','Use a positive integer literal as the root index.');
   take(']');const n=Number(degree);
   if(n<2||n>32)throw new MathInputError('unsupported','Use a root index from 2 through 32.');
   if(tokens[i]!=='{')throw new MathInputError('invalid','Put the complete indexed-root radicand in braces.');
   a=node('^',group(),node('q',rat(1,n,work)));
  }

  else if(t==='\\pi'||t==='pi'||t==='e')a=node('symbol',t==='\\pi'?'pi':t);
  else if(variables.includes(t)||(constant&&t==='C'))a=node('symbol',t);
  else {const f=t.replace(/^\\/,'');if(!functions.has(f))throw new MathInputError('unsupported',`Use only the stated variables. The symbol ${t} is not supported here.`);if(!allowedOperators.includes(f))throw new MathInputError('unsupported',`The ${f} form is not supported for this answer.`);
   let powerValue=null;if(tokens[i]==='^'){i++;powerValue=exponent();if(['sin','cos','tan'].includes(f)&&powerValue.op==='*'&&powerValue.args[0].op==='q'&&powerValue.args[0].args[0][0]===-1n&&powerValue.args[1].op==='q'&&powerValue.args[1].args[0][0]===1n&&powerValue.args[1].args[0][1]===1n)throw new MathInputError('invalid','Use arcsin(x), arccos(x) or arctan(x) for an inverse function, or an explicit fraction for a reciprocal.');}
   if(!['(','{'].includes(tokens[i]))throw new MathInputError('invalid','Put the complete function argument in parentheses or braces, for example ln(x) or sqrt{x}.');
   const arg=group();a=node(f,arg);if(powerValue)a=node('^',a,powerValue);
  }
  depth--;return a;
 }
 function exponent(){const t=tokens[i];if(t!=='{'&&!/^(?:[0-9A-Za-z]|\\pi)$/.test(t||''))throw new MathInputError('invalid','Put the complete exponent in braces, for example x^{12} or x^{-2}.');return atom();}
 function power(){let a=atom();if(tokens[i]==='^'){i++;a=node('^',a,exponent());}if(tokens[i]==='!')throw new MathInputError('unsupported','Factorial notation is not yet checked. Enter an evaluated final value.');return a;}
 function unary(){if(tokens[i]==='+'){i++;return unary();}if(tokens[i]==='-'){i++;return node('*',node('q',rat(-1)),unary());}return power();}
 const starts=t=>!!t&&(/^(?:\\[A-Za-z]+|[A-Za-z]+|\d|\.)/.test(t)||t==='('||t==='{');
 function product(){let a=unary();while(tokens[i]==='*'||tokens[i]==='/'||starts(tokens[i])){const op=tokens[i]==='*'||tokens[i]==='/'?tokens[i++]:'*';a=node(op,a,unary());}return a;}
 function expr(){let a=product();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++];a=node(op,a,product());}return a;}
 const ast=expr();if(i!==tokens.length)throw new MathInputError('invalid','Check unmatched brackets or use the requested answer structure.');return ast;
}
export const astKey=a=>a.op==='q'?`${a.args[0][0]}/${a.args[0][1]}`:a.op==='symbol'?a.args[0]:`${a.op}(${a.args.map(astKey).join(',')})`;
/** Complete, precedence-aware TeX. The caller bounds its length, never truncates. */
export function astLatex(a){
 function render(node,parent=0){
  const [left,right]=node.args;let latex,precedence=40;
  if(node.op==='q'){const[n,d]=left;latex=d===1n?String(n):`\\frac{${n}}{${d}}`;if(d===1n&&n<0n)precedence=20;}
  else if(node.op==='symbol')latex=left==='pi'?'\\pi':left;
  else if(node.op==='/')latex=`\\frac{${render(left)}}{${render(right)}}`;
  else if(node.op==='^'){precedence=30;latex=`${render(left,31)}^{${render(right)}}`;}
  else if(node.op==='+'||node.op==='-'){precedence=10;latex=`${render(left,10)}${node.op}${render(right,node.op==='-'?11:10)}`;}
  else if(node.op==='*'){precedence=20;latex=`${render(left,20)}\\cdot ${render(right,20)}`;}
  else if(node.op==='sqrt')latex=`\\sqrt{${render(left)}}`;
  else if(node.op==='abs')latex=`\\left|${render(left)}\\right|`;
  else latex=`\\${node.op}\\left(${render(left)}\\right)`;
  return precedence<parent?`\\left(${latex}\\right)`:latex;
 }
 return render(a);
}
