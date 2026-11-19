const p=text=>({kind:'prose',text}),m=latex=>({kind:'math',latex}),tex=String.raw;
// Private exercise proposals. Their target lessons and prerequisite contracts remain unchanged.
export const growthTailExercise={
 id:'basic-positive-negative-tails',revision:1,title:'The two signs of a distant input',
 problem:[p(tex`Find the limits of each expression as \(x\to+\infty\) and as \(x\to-\infty\). State the domain restriction relevant to each quotient and justify every sign change:`),m(tex`A(x)=\frac{\sqrt{9x^2+4}-2x}{x+1},\qquad B(x)=\frac{5x^3-x}{2x^3+7}.`)],
 hints:[
  [p(tex`For the first expression, factor the root using \(\sqrt{x^2}=|x|\). For the second, divide by the highest common input power.`)],
  [m(tex`A(x)=\frac{(|x|/x)\sqrt{9+4/x^2}-2}{1+1/x}\quad(x\ne0,-1),\qquad B(x)=\frac{5-x^{-2}}{2+7x^{-3}}.`)],
  [p(tex`On the positive tail \(|x|/x=1\); on the negative tail it is \(-1\). The limiting denominator is 1 for the first expression and 2 for the second, so neither quotient has a zero limiting denominator.`)]
 ],
 solution:[p(tex`The root is real for every input because \(9x^2+4>0\); the first quotient excludes \(x=-1\). For nonzero inputs the exact rewrite in the second hint gives a denominator tending to 1. Hence`),m(tex`\lim_{x\to+\infty}A(x)=3-2=1,\qquad\lim_{x\to-\infty}A(x)=-3-2=-5.`),
 p(tex`The second quotient excludes the single real root \(x=-\sqrt[3]{7/2}\) of its denominator. Both tails eventually avoid this point. Dividing by \(x^3\) gives the displayed expression with numerator tending to 5 and denominator to 2, so`),m(tex`\lim_{x\to+\infty}B(x)=\lim_{x\to-\infty}B(x)=\frac52.`),
 p(tex`The factor \(x^3\) can be negative on the negative tail, but it divides both numerator and denominator in an equality, not an inequality. The root is different: replacing \(|x|\) by \(x\) there would incorrectly give the same first limit on both tails. These are limit-law calculations after exact rewrites; infinity was never substituted as a number.`)],
 verification:['Author self-check: two exact tail rewrites and separate signs of abs(x)/x; nonzero limiting denominators justify quotient limits.']
};
export const rectangleAverageExercise={
 id:'rectangle-integral-and-average',revision:1,title:'A rectangular integral and its average',
 problem:[p(tex`Let \(f(x,y)=xy+x^2-2\) on the rectangle \(R=[-1,2]\times[0,2]\). Find its double integral by both orders of integration and its unweighted average over \(R\). Compare the average with the value at the rectangle's center. Explain what a negative integral means here and whether it makes the rectangle's area negative.`)],
 hints:[
  [p(tex`The polynomial is continuous on a finite closed rectangle, so proper Fubini applies. Each inner integral treats the other variable as constant.`)],
  [m(tex`\int_0^2(xy+x^2-2)\,\mathrm{d}y=2x+2x^2-4,\qquad \int_{-1}^{2}(xy+x^2-2)\,\mathrm{d}x=\frac32y-3.`)],
  [p(tex`The rectangle has area \(3\cdot2=6\). Divide the double integral by this area for the average, and separately evaluate \(f(1/2,1)\) for the center value.`)]
 ],
 solution:[p(tex`Continuity on the entire rectangle ensures both proper iterated integrals exist and equal the double integral. With the vertical integral first,`),m(tex`\iint_R f\,\mathrm{d}A=\int_{-1}^{2}(2x+2x^2-4)\,\mathrm{d}x=\left[x^2+\frac23x^3-4x\right]_{-1}^{2}=-3.`),
 p(tex`With the horizontal integral first,`),m(tex`\iint_R f\,\mathrm{d}A=\int_0^2\left(\frac32y-3\right)\,\mathrm{d}y=\left[\frac34y^2-3y\right]_0^2=-3.`),
 p(tex`The positive area is 6, so the average is \(-3/6=-1/2\). At the center \((1/2,1)\), the value is \(1/2+1/4-2=-5/4\), which differs from the average. A center value is not generally an area average. The negative integral is signed accumulation of function values, indicating that the negative contribution outweighs the positive one. It does not make the geometric area negative; nor does it equal the total geometric volume between graph and plane, which would use \(|f|\).`)],
 verification:['Author self-check: exact polynomial iterated integration in both orders, area normalization and distinct center evaluation.']
};
export const exerciseAdditions=[{targetLessonId:'growth',exercise:growthTailExercise},{targetLessonId:'multiple-integrals',exercise:rectangleAverageExercise}];
