const p=text=>({kind:'prose',text}),m=latex=>({kind:'math',latex}),tex=String.raw;
export const boundaryDataLesson={
 id:'boundary-data',revision:1,title:'Two-point boundary conditions for second-order equations',
 summary:'Fit conditions at different endpoints to a complete solution family and distinguish a unique solution, incompatible data and a free family.',
 objectives:['Separate two initial values at one point from values prescribed at two different points.','Build and solve the actual two-by-two endpoint coefficient system.','Identify singular boundary systems without confusing them with dependent homogeneous modes.','Verify the equation and both endpoint conditions, including zero-parameter and resonance cases.'],
 prerequisites:['second-order-ode','trig'],
 readiness:[{lessonId:'second-order-ode',exerciseId:'off-frequency-response',prompt:'Find a particular response and retain the complete homogeneous family.'},{lessonId:'second-order-ode',exerciseId:'repeated-homogeneous-mode',prompt:'Use two independent modes and verify the resulting differential equation.'}],
 sections:[
 {id:'initial-versus-boundary',title:'Two values at one point and values at two points are different data',body:[
  p(tex`Consider a linear equation \(y''+ay'+by=f(t)\) on an interval containing the finite endpoints \(\alpha<\beta\), with real constant coefficients and continuous forcing. A classical solution has the required derivatives and satisfies the equation throughout the interval. Two initial values \(y(t_0)\) and \(y'(t_0)\) determine a unique solution under these regularity hypotheses. In this lesson, instead, values of \(y\) are prescribed at two different points:`),m(tex`y(\alpha)=A,\qquad y(\beta)=B.`),
  p(tex`These are two-point boundary conditions. The derivative at the first endpoint is not supplied. There may be exactly one solution, no solution or infinitely many. Initial-value uniqueness does not decide which outcome occurs; the boundary conditions impose a different algebraic system on the solution family.`),
  p(tex`The examples use constant coefficients, whose complete solution families are already taught in the prerequisite. No general variable-coefficient construction or numerical shooting method is introduced here.`)
 ]},
 {id:'endpoint-system',title:'Evaluate the full family at both endpoints',body:[
  p(tex`Let \(y_p\) be one particular solution, and let \(u,v\) be two independent homogeneous solutions forming a complete family on the interval. Every solution is \(y=y_p+C_1u+C_2v\). Substituting both endpoint conditions gives`),m(tex`\begin{aligned}u(\alpha)C_1+v(\alpha)C_2&=A-y_p(\alpha),\\u(\beta)C_1+v(\beta)C_2&=B-y_p(\beta).\end{aligned}`),
  p(tex`This is an ordinary pair of linear equations. Define its determinant by`),m(tex`\Delta=u(\alpha)v(\beta)-v(\alpha)u(\beta).`),
  p(tex`If \(\Delta\ne0\), elimination produces one pair of constants, hence one solution. If \(\Delta=0\), inspect the right-hand sides: inconsistent equations give no solution; consistent equations leave at least one free constant and hence infinitely many distinct solutions. Independence of \(u,v\) ensures different constant pairs give different functions. No spectral matrix theory is needed for this two-by-two test.`),
  p(tex`The boundary determinant uses values at different points. It is not the same as the value-and-derivative determinant at one point used for an initial-value problem. Independent modes can have identical or proportional endpoint-value columns and thus a singular boundary system.`)
 ]},
 {id:'zero-modes-and-checks',title:'Retain exceptional parameters and verify both kinds of condition',body:[
  p(tex`A nonzero homogeneous solution that vanishes at both endpoints is a boundary zero mode. Adding any multiple of it to one boundary solution produces another solution with the same endpoint data. Its presence explains nonuniqueness, but incompatible forcing or boundary data may instead produce no solution at all.`),
  p(tex`A formula obtained by dividing by a parameter or by a sine factor is valid only where that divisor is nonzero. Treat a zero-frequency equation directly rather than assuming a trigonometric family with a vanishing frequency still consists of two independent modes. At zero frequency, the independent modes for \(y''=0\) are 1 and \(t\), not two copies of a constant.`),
  p(tex`For every proposed result, compute the differential-equation residual and both boundary values. A boundary fit alone does not prove the equation, and a correct general solution alone does not ensure compatible endpoint data. We do not infer convergence, stability, smallest eigenvalues or orthogonality identities from this finite algebra.`)
 ]}
 ],
 worked:[
 {id:'two-exponential-endpoints',revision:1,title:'A nonsingular endpoint system',problem:[
  p(tex`Find all real solutions of \(y''-y=0\) on \([0,\ln2]\) with \(y(0)=3\) and \(y(\ln2)=3\). Verify the equation and endpoints, and explain why the unspecified initial derivative is determined by these boundary data.`)
 ],solution:[
  p(tex`The two independent modes are \(e^t\) and \(e^{-t}\), so \(y=C_1e^t+C_2e^{-t}\). The endpoint equations are`),m(tex`C_1+C_2=3,\qquad2C_1+\frac12C_2=3.`),
  p(tex`The determinant is \(1/2-2=-3/2\ne0\). Doubling the second equation and subtracting the first gives \(3C_1=3\), hence \(C_1=1\) and \(C_2=2\). Therefore`),m(tex`y(t)=e^t+2e^{-t}.`),
  p(tex`Its second derivative equals itself, so the residual is zero. Its values are \(1+2=3\) at zero and \(2+2(1/2)=3\) at \(\ln2\). Its derivative at zero is \(1-2=-1\), which was not prescribed but is forced by the unique endpoint coefficient pair. The solution is smooth on the entire real axis, in particular on the requested interval.`)
 ],verification:['Author self-check: exact endpoint determinant and linear-system solution; differential residual, both endpoint values and initial derivative.']},
 {id:'singular-sine-endpoints',revision:1,title:'The same independent modes give either no solution or many',problem:[
  p(tex`Consider \(y''+y=0\) on \([0,\pi]\), with \(y(0)=2\) and \(y(\pi)=b\), where \(b\) is a real number. Classify every value of \(b\) and give all solutions when they exist. Explain why this does not contradict uniqueness for initial values.`)
 ],solution:[
  p(tex`The full family is \(y=C_1\cos t+C_2\sin t\). The first endpoint gives \(C_1=2\). At the other endpoint, the sine term vanishes and the cosine term gives`),m(tex`y(\pi)=-C_1=-2.`),
  p(tex`If \(b\ne-2\), the boundary conditions are incompatible and there is no solution. If \(b=-2\), the coefficient \(C_2\) is arbitrary, giving`),m(tex`y(t)=2\cos t+C_2\sin t,\qquad C_2\in\mathbb R.`),
  p(tex`All these functions satisfy the differential equation and endpoints. Their initial derivatives are \(y'(0)=C_2\), which vary with the free constant. Each fixed pair of initial value and initial derivative still has exactly one solution. The two-point data simply do not specify that derivative here. The nonzero mode \(\sin t\) vanishes at both endpoints, explaining why it can be added freely.`)
 ],verification:['Author self-check: independent sine/cosine modes, singular endpoint matrix, compatibility condition and free initial derivative.']}
 ],
 contrast:[p(tex`Independence of two solution functions does not guarantee an invertible endpoint-value matrix. In the sine example the value-and-derivative data at zero distinguish the modes, while their values at 0 and \(\pi\) do not.`),p(tex`A singular boundary system does not always mean infinitely many solutions. The right-hand side must be compatible first; otherwise there are none.`),p(tex`The existence of a zero mode is a structural observation. This lesson does not prove a general Fredholm alternative, a Sturm–Liouville spectrum theorem or the smallest positive spectral parameter for arbitrary boundary types.`)],
 mistakes:[tex`Applying initial-value uniqueness to two values prescribed at different points.`,tex`Discarding the homogeneous part when a particular solution is easy to find.`,tex`Dividing by a sine or parameter without treating its zeros separately.`,tex`Calling every singular endpoint system nonunique without checking compatibility.`,tex`Verifying the boundary values but not the differential equation, or vice versa.`],
 exercises:[
 {id:'forced-endpoint-fit',revision:1,title:'Fitting a forced equation at two endpoints',problem:[
  p(tex`Find all real solutions of`),m(tex`y''+4y=4,\qquad0\le t\le\frac\pi4,\qquad y(0)=0,\qquad y(\pi/4)=3.`),
  p(tex`State whether the boundary solution is unique and verify the equation and both endpoint values. Do not replace either boundary value by an initial derivative.`)
 ],hints:[
  [p(tex`A constant particular solution is available. The homogeneous modes have angular frequency 2.`)],
  [m(tex`y(t)=1+C_1\cos(2t)+C_2\sin(2t).`),p(tex`Evaluate this family at zero and at \(\pi/4\), where the trigonometric angle is \(\pi/2\).`)],
  [p(tex`The first condition gives \(C_1=-1\); the second then gives \(C_2=2\). Check the remaining homogeneous constants are fully determined.`)]
 ],solution:[
  p(tex`The constant function 1 is a particular solution, and the complete homogeneous family is \(C_1\cos(2t)+C_2\sin(2t)\). The two endpoint equations are \(1+C_1=0\) and \(1+C_2=3\). Hence there is exactly one solution:`),m(tex`y(t)=1-\cos(2t)+2\sin(2t).`),
  p(tex`Its second derivative is \(4\cos(2t)-8\sin(2t)\); adding four times the function leaves 4. At zero its value is 0, and at \(\pi/4\) its value is 3. The homogeneous endpoint matrix is the identity, so the coefficient pair is unique. As a separate check, its initial derivative is 4, which is determined by the boundary fit rather than supplied as data.`)
 ],verification:['Author self-check: full forced family, identity endpoint matrix, differential residual, endpoints and derivative at zero.']},
 {id:'frequency-compatibility',revision:1,title:'Boundary solvability across a frequency parameter',problem:[
  p(tex`Let \(\omega\ge0\) and \(b\in\mathbb R\). Classify all real solutions on \([0,1]\) of`),m(tex`y''+\omega^2y=0,\qquad y(0)=0,\qquad y(1)=b.`),
  p(tex`Include the zero-frequency case, state exactly when the solution is unique, absent or nonunique, and give the complete solution in every solvable case.`)
 ],hints:[
  [p(tex`At zero frequency, solve \(y''=0\) directly. For positive frequency use the sine/cosine family, then apply the left endpoint first.`)],
  [m(tex`\omega>0:\qquad y(t)=C\sin(\omega t),\qquad C\sin\omega=b.`)],
  [p(tex`Separate \(\sin\omega\ne0\) from \(\sin\omega=0\). In the latter case, compatibility depends on whether \(b=0\); positive zeros occur at \(\omega=n\pi\) for positive integers \(n\).`)]
 ],solution:[
  p(tex`If \(\omega=0\), the family is \(A+Ct\). The boundary conditions force \(A=0\) and \(C=b\), so \(y(t)=bt\) is the unique solution for every real \(b\). This case must not be discarded by division by frequency.`),
  p(tex`For \(\omega>0\), the two independent modes are \(\cos(\omega t)\) and \(\sin(\omega t)\). The left endpoint eliminates the cosine coefficient. If \(\sin\omega\ne0\), the right endpoint determines one coefficient, giving`),m(tex`y(t)=\frac{b\sin(\omega t)}{\sin\omega}.`),
  p(tex`If \(\omega=n\pi\) for a positive integer \(n\), then \(\sin\omega=0\). For \(b\ne0\), there is no solution. For \(b=0\), every function`),m(tex`y(t)=C\sin(n\pi t),\qquad C\in\mathbb R,`),
  p(tex`is a solution, and these are all of them. Distinct constants give distinct functions because the sine mode is not identically zero. Each stated family has zero differential residual and the required endpoint values. No conclusion about negative spectral parameters is claimed: the parameter in this problem is explicitly the nonnegative frequency \(\omega\).`)
 ],verification:['Author self-check: separate the affine zero-frequency family, solve the positive-frequency endpoint system, and verify all compatibility cases and residuals.']}
 ],
 alternatives:[p(tex`For these constant-coefficient equations, exact endpoint elimination is simpler than numerical shooting. Evaluating the complete family at both endpoints exposes the singular cases immediately.`),p(tex`This is a Medium boundary-data bridge. It prepares for Hard parameter and spectral questions, but derivative/Robin boundary conditions, general forcing compatibility identities, variable coefficients and eigenvalue ordering remain separate topics.`)],
 related:['existence-uniqueness','ode-variation','ode-energy'],next:['ode-variation','ode-energy'],
 references:[{sourceId:'openstax-calculus-3',url:'https://openstax.org/books/calculus-volume-3/pages/7-1-second-order-linear-equations',use:'reference-only'}],review:{status:'draft'},exposureAudit:{status:'pending'}
};
