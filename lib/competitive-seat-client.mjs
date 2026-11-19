import {isSavedRoundId} from './round-url.mjs';

// A waiting visit is distinct from the room and from visits in other tabs.
const roomCode = /^c2[0-9a-f]{28}$/;
const manualKey = /^[A-Za-z0-9_-]{12,96}$/;
const inviteKey = /^inv:[a-f0-9]{64}$/;
const validKey = value => typeof value === 'string' && (manualKey.test(value) || inviteKey.test(value));
const check = (value, message) => { if (!value) throw new Error(message); };
const newerVisit = 'This lobby visit has changed. Reopen the room to see your current visit.';
const endedVisit = 'This lobby visit ended. Choose Join to enter again.';
const storageError = 'This browser could not save your lobby visit. Enable session storage and retry.';
export function createSeatClient({command, currentUid, storage, randomKey}) {
  const observed = new Map(), tasks = new Map();
  const slot = (uid, id) => 'competitive-visit:v2:'+uid+':'+id;
  function identity(uid) {
    check(typeof uid === 'string' && uid && currentUid() === uid, 'Your signed-in account changed. Refresh before continuing.');
  }
  function read(uid, id) {
    const raw=storage().getItem(slot(uid,id));
    if(raw===null)return null;
    let record;try{record=JSON.parse(raw);}catch{throw Error(storageError);}
    check(record?.uid===uid && record.id===id && validKey(record.key) && ['pending','arriving','open','leaving','closed'].includes(record.phase),storageError);
    return record;
  }
  function save(uid, id, key, phase) {
    identity(uid);check(validKey(key),newerVisit);
    const store=storage(), s=slot(uid,id), data=JSON.stringify({uid,id,key,phase});
    store.setItem(s,data);check(store.getItem(s)===data,storageError);
  }
  function serialize(uid,id,fn) {
    const s=slot(uid,id);
    const next=(tasks.get(s)??Promise.resolve()).then(()=>{identity(uid);return fn();});
    tasks.set(s,next);
    const clear=()=>{if(tasks.get(s)===next)tasks.delete(s);};
    next.then(clear,clear);
    return next;
  }
  function accept(uid,id,result,mode,expected,phase='open') {
    identity(uid);
    const game=result.game;
    check(game&&Array.isArray(game.players)&&game.players.includes(uid)&&(!mode||game.mode===mode),'This game belongs to a different player or mode.');
    if(!roomCode.test(id))return result;
    check(['pvp','multiplayer'].includes(game.mode),'This game belongs to a different mode.');
    const s=slot(uid,id);
    if(game.status==='waiting'||game.status==='private_waiting'){
      const key=result.lobbyVisitId;
      check(validKey(key)&&(!expected||key===expected),newerVisit);
      // A confirmed own-view receipt is also usable after reload or an invitation.
      save(uid,id,key,phase);
      if (phase === 'arriving') observed.delete(s);
      else observed.set(s,key);
    }else{
      check(['active','cancelled','finished'].includes(game.status),'This game has an unknown state.');
      observed.delete(s);
    }
    return result;
  }
  async function membership(uid,id,mode) {
    let own, denied;
    try { own=await command('view',id,{},uid); }
    catch(error){if(error?.status!==403)throw error;denied=error;}
    const old=read(uid,id);
    if (old?.phase === 'arriving') {
      // The source page confirmed a particular visit. A different waiting
      // receipt belongs to another action, even on the same account and room.
      const waiting = own && ['waiting','private_waiting'].includes(own.game?.status);
      if (!own || (waiting && own.lobbyVisitId !== old.key)) {
        save(uid,id,old.key,'closed');
        observed.delete(slot(uid,id));
        if (own) throw Error(newerVisit);
        return {denied};
      }
    }
    if(old?.phase==='leaving'){
      const waiting=own&&['waiting','private_waiting'].includes(own.game?.status);
      // If a newer visit exists, the old leave cannot target it. An active
      // game keeps its original start even if a prior waiting leave arrived late.
      if(!own||(waiting&&own.lobbyVisitId===old.key)){
        const left=await command('leave',id,{seatOperationId:old.key},uid);
        identity(uid);check(left.left===true,'The lobby departure could not be confirmed. Retry this visit.');
        own=null;denied=Error(endedVisit);
      }
      save(uid,id,old.key,'closed');observed.delete(slot(uid,id));
    }
    if(own)return {result:accept(uid,id,own,mode)};
    return {denied};
  }
  function view(uid,id) {
    return serialize(uid,id,async()=>{
      if(!roomCode.test(id))return accept(uid,id,await command('view',id,{},uid));
      const {result,denied}=await membership(uid,id);
      if(!result)throw denied;
      return result;
    });
  }
  function join(uid,id,mode,source='manual') {
    return serialize(uid,id,async()=>{
      if(!roomCode.test(id))return accept(uid,id,await command('join',id,{mode},uid),mode);
      const {result}=await membership(uid,id,mode);
      if(result){check(result.game.status!=='cancelled',endedVisit);return result;}
      identity(uid);
      const previous=read(uid,id);
      if(previous?.phase==='closed'&&source==='link')throw Error(endedVisit);
      async function send(key) {
        const result=await command('join',id,{mode,seatOperationId:key},uid);
        return accept(uid,id,result,mode,key);
      }
      if(previous&&previous.phase!=='closed'){
        try{return await send(previous.key);}
        catch(error){
          if(error?.code!=='LOBBY_VISIT_ENDED')throw error;
          save(uid,id,previous.key,'closed');observed.delete(slot(uid,id));
          if(source==='link')throw Error(endedVisit);
        }
      }
      const key=randomKey();check(typeof key==='string'&&manualKey.test(key),storageError);
      save(uid,id,key,'pending');return send(key);
    });
  }
  function toRoom(uid,id,mode,result) {
    check(['pvp','multiplayer'].includes(mode) && isSavedRoundId(id),
      'This room could not be opened.');
    accept(uid,id,result,mode,undefined,'arriving');
    return '/play/'+mode+'?round='+encodeURIComponent(id);
  }
  function departure(uid,id) {
    if(!uid||!id||currentUid()!==uid)return null;
    if(!roomCode.test(id))return {action:'leave',gameId:id};
    const key=observed.get(slot(uid,id));
    return key ? {action:'leave',gameId:id,seatOperationId:key} : null;
  }
  async function heartbeat(uid,id,key) {
    identity(uid);
    if (roomCode.test(id) && (!validKey(key) || observed.get(slot(uid,id)) !== key)) {
      throw Object.assign(Error(newerVisit), {code:'LOBBY_VISIT_CHANGED'});
    }
    return command('heartbeat',id,key ? {seatOperationId:key} : {},uid);
  }
  function leave(uid,id) {
    // Capture the observed visit at the caller's action, before queued work.
    const body=departure(uid,id);
    return serialize(uid,id,async()=>{
      check(body,newerVisit);
      const key=body.seatOperationId;
      if(key)save(uid,id,key,'leaving');
      const result=await command('leave',id,key?{seatOperationId:key}:{},uid);
      identity(uid);check(result.left===true,'The lobby departure could not be confirmed. Retry this visit.');
      if(key&&observed.get(slot(uid,id))===key){save(uid,id,key,'closed');observed.delete(slot(uid,id));}
      return result;
    });
  }
  function pagehide(uid,body) {
    if(!uid||!body||currentUid()!==uid)return false;
    if(!roomCode.test(body.gameId))return true;
    const {gameId:id,seatOperationId:key}=body;
    if(!key||observed.get(slot(uid,id))!==key)return false;
    try{save(uid,id,key,'leaving');return true;}catch{return false;}
  }
  return {view,join,leave,departure,pagehide,heartbeat,toRoom};
}
