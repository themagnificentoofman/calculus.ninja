// Independently reviewed private draft; exposure and admission remain pending.
export default {
  "id": "generating",
  "revision": 1,
  "title": "Generating functions, coefficient extraction and recurrences",
  "summary": "Encode a sequence, retain its initial terms, and distinguish a formal coefficient identity from evaluation of a convergent series.",
  "objectives": [
    "Use coefficient notation and finite convolution without hiding an infinite rearrangement.",
    "Translate a recurrence or a prefix sum into a generating function with correct initial terms.",
    "Choose ordinary or exponential normalization and prove a numerical evaluation is legitimate.",
    "Extract weighted selections from a finite product while excluding repeated choices."
  ],
  "prerequisites": [
    "power-series"
  ],
  "readiness": [
    {
      "lessonId": "power-series",
      "exerciseId": "weighted-geometric-center",
      "prompt": "Differentiate the geometric series on its convergence interval and check both endpoints separately."
    }
  ],
  "sections": [
    {
      "id": "formal-and-analytic",
      "title": "A formal series records coefficients before any substitution",
      "body": [
        {
          "kind": "prose",
          "text": "For a real sequence \\(a_n\\) indexed by integers \\(n\\ge0\\), its ordinary generating function is the formal expression \\(A(z)=\\sum_{n=0}^{\\infty}a_nz^n\\). The notation \\([z^n]A(z)\\) means its coefficient \\(a_n\\). Equality of formal series means equality at every index; it makes no assertion about a numerical value at a nonzero \\(z\\). All formal identities below determine each coefficient using finitely many operations."
        },
        {
          "kind": "prose",
          "text": "An analytic use of the same expression needs convergence. For example, \\(\\sum n!z^n\\) is a perfectly usable formal series, but its terms fail to tend to zero for every real \\(z\\ne0\\). For nonzero \\(z\\), the ratio of successive term magnitudes is \\((n+1)|z|\\), eventually greater than 2. Never substitute into a formal expression just because its algebra has produced a closed formula."
        }
      ]
    },
    {
      "id": "coefficient-rules",
      "title": "Shifts, derivatives and products have exact index rules",
      "body": [
        {
          "kind": "prose",
          "text": "Let \\(B(z)=\\sum_{n=0}^{\\infty}b_nz^n\\) be a second formal series, and let \\(j\\) be a nonnegative integer."
        },
        {
          "kind": "math",
          "latex": "[z^n](z^jA(z))=\\begin{cases}a_{n-j},&n\\ge j,\\\\0,&0\\le n<j,\\end{cases}\\qquad [z^n]A'(z)=(n+1)a_{n+1}."
        },
        {
          "kind": "math",
          "latex": "[z^n](A(z)B(z))=\\sum_{k=0}^na_kb_{n-k}."
        },
        {
          "kind": "prose",
          "text": "In the product rule, only the pairs of exponents adding to \\(n\\) contribute. This finite sum is called convolution. Formal differentiation is defined coefficient by coefficient. When using actual functions, the power-series differentiation theorem justifies the derivative strictly inside the convergence radius."
        },
        {
          "kind": "prose",
          "text": "If both numerical power series converge absolutely at \\(z\\), their product is also the sum of this convolution. To see the needed control, let \\(U=\\sum|a_kz^k|\\) and \\(V=\\sum|b_kz^k|\\). Outside a square containing indices 0 through \\(K\\), the absolute double sum is at most \\(V\\sum_{k>K}|a_kz^k|+U\\sum_{k>K}|b_kz^k|\\), which tends to zero. Square or triangular finite sums therefore approach the same product. Formal convolution alone would not justify this numerical step."
        }
      ]
    },
    {
      "id": "initial-terms",
      "title": "Subtract missing terms before summing a recurrence",
      "body": [
        {
          "kind": "math",
          "latex": "\\sum_{n=0}^{\\infty}a_{n+1}z^{n+1}=A(z)-a_0,\\qquad \\sum_{n=0}^{\\infty}a_nz^{n+1}=zA(z)."
        },
        {
          "kind": "prose",
          "text": "Write the allowed index range first, multiply by the chosen power, and identify every boundary coefficient. If a recurrence starts at index 1 instead of 0, its sum has one more initial correction. A finite initial change can alter the entire resulting sequence."
        },
        {
          "kind": "prose",
          "text": "For prefix sums \\(s_n=\\sum_{k=0}^nc_k\\), convolution with the geometric series gives the formal identity \\(S(z)=C(z)/(1-z)\\). Numerical equality is justified wherever the relevant series converge absolutely. This is a useful alternative to reversing a double sum without a bound."
        }
      ]
    },
    {
      "id": "factorial-normalization",
      "title": "An exponential generating function stores a different coefficient",
      "body": [
        {
          "kind": "math",
          "latex": "E(z)=\\sum_{n=0}^{\\infty}\\frac{a_n}{n!}z^n,\\qquad a_n=n![z^n]E(z)."
        },
        {
          "kind": "prose",
          "text": "This is the exponential generating function of the same sequence. Its coefficients are divided by factorials; it is not generally the ordinary generating function. For a second sequence, write \\(F(z)=\\sum_{n=0}^{\\infty}b_nz^n/n!\\). The coefficient of a product of the two exponential generating functions becomes a binomial convolution after multiplication by \\(n!\\):"
        },
        {
          "kind": "math",
          "latex": "n![z^n](E(z)F(z))=\\sum_{k=0}^n\\binom nk a_kb_{n-k}."
        },
        {
          "kind": "prose",
          "text": "This identity explains why binomially weighted recurrences suggest exponential normalization. It does not solve every nonlinear recurrence or establish its convergence radius. Those steps need their own equation, initial conditions and analytic argument."
        }
      ]
    }
  ],
  "worked": [
    {
      "id": "inhomogeneous-recurrence",
      "revision": 1,
      "title": "Keep a nonzero initial term in the recurrence equation",
      "problem": [
        {
          "kind": "prose",
          "text": "Let \\(a_0=2\\) and \\(a_{n+1}=2a_n+n+1\\) for integers \\(n\\ge0\\). Find an explicit formula for \\(a_n\\), determine the real convergence interval of \\(A(z)=\\sum_{n=0}^{\\infty}a_nz^n\\), and evaluate \\(A(1/4)\\)."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "First work formally. Multiplying the recurrence by \\(z^{n+1}\\) and using \\(\\sum_{n=0}^{\\infty}(n+1)z^n=(1-z)^{-2}\\) gives"
        },
        {
          "kind": "math",
          "latex": "A(z)-2=2zA(z)+\\frac{z}{(1-z)^2},\\qquad A(z)=\\frac{2-3z+2z^2}{(1-2z)(1-z)^2}."
        },
        {
          "kind": "math",
          "latex": "A(z)=\\frac{4}{1-2z}-\\frac{2}{1-z}-\\frac{z}{(1-z)^2},\\qquad a_n=2^{n+2}-n-2."
        },
        {
          "kind": "prose",
          "text": "The formula gives \\(a_0=2\\) and satisfies the original recurrence, so induction identifies every coefficient independently of any evaluation. For \\(|z|<1/2\\), each of the three displayed component series converges absolutely. For \\(|z|\\ge1/2\\), the term magnitudes do not tend to zero: \\(a_n/2^n=4-(n+2)/2^n\\to4\\). Thus the real convergence interval is exactly \\((-1/2,1/2)\\), and both endpoints are excluded."
        },
        {
          "kind": "math",
          "latex": "A(1/4)=\\frac{11/8}{(1/2)(3/4)^2}=\\frac{44}{9}."
        }
      ],
      "verification": [
        "Author self-check: exact partial fractions and recurrence substitution, including index zero.",
        "Author self-check: both boundary terms fail the term test; evaluation lies strictly inside the proven interval."
      ]
    },
    {
      "id": "harmonic-prefix-coefficients",
      "revision": 1,
      "title": "A prefix sum adds a geometric factor",
      "problem": [
        {
          "kind": "prose",
          "text": "Set \\(H_0=0\\) and \\(H_n=\\sum_{k=1}^n1/k\\) for integers \\(n\\ge1\\). Derive the generating function of \\(H_n\\) for real \\(|z|<1\\). Then find the coefficient of \\(z^n\\) in \\(-\\ln(1-z)/(1-z)^2\\), for every integer \\(n\\ge0\\)."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Integrating the geometric series from 0 to \\(z\\), on a closed interval lying strictly inside \\((-1,1)\\), gives \\(\\sum_{k=1}^{\\infty}z^k/k=-\\ln(1-z)\\). The real logarithm is defined there because \\(1-z>0\\). Multiplying by the geometric series and extracting one coefficient yields"
        },
        {
          "kind": "math",
          "latex": "\\sum_{n=0}^{\\infty}H_nz^n=-\\frac{\\ln(1-z)}{1-z}\\qquad(|z|<1)."
        },
        {
          "kind": "prose",
          "text": "The products are justified by absolute convergence, not merely by the nonnegative case: \\(0\\le H_n\\le n\\) for \\(n\\ge1\\), and \\(\\sum n|z|^n\\) is finite. Multiplying once more by \\((1-z)^{-1}\\) takes one further prefix sum. A finite change of order gives"
        },
        {
          "kind": "math",
          "latex": "[z^n]\\frac{-\\ln(1-z)}{(1-z)^2}=\\sum_{j=0}^nH_j=\\sum_{k=1}^n\\frac{n-k+1}{k}=(n+1)H_n-n."
        },
        {
          "kind": "prose",
          "text": "The formula also gives 0 at \\(n=0\\). This is an exact coefficient identity; no endpoint evaluation at \\(z=1\\) follows from it."
        }
      ],
      "verification": [
        "Author self-check: finite triangular sum counted by the number of prefixes containing each reciprocal.",
        "Author self-check: coefficient zero at index zero and absolute majorant for all real interior arguments."
      ]
    }
  ],
  "contrast": [
    {
      "kind": "prose",
      "text": "A finite product has no convergence issue, whereas an infinite generating series does. Also, coefficientwise multiplication \\(a_nb_n\\) is not convolution. For \\(A(z)=B(z)=1/(1-z)\\), the coefficientwise product would still have coefficients 1, but \\(A(z)B(z)=(1-z)^{-2}\\) has coefficient \\(n+1\\). Finally, a rational expression obtained formally does not license substitution at its poles or at a point beyond the original series radius."
    }
  ],
  "mistakes": [
    "Dropping the initial coefficient when shifting a recurrence.",
    "Treating a formal series as a convergent numerical sum.",
    "Replacing convolution by coefficientwise multiplication.",
    "Forgetting the factorial when extracting a sequence from its exponential generating function.",
    "Counting repeated selections in a product whose factors permit each item only once."
  ],
  "exercises": [
    {
      "id": "weighted-pair-extraction",
      "revision": 1,
      "title": "Count distinct weighted pairs without listing all subsets",
      "problem": [
        {
          "kind": "prose",
          "text": "Five labeled items have weights \\(1,2,4,8,16\\). The weight of a chosen pair is the product of its two distinct item weights. Find the sum of the weights of all unordered pairs by extracting a coefficient of a finite polynomial. Explain why squaring the sum of the five weights gives the wrong answer unless corrected."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Use a factor \\(1+w_jy\\) for each item; choosing its second term means selecting that item."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "The coefficient of \\(y^2\\) counts each pair once. In the square of a sum, off-diagonal pairs occur twice and diagonal terms select an item twice."
          }
        ],
        [
          {
            "kind": "math",
            "latex": "2\\sum_{i<j}w_iw_j=\\left(\\sum_jw_j\\right)^2-\\sum_jw_j^2."
          }
        ]
      ],
      "solution": [
        {
          "kind": "math",
          "latex": "[y^2]\\prod_{j=0}^{4}(1+2^jy)=\\sum_{0\\le i<j\\le4}2^{i+j}."
        },
        {
          "kind": "prose",
          "text": "Every degree-two term chooses the second term from exactly two different factors, so it encodes one unordered pair. The total of the weights is 31 and the sum of their squares is \\(1+4+16+64+256=341\\). Therefore"
        },
        {
          "kind": "math",
          "latex": "\\sum_{0\\le i<j\\le4}2^{i+j}=\\frac{31^2-341}{2}=310."
        },
        {
          "kind": "prose",
          "text": "The uncorrected square 961 includes 341 from forbidden repeated items and counts each valid pair twice. This is finite polynomial algebra; no radius or infinite interchange theorem is needed."
        }
      ],
      "verification": [
        "Author self-check: polynomial coefficient equals direct enumeration of all ten distinct pairs.",
        "Author self-check: diagonal subtraction and division by two are independently necessary."
      ]
    },
    {
      "id": "factorial-growth-two-encodings",
      "revision": 1,
      "title": "One sequence has two very different convergence domains",
      "problem": [
        {
          "kind": "prose",
          "text": "Let \\(b_0=1\\) and \\(b_{n+1}=(n+1)b_n+1\\) for integers \\(n\\ge0\\). Find its exponential generating function \\(E(z)=\\sum_{n=0}^{\\infty}b_nz^n/n!\\), including its real convergence interval. Decide whether the ordinary generating series \\(\\sum b_nz^n\\) converges at any real \\(z\\ne0\\)."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Divide the recurrence by \\((n+1)!\\) and set \\(c_n=b_n/n!\\). The transformed sequence is a prefix sum."
          }
        ],
        [
          {
            "kind": "math",
            "latex": "c_{n+1}=c_n+\\frac1{(n+1)!},\\qquad c_0=1."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Use the power series of the exponential and the prefix-sum rule. For the original series, compare \\(b_n\\) with \\(n!\\). Check the endpoints for the normalized series separately."
          }
        ]
      ],
      "solution": [
        {
          "kind": "math",
          "latex": "c_n=\\sum_{j=0}^n\\frac1{j!},\\qquad E(z)=\\frac{e^z}{1-z}\\qquad(|z|<1)."
        },
        {
          "kind": "prose",
          "text": "The formula for \\(c_n\\) follows by induction. The exponential power series and the geometric series converge absolutely for \\(|z|<1\\), so their product has exactly these coefficients. Also \\(1\\le c_n\\le3\\): for \\(j\\ge1\\), \\(j!\\ge2^{j-1}\\), and the resulting geometric upper bound is 3 after including \\(j=0\\). This proves convergence inside the interval directly. For \\(|z|\\ge1\\), \\(|c_nz^n|\\ge1\\), so neither endpoint nor any exterior real point is allowed."
        },
        {
          "kind": "prose",
          "text": "On the other hand \\(b_n=n!c_n\\ge n!\\). For fixed \\(z\\ne0\\), successive magnitudes of \\(n!z^n\\) have ratio \\((n+1)|z|\\), eventually at least 2. Thus \\(b_nz^n\\) cannot tend to zero. The ordinary generating series converges only at zero, even though the exponential generating function has the nontrivial interval \\((-1,1)\\)."
        }
      ],
      "verification": [
        "Author self-check: exact integer recurrence and normalized prefix formula.",
        "Author self-check: explicit coefficient bound proves interior convergence; the term test handles both endpoints and zero-radius ordinary normalization."
      ]
    }
  ],
  "alternatives": [
    {
      "kind": "prose",
      "text": "Direct induction or a finite recurrence iteration can supply coefficients without generating functions; checking those coefficients is a useful second route. More advanced recurrence-to-differential-equation methods, nonlinear coefficient inversion, special-function generating identities and coefficient asymptotics require additional lessons. The finite pair extraction here does not establish a general weighted-subset product formula."
    }
  ],
  "related": [
    "recurrences",
    "higher-derivatives",
    "rearrangements"
  ],
  "next": [
    "rearrangements"
  ],
  "references": [
    {
      "sourceId": "mathworld",
      "url": "https://mathworld.wolfram.com/GeneratingFunction.html",
      "use": "reference-only"
    },
    {
      "sourceId": "mathworld",
      "url": "https://mathworld.wolfram.com/ExponentialGeneratingFunction.html",
      "use": "reference-only"
    },
    {
      "sourceId": "mathworld",
      "url": "https://mathworld.wolfram.com/CauchyProduct.html",
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
