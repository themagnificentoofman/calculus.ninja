// Private, archived revisions can fill a missing physical prefix only as retired rows.
// Hash every prior snapshot and its approval binding before using a single archived row.
import {createHash} from 'node:crypto';
import {readFileSync,statSync} from 'node:fs';
import {basename,join} from 'node:path';
import {gunzipSync} from 'node:zlib';
import {canonical} from '../../lib/bank/compact-codec.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const key = (id, revision) => id + '@' + revision;
const hashPattern = /^[a-f0-9]{64}$/;
const requireValue = (ok, reason) => { if (!ok) throw Error(reason); };

function checkedFile(directory, file, hash, maxBytes) {
  requireValue(typeof file === 'string' && basename(file) === file && hashPattern.test(hash), 'Invalid predecessor artifact reference');
  const path = join(directory, file);
  requireValue(statSync(path).size <= maxBytes, 'Oversized predecessor artifact');
  const bytes = readFileSync(path);
  requireValue(sha(bytes) === hash, 'Changed predecessor artifact');
  return bytes;
}

export function archivedPredecessors(directory, descriptor, successors, approvedHash) {
  const result = new Map();
  if (descriptor === undefined) return result;
  requireValue(descriptor?.version === 1 && Number.isSafeInteger(descriptor.count) && descriptor.count > 0 && descriptor.count <= 6000, 'Invalid inactive predecessor descriptor');
  const proof = JSON.parse(checkedFile(directory, descriptor.file, descriptor.sha256, 16 * 1024 * 1024));
  requireValue(proof.version === 1 && Array.isArray(proof.predecessors) && proof.predecessors.length === descriptor.count, 'Invalid predecessor proof size');
  requireValue(Array.isArray(proof.sources) && proof.sources.length > 0 && proof.sources.length <= 32, 'Invalid predecessor source set');
  const review = JSON.parse(checkedFile(directory, proof.reviewFile, proof.reviewHash, 16 * 1024 * 1024));
  requireValue(review.approved === approvedHash && review.predecessorReceiptSHA256 === proof.historyHash, 'Predecessor proof does not match the reviewed destination');
  const history = JSON.parse(checkedFile(directory, proof.historyFile, proof.historyHash, 16 * 1024 * 1024));
  const sorted = values => values.map(v=>canonical(v)).sort();
  requireValue(canonical(sorted(proof.sources.map(s=>[s.snapshotHash,s.bindingHash]))) === canonical(sorted(history.priorSnapshots.map(s=>[s.sha256,s.bindingSHA256]))), 'Incomplete predecessor snapshot inventory');
  const current = new Map(successors.map(p => [p.problemId,p]));
  const declared = new Map();
  requireValue(history.destinations.length === current.size && current.size === successors.length, 'Ambiguous reviewed successor');
  const checked = new Set();
  for (const d of history.destinations) {
    const p=current.get(d.problemId);
    requireValue(p && !checked.has(d.problemId) && d.destinationRevision===p.problemRevision && d.destinationContentHash===p.contentHash, 'Historical decision differs from the successor');
    checked.add(d.problemId);
    for (const prev of d.predecessors.filter(prev=>prev.revision<p.problemRevision)) {
      const id=key(d.problemId,prev.revision);
      requireValue(!declared.has(id), 'Ambiguous archived predecessor revision');
      declared.set(id,{contentHash:prev.contentHash,observations:prev.sourceRows.map(r=>({source:r.sourceSHA256,row:r.rowSHA256}))});
    }
  }
  requireValue(declared.size===descriptor.count,'Omitted predecessor from the reviewed history');
  const wanted = new Map();
  for (const item of proof.predecessors) {
    const p = current.get(item.problemId), id = key(item.problemId, item.revision);
    requireValue(p && p.problemRevision === item.destinationRevision && p.contentHash === item.destinationHash &&
      Number.isSafeInteger(item.revision) && item.revision > 0 && item.revision < p.problemRevision &&
      hashPattern.test(item.contentHash) && !wanted.has(id), 'Unbound or duplicate predecessor destination');
    requireValue(Array.isArray(item.observations) && item.observations.length > 0 && item.observations.length <= proof.sources.length &&
      item.observations.every(o => hashPattern.test(o.source) && hashPattern.test(o.row)), 'Invalid predecessor observations');
    const certified=declared.get(id);
    requireValue(certified && certified.contentHash===item.contentHash && canonical(sorted(certified.observations))===canonical(sorted(item.observations)), 'Predecessor differs from the archived approval');
    wanted.set(id, {...item, found:[]});
  }
  const sourceIDs = new Set();
  for (const source of proof.sources) {
    requireValue(hashPattern.test(source.snapshotHash) && !sourceIDs.has(source.snapshotHash), 'Duplicate predecessor snapshot');
    sourceIDs.add(source.snapshotHash);
    const binding = JSON.parse(checkedFile(directory, source.bindingFile, source.bindingHash, 16 * 1024 * 1024));
    requireValue(binding.approved === source.snapshotHash, 'Predecessor approval binding differs from snapshot');
    const bytes = gunzipSync(checkedFile(directory, source.file, source.gzipHash, 16 * 1024 * 1024), {maxOutputLength:64 * 1024 * 1024});
    requireValue(sha(bytes) === source.snapshotHash && bytes.at(-1) === 10, 'Changed predecessor snapshot bytes');
    const seen = new Set();
    for (const line of new TextDecoder('utf-8',{fatal:true}).decode(bytes).slice(0,-1).split('\n')) {
      const row = JSON.parse(line), id = key(row.problemId,row.problemRevision), request = wanted.get(id);
      if (!request) continue;
      requireValue(!seen.has(id), 'Duplicate predecessor identity in historical snapshot'); seen.add(id);
      const {contentHash,...body} = row;
      requireValue(row.schemaVersion === 2 && contentHash === request.contentHash && sha(canonical(body)) === contentHash, 'Conflicting inactive predecessor bytes');
      const observation = {source: source.snapshotHash, row: sha(line+'\n')};
      requireValue(request.observations.some(o=>o.source===observation.source && o.row===observation.row), 'Unexpected earlier predecessor observation');
      request.found.push(observation);
      result.set(id,row);
    }
  }
  const ordered = observations => observations.map(o=>o.source+'@'+o.row).sort();
  for (const [id,r] of wanted) requireValue(result.has(id) && canonical(ordered(r.found)) === canonical(ordered(r.observations)), 'Missing exact archived predecessor');
  return result;
}

// These bytes can belong to a withdrawn or superseded private proposal. No positive
// publication, pool or slot is created. The standard compact sync enforces its full
// identity, consecutive revisions, duplicate semantics, payload and size checks.
export function insertInactivePredecessor(db, row, retirementReason='Archived private predecessor; ineligible for new practice.') {
  db.prepare('INSERT INTO bank_problems VALUES (?,?,?,?,?,?,?,?)').run(row.problemId,row.problemRevision,row.contentHash,row.semanticHash,row.topic,row.difficulty,row.familyId,canonical(row));
  db.prepare("INSERT INTO bank_publication VALUES (?,?,'retired',?)").run(row.problemId,row.problemRevision,retirementReason);
}
