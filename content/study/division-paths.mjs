// Authored recommendations; division is not a difficulty or an access gate.
export const divisionPaths=[
  {
    "id": "division-unrated",
    "revision": 1,
    "kind": "division",
    "title": "Unrated: domains, limits and first derivatives",
    "summary": "Start with equations and function domains, then use limits to understand a derivative and an accumulated change. Use the exit exercises to decide which foundation to revisit before choosing a topic.",
    "objectives": [
      "Use the limit foundation to calculate and interpret a local rate.",
      "Connect a derivative with signed accumulated change before evaluating integrals."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Factor, simplify and solve while keeping track of forbidden values and reversible steps."
      },
      {
        "lessonId": "functions",
        "purpose": "Read a function as a rule together with its allowed inputs, and check what happens when rules are composed or reversed."
      },
      {
        "lessonId": "trig",
        "purpose": "Use the unit circle to control signs, angles and the branches of inverse trigonometric functions."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Use cancellation, one-sided analysis, rationalization and squeeze with their precise conditions."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Use the limit foundation to calculate and interpret a local rate."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use logarithms to turn products into sums without losing positivity, absolute values or the meaning of a variable exponent."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Use a formula’s structure to choose a rule, retain every changing factor, and check the domain before simplifying."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Connect a derivative with signed accumulated change before evaluating integrals."
      }
    ],
    "readiness": [
      {
        "lessonId": "functions",
        "exerciseId": "composition-domain",
        "prompt": "Find the whole composition domain, including the permitted endpoints."
      },
      {
        "lessonId": "derivative-meaning",
        "exerciseId": "reciprocal-rate",
        "prompt": "Derive the rate from a difference quotient and retain the input restriction."
      },
      {
        "lessonId": "accumulation",
        "exerciseId": "area-with-two-crossings",
        "prompt": "Separate net signed change from total area across both sign changes."
      }
    ],
    "review": {
      "status": "draft"
    }
  },
  {
    "id": "division-bronze",
    "revision": 1,
    "kind": "division",
    "title": "Bronze: calculus rules and initial-value problems",
    "summary": "Build dependable routine methods: differentiate a composition, evaluate an integral, and check a differential equation against its initial data. Include directional derivatives and partial sums so familiar notation keeps its meaning across topics.",
    "objectives": [
      "Choose a rule from the expression and retain every changing factor.",
      "Connect antiderivatives with endpoints after learning signed accumulation.",
      "Extend finite-sum reasoning to a limit and check the remainder.",
      "Verify both the equation and initial value before interpreting a solution.",
      "Use vector foundations to distinguish a unit direction from an arbitrary path."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Factor, simplify and solve while keeping track of forbidden values and reversible steps."
      },
      {
        "lessonId": "functions",
        "purpose": "Read a function as a rule together with its allowed inputs, and check what happens when rules are composed or reversed."
      },
      {
        "lessonId": "trig",
        "purpose": "Use the unit circle to control signs, angles and the branches of inverse trigonometric functions."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Use cancellation, one-sided analysis, rationalization and squeeze with their precise conditions."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Build the derivative from a difference quotient, interpret its units, and recognize when the two sides disagree."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use logarithms to turn products into sums without losing positivity, absolute values or the meaning of a variable exponent."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Choose a rule from the expression and retain every changing factor."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate a net change from a total area, and use antiderivatives with their domains and constants."
      },
      {
        "lessonId": "ftc",
        "purpose": "Connect antiderivatives with endpoints after learning signed accumulation."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Extend finite-sum reasoning to a limit and check the remainder."
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "Verify both the equation and initial value before interpreting a solution."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Distinguish a point from a direction, normalize vectors, and read how a matrix changes lengths and signs."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Use vector foundations to distinguish a unit direction from an arbitrary path."
      }
    ],
    "readiness": [
      {
        "lessonId": "derivative-rules",
        "exerciseId": "root-exponential-quotient",
        "prompt": "Combine the changing factors and state the domain before simplifying."
      },
      {
        "lessonId": "ftc",
        "exerciseId": "crossing-endpoints",
        "prompt": "Differentiate both moving endpoints even when the interval has zero width."
      },
      {
        "lessonId": "multi-local",
        "exerciseId": "path-and-unit-direction",
        "prompt": "Compute and explain the different rates along a path and a unit direction."
      }
    ],
    "review": {
      "status": "draft"
    }
  },
  {
    "id": "division-silver",
    "revision": 1,
    "kind": "division",
    "title": "Silver: choosing substitutions and solving first-order equations",
    "summary": "Practice choosing among methods and checking the result. Connect inverse and parametric derivatives with domain choices, compare substitution and integration by parts, and preserve branches in first-order equations.",
    "objectives": [
      "Identify implicit and logarithmic dependencies before applying chain rules.",
      "Recover the original point or parameter before converting a derivative.",
      "Reverse a chain rule while tracking bounds, orientation and branches.",
      "Choose a product split and verify the boundary terms independently.",
      "Normalize the equation and fit the initial value using an integrating factor.",
      "Separate only on a valid branch and restore any lost equilibrium solutions."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Factor, simplify and solve while keeping track of forbidden values and reversible steps."
      },
      {
        "lessonId": "functions",
        "purpose": "Read a function as a rule together with its allowed inputs, and check what happens when rules are composed or reversed."
      },
      {
        "lessonId": "trig",
        "purpose": "Use the unit circle to control signs, angles and the branches of inverse trigonometric functions."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Use cancellation, one-sided analysis, rationalization and squeeze with their precise conditions."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Build the derivative from a difference quotient, interpret its units, and recognize when the two sides disagree."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use logarithms to turn products into sums without losing positivity, absolute values or the meaning of a variable exponent."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Use a formula’s structure to choose a rule, retain every changing factor, and check the domain before simplifying."
      },
      {
        "lessonId": "implicit-logarithmic",
        "purpose": "Identify implicit and logarithmic dependencies before applying chain rules."
      },
      {
        "lessonId": "inverse-parametric",
        "purpose": "Recover the original point or parameter before converting a derivative."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate a net change from a total area, and use antiderivatives with their domains and constants."
      },
      {
        "lessonId": "ftc",
        "purpose": "Differentiate an accumulation without first finding its primitive, and account for both ends of a moving interval."
      },
      {
        "lessonId": "substitution",
        "purpose": "Reverse a chain rule while tracking bounds, orientation and branches."
      },
      {
        "lessonId": "parts",
        "purpose": "Choose a product split and verify the boundary terms independently."
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "Check a proposed function by its residual and initial data; read direction and equilibria from the equation."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Normalize the equation and fit the initial value using an integrating factor."
      },
      {
        "lessonId": "existence-uniqueness",
        "purpose": "Separate local existence from uniqueness, and distinguish finite-time failure from a solution that exists for every time."
      },
      {
        "lessonId": "separable-ode",
        "purpose": "Separate only on a valid branch and restore any lost equilibrium solutions."
      }
    ],
    "readiness": [
      {
        "lessonId": "inverse-parametric",
        "exerciseId": "parametric-exceptions",
        "prompt": "Use the correct tests for horizontal and vertical behavior."
      },
      {
        "lessonId": "substitution",
        "exerciseId": "cubic-orientation",
        "prompt": "Track the endpoint order through a nonlinear substitution."
      },
      {
        "lessonId": "separable-ode",
        "exerciseId": "negative-reciprocal-branch",
        "prompt": "Retain the solution branch below the equilibrium and justify its maximal interval."
      }
    ],
    "review": {
      "status": "draft"
    }
  },
  {
    "id": "division-gold",
    "revision": 1,
    "kind": "division",
    "title": "Gold: convergence, error bounds and constrained extrema",
    "summary": "Move from obtaining candidates to justifying conclusions. Study series and improper-integral convergence, control approximation error, and compare interior and boundary candidates in multivariable optimization.",
    "objectives": [
      "Treat singular endpoints as limits before applying integration formulas.",
      "Choose a test from term structure and check its hypotheses.",
      "Turn convergence into an explicit remainder guarantee.",
      "Control a local approximation on its stated interval.",
      "Combine derivative and linear-algebra foundations to compare all candidate extrema."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Factor, simplify and solve while keeping track of forbidden values and reversible steps."
      },
      {
        "lessonId": "functions",
        "purpose": "Read a function as a rule together with its allowed inputs, and check what happens when rules are composed or reversed."
      },
      {
        "lessonId": "trig",
        "purpose": "Use the unit circle to control signs, angles and the branches of inverse trigonometric functions."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Use cancellation, one-sided analysis, rationalization and squeeze with their precise conditions."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Build the derivative from a difference quotient, interpret its units, and recognize when the two sides disagree."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use logarithms to turn products into sums without losing positivity, absolute values or the meaning of a variable exponent."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Use a formula’s structure to choose a rule, retain every changing factor, and check the domain before simplifying."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate a net change from a total area, and use antiderivatives with their domains and constants."
      },
      {
        "lessonId": "ftc",
        "purpose": "Differentiate an accumulation without first finding its primitive, and account for both ends of a moving interval."
      },
      {
        "lessonId": "substitution",
        "purpose": "Reverse the chain rule while tracking the differential, endpoint order and any inverse branches."
      },
      {
        "lessonId": "parts",
        "purpose": "Reverse the product rule, choose a useful direction of transfer, and retain the endpoints in repeated or recursive calculations."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Track indexing, uncover cancellation, and distinguish vanishing terms from convergent totals."
      },
      {
        "lessonId": "improper",
        "purpose": "Treat singular endpoints as limits before applying integration formulas."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Choose a test from term structure and check its hypotheses."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Turn convergence into an explicit remainder guarantee."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Control a local approximation on its stated interval."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Distinguish a point from a direction, normalize vectors, and read how a matrix changes lengths and signs."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Connect partial derivatives with a two-variable linear model and separate path speed from a unit directional derivative."
      },
      {
        "lessonId": "multi-chain",
        "purpose": "Track each changing input through a composition, then distinguish first-order rules, second-order terms and a locally defined implicit branch."
      },
      {
        "lessonId": "multi-critical",
        "purpose": "Combine derivative and linear-algebra foundations to compare all candidate extrema."
      }
    ],
    "readiness": [
      {
        "lessonId": "improper",
        "exerciseId": "double-pole-no-rescue",
        "prompt": "Explain why a symmetric limit cannot rescue a positive singularity."
      },
      {
        "lessonId": "series-errors",
        "exerciseId": "factorial-geometric-tail",
        "prompt": "Build an explicit tail bound with the correct first omitted index."
      },
      {
        "lessonId": "multi-critical",
        "exerciseId": "ellipse-boundary-comparison",
        "prompt": "Compare every regular boundary candidate with the interior candidate."
      }
    ],
    "review": {
      "status": "draft"
    }
  },
  {
    "id": "division-platinum",
    "revision": 1,
    "kind": "division",
    "title": "Platinum: transformations, theorem conditions and solution intervals",
    "summary": "Check when a change of representation is justified. Combine parameter-dependent integrals and series operations with coordinate changes, domain-sensitive limits, and existence and continuation of differential-equation solutions.",
    "objectives": [
      "Account for parameter dependence in the integrand and both endpoints, with a local majorant.",
      "Justify termwise calculus inside the convergence interval and examine endpoints separately.",
      "Track the Jacobian, image and multiplicity in a change of variables.",
      "Use domain-aware paths and uniform estimates to test a multivariable limit.",
      "Separate local existence and uniqueness from continuation on the actual equation domain."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Factor, simplify and solve while keeping track of forbidden values and reversible steps."
      },
      {
        "lessonId": "functions",
        "purpose": "Read a function as a rule together with its allowed inputs, and check what happens when rules are composed or reversed."
      },
      {
        "lessonId": "trig",
        "purpose": "Use the unit circle to control signs, angles and the branches of inverse trigonometric functions."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Use cancellation, one-sided analysis, rationalization and squeeze with their precise conditions."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Build the derivative from a difference quotient, interpret its units, and recognize when the two sides disagree."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use logarithms to turn products into sums without losing positivity, absolute values or the meaning of a variable exponent."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Use a formula’s structure to choose a rule, retain every changing factor, and check the domain before simplifying."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Use interval hypotheses to turn derivative information into conclusions about a whole graph, including endpoints and corners."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate a net change from a total area, and use antiderivatives with their domains and constants."
      },
      {
        "lessonId": "ftc",
        "purpose": "Differentiate an accumulation without first finding its primitive, and account for both ends of a moving interval."
      },
      {
        "lessonId": "substitution",
        "purpose": "Reverse the chain rule while tracking the differential, endpoint order and any inverse branches."
      },
      {
        "lessonId": "parts",
        "purpose": "Reverse the product rule, choose a useful direction of transfer, and retain the endpoints in repeated or recursive calculations."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Track indexing, uncover cancellation, and distinguish vanishing terms from convergent totals."
      },
      {
        "lessonId": "improper",
        "purpose": "Replace problematic endpoints by limits, test each ordinary contribution separately, and distinguish cancellation conventions from convergence."
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "Check a proposed function by its residual and initial data; read direction and equilibria from the equation."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Normalize the equation, choose an integrating factor on the correct interval, and verify the complete solution with its initial value."
      },
      {
        "lessonId": "analysis",
        "purpose": "Understand what an estimate must control before exchanging a limit with integration, differentiation or another operation."
      },
      {
        "lessonId": "parameter-integrals",
        "purpose": "Account for parameter dependence in the integrand and both endpoints, with a local majorant."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Choose a test from the structure of the terms, check its hypotheses, and distinguish convergence from a value for the sum."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Turn convergence into a quantitative guarantee, keeping the first omitted index, the sign of a tail and the distinction between a bound and an exact error."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Match derivatives exactly at a center, then prove how far the polynomial can be trusted using a remainder bound."
      },
      {
        "lessonId": "power-series",
        "purpose": "Justify termwise calculus inside the convergence interval and examine endpoints separately."
      },
      {
        "lessonId": "multiple-integrals",
        "purpose": "Build an integral from slices of the same region, and distinguish proper integrals from singular cases where changing the order needs a convergence argument."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Distinguish a point from a direction, normalize vectors, and read how a matrix changes lengths and signs."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Connect partial derivatives with a two-variable linear model and separate path speed from a unit directional derivative."
      },
      {
        "lessonId": "multi-chain",
        "purpose": "Track each changing input through a composition, then distinguish first-order rules, second-order terms and a locally defined implicit branch."
      },
      {
        "lessonId": "coordinates",
        "purpose": "Track the Jacobian, image and multiplicity in a change of variables."
      },
      {
        "lessonId": "multi-limits",
        "purpose": "Use domain-aware paths and uniform estimates to test a multivariable limit."
      },
      {
        "lessonId": "existence-uniqueness",
        "purpose": "Separate local existence and uniqueness from continuation on the actual equation domain."
      }
    ],
    "readiness": [
      {
        "lessonId": "parameter-integrals",
        "exerciseId": "both-moving-endpoints",
        "prompt": "Differentiate all sources of parameter dependence."
      },
      {
        "lessonId": "coordinates",
        "exerciseId": "folded-rectangle",
        "prompt": "Distinguish image area from signed or repeated coverage."
      },
      {
        "lessonId": "existence-uniqueness",
        "exerciseId": "bounded-state-domain-boundary",
        "prompt": "Explain why a finite state limit alone does not establish continuation."
      }
    ],
    "review": {
      "status": "draft"
    }
  },
  {
    "id": "division-diamond",
    "revision": 1,
    "kind": "division",
    "title": "Diamond: symmetry, dynamics and global comparison",
    "summary": "Connect local computations to global conclusions. Use symmetry with its transformed measure, compare constrained extrema, construct forced responses, and prove what energy and stability estimates actually imply.",
    "objectives": [
      "Use a transformation together with its Jacobian or weight, rather than only changing the integrand.",
      "Check regularity, exceptional candidates and attainment on the whole constraint.",
      "Build a forced response from an independent homogeneous pair and a fixed integration base.",
      "Construct the actual vector solution before inferring stability from eigenvalues.",
      "Use the accessible energy component and a travel-time argument to establish attainment."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Factor, simplify and solve while keeping track of forbidden values and reversible steps."
      },
      {
        "lessonId": "functions",
        "purpose": "Read a function as a rule together with its allowed inputs, and check what happens when rules are composed or reversed."
      },
      {
        "lessonId": "trig",
        "purpose": "Use the unit circle to control signs, angles and the branches of inverse trigonometric functions."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Use cancellation, one-sided analysis, rationalization and squeeze with their precise conditions."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Build the derivative from a difference quotient, interpret its units, and recognize when the two sides disagree."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use logarithms to turn products into sums without losing positivity, absolute values or the meaning of a variable exponent."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Use a formula’s structure to choose a rule, retain every changing factor, and check the domain before simplifying."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate a net change from a total area, and use antiderivatives with their domains and constants."
      },
      {
        "lessonId": "ftc",
        "purpose": "Differentiate an accumulation without first finding its primitive, and account for both ends of a moving interval."
      },
      {
        "lessonId": "substitution",
        "purpose": "Reverse the chain rule while tracking the differential, endpoint order and any inverse branches."
      },
      {
        "lessonId": "symmetry",
        "purpose": "Use a transformation together with its Jacobian or weight, rather than only changing the integrand."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Distinguish a point from a direction, normalize vectors, and read how a matrix changes lengths and signs."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Connect partial derivatives with a two-variable linear model and separate path speed from a unit directional derivative."
      },
      {
        "lessonId": "multi-chain",
        "purpose": "Track each changing input through a composition, then distinguish first-order rules, second-order terms and a locally defined implicit branch."
      },
      {
        "lessonId": "multi-critical",
        "purpose": "Separate local classification from global optimization, and check both the feasible set and the regularity of a constraint."
      },
      {
        "lessonId": "inequalities",
        "purpose": "Prove a bound, identify its equality conditions, and distinguish an attained optimum from an approached limit."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Use interval hypotheses to turn derivative information into conclusions about a whole graph, including endpoints and corners."
      },
      {
        "lessonId": "multi-constraints",
        "purpose": "Check regularity, exceptional candidates and attainment on the whole constraint."
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "Check a proposed function by its residual and initial data; read direction and equilibria from the equation."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Normalize the equation, choose an integrating factor on the correct interval, and verify the complete solution with its initial value."
      },
      {
        "lessonId": "complex",
        "purpose": "Use real and imaginary coordinates, polar form and explicit branch choices before applying complex methods."
      },
      {
        "lessonId": "existence-uniqueness",
        "purpose": "Separate local existence from uniqueness, and distinguish finite-time failure from a solution that exists for every time."
      },
      {
        "lessonId": "second-order-ode",
        "purpose": "Build the two-dimensional homogeneous family, add a particular response, and change the trial when forcing overlaps a homogeneous mode."
      },
      {
        "lessonId": "parts",
        "purpose": "Reverse the product rule, choose a useful direction of transfer, and retain the endpoints in repeated or recursive calculations."
      },
      {
        "lessonId": "ode-variation",
        "purpose": "Build a forced response from an independent homogeneous pair and a fixed integration base."
      },
      {
        "lessonId": "ode-systems",
        "purpose": "Construct the actual vector solution before inferring stability from eigenvalues."
      },
      {
        "lessonId": "separable-ode",
        "purpose": "Separate the variables where division is valid, retain constant solutions, and use the initial value to choose a valid branch and interval."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Track indexing, uncover cancellation, and distinguish vanishing terms from convergent totals."
      },
      {
        "lessonId": "improper",
        "purpose": "Replace problematic endpoints by limits, test each ordinary contribution separately, and distinguish cancellation conventions from convergence."
      },
      {
        "lessonId": "ode-energy",
        "purpose": "Use the accessible energy component and a travel-time argument to establish attainment."
      }
    ],
    "readiness": [
      {
        "lessonId": "symmetry",
        "exerciseId": "reciprocal-without-weight",
        "prompt": "Check whether the measure is preserved before applying the complement identity."
      },
      {
        "lessonId": "ode-systems",
        "exerciseId": "zero-eigenvalue-defect",
        "prompt": "Compare systems with the same eigenvalues through their actual solutions."
      },
      {
        "lessonId": "ode-energy",
        "exerciseId": "damped-energy-bound",
        "prompt": "Use the energy inequality to prove continuation without adding an unjustified long-term claim."
      }
    ],
    "review": {
      "status": "draft"
    }
  },
  {
    "id": "division-grandmaster",
    "revision": 1,
    "kind": "division",
    "title": "Grandmaster: sharp bounds, singular cases and exact constructions",
    "summary": "Use this route to examine proof-sensitive connections: sharp bounds, recurrence compatibility, oscillatory cancellation, parameter interchange and global attainment. Add the specialized topic paths needed for your chosen problems; division alone does not certify familiarity with every technique.",
    "objectives": [
      "Prove a sharp bound and determine whether equality can occur.",
      "Use coefficient and operator structure while distinguishing repeated ordinary differentiation.",
      "Turn cancellation into a controlled tail estimate.",
      "Justify an interchange locally before using a parameter to construct an exact relation.",
      "Check each resonant recurrence and prove convergence before calling a series a solution.",
      "Distinguish an energy-level constraint from first arrival and least-period conclusions.",
      "Account for exceptional constraints and attainment beyond compact settings."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Factor, simplify and solve while keeping track of forbidden values and reversible steps."
      },
      {
        "lessonId": "functions",
        "purpose": "Read a function as a rule together with its allowed inputs, and check what happens when rules are composed or reversed."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Distinguish a point from a direction, normalize vectors, and read how a matrix changes lengths and signs."
      },
      {
        "lessonId": "trig",
        "purpose": "Use the unit circle to control signs, angles and the branches of inverse trigonometric functions."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Use cancellation, one-sided analysis, rationalization and squeeze with their precise conditions."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Build the derivative from a difference quotient, interpret its units, and recognize when the two sides disagree."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use logarithms to turn products into sums without losing positivity, absolute values or the meaning of a variable exponent."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Use a formula’s structure to choose a rule, retain every changing factor, and check the domain before simplifying."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate a net change from a total area, and use antiderivatives with their domains and constants."
      },
      {
        "lessonId": "inequalities",
        "purpose": "Prove a sharp bound and determine whether equality can occur."
      },
      {
        "lessonId": "higher-derivatives",
        "purpose": "Use coefficient and operator structure while distinguishing repeated ordinary differentiation."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Track indexing, uncover cancellation, and distinguish vanishing terms from convergent totals."
      },
      {
        "lessonId": "ftc",
        "purpose": "Differentiate an accumulation without first finding its primitive, and account for both ends of a moving interval."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Choose a test from the structure of the terms, check its hypotheses, and distinguish convergence from a value for the sum."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Turn convergence into a quantitative guarantee, keeping the first omitted index, the sign of a tail and the distinction between a bound and an exact error."
      },
      {
        "lessonId": "analysis",
        "purpose": "Understand what an estimate must control before exchanging a limit with integration, differentiation or another operation."
      },
      {
        "lessonId": "parts",
        "purpose": "Reverse the product rule, choose a useful direction of transfer, and retain the endpoints in repeated or recursive calculations."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Match derivatives exactly at a center, then prove how far the polynomial can be trusted using a remainder bound."
      },
      {
        "lessonId": "power-series",
        "purpose": "Find where a power series represents a function, treat each boundary separately, and justify differentiation or integration inside the radius."
      },
      {
        "lessonId": "summation-parts",
        "purpose": "Turn cancellation into a controlled tail estimate."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Use interval hypotheses to turn derivative information into conclusions about a whole graph, including endpoints and corners."
      },
      {
        "lessonId": "substitution",
        "purpose": "Reverse the chain rule while tracking the differential, endpoint order and any inverse branches."
      },
      {
        "lessonId": "improper",
        "purpose": "Replace problematic endpoints by limits, test each ordinary contribution separately, and distinguish cancellation conventions from convergence."
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "Check a proposed function by its residual and initial data; read direction and equilibria from the equation."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Normalize the equation, choose an integrating factor on the correct interval, and verify the complete solution with its initial value."
      },
      {
        "lessonId": "parameter-integrals",
        "purpose": "Justify an interchange locally before using a parameter to construct an exact relation."
      },
      {
        "lessonId": "complex",
        "purpose": "Use real and imaginary coordinates, polar form and explicit branch choices before applying complex methods."
      },
      {
        "lessonId": "existence-uniqueness",
        "purpose": "Separate local existence from uniqueness, and distinguish finite-time failure from a solution that exists for every time."
      },
      {
        "lessonId": "second-order-ode",
        "purpose": "Build the two-dimensional homogeneous family, add a particular response, and change the trial when forcing overlaps a homogeneous mode."
      },
      {
        "lessonId": "ode-reduction",
        "purpose": "Change the independent variable on a fixed sign interval, or use one known homogeneous solution to reduce a second-order equation to first order."
      },
      {
        "lessonId": "ode-frobenius",
        "purpose": "Check each resonant recurrence and prove convergence before calling a series a solution."
      },
      {
        "lessonId": "separable-ode",
        "purpose": "Separate the variables where division is valid, retain constant solutions, and use the initial value to choose a valid branch and interval."
      },
      {
        "lessonId": "ode-energy",
        "purpose": "Distinguish an energy-level constraint from first arrival and least-period conclusions."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Connect partial derivatives with a two-variable linear model and separate path speed from a unit directional derivative."
      },
      {
        "lessonId": "multi-chain",
        "purpose": "Track each changing input through a composition, then distinguish first-order rules, second-order terms and a locally defined implicit branch."
      },
      {
        "lessonId": "multi-critical",
        "purpose": "Separate local classification from global optimization, and check both the feasible set and the regularity of a constraint."
      },
      {
        "lessonId": "multi-constraints",
        "purpose": "Account for exceptional constraints and attainment beyond compact settings."
      }
    ],
    "readiness": [
      {
        "lessonId": "summation-parts",
        "exerciseId": "quarter-turn-log-weight",
        "prompt": "Build and justify a tail estimate for a periodic signed coefficient."
      },
      {
        "lessonId": "ode-frobenius",
        "exerciseId": "resonance-obstruction",
        "prompt": "Detect the incompatible recurrence and prove convergence of the surviving branch."
      },
      {
        "lessonId": "multi-constraints",
        "exerciseId": "unbounded-constraint-attainment",
        "prompt": "Prove global attainment on a noncompact constraint instead of relying on stationary candidates alone."
      }
    ],
    "review": {
      "status": "draft"
    }
  }
];
