import registry from './reviewed-technique-tags.json' with {type:'json'};

// The immutable content hash covers the problem identity and revision. A new
// or changed problem cannot inherit a supplemental tag from similar wording.
const emptyTags = Object.freeze([]);
const tagSets = registry.sets.map(tags => Object.freeze(tags));

export function reviewedPracticeTags(contentHash) {
  const index = Object.hasOwn(registry.byContentHash, contentHash) ? registry.byContentHash[contentHash] : undefined;
  return index === undefined ? emptyTags : tagSets[index];
}

export function matchesFreeResponsePracticeTag(row, tag) {
  return tag === '*' || row.technique === tag || reviewedPracticeTags(row.content_hash).includes(tag);
}

export function indexedPracticeTags(problem) {
  const extra = reviewedPracticeTags(problem.contentHash);
  if (!extra.length) return problem.techniqueTags;
  return [...new Set([...problem.techniqueTags, ...extra])];
}
