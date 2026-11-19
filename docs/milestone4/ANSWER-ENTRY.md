# Answer entry and formatting contract

Status: local Milestone 4 implementation; no FR bank admission or publication is implied.

The player reference is Help & Info → Answer formatting (`/help#formatting`), with stable topic anchors. Test setup and the answer editor link to it. The existing `/help#notation` reference continues to govern authored mathematical content. Question-specific instructions state the required object and domain; a general guide example cannot override them.

## Three separate questions

1. Is this legitimate mathematical notation?
2. Can the editor display and preserve it safely?
3. Can the saved, reviewed question contract justify a grading verdict for it?

Keep those distinctions visible. An unfamiliar but valid identity may be ungraded. Rendering a matrix does not make a scalar question accept a matrix. A rejected command must not be described as mathematically wrong merely because the app does not support it.

## Entry conventions

| Subject | Preferred entry | Avoid or reject | Reason |
|---|---|---|---|
| Exact rational | `1/2`, `2/4`, `0.5` | Rounded `0.333333` for exact `1/3` | Decimals are exact rationals unless an explicit approximation policy applies. |
| Scientific notation | `2*10^{-3}` | `2e-3`, including Unicode-minus variants | In mathematical LaTeX, `e` is Euler's number. |
| Compound fraction | `\frac{x+1}{x-1}` or `(x+1)/(x-1)` | Unclear slash scope | Preserve numerator and denominator grouping. |
| Exponent | `x^{12}`, `x^{-2}` | `x^12`, `x^-2`, `x^2^3` | A TeX exponent consumes one token unless grouped. |
| Leading sign | `-x^2` or `(-x)^2`, as intended | Treating them as equivalent | Exponentiation precedes the leading minus. |
| Natural log | `\ln(x)` | Bare `log(x)` | The site chooses an explicit base-e convention. |
| Other log base | `\ln(x)/\ln(10)` when supported | Silently replacing a based logarithm by `ln(x)` | Preserve the original mathematical base. |
| Functions | `\sin(x)`, `\sqrt{x}` | Bare or incomplete arguments | The source and rendered scope must agree. |
| Inverse trig | `\arcsin(x)` | `\sin^{-1}(x)` | Use explicit inverse names and explicit fractions for reciprocals. |
| Variables | The stated variable, with `\pi` and `e` as constants | Renamed or unexplained variables; assignments | The question fixes the requested object. |
| Any antiderivative | A differentiable primitive, optionally `+C` | A copied integral; a false general-family claim | Derivative equality is required throughout the domain. |
| Ordered answer | `(a,b)` in the requested order | Reversed components or unordered-set notation | Ordering is part of the mathematical contract. |
| Interval | `(0,1]`, `(0,\infty)` | Closed infinite endpoints | Bracket inclusion has mathematical meaning. |
| Outcome | The requested `DNE`, `diverges`, signed infinity or classification | Conflating outcomes; `NaN` | Nonexistence, divergence and signed infinity are distinct. |
| Full response | One final answer | Equality chains, multiple alternatives, prose proofs or code | The initial format grades final mathematical objects only. |

Real principal roots and real logarithm domains apply. Cancellation does not fill a hole. A numerical counterexample can justify inequality only when its enclosure is proved; agreement at sampled points never proves equality. An unresolved smoothness condition is not a proof of nondifferentiability.

The broad palette also includes calculus notation, Greek symbols, matrices, vectors, sets and piecewise notation. Those are editor capabilities. Unordered sets, matrix answers, general solution families and complex branches are not enabled by the current checker merely because a schema or palette names them. Only independently admitted question contracts can enable a route.

## Feedback and progression

`correct` and `incorrect` are mathematical verdicts. `invalid`, `unsupported` and `indeterminate` remain ungraded, keep the draft editable, and do not unlock solutions or add an incorrect answer. A service/rate limit is also not an incorrect verdict. A complete structured interpretation is shown, never just its last component; malformed structured source must not display a partial component as the whole interpretation.

The first graded answer is final. **Skip and review** and **Reveal solution** both finalize neutrally and open the solution. They record attempted exposure without answer XP or a false incorrect answer. Accuracy uses correct/graded; finalized count, skipped count, revealed count and ungraded submission count are separate. They must stay separate from MC accuracy and competitive ratings.

## Editor and recovery

MathLive is pinned to 0.111.4, with local fonts, no Compute Engine and no answer-assistance menu. Configure instance properties using the installed API, and set `menuItems` after mounting. The MathLive component loads only for FR entry.

Preserve raw source independently of MathLive's serialization. Keep a recoverable source backup when switching to visual editing. A safe unsupported expression remains editable as LaTeX. Unsafe input is retained as inert text without preview or execution. Enter does not submit; an explicit button does. Keep draft keys scoped to account, round, exact question revision, content hash, contract hash and response format. Access to the `localStorage` property itself can throw; handle this before invoking storage helpers.

Limits are enforced independently in entry and grading: submitted source 2,048 characters; retained draft 8,192; nesting 32; tokens 768; nodes 384; number digits 64; exponent magnitude 32; expansion terms 256; rational bits 4,096; work budget 50,000; collection entries 16. Large expressions may remain ungraded even inside the source limit. Retained invalid attempts and server submission rates are separately bounded.

## Maintenance requirements

- Add new answer formats only with typed semantics, whole-domain obligations, independent review, canonical and alternative fixtures, wrong-answer fixtures and adversarial limits. A self-declared `referenceVerified` flag is not admission.
- Update the Help guide, task instructions, editor spellings, parser, interpretation display, review, replay and fixtures together when a supported notation changes. Do not normalize source into a different mathematical meaning.
- Run `tests/answer-formatting.test.mjs` against the real checker. Its examples found a missing logarithm-sign proof; do not weaken the example or declare all unsupported expressions incorrect to obtain a passing test.
- Bind independent review to exact source digests. Preserve failed evidence and distinguish foundation probes from admitted-item coverage and hosted runtime evidence.
- Check actual mobile and desktop rendering, deep links, source round trips and recovery. Static constructor or unit tests cannot replace mounting the editor in a real browser.
- Preserve immutable published questions, contracts, histories and replay verdicts. A new rule needs a new version and its own admission; old answers are not silently regraded.

## Reference and permission record

Checked November 4, 2026. These references informed independently written explanations; no textbook passage, illustration or worked example was copied or adapted.

- [Wolfram MathWorld: Natural Logarithm](https://mathworld.wolfram.com/NaturalLogarithm.html): documents differing conventions and uses `ln` for base e. Used as a definition/notation reference and public link; no reproduction license is assumed.
- [Wolfram MathWorld: Inverse Trigonometric Functions](https://mathworld.wolfram.com/InverseTrigonometricFunctions.html): documents accepted inverse names and branch ambiguity. Used as a reference/link; no copied table or illustration.
- [MathLive commands](https://mathlive.io/mathfield/guides/commands/): checked against the installed 0.111.4 source/types for editing and undo/redo. The dependency and local fonts retain their MIT license in `public/mathlive/LICENSE.txt`.

See the source-bound local evidence in `editor-guide-qa-v1.json`, `constant-enclosures-v2.json`, and the independently preserved checker review. None establishes that all 28 FR pools or the complete Study Guide are ready.
