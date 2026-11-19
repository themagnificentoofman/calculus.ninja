export default {
  "id": "strategy-choice",
  "revision": 1,
  "title": "Method selection for integrals and series",
  "summary": "Choose a useful representation for a changing integral, an exact integral or a series, then justify the choice and verify the result through a different calculation.",
  "objectives": [
    "Separate the requested object from the appearance of the expression.",
    "Choose a short valid representation while stating the domain and theorem conditions.",
    "Preserve finite endpoint terms and justify limits or interchanges before using infinite formulas.",
    "Distinguish an exact evaluation from an approximation with a proved error bound."
  ],
  "prerequisites": [
    "strategy-object",
    "ftc",
    "substitution",
    "rational-trig",
    "power-series"
  ],
  "readiness": [
    {
      "lessonId": "strategy-object",
      "exerciseId": "tank-record",
      "prompt": "Choose a height, signed accumulation or total magnitude from the quantity requested."
    },
    {
      "lessonId": "ftc",
      "exerciseId": "crossing-endpoints",
      "prompt": "Differentiate both moving endpoints with their actual speeds and signs."
    },
    {
      "lessonId": "rational-trig",
      "exerciseId": "divide-before-decomposing",
      "prompt": "Simplify an improper rational expression before choosing its primitive kernels."
    },
    {
      "lessonId": "power-series",
      "exerciseId": "weighted-geometric-center",
      "prompt": "Track a changed series center, its interval and the operation performed inside that interval."
    }
  ],
  "sections": [
    {
      "id": "choose-representation",
      "title": "Compare representations after identifying the object",
      "body": [
        {
          "kind": "prose",
          "text": "First state whether the answer is a number, a function, a derivative, a convergence decision or an error bound. Next inspect the structure: an exact factorization, a derivative inside a composition, simple primitives, a finite cancellation, or a familiar series with a known domain. A method is useful when it simplifies the requested object and preserves the original conditions."
        },
        {
          "kind": "prose",
          "text": "For a rational integrand, polynomial division may expose an elementary term plus a logarithmic derivative. A change of variable may do the same work in one expression. Both can be valid; compare the algebra and the endpoint bookkeeping instead of assuming there is exactly one allowed method. A named technique is not a substitute for the identity that justifies it."
        },
        {
          "kind": "prose",
          "text": "For a derivative of an integral with continuous integrand \\(f\\), a fixed lower endpoint \\(a\\) and a differentiable upper endpoint \\(g(x)\\), the FTC and chain rule give the following formula wherever \\(f\\) is continuous throughout the needed interval:"
        },
        {
          "kind": "math",
          "latex": "\\frac{\\mathrm{d}}{\\mathrm{d}x}\\int_a^{g(x)}f(t)\\,\\mathrm{d}t=f(g(x))g'(x)."
        },
        {
          "kind": "prose",
          "text": "If an elementary primitive is also short, evaluate the integral first and differentiate the resulting function as a second route. The variable \\(t\\) is the integration variable; \\(x\\) controls the endpoint. The value of the integral at a point is not its rate of change there."
        }
      ]
    },
    {
      "id": "conditions-before-shortcuts",
      "title": "Check domains, branches and convergence before a shortcut",
      "body": [
        {
          "kind": "prose",
          "text": "A real logarithmic primitive requires a nonzero argument on the interval, with an absolute value unless positivity has been established. A substitution must carry the differential and both endpoints; a global inverse is unnecessary for the continuous chain-rule integral identity, but any square root used to express an inverse requires a justified branch. A zero denominator or singular endpoint calls for a separate analysis, not formal cancellation across the singularity."
        },
        {
          "kind": "prose",
          "text": "The geometric identity \\(\\sum_{n=0}^{\\infty}r^n=1/(1-r)\\) requires \\(|r|<1\\). A power series may be differentiated inside its convergence interval, but an endpoint must be tested separately. The resulting algebraic function may exist beyond the series interval without the series representing it there."
        },
        {
          "kind": "prose",
          "text": "For example, at \\(r=-1\\), the formal expression \\(r/(1-r)^2\\) is \\(-1/4\\), but \\(\\sum_{n=1}^{\\infty}n(-1)^n\\) does not converge ordinarily: its terms do not even tend to zero. Here no alternative summation convention is being used."
        }
      ]
    },
    {
      "id": "finite-identities-and-bounds",
      "title": "Use a finite identity or a uniform bound to justify a limit",
      "body": [
        {
          "kind": "prose",
          "text": "A finite sum may be shifted, subtracted, differentiated or integrated term by term without an infinite interchange. Preserve its final terms before passing to a limit. This often supplies both the value and an error bound. For \\(|r|<1\\),"
        },
        {
          "kind": "math",
          "latex": "\\sum_{n=0}^{N}r^n=\\frac{1-r^{N+1}}{1-r},\\qquad \\left|\\frac1{1-r}-\\sum_{n=0}^{N}r^n\\right|\\le\\frac{|r|^{N+1}}{1-|r|}."
        },
        {
          "kind": "prose",
          "text": "When \\(r\\) depends on an integration variable, a common bound \\(|r|\\le q<1\\) on the entire finite interval makes the right-hand side uniformly small. More generally, if continuous approximants \\(P_N\\) and a continuous function \\(H\\) on \\([a,b]\\) satisfy \\(|H(x)-P_N(x)|\\le E_N\\) for every \\(x\\), then the elementary integral inequality gives"
        },
        {
          "kind": "math",
          "latex": "\\left|\\int_a^b H(x)\\,\\mathrm{d}x-\\int_a^b P_N(x)\\,\\mathrm{d}x\\right|\\le(b-a)E_N."
        },
        {
          "kind": "prose",
          "text": "If \\(E_N\\to0\\), this proves that the integrals converge to the desired integral. Merely knowing that \\(P_N(x)\\to H(x)\\) at each point does not supply a common error bound. In the transfer below, an exact geometric remainder supplies it directly, so no unproved interchange is hidden in the calculation."
        }
      ]
    },
    {
      "id": "what-counts-as-a-check",
      "title": "Verify a different part of the reasoning",
      "body": [
        {
          "kind": "prose",
          "text": "Repeating the same algebra with a calculator checks arithmetic but may repeat the same modeling mistake. A stronger second route changes the representation: evaluate a primitive and differentiate it, compare an exact finite identity with a series theorem, or compare a closed-form integral with a rigorously bounded sequence of polynomial integrals."
        },
        {
          "kind": "prose",
          "text": "An approximate numerical match is useful for scale, but it cannot prove an exact identity, endpoint convergence or a stated tolerance. An exact answer does not itself explain why a proposed short approximation is within tolerance; supply an explicit remainder estimate. When two routes use the same theorem, describe them as alternative calculations rather than mathematically independent proofs."
        },
        {
          "kind": "prose",
          "text": "An answer can be checked at several levels: does the selected object match the question, do the hypotheses hold, does the calculation preserve all factors and endpoints, and does the result have a sensible sign or bound? The exercises ask for the route you choose before consulting the progressively more specific hints."
        }
      ]
    }
  ],
  "worked": [
    {
      "id": "changing-window",
      "revision": 1,
      "title": "A quantity defined by a moving observation window",
      "problem": [
        {
          "kind": "prose",
          "text": "For real \\(x\\), let"
        },
        {
          "kind": "math",
          "latex": "J(x)=\\int_1^{x^2+1}(2t+1)\\,\\mathrm{d}t."
        },
        {
          "kind": "prose",
          "text": "Find the instantaneous rate of change of \\(J\\) with respect to \\(x\\) at \\(x=-1\\). Give two valid calculations and explain how a positive integrand can lead to a negative answer."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "The requested object is \\(J'(-1)\\), not \\(J(-1)\\). The integrand is continuous everywhere and the upper endpoint is differentiable. On the actual integration interval, \\(t\\ge1\\), so the integrand is positive. The FTC with the endpoint speed gives"
        },
        {
          "kind": "math",
          "latex": "J'(x)=(2(x^2+1)+1)(2x)=4x^3+6x,\\qquad J'(-1)=-10."
        },
        {
          "kind": "prose",
          "text": "For a second calculation, \\(t^2+t\\) is a primitive. Keep both endpoint values:"
        },
        {
          "kind": "math",
          "latex": "J(x)=(x^2+1)^2+(x^2+1)-2=x^4+3x^2."
        },
        {
          "kind": "prose",
          "text": "Differentiating this polynomial again gives \\(4x^3+6x\\). Also \\(J(-1)=4\\), which is a different object. Near \\(x=-1\\), increasing \\(x\\) moves the upper endpoint left because its speed \\(2x\\) is negative. The accumulated quantity therefore decreases despite the positive integrand. Omitting the endpoint speed would give 5 at this point, which fails both the direct derivative and the sign check."
        }
      ],
      "verification": [
        "Author self-check: direct primitive endpoint expansion, polynomial derivative and FTC-chain expression agree for every real x.",
        "Author self-check: exact difference quotient at x=−1 tends to −10; endpoint speed is negative there."
      ]
    },
    {
      "id": "weighted-record",
      "revision": 1,
      "title": "A weighted sequence of contributions",
      "problem": [
        {
          "kind": "prose",
          "text": "Determine the exact sum"
        },
        {
          "kind": "math",
          "latex": "S=\\sum_{n=1}^{\\infty}n\\left(\\frac27\\right)^n."
        },
        {
          "kind": "prose",
          "text": "Check it by a finite identity that still makes sense before an infinite sum has been justified."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "A factor \\(n\\) suggests differentiating the geometric series and then multiplying by the variable. For \\(|r|<1\\), the power-series differentiation theorem applies within its open convergence interval:"
        },
        {
          "kind": "math",
          "latex": "\\sum_{n=1}^{\\infty}nr^n=r\\frac{\\mathrm{d}}{\\mathrm{d}r}\\frac1{1-r}=\\frac{r}{(1-r)^2}."
        },
        {
          "kind": "prose",
          "text": "The actual ratio is \\(r=2/7\\), so \\(S=14/25\\). To verify this without subtracting unproved infinite sums, define \\(S_N=\\sum_{n=1}^N nr^n\\) for positive integers \\(N\\). Shift the finite sum and retain its last term:"
        },
        {
          "kind": "math",
          "latex": "(1-r)S_N=\\sum_{n=1}^{N}r^n-Nr^{N+1},\\qquad S_N=\\frac{r-(N+1)r^{N+1}+Nr^{N+2}}{(1-r)^2}."
        },
        {
          "kind": "prose",
          "text": "For \\(r=2/7\\), set \\(b_N=Nr^N\\). Then \\(b_{N+1}/b_N=((N+1)/N)(2/7)\\le4/7<1\\) for every \\(N\\ge1\\). Induction gives \\(0<b_N\\le b_1(4/7)^{N-1}\\to0\\). Also \\(r^N\\to0\\). Thus every finite endpoint correction tends to zero, proving that \\(S_N\\to r/(1-r)^2=14/25\\). This second route establishes ordinary convergence directly."
        },
        {
          "kind": "prose",
          "text": "The first two terms are \\(2/7+8/49=22/49\\), which is positive and smaller than \\(14/25\\); positive omitted terms make that scale check necessary. The same rational expression would not justify a sum outside \\(|r|<1\\)."
        }
      ],
      "verification": [
        "Author self-check: multiply the finite identity by (1−r)^2 and expand; verify N=1 and recover the Nth summand by successive differences.",
        "Author self-check: bound Nr^N by a convergent geometric sequence at r=2/7, independently of power-series differentiation."
      ]
    }
  ],
  "contrast": [
    {
      "kind": "prose",
      "text": "At \\(x=-1\\) in the moving-window example, the integral is 4 and its derivative is \\(-10\\). Knowing an integral value does not answer a rate question."
    },
    {
      "kind": "prose",
      "text": "On \\([0,1]\\), \\(1+x^2\\) is positive, so a primitive involving \\(\\ln(1+x^2)\\) has no branch problem. A superficially similar denominator \\(1-x^2\\) vanishes at the upper endpoint; a finite endpoint substitution alone would not establish an ordinary improper integral."
    },
    {
      "kind": "prose",
      "text": "A series identity inside its convergence interval is not an endpoint assignment. A uniform remainder estimate on a compact interval justifies the limit of integrals used here; pointwise convergence alone is not that estimate."
    }
  ],
  "mistakes": [
    "Choosing a familiar technique before identifying whether the question asks for a value, rate, function or bound.",
    "Dropping the speed of a moving endpoint or the last term of a shifted finite sum.",
    "Using a rational closed form as the ordinary sum where the original series diverges.",
    "Treating the first omitted term as a bound for a positive tail without an applicable theorem.",
    "Reporting a decimal comparison as proof of an exact value or a rigorous tolerance."
  ],
  "exercises": [
    {
      "id": "exact-integral-record",
      "revision": 1,
      "title": "An exact quantity on a finite interval",
      "problem": [
        {
          "kind": "math",
          "latex": "I=\\int_0^1\\frac{x^3+2x}{1+x^2}\\,\\mathrm{d}x."
        },
        {
          "kind": "prose",
          "text": "Find \\(I\\) exactly. Before calculating, describe the feature that makes your chosen route useful and check its domain. Verify the value by a second calculation with a different representation."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Compare the numerator with \\(x(1+x^2)\\). Also compare the factor \\(x\\,\\mathrm{d}x\\) with the change in \\(1+x^2\\). Either observation can lead to a short calculation."
          }
        ],
        [
          {
            "kind": "math",
            "latex": "\\frac{x^3+2x}{1+x^2}=x+\\frac{x}{1+x^2}."
          },
          {
            "kind": "prose",
            "text": "For another route, set \\(u=1+x^2\\). Rewrite all occurrences of \\(x^2\\) and both endpoints, rather than just changing the denominator."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "The first route uses the primitive \\(x^2/2+\\tfrac12\\ln(1+x^2)\\). The second gives \\(\\tfrac12\\int_1^2(1+1/u)\\,\\mathrm{d}u\\). Check that both account for the additional positive term."
          }
        ]
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "The denominator is at least 1 on the entire interval, so the integral is proper and every logarithm argument below is positive. Polynomial division gives \\(x+x/(1+x^2)\\); the remainder is a constant multiple of the logarithmic derivative of \\(1+x^2\\). Therefore"
        },
        {
          "kind": "math",
          "latex": "I=\\left[\\frac{x^2}{2}+\\frac12\\ln(1+x^2)\\right]_0^1=\\frac{1+\\ln2}{2}."
        },
        {
          "kind": "prose",
          "text": "For a second calculation, use \\(u=1+x^2\\). On this interval the substitution is increasing, the new endpoints are 1 and 2, and \\(\\mathrm{d}u=2x\\,\\mathrm{d}x\\). Writing \\(x^3+2x=x(x^2+2)\\) yields"
        },
        {
          "kind": "math",
          "latex": "I=\\frac12\\int_1^2\\frac{u+1}{u}\\,\\mathrm{d}u=\\frac12[u+\\ln u]_1^2=\\frac{1+\\ln2}{2}."
        },
        {
          "kind": "prose",
          "text": "There is no need to divide by \\(x\\) at the endpoint zero or introduce an inverse square root; the chain-rule substitution identity is valid with a vanishing endpoint derivative. A direct derivative of the first primitive recovers the original integrand as a further check."
        },
        {
          "kind": "prose",
          "text": "Replacing the integrand by \\(x\\) would discard \\(x/(1+x^2)\\), which is positive on \\((0,1]\\). Indeed \\(x/2\\le x/(1+x^2)\\le x\\), giving \\(3/4\\le I\\le1\\). The exact value lies in that interval and exceeds \\(1/2\\), the result of the invalid omission."
        }
      ],
      "verification": [
        "Author self-check: exact algebraic division, differentiated primitive and transformed endpoint evaluation agree.",
        "Author self-check: the denominator stays positive; elementary integral bounds reject the omitted-remainder answer."
      ]
    },
    {
      "id": "series-defined-area",
      "revision": 1,
      "title": "A region described by an infinite expression",
      "problem": [
        {
          "kind": "prose",
          "text": "For \\(1\\le x\\le3\\), define"
        },
        {
          "kind": "math",
          "latex": "H(x)=\\sum_{n=0}^{\\infty}\\frac{(x-2)^n}{3^{n+1}}."
        },
        {
          "kind": "prose",
          "text": "Determine the exact area of the region between this graph and the horizontal axis over the stated interval. A proposed calculation keeps only the terms with indices \\(n=0,1,2\\) and reports area \\(56/81\\). Decide, without relying on a decimal evaluation of a transcendental function, whether that reported area has absolute error less than \\(1/500\\). Explain and justify a route to the exact value and a route to the error claim. Also decide whether the same displayed infinite expression defines a value at \\(x=5\\)."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Inspect the ratio of consecutive terms, its largest absolute value on the whole interval, and the sign of the resulting function. The exact area and the error claim may be easiest in different representations."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "The geometric sum is \\(1/(5-x)\\) where \\(|x-2|<3\\). For a polynomial truncation \\(P_N\\), its exact geometric remainder has a common bound on \\([1,3]\\). To improve the area bound, center the interval using \\(y=x-2\\); every odd power integrates to zero."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "After integrating, the even terms contribute \\(2/[(2k+1)3^{2k+1}]\\). The reported value keeps \\(k=0,1\\). In the remaining positive tail \\(k\\ge2\\), use \\(2k+1\\ge5\\) and sum a geometric bound. Check \\(x=5\\) in the original terms themselves."
          }
        ]
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "On \\([1,3]\\), the ratio \\(r=(x-2)/3\\) satisfies \\(|r|\\le1/3<1\\). Hence the series converges and equals \\(H(x)=1/(5-x)>0\\). Since the graph is above the axis, its area is the ordinary definite integral:"
        },
        {
          "kind": "math",
          "latex": "A=\\int_1^3\\frac1{5-x}\\,\\mathrm{d}x=[-\\ln(5-x)]_1^3=\\ln2."
        },
        {
          "kind": "prose",
          "text": "For the error claim, set \\(P_N(x)=\\sum_{n=0}^{N}(x-2)^n/3^{n+1}\\). The exact finite geometric identity gives a uniform estimate:"
        },
        {
          "kind": "math",
          "latex": "|H(x)-P_N(x)|\\le\\frac13\\frac{(1/3)^{N+1}}{1-1/3}=\\frac12\\,3^{-(N+1)}\\quad(1\\le x\\le3)."
        },
        {
          "kind": "prose",
          "text": "The integral error is therefore at most \\(3^{-(N+1)}\\to0\\). This proves that the integrals of the finite polynomials converge to the area; it justifies the infinite calculation rather than assuming it. With \\(y=x-2\\), the interval becomes \\([-1,1]\\). Odd powers integrate to zero, and each even power \\(y^{2k}\\) integrates to \\(2/(2k+1)\\). Thus"
        },
        {
          "kind": "math",
          "latex": "A=\\sum_{k=0}^{\\infty}\\frac{2}{(2k+1)3^{2k+1}},\\qquad \\int_1^3P_2(x)\\,\\mathrm{d}x=\\frac23+\\frac2{81}=\\frac{56}{81}."
        },
        {
          "kind": "prose",
          "text": "Every omitted even contribution is positive. Bounding its denominator by \\(2k+1\\ge5\\) yields a geometric upper bound on the whole tail:"
        },
        {
          "kind": "math",
          "latex": "0<A-\\frac{56}{81}\\le\\frac25\\sum_{k=2}^{\\infty}3^{-(2k+1)}=\\frac25\\frac{3^{-5}}{1-1/9}=\\frac1{540}<\\frac1{500}."
        },
        {
          "kind": "prose",
          "text": "The proposed approximation is therefore below the exact area and has the claimed strict error tolerance. The coarse uniform estimate alone at \\(N=2\\) would only give \\(1/27\\), so cancellation of the odd integrals and control of the remaining positive tail are substantive additional steps."
        },
        {
          "kind": "prose",
          "text": "At \\(x=5\\), every original term is \\(1/3\\), which does not tend to zero; the series diverges. The identity \\(H(x)=1/(5-x)\\) was established only for \\(|x-2|<3\\). No value at the endpoint is obtained by the interior formula."
        }
      ],
      "verification": [
        "Author self-check: closed-form primitive and finite geometric remainder agree with the exact area-series derivation.",
        "Author self-check: integrate each finite polynomial before taking a uniformly controlled limit; verify the positive tail bound 1/540 and both rational comparisons.",
        "Author self-check: at x=5 the individual terms are 1/3, rejecting any ordinary endpoint value."
      ]
    }
  ],
  "alternatives": [
    {
      "kind": "prose",
      "text": "In the first transfer, division and a change of variable are two short representations of the same proper integral; differentiating a proposed primitive checks the full integrand. The second transfer uses a closed form for exact evaluation and finite polynomial integrals with a tail bound for a certified approximation."
    },
    {
      "kind": "prose",
      "text": "The weighted-series finite identity proves convergence without relying on differentiated infinite sums; the power-series route is shorter once its hypotheses are known. The purpose of a second route is to test a different possible mistake, not to force every problem into two equally long solutions."
    },
    {
      "kind": "prose",
      "text": "These cases assess a bounded set of choices involving elementary integration, moving endpoints and geometric power series. They do not certify general Mixed mastery, arbitrary method selection, or Hard and Olympiad techniques."
    }
  ],
  "related": [
    "strategy-object",
    "taylor-remainders",
    "series-errors",
    "symmetry"
  ],
  "next": [
    "parameter-integrals",
    "generating"
  ],
  "references": [
    {
      "sourceId": "openstax-calculus-1",
      "url": "https://openstax.org/books/calculus-volume-1/pages/5-3-the-fundamental-theorem-of-calculus",
      "use": "reference-only"
    },
    {
      "sourceId": "openstax-calculus-2",
      "url": "https://openstax.org/books/calculus-volume-2/pages/5-2-infinite-series",
      "use": "reference-only"
    },
    {
      "sourceId": "openstax-calculus-2",
      "url": "https://openstax.org/books/calculus-volume-2/pages/6-1-power-series-and-functions",
      "use": "reference-only"
    },
    {
      "sourceId": "openstax-calculus-2",
      "url": "https://openstax.org/books/calculus-volume-2/pages/6-2-properties-of-power-series",
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
