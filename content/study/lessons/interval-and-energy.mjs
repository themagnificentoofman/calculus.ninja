// Original, unpublished replacement lessons. Reviewed references are background reading.
const p = text => ({kind: 'prose', text});
const m = latex => ({kind: 'math', latex});
const t = String.raw;
const revision = 20261118;
const reference = (sourceId, url) => ({sourceId, url, use: 'reference-only'});

export const spectral = {
  id: 'spectral', revision: 2026111802, title: 'Zero-slope interval modes and endpoint compatibility',
  summary: 'Use endpoint data to decide when a constant is an allowed mode, find the positive zero-slope frequencies, and test when a forcing fits two endpoint differences.',
  objectives: [
    'Distinguish homogeneous conditions, which select modes, from prescribed endpoint differences, which can make a forcing incompatible.',
    'Derive the sign of an eigenvalue by integration by parts and treat zero separately.',
    'Find the first positive eigenvalue and distinguish it from a possible zero eigenvalue.'
  ],
  prerequisites: ['boundary-data', 'parts'],
  readiness: [
    {lessonId: 'boundary-data', exerciseId: 'frequency-compatibility', prompt: 'Fit both endpoint values and handle the zero-frequency family separately.'},
    {lessonId: 'parts', exerciseId: 'twice-trigonometric', prompt: 'Track the boundary term and sign when moving a derivative in an integral.'}
  ],
  sections: [
    {id: 'allowed-parameters', title: 'Which parameters allow motion?', body: [
      p(t`On a finite interval \([a,b]\) of length \(L=b-a>0\), look for a real twice continuously differentiable function \(u\) satisfying`),
      m(t`-u''(x)=\lambda u(x),\qquad a<x<b.`),
      p(t`The zero function satisfies every homogeneous boundary condition for every real \(\lambda\). An eigenfunction must be nonzero somewhere. An eigenvalue is a value of \(\lambda\) for which such a function satisfies both endpoint conditions. Multiplying an eigenfunction by any nonzero constant gives another with the same eigenvalue.`),
      p(t`Here the main homogeneous conditions prescribe zero slope at both endpoints. At zero frequency, any constant function satisfies them. Nonzero endpoint differences lead to a different problem: a prescribed jump of the derivative can constrain the total forcing across the interval.`)
    ]},
    {id: 'boundary-energy', title: 'Read the sign from the endpoint term', body: [
      p(t`Multiply the equation by \(u\) and integrate over the whole interval. One integration by parts gives`),
      m(t`\lambda\int_a^b u^2\,\mathrm{d}x=\int_a^b (u')^2\,\mathrm{d}x-[u u']_a^b.`),
      p(t`When both endpoint derivatives vanish, each endpoint product vanishes. The integral \(\int_a^b u^2\,\mathrm{d}x\) is positive, because a continuous nonzero function is nonzero throughout some subinterval. Hence \(\lambda\geq 0\). When \(\lambda=0\), continuity and the zero integral of the square force \(u'=0\) everywhere. If a mean value is prescribed as well, check it on this constant before looking for oscillations.`),
      p(t`A different boundary condition can leave a nonzero endpoint term. For instance, \(u(x)=e^x\) satisfies \(u'=u\) at both ends and \(-u''=-u\). The sign conclusion depends on the boundary conditions.`)
    ]},
    {id: 'frequency-selection', title: 'Select frequencies using the second endpoint', body: [
      p(t`For a positive eigenvalue write \(k=\sqrt{\lambda}>0\). Measure distance from the left endpoint so that the two independent solutions take especially simple values there. The complete family is`),
      m(t`u(x)=A\cos(k(x-a))+B\sin(k(x-a)).`),
      p(t`A zero slope at the left endpoint eliminates the sine coefficient, since the derivative there is \(Bk\). For the surviving cosine, impose the right derivative condition and then square each admissible positive \(k\) to get an eigenvalue. The zero-parameter equation has its own affine family before applying the endpoints.`)
    ]}
  ],
  worked: [{
    id: 'coupled-endpoint-jumps', revision: 2026111802, title: 'Which forcing fits two prescribed endpoint jumps?',
    problem: [
      p(t`A real \(C^2\) function on \([0,2]\) satisfies \(-u''(x)=x-c\), where \(c\) is a real constant. Suppose its endpoint values and slopes obey`),
      m(t`u(2)-u(0)=1,\qquad u'(2)-u'(0)=2.`),
      p(t`Find all admissible \(c\) and all corresponding functions. Do the two endpoint differences determine one curve?`)
    ],
    solution: [
      p(t`Integrate the equation across the interval before choosing either initial value. The measured slope jump fixes the left-hand side, so`),
      m(t`-2=-u'(2)+u'(0)=\int_0^2(x-c)\,\mathrm{d}x=2-2c.`),
      p(t`Thus \(c=2\) is necessary. To test sufficiency, integrate \(u''=2-x\) twice. This gives`),
      m(t`u'(x)=2x-\frac{x^2}{2}+A,\qquad u(x)=x^2-\frac{x^3}{6}+Ax+B.`),
      p(t`The displacement jump equals \(8/3+2A\), which must be 1. Hence \(A=-5/6\), while \(B\) is any real constant. Every one of these curves has the required second derivative, slope jump 2 and value jump 1. Integrating twice supplied every possible solution. Adding a constant shifts both endpoint values equally and preserves both conditions, so uniqueness fails.`)
    ], verification: ['Author check: integrate the forcing, verify both endpoint differences, the residual, and the additive constant family.']
  }],
  mistakes: [
    'Treating zero slope as zero function value.',
    'Dividing by the frequency and losing the constant solution.',
    'Reporting a frequency where the equation asks for its square.'
  ],
  contrast: [p(t`In the zero-slope eigenvalue problem the forcing is \(\lambda u\), so its integral can say something about the mean of the unknown function. With a prescribed forcing and a specified slope jump, the same integration checks the forcing itself. A condition on a difference between endpoint values alone leaves the absolute height undetermined.`)],
  exercises: [{
    id: 'zero-slope-spectrum', revision, title: 'Find the modes with zero endpoint slopes',
    problem: [p(t`A real \(C^2\) function on \([-1,2]\) satisfies \(-u''=\lambda u\) with \(u'(-1)=u'(2)=0\). Determine every real eigenvalue and the nonzero functions in each eigenspace. Then impose the extra condition \(\int_{-1}^{2}u(x)\,\mathrm{d}x=0\). Which modes survive, and what is the smallest surviving eigenvalue?`)],
    hints: [
      [p(t`Use the integral identity to decide whether negative \(\lambda\) can occur. Test the affine family separately when \(\lambda=0\).`)],
      [p(t`For a positive frequency, measure \(x+1\) from the left. Differentiate the complete sine/cosine family and use the left endpoint before the right.`)],
      [p(t`After the left condition, the right derivative is a constant multiple of \(\sin(3k)\). For any positive eigenvalue, integrate the original equation once and use both endpoint derivatives to test the mean.`)]
    ],
    solution: [
      p(t`Both derivative conditions kill the boundary products, so \(\lambda\int u^2=\int (u')^2\geq0\), with the integrals over \([-1,2]\). At \(\lambda=0\), the derivative of an affine solution is constant; the left condition makes this derivative zero. Every nonzero constant satisfies both endpoints.`),
      p(t`For \(k>0\), the derivative at \(-1\) of \(A\cos(k(x+1))+B\sin(k(x+1))\) is \(Bk\), hence \(B=0\). Since \(A\ne0\), the other endpoint requires \(\sin(3k)=0\). The complete list is`),
      m(t`\lambda_0=0,\quad u_0(x)=A;\qquad \lambda_n=\left(\frac{n\pi}{3}\right)^2,\quad u_n(x)=A\cos\left(\frac{n\pi(x+1)}{3}\right),\quad n=1,2,\ldots,`),
      p(t`where \(A\) is any nonzero real constant. Direct differentiation verifies each listed solution. The complete positive-frequency family and the nonnegative energy identity leave no other real eigenvalues.`),
      p(t`Integrating the equation gives \(\lambda\int_{-1}^{2}u=-u'(2)+u'(-1)=0\). Every positive mode therefore has zero mean. The integral of the constant mode is \(3A\ne0\). Exactly the positive modes survive, and the smallest remaining eigenvalue is \(\pi^2/9\).`)
    ], verification: ['Author check: recover each endpoint derivative and the first positive frequency; integrate each shifted cosine over its full interval.']
  }],
  alternatives: [p(t`One could solve exponential or hyperbolic families for every negative \(\lambda\). The boundary identity settles all of them at once. It also explains why removing the mean changes this smallest-eigenvalue question. A completeness theorem for infinite expansions is a separate question.`)],
  related: ['fourier-orthogonality', 'ode-energy'], next: ['fourier-orthogonality'],
  references: [
    reference('diffyqs', 'https://www.jirka.org/diffyqs/html/sec_ccsol.html'),
    reference('active-single', 'https://activecalculus.org/single/sec-5-4-parts.html')
  ], review: {status: 'draft'}, exposureAudit: {status: 'pending'}
};

export const variational = {
  id: 'variational', revision, title: 'Least derivative energy with endpoint and area constraints',
  summary: 'Construct a curve with the required data and compare its energy to that of every admissible competitor using an exact square.',
  objectives: [
    'Translate endpoint and signed-area constraints into conditions on the difference between two curves.',
    'Choose a candidate whose cross term vanishes for every allowed difference.',
    'Prove attainment and uniqueness using the remaining nonnegative square.'
  ],
  prerequisites: ['parts', 'inequalities'],
  readiness: [
    {lessonId: 'parts', exerciseId: 'twice-trigonometric', prompt: 'Account for the boundary term when moving a derivative.'},
    {lessonId: 'inequalities', exerciseId: 'fixed-sum-product', prompt: 'Use a nonnegative square and decide whether the equality case belongs to the allowed set.'}
  ],
  sections: [
    {id: 'competitor-difference', title: 'Subtract one feasible curve from another', body: [
      p(t`Choose a real \(C^1\) curve on a finite closed interval \([a,b]\), \(a<b\). For a positive continuous weight \(w\), its derivative energy is`),
      m(t`E(u)=\int_a^b w(x)\,u'(x)^2\,\mathrm{d}x.`),
      p(t`The variables here are whole curves. To compare a candidate \(q\) with every allowed \(u\), put \(h=u-q\). If both curves satisfy the same endpoint values, \(h(a)=h(b)=0\). If both have the same prescribed signed integral, their difference also satisfies \(\int_a^b h=0\). Verify the candidate itself meets every constraint before making this subtraction.`)
    ]},
    {id: 'energy-difference', title: 'Make the cross term vanish', body: [
      m(t`E(q+h)-E(q)=2\int_a^b wq'h'\,\mathrm{d}x+\int_a^b w(h')^2\,\mathrm{d}x.`),
      p(t`With just the fixed endpoints, choose \(q\) so that \(wq'\) is constant. Then the first integral is a constant times \(h(b)-h(a)=0\). With one extra prescribed area, it is enough for \(wq'\) to be affine in \(x\). For a continuously differentiable flux \(wq'\), integration by parts yields`),
      m(t`\int_a^b wq'h'\,\mathrm{d}x=[wq'h]_a^b-\int_a^b (wq')'h\,\mathrm{d}x.`),
      p(t`The endpoint term is zero. If \((wq')'\) is constant, the last term vanishes by the signed-area condition. This gives a way to construct a minimizer, followed by a proof that works for every allowed curve.`)
    ]},
    {id: 'attainment-and-uniqueness', title: 'Use the remaining square to prove uniqueness', body: [
      p(t`Once the cross term vanishes, every admissible curve has energy at least \(E(q)\). The candidate attains that value. Equality forces \(h'=0\) throughout: if the continuous function \(h'\) were nonzero anywhere, the positive continuous weight would give a positive integral on a nearby subinterval. Then \(h\) is constant and \(h(a)=0\) makes it vanish. Hence the candidate is the unique minimizer.`),
      p(t`For unit weight and fixed endpoints only, the linear interpolant has constant slope. If an additional area differs from the area under that chord, the chord is infeasible. Adjust it by a quadratic that vanishes at both endpoints; the difference in area determines its coefficient.`)
    ]}
  ],
  worked: [{
    id: 'weighted-bridge', revision, title: 'Spend less slope where a slope costs more',
    problem: [p(t`Among all real \(C^1\) curves on \([0,1]\) with \(u(0)=0\) and \(u(1)=1\), minimize \(\int_0^1(1+x)^2u'(x)^2\,\mathrm{d}x\). Find the minimizing curve and show why no other curve ties it.`)],
    solution: [
      p(t`Seek a constant flux \((1+x)^2 q'=c\). Integration with \(q(0)=0\) gives \(q(x)=cx/(1+x)\); the right endpoint forces \(c=2\). Its slope falls from 2 to one half as the weight grows.`),
      m(t`E(q)=4\int_0^1\frac{dx}{(1+x)^2}=2.`),
      p(t`For a competitor write \(h=u-q\), with both endpoint values zero. The cross term is \(4\int_0^1 h'=0\). The remaining energy difference is \(\int_0^1(1+x)^2(h')^2\geq0\), with equality only for \(h\equiv0\). The displayed curve achieves the minimum of 2.`)
    ], verification: ['Author check: differentiate the rational candidate, integrate its energy exactly, and expand the square against every feasible difference.']
  }],
  contrast: [p(t`A stationary candidate must still meet the data. For fixed endpoints \(u(0)=0,u(1)=1\), the linear function \(u=x\) minimizes the unweighted slope energy, yet for the weight \((1+x)^2\) it has energy \(7/3\), larger than the weighted minimum. The weight changes the minimizing shape.`)],
  mistakes: ['Dropping a boundary term before checking the endpoint conditions on the difference.', 'Treating signed area as an integral of the absolute value.', 'Checking only small perturbations and assuming global minimality.'],
  exercises: [{
    id: 'prescribed-area-energy', revision, title: 'Find the least energy with a prescribed area',
    problem: [p(t`Among real \(C^1\) functions on \([-1,1]\) with \(u(-1)=0\), \(u(1)=2\) and \(\int_{-1}^{1}u(x)\,\mathrm{d}x=0\), minimize \(\int_{-1}^{1}(u')^2\,\mathrm{d}x\). Find the curve and its energy, and prove uniqueness. Values of \(u\) may have either sign.`)],
    hints: [
      [p(t`The chord \(1+x\) fits the endpoints. Compute its signed integral. Which quadratic vanishes at both endpoints and can adjust that integral?`)],
      [p(t`Try \(q=1+x+c(1-x^2)\). The quadratic bump has integral \(4/3\). After fitting \(c\) to the area, the difference \(h=u-q\) for any feasible competitor has zero endpoint values and zero integral.`)],
      [p(t`Expand the energy of \(q+h\). Move the derivative from \(h'\) to \(q'\) in the cross term. What do the constant \(q''\) and the zero integral of \(h\) imply?`)]
    ],
    solution: [
      p(t`The chord has integral 2. The endpoints do not change when \(c(1-x^2)\) is added, and zero signed integral requires \(2+4c/3=0\), giving \(c=-3/2\). Thus`),
      m(t`q(x)=1+x-\frac32(1-x^2),\qquad q'(x)=1+3x,\qquad q''(x)=3.`),
      p(t`The candidate has both required endpoint values and zero integral. Expanding \((1+3x)^2\) and integrating gives \(E(q)=2+0+6=8\). Every admissible competitor is \(q+h\) with \(h(-1)=h(1)=0\) and \(\int_{-1}^{1}h=0\), so`),
      m(t`\int_{-1}^{1}q'h'\,\mathrm{d}x=[q'h]_{-1}^{1}-3\int_{-1}^{1}h\,\mathrm{d}x=0.`),
      p(t`Consequently \(E(q+h)=8+\int_{-1}^{1}(h')^2\,\mathrm{d}x\). This is a global comparison. Equality forces \(h'\equiv0\) by continuity, and \(h(-1)=0\) then forces \(h\equiv0\). The unique minimum is 8, attained by \(q\).`)
    ], verification: ['Author check: integrate the endpoint-preserving quadratic and its squared derivative symbolically; the two homogeneous constraints make the cross term vanish.']
  }],
  alternatives: [p(t`Another proof uses Cauchy–Schwarz with a function that represents the constraint. The square expansion keeps the full equality condition visible even with fixed endpoints and a separate area constraint. Here it relies on linear constraints and a positive quadratic energy.`)],
  related: ['multi-constraints', 'ode-energy'], next: ['multi-constraints'],
  references: [
    reference('active-single', 'https://activecalculus.org/single/sec-5-4-parts.html'),
    reference('mathworld', 'https://mathworld.wolfram.com/SchwarzsInequality.html')
  ], review: {status: 'draft'}, exposureAudit: {status: 'pending'}
};

export const extremalLessons = [spectral, variational];

