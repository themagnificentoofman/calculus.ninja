const p = text => ({kind: 'prose', text});
const m = latex => ({kind: 'math', latex});
const t = String.raw;
const revision = 20261118;

export default {
  id: 'nonuniform',
  revision,
  title: 'Boundary layers, rescaling and limits of integrals',
  summary: 'A graph can shrink to zero at every fixed point while keeping almost all its area in a narrowing strip. Locate that strip and measure what survives.',
  objectives: [
    'Use a moving point to distinguish uniform from pointwise convergence.',
    'Choose a new horizontal scale and account for both the height and the width of a peak.',
    'Split an integral near the endpoint to prove a weighted limit.'
  ],
  prerequisites: ['analysis', 'substitution', 'parts'],
  sections: [
    {id: 'locate-the-layer', title: 'Locate the scale that moves with the peak', body: [
      p(t`Suppose a graph on \([0,1]\) contains a factor \(1+nx\) or \(e^{-nx}\). For each fixed \(x>0\), the quantity \(nx\) eventually grows large. At the moving point \(x=1/n\), it stays equal to one. Test both kinds of point, and check \(x=0\) separately.`),
      p(t`A boundary layer is a region next to an endpoint on a shrinking horizontal scale where the graph behaves differently from its values farther away. To see that scale, set \(u=nx\). A profile observed at a fixed \(u\) corresponds to \(x=u/n\) in the original picture.`),
      p(t`If \(f_n\) tends pointwise to zero, uniform convergence requires \(\sup_{0\le x\le1}|f_n(x)|\to0\). A sequence \(x_n\) on which the values stay large disproves this. Every individual \(f_n\) can still be continuous.`)
    ]},
    {id: 'width-times-height', title: 'Carry the width into the area', body: [
      p(t`For a continuous profile \(\phi\) on \([0,\infty)\), substitute \(u=nx\) before passing to a limit. If \(A_n\) is a height factor, the exact area is`),
      m(t`\int_0^1 A_n\phi(nx)\,\mathrm dx=\frac{A_n}{n}\int_0^n\phi(u)\,\mathrm du.`),
      p(t`When the improper integral of \(|\phi|\) is finite, the integral on the right approaches a finite number. A height of order \(n\) can offset the width \(1/n\). With a fixed height the same rescaling forces the absolute area to zero. Without tail control, these conclusions do not follow from the change of variable alone.`)
    ]},
    {id: 'weighted-observation', title: 'Split off the mass far from the endpoint', body: [
      p(t`Let \(f_n\ge0\) on \([0,1]\), with \(\int_0^1 f_n(x)\,\mathrm dx\to M<\infty\). Suppose that for every fixed \(0<\delta<1\), \(\int_\delta^1 f_n(x)\,\mathrm dx\to0\). A continuous weight \(g\) changes little near zero. After subtracting \(g(0)\) times the total mass, the triangle inequality gives`),
      m(t`\left|\int_0^1 (g(x)-g(0))f_n(x)\,\mathrm dx\right|\le\sup_{0\le x\le\delta}|g(x)-g(0)|\int_0^1 f_n(x)\,\mathrm dx+2\sup_{0\le x\le1}|g(x)|\int_\delta^1 f_n(x)\,\mathrm dx.`),
      p(t`The total masses are bounded because they converge. Given a target error, first choose \(\delta\) so the first term is small by continuity, then choose \(n\) so the second is small by the tail hypothesis. Consequently the weighted integrals tend to \(M g(0)\). This reasoning uses nonnegative mass; for signed graphs the corresponding bounds must control absolute areas.`)
    ]}
  ],
  worked: [{
    id: 'exponential-layer-area', revision, title: 'A pointwise-zero graph with limiting area one',
    problem: [p(t`For positive integers \(n\), consider \(f_n(x)=n^2 x e^{-nx}\) on \([0,1]\). Find the pointwise limit, locate the maximum and compute the limiting area.`)],
    solution: [
      p(t`At zero every value is zero. At a fixed \(x>0\), the exponential dominates \(n^2\), so the limit is again zero. Differentiating in \(x\) gives \(n^2 e^{-nx}(1-nx)\). The maximum occurs at \(1/n\), including the endpoint when \(n=1\), and equals \(n/e\). This moving peak rules out uniform convergence.`),
      m(t`\int_0^1 n^2 x e^{-nx}\,\mathrm dx=\int_0^n u e^{-u}\,\mathrm du=1-(n+1)e^{-n}\longrightarrow1.`),
      p(t`Integration by parts gives the middle evaluation. For any fixed \(\delta>0\) within the interval, the area from \(\delta\) to one is at most \((1+n\delta)e^{-n\delta}\), the integral of \(u e^{-u}\) from \(n\delta\) to infinity. The area therefore concentrates at the left endpoint.`)
    ],
    verification: ['The original function vanishes at zero and the peak belongs to the stated closed interval for every positive integer. Differentiating the integral expression with respect to its rescaled upper limit recovers the positive profile.']
  }],
  contrast: [
    p(t`Set \(h_n(x)=nx e^{-nx}\). It has the same moving maximum location and its peak height stays \(1/e\), so it also fails to converge uniformly to zero. Its area is the previous area divided by \(n\), which tends to zero. Nonuniformity alone does not decide the integral limit.`)
  ],
  mistakes: [
    'Checking the limit only at fixed positive inputs and overlooking a peak whose location moves.',
    'Keeping the rescaled height while dropping the Jacobian factor from the horizontal change of variable.',
    'Using a shrinking neighborhood in a tail estimate that was proved only for each fixed neighborhood.'
  ],
  exercises: [{
    id: 'rational-layer-mass', revision, title: 'Find the area in a rational boundary layer',
    problem: [
      p(t`Let \(r_n(x)=2n^2x/(1+nx)^3\) for \(0\le x\le1\) and positive integers \(n\). Find the pointwise limit. For each fixed \(c>0\), compute the limiting area in \([0,c/n]\), using \(n\ge c\), and find the limiting area of the whole graph. For every continuous real \(g\) on \([0,1]\), determine the limit of the integral of \(g(x)r_n(x)\). Justify which part of the interval supplies that limit.`)
    ],
    hints: [
      [p(t`Compare a fixed \(x>0\) with the moving point \(1/n\). Which substitution holds the size of \(1+nx\) fixed?`)],
      [p(t`After rescaling, differentiate the square of \(u/(1+u)\). Its endpoint values record the area before and after a cutoff.`)],
      [p(t`Split at a fixed \(\delta>0\). Bound the weighted error near zero using continuity of \(g\), and bound the remaining mass by subtracting two cumulative areas.`)]
    ],
    solution: [
      p(t`At \(x=0\), \(r_n(0)=0\). For fixed \(x>0\), \(0\le r_n(x)\le2/(nx^2)\to0\). Yet \(r_n(1/n)=n/4\). The moving strip cannot be discarded from an area calculation.`),
      m(t`\int_0^b r_n(x)\,\mathrm dx=\int_0^{nb}\frac{2u}{(1+u)^3}\,\mathrm du=\left(\frac{nb}{1+nb}\right)^2 \qquad(0\le b\le1).`),
      p(t`The area through \(c/n\) equals \(c^2/(1+c)^2\) for every integer \(n\ge c\); the full area tends to one. In particular the strip through \(1/n\) carries one quarter, while any fixed interval \([0,\delta]\) with \(\delta>0\) eventually carries a proportion tending to one.`),
      p(t`To weight the graph, fix \(0<\delta<1\). The mass on \([\delta,1]\) is the difference between the displayed cumulative areas at \(b=1\) and \(b=\delta\); both tend to one. The total mass is bounded by one. Thus the weighted-observation estimate bounds the limiting error by \(\sup_{0\le x\le\delta}|g(x)-g(0)|\). Taking \(\delta\) down to zero gives \(\int_0^1 g(x)r_n(x)\,\mathrm dx\to g(0)\).`)
    ],
    verification: ['Differentiating the cumulative area gives the original density in the original coordinate. A constant weight recovers the full limiting mass, and a weight supported away from zero gives zero in the limit.']
  }],
  alternatives: [p(t`Sometimes estimating the area inside and outside a short interval suffices even when an antiderivative is unavailable. Choose the split to isolate the peak, then prove each bound with its quantifiers in the right order.`)],
  related: ['improper','parameter-integrals'], next: ['parameter-integrals'],
  readiness: [{lessonId:'analysis',exerciseId:'unbounded-domain',prompt:'Compare uniform control on a bounded interval with the failure of uniform convergence on the whole nonnegative half-line.'}],
  references: [
    {sourceId:'mathworld',url:'https://mathworld.wolfram.com/UniformConvergence.html',use:'reference-only'},
    {sourceId:'active-single',url:'https://activecalculus.org/single/sec-5-3-substitution.html',use:'reference-only'}
  ],
  review:{status:'draft'}, exposureAudit:{status:'pending'}
};
