export default {
  "id": "strategy-object",
  "revision": 1,
  "title": "Values, rates, totals and remainders",
  "summary": "Read formulas, rate graphs and discrete records to distinguish a value, a rate, a net change, a total and a remainder before calculating.",
  "objectives": [
    "Translate a request into a mathematical object with its domain and units.",
    "Connect heights, slopes and signed areas of a graph to different quantities.",
    "Distinguish a finite count from an infinite total and the next term from the entire remainder.",
    "Check a result with sign, scale, units and an independently reconstructed representation."
  ],
  "prerequisites": [
    "functions",
    "derivative-meaning",
    "accumulation",
    "partial-sums"
  ],
  "readiness": [
    {
      "lessonId": "functions",
      "exerciseId": "composition-domain",
      "prompt": "Keep the original input restrictions when simplifying a composed formula."
    },
    {
      "lessonId": "accumulation",
      "exerciseId": "area-with-two-crossings",
      "prompt": "Explain why signed accumulation and total geometric area differ."
    },
    {
      "lessonId": "partial-sums",
      "exerciseId": "alternating-geometric-tail",
      "prompt": "Identify exactly which terms are retained and which term begins the tail."
    }
  ],
  "sections": [
    {
      "id": "object-before-operation",
      "title": "Name the quantity before choosing an operation",
      "body": [
        {
          "kind": "prose",
          "text": "Start with a sentence specifying what the answer measures, the allowed inputs and its units. A value \\(f(a)\\) is an output. A change \\(f(b)-f(a)\\) is a difference of outputs. An average rate divides that change by the nonzero input interval \\(b-a\\). An instantaneous rate is a derivative when the corresponding limit exists. These are different objects even when their numerical values happen to agree."
        },
        {
          "kind": "math",
          "latex": "f(a),\\qquad f(b)-f(a),\\qquad \\frac{f(b)-f(a)}{b-a},\\qquad f'(a)."
        },
        {
          "kind": "prose",
          "text": "If the input unit is \\(T\\) and the output unit is \\(U\\), a rate has units \\(U/T\\). An integral of that rate over time has units \\(U\\). Units can reject an expression, but matching units do not prove it correct: average cost and marginal cost both have units of currency per quantity."
        },
        {
          "kind": "prose",
          "text": "For a continuous rate \\(r\\) on a finite interval \\([a,b]\\), with \\(a<b\\), the signed integral gives net change. If every crossing in either direction is to be counted positively, integrate \\(|r|\\). To recover a final amount, add the initial amount. The average rate is the net change divided by \\(b-a\\), whereas the average magnitude uses the integral of \\(|r|\\)."
        },
        {
          "kind": "math",
          "latex": "\\Delta A=\\int_a^b r(t)\\,\\mathrm{d}t,\\qquad A(b)=A(a)+\\Delta A,\\qquad \\overline r=\\frac{\\Delta A}{b-a}."
        },
        {
          "kind": "prose",
          "text": "A geometric area or a traveled distance cannot be negative. A displacement or a net flow can be negative. An unspecified phrase such as “the total” needs interpretation from the question: total amount present, total amount added and total amount passing in either direction need not agree."
        }
      ]
    },
    {
      "id": "graph-to-quantity",
      "title": "Read heights, slopes and regions from labeled axes",
      "body": [
        {
          "kind": "prose",
          "text": "On a graph with time on the horizontal axis and a rate on the vertical axis, a height is a rate, a slope is a rate of change of that rate, and a signed region represents accumulated change. If the vertical axis instead shows position, a height is a position and a slope is velocity. Read both axis labels before assigning a meaning."
        },
        {
          "kind": "prose",
          "text": "A list of sampled values alone does not determine the graph between samples. In this lesson, a polygonal graph is defined to consist exactly of the straight segments joining the listed vertices. This extra statement makes interpolation and triangular or trapezoidal areas exact. If the statement only supplied measurements, the same calculations would be approximations requiring additional assumptions."
        },
        {
          "kind": "math",
          "latex": "r(t)=r_0+\\frac{r_1-r_0}{t_1-t_0}(t-t_0)\\quad(t_0\\le t\\le t_1),\\qquad \\int_{t_0}^{t_1}r(t)\\,\\mathrm{d}t=\\frac{r_0+r_1}{2}(t_1-t_0)."
        },
        {
          "kind": "prose",
          "text": "Here \\((t_0,r_0)\\) and \\((t_1,r_1)\\) are adjacent vertices with \\(t_0<t_1\\). The second formula is a signed area; if the segment crosses the horizontal axis, split at the zero before adding absolute areas. A corner may prevent a derivative at that point even though the graph is continuous and its integral exists."
        }
      ]
    },
    {
      "id": "domains-and-local-models",
      "title": "Keep the model interval and approximation error",
      "body": [
        {
          "kind": "prose",
          "text": "A formula valid on a stated interval gives no conclusion outside that interval without another assumption. A derivative at an interior point describes a local change, not an exact finite increment in general. If the function is differentiable at \\(a\\), then"
        },
        {
          "kind": "math",
          "latex": "f(a+h)-f(a)=f'(a)h+e(h),\\qquad \\lim_{h\\to0}\\frac{e(h)}h=0."
        },
        {
          "kind": "prose",
          "text": "Compute the exact difference when it is available; it gives a direct check on the linear estimate. Do not replace the average \\(f(a)/a\\), the finite-change rate \\((f(a+h)-f(a))/h\\), or the derivative \\(f'(a)\\) by one another merely because their units match. In particular \\(f(a)/a\\) is not the change rate from zero when \\(f(0)\\ne0\\)."
        },
        {
          "kind": "prose",
          "text": "Likewise, simplifying a formula does not extend a function automatically to an excluded input. A removable hole, an interval endpoint and an ordinary interior point require different domain statements."
        }
      ]
    },
    {
      "id": "finite-and-eventual",
      "title": "Count the retained terms and the entire remainder",
      "body": [
        {
          "kind": "prose",
          "text": "For discrete contributions \\(a_1,a_2,\\ldots\\), define \\(S_k=\\sum_{j=1}^k a_j\\) for a positive integer \\(k\\). This contains exactly \\(k\\) terms. If the infinite sum converges to \\(S\\), the remainder is \\(R_k=S-S_k\\), beginning with \\(a_{k+1}\\). The next term and the remainder are equal only in special cases."
        },
        {
          "kind": "prose",
          "text": "For \\(a_j=A r^{j-1}\\), the finite identity below follows by multiplying by \\(r\\) and subtracting, with \\(r\\ne1\\). Passing to the infinite limit requires \\(|r|<1\\). The tail formula is then exact, not just a first-term estimate."
        },
        {
          "kind": "math",
          "latex": "S_k=\\frac{A(1-r^k)}{1-r},\\qquad S=\\frac{A}{1-r},\\qquad R_k=\\frac{Ar^k}{1-r}."
        },
        {
          "kind": "prose",
          "text": "When a request asks for the least count meeting a strict error tolerance, verify both the proposed count and the immediately preceding count. For a positive ratio less than one, the positive tails decrease, so these two checks establish minimality."
        }
      ]
    }
  ],
  "worked": [
    {
      "id": "motion-record",
      "revision": 1,
      "title": "Reading a motion record",
      "problem": [
        {
          "kind": "prose",
          "text": "A point moves on a line. Time \\(t\\) is measured in seconds, velocity \\(v(t)\\) in meters per second, and position \\(s(t)\\) in meters. The velocity graph consists exactly of the straight segments joining these vertices; it is specified only for \\(0\\le t\\le5\\)."
        },
        {
          "kind": "math",
          "latex": "\\begin{array}{c|rrr}t&0&2&5\\\\\\hline v(t)&2&-2&1\\end{array}"
        },
        {
          "kind": "prose",
          "text": "Given \\(s(0)=7\\), sketch the velocity graph. Find the position at time 5, the distance traveled, the average velocity and the average speed on this interval. At time \\(1/2\\), identify the velocity and the acceleration, and explain what fails for acceleration at time 2."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "The first segment falls from \\((0,2)\\) to \\((2,-2)\\), crossing zero at time 1. The second rises from \\((2,-2)\\) to \\((5,1)\\), crossing zero at time 4. Reconstructing the straight lines gives"
        },
        {
          "kind": "math",
          "latex": "v(t)=\\begin{cases}2-2t,&0\\le t\\le2,\\\\t-4,&2\\le t\\le5.\\end{cases}"
        },
        {
          "kind": "prose",
          "text": "The first segment contributes signed areas \\(1-1=0\\). The second contributes \\(-2+1/2=-3/2\\). Net displacement is therefore \\(-3/2\\) meters, and the initial position must be added."
        },
        {
          "kind": "math",
          "latex": "s(5)=7-\\frac32=\\frac{11}{2}\\ \\mathrm{m},\\qquad D=1+1+2+\\frac12=\\frac92\\ \\mathrm{m}."
        },
        {
          "kind": "prose",
          "text": "The distance \\(D\\) counts all four region magnitudes. Divide the displacement or distance, respectively, by the elapsed 5 seconds:"
        },
        {
          "kind": "math",
          "latex": "\\overline v=-\\frac3{10}\\ \\mathrm{m/s},\\qquad \\overline{\\lvert v\\rvert}=\\frac9{10}\\ \\mathrm{m/s}."
        },
        {
          "kind": "prose",
          "text": "At time \\(1/2\\), the graph height is \\(v(1/2)=1\\) meter per second, while its slope is \\(-2\\) meters per second squared. At time 2 the left slope is \\(-2\\) and the right slope is 1, so the two-sided acceleration does not exist there. The velocity itself is continuous and equals \\(-2\\)."
        },
        {
          "kind": "prose",
          "text": "A second check integrates the two affine formulas. Their signed integrals are 0 and \\(-3/2\\); splitting them at 1 and 4 gives the four positive contributions above. The distance exceeds the magnitude of the displacement, as it must."
        }
      ],
      "verification": [
        "Author self-check: integrate both reconstructed affine formulas, then split at their exact zeros.",
        "Author self-check: recover each table entry and both one-sided slopes; all physical quantities retain their units."
      ]
    },
    {
      "id": "cost-per-quantity",
      "revision": 1,
      "title": "Three different cost measurements",
      "problem": [
        {
          "kind": "prose",
          "text": "In a hypothetical production model, \\(q\\) is the numerical quantity in kilograms and \\(C(q)\\) is the numerical total cost in dollars. The model is valid only for \\(0\\le q\\le6\\):"
        },
        {
          "kind": "math",
          "latex": "C(q)=18+4q+\\frac{q^2}{2}."
        },
        {
          "kind": "prose",
          "text": "At \\(q=3\\), find the average cost per kilogram and the marginal cost, meaning the instantaneous change in cost per additional kilogram. Determine the actual extra cost of increasing production to \\(7/2\\) kilograms and compare it with the local linear estimate. Does the model justify a prediction at 7 kilograms?"
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Average cost divides the total cost by the quantity; marginal cost differentiates the total cost with respect to quantity. Here both have dollars-per-kilogram units, but they answer different questions."
        },
        {
          "kind": "math",
          "latex": "C(3)=\\frac{69}{2},\\qquad \\frac{C(3)}3=\\frac{23}{2},\\qquad C'(q)=4+q,\\qquad C'(3)=7."
        },
        {
          "kind": "prose",
          "text": "The average cost is \\(23/2\\) dollars per kilogram and the marginal cost is 7 dollars per kilogram. For an increment \\(h\\) with both 3 and \\(3+h\\) inside the model interval, expanding the exact difference gives"
        },
        {
          "kind": "math",
          "latex": "C(3+h)-C(3)=7h+\\frac{h^2}{2}."
        },
        {
          "kind": "prose",
          "text": "With \\(h=1/2\\), the actual extra cost is \\(29/8\\) dollars. The linear estimate is \\(7/2=28/8\\) dollars, an underestimate of \\(1/8\\) dollar. Direct endpoint evaluation provides a separate check: \\(C(7/2)=305/8\\) and \\(C(3)=276/8\\). The positive quadratic error explains the direction."
        },
        {
          "kind": "prose",
          "text": "Although the displayed polynomial can be evaluated at 7, the stated model is valid only up to 6 kilograms. It does not justify that extrapolated prediction. Also, \\(C(3)/3\\) includes the fixed cost 18; it is not the average change rate \\((C(3)-C(0))/3=11/2\\)."
        }
      ],
      "verification": [
        "Author self-check: polynomial expansion and direct rational endpoint subtraction agree.",
        "Author self-check: distinguish a function domain supplied by a model from the maximal algebraic domain of its polynomial."
      ]
    }
  ],
  "contrast": [
    {
      "kind": "prose",
      "text": "A table with only the vertices, without the straight-segment rule, permits infinitely many interpolating curves and therefore does not determine an exact integral. The interpolation rule is mathematical data, not a drawing preference."
    },
    {
      "kind": "prose",
      "text": "For a motion that reverses direction, \\(\\left|\\int v\\right|\\) can be strictly smaller than \\(\\int |v|\\). Taking an absolute value after adding signed contributions loses the distance traveled in opposing directions."
    },
    {
      "kind": "prose",
      "text": "For \\(a_j=1\\), the finite total after \\(k\\) contributions is \\(k\\), but there is no finite eventual total. A finite sum does not require convergence of an infinite series."
    }
  ],
  "mistakes": [
    "Using the height of a rate graph as the accumulated amount, or its slope as the rate itself.",
    "Reporting a final position without adding the initial position.",
    "Averaging the listed vertex heights equally when their time intervals have different lengths.",
    "Treating the next term as the whole tail, or confusing a last index with a number of terms.",
    "Assuming matching units establish equality, or extending a physical model past its stated interval."
  ],
  "exercises": [
    {
      "id": "tank-record",
      "revision": 1,
      "title": "A tank connected to one pipe",
      "problem": [
        {
          "kind": "prose",
          "text": "A tank initially contains 20 liters. During \\(0\\le t\\le6\\) minutes it exchanges water with one pipe and has no other inlet or outlet. The signed pipe flow \\(r(t)\\), measured in liters per minute, is positive into the tank. Its graph consists exactly of the straight segments joining these vertices:"
        },
        {
          "kind": "math",
          "latex": "\\begin{array}{c|rrrr}t&0&2&5&6\\\\\\hline r(t)&2&2&-4&-4\\end{array}"
        },
        {
          "kind": "prose",
          "text": "Sketch the graph. Determine the amount in the tank at time 6, the total volume that crossed the pipe in either direction, the smallest tank capacity that avoids overflow throughout the interval, and the pipe flow at time 4. Check that the model never requires a negative amount of water. Show how the graph and an algebraic description agree; identify the mathematical object and units for each answer before calculating."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "One answer describes an amount present, another counts every crossing, another asks about the largest amount present, and the last is a rate at one instant. They need not use the same operation on the graph."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "On the sloping segment the formula is \\(r(t)=6-2t\\), so the direction changes at time 3. Separate the intervals \\([0,2]\\), \\([2,3]\\), \\([3,5]\\) and \\([5,6]\\)."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "The signed contributions on those intervals are \\(4,1,-4,-4\\) liters. Add them to the initial amount for the final state; count their magnitudes for all crossings. The amount rises until time 3 and then falls."
          }
        ]
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "The graph is horizontal at height 2 until time 2, decreases linearly to height \\(-4\\) at time 5, and stays there until time 6. Its algebraic description is"
        },
        {
          "kind": "math",
          "latex": "r(t)=\\begin{cases}2,&0\\le t\\le2,\\\\6-2t,&2\\le t\\le5,\\\\-4,&5\\le t\\le6.\\end{cases}"
        },
        {
          "kind": "prose",
          "text": "The amount present is the initial amount plus the signed accumulation. The exact signed regions are \\(4,1,-4,-4\\) liters, giving"
        },
        {
          "kind": "math",
          "latex": "A(6)=20+(4+1-4-4)=17\\ \\mathrm{L},\\qquad V_{\\mathrm{crossed}}=4+1+4+4=13\\ \\mathrm{L}."
        },
        {
          "kind": "prose",
          "text": "The flow is positive before time 3 and negative after it. Hence the amount increases to \\(A(3)=20+4+1=25\\) liters and then decreases to 17 liters. The smallest capacity that prevents overflow is 25 liters. The least amount on the entire interval is 17 liters, so the model never empties the tank. At time 4 the graph height, rather than an area, gives \\(r(4)=-2\\) liters per minute: water is leaving."
        },
        {
          "kind": "prose",
          "text": "An independent algebraic check constructs the amount by integrating each line and matching the endpoint values:"
        },
        {
          "kind": "math",
          "latex": "A(t)=\\begin{cases}20+2t,&0\\le t\\le2,\\\\16+6t-t^2,&2\\le t\\le5,\\\\41-4t,&5\\le t\\le6.\\end{cases}"
        },
        {
          "kind": "prose",
          "text": "These formulas agree at the joins and satisfy \\(A'=r\\). They give \\(A(3)=25\\) and \\(A(6)=17\\). A proposal to add all 13 crossed liters to the initial amount would count outgoing water as added water; a proposal to use \\(r(4)=-2\\) as an amount would also have the wrong units."
        }
      ],
      "verification": [
        "Author self-check: integrate and differentiate the three amount pieces; check endpoint continuity, positivity, the turning time and both totals.",
        "Author self-check: exact polygonal-area reconstruction agrees with the amount function."
      ]
    },
    {
      "id": "pulse-record",
      "revision": 1,
      "title": "A sequence of liquid deliveries",
      "problem": [
        {
          "kind": "prose",
          "text": "A device makes separate deliveries into an otherwise empty container. The first delivery is 3 milliliters; every subsequent delivery is exactly one quarter of the preceding delivery. There is no loss between deliveries. A label describes the eventual total as 4 milliliters. After exactly three deliveries, determine the amount already in the container, the amount in the next delivery and the amount still to come if the process continues indefinitely. Decide whether the label is correct. Find the least positive number of completed deliveries after which the amount still to come is strictly less than \\(1/100\\) milliliter. State the count explicitly, and explain why one fewer delivery fails."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "List the first three deliveries, then separate a single future delivery from all future deliveries combined. A completed-delivery count starts at 1, not 0."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "If \\(k\\) deliveries have been completed, their amounts are \\(3(1/4)^{j-1}\\) for \\(1\\le j\\le k\\). Derive the finite sum before taking its limit."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "The eventual total is \\(3/(1-1/4)\\). The remaining amount after \\(k\\) deliveries is \\(4(1/4)^k=4^{1-k}\\). Compare this number with \\(1/100\\) for two consecutive counts."
          }
        ]
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Let \\(a_j=3(1/4)^{j-1}\\) milliliters for positive integers \\(j\\). The finite total after \\(k\\) completed deliveries is"
        },
        {
          "kind": "math",
          "latex": "S_k=3\\frac{1-(1/4)^k}{1-1/4}=4(1-4^{-k})."
        },
        {
          "kind": "prose",
          "text": "Since \\(1/4<1\\), the limit is 4 milliliters, so the label correctly describes the eventual total, not the total after any finite number of deliveries. After three deliveries, the answers are"
        },
        {
          "kind": "math",
          "latex": "S_3=\\frac{63}{16}\\ \\mathrm{mL},\\qquad a_4=\\frac3{64}\\ \\mathrm{mL},\\qquad 4-S_3=\\frac1{16}\\ \\mathrm{mL}."
        },
        {
          "kind": "prose",
          "text": "The remainder exceeds the next delivery because it includes later positive deliveries too. The residual after \\(k\\) deliveries is \\(R_k=4^{1-k}\\) milliliters. At \\(k=4\\) it is \\(1/64>1/100\\); at \\(k=5\\) it is \\(1/256<1/100\\). These tails strictly decrease, so the least count is five completed deliveries."
        },
        {
          "kind": "prose",
          "text": "Directly adding \\(3+3/4+3/16\\) verifies the three-delivery total. Summing the remaining geometric progression from \\(3/64\\) gives \\((3/64)/(1-1/4)=1/16\\), a second check on the tail. No measurement time or continuous flow rate is specified, so a time derivative would not answer this question."
        }
      ],
      "verification": [
        "Author self-check: finite geometric identity, direct three-term addition, next-term indexing and exact rational tail inequalities.",
        "Author self-check: positivity and strict monotonic decrease establish minimality of five deliveries."
      ]
    }
  ],
  "alternatives": [
    {
      "kind": "prose",
      "text": "For a polygonal rate, reconstruct each affine formula and integrate it, or use exact signed trapezoids and split at every zero for total magnitude. Agreement checks the translation as well as the arithmetic."
    },
    {
      "kind": "prose",
      "text": "For a finite increment of an explicit function, direct endpoint subtraction verifies the derivative-based estimate and reveals its error. For a geometric delivery record, direct early terms verify indexing before the general finite identity is used."
    },
    {
      "kind": "prose",
      "text": "These tasks practice object choice in specified one-dimensional models. They do not establish mastery of arbitrary plots, uncertain measurements, differential-equation modeling or multivariable interpretation."
    }
  ],
  "related": [
    "integral-applications",
    "series-errors",
    "strategy-choice"
  ],
  "next": [
    "strategy-choice"
  ],
  "references": [
    {
      "sourceId": "openstax-calculus-1",
      "url": "https://openstax.org/books/calculus-volume-1/pages/3-1-defining-the-derivative",
      "use": "reference-only"
    },
    {
      "sourceId": "openstax-calculus-1",
      "url": "https://openstax.org/books/calculus-volume-1/pages/5-2-the-definite-integral",
      "use": "reference-only"
    },
    {
      "sourceId": "openstax-calculus-2",
      "url": "https://openstax.org/books/calculus-volume-2/pages/5-2-infinite-series",
      "use": "reference-only"
    }
  ],
  "review": {
    "status": "draft"
  },
  "exposureAudit": {
    "status": "pending"
  }
};
