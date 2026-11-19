# Versioned checker maintenance

The original six root `lib/math-answer/` files are immutable v1. Their existing-path aggregate is `1ae21d694037ba320151199e0020fff9175d1d11ccc6e10fa9489766024290fd`. Keep their exports for historical tools. Do not expand them to support a newer answer form.

`versioned-grade.mjs` dispatches the exact saved parser/grader pair. Unknown or mismatched pairs receive an unavailable, ungraded result. Saved receipt recovery remains ahead of new grading; replay displays stored outcomes. Registry membership never selects the checker for a saved question.

The isolated `v2/` engine adds bounded positive algebraic constant powers/indexed roots, including scalar components and explicitly validated interval endpoints. It first checks its saved reference, preserves whole-expression domain obligations, and returns neutral results outside its capabilities. It does not establish general radical sums, roots of transcendental constants, negative odd roots, variable fractional powers or general solution-family completeness.

`checker-sources.json` binds each implementation and its semantic types. Its AST source walker discovers static local dependencies and rejects unsupported dynamic, external, import-equals and type-import forms. New helpers must enter the actual closure. The source generator, dispatcher, admission/storage/index guards and manifests also enter the broader creation policy. A build verifies existing manifests; it never silently regenerates them. Regenerate explicitly only after reviewing the changed source.

Registry 2 has one compiled active admission checker: v2. Every entry must match that key, its source hash, immutable contract and review evidence before counting or SQL selection. Existing single-hash receipt joins therefore remain valid. Registry 1 support is for historical evidence and isolated tools; it is not an automatic upgrade of old content into current admission. The shipped registry is empty and has no reviewed v2 source hash.

The private admission gate always recomputes current checker bytes after taking immutable input snapshots. A supplied expected hash is only an extra equality assertion; it cannot replace the recomputation. Never treat a passing fixture, generated source manifest or empty registry as admission or permission to enable creation.

After v2 acquires issued history, preserve its implementation too. A behavioral change needs a new identity, contract/record revision and review. Do not synthesize missing historical source metadata from a current mutable registry.

The independently reported import-equals and caller-hash bypass failures are preserved under `outputs/m4-research/versioned-checker-review/`. Owner corrections and later review evidence must remain separately bound. See the latest progress receipt for exact test/build/runtime/browser scope and remaining qualification.
