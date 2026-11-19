// Original draft; independent review and owner corrections recorded privately. Admission remains pending.
export default {
  "id": "beta-gamma",
  "revision": 1,
  "title": "Beta and Gamma integrals: convergence, recurrences and substitutions",
  "summary": "Define the real Beta and Gamma integrals, prove their connection, and use their domains and scale factors to evaluate endpoint and tail integrals.",
  "objectives": [
    "Prove the convergence conditions of the defining real integrals before using their values.",
    "Derive the Gamma recurrence and the Beta–Gamma identity with boundary terms and the Jacobian accounted for.",
    "Recognize a transformed Beta or Gamma integral while retaining orientation and scale.",
    "Distinguish an integral representation from an extension of a special function outside that representation’s domain."
  ],
  "prerequisites": [
    "parts",
    "improper",
    "coordinates",
    "exp-log"
  ],
  "readiness": [
    {
      "lessonId": "parts",
      "exerciseId": "twice-trigonometric",
      "prompt": "Evaluate both endpoints of every integration-by-parts boundary term."
    },
    {
      "lessonId": "improper",
      "exerciseId": "logarithmic-endpoint",
      "prompt": "Test each improper endpoint rather than assigning a value from a formal expression."
    },
    {
      "lessonId": "coordinates",
      "exerciseId": "elliptic-disk-moment",
      "prompt": "Track the absolute Jacobian and justify omitted boundary sets."
    }
  ],
  "sections": [
    {
      "id": "real-definitions",
      "title": "The defining integrals and their real domains",
      "body": [
        {
          "kind": "prose",
          "text": "All parameters in this lesson are real. For a positive base, use \\(t^r=e^{r\\ln t}\\). Define the Gamma and Beta functions by"
        },
        {
          "kind": "math",
          "latex": "\\Gamma(s)=\\int_0^\\infty t^{s-1}e^{-t}\\,\\mathrm dt\\quad(s>0),\\qquad B(a,b)=\\int_0^1t^{a-1}(1-t)^{b-1}\\,\\mathrm dt\\quad(a,b>0)."
        },
        {
          "kind": "prose",
          "text": "Each integral is an ordinary improper integral: every endpoint is tested separately. Near zero, \\(e^{-t}\\) is between \\(e^{-1}\\) and 1, so the Gamma integrand is comparable to \\(t^{s-1}\\). This endpoint is integrable exactly when \\(s>0\\). For its tail, put \\(q=\\max(s-1,0)\\) and \\(h(t)=t^q e^{-t/2}\\) on \\(t\\ge1\\). Differentiation gives \\(h\\prime(t)=t^{q-1}e^{-t/2}(q-t/2)\\). Thus \\(h\\) decreases once \\(t>2q\\), and is bounded above by a finite constant \\(C\\) on the remaining finite interval as well. Consequently"
        },
        {
          "kind": "math",
          "latex": "t^{s-1}e^{-t}\\le h(t)e^{-t/2}\\le Ce^{-t/2}\\qquad(t\\ge1)."
        },
        {
          "kind": "prose",
          "text": "The last function has a finite integral. For Beta, the factor \\((1-t)^{b-1}\\) stays between positive finite bounds near zero, and \\(t^{a-1}\\) does so near one. The two endpoint tests therefore give exactly \\(a>0\\) and \\(b>0\\). If either exponent parameter is zero, the corresponding endpoint has logarithmic divergence. A singular endpoint can be integrable; being unbounded alone is not a divergence test."
        }
      ]
    },
    {
      "id": "gamma-recurrence",
      "title": "A recurrence with vanishing boundary terms",
      "body": [
        {
          "kind": "prose",
          "text": "Integrate \\(t^s e^{-t}\\) by parts first on \\([\\varepsilon,R]\\), where \\(0<\\varepsilon<R\\). Then"
        },
        {
          "kind": "math",
          "latex": "\\int_\\varepsilon^R t^s e^{-t}\\,\\mathrm dt=[-t^s e^{-t}]_\\varepsilon^R+s\\int_\\varepsilon^R t^{s-1}e^{-t}\\,\\mathrm dt."
        },
        {
          "kind": "prose",
          "text": "For \\(s>0\\), the lower boundary tends to zero. An exponential-tail estimate as above makes the upper boundary tend to zero. Thus \\(\\Gamma(s+1)=s\\Gamma(s)\\). Direct integration gives \\(\\Gamma(1)=1\\), hence \\(\\Gamma(n+1)=n!\\) for each nonnegative integer \\(n\\), including \\(0!=1\\). The shift matters: \\(\\Gamma(n)=(n-1)!\\) when \\(n\\ge1\\). This proof does not make the defining integral converge for nonpositive \\(s\\)."
        }
      ]
    },
    {
      "id": "beta-gamma-identity",
      "title": "Separate a positive double integral by sum and proportion",
      "body": [
        {
          "kind": "prose",
          "text": "For \\(a,b>0\\), the product of the two finite Gamma integrals is the integral of \\(x^{a-1}y^{b-1}e^{-(x+y)}\\) over \\(x,y>0\\). The integrand is nonnegative; Tonelli permits the iterated integrals. Set \\(r=x+y\\) and \\(t=x/(x+y)\\). The inverse map and its area factor are"
        },
        {
          "kind": "math",
          "latex": "x=rt,\\quad y=r(1-t),\\quad r>0,\\ 0<t<1,\\qquad \\left|\\frac{\\partial(x,y)}{\\partial(r,t)}\\right|=\\left|\\det\\begin{pmatrix}t&r\\\\1-t&-r\\end{pmatrix}\\right|=r."
        },
        {
          "kind": "prose",
          "text": "This map is a continuously differentiable bijection between the two open regions, with nonzero determinant there. Apply change of variables first on compact pieces away from the boundaries and enlarge them. For nonnegative integrands, the integral over an increasing exhaustion is the supremum of the integrals over those pieces; this monotone limit introduces no cancellation. The transformed integrand separates:"
        },
        {
          "kind": "math",
          "latex": "\\Gamma(a)\\Gamma(b)=\\int_0^\\infty\\int_0^1 e^{-r}r^{a+b-1}t^{a-1}(1-t)^{b-1}\\,\\mathrm dt\\,\\mathrm dr=\\Gamma(a+b)B(a,b)."
        },
        {
          "kind": "prose",
          "text": "Since \\(\\Gamma(a+b)>0\\), division proves the identity below. Its recurrence consequences follow by replacing one parameter by its successor and applying the Gamma recurrence."
        },
        {
          "kind": "math",
          "latex": "B(a,b)=\\frac{\\Gamma(a)\\Gamma(b)}{\\Gamma(a+b)},\\qquad B(a+1,b)=\\frac{a}{a+b}B(a,b),\\qquad B(a,b+1)=\\frac{b}{a+b}B(a,b)."
        },
        {
          "kind": "prose",
          "text": "In particular, for nonnegative integers \\(j,k\\), \\(B(j+1,k+1)=j!k!/(j+k+1)!\\). Reflection of the interval, \\(t\\mapsto1-t\\), also proves \\(B(a,b)=B(b,a)\\) directly."
        }
      ]
    },
    {
      "id": "half-integer-values",
      "title": "Compute a half-integer value without assuming a Gaussian formula",
      "body": [
        {
          "kind": "prose",
          "text": "On \\(0<t<1\\), put \\(t=\\sin^2\\theta\\) with \\(0<\\theta<\\pi/2\\). Both sine and cosine are positive on this branch, so the square roots introduce no sign change. Since \\(\\mathrm dt=2\\sin\\theta\\cos\\theta\\,\\mathrm d\\theta\\),"
        },
        {
          "kind": "math",
          "latex": "B(1/2,1/2)=\\int_0^1\\frac{\\mathrm dt}{\\sqrt{t(1-t)}}=2\\int_0^{\\pi/2}\\mathrm d\\theta=\\pi."
        },
        {
          "kind": "prose",
          "text": "The Beta–Gamma identity and \\(\\Gamma(1)=1\\) give \\(\\Gamma(1/2)^2=\\pi\\). The defining integral is positive, so \\(\\Gamma(1/2)=\\sqrt\\pi\\). Recurrence then yields \\(\\Gamma(3/2)=\\sqrt\\pi/2\\) and \\(\\Gamma(5/2)=3\\sqrt\\pi/4\\). This order of proof avoids assuming the Gaussian integral that a later lesson will derive from this value."
        }
      ]
    },
    {
      "id": "substitution-ledger",
      "title": "Choose the substitution and carry all its powers",
      "body": [
        {
          "kind": "prose",
          "text": "For \\(c,p,a>0\\), the increasing substitution \\(u=cx^p\\) sends the positive half-line onto itself. Multiplying the transformed power by the differential gives"
        },
        {
          "kind": "math",
          "latex": "\\int_0^\\infty x^{a-1}e^{-cx^p}\\,\\mathrm dx=\\frac1{p\\,c^{a/p}}\\Gamma(a/p)."
        },
        {
          "kind": "prose",
          "text": "The condition \\(a>0\\) tests zero; the positive \\(c,p\\) make the tail decay. For a rational tail, \\(t=x/(1+x)\\) is an increasing bijection from \\((0,\\infty)\\) to \\((0,1)\\), with inverse \\(x=t/(1-t)\\) and \\(\\mathrm dx=\\mathrm dt/(1-t)^2\\). Therefore"
        },
        {
          "kind": "math",
          "latex": "\\int_0^\\infty\\frac{x^{a-1}}{(1+x)^{a+b}}\\,\\mathrm dx=B(a,b)\\qquad(a,b>0)."
        },
        {
          "kind": "prose",
          "text": "On a finite interval \\((L,U)\\), where \\(L<U\\), use \\(x=L+(U-L)t\\). For \\(a,b>0\\),"
        },
        {
          "kind": "math",
          "latex": "\\int_L^U(x-L)^{a-1}(U-x)^{b-1}\\,\\mathrm dx=(U-L)^{a+b-1}B(a,b)."
        },
        {
          "kind": "prose",
          "text": "In each case the equality is first a substitution on finite interior cutoffs, followed by the justified improper limits. If a substitution is decreasing, reverse its endpoint order along with the differential sign. Recognition of a named integral never replaces this ledger."
        }
      ]
    },
    {
      "id": "tier-relevance",
      "title": "Where these methods enter the difficulty groups",
      "body": [
        {
          "kind": "prose",
          "text": "This lesson assumes the substitution and endpoint concepts introduced at Easy difficulty. For Medium integration, the worked tail and exponential transfer extend substitution and basic improper-integral checks. For Hard integration, the defining convergence proofs, recurrences and Beta–Gamma conversion teach the expected special-function and reduction concepts. For Olympiad integration and multivariable moment work, these are foundations: they supply normalization constants but do not prove asymptotic limit exchanges, reflection formulas, logarithmic parameter derivatives, contour methods or sharp inequalities."
        }
      ]
    }
  ],
  "worked": [
    {
      "id": "two-singular-endpoint-powers",
      "revision": 1,
      "title": "An integrable endpoint singularity after interval scaling",
      "problem": [
        {
          "kind": "prose",
          "text": "Evaluate the ordinary improper integral \\(\\int_2^5 (x-2)^{-1/2}(5-x)^{3/2}\\,\\mathrm dx\\), proving convergence at both endpoints."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Near 2 the second factor stays bounded above and below by positive constants, leaving the integrable power \\((x-2)^{-1/2}\\). Near 5 the first factor stays bounded and the power is \\((5-x)^{3/2}\\), also integrable. Set \\(x=2+3t\\). The power and differential factors multiply to \\(3^{-1/2}3^{3/2}3=9\\)."
        },
        {
          "kind": "math",
          "latex": "I=9B(1/2,5/2)=9\\frac{\\sqrt\\pi\\,(3\\sqrt\\pi/4)}{\\Gamma(3)}=\\frac{27\\pi}{8}."
        },
        {
          "kind": "prose",
          "text": "A direct trigonometric check uses \\(x=2+3\\sin^2\\theta\\) on \\(0<\\theta<\\pi/2\\), giving \\(I=18\\int_0^{\\pi/2}\\cos^4\\theta\\,\\mathrm d\\theta\\). The identity \\(\\cos^4\\theta=(3+4\\cos2\\theta+\\cos4\\theta)/8\\) makes that value \\(18(3\\pi/16)=27\\pi/8\\). No finite value of the original integrand at 2 is needed."
        }
      ],
      "verification": [
        "Author self-check: endpoint comparisons and exact interval-scale exponent.",
        "Author second route: trigonometric power reduction gives the same constant."
      ]
    },
    {
      "id": "cubic-exponential-moment",
      "revision": 1,
      "title": "A cubic exponential changes both the power and the scale",
      "problem": [
        {
          "kind": "prose",
          "text": "Evaluate \\(\\int_0^\\infty x^5e^{-2x^3}\\,\\mathrm dx\\) and justify its convergence."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "At zero the integrand is bounded by \\(x^5\\). With \\(u=2x^3\\), we have \\(\\mathrm du=6x^2\\,\\mathrm dx\\), so \\(x^5\\,\\mathrm dx=x^3x^2\\,\\mathrm dx=u\\,\\mathrm du/12\\). The transformed tail is a convergent Gamma integral."
        },
        {
          "kind": "math",
          "latex": "I=\\frac1{12}\\int_0^\\infty ue^{-u}\\,\\mathrm du=\\frac{\\Gamma(2)}{12}=\\frac1{12}."
        },
        {
          "kind": "prose",
          "text": "For an elementary second route put \\(v=x^3\\), obtaining \\(I=\\frac13\\int_0^\\infty ve^{-2v}\\,\\mathrm dv\\). Integration by parts on finite cutoffs, with \\(ve^{-2v}\\to0\\), gives \\(\\int_0^\\infty ve^{-2v}\\,\\mathrm dv=1/4\\). The coefficient 2 contributes a squared scale factor, not a single factor."
        }
      ],
      "verification": [
        "Author self-check: exact substitution differential and Gamma recurrence.",
        "Author second route: finite integration by parts after v=x³, retaining its tail boundary."
      ]
    }
  ],
  "contrast": [
    {
      "kind": "prose",
      "text": "An expression involving Gamma values does not certify convergence. For example, \\(\\int_0^\\infty x^3/(1+x)^3\\,\\mathrm dx\\) diverges because its integrand tends to 1. Formally requesting \\(B(4,-1)\\) violates the positive-parameter hypotheses. Special functions have extensions beyond their defining-integral domains, but such extensions do not turn this divergent ordinary integral into a finite one."
    },
    {
      "kind": "prose",
      "text": "Nor does the factorial convention extend by replacing a half-integer with an integer factorial. The actual value \\(\\Gamma(3/2)=\\sqrt\\pi/2\\) follows from the proved half-integer base and recurrence."
    }
  ],
  "mistakes": [
    "Matching the visible power to a Gamma or Beta parameter without adding one.",
    "Dropping an interval length or a power of the exponential scale.",
    "Discarding an integration-by-parts boundary before proving its limit is zero.",
    "Using a Beta–Gamma quotient when an endpoint parameter is nonpositive.",
    "Forgetting that a decreasing exponential substitution reverses the endpoints.",
    "Taking a square root without checking the sign on the selected trigonometric branch."
  ],
  "exercises": [
    {
      "id": "rational-tail-parameter-range",
      "revision": 1,
      "title": "Find the entire convergence range before evaluating a member",
      "problem": [
        {
          "kind": "prose",
          "text": "For real \\(a\\), determine exactly when \\(I(a)=\\int_0^\\infty x^{a-1}/(1+x)^3\\,\\mathrm dx\\) converges. Give its value in Gamma notation on that domain, and evaluate \\(I(3/2)\\)."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Near zero compare with \\(x^{a-1}\\). Near infinity compare with \\(x^{a-4}\\). Both positive tails need finite integrals."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Set \\(t=x/(1+x)\\). Identify both exponents after multiplying by \\((1-t)^{-2}\\) from the differential."
          }
        ],
        [
          {
            "kind": "math",
            "latex": "I(a)=B(a,3-a)\\quad\\text{when }0<a<3,\\qquad \\Gamma(3)=2."
          }
        ]
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "On \\((0,1)\\), the denominator stays between 1 and 8, so convergence requires and is ensured by \\(a>0\\). On \\((1,\\infty)\\), \\(x^3\\le(1+x)^3\\le8x^3\\), so the tail is comparable to \\(x^{a-4}\\) and converges exactly when \\(a<3\\). At \\(a=0\\) or \\(a=3\\) a logarithmic endpoint divergence remains; outside those bounds a power divergence remains."
        },
        {
          "kind": "math",
          "latex": "\\frac{x^{a-1}\\,\\mathrm dx}{(1+x)^3}=t^{a-1}(1-t)^{2-a}\\,\\mathrm dt,\\qquad I(a)=\\frac{\\Gamma(a)\\Gamma(3-a)}{2}\\quad(0<a<3)."
        },
        {
          "kind": "math",
          "latex": "I(3/2)=\\frac{(\\sqrt\\pi/2)^2}{2}=\\frac\\pi8."
        },
        {
          "kind": "prose",
          "text": "As a check at this member, \\(x=\\tan^2\\theta\\) on the first quadrant gives \\(2\\int_0^{\\pi/2}\\sin^2\\theta\\cos^2\\theta\\,\\mathrm d\\theta=\\pi/8\\). The quotient is asserted only on the convergence domain already proved."
        }
      ],
      "verification": [
        "Author self-check: two-sided comparisons at both endpoints give necessary and sufficient strict inequalities.",
        "Author independent calculation route: x=tan²θ and a trigonometric power identity at a=3/2."
      ]
    },
    {
      "id": "decreasing-exponential-beta",
      "revision": 1,
      "title": "A decreasing substitution and a noninteger endpoint power",
      "problem": [
        {
          "kind": "prose",
          "text": "Evaluate \\(\\int_0^\\infty e^{-2t}\\sqrt{1-e^{-t}}\\,\\mathrm dt\\). Explain the convergence and the orientation of your substitution."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Try \\(u=e^{-t}\\). Its values run from 1 down to 0 as \\(t\\) increases."
          }
        ],
        [
          {
            "kind": "math",
            "latex": "\\mathrm dt=-\\frac{\\mathrm du}{u},\\qquad e^{-2t}=u^2."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "The resulting integral is \\(B(2,3/2)\\). You can also integrate after the further substitution \\(v=1-u\\)."
          }
        ]
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "For \\(t\\ge0\\), the square root lies between 0 and 1, so the integrand is at most \\(e^{-2t}\\); it is continuous at zero with value zero and has an integrable tail. On finite cutoffs use \\(u=e^{-t}\\), and then pass to the endpoint limits. The negative differential and reversed bounds cancel."
        },
        {
          "kind": "math",
          "latex": "I=\\int_0^1u(1-u)^{1/2}\\,\\mathrm du=B(2,3/2)=\\frac{\\Gamma(2)\\Gamma(3/2)}{\\Gamma(7/2)}=\\frac4{15}."
        },
        {
          "kind": "prose",
          "text": "For an elementary check, \\(v=1-u\\) gives \\(I=\\int_0^1(v^{1/2}-v^{3/2})\\,\\mathrm dv=2/3-2/5=4/15\\). Here Gamma notation organizes the powers; the elementary route is equally valid and shorter once the substitution is found."
        }
      ],
      "verification": [
        "Author self-check: positivity, exponential majorant and correct reversed endpoints.",
        "Author second route: evaluate two elementary endpoint powers after reflecting the unit interval."
      ]
    }
  ],
  "alternatives": [
    {
      "kind": "prose",
      "text": "For small integer powers, expansion or repeated integration by parts can be simpler than special-function notation. For half-integers, a trigonometric substitution can independently check the value. The named functions are useful when the same convergent integral structure recurs; they do not require abandoning elementary verification."
    },
    {
      "kind": "prose",
      "text": "The next moment lesson uses these constants in simplex and Gaussian integrals. Differentiating Gamma or Beta parameters, analytic continuation, reflection and duplication formulas, and asymptotic expansions are separate topics; no such identity is assumed here."
    }
  ],
  "related": [
    "substitution",
    "improper",
    "coordinates",
    "parameter-integrals",
    "multi-moments"
  ],
  "next": [
    "multi-moments"
  ],
  "references": [
    {
      "sourceId": "dlmf",
      "url": "https://dlmf.nist.gov/5.2#E1",
      "use": "reference-only"
    },
    {
      "sourceId": "dlmf",
      "url": "https://dlmf.nist.gov/5.5#E1",
      "use": "reference-only"
    },
    {
      "sourceId": "dlmf",
      "url": "https://dlmf.nist.gov/5.12",
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
