const use=(tier,concept,role,explanation,...anchors)=>({tier,topic:'series',concept,role,explanation,anchors});
export const seriesTierUse={
 'convergence-tests':[
  use('easy','tests','core','State the necessary term condition and derive the p-series threshold. The later comparison, ratio, root and alternating tests prepare the Medium topics.','objects','integral'),
  use('medium','tests','core','Choose among comparisons, ratio, root, integral and alternating tests, checking positivity, monotonicity and inconclusive cases.','comparison','ratio-root','alternating','example-nested-log-integral','exercise-factorial-in-two-positions'),
  use('hard','operations','foundation','Use absolute convergence and explicit positive majorants as preparation for later operations on infinite sums. Conditional rearrangements and general termwise operations need their own justification.','objects','comparison','ratio-root'),
  use('olympiad','parameters','foundation','Specify ordinary convergence and verify the test hypotheses before attempting an advanced parameter or special-function identity. Those identities are not derived in this lesson.','objects','comparison','integral'),
 ],
 'series-errors':[
  use('easy','partial-sums','extension','Extend partial-sum indexing to a precisely defined omitted tail. The quantitative integral and alternating bounds go beyond basic geometric and telescoping sums.','tail'),
  use('medium','errors','core','Find an exact cutoff guaranteed by a theorem, keep the first omitted index and distinguish a bound from the actual error.','alternating-bound','positive-bounds','example-alternating-cutoff-count','example-positive-integral-enclosure'),
  use('hard','uniform','foundation','Construct a bound valid for every term of one omitted tail before studying domain-wide uniform convergence. A parameter-uniform estimate still needs additional proof.','positive-bounds','exercise-factorial-geometric-tail'),
  use('olympiad','coefficients','foundation','Prepare finite truncation and certified error control for later coefficient asymptotics. This lesson does not derive sharp asymptotic constants or advanced coefficient formulas.','tail','positive-bounds'),
 ],
 'power-series':[
  use('easy','partial-sums','extension','Continue from a geometric series to a variable center and convergence interval. Radius and endpoint tests are part of the Medium expectations.','radius'),
  use('medium','power','core','Find the radius, test both endpoints, and justify when a Taylor or Maclaurin series represents its function.','radius','taylor-equality','example-shifted-log-endpoints','exercise-weighted-geometric-center'),
  use('hard','operations','core','Use compact-interval control before integrating or differentiating a power series, and check endpoints again after the operation. General rearrangement theorems are separate.','inside','example-gapped-powers-integral','boundary-cases'),
  use('olympiad','coefficients','foundation','Distinguish formal coefficient matching from an analytic representation on a justified domain before nonroutine coefficient extraction. Inversion and special-function identities require further instruction.','inside','taylor-equality'),
 ],
 'summation-parts':[
  use('medium','power','extension','Use an Abel boundary limit to evaluate an endpoint only after ordinary convergence is established. This extends the basic radius-and-endpoint analysis.','abel-boundary','example-abel-nonzero-weight'),
  use('hard','summation','core','Derive finite summation by parts with its boundary term, then apply Dirichlet and Abel tests with explicit cancellation and tail bounds.','finite-identity','dirichlet','abel-test','example-three-term-cancellation','exercise-quarter-turn-log-weight'),
  use('olympiad','parameters','foundation','Separate ordinary sums from Abel limits and keep the summation convention explicit. Moving-parameter uniform estimates, special-function identities and other summability methods need additional arguments.','dirichlet','abel-boundary','boundary-cases'),
 ],
};
