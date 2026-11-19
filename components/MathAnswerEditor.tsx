'use client';
import {InlineMathText} from './InlineMathText';
import {useEffect,useRef,useState,useId} from 'react';
import type {MathfieldElement} from 'mathlive';
import {MathDisplay} from './MathDisplay';
import {entrySafety,ENTRY_LIMITS,draftKey,readDraft,writeDraft,clearDraft,browserDraftStorage} from '@/lib/math-entry.mjs';

export interface MathDraftScope {uid:string;roundId:string;problemId:string;problemRevision:number;contentHash:string;contractHash:string}
interface Props {scope:MathDraftScope;instructions:string;finalized:boolean;disabled?:boolean;onChange:(source:string)=>void}
const palettes:Record<string,[string,string][]>={
 'Basics':[['Fraction',String.raw`\frac{#0}{#?}`],['Power','{#0}^{#?}'],['Square root',String.raw`\sqrt{#0}`],['Nth root',String.raw`\sqrt[#?]{#0}`],['Parentheses',String.raw`\left(#0\right)`],['Absolute value',String.raw`\left|#0\right|`],['Plus or minus',String.raw`\pm`]],
 'Functions':[['Natural log',String.raw`\ln\left(#0\right)`],['Logarithm with base',String.raw`\log_{#?}\left(#0\right)`],['Exponential',String.raw`e^{#0}`],['Sine',String.raw`\sin\left(#0\right)`],['Cosine',String.raw`\cos\left(#0\right)`],['Tangent',String.raw`\tan\left(#0\right)`],['Inverse sine',String.raw`\arcsin\left(#0\right)`],['Inverse cosine',String.raw`\arccos\left(#0\right)`],['Inverse tangent',String.raw`\arctan\left(#0\right)`],['Hyperbolic sine',String.raw`\sinh\left(#0\right)`],['Hyperbolic cosine',String.raw`\cosh\left(#0\right)`],['Hyperbolic tangent',String.raw`\tanh\left(#0\right)`]],
 'Calculus':[['Integral',String.raw`\int_{#?}^{#?} #0\,\mathrm{d}x`],['Derivative',String.raw`\frac{\mathrm{d}}{\mathrm{d}x}\left(#0\right)`],['Partial derivative',String.raw`\frac{\partial #0}{\partial x}`],['Limit',String.raw`\lim_{x\to #?} #0`],['Sum',String.raw`\sum_{n=#?}^{#?} #0`],['Product',String.raw`\prod_{n=#?}^{#?} #0`]],
 'Structures':[['Open interval',String.raw`\left(#0,#?\right)`],['Closed interval',String.raw`\left[#0,#?\right]`],['Set',String.raw`\left\{#0\right\}`],['Ordered tuple',String.raw`\left(#0,#?\right)`],['Vector',String.raw`\begin{pmatrix}#0\\#?\end{pmatrix}`],['Matrix',String.raw`\begin{pmatrix}#0&#?\\#?&#?\end{pmatrix}`],['Piecewise',String.raw`\begin{cases}#0&#?\\#?&#?\end{cases}`]],
 'Symbols':[['Pi',String.raw`\pi`],['Euler number','e'],['Infinity',String.raw`\infty`],['Constant','C'],['Alpha',String.raw`\alpha`],['Beta',String.raw`\beta`],['Gamma',String.raw`\gamma`],['Delta',String.raw`\delta`],['Theta',String.raw`\theta`],['Lambda',String.raw`\lambda`],['Mu',String.raw`\mu`],['Sigma',String.raw`\sigma`],['Phi',String.raw`\phi`],['Omega',String.raw`\omega`]],
};
const button='min-h-11 rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:border-emerald-500 focus-visible:outline-2 focus-visible:outline-emerald-400 disabled:opacity-40';
export default function MathAnswerEditor({scope,instructions,finalized,disabled=false,onChange}:Props){
 const id=useId(),scopeId=draftKey(scope),host=useRef<HTMLDivElement>(null),field=useRef<MathfieldElement|null>(null),textarea=useRef<HTMLTextAreaElement>(null),composing=useRef(false);
 const [source,setSource]=useState(''),[mode,setMode]=useState<'visual'|'raw'>('visual'),[palette,setPalette]=useState('Basics'),[ready,setReady]=useState(false),[notice,setNotice]=useState(''),[backup,setBackup]=useState(''),[keyboardHeight,setKeyboardHeight]=useState(0),[storageFailed,setStorageFailed]=useState(false),[loadedScope,setLoadedScope]=useState('');
 const rawSelection=useRef({start:0,end:0}),visualSelection=useRef<MathfieldElement['selection']|null>(null),sourceRef=useRef(''),onChangeRef=useRef(onChange),activeScope=useRef(scopeId),lastSafeVisual=useRef('');
 onChangeRef.current=onChange;
 const locked=disabled||finalized;
 const lockedRef=useRef(locked);lockedRef.current=locked;
 const update=(value:string)=>{if(value.length>ENTRY_LIMITS.draft){setNotice('This paste exceeds the draft limit. Paste a shorter expression.');return;}sourceRef.current=value;setSource(value);onChangeRef.current(value);};
 useEffect(()=>{activeScope.current=scopeId;setReady(false);setNotice('');setStorageFailed(false);const d=finalized?null:readDraft(browserDraftStorage(),scope);const value=d?.source||'';sourceRef.current=value;setSource(value);setBackup(d?.backup||'');setMode(d?.mode||'visual');rawSelection.current=d?.rawSelection||{start:0,end:0};visualSelection.current=d?.visualSelection||null;onChangeRef.current(value);setLoadedScope(scopeId);if(finalized)clearDraft(browserDraftStorage(),scope);
  let alive=true,dispose=()=>{};
  void import('mathlive').then(({MathfieldElement})=>{
   if(!alive||!host.current)return;MathfieldElement.computeEngine=null;MathfieldElement.fontsDirectory='/mathlive/fonts';MathfieldElement.soundsDirectory=null;
   const mf=new MathfieldElement();
   mf.smartMode=false;mf.removeExtraneousParentheses=false;mf.mathVirtualKeyboardPolicy='auto';mf.maxMatrixCols=8;mf.scriptDepth=[8,8];
   mf.setAttribute('aria-label','Mathematical answer');mf.setAttribute('aria-describedby',`${id}-instructions ${id}-status`);mf.className='math-answer-field';mf.style.width='100%';mf.style.fontSize='1.35rem';mf.style.minHeight='76px';mf.style.background='transparent';mf.style.color='inherit';mf.style.border='none';mf.readOnly=lockedRef.current;
   field.current=mf;host.current.replaceChildren(mf);mf.menuItems=[];
   const safe=entrySafety(value);if(safe){setMode('raw');setNotice(safe);}else if(value){mf.setValue(value,{silenceNotifications:true});if(mf.errors.length){setMode('raw');setNotice('Some notation cannot be edited visually. The complete LaTeX source is retained.');}else if(visualSelection.current){try{mf.selection=visualSelection.current;}catch{}}}
   lastSafeVisual.current=mf.value;
   const input=()=>{if(composing.current)return;const next=mf.getValue('latex'),problem=entrySafety(next);if(problem){mf.setValue(lastSafeVisual.current,{silenceNotifications:true});setNotice(problem);return;}lastSafeVisual.current=next;update(next);setNotice('');};
   const before=(event:Event)=>{const e=event as InputEvent;if(e.inputType==='insertLineBreak')e.preventDefault();};
   const paste=(event:Event)=>{const e=event as ClipboardEvent,text=e.clipboardData?.getData('text/plain')||'',problem=entrySafety(text);if(problem){e.preventDefault();setNotice(problem+' Switch to LaTeX to keep unsupported source.');}};
   const start=()=>{composing.current=true;},end=()=>{composing.current=false;input();};
   const selection=()=>{visualSelection.current=mf.selection;};
   const keyboard=(globalThis as any).mathVirtualKeyboard;
   const geometry=()=>setKeyboardHeight(Math.max(0,keyboard?.boundingRect?.height||0));
   mf.addEventListener('input',input);mf.addEventListener('beforeinput',before);mf.addEventListener('paste',paste);mf.addEventListener('compositionstart',start);mf.addEventListener('compositionend',end);mf.addEventListener('selection-change',selection);keyboard?.addEventListener('geometrychange',geometry);setReady(true);
   dispose=()=>{mf.removeEventListener('input',input);mf.removeEventListener('beforeinput',before);mf.removeEventListener('paste',paste);mf.removeEventListener('compositionstart',start);mf.removeEventListener('compositionend',end);mf.removeEventListener('selection-change',selection);keyboard?.removeEventListener('geometrychange',geometry);mf.remove();if(field.current===mf)field.current=null;};
  }).catch((error:unknown)=>{if(process.env.NODE_ENV==='development')console.error('Math editor initialization failed',error);if(alive){setMode('raw');setNotice('The visual editor could not load. You can keep editing LaTeX.');}});
  return()=>{alive=false;dispose();};
 // Scope identity is immutable for this mounted question; mode/source changes
 // must not recreate the editor or reset its native undo history.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[scopeId]);
 useEffect(()=>{if(field.current)field.current.readOnly=locked;if(finalized)clearDraft(browserDraftStorage(),scope);},[locked,finalized,scopeId]);
 useEffect(()=>{if(finalized||loadedScope!==scopeId)return;setStorageFailed(!writeDraft(browserDraftStorage(),scope,{source,mode,backup,rawSelection:rawSelection.current,visualSelection:visualSelection.current}));},[source,mode,backup,scopeId,finalized,loadedScope]);
 const switchMode=(next:'raw'|'visual')=>{if(composing.current||locked)return;if(next==='raw'){if(field.current)visualSelection.current=field.current.selection;setMode('raw');requestAnimationFrame(()=>{textarea.current?.focus();textarea.current?.setSelectionRange(rawSelection.current.start,rawSelection.current.end);});return;}
  const mf=field.current,problem=entrySafety(source);if(problem){setNotice(problem);return;}if(!mf){setNotice('Visual editor is still loading.');return;}
  // Preserve exact original input even when MathLive serializes it differently.
  if(mf.getValue('latex')!==source){mf.setValue(source,{silenceNotifications:true});if(mf.errors.length){setNotice('This notation remains editable as LaTeX. No source was discarded.');return;}lastSafeVisual.current=mf.value;setBackup(source);}
  setMode('visual');setNotice(mf.getValue('latex')===source?'':'Your exact source is retained. Visual edits may normalize its spelling; Restore source keeps the original available.');requestAnimationFrame(()=>{mf.focus();if(visualSelection.current){try{mf.selection=visualSelection.current;}catch{}}});
 };
 const insert=(template:string)=>{if(locked||composing.current)return;if(mode==='visual'&&field.current){field.current.insert(template,{format:'latex',selectionMode:'placeholder',focus:true});return;}const raw=template.replaceAll('#0','').replaceAll('#?',''),start=textarea.current?.selectionStart??source.length,end=textarea.current?.selectionEnd??start;update(source.slice(0,start)+raw+source.slice(end));requestAnimationFrame(()=>{textarea.current?.focus();textarea.current?.setSelectionRange(start+raw.length,start+raw.length);});};
 const safety=entrySafety(source);
 return <section className="min-w-0 rounded-2xl border border-zinc-700 bg-zinc-950/80 p-4" aria-label="Answer editor" style={{scrollMarginBottom:keyboardHeight+24,paddingBottom:keyboardHeight?keyboardHeight+16:undefined}} onKeyDown={e=>{if(e.key==='Enter'&&['MATH-FIELD','TEXTAREA'].includes((e.target as HTMLElement).tagName))e.stopPropagation();}}>
  <p id={`${id}-instructions`} className="mb-4 text-sm text-zinc-300"><InlineMathText text={instructions}/></p>
  <div className="mb-3 flex flex-wrap items-center gap-2"><button type="button" className={button} aria-pressed={mode==='visual'} disabled={locked} onClick={()=>switchMode('visual')}>Visual</button><button type="button" className={button} aria-pressed={mode==='raw'} disabled={locked} onClick={()=>switchMode('raw')}>LaTeX</button><button type="button" className={button} disabled={locked||mode!=='visual'||!ready} onClick={()=>field.current?.executeCommand('undo')}>Undo</button><button type="button" className={button} disabled={locked||mode!=='visual'||!ready} onClick={()=>field.current?.executeCommand('redo')}>Redo</button><button type="button" className={button} disabled={locked||mode!=='visual'||!ready} onClick={()=>{field.current?.focus();const keyboard=(globalThis as any).mathVirtualKeyboard;keyboard?.visible?keyboard.hide():keyboard?.show();}}>Keyboard</button></div>
  <div hidden={mode!=='visual'} className="min-w-0 overflow-x-auto rounded-xl border border-zinc-700 p-3" ref={host}/>
  {mode==='visual'&&!ready&&<p role="status">Loading the math editor…</p>}
  {mode==='raw'&&<><label htmlFor={`${id}-source`} className="sr-only">Answer in LaTeX</label><textarea id={`${id}-source`} ref={textarea} className="min-h-28 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 p-3 font-mono text-sm focus:border-emerald-500" value={source} disabled={locked} spellCheck={false} autoCapitalize="off" autoCorrect="off" aria-describedby={`${id}-instructions ${id}-status`} onCompositionStart={()=>{composing.current=true;}} onCompositionEnd={()=>{composing.current=false;}} onChange={e=>update(e.target.value)} onSelect={e=>{rawSelection.current={start:e.currentTarget.selectionStart,end:e.currentTarget.selectionEnd};}}/><div className="mt-3 min-w-0 overflow-x-auto" aria-label="Live answer preview">{source&&!safety&&<MathDisplay math={source} block/>}</div></>}
  <div className="mt-4"><label className="text-xs text-zinc-400" htmlFor={`${id}-palette`}>Insert notation</label><select id={`${id}-palette`} className="ml-3 min-h-11 rounded-lg border border-zinc-700 bg-zinc-900 px-3" value={palette} onChange={e=>setPalette(e.target.value)}>{Object.keys(palettes).map(p=><option key={p}>{p}</option>)}</select><div className="mt-2 flex flex-wrap gap-2">{palettes[palette].map(([label,template])=><button type="button" key={label} className={button} disabled={locked} onPointerDown={e=>e.preventDefault()} onClick={()=>insert(template)}>{label}</button>)}</div></div>
  <p className="mt-3 text-xs text-zinc-400">Palettes support broad notation. Each question states which final answers can be checked. Enter edits the expression; use Submit answer when ready.</p>
  <p id={`${id}-status`} role="status" className="mt-2 text-sm text-amber-200">{safety||notice|| (storageFailed?'Local draft storage is unavailable. Keep this page open until your answer is saved.':'Draft saved on this device for this account and question.')}</p>
  {backup&&backup!==source&&!locked&&<button type="button" className={`${button} mt-2`} onClick={()=>{update(backup);setMode('raw');setNotice('Restored the source from before visual editing.');}}>Restore source from before visual editing</button>}
 </section>;
}
