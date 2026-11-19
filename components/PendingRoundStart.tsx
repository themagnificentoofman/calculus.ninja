'use client';
import {useEffect,useRef,useState} from 'react';
import {pendingRoundStart} from '@/lib/round-start-browser';

type Pending={request:{category:string;difficulty:string;count:number;inviteTo?:string};issued:boolean;roundId?:string};
const controllerMessage=(error:unknown)=>error instanceof Error?error.message:'The pending round could not be recovered. Please retry.';

export function usePendingRoundStart(uid:string|undefined,mode:'test'|'rapid'|'pvp'|'multiplayer',loadRound:(id:string,request?:Pending['request'])=>Promise<boolean>,visibleRoundId?:string|null){
 const [pending,setPending]=useState<Pending|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 const mounted=useRef(false),account=useRef(uid),operation=useRef(0),busy=useRef(false),readNumber=useRef(0);account.current=uid;
 async function refresh(){
  if(!uid)return;const number=++readNumber.current;
  try{const value=await pendingRoundStart.pending(uid,mode);if(mounted.current&&account.current===uid&&number===readNumber.current)setPending(value);}
  catch(e){if(mounted.current&&account.current===uid&&number===readNumber.current)setError(controllerMessage(e));}
 }
 useEffect(()=>{
  mounted.current=true;operation.current++;busy.current=false;setLoading(false);setPending(null);setError('');
  if(!uid)return()=>{mounted.current=false;};void refresh();
  const onStorage=(event:StorageEvent)=>{if(event.key===null||event.key===`round-start-1:${uid}:${mode}`)void refresh();};
  const onFocus=()=>{void refresh();};
  window.addEventListener('storage',onStorage);window.addEventListener('focus',onFocus);
  return()=>{mounted.current=false;readNumber.current++;window.removeEventListener('storage',onStorage);window.removeEventListener('focus',onFocus);};
 },[uid,mode]);
 // Clear only after React has committed the loaded round screen. A successful
 // fetch or state update alone must not discard recovery during navigation.
 useEffect(()=>{
  if(!uid||loading||!visibleRoundId||!pending?.issued||pending.roundId!==visibleRoundId)return;
  let stopped=false;
  void pendingRoundStart.acknowledge(uid,mode,visibleRoundId).then(()=>{if(!stopped)void refresh();}).catch(e=>{if(!stopped)setError(controllerMessage(e));});
  return()=>{stopped=true;};
 },[uid,mode,visibleRoundId,loading,pending?.issued,pending?.roundId]);
 async function run(action:()=>Promise<string>){
  if(!uid||busy.current)return;busy.current=true;const number=++operation.current;setLoading(true);setError('');
  try{
   let id:string;
   try{id=await action();}catch(e){if(mounted.current&&account.current===uid)setError(controllerMessage(e));return;}
   if(!mounted.current||account.current!==uid)return;
   try{
    const saved=mode==='pvp'||mode==='multiplayer'?await pendingRoundStart.pending(uid,mode):null;
    if(!mounted.current||account.current!==uid)return;
    if(!await loadRound(id,saved?.issued&&saved.roundId===id?saved.request:undefined))return;
   }catch{if(mounted.current&&account.current===uid)setError('Your round started, but could not be loaded. Resume the saved round to try again.');return;}
  }finally{
   if(mounted.current&&account.current===uid&&number===operation.current){await refresh();busy.current=false;setLoading(false);}
  }
 }
 async function cancel(){
  if(!uid||busy.current)return;busy.current=true;const number=++operation.current;setLoading(true);setError('');
  try{const result=await pendingRoundStart.cancel(uid,mode);if(mounted.current&&account.current===uid&&result.status==='issued')setError('This round has already started. Resume it to continue.');}
  catch(e){if(mounted.current&&account.current===uid)setError(controllerMessage(e));}
  finally{if(mounted.current&&account.current===uid&&number===operation.current){await refresh();busy.current=false;setLoading(false);}}
 }
 return {pending,error,loading,start:(request:unknown)=>run(()=>pendingRoundStart.start(uid!,request)),resume:()=>run(()=>pendingRoundStart.resume(uid!,mode)),cancel};
}

export function PendingRoundStart({state}:{state:ReturnType<typeof usePendingRoundStart>}){
 const pending=state.pending;if(!pending)return null;
 return <section aria-label="Pending round" className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5">
  <h2 className="font-semibold text-amber-200">{pending.issued?'Resume your round':'A round is waiting to start'}</h2>
  <p className="mt-2 text-sm text-zinc-300">{pending.issued?'This round has already started. Resume it to recover your saved progress.':'Resume the saved start, or cancel it before choosing different settings.'}</p>
  <p className="mt-2 text-sm capitalize text-zinc-400">{pending.request.category==='all'?'Mixed topics':pending.request.category} · {pending.request.difficulty} · {pending.request.count} questions</p>
  <div className="mt-4 flex flex-wrap gap-3"><button disabled={state.loading} onClick={state.resume} className="min-h-11 rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-black disabled:opacity-40">Resume round</button>
  {!pending.issued&&<button disabled={state.loading} onClick={state.cancel} className="min-h-11 rounded-xl border border-zinc-600 px-4 py-2 text-sm disabled:opacity-40">Cancel pending start</button>}</div>
 </section>;
}
