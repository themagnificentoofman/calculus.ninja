// Independent owner review recorded privately; exposure/admission remain pending.
export const seriesBenchmarks={
  "id": "series-benchmarks",
  "revision": 1,
  "title": "Term test and p-series by finite blocks",
  "summary": "Prove the p-series threshold using finite blocks and geometric sums, then apply positive comparisons without integral calculus.",
  "objectives": [
    "Separate the necessary zero-term condition from a convergence proof.",
    "Prove convergence of positive partial sums from a uniform finite bound.",
    "Establish the p-series threshold for every real exponent using finite blocks.",
    "Use finite changes and correctly directed comparisons without pretending to know the sum."
  ],
  "prerequisites": [
    "partial-sums",
    "exp-log"
  ],
  "readiness": [
    {
      "lessonId": "partial-sums",
      "exerciseId": "alternating-geometric-tail",
      "prompt": "Keep the starting index and the first omitted power explicit in a finite geometric identity."
    },
    {
      "lessonId": "exp-log",
      "exerciseId": "log-magnitude",
      "prompt": "Respect positive bases and logarithm domains before interpreting a real power."
    }
  ],
  "sections": [
    {
      "id": "terms-and-finite-changes",
      "title": "A series concerns partial sums, not just its terms",
      "body": [
        {
          "kind": "prose",
          "text": String.raw`Throughout this lesson, \(n\) and \(N\) are positive integers, and every term is a finite real number. Set \(S_0=0\) and \(S_N=\sum_{n=1}^N a_n\). The series converges when \(S_N\) has a finite real limit. If \(S_N\to S\), then`
        },
        {
          "kind": "math",
          "latex": String.raw`a_n=S_n-S_{n-1}\longrightarrow S-S=0.`
        },
        {
          "kind": "prose",
          "text": String.raw`Consequently, a nonzero term limit or failure of the terms to approach zero proves divergence. Terms approaching zero do not prove convergence. If only the first \(M\) terms are changed, every partial sum with \(N\ge M\) changes by the same finite constant. The convergence decision is unchanged, although a convergent sum generally changes. Reordering infinitely many terms is a different operation and is not justified by this observation.`
        }
      ]
    },
    {
      "id": "positive-partial-sums",
      "title": "A bounded increasing sequence of partial sums converges",
      "body": [
        {
          "kind": "prose",
          "text": String.raw`For \(a_n\ge0\), the partial sums are nondecreasing. If they have an upper bound, let \(S\) be their least upper bound: the smallest real number no partial sum exceeds. Existence of such a number for a nonempty bounded set is the completeness property of the real numbers. Given \(\varepsilon>0\), the number \(S-\varepsilon\) is not an upper bound, so some \(S_M>S-\varepsilon\). For \(N\ge M\),`
        },
        {
          "kind": "math",
          "latex": String.raw`S-\varepsilon<S_M\le S_N\le S.`
        },
        {
          "kind": "prose",
          "text": String.raw`Thus \(S_N\to S\). If positive partial sums are unbounded instead, monotonicity makes them tend to positive infinity. This gives a way to prove convergence without evaluating the sum. A bound for only a finite list of sampled partial sums is insufficient; the bound must hold for every \(N\).`
        }
      ]
    },
    {
      "id": "finite-power-blocks",
      "title": "Compare powers on one finite block",
      "body": [
        {
          "kind": "prose",
          "text": String.raw`For a real exponent \(p\), define the p-series using positive integer bases: \(\sum_{n=1}^{\infty}n^{-p}\). Real powers are therefore defined on every index. For \(p>0\), the terms decrease with \(n\). Fix a nonnegative integer \(k\); there are exactly \(2^k\) integers in \(2^k\le n<2^{k+1}\). Bounding each term by the powers at the block ends gives`
        },
        {
          "kind": "math",
          "latex": String.raw`2^{-p}2^{k(1-p)}\le\sum_{n=2^k}^{2^{k+1}-1}n^{-p}\le2^{k(1-p)}.`
        },
        {
          "kind": "prose",
          "text": String.raw`These are inequalities for finite sums, so no rearrangement or interchange of infinite operations has occurred. The first \(K\) blocks cover exactly the indices from 1 to \(2^K-1\). The constant factor on the lower bound must not be dropped.`
        }
      ]
    },
    {
      "id": "power-threshold",
      "title": "The equality case separates convergence from divergence",
      "body": [
        {
          "kind": "prose",
          "text": String.raw`If \(p>1\), put \(q=2^{1-p}\), so \(0<q<1\). The upper block bounds give`
        },
        {
          "kind": "math",
          "latex": String.raw`\sum_{n=1}^{2^K-1}n^{-p}\le\sum_{k=0}^{K-1}q^k=\frac{1-q^K}{1-q}\le\frac1{1-q}.`
        },
        {
          "kind": "prose",
          "text": String.raw`Every partial sum is below one of these complete-block partial sums. The positive partial sums are therefore bounded and converge. If \(0<p\le1\), the lower block bound is at least \(2^{-p}\); the first \(K\) blocks have sum at least \(K2^{-p}\), so the series diverges to positive infinity. Equality \(p=1\) is included in that divergence argument. If \(p\le0\), then \(n^{-p}\ge1\), so even the necessary term condition fails. Combining the cases,`
        },
        {
          "kind": "math",
          "latex": String.raw`\sum_{n=1}^{\infty}\frac1{n^p}\text{ converges exactly when }p>1.`
        },
        {
          "kind": "prose",
          "text": "This conclusion classifies convergence. It supplies no general elementary formula for the sum and does not identify a p-series with a geometric series: only its finite block bounds form geometric sums."
        }
      ]
    },
    {
      "id": "comparison-direction",
      "title": "Use a convergent upper bound or a divergent lower bound",
      "body": [
        {
          "kind": "prose",
          "text": String.raw`Suppose \(0\le a_n\le b_n\) for all sufficiently large indices. If \(\sum b_n\) converges, its finite tail sums uniformly bound those of \(\sum a_n\); the positive bounded-partial-sum argument proves convergence of the latter. If \(\sum a_n\) diverges, its partial sums force those of \(\sum b_n\) to be unbounded. Finite initial terms do not change either conclusion.`
        },
        {
          "kind": "prose",
          "text": String.raw`The opposite directions do not follow. From \(0\le c_n\le1/n\) alone, convergence is undecided: \(c_n=1/n^2\) gives a convergent series and \(c_n=1/n\) gives a divergent one. Both satisfy the same upper bound. Signed cancellation needs other hypotheses and is outside this positive comparison.`
        }
      ]
    }
  ],
  "worked": [
    {
      "id": "bounded-square-partial-sums",
      "revision": 1,
      "title": "Bound every partial sum without knowing the sum",
      "problem": [
        {
          "kind": "prose",
          "text": String.raw`Prove that \(S_N=\sum_{n=1}^N n^{-2}\) converges as \(N\to\infty\), and show that its limit lies between 1 and 2. Do not assume a closed form for the infinite sum.`
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": String.raw`For each integer \(k\ge0\), the block \(2^k\le n<2^{k+1}\) contains \(2^k\) terms and each is at most \(2^{-2k}\). Its sum is therefore at most \(2^{-k}\). For every integer \(K\ge1\),`
        },
        {
          "kind": "math",
          "latex": String.raw`1\le S_{2^K-1}\le\sum_{k=0}^{K-1}2^{-k}=2(1-2^{-K})<2.`
        },
        {
          "kind": "prose",
          "text": String.raw`Given any positive integer \(N\), choose \(K\) with \(N<2^K\). Positivity gives \(1\le S_N\le S_{2^K-1}<2\). Thus the partial sums are nondecreasing and bounded above; the proved least-upper-bound argument gives a finite limit \(S\) with \(1\le S\le2\). The bound is not an evaluation of \(S\).`
        }
      ],
      "verification": [
        "Author self-check only: exact finite identities, inequality directions and endpoint cases; independent mathematical/exposure review remains pending."
      ]
    },
    {
      "id": "necessary-term-condition",
      "revision": 1,
      "title": "Use the term test only in its valid direction",
      "problem": [
        {
          "kind": "prose",
          "text": String.raw`Classify the two series whose terms are \(a_n=(3n+1)/(4n+2)\) and \(b_n=1/\sqrt n\), for integers \(n\ge1\). Explain whether replacing their first three terms by any finite real numbers could change either conclusion.`
        }
      ],
      "solution": [
        {
          "kind": "math",
          "latex": String.raw`\lim_{n\to\infty}a_n=\frac34\ne0,\qquad\lim_{n\to\infty}b_n=0.`
        },
        {
          "kind": "prose",
          "text": String.raw`The first series diverges by the necessary term condition. The zero limit for the second does not decide convergence. For its block \(2^k\le n<2^{k+1}\), every term is at least \(2^{-(k+1)/2}\), so`
        },
        {
          "kind": "math",
          "latex": String.raw`\sum_{n=2^k}^{2^{k+1}-1}\frac1{\sqrt n}\ge2^k2^{-(k+1)/2}=2^{-1/2}2^{k/2}\ge2^{-1/2}.`
        },
        {
          "kind": "prose",
          "text": String.raw`The first \(K\) complete blocks therefore have sum at least \(K/\sqrt2\), which grows without bound. Positivity makes all partial sums nondecreasing, so the second series also diverges to positive infinity. Changing three finite terms adds a fixed finite constant to every sufficiently long partial sum, leaving both divergence conclusions unchanged.`
        }
      ],
      "verification": [
        "Author self-check only: exact finite identities, inequality directions and endpoint cases; independent mathematical/exposure review remains pending."
      ]
    }
  ],
  "contrast": [
    {
      "kind": "prose",
      "text": String.raw`The terms of both \(\sum1/n^2\) and \(\sum1/n\) tend to zero, but only the first converges. At \(p=1\), the geometric upper-bound ratio is 1 and no finite geometric bound follows; the lower blocks instead prove divergence.`
    },
    {
      "kind": "prose",
      "text": "Removing a finite prefix changes no convergence decision. Removing infinitely many indices, changing their order, or introducing undefined initial terms is not covered by that statement."
    }
  ],
  "mistakes": [
    "Concluding convergence solely because the individual terms approach zero.",
    "Counting both endpoints of each block and thereby counting the shared endpoint twice.",
    "Treating the p-series exponent threshold as inclusive at one.",
    "Using a divergent upper bound to claim divergence, or a convergent lower bound to claim convergence.",
    "Replacing the sum by the upper geometric bound as though the inequality were equality."
  ],
  "exercises": [
    {
      "id": "shifted-power-threshold",
      "revision": 1,
      "title": "Classify a shifted power for every real exponent",
      "problem": [
        {
          "kind": "prose",
          "text": String.raw`For real \(p\), determine exactly when \(C+\sum_{n=1}^{\infty}(n+3)^{-p}\) has a finite value, where \(C\) is an arbitrary fixed finite real number. Explain the equality case and why no real power is undefined.`
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": String.raw`Every base \(n+3\) is positive, so its real power is defined for every real \(p\). With \(m=n+3\), the finite sum becomes`
        },
        {
          "kind": "math",
          "latex": String.raw`C+\sum_{n=1}^N(n+3)^{-p}=C+\sum_{m=1}^{N+3}m^{-p}-(1+2^{-p}+3^{-p}).`
        },
        {
          "kind": "prose",
          "text": String.raw`For each fixed real \(p\), the last parenthesis is a finite constant. The proved p-series result therefore gives convergence exactly for \(p>1\), independently of \(C\). At \(p=1\), the omitted three terms cannot repair harmonic divergence. For \(0<p<1\), positive block sums force divergence; for \(p\le0\), the terms do not tend to zero. In each divergent case the tail partial sums tend to positive infinity, and adding a finite constant does not change that behavior.`
        }
      ],
      "verification": [
        "Author self-check only: exact finite identities, inequality directions and endpoint cases; independent mathematical/exposure review remains pending."
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Rename the index so that the shifted denominator becomes the index itself."
          }
        ],
        [
          {
            "kind": "math",
            "latex": String.raw`\sum_{n=1}^N(n+3)^{-p}=\sum_{m=4}^{N+3}m^{-p}.`
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Compare this finite sum with a full p-series partial sum, retaining the three missing terms. Then check the threshold and nonpositive exponents separately."
          }
        ]
      ]
    },
    {
      "id": "rational-term-comparisons",
      "revision": 1,
      "title": "Two rational terms with different accumulated behavior",
      "problem": [
        {
          "kind": "prose",
          "text": String.raw`Determine whether \(A=\sum_{n=1}^{\infty}n/(n^3+9)\) and \(B=\sum_{n=1}^{\infty}n/(n^2+9)\) converge. Justify your conclusions without derivatives or integrals. Would removing the first 100 terms change either answer?`
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": String.raw`For every integer \(n\ge1\), all terms are positive and`
        },
        {
          "kind": "math",
          "latex": String.raw`0<\frac{n}{n^3+9}\le\frac1{n^2}.`
        },
        {
          "kind": "prose",
          "text": String.raw`The upper p-series converges, so the finite partial sums of \(A\) are increasing and bounded by a convergent positive comparison. Thus \(A\) converges. For the other series, \(n^2+9\le10n^2\) on these indices, hence`
        },
        {
          "kind": "math",
          "latex": String.raw`\frac{n}{n^2+9}\ge\frac1{10n}.`
        },
        {
          "kind": "prose",
          "text": String.raw`The positive harmonic comparison diverges, so the partial sums of \(B\) grow without bound. A divergent upper bound would not prove this; the lower bound is what forces it. Both term sequences tend to zero, so that fact alone would have decided neither case. Removing 100 terms changes sufficiently long partial sums by a finite constant and leaves convergence unchanged.`
        }
      ],
      "verification": [
        "Author self-check only: exact finite identities, inequality directions and endpoint cases; independent mathematical/exposure review remains pending."
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Both denominators are positive. Look for a useful upper bound for the first series and a useful lower bound for the second."
          }
        ],
        [
          {
            "kind": "math",
            "latex": String.raw`n^3+9\ge n^3,\qquad n^2+9\le10n^2\quad(n\ge1).`
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Use the convergent inverse-square series above the first sequence and a positive multiple of the harmonic series below the second. Keep the directions of the two inequalities distinct."
          }
        ]
      ]
    }
  ],
  "alternatives": [
    {
      "kind": "prose",
      "text": "A decreasing-function integral comparison gives another p-series proof after FTC and improper integrals are available. The finite-block proof here establishes the threshold earlier without those prerequisites."
    },
    {
      "kind": "prose",
      "text": "When a finite telescoping identity is available, keep its boundary terms and take the partial-sum limit directly. A comparison proof may establish convergence more quickly, but usually will not give the exact sum."
    }
  ],
  "related": [
    "partial-sums",
    "convergence-tests"
  ],
  "next": [
    "convergence-tests",
    "series-errors"
  ],
  "references": [
    {
      "sourceId": "mathworld-p-series",
      "url": "https://mathworld.wolfram.com/p-Series.html",
      "use": "reference-only"
    },
    {
      "sourceId": "mathworld-cauchy-condensation",
      "url": "https://mathworld.wolfram.com/CauchyCondensationTest.html",
      "use": "reference-only"
    },
    {
      "sourceId": "openstax-calculus-2-divergence-integral",
      "url": "https://openstax.org/books/calculus-volume-2/pages/5-3-the-divergence-and-integral-tests",
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
