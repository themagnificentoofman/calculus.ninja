// Independently reviewed private draft; exposure and admission remain pending.
export default {
  "id": "rearrangements",
  "revision": 1,
  "title": "Series rearrangements, absolute convergence and summation order",
  "summary": "Prove when a new ordering preserves a sum, and use finite cutoffs to expose conditional-order and double-sum failures.",
  "objectives": [
    "Distinguish a permutation of terms from grouping, omission or repetition.",
    "Prove invariance under rearrangement from a finite absolute tail bound.",
    "Construct and justify a new order of a conditionally convergent real series.",
    "Compare rectangular, square and iterated cutoffs without assuming they agree."
  ],
  "prerequisites": [
    "convergence-tests",
    "series-errors"
  ],
  "readiness": [
    {
      "lessonId": "convergence-tests",
      "exerciseId": "alternating-two-exponents",
      "prompt": "Prove ordinary convergence and test absolute convergence as two separate questions."
    },
    {
      "lessonId": "series-errors",
      "exerciseId": "factorial-geometric-tail",
      "prompt": "Control every term in an omitted tail with one valid majorant."
    }
  ],
  "sections": [
    {
      "id": "what-order-means",
      "title": "The order is part of an infinite sum",
      "body": [
        {
          "kind": "prose",
          "text": "A rearrangement of \\(\\sum_{n=1}^{\\infty}a_n\\) is \\(\\sum_{j=1}^{\\infty}a_{\\pi(j)}\\), where \\(\\pi\\) is a bijection of the positive integers: each original index appears exactly once. Choosing a new infinite sequence of terms is not enough; an order that permanently omits some terms is not a rearrangement."
        },
        {
          "kind": "prose",
          "text": "Grouping consecutive finite blocks keeps their order. If the original series converges, its grouped block-end sums form a subsequence and have the same limit. The converse fails: grouping \\(1-1+1-1+\\cdots\\) into pairs produces zero block sums, but the original partial sums alternate between 1 and 0. A claimed grouped limit needs a separate bound on unfinished blocks."
        }
      ]
    },
    {
      "id": "absolute-order",
      "title": "An absolute tail controls every sufficiently complete ordering",
      "body": [
        {
          "kind": "prose",
          "text": "Suppose \\(\\sum|a_n|<\\infty\\), and write \\(S=\\sum a_n\\). Given \\(\\varepsilon>0\\), choose \\(K\\) with \\(\\sum_{n>K}|a_n|<\\varepsilon\\). A permutation eventually includes all indices 1 through \\(K\\). Once that has happened, its finite partial sum differs from \\(S\\) only by omitted tail terms, so"
        },
        {
          "kind": "math",
          "latex": "\\left|S-\\sum_{j=1}^{J}a_{\\pi(j)}\\right|\\le\\sum_{n>K}|a_n|<\\varepsilon."
        },
        {
          "kind": "prose",
          "text": "To justify the inequality, subtract the selected finite terms from the convergent original series; the remaining subseries is bounded in absolute value by the absolute tail. Thus every permutation converges to the same sum. There is no required bound on how long a permutation takes to include the first \\(K\\) indices."
        }
      ]
    },
    {
      "id": "conditional-reservoirs",
      "title": "Conditional convergence leaves two unbounded supplies of signs",
      "body": [
        {
          "kind": "prose",
          "text": "For a real series define \\(a_n^+=\\max(a_n,0)\\) and \\(a_n^-=\\max(-a_n,0)\\). If \\(\\sum a_n\\) converges but \\(\\sum|a_n|\\) diverges, both \\(\\sum a_n^+\\) and \\(\\sum a_n^-\\) must diverge to positive infinity. Indeed their partial sums have bounded difference and unbounded sum; if either were bounded, the other would be bounded too, contradicting divergence of the absolute sum."
        },
        {
          "kind": "prose",
          "text": "Also \\(a_n\\to0\\). These facts permit a target-order construction: take unused positive terms until the partial sum passes a chosen real target, then unused negative terms until it passes back, always using each sign in its original order. The supply never runs out, and the overshoot at each crossing is no larger than its last term. The exercise makes this argument precise for a particular target. Zeros may be inserted in order without changing any sum."
        }
      ]
    },
    {
      "id": "harmonic-cutoffs",
      "title": "A finite harmonic identity gives a usable limit",
      "body": [
        {
          "kind": "prose",
          "text": "Let \\(H_N=\\sum_{j=1}^N1/j\\). Splitting even and odd denominators gives \\(\\sum_{j=1}^N1/(2j-1)=H_{2N}-H_N/2\\). Moreover, because \\(1/x\\) decreases on the positive real line, finite integral comparison yields"
        },
        {
          "kind": "math",
          "latex": "\\ln\\frac{2N+1}{N+1}\\le H_{2N}-H_N\\le\\ln2,\\qquad H_{2N}-H_N\\longrightarrow\\ln2."
        },
        {
          "kind": "prose",
          "text": "The even partial sums of the alternating harmonic series equal \\(H_{2N}-H_N\\). The odd partial sums add one term tending to zero, so the ordinary sum is \\(\\ln2\\). The absolute series is harmonic and diverges. This proof uses finite cutoffs and does not assign a value to a divergent positive or negative subseries."
        }
      ]
    },
    {
      "id": "double-order",
      "title": "Two cutoffs need their own joint control",
      "body": [
        {
          "kind": "prose",
          "text": "For a real array \\(c_{mn}\\), write \\(R_{M,N}=\\sum_{m=1}^{M}\\sum_{n=1}^{N}c_{mn}\\). Letting \\(N\\) tend to infinity first, letting \\(M\\) tend to infinity first, and setting \\(M=N\\) describe different limit procedures. Finite rectangles can be summed in either order. Their infinite limits need not agree."
        },
        {
          "kind": "prose",
          "text": "A sufficient condition for order invariance is a finite total absolute sum over all pairs. Here that means that the nonnegative sums \\(\\sum_{m\\le M,n\\le N}|c_{mn}|\\) are bounded by one constant for every rectangle. Their supremum is then finite, and outside a sufficiently large square the absolute total is arbitrarily small. The same finite-core argument as above controls both iterated sums, square cutoffs and any enumeration of all pairs. Separate absolute convergence of each row and each column is weaker and does not supply this bound."
        }
      ]
    }
  ],
  "worked": [
    {
      "id": "absolute-sign-blocks",
      "revision": 1,
      "title": "Changing the sign balance preserves an absolutely convergent sum",
      "problem": [
        {
          "kind": "prose",
          "text": "Start with \\(\\sum_{n=1}^{\\infty}(-1)^{n+1}/2^n\\). Form a new order by repeatedly taking the next two unused positive terms and then the next unused negative term. Prove that this is a rearrangement, determine its sum, and justify partial sums that end inside a block."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Positive terms have indices \\(2j-1\\), and negative terms have indices \\(2j\\), for \\(j\\ge1\\). After \\(N\\) complete blocks the order has used the first \\(2N\\) positive terms and the first \\(N\\) negative terms. Every original term is eventually used exactly once."
        },
        {
          "kind": "math",
          "latex": "\\sum_{n=1}^{\\infty}\\frac1{2^n}=1,\\qquad \\sum_{n=1}^{\\infty}\\frac{(-1)^{n+1}}{2^n}=\\frac{1/2}{1+1/2}=\\frac13."
        },
        {
          "kind": "prose",
          "text": "Absolute order invariance therefore proves the rearranged sum is \\(1/3\\). One can also compute the sign totals directly: the positive geometric series sums to \\(2/3\\), and the negative one to \\(-1/3\\); both are finite. A partial sum inside the next block differs from its preceding complete-block sum by at most the sum of the magnitudes of that block's three terms. Each of those terms tends to zero, so the unfinished-block difference tends to zero as well."
        }
      ],
      "verification": [
        "Author self-check: the sign-index map is exhaustive and injective.",
        "Author self-check: two geometric sign sums and the direct alternating geometric sum coincide."
      ]
    },
    {
      "id": "growing-positive-blocks",
      "revision": 1,
      "title": "A genuine rearrangement can diverge even though every term vanishes",
      "problem": [
        {
          "kind": "prose",
          "text": "Reorder the alternating harmonic series as follows. In block \\(k\\), take the next \\(k\\) unused positive terms, then the next one unused negative term, for \\(k=1,2,3,\\ldots\\). Prove that the resulting partial sums tend to positive infinity, including those that end before a block is complete."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "After \\(N\\) complete blocks, the number of positive terms used is \\(P_N=N(N+1)/2\\), and the number of negative terms is \\(N\\). Both counts increase without bound, and each sign is used in its original order. Thus every original term appears exactly once. The complete-block sum is"
        },
        {
          "kind": "math",
          "latex": "B_N=H_{2P_N}-\\frac12H_{P_N}-\\frac12H_N=(H_{2P_N}-H_{P_N})+\\frac12(H_{P_N}-H_N)."
        },
        {
          "kind": "prose",
          "text": "The first parenthesis tends to \\(\\ln2\\). For \\(N\\ge1\\), the second is nonnegative and has the lower bound"
        },
        {
          "kind": "math",
          "latex": "H_{P_N}-H_N\\ge\\int_{N+1}^{P_N+1}\\frac{\\mathrm dx}{x}=\\ln\\frac{P_N+1}{N+1}\\longrightarrow+\\infty."
        },
        {
          "kind": "prose",
          "text": "Consequently \\(B_N\\to+\\infty\\). Between \\(B_N\\) and \\(B_{N+1}\\), all the intervening updates before the final negative term are positive. Every partial sum in this block is therefore at least \\(\\min(B_N,B_{N+1})\\). This lower bound tends to infinity, proving the claim for all partial sums. Merely saying that every term tends to zero would not justify the growing unfinished blocks."
        }
      ],
      "verification": [
        "Author self-check: triangular positive count and exact finite harmonic decomposition.",
        "Author self-check: integral lower bound diverges; monotonicity within each positive portion controls every unfinished block."
      ]
    }
  ],
  "contrast": [
    {
      "kind": "prose",
      "text": "Absolute convergence guarantees invariance for every permutation. Conditional convergence does not mean that every new order changes the sum; the identity permutation still keeps it. It means the absolute-tail argument is unavailable, and a specific order needs analysis. Likewise, knowing that every row and column of an array has a finite sum does not justify swapping its two infinite sums. The sparse-array transfer gives a failure with only two nonzero entries per row."
    }
  ],
  "mistakes": [
    "Calling an order a rearrangement without checking that each original index appears exactly once.",
    "Subtracting two divergent sign sums as though each were finite.",
    "Proving a limit only at block endpoints when the unfinished blocks are not controlled.",
    "Assuming individual row and column convergence is the same as absolute convergence of the whole array.",
    "Inferring a joint limit from an iterated limit or a square cutoff."
  ],
  "exercises": [
    {
      "id": "greedy-target-one",
      "revision": 1,
      "title": "Use shrinking overshoots to reach a prescribed sum",
      "problem": [
        {
          "kind": "prose",
          "text": "Begin at zero. Take unused positive terms of the alternating harmonic series in increasing original index until the partial sum is strictly greater than 1. Then take unused negative terms in increasing original index until it is strictly less than 1. Repeat these two phases forever. Prove that this defines a rearrangement whose full sequence of partial sums converges to 1."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "The positive and negative supplies each have divergent total magnitude. Therefore each finite crossing phase terminates."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "At a crossing, the distance past 1 is bounded by the magnitude of the last term used. Each new crossing uses at least one new term of its sign."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Between consecutive crossings, partial sums move monotonically between the two crossing values. Use that enclosure to control every partial sum, not only the crossings."
          }
        ]
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "The positive sum diverges because \\(1/(2j-1)\\ge1/(2j)\\); the negative magnitudes sum to \\(H_N/2\\) and also diverge. Removing finitely many terms preserves each divergence, so every crossing takes finitely many terms. Strict crossings force at least one term in every subsequent phase. Hence the number used of each sign tends to infinity. Since neither sign skips an index, this is a bijection of the original terms."
        },
        {
          "kind": "prose",
          "text": "Let the partial sums just after upper and lower crossings be \\(U_k\\) and \\(L_k\\). If \\(p_k\\) and \\(q_k\\) are the indices of the final positive and negative terms in those phases, then"
        },
        {
          "kind": "math",
          "latex": "0<U_k-1\\le\\frac1{p_k},\\qquad 0<1-L_k\\le\\frac1{q_k}."
        },
        {
          "kind": "prose",
          "text": "Both indices tend to infinity, so both crossing sequences tend to 1. Within a phase all steps have the same sign, so each intermediate partial sum lies between its two adjacent crossing values. After discarding the finite initial phase, these two endpoints are arbitrarily close to 1. The full rearranged series therefore converges to 1, which differs from the original \\(\\ln2\\)."
        }
      ],
      "verification": [
        "Author self-check: phase termination, exhaustion of both signs and shrinking crossing bounds.",
        "Author self-check: monotone enclosure covers all intermediate partial sums; no numerical simulation is the convergence proof."
      ]
    },
    {
      "id": "sparse-double-order",
      "revision": 1,
      "title": "Rows, columns and squares give different limits",
      "problem": [
        {
          "kind": "prose",
          "text": "For positive integers \\(m,n\\), define \\(c_{mn}=1\\) when \\(n=m\\), \\(c_{mn}=-1\\) when \\(n=m+1\\), and \\(c_{mn}=0\\) otherwise. Find both iterated sums and the limit of square cutoffs. Explain precisely why absolute convergence does not permit their interchange here."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "A row contains two nonzero terms. Column 1 is exceptional; inspect it before concluding that every column also has sum zero."
          }
        ],
        [
          {
            "kind": "math",
            "latex": "R_{M,N}=\\min(M,N)-\\min(M,N-1)."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Take the two limits in each specified order. Count the absolute mass of complete rows to test total absolute convergence."
          }
        ]
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Every row sums to \\(1-1=0\\), so the sum of row sums is 0. Column 1 contains just the positive entry at \\(m=1\\), and every later column contains a positive and a negative entry. Thus the sum of column sums is 1. Counting entries in a finite rectangle gives"
        },
        {
          "kind": "math",
          "latex": "R_{M,N}=\\begin{cases}1,&N\\le M,\\\\0,&N>M.\\end{cases}"
        },
        {
          "kind": "math",
          "latex": "\\lim_{M\\to\\infty}\\lim_{N\\to\\infty}R_{M,N}=0,\\qquad \\lim_{N\\to\\infty}\\lim_{M\\to\\infty}R_{M,N}=1,\\qquad \\lim_{N\\to\\infty}R_{N,N}=1."
        },
        {
          "kind": "prose",
          "text": "The square cutoff contains one uncancelled diagonal entry. Along rectangles with \\(N=M+1\\), however, the sum is always zero, so no common joint rectangular limit exists. Although each individual row and column is absolutely summable, the absolute mass in an \\(M\\)-by-\\((M+1)\\) rectangle is \\(2M\\). The total absolute double sum is unbounded; this is exactly the hypothesis missing from the order-invariance theorem."
        }
      ],
      "verification": [
        "Author self-check: exact rectangle counts, including first column and square boundary.",
        "Author self-check: two unbounded rectangle paths disagree and absolute rectangle mass is 2M."
      ]
    }
  ],
  "alternatives": [
    {
      "kind": "prose",
      "text": "Finite rectangular identities can settle an order question more directly than a general theorem. For a single rearranged series, an absolute tail estimate, a block formula or a crossing construction may be appropriate. This lesson does not provide a general theory of summability methods, uniform parameter limits or conditionally convergent Cauchy products."
    }
  ],
  "related": [
    "analysis",
    "summation-parts",
    "generating"
  ],
  "next": [
    "products"
  ],
  "references": [
    {
      "sourceId": "mathworld",
      "url": "https://mathworld.wolfram.com/RiemannSeriesTheorem.html",
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
