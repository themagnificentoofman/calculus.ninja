const p = text => ({kind: 'prose', text});
const m = latex => ({kind: 'math', latex});
const t = String.raw;
const revision = 20261118;

export default {
  id: 'fourier-transforms', revision:2026111802,
  title: 'Fourier transforms of even integrable functions',
  summary: 'Use symmetry to compute a continuous range of frequencies. Check absolute convergence, the value at zero, and the effect of shifting a pulse.',
  objectives: [
    'Choose the angular-frequency convention and prove the reduction to a real cosine integral for an even real input.',
    'Recover the zero-frequency value directly and justify continuity from an integrable tail.',
    'Predict how the width or position of a pulse changes its transform.'
  ],
  prerequisites: ['complex','improper'],
  sections: [
    {id:'whole-line-transform',title:'Choose the convention and control both tails',body:[
      p(t`Let \(f\) be a real or complex function which is piecewise continuous on every finite interval, with \(\int_{-\infty}^{\infty}|f(x)|\,\mathrm dx<\infty\). At a real angular frequency \(\omega\), use the convention`),
      m(t`\widehat f(\omega)=\int_{-\infty}^{\infty} f(x)e^{-i\omega x}\,\mathrm dx.`),
      p(t`Here \(i^2=-1\); the real and imaginary parts of the integral are ordinary integrals. Because the exponential has magnitude one, both tails converge absolutely and \(|\widehat f(\omega)|\le\int_{-\infty}^{\infty}|f(x)|\,\mathrm dx\). The input extends over the real line. A periodic Fourier coefficient instead integrates over one period and uses discrete frequencies.`)
    ]},
    {id:'even-real-input',title:'Use parity before integrating',body:[
      p(t`Euler’s identity separates \(e^{-i\omega x}\) into \(\cos(\omega x)-i\sin(\omega x)\). If \(f(-x)=f(x)\) and \(f\) is real, the sine part is odd and absolutely integrable, so its two tails cancel. The cosine part is even and real. Therefore`),
      m(t`\widehat f(\omega)=2\int_0^\infty f(x)\cos(\omega x)\,\mathrm dx,\qquad \widehat f(-\omega)=\widehat f(\omega).`),
      p(t`The output is real even if \(f\) changes sign. At zero the exponential is one, so the transform gives the signed area of \(f\). An expression with a denominator containing \(\omega\) needs a separate value at zero.`)
    ]},
    {id:'continuity-and-shifts',title:'Control frequency changes and spatial shifts',body:[
      p(t`For real \(h\), the chord bound \(|e^{-ihx}-1|\le\min(2,|hx|)\) follows from the triangle inequality and integration of the unit-speed complex exponential along its angle. On \([-R,R]\) the bound is at most \(|h|R\). Outside it the bound is at most two. Thus`),
      m(t`|\widehat f(\omega+h)-\widehat f(\omega)|\le |h|R\int_{-R}^{R}|f(x)|\,\mathrm dx+2\int_{|x|>R}|f(x)|\,\mathrm dx.`),
      p(t`First choose \(R>0\) so the tail is small, then choose \(|h|\) so the finite-interval term is small. This proves continuity at every frequency using absolute integrability alone.`),
      p(t`If \(q(x)=f(x-b)\) for a real displacement \(b\), substitution of \(u=x-b\) gives \(\widehat q(\omega)=e^{-i\omega b}\widehat f(\omega)\). Absolute convergence justifies translating the cutoff limits. A shift by itself can make the transform complex. For two equal copies shifted in opposite directions, the factors add to \(2\cos(b\omega)\).`)
    ]}
  ],
  worked:[{
    id:'flat-pulse-frequency-zeros',revision,title:'Width and frequency zeros for a flat pulse',
    problem:[p(t`A signal is three on \([-2,2]\) and zero elsewhere. Compute its transform at every real frequency. Where is the first positive zero, and how does doubling the width at fixed height move it?`)],
    solution:[
      p(t`The compactly supported signal is real and even. For \(\omega\ne0\), integrate the cosine up to the positive endpoint; at zero use area.`),
      m(t`\widehat f(\omega)=\frac{6\sin(2\omega)}{\omega}\quad(\omega\ne0),\qquad \widehat f(0)=12.`),
      p(t`The first positive zero is \(\pi/2\). Doubling the width extends the interval to \([-4,4]\), so the new numerator is \(6\sin(4\omega)\) and the first positive zero is \(\pi/4\). For the wider signal the same number of oscillations fits at half the frequency.`)
    ],
    verification:['The limit at zero is height times width. The factor of two from the negative half of the pulse is needed to recover that area.']
  }],
  contrast:[
    p(t`An odd function can have zero integral on every symmetric interval even when the ordinary whole-line integral does not exist. For example, \(x/(1+x^2)\) has a divergent integral over the positive half-line. Symmetric cancellation cannot supply the omitted absolute-convergence check in this lesson.`)
  ],
  mistakes:[
    'Mixing an angular-frequency formula with a cycles-per-unit convention containing an extra factor of two pi.',
    'Substituting zero into a divided formula and forgetting to integrate the original signal there.',
    'Doubling a half-line complex integral before checking what happens to the sine part.',
    'Assuming that translating an even pulse away from the origin leaves it even about zero.'
  ],
  exercises:[{
    id:'compact-cosine-window-resonances',revision:2026111802,title:'Which frequencies disappear when two cosine windows overlap?',
    problem:[
      p(t`Let \(h(x)=\cos x+\cos(2x)\) for \(-\pi\le x\le\pi\) and \(h(x)=0\) elsewhere. Find its whole-line Fourier transform at every real angular frequency, including zero and any frequencies where a divided formula breaks down. Then form \(s(x)=h(x-\pi/4)+h(x+\pi/4)\). Determine every real zero of \(\widehat s\) and prove that your list is complete.`)
    ],
    hints:[
      [p(t`The interval and the signal are symmetric. In the cosine integral, write each product of cosines as a sum before evaluating its endpoints.`)],
      [p(t`For \(k=1,2\), compare the integrals with frequencies \(\omega-k\) and \(\omega+k\). When one of these frequencies is zero, use the integral of the constant function directly.`)],
      [p(t`The two translations contribute a cosine factor in frequency. Check its zeros against the exceptional frequencies of the single-window formula.`)]
    ],
    solution:[
      p(t`The real, even window is bounded and compactly supported. The sine part of its transform integrates to zero. For \(k=1,2\), apply \(2\cos(kx)\cos(\omega x)=\cos((\omega-k)x)+\cos((\omega+k)x)\) and integrate on \([0,\pi]\). The whole-line contribution from the \(k\)th cosine is`),
      m(t`\frac{\sin(\pi(\omega-k))}{\omega-k}+\frac{\sin(\pi(\omega+k))}{\omega+k}.`),
      p(t`Each quotient with a zero denominator stands for \(\int_0^\pi 1\,\mathrm dx=\pi\). Away from \(\omega=\pm1,\pm2\), the sine numerators for \(k=1\) equal \(-\sin(\pi\omega)\), and those for \(k=2\) equal \(\sin(\pi\omega)\). Adding and simplifying gives`),
      m(t`\widehat h(\omega)=2\omega\sin(\pi\omega)\left(\frac{1}{\omega^2-4}-\frac{1}{\omega^2-1}\right)=\frac{6\omega\sin(\pi\omega)}{(\omega^2-4)(\omega^2-1)}.`),
      p(t`At \(\omega=0\), the signed integral of each cosine over \([-\pi,\pi]\) vanishes. At each of \(\pm1,\pm2\), exactly one quotient from the matching cosine has frequency zero and contributes \(\pi\); every other term is zero. Hence \(\widehat h\) equals \(\pi\) at all four exceptional frequencies. Its zeros are the integers other than those four: away from them the numerator vanishes exactly when \(\omega\) is an integer.`),
      p(t`Translation gives \(\widehat s(\omega)=2\cos(\pi\omega/4)\widehat h(\omega)\), regardless of the overlap in the original variable. The extra factor vanishes exactly at \(2+4j\) for integers \(j\). Those frequencies include \(2\) and \(-2\) but exclude \(1\) and \(-1\). Thus the complete zero set is`),
      m(t`\{\omega:\widehat s(\omega)=0\}=\mathbb Z\setminus\{-1,1\}.`),
      p(t`Indeed, the product is nonzero for every noninteger frequency, and its value is \(\sqrt{2}\pi\) at each of the two remaining integers.`)
    ],
    verification:['Orthogonality over a full period gives the same values at the four removable resonances. Translating a compact signal preserves its signed integral, so the pair also has transform zero at frequency zero.']
  }],
  alternatives:[p(t`At an integer frequency, integrating a cosine window against a matching mode can be simpler than taking a limit of a divided formula. Check the original frequency integral whenever a quotient is undefined. Fourier inversion and convergence of transforms for conditionally integrable inputs require additional hypotheses.`)],
  related:['fourier-orthogonality','parameter-integrals','ode-laplace'], next:['fourier-orthogonality'],
  readiness:[
    {lessonId:'trig',exerciseId:'trig-sign-interval',prompt:'Use the angle interval to recover the correct signs of the trigonometric values.'},
    {lessonId:'improper',exerciseId:'double-pole-no-rescue',prompt:'Check separate improper limits before treating a cancellation as a valid integral.'}
  ],
  references:[
    {sourceId:'active-single',url:'https://activecalculus.org/single/sec-6-5-improper.html',use:'reference-only'},
    {sourceId:'mathworld',url:'https://mathworld.wolfram.com/TrigonometricFunctions.html',use:'reference-only'}
  ],
  review:{status:'draft'}, exposureAudit:{status:'pending'}
};
