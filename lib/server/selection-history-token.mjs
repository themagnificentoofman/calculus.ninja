import {boundedJsonSnapshot} from './bounded-json-snapshot.mjs';
import {assertFreeResponseHistory} from './free-response-selection.mjs';
import {canonical,hex} from '../bank/compact-codec.mjs';
/** Optimistic guard for the exact retained history used by FR/joint selection.
 * Compared again inside the transaction that records issuance. It does not
 * provide a transaction spanning D1 eligibility and Firestore persistence. */
export function selectionHistorySnapshot(recent={}){
 const snapshot=boundedJsonSnapshot(recent,{maxBytes:3000000,maxNodes:12000,maxDepth:8});
 assertFreeResponseHistory(snapshot);
 return snapshot;
}
export async function selectionHistoryToken(recent={}){
 const snapshot=selectionHistorySnapshot(recent);
 return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical(snapshot))));
}
