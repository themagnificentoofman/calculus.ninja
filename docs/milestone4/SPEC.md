> Later user amendment: [configurable MCQ/FRQ counts and ordering](MIXED-ROUND-AMENDMENT.md) supersedes the single-format Test round restriction below. Historical original requirements are retained for provenance.

# Calculus Ninja — Milestone 4 Work Prompt

## Free-response practice, mathematical editor, and comprehensive Study Guide

### Baseline: published version 39, November 4, 2026

Implement Milestone 4 for Calculus Ninja at https://calculus.ninja, using the existing Sites project and themagnificentoofman/calculus.ninja repository.

Goal: deliver two integrated capabilities: (1) optional final-answer free-response practice with a comprehensive visual/raw-LaTeX editor, reliable server-authoritative grading for supported answer classes, and complete feedback/history/replay integration; and (2) a substantive Study Guide covering every difficulty tier, all calculus topics, cross-topic techniques, and the existing competitive divisions.

A player may use any valid mathematical method, including advanced or obscure methods. Grade the submitted answer under the displayed assumptions. The editor should support broad mathematical notation; the grader must declare and verify its capabilities. Ordinary gameplay must make zero model calls.

Take both capabilities through implementation, mathematical/content review, end-to-end validation, and the established release workflow. The Study Guide is a required part of Milestone 4, available to both MC and FR learners.

## 1. Start from the completed version 39 quality release

Reconfirm the current deployment/repository before editing and preserve newer work. The verified starting point is:

- Sites version 39, source fa22010f6f7ec83e90e0d8f6d0f63375be981088.
- Active release cn-2026-11-04-quality-v4.
- 4,407 reviewed default-active multiple-choice records: 1,115 unchanged published records, 1,334 immutable revisions, and 1,958 new IDs. Two permitted source adaptations are included.
- All 28 broad practice pools passed 140,000 simulated questions across development and reserved sequences.
- Experimental legacy inclusion defaults off; its exact-revision approval list is empty, so no legacy problems currently qualify.
- Hard multivariable has 125 normalized tasks and 113 cap-effective slots for its 100-question horizon: 13% headroom. This is a documented, passing baseline limitation, not an error rate.
- Historical canonical records, saved games, grades, XP, ratings, and replays remain preserved.

Read scripts/bank/AGENTS.md; docs/bank/NOTATION-AND-SOLUTIONS.md; docs/bank/PROBLEM-AUTHORING-STANDARDS.md; docs/bank/problem-quality/MILESTONE-4-HANDOFF.md, LEGACY-POLICY.md, PRACTICES-RETAINED.md and session-contract.json; and the current snapshot, admission, replay and release contracts.

Use final activation receipts and current live state to interpret status; earlier preparation checkpoints remain historical evidence. The quality release's notation repairs, exposure dating, bounded catalog/fallback, lineage, exclusions and composed-release safeguards are implemented foundations. Preserve them through relevant regressions.

The 4,407-record count and successful MC simulations do not establish free-response grading coverage or capacity.

## 2. Deliver free response as an answer format in individual Test practice

Start with untimed individual Test/practice. Add an explicit Multiple choice / Free response choice independent of topic and difficulty; retain the current multiple-choice default. Mixed continues to mean mixed topics. Use a single selected response format per initial-release round.

Keep Rapid, PvP and Multiplayer on their existing multiple-choice behavior for this milestone. Preserve accounts, public access, existing competition rules and historical statistics. Separate new FR statistics from MC statistics; this release does not add a mastery model or proof grading.

Target all six topics and Mixed at all four difficulties. Enable only independently admitted FR pools and offered round sizes that meet their stated quality/capacity gates. Full completion requires all 28 broad FR pools to support 20-question rounds and pass the corresponding 200/100-question horizons. Smaller partial offerings may be released honestly but do not satisfy the full milestone. Work toward that target through supported grading contracts and focused content additions where needed.

If a filter cannot be supported reliably, show clear unavailability and retain its existing MC path. Do not silently substitute another difficulty, topic, response format or legacy content. Do not claim completion of the full target while a pool remains unqualified.

## 3. Inventory actual answers and author versioned grading contracts

Inspect the actual task and expected answer for each candidate. Existing pedagogy.answerForm strings are descriptive labels, not grading types: an exact-expression label may conceal a scalar, tuple, interval, or ordered textual classification.

Do not convert the bank by hiding choices or parsing the correct option alone. Independently determine what the question asks, its assumptions, permitted answer forms, and any ambiguity introduced by removing the menu. Reassess FR difficulty while preserving the existing MC classification.

Introduce a versioned discriminated contract for multiple-choice and free-response questions, answers, snapshots, and replay events. Keep frozen MC records readable. A private FR contract must bind:

- Problem identity/revision/hash and mathematical/exposure lineage.
- The exact served statement, assumptions and presentation version.
- Mathematical answer type, variables, real/complex domain and branch conventions.
- Expected answer or reference object, supported equivalence strategy, allowed final-answer operators, and appropriate exact/tolerance policy.
- Parser, grader, contract and independent-review versions.
- Canonical and alternative-answer fixtures, plausible wrong answers, and review evidence.

Separate public answer instructions from private expected answers and verification rules. Unknown or unreviewed contracts fail closed.

Support these substantial first-release capabilities with actual playable content:

1. Exact scalar values, including rationals and explicitly supported algebraic/transcendental constants.
2. Symbolic functions within a documented expression grammar and stated domains.
3. One-variable "give any antiderivative" questions on explicit domains.
4. Explicit approximate-number questions with authored precision/tolerance contracts if such questions are enabled.

Implement typed tuples, intervals, sets, classifications, nonfinite outcomes, or multipart answers wherever enabled items need them. Ordering, multiplicity, interval endpoints and component types must be explicit. Unsupported mathematical types remain ineligible.

Include several independently reviewed constructions demonstrating symbolic functions and antiderivatives; a numeric-only demonstration or unused schema enum is insufficient. Use targeted additions governed by the current authoring standards, without restarting a whole-bank expansion.

## 4. Build a coherent Study Guide for tiers and divisions

Use Easy, Medium, Hard and Olympiad as the primary curriculum tiers. Each tier needs six substantive topic paths—integration, differentiation, limits, series, differential equations and multivariable—plus a Mixed/strategy path. Deliver all 28 paths with shared, versioned lessons rather than duplicate articles.

Also provide division-oriented roadmaps using the actual current rank configuration: Bronze, Silver, Gold, Platinum, Diamond and Grandmaster, plus an Unrated/start-here route. Explain recommended foundations, useful topic paths and readiness checks for each. Reuse lessons and distinguish recommendations from measured mastery. A competitive division is not a calculus difficulty label; do not invent a one-to-one correspondence, change rating thresholds or gate learning by rank.

Every tier overview must explain its expected prerequisites, learning goals, typical reasoning demands and suggested progression. Show how subtopics recur with increasing depth. Track a technique's prerequisites separately from a problem's difficulty: direct use of an advanced formula may be routine, while an elementary method may require Olympiad insight.

Define comprehensive coverage against a reviewed curriculum and the active bank. Cover standard foundations and progression even where matching practice is sparse. Every enabled construction's central mathematical decision and essential prerequisites must have an adequate lesson or substantive case note. Include reviewed alternative approaches where they add instructional value. The guide must not imply that it exhausts every possible Olympiad method.

Create a versioned coverage matrix:
tier/topic → subtopic/objective → prerequisites → technique lessons/case notes → reviewed construction/idea groups → available MC/FR practice.

Record lesson/example revisions, review evidence, source attribution and practice availability. Inspect the mathematics rather than copying generator tags. Preserve private question-to-technique mappings where they would reveal an active answer.

## 5. Cover the calculus curriculum and its connections

Use the following as the starting coverage specification, reconciled against actual reviewed problems and authoritative teaching sources. It is a proposed curriculum, not a claim about existing content. Complete standard calculus coverage; prioritize advanced methods used by active constructions or necessary for their prerequisites. Label further advanced material as enrichment. Add missing essential ideas discovered during the audit.

A. Differentiation

- Easy: derivative as limit, slope and rate; domains and units; elementary derivatives; product, quotient and direct chain rules; derivative at a point.
- Medium: implicit, logarithmic, inverse and parametric differentiation; higher derivatives; related rates; linearization; monotonicity, concavity and extrema; mean-value theorem hypotheses.
- Hard: higher-order derivatives, Leibniz formulas and recurrences; parameter-dependent implicit relations; Taylor remainders and sharp estimates; nonsmooth and exceptional points; justified differentiation under an integral or sum.
- Olympiad: auxiliary functions, hidden functional structure, high-order coefficient extraction, generating functions/inversion where relevant, differential operators, symmetry, inequalities and extremal arguments. Explain the decisive recognition step.

B. Integration

- Easy: signed accumulation versus geometric area; definite/indefinite integrals; FTC; elementary primitives; constants and domains; straightforward substitution.
- Medium: integration by parts; partial fractions; trigonometric identities/substitutions; variable bounds; basic improper integrals; average value, areas, volumes, arc length and surface area of revolution.
- Hard: symmetry/reflection, nonobvious substitutions, reduction formulas, parameter differentiation, convergence-sensitive manipulations, bounds and approximation errors; beta/gamma connections where relevant.
- Olympiad: involutions and functional relations; parameter-to-ODE methods; transforms/convolution; contour/residue methods with prerequisite bridges; oscillatory/asymptotic integrals; special-function and sharp inequality arguments used in the bank. Distinguish ordinary improper integrals from explicitly requested principal values.

C. Limits

- Easy: continuity; one-sided behavior; direct substitution; cancellation/rationalization; squeeze; basic behavior at infinity.
- Medium: standard trigonometric/exponential/logarithmic limits; comparative growth; l'Hopital with its conditions; local Taylor approximations; sequence and recurrence limits.
- Hard: higher-order cancellation; oscillation; parameter dependence; asymptotic estimates; suitable applications of Stolz–Cesaro; conditions for interchanging limits and other operations.
- Olympiad: tailored normalization, dominant balance, limiting sums/products/integrals, delicate bounds, singular behavior and nonuniformity. Include counterexamples that distinguish a convincing heuristic from a justified limit.

D. Series

- Easy: sequences versus series; partial sums; geometric, telescoping and p-series; indexing; the necessary nth-term test and why it is insufficient.
- Medium: comparison, ratio/root/integral and alternating tests; absolute versus conditional convergence; remainder bounds; power series, radius/endpoints, Taylor/Maclaurin expansions.
- Hard: generating functions; weighted/harmonic sums; summation by parts; Abel/Dirichlet arguments; uniform versus pointwise convergence; justified termwise integration/differentiation and rearrangements.
- Olympiad: nonroutine coefficient extraction/asymptotics, infinite products, Fourier/orthogonality or transform connections, advanced summation, special-function identities and critical parameter cases represented in the bank. State the convergence or summation convention.

E. Differential equations

- Easy: solution meaning and residual verification; initial conditions; slope fields; elementary separable/growth models; equilibria that can be lost by division.
- Medium: first-order linear/integrating-factor, exact and Bernoulli equations; constant-coefficient second-order equations; forcing/resonance; initial/boundary data; basic existence/uniqueness conditions.
- Hard: substitutions, reduction of order, variation of parameters, Euler–Cauchy equations; systems/eigenstructure; qualitative stability; series/Frobenius and Laplace methods where relevant; singular solutions and local versus global existence.
- Olympiad: hidden linearization, Riccati/projective viewpoints, invariants/first integrals, comparison/oscillation, spectral or variational methods, special functions and nonroutine parameter/boundary problems. Explain any advanced analysis needed by active constructions.

F. Multivariable

- Easy: functions and level sets; partial derivatives; gradients and directional derivatives; simple local linearization and rectangular iterated integrals.
- Medium: total differential and multivariable chain rule; tangent planes; critical points/Hessians; elementary constrained optimization; double/triple integrals; polar, cylindrical and spherical coordinates; Jacobians.
- Hard: boundaries and degenerate Hessians; global constrained optimization; nonlinear changes of variables and regions; multivariable limits, differentiability and path dependence; mixed partials; vector calculus, line/surface integrals and Green/Stokes/divergence with hypotheses.
- Olympiad: symmetry and invariance, homogeneous functions, quadratic forms/determinants, multidimensional integration and inequalities, geometric transformations, variational/duality or parameter/moment arguments represented in the bank.

G. Mixed and cross-topic strategy

- Easy: identify the requested mathematical object; check domain, sign, scale and units; connect graphical and algebraic meaning.
- Medium: choose among familiar methods and compare two valid routes; connect FTC, derivatives, integrals and elementary series.
- Hard: decompose a problem, change representation, check exceptional cases and theorem conditions, and combine methods efficiently.
- Olympiad: develop recognition through symmetry, parameters, transforms, asymptotics, inequalities and spectral/extremal viewpoints. Include elegant elementary solutions alongside advanced or obscure methods.

Build explicit cross-topic learning paths for:

- FTC: differentiation ↔ integration.
- Taylor methods: differentiation ↔ limits ↔ series.
- Series/integral interchange and its hypotheses.
- Parameter differentiation: integrals ↔ differential equations.
- ODE systems: linear algebra ↔ geometry ↔ stability.
- Symmetry, substitutions, changes of variables and inequalities across topics.
- Convergence, uniformity, domains and exceptional cases as recurring checks.

Provide concise prerequisite bridges for algebra, trigonometry, functions, exponentials/logarithms, inequalities, linear algebra, complex variables and analysis concepts when a lesson needs them. Avoid unexplained jumps into advanced notation.

## 6. Make the Study Guide teach, with reviewed examples

A directory of formulas, technique names or external links is insufficient. Each substantive lesson must include:

- Learning objectives, prerequisite links and when the technique is useful.
- Intuition and an explanation/derivation of the central idea.
- Definitions, assumptions, domain restrictions and theorem hypotheses.
- At least one fully worked, independently checked example with essential intermediate reasoning.
- A contrasting example, boundary case or counterexample where useful.
- Common mistakes and how to detect them.
- Transfer exercises with progressive hints and separately revealed complete solutions.
- Alternative approaches where instructive, related lessons and suggested next steps.
- Accurate references, adaptation details and content/review versions.

Use enough distinct examples to cover different mathematical decisions; coefficient substitutions do not count as different instructional ideas. Overview pages may summarize shared lessons, but every topic-tier path must provide a coherent learning sequence and meaningful readiness checks.

Teach method selection, including when a tempting method fails. Olympiad instruction must show how to recognize structure and combine ideas, rather than imply that a memorized list or fixed rotation predicts the next question. Any valid solution method remains permitted; a player's method need not match the guide or reference solution.

Research authoritative publicly accessible textbooks, university course materials and problem sets to fill curriculum gaps. Check each source's reuse permissions before adapting text, examples, diagrams or solutions; public availability alone does not establish permission. Record exact source URLs, attribution, license/permission and modifications. Use independent authoring or links where adaptation is not permitted, and verify all resulting mathematics. Preserve existing source obligations.

Use graphs and diagrams when they explain geometry or behavior, with accessible descriptions and accurate mathematics. Add a concise answer-entry companion covering exact versus approximate answers, variables, log/branch conventions, constants of integration, structured answers, visual/raw input and ungraded outcomes.

Keep teaching coverage distinct from automated grading capability. Proofs, explanations and advanced exercises may be clearly labeled for self-study with worked solutions. Auto-checked exercises must use reviewed supported contracts; do not imply that M4 grades arbitrary proofs or every method discussed in the guide.

## 7. Integrate study, practice and review

Build a discoverable Study Guide hub with tier, topic and technique navigation; search; prerequisite/related-lesson links; breadcrumbs; stable deep links; and readable desktop/mobile layouts. Make the guides available without requiring an account. Match the existing product design and math notation.

Provide division roadmaps, an Unrated/start-here orientation and a clear way to switch tiers/topics. Explain where a technique is introduced and where it is revisited. If progress/bookmarks are included, reuse existing identity and label self-marked completion accurately; do not add rating changes, reading XP or a new mastery engine.

“Practice this” must use real supported filters and currently eligible pools, show MC/FR availability, and respect history/capacity rules. Where a technique drill is unavailable, say so and offer explicitly labeled broader practice as a separate choice. Never silently widen filters, fabricate practice availability or admit legacy content to populate a guide.

After authorized answer review, link to relevant lessons and prerequisite remediation. During an active question, general guide access and notation help are acceptable; question-specific recommendations must not reveal private technique tags, answers or solutions before the permitted review/reveal step. Invalid or indeterminate submissions must not unlock those details.

Prefer distinct authored teaching examples. If a guide reveals an exact live-bank question or mathematical equivalent, record exposure under the existing policy when attributable to the current account/session; do not promise continuity across unidentified readers or unrelated accounts. If it matches an already-issued question, apply the authorized reveal/finalization policy so it cannot remain an unrevealed scored attempt. General lesson reading must not create fake attempts or answer rewards. Preserve source credit without exposing hidden live-question data.

Keep teaching examples, practice contracts and lesson mappings versioned. Future bank changes must identify affected lessons and coverage gaps; a guide update must not rewrite recorded attempts or change a published grading contract silently.

## 8. Build the complete editor experience

Use a current patched MathLive release or justify an equally capable alternative. Verify current APIs, security fixes, license compatibility, React/SSR behavior and actual Worker-compatible grading dependencies. Pin the chosen versions; do not implement against obsolete examples.

Provide:

- Direct visual math entry and an editable raw-LaTeX view with live preview.
- Reliable switching without losing unsupported-but-safe source text, cursor context or meaningful mathematical structure.
- Organized palettes for fractions, powers/roots, parentheses, absolute values, Greek letters, constants, logs, trig/inverse/hyperbolic functions, integrals, derivatives, limits, sums/products, intervals, sets, vectors/matrices and piecewise notation.
- Physical-keyboard shortcuts, selection, undo/redo, copy/paste, mobile virtual keyboards, and IME/composition support.
- Accessible labels, focus navigation and readable feedback; no accidental submission when Enter is used inside an unfinished expression.
- Draft recovery across refresh/reconnect, scoped by account, round, question revision and response format. Clear or isolate drafts on account changes and respect completed submissions.

Use the app's notation conventions consistently in the editor, preview and server parser. State whether an exact value, approximation, function or structured answer is expected. Resolve logarithm bases, inverse-function notation, implicit multiplication and permitted variables explicitly.

Keep the original source when a visual conversion is lossy. Unsupported grading syntax must be explained without discarding the draft. The broad palette does not imply every notation is gradable for every question.

Lazy-load editor assets and avoid slowing the MC experience. Disable automatic Solve/Evaluate assistance in the answer field. Keep internal parser/contract terminology out of the player flow.

## 9. Implement justified mathematical grading

The server reparses the submitted source and uses the saved private contract. Never trust a client correctness flag, AST, chosen tolerance, expected answer, or requested grading policy.

Use bounded, independently tested verification routes for the declared answer classes. An approved alternative list can supplement semantic checking; raw LaTeX string matching alone is insufficient.

Preserve domains and restrictions before simplification. Check the whole required domain, including relevant endpoints and branches. A simplification that cancels a denominator must not silently erase a required hole.

Exact tasks must use exact semantics. For example, 0.5 can represent exact 1/2, while a rounded approximation to 1/3 does not satisfy an exact-answer task. Approximate questions need an explicit absolute/relative tolerance and precision convention, including behavior near zero, boundaries and nonfinite values.

For symbolic identities, use a verification route whose grounds are known. Random-point agreement is not proof. A generic CAS boolean or tolerance comparison is not automatically a valid exact-answer verdict; audit the selected library's comparison semantics. Unresolved work remains ungraded.

Default antiderivative tasks to "give any antiderivative," with a stated policy for optional +C. Verify differentiability and derivative equality throughout the required domain; equality almost everywhere does not excuse an interior jump.

Enable "general antiderivative" or parameterized ODE-family grading only if the contract verifies completeness and parameter conventions. F(x)+C^2 omits some additive constants when C is real; e^(x+C) is not the complete real family C e^x. Disconnected domains can require independent constants. Derivative agreement or the presence of C is insufficient for a general-family claim.

Define permitted final-answer operators per task. Do not give credit for copying the original unevaluated integral, derivative, limit or sum merely because the server can perform the exercise. Preserve legitimate final-answer representations when the task explicitly allows them.

Support +infinity, -infinity, DNE, divergence and other classifications as distinct typed outcomes where appropriate. Do not conflate them with NaN or parser failure.

## 10. Make submission outcomes and progression explicit

Implement separate outcomes:

- Correct.
- Incorrect, supported by a justified comparison.
- Invalid input, with actionable syntax/type feedback.
- Unsupported form, where the submission exceeds verified capabilities.
- Unable to determine/resource limit.
- Skipped or revealed.

A selected question must have a supported reference answer, but a player's equivalent expression can still exceed the grader's capabilities. Unsupported or indeterminate does not mean mathematically wrong.

Preserve drafts and permit editing/resubmission after ungraded outcomes. Provide a neutral path to skip/reveal and continue without falsely adding an incorrect answer or awarding answer credit. Any finalization/reveal state must be distinct from mathematical correctness.

Define a single graded first-attempt policy per issued question, consistent with Test practice. Finalized correct/incorrect answers cannot be rewritten for extra XP; any optional later practice is clearly unscored. Invalid or unresolved submissions must not become a way to farm rewards.

Show the interpreted input and concise feedback. Reveal the canonical answer, worked solution and permitted alternatives only through the authorized answer/review flow. Feedback on ungraded input must not expose the hidden answer.

Record meaningful FR accuracy and completion statistics separately, distinguishing graded, ungraded, skipped and revealed items. Preserve old XP/rating calculations and avoid adding competitive FR ratings in this release.

## 11. Bound computation in the deployed runtime

Prove the chosen parser/grader works in the actual Cloudflare Worker build before committing the application to it. Keep grading local to the authorized application runtime; do not introduce a required paid CAS service or model-based fallback.

Set explicit limits on source length, nesting, AST nodes, numeric digits, exponents, collection sizes, expansion and symbolic work. Enforce cheap checks before expensive parsing/canonicalization and bound later phases too. Apply safe length/rendering limits to editor preview and paste as well as server grading.

Reject executable macros, arbitrary assignments/functions, control flow, imports, eval/new Function, untrusted HTML/CSS and unsafe rendering commands. Isolate mathematical state across requests; one user's assumptions or symbol assignments must not affect another.

Use deterministic work/step budgets and finite algorithms. A Promise.race timeout cannot interrupt synchronous symbolic work. Deployed Worker clocks also do not provide a reliable elapsed CPU timer inside a synchronous computation. Do not cache partial or cancelled results as definitive verdicts.

Benchmark ordinary and adversarial inputs in the actual Worker-compatible runtime, recording package versions, resource limits, outcome rates and latency distributions. Distinguish local elapsed timing from available hosted measurements. Do not invent CPU/quota metrics or require unavailable account-wide quota introspection to validate the bounded algorithm.

## 12. Integrate schemas, privacy, idempotency and rewards end to end

Audit all current choice-index assumptions, including bank/game contracts, question validators, API payload allowlists, question-set storage, answer progression, reviews, exports and replay rendering.

Two concrete v39 hazards require deliberate changes:

- Round references and issued-exposure recording currently depend on choiceOrder; replay completeness also treats its absence as missing context. FR snapshots must be complete without fictitious choices or a dummy correctIndex.
- Public answer projection currently removes a few private fields and spreads the remainder. Replace it with explicit public allowlists before adding typed submissions or grader diagnostics.

Keep raw/normalized answers, private contracts, grading internals, hidden choices, expected answers and private pedagogical metadata out of pre-answer/public documents and other players' views. Preserve required public source/license credit; keep solution-revealing modification details behind the appropriate review boundary.

Bind an idempotent submission ID to the account, round, question revision, contract/grader version and submitted body. Identical retries return the recorded outcome; reusing an ID with changed content must not overwrite it.

Perform bounded grading against an immutable saved question outside the retryable transaction callback. Then atomically revalidate identity, membership, question state and contract version before recording the verdict, attempt exposure, progression and rewards. The current transaction callback can run up to six times.

Handle concurrent tabs, delayed responses, retries, refresh, skip-versus-submit races and stale contract revisions. Each graded/finalized attempt settles once. Preserve server authority and never use client timing as proof of correctness or reward eligibility. Apply authenticated submission-rate limits and bound retained invalid/ungraded attempts without converting a service limit into an incorrect mathematical verdict.

## 13. Preserve quality and prove the FR subset's capacity

Apply FR eligibility before pool counts, capacity reservation, sampling and unseen fallback. Count normalized mathematical tasks and real construction families; preserve v39 lineage, exclusions, withdrawals, revision precedence, randomness and history weighting.

An MC encounter and an equivalent FR encounter share mathematical exposure lineage. Changing response format, options or IDs must not manufacture a fresh problem or clear the 512-entry/14-day attempted-history policy.

Keep Experimental legacy defaults and exact-revision admission unchanged. Legacy includes original construction descendants; conversion to FR does not erase that origin. No legacy currently qualifies. FR conversion cannot bypass withdrawals or use legacy to satisfy default coverage.

Publish a topic × difficulty × answer-class matrix: reviewed MC records, FR-admitted records, normalized tasks, qualified ideas, cap-effective capacity and exclusions. Reassess the actual FR task's difficulty and preserve the existing MC labels.

Use the actual v39 code/content/history as the MC regression baseline, under matched starting histories. Reuse the versioned session contract and evaluator, extending them to genuine FR eligibility and final displayed prompts.

The stated 200/100-question horizons begin with fresh/unexposed history and carry attempted exposure forward within its retention window. Evaluate returning and cross-format histories separately against their actual remaining unseen capacity; give explicit exhaustion or unavailability where appropriate.

For each enabled broad FR pool at 20 questions:

- Olympiad: ten consecutive rounds, 200 questions.
- Other levels: five consecutive rounds, 100 questions.
- All six topics and Mixed evaluated separately.
- Continuous attempted history; zero exact/equivalent repeats, within-round duplicates, avoidable family adjacency, cap violations, silent relaxation or request failures.
- At most two questions per real construction family per round.
- Olympiad held-out mean of at least 16 independently reviewed qualified ideas per round, assessed per topic and Mixed separately.

Use 20 development and 20 newly reserved held-out sequences for the new FR policy; preserve failed results and seeds. Existing v39 seeds remain regression evidence and must not be relabeled as unseen after tuning. Add returning-history, narrow-drill, sparse, retention-bound and cross-format fixtures.

Calculate effective capacity after FR filtering: sum_f min(U_f, 2H) >= 20H for H rounds, where U_f is eligible unseen mathematical items in family f. This is necessary, not sufficient; run the serving selector.

Pay special attention to hard multivariable's existing 113 cap-effective slots. The 13% headroom is accepted MC evidence, not an FR capacity guarantee. First expand verified grading coverage within the reviewed bank; make focused reviewed additions if necessary. Do not weaken history, difficulty, lineage, legacy policy or family caps to pass.

Preserve all 28 MC pool results. If an FR pool cannot pass, keep it unavailable and report the remaining milestone gap precisely. No unsupported pool may be presented as complete.

## 14. Preserve recorded attempts and replay behavior

Version FR replay events, state, validators, playback and analysis together. Existing MC replay version 1 must remain readable without rewriting stored data.

Save the actual served statement/assumptions, problem and presentation identity, grading-contract/grader versions, submitted source, server interpretation and recorded verdict. Store bounded semantic events such as question display, submission and feedback; avoid recording every keystroke.

Replay must reproduce the original attempt and decision. Never silently regrade historical answers with a newer CAS, policy or contract. Later explanation clarifications remain separately labeled.

Test pause, seek, playback speed, refresh/reconnect, incomplete/legacy recordings and long expressions. Preserve attribution and any applicable Legacy marker.

Define reveal/review behavior for ungraded submissions explicitly: a parser failure alone must not unlock private answers through a generic "answer object exists" condition.

Define exposure separately from correctness and finalization. Invalid or unresolved input must not earn credit or become a graded wrong answer; an authorized reveal must still record the question's mathematical lineage as exposed, without answer XP. Document the history treatment of submission, skip and reveal, preserve actual exposure times, and prevent duplicate/delayed delivery from refreshing them.

## 15. Validate mathematical and application behavior independently

Every admitted FR question's reference answer and approved equivalent fixtures must pass under its actual shipped contract. Independently checked wrong answers must not receive credit. Report false acceptance, false rejection and ungraded rates separately by answer class; unsupported fixtures must not inflate an accuracy claim.

Required adversarial mathematical fixtures include:

- 1/2, 2/4 and exact terminating decimals; exact 1/3 versus rounded approximations.
- Factored/expanded polynomials and supported trigonometric identities.
- sqrt(x^2) versus x on all real x.
- Rational cancellation with a domain hole.
- Logarithm domains and inverse-function/complex-branch restrictions.
- Antiderivatives differing by constants; an apparent primitive with an interior jump.
- General-family completeness traps if that class is enabled.
- Ordered versus unordered answers, interval endpoints and mixed categorical components.
- Distinct infinity/DNE/divergence cases.
- Copied unevaluated tasks and wrong functions agreeing at sampled points.
- Unknown symbols, ambiguity, malformed input, huge integers/exponents, deep nesting, oversized collections and unsafe rendering commands.

Run actual create → select → edit → submit → feedback → finalize/skip → history/replay flows, including empty input, keyboard/IME composition, duplicate requests, transaction retries, two tabs, stale revisions, offline recovery, account isolation and public-document inspection.

Inspect the real editor on desktop and mobile: visual/raw switching, caret behavior, undo/redo, paste, virtual keyboard overlap, focus, accessible navigation, fonts and long-formula containment. Test Chromium, Firefox and Safari where available; state verification limits honestly.

Validate the Study Guide separately:

- All 24 topic-tier paths and four Mixed paths are substantive, navigable and covered by the curriculum matrix; every existing division and Unrated has a usable roadmap.
- Every enabled construction's essential reasoning and prerequisites map to adequate reviewed instruction. Report genuine remaining gaps; duplicate pages/tags must not inflate coverage.
- Independently check definitions, worked examples, hints, solutions, counterexamples, diagrams and theorem conditions. Record what was checked and by what method.
- Verify source attribution, permissions, internal links, search, deep links, prerequisite navigation and the honesty of practice availability.
- Exercise guide → supported practice → submission → authorized review → relevant lesson, for MC and FR, plus guest reading, narrow/sparse filters and unavailable drills.
- Check mobile reading, accessible headings/order, keyboard navigation, formula containment and safe rendering. Confirm pre-answer privacy, exact-item exposure treatment, account-scoped progress and unchanged historical grades/ratings.

Run applicable existing mathematics/content reconstruction, source-bound solution/admission gates, session evaluations, unit/API tests, Firebase Auth/Firestore emulator integration, type checking, Worker smoke and production build. Keep test traffic out of real ranked games.

## 16. Release additively and maintain both grading and curriculum

Preserve v39's verified composition and rollback policy. If a new response/contract schema is introduced, deliberately extend reconstruction, admission, serialization, export/import and verification. The current delta path's reviewed schema-2 gate must not be bypassed.

Use immutable contracts or revisions as appropriate; do not change old canonical hashes, grading, histories, ratings or replay snapshots. FR approval must not be inferred from MC review alone.

Ship backward-compatible readers before activating new formats. Provide a way to stop creation of new FR rounds while retaining the reader/grader versions needed for already-issued games and histories. A rollback to code unable to read FR data is not a safe rollback plan.

Use bounded, resumable operations and current cumulative budget receipts. The previous import's allowance is not fresh capacity; prefer focused additions and contract changes over full-bank reimport. Preserve disabled temporary import access outside authorized operations and distinguish actual consumption from estimates.

Document supported answer types/grammar, domains, tolerances, resource limits, ungraded outcomes and the process for adding a new verified grading route. Extend the standing authoring standards and practices-retained log with evidence and regression checks for grading, lesson quality, source handling, curriculum coverage and bank-to-guide maintenance.

Deliver the working release plus:

- Architecture and dependency decisions.
- The working Study Guide: four tier overviews, 28 complete topic/strategy paths, division roadmaps and the prerequisite/technique library.
- Versioned curriculum/coverage matrix, reviewed lesson/example inventory, source register, practice-link checks and any instructional limitations.
- Typed contract/eligibility inventory and actual playable examples for each mandatory class.
- Per-pool FR capacity/diversity results and MC nonregression evidence.
- Independent grading fixtures and measured outcomes.
- Editor usability/accessibility and runtime/privacy evidence.
- Migration, activation, disabling and rollback checks.
- Exact commit/PR, deployed Sites version, content/contract release and remaining limitations.
- A brief player guide to exact answers, notation, constants and ungraded results.

Complete all authorized preparation and release work. If a genuine permission/resource boundary remains, make the pending action concrete and reviewable before requesting a decision. Do not substitute a mock editor, placeholder study pages, a plan, or unsupported completeness claims for the implementation.

Completion requires both deliverables. A player must be able to find a substantive guide for their tier/topic or division, learn the needed concepts and techniques, follow cross-topic connections, launch honestly supported practice, enter mathematics comfortably, receive a justified verdict or an honest ungraded outcome, and revisit the recorded attempt with relevant study links. All required FR pools and guide paths must pass their respective gates while preserving version 39's reviewed-content, variety, legacy and historical guarantees.

---

## References for the implementer

Current project evidence, pinned to version 39:

- [Milestone 4 handoff](https://github.com/themagnificentoofman/calculus.ninja/blob/fa22010f6f7ec83e90e0d8f6d0f63375be981088/docs/bank/problem-quality/MILESTONE-4-HANDOFF.md)
- [Problem-authoring standards](https://github.com/themagnificentoofman/calculus.ninja/blob/fa22010f6f7ec83e90e0d8f6d0f63375be981088/docs/bank/PROBLEM-AUTHORING-STANDARDS.md)
- [Optional legacy policy](https://github.com/themagnificentoofman/calculus.ninja/blob/fa22010f6f7ec83e90e0d8f6d0f63375be981088/docs/bank/problem-quality/LEGACY-POLICY.md)
- [Versioned session contract](https://github.com/themagnificentoofman/calculus.ninja/blob/fa22010f6f7ec83e90e0d8f6d0f63375be981088/docs/bank/problem-quality/session-contract.json)
- [Current question/round contracts](https://github.com/themagnificentoofman/calculus.ninja/blob/fa22010f6f7ec83e90e0d8f6d0f63375be981088/lib/bank/contracts.ts)
- [Game state, projections and snapshots](https://github.com/themagnificentoofman/calculus.ninja/blob/fa22010f6f7ec83e90e0d8f6d0f63375be981088/lib/server/game-engine.ts)
- [Current division definitions](https://github.com/themagnificentoofman/calculus.ninja/blob/fa22010f6f7ec83e90e0d8f6d0f63375be981088/components/RankDisplay.tsx)

Official technical references; recheck installed APIs before implementation:

- [MathLive editor](https://mathlive.io/mathfield/)
- [MathLive changelog](https://github.com/arnog/mathlive/blob/master/CHANGELOG.md)
- [Compute Engine comparison semantics](https://mathlive.io/compute-engine/guides/symbolic-computing/)
- [Compute Engine execution constraints](https://mathlive.io/compute-engine/guides/execution-constraints/)
- [Cloudflare Worker timers](https://developers.cloudflare.com/workers/runtime-apis/performance/)