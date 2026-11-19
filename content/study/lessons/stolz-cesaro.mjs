export default {
  "id": "stolz-cesaro",
  "revision": 1,
  "title": "Stolz–Cesàro and sequence quotient limits",
  "summary": "Replace a quotient of cumulative sequences by a quotient of consecutive differences, after checking the denominator and proving any recurrence behavior needed first.",
  "objectives": [
    "Prove the finite-limit Stolz–Cesàro theorem by telescoping inequalities.",
    "Check eventual strict increase and divergence of the denominator before using the theorem.",
    "Choose a useful accumulated or transformed sequence, and establish its domain and long-term behavior.",
    "Distinguish a sufficient difference test from a necessary condition for a quotient limit."
  ],
  "prerequisites": [
    "partial-sums",
    "recurrences"
  ],
  "readiness": [
    {
      "lessonId": "partial-sums",
      "exerciseId": "harmonic-blocks",
      "prompt": "Explain why vanishing terms can still have unbounded partial sums; the denominator condition concerns the whole accumulated sequence."
    },
    {
      "lessonId": "recurrences",
      "exerciseId": "period-two-transfer",
      "prompt": "Use exact subsequences to disprove convergence before accepting a proposed limit or applying a limit theorem."
    }
  ],
  "sections": [
    {
      "id": "difference-quotients",
      "title": "Compare increments, not derivatives",
      "body": [
        {
          "kind": "prose",
          "text": "Let \\((a_n)\\) and \\((b_n)\\) be real sequences indexed by positive integers. Write \\(\\Delta a_n=a_n-a_{n-1}\\) and \\(\\Delta b_n=b_n-b_{n-1}\\) for \\(n\\ge2\\). A quotient \\(a_n/b_n\\) describes accumulated size, whereas \\(\\Delta a_n/\\Delta b_n\\) compares the newest changes. The two quotients need not be equal at any finite index."
        },
        {
          "kind": "prose",
          "text": "If all sufficiently late increments of \\(b_n\\) are positive, then a late accumulated quotient resembles a weighted average of the increment quotients. A finite initial part becomes negligible only when \\(b_n\\) grows without bound. This is the mechanism behind Stolz–Cesàro; no derivative of a sequence is involved."
        }
      ]
    },
    {
      "id": "theorem",
      "title": "The increasing, unbounded denominator theorem",
      "body": [
        {
          "kind": "prose",
          "text": "Assume there is an integer \\(N_0\\ge1\\) such that \\(b_n>b_{n-1}\\) for every \\(n>N_0\\), and \\(b_n\\to+\\infty\\). If the difference quotient has a finite real limit \\(L\\), then"
        },
        {
          "kind": "math",
          "latex": "\\lim_{n\\to\\infty}\\frac{\\Delta a_n}{\\Delta b_n}=L\\quad\\Longrightarrow\\quad\\lim_{n\\to\\infty}\\frac{a_n}{b_n}=L."
        },
        {
          "kind": "prose",
          "text": "The numerator need not be positive, increasing, or divergent. The denominator is positive and nonzero eventually because it tends to positive infinity. Finite initial terms do not affect this assertion. This lesson proves this finite-\\(L\\), divergent-denominator form; a denominator tending to zero requires a different theorem and additional assumptions."
        }
      ]
    },
    {
      "id": "telescoping-proof",
      "title": "Why the hypotheses give the limit",
      "body": [
        {
          "kind": "prose",
          "text": "Fix \\(\\varepsilon>0\\). Choose \\(N\\ge N_0\\) so that, for every \\(k>N\\), the difference quotient lies between \\(L-\\varepsilon\\) and \\(L+\\varepsilon\\). Multiplying by the positive number \\(\\Delta b_k\\) preserves both inequality directions. Sum from \\(k=N+1\\) to \\(k=n\\):"
        },
        {
          "kind": "math",
          "latex": "(L-\\varepsilon)(b_n-b_N)\\le a_n-a_N\\le(L+\\varepsilon)(b_n-b_N)."
        },
        {
          "kind": "prose",
          "text": "Both sums telescope. For large \\(n\\), divide by positive \\(b_n\\) and rearrange:"
        },
        {
          "kind": "math",
          "latex": "L-\\varepsilon+\\frac{a_N-(L-\\varepsilon)b_N}{b_n}\\le\\frac{a_n}{b_n}\\le L+\\varepsilon+\\frac{a_N-(L+\\varepsilon)b_N}{b_n}."
        },
        {
          "kind": "prose",
          "text": "The two correction fractions tend to zero, since their numerators are fixed and \\(b_n\\to+\\infty\\). Given a desired error \\(\\eta>0\\), take \\(\\varepsilon=\\eta/2\\), then take \\(n\\) large enough to make both correction magnitudes less than \\(\\eta/2\\). This gives \\(|a_n/b_n-L|<\\eta\\). Strictly positive increments supplied the inequalities; an unbounded denominator removed the initial contribution."
        }
      ]
    },
    {
      "id": "weighted-means",
      "title": "Cumulative ratios and weighted averages",
      "body": [
        {
          "kind": "prose",
          "text": "Let \\(w_k>0\\), let \\(\\sum_{k=1}^n w_k\\to+\\infty\\), and suppose \\(v_k\\to L\\in\\mathbb R\\). Put \\(A_n=\\sum_{k=1}^n w_kv_k\\) and \\(B_n=\\sum_{k=1}^n w_k\\). Then"
        },
        {
          "kind": "math",
          "latex": "\\frac{\\Delta A_n}{\\Delta B_n}=v_n\\longrightarrow L,\\qquad\\frac{\\sum_{k=1}^n w_kv_k}{\\sum_{k=1}^n w_k}\\longrightarrow L."
        },
        {
          "kind": "prose",
          "text": "The equal-weight case \\(w_k=1\\) gives Cesàro means: the arithmetic averages of a convergent sequence have the same limit. The converse fails. For example, \\(v_k=(-1)^k\\) has no limit, but its first \\(n\\) terms sum to either 0 or \\(-1\\), so their arithmetic mean tends to zero. Positive weights and an unbounded accumulated weight are part of the forward statement, not optional decoration."
        },
        {
          "kind": "prose",
          "text": "For direct polynomial-sum alternatives, the finite identities \\(\\sum_{k=1}^n k=n(n+1)/2\\) and \\(\\sum_{k=1}^n k^2=n(n+1)(2n+1)/6\\) can be checked by induction: both hold at 1, and subtracting the expression at \\(n-1\\) from the expression at \\(n\\) gives \\(n\\) and \\(n^2\\), respectively. They concern finite sums and require no interchange of limits."
        }
      ]
    },
    {
      "id": "recurrence-normalization",
      "title": "Establish recurrence behavior before normalizing",
      "body": [
        {
          "kind": "prose",
          "text": "For a recurrence, first prove that every iterate is defined and remains in the intended domain. Then establish any boundedness, monotonicity or divergence needed to evaluate the increment quotient. A power or reciprocal can turn a small nonlinear change into an increment with a nonzero limit."
        },
        {
          "kind": "prose",
          "text": "After transforming \\(u_n\\) to \\(a_n\\), the denominator \\(b_n=n\\) is especially useful: its increment is exactly 1. If \\(\\Delta a_n\\to L\\), the theorem gives \\(a_n/n\\to L\\). Taking a square root or reciprocal afterward is a separate limit operation; check positivity and a nonzero limiting denominator before doing it."
        }
      ]
    }
  ],
  "worked": [
    {
      "id": "root-sum",
      "revision": 1,
      "title": "A cumulative root sum without a closed form",
      "problem": [
        {
          "kind": "prose",
          "text": "Find \\(\\displaystyle\\lim_{n\\to\\infty}n^{-2}\\sum_{k=1}^n\\sqrt{k^2+3k}\\), where each square root is the nonnegative real root."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Set \\(a_n=\\sum_{k=1}^n\\sqrt{k^2+3k}\\) and \\(b_n=n^2\\). Every radicand is positive. The denominator is strictly increasing and tends to positive infinity. Its increment is \\(2n-1\\), while the new numerator term is \\(\\sqrt{n^2+3n}\\). Thus"
        },
        {
          "kind": "math",
          "latex": "\\frac{\\Delta a_n}{\\Delta b_n}=\\frac{\\sqrt{n^2+3n}}{2n-1}=\\frac{\\sqrt{1+3/n}}{2-1/n}\\longrightarrow\\frac12."
        },
        {
          "kind": "prose",
          "text": "Stolz–Cesàro gives the requested limit \\(1/2\\). An elementary independent route is the bound \\(k\\le\\sqrt{k^2+3k}\\le k+3/2\\): both sides are nonnegative and the upper square exceeds the radicand by \\(9/4\\). Summing and dividing by \\(n^2\\) squeezes the same limit between \\((n+1)/(2n)\\) and \\((n+1)/(2n)+3/(2n)\\)."
        }
      ],
      "verification": [
        "Author self-checks only; independent mathematical review and teaching-exposure assessment remain pending."
      ]
    },
    {
      "id": "growing-recurrence",
      "revision": 1,
      "title": "A nonlinear recurrence after squaring",
      "problem": [
        {
          "kind": "prose",
          "text": "Let \\(u_1=2\\) and \\(u_{n+1}=u_n+1/u_n\\) for \\(n\\ge1\\). Prove that every term is defined and find \\(\\displaystyle\\lim_{n\\to\\infty}u_n/\\sqrt n\\)."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Induction gives \\(u_n>0\\), so each step is defined. Squaring the actual recurrence, rather than replacing it by a guessed differential equation, gives"
        },
        {
          "kind": "math",
          "latex": "u_{n+1}^2-u_n^2=2+\\frac1{u_n^2}\\ge2,\\qquad u_n^2\\ge4+2(n-1)."
        },
        {
          "kind": "prose",
          "text": "Therefore \\(u_n\\to+\\infty\\), and the increment of \\(u_n^2\\) tends to 2. Apply the theorem to \\(a_n=u_n^2\\) and \\(b_n=n\\):"
        },
        {
          "kind": "math",
          "latex": "\\frac{u_n^2}{n}\\longrightarrow2,\\qquad\\frac{u_n}{\\sqrt n}=\\sqrt{\\frac{u_n^2}{n}}\\longrightarrow\\sqrt2."
        },
        {
          "kind": "prose",
          "text": "The last equality uses \\(u_n>0\\). Without that sign, a limit for the squares alone would not determine a signed limit."
        }
      ],
      "verification": [
        "Author self-checks only; independent mathematical review and teaching-exposure assessment remain pending."
      ]
    }
  ],
  "contrast": [
    {
      "kind": "prose",
      "text": "Unboundedness cannot be replaced by convergence to a nonzero finite value. For \\(n\\ge1\\), take \\(b_n=1-1/n\\) and \\(a_n=2-1/n\\). For \\(n\\ge2\\), \\(\\Delta a_n/\\Delta b_n=1\\), but \\(a_n/b_n\\to2\\). The denominator is increasing yet bounded; the initial contribution survives."
    },
    {
      "kind": "prose",
      "text": "Divergence without eventual monotonicity is also insufficient. For \\(n\\ge2\\), let \\(b_n=n+(-1)^n\\sqrt n\\) and \\(a_n=n\\). Then \\(b_n>0\\), \\(b_n\\to+\\infty\\), and"
    },
    {
      "kind": "math",
      "latex": "\\frac{\\Delta a_n}{\\Delta b_n}=\\frac1{1+(-1)^n(\\sqrt n+\\sqrt{n-1})}\\longrightarrow0,\\qquad\\frac{a_n}{b_n}=\\frac1{1+(-1)^n/\\sqrt n}\\longrightarrow1."
    },
    {
      "kind": "prose",
      "text": "The denominator increments alternate in sign for all sufficiently large indices, so multiplying inequalities by them does not preserve a common direction."
    },
    {
      "kind": "prose",
      "text": "Failure of the difference-quotient limit does not prove that the original quotient diverges. With \\(a_n=n+(-1)^n\\) and \\(b_n=n\\), the original quotient tends to 1, while \\(\\Delta a_n/\\Delta b_n=1+2(-1)^n\\) alternates between \\(-1\\) and 3."
    }
  ],
  "mistakes": [
    "Writing \\(a_n/b_n=\\Delta a_n/\\Delta b_n\\). The theorem relates limits, not finite values.",
    "Checking \\(b_n\\to+\\infty\\) but ignoring signs of \\(\\Delta b_n\\). The telescoping inequalities require eventual positive increments.",
    "Assuming a recurrence converges or diverges merely because a guessed limit equation has a solution.",
    "Using a square or reciprocal transformation without checking the original sign, nonzero terms and the limiting denominator.",
    "Concluding divergence when the difference test is inconclusive."
  ],
  "exercises": [
    {
      "id": "weighted-oscillation",
      "revision": 1,
      "title": "A quotient with a small oscillating contribution",
      "problem": [
        {
          "kind": "prose",
          "text": "Determine \\(\\displaystyle\\lim_{n\\to\\infty}\\frac{\\sum_{k=1}^n(k^2+(-1)^k\\sqrt k)}{\\sum_{k=1}^n(3k^2+2k)}\\). Justify why the oscillating term does or does not change the limit."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Let \\(A_n\\) and \\(B_n\\) be the displayed numerator and denominator. Every denominator increment is \\(3n^2+2n>0\\), and \\(B_n\\ge3n\\to+\\infty\\). Then"
        },
        {
          "kind": "math",
          "latex": "\\frac{\\Delta A_n}{\\Delta B_n}=\\frac{1+(-1)^n/n^{3/2}}{3+2/n}\\longrightarrow\\frac13."
        },
        {
          "kind": "prose",
          "text": "The oscillatory contribution to this quotient is bounded in magnitude by \\(n^{-3/2}\\) before division by a denominator tending to 3. The theorem therefore gives \\(A_n/B_n\\to1/3\\). Alternatively, its total magnitude is at most \\(n\\sqrt n\\), while \\(B_n\\ge3\\sum_{k=1}^n k^2\\ge n^3\\); hence that normalized total tends to zero. The nonoscillating part has limit \\(1/3\\) by the finite formulas for the sums of squares and of integers."
        }
      ],
      "verification": [
        "Author self-checks only; independent mathematical review and teaching-exposure assessment remain pending."
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Compare the contribution added at one new index with the accumulated denominator. First establish the denominator behavior."
          }
        ],
        [
          {
            "kind": "math",
            "latex": "\\Delta A_n=n^2+(-1)^n\\sqrt n,\\qquad\\Delta B_n=3n^2+2n."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Divide the increment quotient by \\(n^2\\), bound the oscillating part, and check both denominator hypotheses before invoking Stolz–Cesàro."
          }
        ]
      ]
    },
    {
      "id": "decaying-recurrence",
      "revision": 1,
      "title": "A positive recurrence approaching zero",
      "problem": [
        {
          "kind": "prose",
          "text": "Let \\(x_1=1\\) and \\(x_{n+1}=x_n/(1+2x_n^2)\\) for \\(n\\ge1\\). Find \\(\\displaystyle\\lim_{n\\to\\infty}\\sqrt n\\,x_n\\), with a proof that the sequence behavior used in the calculation is valid."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Induction gives \\(0<x_{n+1}<x_n\\), so the sequence has a limit \\(\\ell\\ge0\\). Passing to the limit in the continuous recurrence gives \\(\\ell=\\ell/(1+2\\ell^2)\\), hence \\(\\ell=0\\). Define \\(z_n=1/x_n^2\\), which is finite for every index. Exact algebra gives"
        },
        {
          "kind": "math",
          "latex": "z_{n+1}-z_n=\\frac{(1+2x_n^2)^2-1}{x_n^2}=4+4x_n^2\\longrightarrow4."
        },
        {
          "kind": "prose",
          "text": "The theorem with denominator \\(n\\) gives \\(z_n/n\\to4\\). Since this limit is positive, reciprocal and positive-square-root limits are permitted:"
        },
        {
          "kind": "math",
          "latex": "nx_n^2=\\frac1{z_n/n}\\longrightarrow\\frac14,\\qquad\\sqrt n\\,x_n\\longrightarrow\\frac12."
        },
        {
          "kind": "prose",
          "text": "Although \\(x_n\\) tends to zero, the theorem was applied to \\(z_n/n\\), whose denominator \\(n\\) increases without bound."
        }
      ],
      "verification": [
        "Author self-checks only; independent mathematical review and teaching-exposure assessment remain pending."
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Establish positivity, monotonicity and the limiting value of the iterates before choosing a normalization."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Try the reciprocal square \\(z_n=1/x_n^2\\), and subtract two consecutive values exactly."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "The increment of \\(z_n\\) tends to 4. Compare \\(z_n\\) with the index, then reverse the reciprocal square using positivity."
          }
        ]
      ]
    }
  ],
  "alternatives": [
    {
      "kind": "prose",
      "text": "A telescoping identity or a direct squeeze may be shorter than the theorem. Keep a finite identity finite until its boundary terms have been controlled."
    },
    {
      "kind": "prose",
      "text": "An integral comparison can estimate some positive sums after integral calculus is available. L’Hôpital’s rule needs differentiable functions on intervals, so it cannot be applied to a bare sequence without constructing and checking a suitable extension."
    }
  ],
  "related": [
    "partial-sums",
    "recurrences",
    "growth",
    "lhopital"
  ],
  "next": [
    "summation-parts",
    "strategy-choice"
  ],
  "references": [
    {
      "sourceId": "cvut-stolz-cesaro",
      "url": "https://math.fel.cvut.cz/mt/txta/2/txe3aa2h.htm",
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
