const p=text=>({kind:'prose',text}),m=latex=>({kind:'math',latex}),tex=String.raw;
export const multiLimits={
 id:'multi-limits',revision:1,title:'Multivariable limits, continuity and differentiability',
 summary:'Use domain-wide bounds to prove limits, curved paths to disprove them, and a first-order remainder test to decide differentiability.',
 objectives:['State a limit relative to its domain and distinguish it from a path limit.','Construct an estimate that controls every nearby point.','Distinguish continuity, partial derivatives, directional derivatives and differentiability.'],
 prerequisites:['limit-foundations','multi-local','linear-algebra','derivative-shape'],
 sections:[
  {id:'domain-and-distance',title:'A limit controls every nearby input in the domain',body:[
   p(tex`For a point \(P=(a,b)\), the Euclidean distance to \(P+\mathbf h=(a+h,b+k)\) is \(\|\mathbf h\|=\sqrt{h^2+k^2}\). Let \(D\subseteq\mathbb R^2\), and suppose \(P\) is an accumulation point of \(D\): every positive-radius disk about \(P\) contains a point of \(D\) different from \(P\). The domain-relative limit \(L\) means that one distance threshold works for every allowed nearby input:`),
   m(tex`\lim_{\substack{X\to P\\X\in D}}f(X)=L\quad\Longleftrightarrow\quad \forall\varepsilon>0\;\exists\delta>0:\quad X\in D,\;0<\|X-P\|<\delta\;\Longrightarrow\;|f(X)-L|<\varepsilon.`),
   p(tex`The value at \(P\) is not used in this punctured limit. At an accumulation point belonging to \(D\), continuity means that this limit equals \(f(P)\). At an isolated domain point, continuity holds automatically by the usual neighborhood definition; a punctured limit there would not determine a unique value. Always preserve the domain when choosing a path or an estimate.`)
  ]},
  {id:'paths-and-bounds',title:'Paths can refute a limit; a common bound can prove it',body:[
   p(tex`If a two-variable limit exists, every continuous path approaching the point through the punctured domain has the same limit. Two such paths with different limiting values therefore disprove the full limit. Agreement on the coordinate axes, or even on every straight line, does not prove existence: a curve can approach a narrow region missed by those tests.`),
   p(tex`To prove a limit, seek a bound involving only the distance \(r=\sqrt{x^2+y^2}\). The inequalities \(|x|\le r\), \(|y|\le r\) and \(2|xy|\le x^2+y^2\) follow respectively from nonnegative squares and \((|x|-|y|)^2\ge0\). If \(|f(x,y)-L|\le Cr^\alpha\) for all allowed points with \(0<r<r_0\), where \(C>0\) and \(\alpha>0\), choose \(\delta=\min\{r_0,(\varepsilon/C)^{1/\alpha}\}\). This proves the limit independently of direction.`),
   p(tex`Polar substitution can reveal such a bound, but letting \(r\to0\) at each fixed angle is still only a family of path tests. An angular factor must be bounded uniformly, meaning by one constant valid for every allowed angle.`)
  ]},
  {id:'linear-remainder',title:'Differentiability requires an error smaller than distance',body:[
   p(tex`For ordinary differentiability here, assume \(f\) is defined on an open neighborhood of \(P\). It is differentiable at \(P\) when there is a linear function of the increment, \(A(h,k)=\alpha h+\beta k\), with a remainder satisfying`),
   m(tex`f(P+\mathbf h)=f(P)+A(\mathbf h)+R(\mathbf h),`),
   m(tex`\lim_{\mathbf h\to\mathbf0}\frac{|R(\mathbf h)|}{\|\mathbf h\|}=0.`),
   p(tex`Taking coordinate increments shows that necessarily \(\alpha=f_x(P)\) and \(\beta=f_y(P)\). Thus the partial derivatives supply the only possible linear approximation, but the all-direction remainder condition still needs proof. Differentiability implies continuity because both the linear term and the remainder tend to zero. It also implies \(D_{\mathbf u}f(P)=\nabla f(P)\cdot\mathbf u\) for every unit direction. Existence of the separate directional limits does not establish this linear dependence or the remainder condition.`)
  ]},
  {id:'continuous-partials',title:'Continuous partial derivatives give a sufficient test',body:[
   p(tex`A convenient sufficient condition is that both first partial derivatives exist in an open neighborhood of \(P\) and are continuous at \(P\). To see the mechanism, split the change into a horizontal step at height \(b+k\) and a vertical step at \(x=a\). The one-variable mean-value theorem writes each change as its step length times the corresponding partial derivative at an intermediate point. Subtracting \(f_x(P)h+f_y(P)k\) leaves`),
   m(tex`|R(h,k)|\le |h|\,|f_x(P_1)-f_x(P)|+|k|\,|f_y(P_2)-f_y(P)|,\qquad P_1,P_2\to P.`),
   p(tex`For sufficiently small increments the two derivative differences are each less than any prescribed \(\eta>0\). Since \(|h|+|k|\le\sqrt2\|\mathbf h\|\), the remainder ratio is at most \(\sqrt2\eta\). This proves differentiability. It is a sufficient test, not a necessary condition: the direct remainder test can succeed even when this shortcut is inconvenient or inapplicable.`)
  ]}
 ],
 worked:[
  {id:'narrow-curved-ridge',revision:1,title:'Every straight line misses a narrow curved band',problem:[p(tex`Define \(f(0,y)=0\) for every real \(y\), and, for \(x\ne0\), define \(f(x,y)=\max\{0,1-|y-x^2|/x^4\}\). Determine the limits along every straight line through the origin and along \(y=x^2\). Is \(f\) continuous at the origin?`)],solution:[
   p(tex`The function is defined on the whole plane. For each nonzero \(x\), it can be positive only in the thin band \(|y-x^2|<x^4\). On the horizontal line, \(|y-x^2|/x^4=1/x^2>1\) when \(0<|x|<1\), so the maximum defining \(f\) is zero. On a line \(y=cx\) with fixed \(c\ne0\),`),m(tex`\frac{|cx-x^2|}{x^4}=\frac{|c-x|}{|x|^3}\ge\frac{|c|}{2|x|^3}\longrightarrow\infty\qquad\left(0<|x|<\frac{|c|}{2}\right).`),
   p(tex`Consequently \(f(x,cx)=0\) for all sufficiently small nonzero \(x\), although the required threshold can depend on \(c\). The vertical line is zero by definition. These exhaust all straight lines through the origin. Along the center of the band, however,`),m(tex`f(x,x^2)=1\qquad(x\ne0).`),
   p(tex`The horizontal and parabolic paths have different limits, zero and one. Therefore the unrestricted limit does not exist and \(f(0,0)=0\) does not make the function continuous. Every directional derivative at the origin is nevertheless zero: on each fixed line, the function is exactly zero in some interval about the origin. The interval may shrink with direction, so these separate derivatives do not provide a uniform approximation.`)
  ],verification:['Author self-check only: eventual-zero line argument and nonzero parabolic path derived; independent review and exposure comparison pending.']},
  {id:'quadratic-small-remainder',revision:1,title:'A distance bound proves differentiability',problem:[p(tex`Let \(g(0,0)=0\), and otherwise let \(g(x,y)=x^2y^2/(x^2+y^2)\). Prove differentiability at the origin and identify its derivative.`)],solution:[
   p(tex`Both coordinate slices vanish, so the only possible linear derivative is zero. Squaring \(2|xy|\le x^2+y^2\) gives the stronger estimate needed for the remainder:`),m(tex`0\le g(x,y)\le\frac{(x^2+y^2)^2}{4(x^2+y^2)}=\frac{r^2}{4}.`),
   m(tex`\frac{|g(x,y)-g(0,0)-0|}{r}\le\frac r4\longrightarrow0.`),p(tex`This is the definition of differentiability, with derivative \(A(h,k)=0\). The estimate also proves continuity. Showing only \(g\to0\) would have proved continuity, a weaker conclusion; dividing the remainder by distance is the extra step.`)
  ],verification:['Author self-check only: square inequality and distance-normalized remainder verified.']}
 ],
 contrast:[p(tex`The first worked function has both partial derivatives and every directional derivative equal to zero at the origin, because its restriction to every line is zero in a sufficiently small interval about the origin. It is still discontinuous there. Separate one-dimensional derivatives do not provide one uniform first-order approximation. Conversely, a failed sufficient test is not by itself a proof of nondifferentiability: examine the actual remainder.`)],
 mistakes:[tex`Treating agreement on \(x=0\) and \(y=0\) as an all-path proof.`,tex`Using a path that leaves the function's stated domain.`,tex`Confusing \(R\to0\) with the stronger requirement \(|R|/\|\mathbf h\|\to0\).`,tex`Applying the gradient formula for directional derivatives before differentiability has been established.`],
 exercises:[
  {id:'continuous-not-linear',revision:1,title:'Continuity without a linear derivative',problem:[p(tex`Let \(h(0,0)=0\), and \(h(x,y)=x^2y/(x^2+y^2)\) otherwise. Prove continuity at the origin, compute the coordinate partial derivatives there, and decide differentiability.`)],hints:[
   [p(tex`Use \(2|xy|\le x^2+y^2\) to bound \(|h|\) by a multiple of \(r\).`)],
   [p(tex`Both coordinate slices are zero. If a derivative exists, which linear function must it be?`)],
   [p(tex`On \((x,y)=(t,t)\), compare \(|h(t,t)|\) with the distance \(\sqrt2|t|\).`)]
  ],solution:[m(tex`|h(x,y)|=|x|\frac{|xy|}{x^2+y^2}\le\frac{|x|}{2}\le\frac r2\longrightarrow0.`),p(tex`Thus \(h\) is continuous. Both coordinate partial derivatives are zero, so differentiability would require derivative zero. But`),m(tex`h(t,t)=\frac t2,\qquad\frac{|h(t,t)|}{\sqrt2|t|}=\frac1{2\sqrt2}\qquad(t\ne0).`),p(tex`The ratio does not tend to zero, so \(h\) is not differentiable. More generally, for a fixed nonzero direction \((a,b)\), its derivative along \(t(a,b)\) is \(a^2b/(a^2+b^2)\). These derivatives exist but do not depend linearly on the direction.`)],verification:['Author self-check only: bound, coordinate derivatives and failing remainder path checked.']},
  {id:'domain-cusp-limit',revision:1,title:'The domain changes the limit question',problem:[p(tex`On \(D=\{(x,y):|y|\le x^2\}\setminus\{(0,0)\}\), consider \(q(x,y)=xy/(x^2+y^2)\). Find its domain-relative limit at the origin. Compare it with the unrestricted punctured-plane limit.`)],hints:[
   [p(tex`A point of \(D\) cannot have \(x=0\). Bound the denominator below by \(x^2\).`)],
   [p(tex`Combine \(|q|\le |y|/|x|\) with the domain restriction.`)],
   [p(tex`For the unrestricted question, compare \(y=0\) and \(y=x\). Explain why the latter is unavailable near zero in \(D\).`)]
  ],solution:[m(tex`|q(x,y)|\le\frac{|y|}{|x|}\le |x|\le\sqrt{x^2+y^2}\longrightarrow0\qquad((x,y)\in D).`),p(tex`The origin is an accumulation point of \(D\), for example along its punctured horizontal axis, so this proves the relative limit zero. In the punctured plane, \(q(x,0)=0\) but \(q(x,x)=1/2\), so no unrestricted limit exists. For \(0<|x|<1\), the diagonal violates \(|x|\le x^2\); it cannot refute the limit on \(D\). This relative limit is not a claim of ordinary differentiability on an open neighborhood.`)],verification:['Author self-check only: domain bound and excluded diagonal checked.']}
 ],
 alternatives:[p(tex`Start with algebra and distance inequalities when they produce one estimate for all directions. Search for curved paths when numerator and denominator balance at different powers. Use continuous partial derivatives for smooth formulas; use the remainder definition at a patched or singular formula. These approaches answer different questions and can check one another.`)],
 related:['multi-chain','analysis','standard-limits'],next:['multi-chain'],
 readiness:[{lessonId:'limit-foundations',exerciseId:'conjugate-limit',prompt:'Explain why the cancelled formula is valid on the punctured domain and how that proves the limit.'}],
 references:[{sourceId:'openstax-calculus-3',url:'https://openstax.org/books/calculus-volume-3/pages/4-2-limits-and-continuity',use:'reference-only'},{sourceId:'openstax-calculus-3',url:'https://openstax.org/books/calculus-volume-3/pages/4-4-tangent-planes-and-linear-approximations',use:'reference-only'}],
 review:{status:'draft'},exposureAudit:{status:'pending'}
};
