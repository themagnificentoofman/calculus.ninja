const p=text=>({kind:'prose',text}),m=latex=>({kind:'math',latex}),tex=String.raw;
export const oneSidedLimitsLesson={
 id:'one-sided-limits',revision:1,title:'One-sided limits and continuity at boundaries',
 summary:'Distinguish approach from the left or right, a value assigned at the point, and continuity relative to the actual domain.',
 objectives:['Use the appropriate branch of a piecewise function on each side of a point.','Determine when two finite one-sided limits combine into a two-sided limit.','Separate an assigned point value from nearby behavior and identify which discontinuities a point-value change can repair.','Interpret continuity at a domain endpoint without inventing inputs on the missing side.'],
 prerequisites:['algebra','functions'],
 readiness:[{lessonId:'functions',exerciseId:'composition-domain',prompt:'Identify exactly which real inputs a formula permits before approaching an endpoint.'}],
 sections:[
 {id:'nearby-and-sided',title:'Approach through allowed points on the specified side',body:[
  p(tex`A finite limit describes nearby outputs, not the output at the point itself. Let \(D\) be the domain and \(a\) a point with domain inputs arbitrarily close on the side being considered. A right-hand limit \(L\) means that every requested output tolerance \(\varepsilon>0\) can be achieved by restricting all allowed inputs to a sufficiently short interval just to the right of \(a\):`),
  m(tex`\lim_{x\to a^+}f(x)=L\quad\Longleftrightarrow\quad\forall\varepsilon>0\ \exists\delta>0:\quad x\in D,\ 0<x-a<\delta\ \Longrightarrow\ |f(x)-L|<\varepsilon.`),
  p(tex`The left-hand definition instead uses \(0<a-x<\delta\) and is written \(\lim_{x\to a^-}f(x)=L\). The superscript describes the input side, not the sign of the output. The value \(f(a)\) is excluded by the strict input inequality. A limit can exist even when \(f(a)\) is undefined or different from \(L\).`),
  p(tex`The requirement of arbitrarily close domain points matters: if no domain points approach from a side, we do not assign that one-sided limit by a vacuous implication. For example, a function with domain \([a,\infty)\) has a natural right-hand question at \(a\), but no left-hand approach within its domain.`)
 ]},
 {id:'joining-sides',title:'A two-sided interior limit must agree on both sides',body:[
  p(tex`When the domain has points approaching \(a\) from both sides, a finite two-sided limit exists exactly when both one-sided limits exist and have the same finite value.`),
  m(tex`\lim_{x\to a}f(x)=L\quad\Longleftrightarrow\quad\lim_{x\to a^-}f(x)=\lim_{x\to a^+}f(x)=L.`),
  p(tex`To see sufficiency, choose a radius for each side at the same tolerance and use the smaller radius. Every permitted input in that punctured neighborhood lies on one side or the other. Necessity follows by restricting the two-sided condition to either side. Unequal finite side limits are a jump; changing only \(f(a)\) cannot make them agree.`),
  p(tex`For a piecewise formula, use the branch valid for nearby inputs on that side. A branch assigned only at \(x=a\) determines the point value, not either side limit. Polynomial branches have limits given by substitution. This follows from the elementary limit laws for sums and products; near a fixed input the factors stay bounded, so small input changes give small output changes. A finite numerical table suggests a limit but does not establish the condition for every nearby input.`)
 ]},
 {id:'continuity-and-domain',title:'Continuity also requires the correct point value',body:[
  p(tex`At a domain point \(a\), continuity means that the nearby values through the domain approach \(f(a)\). At an interior point with two-sided approach, check that the point value exists, both side limits agree, and their common value equals the point value. If the common finite limit exists but the value is absent or different, assigning that limit repairs this removable defect.`),
  p(tex`At a left endpoint whose domain lies locally to its right, continuity uses the right-hand limit and the actual endpoint value; at a right endpoint it uses the left-hand limit. This is continuity relative to the domain. We write the one-sided symbol at endpoints to avoid confusing it with a two-sided approach from the real line. At an isolated domain point continuity is automatic in the relative-domain definition, but the punctured-limit convention here does not assign a unique limit there.`),
  m(tex`f\text{ continuous at a non-isolated left endpoint }a\quad\Longleftrightarrow\quad\lim_{x\to a^+}f(x)=f(a)\quad\text{through its domain}.`),
  p(tex`Restricting a domain changes the function being discussed. A jump on a two-sided domain may disappear after retaining just one side and choosing a new endpoint value, but that does not repair the original two-sided function.`)
 ]}
 ],
 worked:[
 {id:'nearby-value-and-assigned-value',revision:1,title:'A common nearby value and a different assigned value',problem:[
  m(tex`f(x)=\begin{cases}2x+1,&x<1,\\5,&x=1,\\x^2+2,&x>1.\end{cases}`),
  p(tex`Find both one-sided limits at 1, the two-sided limit and the point value. Decide whether the function is continuous there and whether changing only its value at 1 can make it continuous.`)
 ],solution:[
  p(tex`Approaching from the left uses \(2x+1\), whose limit is 3. Approaching from the right uses \(x^2+2\), whose limit is also 3. Thus`),
  m(tex`\lim_{x\to1^-}f(x)=3,\qquad\lim_{x\to1^+}f(x)=3,\qquad\lim_{x\to1}f(x)=3,\qquad f(1)=5.`),
  p(tex`The limit and point value disagree, so the function is not continuous at 1. Replacing only \(f(1)\) by 3 makes it continuous. The replacement does not change either side limit.`),
  p(tex`As a direct tolerance check, on the left \(|(2x+1)-3|=2|x-1|\). On the right, when \(|x-1|<1\), \(|(x^2+2)-3|=|x-1||x+1|<3|x-1|\). Given \(\varepsilon>0\), taking \(\delta=\min(1,\varepsilon/3)\) controls both sides. This proves the common limit without relying on a finite sample.`)
 ],verification:['Author self-check: exact branch limits and point value; a single explicit tolerance radius bounds both side errors.']},
 {id:'root-domain-endpoint',revision:1,title:'An endpoint with only a right-hand approach',problem:[
  p(tex`Let \(g(x)=\sqrt{x+1}\) with its real domain \([-1,\infty)\). Determine the limit through that domain as \(x\to-1\), state it using a one-sided symbol, and decide whether \(g\) is continuous at its endpoint. Explain why no left-hand limit is assigned on this domain.`)
 ],solution:[
  p(tex`Real inputs must satisfy \(x+1\ge0\). Near the endpoint, permitted inputs other than the endpoint lie to its right. Given \(\varepsilon>0\), take \(\delta=\varepsilon^2\). Then`),
  m(tex`0<x+1<\delta\quad\Longrightarrow\quad0<\sqrt{x+1}<\varepsilon.`),
  p(tex`Therefore \(\lim_{x\to-1^+}g(x)=0\). The endpoint value is \(g(-1)=0\), so the function is continuous there relative to its domain. No real domain points lie to the left of \(-1\), so the left-hand approach required by that notation is absent. We do not infer an additional left-hand value from the formula or extend the square root to nonreal inputs.`)
 ],verification:['Author self-check: exact real domain and epsilon-squared bound; endpoint equality establishes relative-domain continuity.']}
 ],
 contrast:[p(tex`If the two sides approach 3 and 4, assigning 3, 4 or any other value at the junction cannot repair the jump. The missing ingredient is agreement of nearby behavior, not a preferred point value.`),p(tex`A right-hand limit need not be positive: a constant function with value \(-7\) has right-hand limit \(-7\) wherever its domain permits that approach.`),p(tex`This lesson treats finite limits. A side tending to positive or negative infinity does not satisfy the finite-limit definition. Oscillation, infinite limits and general discontinuous domains require their own analysis.`)],
 mistakes:[tex`Substituting into the branch defined only at the junction to compute a nearby limit.`,tex`Using the same piecewise branch for both directions.`,tex`Calling a function continuous merely because its two side limits agree, without comparing the point value.`,tex`Inventing a left-hand approach where no domain points exist, or confusing a restricted-domain extension with the original function.`],
 exercises:[
 {id:'match-three-data',revision:1,title:'Matching the two sides and the assigned value',problem:[
  p(tex`For real parameters \(p\) and \(q\), define`),m(tex`h(x)=\begin{cases}px+1,&x<2,\\q,&x=2,\\x^2+p,&x>2.\end{cases}`),
  p(tex`Find all parameter pairs for which \(h\) is continuous at 2. If \(p=0\), can any choice of \(q\) make the function continuous there? Explain using the actual side limits.`)
 ],hints:[
  [p(tex`Compute three separate objects: the left limit, the right limit and the assigned point value.`)],
  [m(tex`\lim_{x\to2^-}h(x)=2p+1,\qquad\lim_{x\to2^+}h(x)=4+p,\qquad h(2)=q.`)],
  [p(tex`First equate the two side limits. Only after finding \(p\) set \(q\) equal to their common value. For \(p=0\), compare the side limits before considering \(q\).`)]
 ],solution:[
  p(tex`The two-sided limit exists precisely when \(2p+1=4+p\), so \(p=3\). Their common value is then 7, and continuity additionally requires \(q=7\). Hence the only pair is`),m(tex`(p,q)=(3,7).`),
  p(tex`With \(p=0\), the left limit is 1 and the right limit is 4. They disagree regardless of the assigned value. No \(q\) repairs this jump by changing one point.`)
 ],verification:['Author self-check: solve the two linear compatibility conditions; substitute the unique pair into both branches and the assigned value.']},
 {id:'restricting-a-jump',revision:1,title:'A jump before and after restricting the domain',problem:[
  p(tex`Let \(u(x)=|x+2|/(x+2)\) on its real domain. Find its left-hand and right-hand limits at \(-2\), and decide whether assigning a value only at \(-2\) can make it continuous on the real line. Now consider a different function defined by the same formula only for \(x>-2\). Can it be extended continuously to the domain \([-2,\infty)\)? If so, find the endpoint value and explain why this does not contradict the first conclusion.`)
 ],hints:[
  [p(tex`The sign of \(x+2\) determines how the absolute value simplifies. Treat the two sides separately before canceling.`)],
  [m(tex`\frac{|x+2|}{x+2}=\begin{cases}-1,&x<-2,\\1,&x>-2.\end{cases}`)],
  [p(tex`On the full punctured domain the side values differ. On the restricted domain, only the right-hand behavior is retained, so endpoint continuity uses only that side.`)]
 ],solution:[
  p(tex`The real domain excludes \(-2\). For \(x<-2\), the absolute value is \(-(x+2)\), so the quotient is \(-1\). For \(x>-2\), it is 1. Thus`),m(tex`\lim_{x\to-2^-}u(x)=-1,\qquad\lim_{x\to-2^+}u(x)=1.`),
  p(tex`The two-sided limit does not exist. No value assigned at the single missing point makes this full-domain function continuous there. For the different function restricted to \(x>-2\), the right-hand limit is 1. Assigning value 1 at \(-2\) gives the constant function 1 on \([-2,\infty)\), which is continuous relative to that domain. The two conclusions use different domains; the restriction discards the incompatible left-hand behavior.`)
 ],verification:['Author self-check: exact sign split on the two open intervals; inspect the full and restricted domains separately.']}
 ],
 alternatives:[p(tex`Piecewise substitution identifies the candidate side limits; a direct error estimate can prove them without a graph. A graph with open and filled points can communicate the same distinction, but finitely many plotted samples alone are not proof.`),p(tex`This is Easy preparation for continuity, derivatives and limits. Endpoint differentiability, L’Hôpital’s rule and advanced convergence arguments are not required or established here.`)],
 related:['limit-foundations','functions'],next:['limit-foundations','derivative-meaning'],
 references:[{sourceId:'openstax-calculus-1',url:'https://openstax.org/books/calculus-volume-1/pages/2-2-the-limit-of-a-function',use:'reference-only'},{sourceId:'openstax-calculus-1',url:'https://openstax.org/books/calculus-volume-1/pages/2-4-continuity',use:'reference-only'}],review:{status:'draft'},exposureAudit:{status:'pending'}
};
