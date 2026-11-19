// Independently reviewed private draft; exposure and admission remain pending.
export default {
  "id": "products",
  "revision": 1,
  "title": "Infinite products, logarithms and nonzero convergence",
  "summary": "Pass from positive finite products to logarithmic sums, detect a quadratic loss, and separate a positive limit from collapse to zero.",
  "objectives": [
    "Define an infinite product using its ordered finite partial products.",
    "Check positive factors before taking real logarithms and distinguish nonzero convergence from a zero limit.",
    "Use a proved logarithmic remainder bound to classify conditional and normalized products.",
    "Track finite exceptional factors and determine when rearranging factors preserves the result."
  ],
  "prerequisites": [
    "rearrangements",
    "exp-log"
  ],
  "readiness": [
    {
      "lessonId": "rearrangements",
      "exerciseId": "greedy-target-one",
      "prompt": "Prove that the prescribed crossing order is a permutation and controls every partial sum."
    },
    {
      "lessonId": "convergence-tests",
      "exerciseId": "alternating-two-exponents",
      "prompt": "Separate convergence of signed terms from convergence of their magnitudes."
    }
  ],
  "sections": [
    {
      "id": "partial-products",
      "title": "The limit and its convention must be explicit",
      "body": [
        {
          "kind": "prose",
          "text": "For a sequence of positive real numbers \\(a_n\\), define \\(P_N=\\prod_{n=1}^Na_n\\). In the standard nonzero convention used here, the infinite product converges if \\(P_N\\to P\\) with \\(0<P<\\infty\\). A limit of zero is still a meaningful limit of partial products, but it is called collapse to zero rather than nonzero product convergence. State which conclusion a question asks for."
        },
        {
          "kind": "prose",
          "text": "Nonzero convergence requires \\(a_N=P_N/P_{N-1}\\to1\\), but factors tending to 1 are not sufficient. For example, \\(\\prod_{n=1}^N(1+1/n)=N+1\\) diverges to infinity. A single zero factor instead makes every subsequent partial product zero. Neither situation can be discarded when checking the full product."
        }
      ]
    },
    {
      "id": "logarithm-criterion",
      "title": "Positive finite products have exact logarithmic sums",
      "body": [
        {
          "kind": "math",
          "latex": "\\ln P_N=\\sum_{n=1}^N\\ln a_n\\qquad(a_n>0)."
        },
        {
          "kind": "prose",
          "text": "Continuity of the exponential and logarithm gives both directions: \\(P_N\\to P>0\\) if and only if \\(\\sum_{n=1}^N\\ln a_n\\to\\ln P\\), a finite real limit. If the log sums tend to negative infinity, then \\(P_N\\to0\\); if they tend to positive infinity, then \\(P_N\\to+\\infty\\). These are consequences of the finite identity, not an unproved interchange between a logarithm and an infinite product."
        },
        {
          "kind": "prose",
          "text": "A finite prefix of positive factors only multiplies a tail limit by a fixed positive constant. It cannot change whether the tail has a positive finite limit or collapses to zero. A zero factor is different. Negative factors require a separate sign analysis; real logarithms of them are not defined, so the positive-factor criterion does not apply unchanged."
        }
      ]
    },
    {
      "id": "log-defect",
      "title": "A uniform quadratic bound exposes a lost term",
      "body": [
        {
          "kind": "prose",
          "text": "For real \\(u>-1\\), let \\(D(u)=u-\\ln(1+u)\\). The fundamental theorem of calculus gives \\(D(u)=\\int_0^u t/(1+t)\\,\\mathrm{d}t\\). For \\(|u|\\le1/2\\), the denominator is between \\(1/2\\) and \\(3/2\\) throughout this integration interval. If \\(u<0\\), reverse the endpoints and use \\(-t\\) to retain a nonnegative integrand. In both signs this proves"
        },
        {
          "kind": "math",
          "latex": "\\frac{u^2}{3}\\le D(u)=u-\\ln(1+u)\\le u^2\\qquad(|u|\\le1/2)."
        },
        {
          "kind": "prose",
          "text": "Thus \\(\\ln(1+u)\\) differs from \\(u\\) by a nonnegative quantity of quadratic size. When \\(u_n\\to0\\) and \\(1+u_n>0\\), the bound applies after a finite prefix. If \\(\\sum u_n\\) converges and \\(\\sum u_n^2<\\infty\\), the logarithm sum has a finite limit. If \\(\\sum u_n\\) converges but \\(\\sum u_n^2\\) diverges, the defects accumulate to positive infinity and the logarithm sum tends to negative infinity."
        },
        {
          "kind": "prose",
          "text": "Absolute convergence of \\(\\sum u_n\\) is a useful sufficient condition: for late terms \\(|u_n|\\le1/2\\), the bound gives \\(|\\ln(1+u_n)|\\le|u_n|+u_n^2\\le2|u_n|\\). Hence the product is nonzero and its logarithm series converges absolutely. The quadratic bound also handles some conditionally convergent first-order sums; requiring absolute convergence there would be unnecessarily strong."
        }
      ]
    },
    {
      "id": "factor-order",
      "title": "Reordering factors is a series-order question after logarithms",
      "body": [
        {
          "kind": "prose",
          "text": "If \\(\\sum|\\ln a_n|<\\infty\\), the rearrangement theorem makes the log sum invariant under every permutation. Exponentiating then makes the positive product invariant too. If the log series is only conditionally convergent, reordering the factors may change a positive product limit or prevent nonzero convergence. The last exercise transfers a proved series rearrangement to this product setting."
        }
      ]
    }
  ],
  "worked": [
    {
      "id": "finite-telescope-product",
      "revision": 1,
      "title": "Cancel finite factors before taking the limit",
      "problem": [
        {
          "kind": "prose",
          "text": "For integers \\(N\\ge2\\), set \\(P_N=\\prod_{n=2}^N(1-1/n^2)\\). Find the limit and justify that it is nonzero. What changes if the product begins at \\(n=1\\)?"
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Every factor from index 2 onward is positive. Factor each one and keep the finite endpoints:"
        },
        {
          "kind": "math",
          "latex": "P_N=\\left(\\prod_{n=2}^N\\frac{n-1}{n}\\right)\\left(\\prod_{n=2}^N\\frac{n+1}{n}\\right)=\\frac1N\\frac{N+1}{2}=\\frac{N+1}{2N}."
        },
        {
          "kind": "prose",
          "text": "Therefore \\(P_N\\to1/2>0\\), which is nonzero product convergence. The logarithm criterion is consistent with this exact result: the factors have increments \\(-1/n^2\\) with an absolutely summable magnitude. If the first index is instead 1, that added factor is \\(1-1=0\\). All partial products are then zero, and the real logarithmic argument is unavailable at that index."
        }
      ],
      "verification": [
        "Author self-check: exact finite telescope and base case N=2.",
        "Author self-check: the omitted first factor is zero, so a finite-prefix invariance claim would be false without positivity."
      ]
    },
    {
      "id": "conditional-quadratic-threshold",
      "revision": 1,
      "title": "Convergent signed increments can still produce a zero product",
      "problem": [
        {
          "kind": "prose",
          "text": "For a real parameter \\(p>0\\), classify the limit of"
        },
        {
          "kind": "math",
          "latex": "P_N(p)=\\prod_{n=1}^N\\left(1+\\frac{(-1)^n}{(n+2)^p}\\right)"
        },
        {
          "kind": "prose",
          "text": "as a positive finite number or zero. Include the boundary parameter in the proof; an explicit value of a positive limit is not required."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Every factor is positive because \\((n+2)^{-p}<1\\). Put \\(u_n=(-1)^n/(n+2)^p\\). The magnitudes decrease to zero, so \\(\\sum u_n\\) converges by the alternating test for every \\(p>0\\). Choose a finite \\(N_0\\) such that \\(|u_n|\\le1/2\\) for \\(n\\ge N_0\\). The log-defect bound then gives"
        },
        {
          "kind": "math",
          "latex": "\\frac1{3(n+2)^{2p}}\\le u_n-\\ln(1+u_n)\\le\\frac1{(n+2)^{2p}}\\qquad(n\\ge N_0)."
        },
        {
          "kind": "prose",
          "text": "If \\(p>1/2\\), the upper bound has a convergent sum. Subtracting the convergent defect sum from the convergent signed sum gives a finite log sum, and hence a positive finite product limit. If \\(0<p\\le1/2\\), the lower bound has a divergent sum, including the harmonic boundary \\(p=1/2\\). The signed partial sums stay bounded while the accumulated defect tends to infinity. Thus the log sums tend to negative infinity and the products tend to zero."
        },
        {
          "kind": "math",
          "latex": "L(p)=\\lim_{N\\to\\infty}P_N(p),\\qquad\\begin{cases}0<L(p)<\\infty,&p>1/2,\\\\L(p)=0,&0<p\\le1/2.\\end{cases}"
        },
        {
          "kind": "prose",
          "text": "The proof covers every cutoff directly, without assuming an unproved cubic remainder is summable. In particular, for \\(1/2<p\\le1\\), the product is nonzero even though \\(\\sum|u_n|\\) diverges."
        }
      ],
      "verification": [
        "Author self-check: positive-factor domain, eventual smallness and both p-series thresholds.",
        "Author self-check: a convergent signed sum minus an unbounded nonnegative defect tends to negative infinity, including p=1/2."
      ]
    }
  ],
  "contrast": [
    {
      "kind": "prose",
      "text": "A first-order approximation is insufficient if its errors have a divergent sum. The signed increments in the threshold example converge for every positive parameter, but their quadratic logarithmic losses need not. Conversely, no explicit value of the limiting product is needed to prove it is positive. Special-function product identities require their own derivation and domains; convergence alone does not establish a claimed formula for sine, the Gamma function or a product over primes."
    }
  ],
  "mistakes": [
    "Calling a zero limit nonzero product convergence without declaring a different convention.",
    "Taking real logarithms before verifying every factor is positive.",
    "Using factors tending to one as a sufficient test.",
    "Replacing each logarithm by its first-order term without summing a bound on the errors.",
    "Applying a tail argument across a zero or sign-changing finite factor.",
    "Assuming conditional convergence of the log series allows arbitrary reordering."
  ],
  "exercises": [
    {
      "id": "normalized-positive-product",
      "revision": 1,
      "title": "Cancel the linear drift and find the new threshold",
      "problem": [
        {
          "kind": "prose",
          "text": "For real \\(q>0\\), determine when the partial products"
        },
        {
          "kind": "math",
          "latex": "Q_N(q)=\\prod_{n=1}^N\\left[\\left(1+\\frac1{n^q}\\right)\\exp\\left(-\\frac1{n^q}\\right)\\right]"
        },
        {
          "kind": "prose",
          "text": "have a positive finite limit and when they tend to zero. For \\(q=1\\), also prove that the limit lies in \\([2e^{-2},2e^{-1}]\\). Do not assume a special-function product formula."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Take logarithms of the finite product. The exponential factor cancels the linear contribution exactly."
          }
        ],
        [
          {
            "kind": "math",
            "latex": "\\ln\\left((1+u)e^{-u}\\right)=-D(u)."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "For \\(q=1\\), separate the first factor \\(2/e\\). Use \\(D(1/n)\\le1/n^2\\) for \\(n\\ge2\\), and compare the remaining square-reciprocal sum to an integral."
          }
        ]
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "All factors are positive. With \\(u_n=n^{-q}\\), finite logarithmic sums give"
        },
        {
          "kind": "math",
          "latex": "\\ln Q_N(q)=-\\sum_{n=1}^ND(u_n)."
        },
        {
          "kind": "prose",
          "text": "For every fixed \\(q>0\\), the quadratic bound holds after a finite prefix. The nonnegative defect sum is finite exactly when \\(\\sum n^{-2q}\\) converges, namely \\(q>1/2\\). These parameters give a finite log limit and hence a positive limit for the product. For \\(0<q\\le1/2\\), the defect sum tends to infinity, so \\(Q_N(q)\\to0\\). The equality case is included by the harmonic divergence."
        },
        {
          "kind": "prose",
          "text": "When \\(q=1\\), separate \\(n=1\\) and observe"
        },
        {
          "kind": "math",
          "latex": "0\\le\\sum_{n=2}^{\\infty}D(1/n)\\le\\sum_{n=2}^{\\infty}\\frac1{n^2}\\le\\int_1^{\\infty}\\frac{\\mathrm dx}{x^2}=1."
        },
        {
          "kind": "math",
          "latex": "\\lim_{N\\to\\infty}Q_N(1)=\\frac2e\\exp\\left(-\\sum_{n=2}^{\\infty}D(1/n)\\right)\\in[2e^{-2},2e^{-1}]."
        },
        {
          "kind": "prose",
          "text": "The normalization matters: without the exponential factors, the \\(q=1\\) partial product is \\(N+1\\) and diverges. Cancelling a divergent linear drift leaves a summable quadratic loss."
        }
      ],
      "verification": [
        "Author self-check: finite logarithmic cancellation and the exact square-summability threshold.",
        "Author self-check: first factor and integral bound give the stated explicit nonzero enclosure."
      ]
    },
    {
      "id": "ordered-exponential-factors",
      "revision": 1,
      "title": "A series permutation changes a positive product",
      "problem": [
        {
          "kind": "prose",
          "text": "Let \\(a_n=\\exp((-1)^{n+1}/n)\\) for integers \\(n\\ge1\\). Find the limit of \\(\\prod_{n=1}^Na_n\\). Now order the factors using the greedy target-one permutation from the rearrangements lesson: take factors with positive logarithm until the log sum exceeds 1, then factors with negative logarithm until it falls below 1, always using each sign in its original order. Find the new limit and explain why absolute order invariance does not apply."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "The logarithm of each factor is exactly the corresponding alternating harmonic term."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "The original log sum is \\(\\ln2\\), while the proved crossing permutation has log sum 1."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Exponentiate the two finite-log limits. Test absolute convergence of the log series, rather than absolute convergence of the factors themselves."
          }
        ]
      ],
      "solution": [
        {
          "kind": "math",
          "latex": "\\prod_{n=1}^Na_n=\\exp\\left(\\sum_{n=1}^N\\frac{(-1)^{n+1}}n\\right)\\longrightarrow e^{\\ln2}=2."
        },
        {
          "kind": "prose",
          "text": "The earlier greedy construction uses every original index exactly once and proves convergence of all its partial log sums to 1. The factors here have precisely those logarithms and are all positive, so the reordered finite products tend to \\(e\\). This differs from 2; for example, the exponential series gives \\(e>1+1=2\\)."
        },
        {
          "kind": "math",
          "latex": "\\sum_{n=1}^{\\infty}|\\ln a_n|=\\sum_{n=1}^{\\infty}\\frac1n=+\\infty."
        },
        {
          "kind": "prose",
          "text": "Thus the log series is conditionally convergent, and the absolute-order theorem has no applicable hypothesis. The example supplies two nonzero product limits for two genuine orders of the same factors; it does not claim that every rearrangement changes a product."
        }
      ],
      "verification": [
        "Author self-check: each logarithm equals the prescribed real exponent.",
        "Author self-check: the inherited target-one permutation exhausts the indices; continuity of exp transfers both proved sums to distinct positive limits."
      ]
    }
  ],
  "alternatives": [
    {
      "kind": "prose",
      "text": "An exact finite telescope can be shorter than a logarithmic estimate. Pairing nearby signed factors can also reveal a quadratic loss, provided the leftover factors and every cutoff are controlled. Infinite products for special functions, products over primes, and uniform convergence of parameter-dependent products are separate extensions; none is inferred from this real positive-factor criterion alone."
    }
  ],
  "related": [
    "taylor-remainders",
    "summation-parts",
    "generating"
  ],
  "next": [],
  "references": [
    {
      "sourceId": "mathworld",
      "url": "https://mathworld.wolfram.com/InfiniteProduct.html",
      "use": "reference-only"
    },
    {
      "sourceId": "openstax-calculus-2",
      "url": "https://openstax.org/books/calculus-volume-2/pages/5-5-alternating-series",
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
