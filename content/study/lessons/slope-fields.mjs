const p=text=>({kind:'prose',text}),m=latex=>({kind:'math',latex}),tex=String.raw;
export const slopeFieldsLesson={
 id:'slope-fields',revision:2,title:'Reading slope fields and equilibrium solutions',
 summary:'Translate a first-order equation into local line slopes, distinguish a zero-slope locus from a solution, and check equilibria across an interval.',
 objectives:['Construct exact slope segments on labeled coordinate axes.','Interpret the local sign of a solution slope without confusing it with a function value.','Distinguish autonomous fields, zero-slope loci and constant equilibrium solutions.','Verify an entire candidate curve and state what a finite collection of arrows cannot establish.'],
 prerequisites:['functions','derivative-meaning'],
 readiness:[{lessonId:'derivative-meaning',exerciseId:'reciprocal-rate',prompt:'Distinguish a function value from its derivative and use both to specify a tangent line.'}],
 sections:[
 {id:'field-and-axes',title:'An equation assigns a slope at each permitted point',body:[
  p(tex`For \(y'=F(t,y)\), the independent variable \(t\) is horizontal and the dependent variable \(y\) is vertical. At a permitted point \((t_0,y_0)\), a short line segment with slope \(F(t_0,y_0)\) represents the tangent direction required of any differentiable solution through that point. The number is a slope, not a height or a finite displacement.`),
  m(tex`y-y_0=F(t_0,y_0)(t-t_0).`),
  p(tex`To sketch a segment, choose a small horizontal change \(h\) and the vertical change \(F(t_0,y_0)h\). Equal-looking lengths are optional; the rise-to-run ratio must be correct in the coordinate units. If the axes have different display scales, a visual angle alone is not the numerical slope. A field defined by a formula applies at every point of its stated domain, even when only a finite grid is drawn.`),
  p(tex`For a solution \(y(t)\), the equation must hold at every input of its solution interval. An initial point selects a location the curve must pass through; it does not by itself prove that a solution exists, is unique, or continues forever. Those questions require additional hypotheses.`)
 ]},
 {id:'autonomous-and-equilibrium',title:'Constant solutions must satisfy the equation for every time',body:[
  p(tex`An autonomous equation has the form \(y'=g(y)\): its slope depends only on height, so every point on one horizontal row has the same slope. Where \(g(y)>0\), a solution at that height has positive instantaneous slope; where \(g(y)<0\), it has negative instantaneous slope.`),
  p(tex`A constant equilibrium solution \(y(t)=c\) has derivative zero. For a general time-dependent field, it is an equilibrium on an interval precisely when \(F(t,c)=0\) for every time in that interval. For an autonomous field this reduces to \(g(c)=0\).`),
  m(tex`y(t)=c\text{ is a solution on }I\quad\Longleftrightarrow\quad F(t,c)=0\text{ for all }t\in I.`),
  p(tex`The zero-slope locus is the set of points where \(F(t,y)=0\), sometimes called a nullcline. It shows where a solution would have a horizontal tangent. The locus itself need not be a solution curve: if it is described by \(y=z(t)\), its own derivative must also equal \(F(t,z(t))\).`)
 ]},
 {id:'local-and-global',title:'A few matching arrows do not verify a whole solution',body:[
  p(tex`A proposed curve \(y=z(t)\) is a solution only if it is differentiable, stays in the domain, and its residual \(z'(t)-F(t,z(t))\) vanishes throughout the interval. Agreement at one point, or at every point in a finite grid, is insufficient. Two different formulas may produce identical values on a finite grid while differing between grid points.`),
  p(tex`A tangent segment approximates a curve locally; extending that straight segment for a finite time does not generally produce an exact solution. Nor does a horizontal arrow at one point imply a constant solution. We use exact formulas and residual checks below; no existence, uniqueness, no-crossing or numerical-error theorem is inferred from a picture.`),
  p(tex`Only derivatives of constants, affine functions and one quadratic are needed in this lesson. For completeness, the constant derivative is zero and an affine function \(at+b\) has derivative \(a\) directly from its difference quotient. The quadratic calculation is`),m(tex`\frac{(t+h)^2-t^2}{h}=2t+h\longrightarrow2t\qquad(h\to0,\ h\ne0).`)
 ]}
 ],
 worked:[
 {id:'constant-rows',revision:2,title:'Reading horizontal rows in an autonomous field',problem:[
  p(tex`Consider \(y'=2-y\) on the whole real coordinate plane. Construct the slope grid at horizontal coordinates \(t=-1,0,1\) and vertical coordinates \(y=0,2,4\). Sketch a short segment at each grid point. Find every constant equilibrium and describe the signs of solution slopes below and above it.`)
 ],solution:[
  p(tex`Substitute the vertical coordinate into \(2-y\). Every column has the same values because time does not appear in the formula. In this table, row labels are heights and column labels are times; each interior entry is a slope, not a height.`),m(tex`\begin{array}{c|rrr}y\backslash t&-1&0&1\\\hline4&-2&-2&-2\\2&0&0&0\\0&2&2&2\end{array}`),
  p(tex`At height 0 draw upward-sloping segments of slope 2; at height 2 draw horizontal segments; at height 4 draw downward-sloping segments of slope \(-2\). The only constant equilibrium is \(y(t)=2\), because a constant \(c\) requires \(0=2-c\). For \(y<2\), the slope is positive; for \(y>2\), it is negative.`),
  {kind:'diagram',id:'constant-slope-rows'},
  p(tex`These statements describe the instantaneous direction at each location. The field alone has not proved that a nonconstant solution approaches 2 for all future time, or that it never crosses the equilibrium. Such global or uniqueness conclusions would require additional arguments. The constant curve itself is verified directly: its derivative is zero and the right side at height 2 is zero for every time.`)
 ],verification:['Author self-check: all nine grid entries and their row invariance; constant-solution residual and slope signs on both height intervals.']},
 {id:'slanted-zero-locus',revision:1,title:'A zero-slope line that is not a solution',problem:[
  p(tex`For \(y'=t-y\) on the whole plane, find the zero-slope locus. Determine whether that locus, viewed as a graph, is a solution. Test the different curve \(y=t-1\), and decide whether any constant equilibrium exists on a nondegenerate time interval.`)
 ],solution:[
  p(tex`The zero-slope equation is \(t-y=0\), so its locus is the line \(y=t\). But this line has derivative 1 while the right-hand side on it is zero. Its residual is 1, so it is not a solution even though every point on it has a horizontal field segment.`),
  p(tex`For the different line \(y=t-1\), its derivative is 1 and the right-hand side is \(t-(t-1)=1\). Thus it is a solution on the whole real time axis. At the point \((0,-1)\), its tangent has slope 1, agreeing with the field. At the point \((0,0)\), a hypothetical solution would instead have slope 0, unlike the line \(y=t\).`),
  p(tex`A constant \(y=c\) would require \(0=t-c\) at every time of its interval. A single fixed \(c\) cannot equal every time in an interval of positive length. Therefore this time-dependent equation has no constant equilibrium on such an interval.`)
 ],verification:['Author self-check: exact residuals of the two affine curves; a constant value cannot satisfy t−c identically on a nondegenerate interval.']}
 ],
 contrast:[p(tex`An autonomous field has equal slopes across each horizontal row, but a finite row sample does not prove that an unknown field is autonomous everywhere. That conclusion follows from a specified formula or a valid general argument.`),p(tex`A field can have a single horizontal segment. For \(y'=(t-1)^2+(y+1)^2\), both squares vanish only at \((1,-1)\). Along the constant line \(y=-1\) the required slope is \((t-1)^2\), positive at every other time. A solution through that point has a horizontal tangent there, but the whole horizontal line fails the equation.`),p(tex`No finite-slope segment is assigned where the equation's right side is undefined. A singular formula such as \(1/y\) excludes the row \(y=0\); drawing an arbitrary arrow there would change the equation.`)],
 mistakes:[tex`Reading a table entry as a value of the solution rather than its slope.`,tex`Confusing a zero-slope locus with an integral curve.`,tex`Verifying a residual only at the initial point or only at drawn grid points.`,tex`Inferring existence, uniqueness, a no-crossing rule or global behavior from local arrows alone.`],
 exercises:[
 {id:'choose-the-compatible-field',revision:1,title:'A finite grid and three candidate equations',problem:[
  p(tex`The following table gives exact field slopes at the stated grid points, with time along the columns and height along the rows:`),m(tex`\begin{array}{c|rrr}y\backslash t&-1&0&1\\\hline1&-3&-2&-1\\0&-1&0&1\\-1&1&2&3\end{array}`),
  p(tex`Exactly one of these three specified formulas agrees with every entry: \(F_1(t,y)=t-2y\), \(F_2(t,y)=t^2-2y\), \(F_3(t,y)=2-y\). Identify it and sketch the listed segments. For that equation, give the tangent line required of a solution through \((1,1)\), decide whether \(y=t/2\) is itself a solution, and find any constant equilibria on an interval of positive length. Explain why the finite table would not determine a unique formula if these three candidates had not been supplied.`)
 ],hints:[
  [p(tex`The row \(y=0\) distinguishes the three formulas immediately. Then verify the other rows rather than relying on one coincidence.`)],
  [p(tex`At \((1,1)\), use the table value as a tangent slope. On the candidate line \(y=t/2\), compare its own derivative with the right-hand side of the selected equation.`)],
  [p(tex`The selected field is \(t-2y\). A constant height \(c\) would require \(t-2c=0\) for every time. To see why a finite grid is insufficient in general, add a nonzero term that vanishes at all three sampled times.`)]
 ],solution:[
  p(tex`At height zero the entries are \(-1,0,1\), agreeing with \(F_1(t,0)=t\). The second candidate gives \(1,0,1\), and the third gives \(2,2,2\). For each other row, \(t-2y\) gives the displayed entries, so the compatible candidate is \(F_1\).`),
  p(tex`The slope at \((1,1)\) is \(-1\), so the required tangent line is`),m(tex`y-1=-(t-1),\qquad y=2-t.`),
  p(tex`The line \(y=t/2\) lies in the zero-slope locus, but has derivative \(1/2\), while \(t-2(t/2)=0\). It is not a solution. No constant equilibrium exists on a time interval of positive length, because \(t-2c\) cannot vanish for every time there.`),
  p(tex`Without the candidate restriction, the finite data would also match the distinct field \(t-2y+t(t-1)(t+1)\), since its added term vanishes at all three sampled times. This exact counterexample shows why a finite table does not identify an arbitrary field between or beyond its sample columns.`)
 ],verification:['Author self-check: evaluate all three candidate grids, verify the tangent point/slope and compute the candidate-line residual.','Author self-check: the added cubic term vanishes at −1,0,1 but is not identically zero.']},
 {id:'horizontal-at-one-time',revision:1,title:'All slopes vanish at one time',problem:[
  p(tex`For \(y'=t(y-1)\), consider the time interval \([-1,1]\). Describe the slope signs in the regions determined by \(t=0\) and \(y=1\), and find all constant equilibrium solutions. Two proposed curves through \((0,1)\) are \(z_1(t)=1\) and \(z_2(t)=1+t^2\). Decide which satisfy the equation on the interval. Both have the required tangent at time zero; explain why that does not settle the question.`)
 ],hints:[
  [p(tex`The sign is the product of the signs of \(t\) and \(y-1\). For a constant solution, the product must be zero at every time, not only at zero.`)],
  [p(tex`For each proposed curve compute \(z'(t)-t(z(t)-1)\). The quadratic derivative is \(2t\).`)],
  [m(tex`z_2'(t)-t(z_2(t)-1)=2t-t^3=t(2-t^2).`),p(tex`Test this identity at a nonzero time inside the interval, such as \(t=1/2\).`)]
 ],solution:[
  p(tex`For \(t>0\), slopes are positive above height 1 and negative below it. For \(t<0\), these signs reverse. Slopes are zero on both \(t=0\) and \(y=1\). A constant \(c\) is a solution throughout the interval only if \(t(c-1)=0\) for all times, which forces \(c=1\).`),
  p(tex`The first candidate has derivative zero and right side zero, so \(z_1\) is an equilibrium solution. The second has derivative \(2t\) and right side \(t^3\). Its residual is \(t(2-t^2)\), which equals \(7/8\) at \(t=1/2\), so it fails the equation on the interval.`),
  p(tex`At time zero, both candidate derivatives equal zero and both right sides equal zero. That single tangent match is necessary but not sufficient for a solution. No uniqueness theorem is needed to reject the second curve: its explicit nonzero residual already does so.`)
 ],verification:['Author self-check: product-sign table, equilibrium identity and exact residual 7/8 at time 1/2.']}
 ],
 alternatives:[p(tex`A labeled slope table can be converted into a field sketch by drawing short rise-over-run segments at every listed point. Algebraic residuals then verify entire proposed curves more reliably than visual agreement alone.`),p(tex`This lesson supplies Easy field interpretation and equilibrium meaning. Explicit solution formulas, Euler approximations, existence/uniqueness theorems and global stability are later tasks with their own prerequisites.`)],
 related:['ode-meaning','separable-ode','existence-uniqueness'],next:['ode-meaning','separable-ode'],
 references:[{sourceId:'openstax-calculus-2',url:'https://openstax.org/books/calculus-volume-2/pages/4-2-direction-fields-and-numerical-methods',use:'reference-only'}],review:{status:'draft'},exposureAudit:{status:'pending'}
};
