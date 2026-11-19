// Shared prerequisite routes. These do not stand in for the 28 tier/topic paths.
export const foundationPaths=[
 {id:'algebra-functions',revision:1,title:'Algebra, functions and trigonometry',summary:'Build the algebra and function skills used throughout calculus, then check logarithmic and trigonometric domains.',
  objectives:['Solve equations without losing or adding solutions.','Determine domains before composing or inverting functions.','Use radians and select the correct inverse branch.'],
  steps:[
   {lessonId:'algebra',purpose:'Start with factorization, equation equivalence and sign intervals.'},
   {lessonId:'functions',purpose:'Use those restrictions to find composition domains and inverse branches.'},
   {lessonId:'trig',purpose:'Apply function and inverse ideas to the unit circle and trigonometric identities.'},
   {lessonId:'exp-log',purpose:'Extend the domain checks to logarithms, exponentials and variable powers.'},
  ],readiness:[
   {lessonId:'functions',exerciseId:'composition-domain',prompt:'Find the complete domain of a composition, including its endpoints.'},
   {lessonId:'trig',exerciseId:'trig-sign-interval',prompt:'Use the stated quadrant to resolve a sign that an identity alone cannot determine.'},
   {lessonId:'exp-log',exerciseId:'log-magnitude',prompt:'Explain why taking a logarithm can change which candidate solutions are allowed.'},
  ],review:{status:'draft'}},
 {id:'limits-derivatives',revision:1,title:'Limits, derivatives and tangent lines',summary:'Use domains and nearby behavior to define a derivative, then connect its value to slope and rate.',
  objectives:['Distinguish a function value from a limit.','Justify cancellation or a squeeze near the limiting point.','Obtain a derivative from a difference quotient and interpret its units.'],
  steps:[
   {lessonId:'algebra',purpose:'Prepare the factorization and rationalization used in difference quotients.'},
   {lessonId:'functions',purpose:'Identify the permitted inputs and distinguish a formula from its domain.'},
   {lessonId:'trig',purpose:'Review the bounded trigonometric factors used in squeeze arguments.'},
   {lessonId:'limit-foundations',purpose:'Learn the limiting arguments needed before defining a derivative.'},
   {lessonId:'derivative-meaning',purpose:'Apply the limit definition to rates, tangent lines and corners.'},
  ],readiness:[
   {lessonId:'limit-foundations',exerciseId:'conjugate-limit',prompt:'Justify a rationalized limit without assigning a value at the missing point.'},
   {lessonId:'derivative-meaning',exerciseId:'reciprocal-rate',prompt:'Compute a rate from its difference quotient and state the allowed inputs.'},
  ],review:{status:'draft'}},
 {id:'integrals-series',revision:1,title:'Signed integrals and infinite series',summary:'After the limit and derivative foundations, distinguish signed accumulation from area and finite partial sums from an infinite sum.',
  objectives:['Evaluate signed accumulation and geometric area separately.','Explain why an antiderivative is useful for a definite integral.','Establish a series value by taking a limit of its partial sums.'],
  steps:[
   {lessonId:'algebra',purpose:'Review exact algebra before manipulating integrals or finite sums.'},
   {lessonId:'functions',purpose:'Keep the allowed domain and signs explicit.'},
   {lessonId:'trig',purpose:'Prepare the bounded-function examples in the next limit lesson.'},
   {lessonId:'exp-log',purpose:'Establish logarithm domains and exponential identities before differentiating or integrating them.'},
   {lessonId:'limit-foundations',purpose:'Establish what it means for an approximation to approach a value.'},
   {lessonId:'derivative-meaning',purpose:'Understand the derivative before using its inverse relationship with accumulation.'},
   {lessonId:'derivative-rules',purpose:'Learn the power, logarithm and chain rules needed to verify antiderivatives.'},
   {lessonId:'accumulation',purpose:'Compute signed integrals, separate geometric area, and check a primitive.'},
   {lessonId:'partial-sums',purpose:'Apply limits to finite sums and distinguish convergence from a small individual term.'},
  ],readiness:[
   {lessonId:'accumulation',exerciseId:'area-with-two-crossings',prompt:'Split at sign changes and explain why area differs from a signed integral.'},
   {lessonId:'partial-sums',exerciseId:'alternating-geometric-tail',prompt:'Find a geometric sum and justify an exact remainder bound.'},
  ],review:{status:'draft'}},
 {id:'vectors-partials',revision:1,title:'Vectors, gradients and tangent planes',summary:'Connect one-variable rates with vector directions, then construct and check a multivariable linear approximation.',
  objectives:['Distinguish a point, a displacement and a unit direction.','Find partial derivatives and a tangent plane.','Compare change along a path with change per unit distance.'],
  steps:[
   {lessonId:'algebra',purpose:'Prepare the exact expansions and equations used in local approximations.'},
   {lessonId:'functions',purpose:'Review inputs, outputs and domains.'},
   {lessonId:'trig',purpose:'Use unit-circle angles and the cosine interpretation of a dot product.'},
   {lessonId:'exp-log',purpose:'Review the exponential and logarithm domains assumed in the derivative-rules lesson.'},
   {lessonId:'limit-foundations',purpose:'Understand the limiting condition behind a derivative.'},
   {lessonId:'derivative-meaning',purpose:'Establish a rate of change before extending it to several input directions.'},
   {lessonId:'derivative-rules',purpose:'Practice differentiating a polynomial while treating other fixed quantities as constants.'},
   {lessonId:'linear-algebra',purpose:'Learn displacement, length, normalization, dot products and projection.'},
   {lessonId:'multi-local',purpose:'Combine rates and vectors to compute a gradient, tangent plane and directional derivative.'},
  ],readiness:[
   {lessonId:'multi-local',exerciseId:'path-and-unit-direction',prompt:'Check a tangent plane by expansion and distinguish path speed from a unit directional derivative.'},
  ],review:{status:'draft'}},
];
