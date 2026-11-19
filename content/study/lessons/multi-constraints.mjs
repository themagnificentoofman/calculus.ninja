const p=text=>({kind:'prose',text}),m=latex=>({kind:'math',latex}),tex=String.raw;
export const multiConstraints={
 id:'multi-constraints',revision:1,title:'Global constrained extrema and quadratic forms',
 summary:'Find feasible candidates, handle active boundaries, and prove global bounds with equality points rather than stopping at multiplier equations.',
 objectives:['Check regularity for one or two equality constraints.','Compare all boundary pieces and verify global attainment.','Use orthogonal coordinates and squares to optimize quadratic forms.'],
 prerequisites:['multi-critical','linear-algebra','inequalities','derivative-shape'],
 sections:[
  {id:'regular-equalities',title:'Regular constraints give necessary equations',body:[
   p(tex`For a continuously differentiable real objective \(f\) and continuously differentiable equality constraints \(g_1=c_1,\ldots,g_k=c_k\) on an open subset of \(\mathbb R^n\), assume \(1\le k\le2\) and \(k<n\) and the gradient vectors \(\nabla g_1(P),\ldots,\nabla g_k(P)\) are linearly independent at a feasible point \(P\). Independence means that a linear combination of those vectors is zero only when all its coefficients are zero. At a local constrained extremum there are real multipliers satisfying`),
   m(tex`\nabla f(P)=\lambda_1\nabla g_1(P)+\cdots+\lambda_k\nabla g_k(P),\qquad g_j(P)=c_j\quad(1\le j\le k).`),
   p(tex`The geometry explains the equations. The regular level-set theorem identifies feasible tangent directions as vectors perpendicular to every constraint gradient. At an extremum, the derivative of \(f\) along each such direction vanishes. Linear algebra then puts \(\nabla f\) in the span of the constraint gradients. The regular level-set conclusion, including the realization of tangent directions by nearby feasible curves, needs the stated independence hypothesis. These equations locate candidates; they do not classify or prove global optimality.`)
  ]},
  {id:'global-and-active',title:'Inequalities introduce boundary pieces and intersections',body:[
   p(tex`For an inequality \(g\le c\), a point is active when \(g=c\), and inactive when \(g<c\). On a region cut out by finitely many elementary smooth boundaries, examine the interior, each boundary piece, their intersections and any singular points. On a boundary arc, a parametrization can reduce the question to one variable, but its endpoints still matter. Never retain a candidate that violates another constraint.`),
   p(tex`A nonempty closed bounded feasible set is compact in \(\mathbb R^n\), so a continuous objective attains a minimum and maximum there. This ensures that a complete candidate comparison has a target. On unbounded or nonclosed sets, use a separate global estimate and exhibit equality or a limiting sequence. This lesson uses direct boundary reasoning; it does not assume a general inequality-multiplier theorem.`)
  ]},
  {id:'quadratic-bounds',title:'Orthogonal coordinates make global quadratic bounds visible',body:[
   p(tex`For a real symmetric matrix \(A\), choose the orthonormal eigenvector basis taught in the linear-algebra bridge. If the coordinates of \(\mathbf x\) in that basis are \(u_i\) and the eigenvalues are \(\lambda_i\), then`),
   m(tex`\mathbf x^{\mathsf T}A\mathbf x=\sum_i\lambda_i u_i^2,\qquad \|\mathbf x\|^2=\sum_i u_i^2.`),
   p(tex`On the sphere \(\|\mathbf x\|=R\) with \(R>0\), each squared coordinate is nonnegative, giving`),m(tex`R^2\lambda_{\min}\le\mathbf x^{\mathsf T}A\mathbf x\le R^2\lambda_{\max}.`),
   p(tex`Equality at the lower or upper bound occurs exactly when the vector lies in the corresponding eigenspace and has length \(R\). Repeated eigenvalues can therefore give infinitely many equality points. This is a global comparison, whereas a Hessian test at one stationary point is a local classification. For two variables, orthogonal substitutions such as \(u=(x+y)/\sqrt2\), \(v=(x-y)/\sqrt2\) often expose the squares without solving a characteristic polynomial.`)
  ]},
  {id:'bound-and-attainment',title:'A bound and a feasible equality point finish the proof',body:[
   p(tex`Cauchy–Schwarz gives \(|\mathbf a\cdot\mathbf x|\le\|\mathbf a\|\|\mathbf x\|\). On a sphere, the parallel and antiparallel vectors attain the two bounds. If a plane constraint removes a direction, first project the coefficient vector onto that plane; the removed component has zero dot product with every feasible vector. This can turn a multiplier calculation into a short bound with an explicit equality condition.`),
   p(tex`A convenient inequality is useful only if its equality point is feasible for every constraint. An extra coordinate cap can exclude the unconstrained optimizer. Then the relevant extremum can move to the cap or to an intersection of boundaries.`)
  ]}
 ],
 worked:[
  {id:'sphere-plane-projection',revision:1,title:'Two constraints and an exact global certificate',problem:[p(tex`Find the global extrema of \(f(x,y,z)=2x-y+2z\) subject to \(x+y+z=0\) and \(x^2+y^2+z^2=6\), including all equality points.`)],solution:[
   p(tex`The feasible set is a nonempty closed circle. The gradients \((1,1,1)\) and \(2(x,y,z)\) are independent there: a feasible sphere vector is nonzero and perpendicular to \((1,1,1)\). The multiplier method is therefore applicable, but projection gives the global result directly.`),
   m(tex`(2,-1,2)=(1,1,1)+(1,-2,1),\qquad f=(1,-2,1)\cdot(x,y,z).`),
   p(tex`Both the projected coefficient vector and every feasible vector have length \(\sqrt6\), so \(-6\le f\le6\). The equality cases in Cauchy–Schwarz are`),m(tex`f_{\max}=6\text{ at }(1,-2,1),\qquad f_{\min}=-6\text{ at }(-1,2,-1).`),
   p(tex`Both points satisfy both constraints. Equality requires parallel or antiparallel vectors of the specified length, so these are all equality points. As a check, the multiplier equations hold with the plane multiplier \(1\) and the sphere multiplier \(1/2\) at the maximum, or \(-1/2\) at the minimum.`)
  ],verification:['Author self-check only: projection, feasibility, equality characterization and multiplier residuals checked.']},
  {id:'ellipse-with-cap',revision:1,title:'A cap excludes the familiar ellipse optimizer',problem:[p(tex`Find the global extrema of \(f(x,y)=xy\) on \(K=\{(x,y):x\ge0,\ y\ge0,\ x^2+4y^2\le4,\ x\le1\}\). State all equality points.`)],solution:[
   p(tex`The feasible set is compact and nonempty. The product is nonnegative, and its minimum zero occurs exactly on the feasible coordinate axes: \((x,0)\) for \(0\le x\le1\), and \((0,y)\) for \(0\le y\le1\). For the maximum, fix \(x\in[0,1]\). Since the product increases with \(y\) when \(x>0\),`),
   m(tex`xy\le H(x)=\frac{x\sqrt{4-x^2}}2,\qquad H'(x)=\frac{2-x^2}{\sqrt{4-x^2}}>0\quad(0\le x\le1).`),
   p(tex`Thus \(H\) is strictly increasing on this interval, and equality in both steps requires \(x=1\) and the upper ellipse boundary:`),m(tex`f_{\max}=\frac{\sqrt3}{2}\text{ at }\left(1,\frac{\sqrt3}{2}\right).`),
   p(tex`Without the cap, the first-quadrant ellipse optimum would have \(x=\sqrt2\), \(y=1/\sqrt2\), which violates \(x\le1\). Solving only the regular ellipse multiplier equations would miss the actual maximum at the intersection with the cap. The one-variable bound includes all boundary and interior points at once.`)
  ],verification:['Author self-check only: derivative, cap feasibility, minimum set and excluded optimizer checked.']}
 ],
 contrast:[
  p(tex`Constraint representation matters. The equation \(g(x,y)=(x^2+y^2-1)^2=0\) describes the unit circle, but \(\nabla g=0\) everywhere on it. For \(f=x\), the maximum is still \(1\) at \((1,0)\), where \(\nabla f=(1,0)\) cannot equal any multiple of \(\nabla g\). Replacing the equation by \(x^2+y^2=1\) restores regularity; it does not change the feasible set.`),
  p(tex`On \(xy=1\), the objective \(x^2\) has infimum zero but no minimum: \((x,y)=(1/t,t)\) is feasible for \(t>0\), and \(x^2\to0\), while \(x=0\) is impossible. A finite multiplier list cannot manufacture attainment on a noncompact set.`)
 ],
 mistakes:[tex`Treating \(\nabla f=\lambda\nabla g\) as sufficient for a maximum.`,tex`Discarding constraint singularities or intersections of active boundaries.`,tex`Using a sharp inequality without checking whether its equality point satisfies every constraint.`,tex`Calling a nonattained infimum a minimum.`],
 exercises:[
  {id:'rotated-quadratic-sphere',revision:1,title:'All equality points for a quadratic form',problem:[p(tex`Find the extrema of \(Q(x,y)=5x^2+4xy+5y^2\) on \(x^2+y^2=9\). Prove that your list of equality points is complete.`)],hints:[
   [p(tex`Use the orthogonal coordinates \(u=(x+y)/\sqrt2\), \(v=(x-y)/\sqrt2\).`)],
   [p(tex`Express both the objective and constraint using \(u^2,v^2\).`)],
   [p(tex`A weighted sum of two nonnegative squares is bounded using its smaller and larger coefficients. Determine when the unused square is zero.`)]
  ],solution:[m(tex`Q=7u^2+3v^2,\qquad u^2+v^2=9,\qquad27\le Q\le63.`),p(tex`The minimum requires \(u=0\), \(v=\pm3\); the maximum requires \(v=0\), \(u=\pm3\). Transforming back gives`),m(tex`Q_{\min}=27\text{ at }\pm\left(\frac3{\sqrt2},-\frac3{\sqrt2}\right),\qquad Q_{\max}=63\text{ at }\pm\left(\frac3{\sqrt2},\frac3{\sqrt2}\right).`),p(tex`The equality conditions force these points and no others. The matrix \(\begin{pmatrix}5&2\\2&5\end{pmatrix}\) has eigenvalues \(7\) and \(3\), agreeing with the orthogonal-coordinate calculation.`)],verification:['Author self-check only: orthogonal identity and all equality points checked.']},
  {id:'unbounded-constraint-attainment',revision:1,title:'A global minimum on a noncompact constraint',problem:[p(tex`Minimize \(x^2+4y^2\) on \(xy=1\), including all minimizers. Is there a global maximum? Explain why noncompactness does not settle the minimum question by itself.`)],hints:[
   [p(tex`Expand \((x-2y)^2\) and use \(xy=1\).`)],
   [p(tex`Equality in the resulting lower bound requires \(x=2y\). Solve this together with the constraint.`)],
   [p(tex`For the maximum question, use feasible points \((t,1/t)\) with \(t>0\).`)]
  ],solution:[m(tex`x^2+4y^2=(x-2y)^2+4xy=(x-2y)^2+4\ge4.`),p(tex`Equality requires \(x=2y\) and \(2y^2=1\), giving exactly \((\sqrt2,1/\sqrt2)\) and \((-\sqrt2,-1/\sqrt2)\). Thus the minimum is attained and equals \(4\), despite the feasible set being unbounded. On \((t,1/t)\), the value \(t^2+4/t^2\) tends to infinity as \(t\to\infty\); there is no maximum. Noncompactness removes the automatic existence guarantee but does not forbid an attained minimum.`)],verification:['Author self-check only: square identity, feasibility and divergent feasible sequence checked.']}
 ],
 alternatives:[p(tex`Use multipliers to discover candidates when the constraint is regular. For certification, try a projection, an orthogonal change of coordinates, completing a square, or a direct one-variable boundary bound. A parametrization is particularly useful when an inequality restricts a curve to an arc with endpoints.`)],
 related:['multi-chain','coordinates','inequalities'],next:['coordinates'],
 readiness:[{lessonId:'multi-critical',exerciseId:'ellipse-boundary-comparison',prompt:'Compare an interior candidate with every regular boundary candidate and verify all equality points.'},{lessonId:'linear-algebra',exerciseId:'quadratic-unit-circle',prompt:'Express the constrained quadratic as weighted squares and identify all equality directions.'}],
 references:[{sourceId:'openstax-calculus-3',url:'https://openstax.org/books/calculus-volume-3/pages/4-8-lagrange-multipliers',use:'reference-only'}],
 review:{status:'draft'},exposureAudit:{status:'pending'}
};
