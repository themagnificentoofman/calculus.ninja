// Curriculum expectations authored from the Milestone 4 specification.
// A concept list is not a coverage certificate or a change to problem ratings.
const topic=(id,title,concepts)=>({id,title,concepts:concepts.map(([id,title])=>({id,title}))});
export const studyTiers=[
 {id:'easy',title:'Easy',revision:1,
  summary:'Interpret the basic objects of calculus and apply familiar rules with the domain, sign and units kept explicit.',
  prerequisites:['Algebra, equations and inequalities','Function domains, graphs and composition','Radians, elementary trigonometry, exponentials and logarithms'],
  reasoning:'Identify the requested object, choose a direct method, and check the result. Familiar formulas still require their hypotheses and domains.',
  progression:'Start with a topic whose foundations you can explain. Use its exercises to decide whether to revisit prerequisites or try the corresponding Medium concepts.',
  topics:[
   topic('differentiation','Differentiation',[
    ['meaning','Derivatives as limits, slopes and rates; domains and units'],['rules','Elementary derivatives; product, quotient and direct chain rules'],['point','Derivatives at a point and basic local linearization']]),
   topic('integration','Integration',[
    ['accumulation','Signed accumulation, geometric area, definite and indefinite integrals'],['ftc','Fundamental theorem of calculus; elementary primitives, constants and domains'],['substitution','Straightforward substitution']]),
   topic('limits','Limits',[
    ['continuity','Continuity, direct substitution and one-sided behavior'],['algebra','Cancellation, rationalization and squeeze'],['infinity','Basic limits at infinity']]),
   topic('series','Series',[
    ['partial-sums','Sequences, partial sums, indexing, geometric and telescoping series'],['tests','The nth-term test, its limits and p-series']]),
   topic('ode','Differential equations',[
    ['meaning','Solution intervals, residual verification, initial conditions and slope fields'],['separation','Elementary separation, growth models and equilibrium solutions']]),
   topic('multivariable','Multivariable calculus',[
    ['local','Functions, level sets, partial derivatives, gradients and directional derivatives'],['linearization','Simple local linearization'],['integration','Rectangular iterated integrals']]),
   topic('mixed','Mixed and strategy',[
    ['object-domain','Identify the requested object; check domain, sign, scale and units'],['representations','Connect graphical and algebraic meanings']]),
  ],review:{status:'draft'}},
 {id:'medium',title:'Medium',revision:1,
  summary:'Choose among standard methods, combine familiar techniques, and explain why their conditions apply.',
  prerequisites:['The Easy concepts used by the selected topic','Fluent differentiation and elementary integration','Exact algebra and explicit domain checks'],
  reasoning:'Recognize the useful representation, coordinate several standard steps, and compare or verify a solution by another route.',
  progression:'Follow the corresponding Easy foundations first when needed. Before moving to Hard, explain the exceptions to a method as well as a successful calculation.',
  topics:[
   topic('differentiation','Differentiation',[
    ['implicit','Implicit and logarithmic differentiation'],['inverse-parametric','Inverse and parametric differentiation; higher derivatives'],['applications','Related rates, linearization, monotonicity, concavity and extrema'],['mvt','Mean-value theorem and its hypotheses']]),
   topic('integration','Integration',[
    ['methods','Integration by parts, partial fractions and trigonometric methods'],['bounds','Moving bounds and basic improper integrals'],['applications','Average value, areas, volumes, arc length and surfaces of revolution']]),
   topic('limits','Limits',[
    ['standard','Trigonometric, exponential and logarithmic limits; comparative growth'],['lhopital','L’Hôpital’s rule with its hypotheses'],['taylor','Local Taylor approximation'],['sequences','Sequence and recurrence limits']]),
   topic('series','Series',[
    ['tests','Comparison, ratio, root, integral and alternating tests'],['errors','Absolute and conditional convergence; remainder bounds'],['power','Power series, radius, endpoints and Taylor/Maclaurin expansions']]),
   topic('ode','Differential equations',[
    ['first-order','First-order linear equations, integrating factors, exact and Bernoulli equations'],['second-order','Constant-coefficient second-order equations, forcing and resonance'],['conditions','Initial and boundary data; basic existence and uniqueness conditions']]),
   topic('multivariable','Multivariable calculus',[
    ['chain','Total differential, chain rule and tangent planes'],['optimization','Critical points, Hessians and elementary constrained optimization'],['integration','Double and triple integrals'],['coordinates','Polar, cylindrical and spherical coordinates; Jacobians']]),
   topic('mixed','Mixed and strategy',[
    ['method-selection','Choose among familiar methods and compare two valid routes'],['connections','Connect the fundamental theorem, derivatives, integrals and elementary series']]),
  ],review:{status:'draft'}},
 {id:'hard',title:'Hard',revision:1,
  summary:'Decompose a problem, control exceptional cases, and justify estimates or operations whose validity depends on domains and convergence.',
  prerequisites:['The relevant Easy and Medium concepts','Reliable theorem-hypothesis checks','The algebra, linear algebra or analysis bridges required by the chosen method'],
  reasoning:'Develop a sequence of arguments, choose a useful representation, and justify limiting operations. A plausible pattern or numerical agreement is not a proof.',
  progression:'Use the precise prerequisite links rather than treating every Medium topic as compulsory. Revisit a foundation whenever an estimate, branch or theorem condition is unclear.',
  topics:[
   topic('differentiation','Differentiation',[
    ['higher','Higher derivatives, Leibniz formulas and recurrences'],['implicit','Parameter-dependent implicit relations, nonsmooth and exceptional points'],['taylor','Taylor remainders and sharp estimates'],['interchange','Justified differentiation under an integral or sum']]),
   topic('integration','Integration',[
    ['structure','Symmetry, reflection and nonobvious substitutions'],['reduction','Reduction formulas and parameter differentiation'],['convergence','Convergence-sensitive manipulations, bounds and approximation errors'],['special','Beta and gamma connections where useful']]),
   topic('limits','Limits',[
    ['asymptotics','Higher-order cancellation, oscillation and asymptotic estimates'],['parameters','Parameter dependence and nonuniform behavior'],['sequences','Stolz–Cesàro with its conditions'],['interchange','Conditions for interchanging limits and other operations']]),
   topic('series','Series',[
    ['generating','Generating functions and weighted or harmonic sums'],['summation','Summation by parts; Abel and Dirichlet arguments'],['uniform','Pointwise versus uniform convergence'],['operations','Termwise integration, differentiation and rearrangements with justification']]),
   topic('ode','Differential equations',[
    ['methods','Substitutions, reduction of order, variation of parameters and Euler–Cauchy equations'],['systems','Systems, eigenstructure and qualitative stability'],['series-transforms','Power series, Frobenius and Laplace methods'],['lifetime','Singular solutions and local versus global existence']]),
   topic('multivariable','Multivariable calculus',[
    ['optimization','Boundary and degenerate-Hessian cases; global constrained optimization'],['coordinates','Nonlinear changes of variables and regions'],['regularity','Limits, path dependence, differentiability and mixed partials'],['vector','Line and surface integrals; Green, Stokes and divergence theorems with hypotheses']]),
   topic('mixed','Mixed and strategy',[
    ['decomposition','Decompose a problem, change representation and combine methods'],['exceptions','Check exceptional cases, branches, convergence and theorem conditions']]),
  ],review:{status:'draft'}},
 {id:'olympiad',title:'Olympiad',revision:1,
  summary:'Recognize hidden structure and combine ideas into a justified argument, using either elementary insight or an appropriate advanced method.',
  prerequisites:['Strong command of the foundations needed by the particular problem','Experience choosing and comparing methods','Any advanced bridge explicitly required by the selected route'],
  reasoning:'Look for symmetry, invariants, a useful parameter, normalization or a sharp bound. A technique list cannot predict the decisive idea, and advanced notation alone does not determine difficulty.',
  progression:'Compare alternative routes and explain the recognition step. The guide develops reusable ideas; it does not exhaust all possible Olympiad methods.',
  topics:[
   topic('differentiation','Differentiation',[
    ['structure','Auxiliary functions, hidden functional structure and symmetry'],['coefficients','High-order coefficients, generating functions and inversion'],['operators','Differential operators, inequalities and extremal arguments']]),
   topic('integration','Integration',[
    ['structure','Involutions, functional relations and parameter-to-ODE methods'],['transforms','Transforms, convolution and contour/residue methods with prerequisite bridges'],['asymptotics','Oscillatory and asymptotic integrals'],['special','Special functions, sharp inequalities and explicit principal-value conventions']]),
   topic('limits','Limits',[
    ['normalization','Tailored normalization, dominant balance and delicate bounds'],['objects','Limiting sums, products and integrals'],['singular','Singular behavior and nonuniformity; counterexamples to unjustified heuristics']]),
   topic('series','Series',[
    ['coefficients','Nonroutine coefficient extraction and asymptotics'],['products','Infinite products and advanced summation'],['transforms','Fourier, orthogonality and transform connections'],['parameters','Special-function identities and critical parameter cases; summation conventions']]),
   topic('ode','Differential equations',[
    ['structure','Hidden linearization, Riccati/projective viewpoints and first integrals'],['comparison','Comparison, oscillation, spectral and variational methods'],['parameters','Special functions and nonroutine parameter or boundary problems']]),
   topic('multivariable','Multivariable calculus',[
    ['structure','Symmetry, invariance, homogeneity, quadratic forms and determinants'],['integration','Multidimensional integration, inequalities and geometric transformations'],['parameters','Variational, duality, parameter and moment arguments']]),
   topic('mixed','Mixed and strategy',[
    ['recognition','Recognize symmetry, parameters, transforms, asymptotics and inequalities'],['extremal','Spectral and extremal viewpoints; elegant elementary alternatives']]),
  ],review:{status:'draft'}},
];
