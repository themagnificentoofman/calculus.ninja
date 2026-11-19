// Offline admission only. A free-response exposure identity can have no MC row.
import {createHash} from 'node:crypto';
import {canonical} from '../../../lib/bank/compact-codec.mjs';
import {boundedFreeResponseSelectionContent} from '../../../lib/bank/free-response-metadata.mjs';
import {assertNoHeldAssessmentRevisions} from '../../../lib/bank/free-response-assessment-holds.mjs';

// Bind the archive once at import start. The byte digest includes every current
// admission and checker, even when the active catalog contains no source row.
export function menuArchiveForRegistry(archive, registryBytes) {
  const digest = createHash('sha256').update(registryBytes).digest('hex');
  return archive?.activeRegistrySHA256 === digest ? archive : null;
}

// A source-only record is reviewed and graded under its own bounded, non-serving
// checkpoint. Bind the offline admission and the independent guarded storage
// receipt to this exact menu, its source record and the active registry.
function retainedChoiceOrigin(archived, link, registryHash) {
  if (archived?.reason === 'omitted-by-per-cell-FR-roster') return !Object.hasOwn(archived, 'sourceOnly');
  if (archived?.reason !== 'admitted-for-choice-origin-only') return false;
  const receipt = archived.sourceOnly;
  const fields = ['registrySHA256', 'storageReceiptSHA256', 'eligibilitySHA256'];
  if (!receipt || !fields.every(k => /^[0-9a-f]{64}$/.test(receipt[k] ?? ''))) return false;
  const proof = {activeRegistry: registryHash, admission: link.admission,
    menu: link.menuHash, record: link.recordHash, sourceTask: archived.sourceTaskHash,
    registry: receipt.registrySHA256, storage: receipt.storageReceiptSHA256,
    eligibility: receipt.eligibilitySHA256};
  const digest = createHash('sha256').update(canonical(proof)).digest('hex');
  return archived.dispositionHash === digest;
}

export function validateMenuLineage(problem, lineage, link, registry, archive = null) {
  const invalid = () => { throw Error('Unbound free-response origin for multiple-choice lineage'); };
  const active = registry?.records?.[link?.admission];
  const archived = archive?.records?.[link?.admission];
  if (active && archived) invalid();
  const entry = active || archived?.entry;
  if (!active && (!retainedChoiceOrigin(archived, link, archive?.activeRegistrySHA256) ||
      !/^[0-9a-f]{64}$/.test(archived?.dispositionHash ?? '') ||
      archived?.sourceTaskHash !== problem.validation?.evidence?.sourceTaskHash)) invalid();
  if (!entry || !lineage || link.menuHash !== problem.contentHash ||
      link.reviewHash !== entry.reviewHash || link.recordHash !== entry.recordHash) invalid();
  const row = boundedFreeResponseSelectionContent(link.selection);
  const digest = createHash('sha256').update(canonical(row)).digest('hex');
  const source = row.problem_id + '@' + row.revision;
  const checker = registry.checkers?.[entry.checkerKey];
  if (digest !== entry.selectionHash || link.admission !== source + '#' + row.contract_id ||
      !checker?.checkerSourceHash || checker.checkerSourceHash !== entry.checkerSourceHash ||
      row.lineage_id !== lineage || row.content_hash !== problem.validation?.evidence?.sourceTaskHash ||
      row.family_id !== problem.familyId || row.topic !== problem.topic ||
      row.source_problem_id !== null || problem.pedagogy?.sourceRecordIds?.length !== 1 ||
      problem.pedagogy.sourceRecordIds[0] !== source) invalid();
  assertNoHeldAssessmentRevisions({records:{[link.admission]:entry}});
  return lineage;
}
