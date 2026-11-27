# Study Guide authoring and pathway standards

These standing rules extend the [problem-authoring standards](../bank/PROBLEM-AUTHORING-STANDARDS.md). The release status determines which lessons and paths are complete, reviewed and public.

- Name a lesson's mathematical content directly: “Partial sums, geometric series and telescoping,” “Implicit and logarithmic differentiation,” or “ODE existence, uniqueness and maximal intervals.” Put conceptual statements such as “A series is a limit of partial sums” inside the explanation. Avoid vague, motivational or generic lesson titles. Keep stable lesson IDs when clarifying an unpublished title; preserve published revisions and their evidence.
- Author a learning sequence, not a list of tags. State what each step contributes and why it comes next. Introduce required notation and concepts before using them, and link a suitable prerequisite bridge for anything assumed.
- Keep prerequisite dependencies acyclic. Every required prerequisite must appear earlier in a path or in an explicitly completed prerequisite route. The initial foundation routes include their prerequisites directly; they do not infer completion from a rank or account history.
- Distinguish a prerequisite from a related application. A forward-looking example can explain a connection, but it must define the needed terms and must not become an unexplained dependency or a prerequisite cycle.
- Link readiness checks to actual reviewed exercises taught by that route. Test reasoning and theorem conditions as well as calculation. Progressive hints and complete solutions remain separate. These are learner self-checks, not measured mastery or reading XP.
- Keep incoming lesson preparation and pathway exit checks distinct. A lesson's preparation links must target prerequisite exercises; its own transfers belong in the route's exit checks. Match each readiness prompt to the actual exercise, rather than claiming an additional case that is not assessed.
- In ODE methods, normalize forcing before applying a formula and fit initial data to the complete solution. Preserve equilibria and velocity signs, distinguish an energy bound from finite-time attainment, match state derivatives at forcing switches, and state transform convergence conditions. At a singular recurrence, check compatibility before division; justify series convergence and termwise calculus on the actual interior interval.
- Review transitions editorially. Graph validation can detect cycles, missing lessons and out-of-order prerequisites; it cannot establish that a lesson teaches enough, that an example is correct, or that the whole curriculum is complete.
- Connect every lesson to the relevant Easy, Medium, Hard and/or Olympiad expected concepts. Name the exact concept, explain how this lesson applies, and link the actual section, worked example or exercise that supplies the teaching. Label a relationship as core teaching, preparation or extension. A badge alone is insufficient; do not infer a problem's difficulty from the sophistication of its technique. A preparation link must not claim the advanced topic is fully taught.
- Check ordinary cases as well as exceptions. A degenerate-Hessian exercise and a singular constraint do not establish readiness to compare an interior optimum with a regular boundary. Add a separate transfer when the next pathway depends on that skill. Define matrix operations and quadratic-form terminology before using their names in a theorem.
- Separate candidate discovery from proof. Solving a fixed-point equation before proving convergence is legitimate; treating its roots as a convergence proof is not. A recurrence exercise should establish the invariant domain and actual limiting behavior, and justify which candidate applies.
- Keep the relationship bidirectional: lesson readers show their tier relevance; tier/topic overviews link the supporting lessons. Preserve explicit gaps where an expected concept has no adequate teaching. Concept-list completeness, structural mapping checks and independent teaching-coverage review are separate requirements. Review affected tier mappings whenever lesson scope changes.
- Preserve attribution and exact source/permission records. Use section-specific reference titles so two links to the same book are distinguishable. Keep private construction mappings and review machinery out of public lesson copy.
- Division roadmaps use the actual current rank names and stay available as recommendations. Keep them distinct from topic/difficulty curricula and measured mastery; never infer a learner's prerequisites from rank, gate access by division, change rating thresholds, or award reading XP. Include the full prerequisite route, useful topic applications and actual exit exercises.
- Review all 28 required topic-tier paths and all division roadmaps against actual lesson sections, construction decisions and prerequisites. Four foundation routes are shared preparation; they do not satisfy the 28-path requirement by themselves.

Executable checks: `tests/study-pathways.test.mjs`, `tests/study-tiers.test.mjs`, `lib/study/pathways.mjs` and `lib/study/tier-structure.mjs`. Browser checks must cover hub → path → lesson → next/previous → readiness exercise, lesson → tier concept → supporting lesson, stable query/fragment links, headings and narrow layouts. Future content changes must rerun affected source-bound mathematics, pathway, tier-fit and exposure checks.

Publication uses the separate [Study Guide admission gate](STUDY-ADMISSION.md). Review flags in authored files are not sufficient. The current source, actual author identities, presentation/diagram bytes, precise tier relationships and complete teaching-exposure surfaces must remain bound to verified evidence.


## Series and product review practices — November 11, 2026

- Separate formal coefficient identities from numerical evaluation. Retain initial recurrence terms, distinguish ordinary and exponential normalization, and prove a convergence domain before substituting. A nonzero initial-value example helps catch missing boundary terms.
- For reordered or grouped sums, prove each index appears exactly once and control partial sums inside unfinished blocks. Finite rectangle calculations must distinguish joint, diagonal and iterated limits.
- For real infinite products, state the nonzero-limit convention, check positive factors, preserve exceptional finite factors, and sum an explicit logarithmic-error bound. Group all index-dependent factors under the product symbol.
- Inspect serialized math for unintended TeX line breaks where a spacing command was intended. A successful strict render cannot establish the intended typography or mathematical scope.
- Bind independent review and owner corrections to separate immutable artifacts. Regenerate corrections by matching the exact source block, not by a brittle numeric array position.

Evidence: the three series-extension drafts have 339 independent finite checks and a separate analytic proof review in `outputs/m4-research/series-extension-review/v1/REVIEW.md`; current integration, strict rendering and actual guest-reader checks are bound by `series-extension-integration-v1.json`, `study-render-v24.json` and `study-browser-qa-v8.json`. Exposure and final admission remain separate gates.

## Special integrals, spatial coordinates and moments

- State each special function's integral domain and prove endpoint/tail convergence before applying its value. A continuation of a function does not assign an ordinary integral outside that domain a finite value. Keep finite integration-by-parts boundary terms until their limits are justified.
- Define every coordinate's geometric role and range. Derive the absolute Jacobian, translate every region inequality, and establish global coverage. Explain why seams or poles can be removed; zero measure alone does not justify ignoring a singular neighborhood.
- Distinguish raw mass, normalized average and covariance, including the factor in the Gaussian exponent. Check both the integrand and the transformed region. A positive determinant alone is not positive definiteness, and behavior on a single zero-volume line does not prove volume-integral divergence.
- Check prerequisite references against their actual exercises. Do not ask a finite-interval task to certify improper limits or a one-dimensional task to certify spatial geometry. State higher-dimensional theorem use explicitly and verify that the referenced bridge supplies it.
- Review the combined teaching surface: a newly taught normalization constant may complete a previously normalized formula and expose a task even when neither page alone did. Changed constants do not establish a new idea or exposure clearance.

Evidence: `outputs/m4-research/special-integral-review/v1/REVIEW.md` independently reviews all twelve cases and records 83 exact finite checks, seven rejected controls and two readiness corrections. `special-integral-integration-v1.json`, `study-render-v25.json` and `study-browser-qa-v9.json` bind owner integration and presentation checks. Final exposure and admission remain pending.
# Standards retained from strategy-lesson review — November 11

- Give lessons direct titles naming their content. Identify the difficulty and topic in a tier/topic pathway title; keep lesson-to-concept relationships scoped to specific teaching anchors.
- An exercise meant to test method selection must not suggest an intermediate simplification in its initial prompt. Put progressively stronger clues in hints and rejected shortcuts in the solution. An exercise placed after relevant teaching is self-study, not a blind mastery test.
- State whether vertex data define exact straight-line interpolation or are merely measurements. Interpret graph heights, slopes and signed regions through labeled units; independently reconstruct an affine formula when checking polygonal data.
- Distinguish the next term from the entire tail. To prove a least count for a strict tolerance, show the proposed count passes, the preceding count fails, and the tails are monotone.
- Two calculations using the same theorem are not automatically independent proofs. Preserve finite endpoint terms and prove each limit/interchange with the actual domain and a sufficient error bound.
- Successful KaTeX rendering does not establish canonical function notation: bare `ln(...)` renders as multiplied letters. Inspect operator commands explicitly and write `\ln`, retaining explicit bases and branches where relevant.


## Elementary bridge review practices

- State whether a limit point actually has nearby domain inputs on the requested side. Keep isolated-point continuity distinct from a punctured limit, and distinguish changing a point value from restricting the entire domain.
- A finite slope table supplies local slopes. Verify proposed solution curves by their full residual; a nullcline need not be a solution and a single matching tangent proves neither a whole solution nor uniqueness.
- Attribute a mathematical property to the correct object: failure of a first-order approximation proves the function is nondifferentiable, not that its linear model is nondifferentiable. State hypotheses before using gradients and distinguish unit-distance rates from path-time rates.
- Treat singular endpoint systems and zero frequency before dividing. Check the differential equation and every boundary condition, and distinguish boundary solvability from initial-value uniqueness.
- Public tier/path explanations describe mathematical learning. Remove notes about renderer registration, draft status and maintaining source contracts. Keep those in private review evidence. Extend an existing concept relationship with new assessment anchors instead of adding a duplicate relationship.

Evidence: `elementary-integration-v1.json` and `outputs/m4-research/elementary-review/v1/REVIEW.md`; all lessons remain draft/pending final exposure and admission.

## Pathway and notation practices retained from lower-tier review

- Supply a narrow prerequisite bridge when an elementary concept otherwise forces an unrelated advanced chain. Keep the advanced lesson's honest prerequisites intact; prove the elementary result using material the narrower route actually teaches.
- A worked regular case and a singular or exceptional transfer are different evidence. Do not use a Hard singularity exercise as the required Medium exit for ordinary coordinate setup and evaluation.
- State the relevant completeness, monotonicity and finite-sum arguments before using a convergence threshold. Preserve the equality case and finite-prefix/domain conditions.
- Use conventional moment subscripts naming the axis in a plane or the coordinate plane in space. Define density and the actual integrand, and distinguish raw moment from normalized mean. For unit density in space, the integral of z over volume is the first moment about the xy-plane, denoted M_xy.
- The global public-copy policy in `AGENTS.md` applies to all displayed text, including route transitions, tier explanations and sources. Player answer drafts are legitimate functionality; internal content-drafting status and release/version labels without a player purpose stay private.

## Advanced pathway and public-copy practices

- A readiness prompt must ask for the actual object assessed by its linked exercise. Finding a weighted sum using a derivative is different from finding the derivative of that sum. Check equality points before asking for uniqueness, and distinguish a residual-to-root-error bound from an upper bound on differences in function values.
- Review reused route transitions in every destination. A direction appropriate for an introductory path can be misleading in an advanced path. Name the immediate mathematical purpose and include a preparation qualifier when the lesson supplies tools without teaching the full advanced construction.
- State existence as a question when an exercise may disprove it. Distinguish a composed variable-coefficient operator from a scaled higher derivative.
- Show friendly, meaningful historical settings and outcomes. Do not display implementation versions, raw configuration JSON or unused mode options. Unknown recorded values remain unknown; current preferences must never fill historical gaps. Keep original recordings unchanged.
- Public errors describe what the player can do. Never reflect an upstream diagnostic, storage error, schema field or internal review note directly into a message.

Evidence: `advanced-path-integration-v1.json`, `replay-browser-qa-v1.json`, and the independent `topic-tier-path-review/advanced-v1` and `global-public-copy-review/v3` packages. These practices do not replace mathematical, exposure or admission review.

## Sequence and Fourier practices retained from independent review

- Prove the behavior of a recurrence before normalizing it. In a quotient-limit theorem, identify the actual denominator and check every required increment sign and divergence condition; a sequence tending to zero may require a reciprocal transformation first.
- Distinguish finite orthogonal projection from convergence of an infinite expansion. State the normalization, constant-term convention, function class and treatment of point values. A positive-definite quadratic argument proves uniqueness only on its stated approximation space.
- Prove a limit from the condition that actually supplies it. A bounded quotient alone does not imply a limit; one-sided differentiability supplies the derivative-limit calculation in the Fourier proof. Keep the order of short-interval and frequency choices explicit.
- Public theorem scope and failure examples must distinguish an inapplicable sufficient theorem from an assertion of divergence. Include periodic seams and jumps when describing convergence.
- Reassess combined teaching exposure whenever a new theorem supplies a formerly missing step. Fourier pointwise convergence can supply uniqueness for smooth periodic functions, and a new normalization can complete an old solution method. Prior foundation-only exposure labels are not permanent clearance.

Evidence: `sequence-fourier-integration-v1.json`, `study-browser-qa-v13.json`, and the separate immutable `lesson-review/advanced-sequence-fourier-v1` and `v2` research packages.
# Additional retained practice — operator hypotheses and public presentation

When comparing two orders of a variable-coefficient construction, check the regularity required by each order separately. A forward formula that differentiates only one coefficient does not justify differentiating both in a reversed comparison. State the additional hypothesis at that comparison, preserving the weaker valid forward result. Keep its counterexample in private review evidence.

An integrated lesson must retain actual prerequisite exercise targets, concept anchors and pathway context. Check the rendered hypothesis, progressive hint and full solution on a narrow screen, and verify previous/next links by pointer as well as keyboard. Wide equations may scroll inside their own container; the document itself must not overflow. Private verification/exposure records do not appear in the reader.


## Editorial recommendations and exposure review

Describe what a recommended reading or exercise helps a learner decide. Bind its recommendation and difficulty to the reviewed lesson, exercise revision, reading destination and displayed title. An optional reference can remain useful without a star. A learner's reading mark, self-reported solving status and verified assessment result each describe a different event.

Compare a worked subproblem with active assessments after changes of variables, scaling, sign and endpoint conventions. Include historical answer-bearing replay corrections. Record each affected item and the specific teaching surface. When revising an exercise to avoid giving away a test problem, check the rest of the course for independent ways to reveal the same answer. Keep the original source and exposure evidence. Never retroactively erase a learner's prior exposure.

To record a direct transfer, identify the answer-producing step that the teaching passage actually displays. Write down the substitution and the decision the learner still has to make. A lesson that states a general rule can prepare a learner for a new problem. For example, knowing the chain rule still leaves the learner to identify the inner and outer functions in a new composition. A worked derivation that already evaluates the same composition under renamed variables supplies stronger evidence. Keep an earlier player's access to a saved worked solution as a separate, account-specific finding.

Before extending a hold to siblings, check a nearby example that uses the same rule and still requires its own mathematical decision. If a reviewer's derivation supplied the missing step, retain the comparison as partial. If a later review overturns a proposed withdrawal, preserve the failed judgment and rebuild the candidate from its verified parent so the withdrawn proposal cannot become a permanent exclusion.

## First use on a shared pathway

Read the actual module in display order, including the label above a figure, the readiness prompt and every worked step. For a shared lesson, record where each route supplies the required concept and what a direct visitor can use. If the explanation comes later, move it earlier, give the learner a reachable prerequisite, or revise the example. Recheck the exercise and drill revision links together. Use the [writing guide](../engineering/WRITING.md) for examples and evidence requirements.

A previous lesson revision can continue to explain an assessed construction after its successor changes. Compare outcomes under translations, changes of units and rescaling. Preserve the old teaching and assessment identities and their exposure relationship in the private record. Refresh admission for the successor before changing the served documents.
