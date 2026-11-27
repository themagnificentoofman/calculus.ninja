import type {ClientEvent,ClientEventType} from './contracts.ts';
type Observer=(type:ClientEventType,data?:Partial<ClientEvent>)=>void;
const observers = new Map<string, {uid: string; emit: Observer}>();

export function registerCapture(round: string, uid: string, emit: Observer) {
  const capture = {uid, emit};
  observers.set(round, capture);
  return () => { if (observers.get(round) === capture) observers.delete(round); };
}

export function observeReplay(round: string, type: ClientEventType, data: Partial<ClientEvent>, expectedUid: string | undefined) {
  const capture = observers.get(round);
  if (capture && capture.uid === expectedUid) capture.emit(type, data);
}
