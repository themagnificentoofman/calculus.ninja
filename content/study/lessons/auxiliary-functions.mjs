export default {
  "id": "auxiliary-functions",
  "revision": 1,
  "title": "Auxiliary exponential factors and zero bounds",
  "summary": "Choose a positive exponential factor to encode a derivative relation, pass zeros through successive constructions, and bound zeros of finite sums of distinct real exponentials.",
  "objectives": [
    "Construct a weighted function whose stationary point gives the requested first-order relation.",
    "Track interval hypotheses and distinct zeros through two successive weighted Rolle arguments.",
    "Derive the coefficient-derivative term when composing variable-coefficient first-order expressions.",
    "Prove a zero bound for constant-coefficient real exponential sums and use it for uniqueness."
  ],
  "prerequisites": [
    "derivative-shape",
    "higher-derivatives",
    "exp-log"
  ],
  "readiness": [
    {
      "lessonId": "derivative-shape",
      "exerciseId": "corner-and-endpoints",
      "prompt": "Check included endpoints and differentiability before using an extremum or mean-value argument."
    },
    {
      "lessonId": "higher-derivatives",
      "exerciseId": "operator-versus-derivative",
      "prompt": "Distinguish a composed variable-coefficient operator from a scaled ordinary derivative, retaining the derivative of each coefficient."
    },
    {
      "lessonId": "exp-log",
      "exerciseId": "log-magnitude",
      "prompt": "Compare the real domains of logarithmic expressions before transforming them."
    }
  ],
  "sections": [
    {
      "id": "design-the-function",
      "title": "Design the function before differentiating",
      "body": [
        {
          "kind": "prose",
          "text": "Rolle’s theorem starts with a real function that is continuous on a closed interval \\([a,b]\\), differentiable on \\((a,b)\\), and has equal endpoint values. It then gives an interior point where its derivative vanishes. In an auxiliary-function argument, the main choice is which function should have those equal values: the original function may not."
        },
        {
          "kind": "prose",
          "text": "To obtain a relation involving \\(f^{\\prime}-P^{\\prime}f\\), consider \\(H=e^{-P}f\\). The product and chain rules give"
        },
        {
          "kind": "math",
          "latex": "H^{\\prime}(x)=e^{-P(x)}\\bigl(f^{\\prime}(x)-P^{\\prime}(x)f(x)\\bigr)."
        },
        {
          "kind": "prose",
          "text": "The exponential factor is strictly positive for every finite real \\(P(x)\\). Therefore a zero of \\(H^{\\prime}\\) is exactly a zero of the expression in parentheses. This construction never divides by \\(f\\), so zeros and sign changes of \\(f\\) are allowed. Taking \\(\\ln f\\) instead would require positivity and would generally lose these cases."
        },
        {
          "kind": "prose",
          "text": "Choose \\(P\\) by differentiating a proposed expression until \\(P^{\\prime}\\) matches the coefficient of \\(f\\). The examples below use polynomial \\(P\\), so finding the factor needs no improper integral or separate existence theorem for antiderivatives. After choosing it, check the actual weighted endpoint values before invoking Rolle."
        }
      ]
    },
    {
      "id": "weighted-rolle",
      "title": "Equal weighted values and distinct zeros",
      "body": [
        {
          "kind": "prose",
          "text": "Let \\(a<b\\), let \\(f\\) be continuous on \\([a,b]\\) and differentiable on \\((a,b)\\), and let \\(P\\) have a continuous derivative on an open interval containing \\([a,b]\\). If"
        },
        {
          "kind": "math",
          "latex": "e^{-P(a)}f(a)=e^{-P(b)}f(b),"
        },
        {
          "kind": "prose",
          "text": "then Rolle applied to \\(e^{-P}f\\) gives some \\(c\\in(a,b)\\) with"
        },
        {
          "kind": "math",
          "latex": "f^{\\prime}(c)-P^{\\prime}(c)f(c)=0."
        },
        {
          "kind": "prose",
          "text": "In particular, two zeros of \\(f\\) give equal weighted endpoint values of zero. If \\(f\\) has distinct zeros \\(x_1<\\cdots<x_k\\) and the same regularity holds between them, apply this argument separately to each adjacent interval. There is a zero of \\(f^{\\prime}-P^{\\prime}f\\) in each \\((x_j,x_{j+1})\\), so at least \\(k-1\\) distinct zeros survive. The intervals are disjoint; this is why the resulting zeros are distinct."
        },
        {
          "kind": "prose",
          "text": "This counts distinct points, not multiplicities. It does not give the location of the zero in each gap, nor say that there is only one there. Multiplication by the everywhere-positive exponential changes neither the original zero set nor its sign changes."
        }
      ]
    },
    {
      "id": "two-stage-construction",
      "title": "Compose two constructions and keep the coefficient derivative",
      "body": [
        {
          "kind": "prose",
          "text": "Suppose \\(f\\) has two continuous derivatives on an open interval containing \\([a,b]\\). Let \\(P\\) have two continuous derivatives there, and let \\(Q\\) have one. Write \\(p=P^{\\prime}\\), \\(q=Q^{\\prime}\\), and define \\(T_p f=f^{\\prime}-pf\\). These symbols name ordinary first-order expressions; they do not permit treating a variable coefficient as a constant."
        },
        {
          "kind": "math",
          "latex": "T_q(T_p f)=(f^{\\prime}-pf)^{\\prime}-q(f^{\\prime}-pf)"
        },
        {
          "kind": "math",
          "latex": "T_q(T_p f)=f^{\\prime\\prime}-(p+q)f^{\\prime}+(pq-p^{\\prime})f."
        },
        {
          "kind": "prose",
          "text": "If \\(f\\) has three distinct zeros \\(x_1<x_2<x_3\\) in the interval, the first weighted Rolle argument gives zeros \\(u\\in(x_1,x_2)\\) and \\(v\\in(x_2,x_3)\\) of \\(g=T_p f\\). Apply Rolle to \\(e^{-Q}g\\) on \\([u,v]\\). At some \\(c\\in(u,v)\\), the second expression \\(T_qg\\) vanishes. Thus the displayed second-order relation holds at an interior point of \\((x_1,x_3)\\)."
        },
        {
          "kind": "prose",
          "text": "Order can matter. If \\(Q\\) also has two continuous derivatives, reversing the two expressions gives the coefficient \\(pq-q^{\\prime}\\) instead. Their difference is"
        },
        {
          "kind": "math",
          "latex": "T_q(T_p f)-T_p(T_q f)=(q^{\\prime}-p^{\\prime})f."
        },
        {
          "kind": "prose",
          "text": "The zero-count argument remains finite: three supplied zeros produce two intermediate zeros, and those produce one final zero. No claim about a differential equation holding at every point follows from a relation proved at one point."
        }
      ]
    },
    {
      "id": "exponential-zero-bound",
      "title": "Eliminate one exponential mode at a time",
      "body": [
        {
          "kind": "prose",
          "text": "Consider a real exponential sum with constant real coefficients"
        },
        {
          "kind": "math",
          "latex": "F(x)=\\sum_{j=1}^r a_j e^{\\lambda_j x},\\qquad\\lambda_1<\\cdots<\\lambda_r,\\qquad a_j\\ne0."
        },
        {
          "kind": "prose",
          "text": "Here \\(r\\) is a positive integer. Delete zero-coefficient terms first and combine equal rates before counting the remaining terms. If at least one term remains, the sum has at most \\(r-1\\) distinct real zeros. The assertion also establishes that such a sum is not identically zero."
        },
        {
          "kind": "prose",
          "text": "Prove both statements together by induction on \\(r\\). With one nonzero term, the exponential is always positive, so the sum has no zero. For \\(r\\ge2\\), multiply by \\(e^{-\\lambda_1x}\\), which preserves zeros. The first term becomes constant and disappears upon differentiation:"
        },
        {
          "kind": "math",
          "latex": "G(x)=e^{-\\lambda_1x}F(x)=a_1+\\sum_{j=2}^r a_j e^{(\\lambda_j-\\lambda_1)x},"
        },
        {
          "kind": "math",
          "latex": "G^{\\prime}(x)=\\sum_{j=2}^r a_j(\\lambda_j-\\lambda_1)e^{(\\lambda_j-\\lambda_1)x}."
        },
        {
          "kind": "prose",
          "text": "The new rates are still distinct and real, and every remaining coefficient is nonzero. By the inductive statement, \\(G^{\\prime}\\) is not identically zero and has at most \\(r-2\\) distinct real zeros. Consequently \\(G\\), and hence \\(F\\), cannot be identically zero either. If \\(F\\) had \\(r\\) distinct zeros, choose and order those \\(r\\) points. Rolle between adjacent zeros of \\(G\\) would give at least \\(r-1\\) zeros of \\(G^{\\prime}\\), a contradiction."
        },
        {
          "kind": "prose",
          "text": "This also rules out infinitely many distinct real zeros: an infinite set would contain \\(r\\) distinct points. No global extremum, unbounded-interval version of Rolle, or limiting zero count was used; every application is on one finite closed interval."
        }
      ]
    },
    {
      "id": "uniqueness-and-scope",
      "title": "A zero bound can prove uniqueness without solving coefficients",
      "body": [
        {
          "kind": "prose",
          "text": "Fix \\(r\\) distinct real rates. If two linear combinations of their exponentials agree at \\(r\\) distinct real points, subtract them. Unless every coefficient difference is zero, the difference has at most \\(r-1\\) distinct zeros by the proved theorem. Since it has at least \\(r\\), all coefficient differences must be zero. Thus there is at most one combination with prescribed values at those points."
        },
        {
          "kind": "prose",
          "text": "This is a uniqueness statement. Existence for arbitrary prescribed data needs an additional finite linear-algebra argument and is not assumed here. Likewise, an upper zero bound is not a claim that every combination attains it. A particular example reaches the bound only after the required distinct zeros have actually been exhibited."
        },
        {
          "kind": "prose",
          "text": "The theorem concerns constant coefficients and real exponential rates. Polynomial coefficients, complex rates, multiplicity bounds and general differential-operator zero theorems require further arguments. The auxiliary-function idea transfers broadly; this proof has a specific scope."
        }
      ]
    }
  ],
  "worked": [
    {
      "id": "weighted-endpoint-relation",
      "revision": 1,
      "title": "Different endpoint values can become equal",
      "problem": [
        {
          "kind": "prose",
          "text": "Let \\(f\\) be continuous on \\([0,2]\\), differentiable on \\((0,2)\\), with \\(f(0)=1\\) and \\(f(2)=e^8\\). Prove that some \\(c\\in(0,2)\\) satisfies \\(f^{\\prime}(c)=(3c+1)f(c)\\). No sign condition on the interior values of \\(f\\) is given."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "The coefficient \\(3x+1\\) suggests \\(P(x)=3x^2/2+x\\). Define \\(H(x)=e^{-3x^2/2-x}f(x)\\). It has the continuity and differentiability needed for Rolle, and"
        },
        {
          "kind": "math",
          "latex": "H(0)=1,\\qquad H(2)=e^{-8}e^8=1."
        },
        {
          "kind": "prose",
          "text": "At some \\(c\\in(0,2)\\), \\(H^{\\prime}(c)=0\\). Direct differentiation gives"
        },
        {
          "kind": "math",
          "latex": "H^{\\prime}(x)=e^{-3x^2/2-x}\\bigl(f^{\\prime}(x)-(3x+1)f(x)\\bigr)."
        },
        {
          "kind": "prose",
          "text": "The exponential is nonzero, so the required relation follows. The argument neither divides by \\(f(c)\\) nor claims that the relation holds throughout the interval. The original endpoints are unequal; applying Rolle directly to \\(f\\) would not be justified."
        }
      ],
      "verification": [
        "Author exact checks and analytic proof only; independent mathematics and teaching-exposure review pending."
      ]
    },
    {
      "id": "two-known-zeros",
      "revision": 1,
      "title": "Two known zeros are all the zeros",
      "problem": [
        {
          "kind": "prose",
          "text": "Find all real zeros of \\(F(x)=e^{(2+\\sqrt2)x}-(2^{\\sqrt2}-1)e^{3x}+(2^{\\sqrt2}-2)e^{2x}\\). All powers of 2 have their usual positive-base real meaning."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Put \\(R=2^{\\sqrt2}\\), so \\(R>2\\). The three rates \\(2,3,2+\\sqrt2\\) are distinct and real, and all three coefficients are nonzero. The zero-bound theorem gives at most two distinct real zeros. Direct substitution gives"
        },
        {
          "kind": "math",
          "latex": "F(0)=1-(R-1)+(R-2)=0,"
        },
        {
          "kind": "math",
          "latex": "F(\\ln2)=4\\bigl(R-2(R-1)+(R-2)\\bigr)=0."
        },
        {
          "kind": "prose",
          "text": "The points 0 and \\(\\ln2\\) are distinct, so they are all the real zeros. The normalization \\(e^{-2x}F(x)\\) explicitly reduces the rates to \\(0,1,\\sqrt2\\); its derivative has only two nonzero exponential terms."
        },
        {
          "kind": "prose",
          "text": "Another route is \\(y=e^x>0\\), reducing the equation to \\(h(y)=y^{\\sqrt2}-(R-1)y+(R-2)=0\\). Its second derivative is"
        },
        {
          "kind": "math",
          "latex": "h^{\\prime\\prime}(y)=\\sqrt2(\\sqrt2-1)y^{\\sqrt2-2}>0\\quad(y>0)."
        },
        {
          "kind": "prose",
          "text": "Three distinct zeros would force a zero of \\(h^{\\prime\\prime}\\) by two applications of Rolle, which is impossible. The displayed roots correspond to \\(y=1,2\\). This alternative still uses Rolle; it is not a separate theorem of exponential-sum completeness."
        }
      ],
      "verification": [
        "Author exact checks and analytic proof only; independent mathematics and teaching-exposure review pending."
      ]
    }
  ],
  "contrast": [
    {
      "kind": "prose",
      "text": "Repeated rates must be combined: \\(e^x-e^x\\) has nonzero written coefficients but is identically zero. Counting the two written terms as distinct modes would falsely predict at most one zero."
    },
    {
      "kind": "prose",
      "text": "Variable coefficients change the problem. The function \\((x^2-1)e^x\\) has two distinct real zeros although only one exponential rate appears. The constant-coefficient one-term theorem cannot be applied to it."
    },
    {
      "kind": "prose",
      "text": "A factor with zeros can create zeros: \\(f(x)=1\\) has none, while \\(xf(x)=x\\) has one. A factor that is undefined can also destroy the interval hypotheses. The exponential factors used above are finite, positive and differentiable on the entire interval."
    },
    {
      "kind": "prose",
      "text": "Differentiability cannot be replaced by continuity in the weighted Rolle argument. For \\(f(x)=|x|-1\\) on \\([-1,1]\\), with \\(P=0\\), the endpoint values agree but every existing interior derivative is \\(-1\\) or 1; the derivative fails to exist at zero."
    },
    {
      "kind": "prose",
      "text": "The zero bound is not a statement about all oscillatory functions. For instance, \\(\\sin x\\) has infinitely many real zeros and is not a finite sum of real-rate exponentials with constant real coefficients as described here."
    }
  ],
  "mistakes": [
    "Taking \\(\\ln f\\) when positivity of \\(f\\) was never assumed; the product \\(e^{-P}f\\) avoids that division.",
    "Checking the original endpoints instead of the weighted endpoint values required by the construction.",
    "Dropping \\(-p^{\\prime}f\\) when differentiating \\(f^{\\prime}-pf\\), or reversing the operator order without checking the result.",
    "Counting written exponential terms before removing zero coefficients and combining equal rates.",
    "Turning an upper bound for distinct zeros into an exact count, a multiplicity statement, or existence of an interpolant."
  ],
  "exercises": [
    {
      "id": "three-sample-identity",
      "revision": 1,
      "title": "Three equal samples of an exponential combination",
      "problem": [
        {
          "kind": "prose",
          "text": "Let \\(A,B,C\\) be real constants and \\(F(x)=Ae^{-x}+Be^{2x}+Ce^{\\sqrt5x}\\). Suppose \\(F(-1)=F(0)=F(1)=0\\). Determine all possible triples \\((A,B,C)\\), with a proof that no other triple satisfies the conditions."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "The three rates \\(-1,2,\\sqrt5\\) are distinct real numbers, since \\(2<\\sqrt5\\). Suppose at least one coefficient is nonzero and delete any zero terms. There are \\(r\\) active terms, where \\(1\\le r\\le3\\). The proved theorem allows at most \\(r-1\\le2\\) distinct real zeros, but \\(-1,0,1\\) are three distinct zeros. This is a contradiction."
        },
        {
          "kind": "math",
          "latex": "(A,B,C)=(0,0,0)."
        },
        {
          "kind": "prose",
          "text": "This triple does satisfy every condition, so it is the complete answer. The proof includes the cases in which one or two coefficients initially vanish, and does not assume invertibility of an uncomputed coefficient matrix."
        }
      ],
      "verification": [
        "Author exact checks and analytic proof only; independent mathematics and teaching-exposure review pending."
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Separate the all-zero coefficient case from the possibility that some coefficients are nonzero. Count the distinct sample points."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "After removing zero terms, the remaining rates stay distinct and real. Compare the number of active terms with the number of supplied zeros."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Normalize a nonzero sum by one exponential factor and apply the zero-bound theorem. With at most three active terms, three distinct zeros are impossible."
          }
        ]
      ]
    },
    {
      "id": "second-order-interior-relation",
      "revision": 1,
      "title": "Three zeros and a second-order relation",
      "problem": [
        {
          "kind": "prose",
          "text": "Let \\(f\\) have two continuous derivatives on an open interval containing \\([0,2]\\), and suppose \\(f(0)=f(1)=f(2)=0\\). Prove that there is a point \\(c\\in(0,2)\\) such that"
        },
        {
          "kind": "math",
          "latex": "f^{\\prime\\prime}(c)-(3c+1)f^{\\prime}(c)+(2c^2+2c-2)f(c)=0."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Define \\(g(x)=f^{\\prime}(x)-2xf(x)\\). The function \\(H(x)=e^{-x^2}f(x)\\) vanishes at 0, 1 and 2, and"
        },
        {
          "kind": "math",
          "latex": "H^{\\prime}(x)=e^{-x^2}g(x)."
        },
        {
          "kind": "prose",
          "text": "Rolle on \\([0,1]\\) and \\([1,2]\\) gives \\(u\\in(0,1)\\) and \\(v\\in(1,2)\\) with \\(g(u)=g(v)=0\\). The function \\(g\\) is continuously differentiable, so apply Rolle again to \\(K(x)=e^{-x^2/2-x}g(x)\\) on \\([u,v]\\). At some \\(c\\in(u,v)\\),"
        },
        {
          "kind": "math",
          "latex": "0=K^{\\prime}(c)=e^{-c^2/2-c}\\bigl(g^{\\prime}(c)-(c+1)g(c)\\bigr)."
        },
        {
          "kind": "prose",
          "text": "Differentiate the actual product in \\(g\\):"
        },
        {
          "kind": "math",
          "latex": "g^{\\prime}-(x+1)g=f^{\\prime\\prime}-2f-2xf^{\\prime}-(x+1)(f^{\\prime}-2xf)"
        },
        {
          "kind": "math",
          "latex": "g^{\\prime}-(x+1)g=f^{\\prime\\prime}-(3x+1)f^{\\prime}+(2x^2+2x-2)f."
        },
        {
          "kind": "prose",
          "text": "The exponential factor is positive, so the desired expression vanishes at this \\(c\\), with \\(0<c<2\\). If \\(f\\) is identically zero, the same argument is valid and every interior point also satisfies the relation. The conclusion is existence at a point, not that \\(f\\) solves this differential equation everywhere."
        }
      ],
      "verification": [
        "Author exact checks and analytic proof only; independent mathematics and teaching-exposure review pending."
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Look for two successive first-order expressions that could transfer three zeros to two and then to one."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Start with \\(g=f^{\\prime}-2xf\\). Differentiate \\(e^{-x^2}f\\) and use the three supplied zeros to find two zeros of \\(g\\)."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Differentiate \\(e^{-x^2/2-x}g\\) between those two zeros. Expand \\(g^{\\prime}-(x+1)g\\), including the derivative of \\(2x\\)."
          }
        ]
      ]
    }
  ],
  "alternatives": [
    {
      "kind": "prose",
      "text": "Sometimes subtracting a simple comparison polynomial is the best auxiliary construction. Here a positive multiplicative factor is chosen because the desired derivative expression includes the original function itself."
    },
    {
      "kind": "prose",
      "text": "A substitution can turn a particular exponential equation into a polynomial or a function with a definite second-derivative sign. The general real-rate zero bound works even when the rates have no common integer scale."
    },
    {
      "kind": "prose",
      "text": "Direct finite linear algebra can verify a particular coefficient-uniqueness example. The zero-bound proof explains why uniqueness persists for any distinct real sample points, without evaluating each new determinant."
    }
  ],
  "related": [
    "lhopital",
    "linear-ode",
    "taylor-remainders",
    "strategy-choice"
  ],
  "next": [
    "strategy-choice"
  ],
  "references": [
    {
      "sourceId": "mathworld-rolle",
      "url": "https://mathworld.wolfram.com/RollesTheorem.html",
      "use": "reference-only"
    },
    {
      "sourceId": "waldschmidt-exponential-zero-lemma",
      "url": "https://webusers.imj-prg.fr/~michel.waldschmidt/articles/pdf/SixExponentialsIrrationality.pdf",
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
