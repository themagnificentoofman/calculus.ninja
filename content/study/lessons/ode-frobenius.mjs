export default {
  "id": "ode-frobenius",
  "revision": 1,
  "title": "Power-series solutions and regular-singular Frobenius methods",
  "summary": "Derive coefficient recurrences, justify convergent solutions, and detect a resonant obstruction without confusing formal algebra with a function.",
  "objectives": [
    "Distinguish ordinary points, regular singular points and analytic coefficient hypotheses.",
    "Construct convergent series using indexed coefficient identities and ratio bounds.",
    "Check resonant recurrence compatibility instead of dividing by zero or predicting logarithms from root spacing alone."
  ],
  "prerequisites": [
    "second-order-ode",
    "power-series",
    "ode-reduction"
  ],
  "sections": [
    {
      "id": "ordinary-series",
      "title": "An analytic equation permits an analytic solution",
      "body": [
        {
          "kind": "prose",
          "text": "A real function is analytic near a point when it equals a convergent power series there. For a normalized linear equation \\(y''+p(x)y'+q(x)y=0\\), an ordinary point in this lesson has \\(p,q\\) analytic on a neighborhood. The analytic linear-ODE theorem then supplies a convergent power-series solution for each pair of initial data on some neighborhood. Merely having infinitely many derivatives is not the same hypothesis."
        },
        {
          "kind": "prose",
          "text": "At a center zero, substitute \\(y=\\sum_{n=0}^\\infty a_nx^n\\). On an interval of convergence, the power-series differentiation theorem gives"
        },
        {
          "kind": "math",
          "latex": "y'=\\sum_{n=0}^\\infty(n+1)a_{n+1}x^n,\\qquad y''=\\sum_{n=0}^\\infty(n+2)(n+1)a_{n+2}x^n."
        },
        {
          "kind": "prose",
          "text": "Compare coefficients of the same power after reindexing every sum. The initial values are \\(a_0=y(0)\\), \\(a_1=y'(0)\\). A formal recurrence is an algebraic candidate. To claim an actual solution, also establish a positive convergence radius and justify termwise operations; the worked examples provide explicit bounds rather than relying only on the general theorem."
        }
      ]
    },
    {
      "id": "regular-singular",
      "title": "Multiply by the powers that remove the singularity",
      "body": [
        {
          "kind": "prose",
          "text": "Suppose the normalized homogeneous equation is defined for \\(0<x<\\rho\\). Zero is a regular singular point in the analytic setting used here if \\(x p(x)=P(x)\\) and \\(x^2 q(x)=Q(x)\\) extend analytically through zero, while the original normalized coefficients are not both analytic there. Then rewrite it as"
        },
        {
          "kind": "math",
          "latex": "x^2y''+xP(x)y'+Q(x)y=0."
        },
        {
          "kind": "prose",
          "text": "Seek a Frobenius form \\(y=x^r\\sum_{n=0}^\\infty a_nx^n\\), with \\(a_0\\ne0\\). Here \\(r\\) is an exponent; \\(x^r=e^{r\\ln x}\\) for real \\(r\\) on the positive interval. The lowest power gives the indicial equation"
        },
        {
          "kind": "math",
          "latex": "r(r-1)+P(0)r+Q(0)=0."
        },
        {
          "kind": "prose",
          "text": "Under the analytic hypotheses, two real roots whose difference is not an integer give two independent convergent Frobenius solutions on a sufficiently small positive interval. A repeated root or integer difference requires a compatibility check: a second solution may involve \\(\\ln x\\). The method does not say that every integer difference forces a logarithm. Complex exponents and a full general convergence proof are beyond this lesson; our nonresonant example has real roots and an explicit infinite-radius coefficient bound."
        }
      ]
    },
    {
      "id": "resonant-recurrence",
      "title": "At a zero denominator, check the equation before solving it",
      "body": [
        {
          "kind": "prose",
          "text": "A typical coefficient equation has the form \\(D_n a_n=b_n\\), where \\(b_n\\) depends on earlier coefficients. If \\(D_n=0\\), dividing is invalid. When \\(b_n\\ne0\\), the proposed series form is impossible. When \\(b_n=0\\), the coefficient may remain free; later equations must still be satisfied. This reasoning is coefficientwise and can reject a formal series even before convergence is considered."
        },
        {
          "kind": "prose",
          "text": "For the Euler equation \\(x^2y''+xy'=0\\) on \\(x>0\\), the indicial root zero is repeated. Setting \\(v=y'\\) gives \\(xv'+v=0\\), hence \\(v=C/x\\). Integration supplies \\(1\\) and \\(\\ln x\\) as independent solutions. A second analytic power series at zero cannot replace the logarithmic mode. No ordinary two-data initial-value theorem at zero applies to this singular normalized equation."
        }
      ]
    },
    {
      "id": "verify-series",
      "title": "A finite expansion and an infinite solution are different claims",
      "body": [
        {
          "kind": "prose",
          "text": "After finding coefficients, state where the series converges and where it can be differentiated. For \\(x^r A(x)\\), an analytic factor \\(A\\) may converge through zero even though the full function does not. On any closed interval \\([\\delta,R]\\) with \\(0<\\delta<R\\) contained in the convergence interval of \\(A\\), multiplying by the smooth factor \\(x^r\\) preserves the justified termwise derivatives. At the singular endpoint, behavior must be checked separately."
        },
        {
          "kind": "prose",
          "text": "Truncating a solution series usually leaves a residual of a known order, not zero. A convergent coefficient construction plus uniqueness on each positive coefficient interval identifies a solution; a few correct coefficients alone do not."
        }
      ]
    }
  ],
  "worked": [
    {
      "id": "gaussian-primitive-series",
      "revision": 1,
      "title": "An ordinary point with a convergence proof",
      "problem": [
        {
          "kind": "prose",
          "text": "Solve \\(y''+xy'=0\\), \\(y(0)=0\\), \\(y'(0)=1\\), by a power series. Give the first four nonzero terms and prove where the series represents the solution."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "The coefficient of \\(x^n\\) is \\((n+2)(n+1)a_{n+2}+na_n\\), with the latter term zero for \\(n=0\\). Thus"
        },
        {
          "kind": "math",
          "latex": "a_0=0,\\quad a_1=1,\\quad a_{n+2}=-\\frac{n a_n}{(n+2)(n+1)}\\quad(n\\ge0)."
        },
        {
          "kind": "prose",
          "text": "All even coefficients vanish. The odd coefficients give"
        },
        {
          "kind": "math",
          "latex": "y(x)=\\sum_{k=0}^\\infty\\frac{(-1)^k x^{2k+1}}{2^k k!(2k+1)}=x-\\frac{x^3}{6}+\\frac{x^5}{40}-\\frac{x^7}{336}+\\cdots."
        },
        {
          "kind": "prose",
          "text": "For each fixed nonzero \\(x\\), the absolute ratio of consecutive displayed terms is \\(x^2(2k+1)/[2(k+1)(2k+3)]\\), tending to zero. At zero the sum is zero. The radius is infinite, so termwise differentiation is valid on every finite interval. The derivative is the everywhere-convergent exponential series \\(e^{-x^2/2}\\); hence"
        },
        {
          "kind": "math",
          "latex": "y(x)=\\int_0^x e^{-t^2/2}\\,\\mathrm dt."
        },
        {
          "kind": "prose",
          "text": "This gives the prescribed data and \\(y''=-xy'\\) for every real \\(x\\). A finite odd polynomial from the expansion is an approximation, not the exact solution."
        }
      ],
      "verification": [
        "Author self-check: recurrence, first terms, all-order coefficient identity, ratio limit, derivative and IVP."
      ]
    },
    {
      "id": "fractional-indicial-pair",
      "revision": 1,
      "title": "Two noninteger-separated exponents",
      "problem": [
        {
          "kind": "prose",
          "text": "On \\(x>0\\), construct two independent normalized Frobenius solutions of \\(x^2y''+xy'+(3x-1/9)y=0\\). Use leading coefficient one in each series, compute the first three coefficients of each analytic factor, and justify convergence."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Here \\(P=1\\), \\(Q=3x-1/9\\) are analytic, and the indicial equation is \\(r^2-1/9=0\\). Thus \\(r=1/3\\) or \\(-1/3\\). Substitution gives"
        },
        {
          "kind": "math",
          "latex": "a_0=1,\\qquad ((n+r)^2-1/9)a_n+3a_{n-1}=0\\quad(n\\ge1)."
        },
        {
          "kind": "math",
          "latex": "a_n=-\\frac{3a_{n-1}}{n(n+2r)},\\qquad r=\\frac13\\ \\text{or}\\ -\\frac13."
        },
        {
          "kind": "prose",
          "text": "Neither denominator vanishes for an integer \\(n\\ge1\\). The two normalized solutions begin"
        },
        {
          "kind": "math",
          "latex": "y_+(x)=x^{1/3}\\left(1-\\frac95x+\\frac{81}{80}x^2+\\cdots\\right),\\qquad y_-(x)=x^{-1/3}\\left(1-9x+\\frac{81}{8}x^2+\\cdots\\right)."
        },
        {
          "kind": "prose",
          "text": "For either analytic factor, the ratio of successive term magnitudes is \\(3|x|/[(n+1)|n+1+2r|]\\), tending to zero for every finite \\(x\\). Both factors therefore have infinite radius. Their derivatives converge on compact intervals, and the full Frobenius solutions satisfy the equation on every compact positive interval. The coefficients solve the recurrence at every order."
        },
        {
          "kind": "prose",
          "text": "As \\(x\\downarrow0\\), \\(y_+/x^{1/3}\\to1\\) and \\(x^{1/3}y_-\\to1\\). In a relation \\(c_+y_++c_-y_-=0\\), multiplying by \\(x^{1/3}\\) forces \\(c_-=0\\), then \\(c_+=0\\). They are independent. The coefficient interval is \\((0,\\infty)\\); the negative-exponent solution diverges at zero, which is not an ordinary initial point."
        }
      ],
      "verification": [
        "Author self-check: indicial roots, six coefficients, all-order recurrence, ratio limit, independence and endpoint domain."
      ]
    }
  ],
  "contrast": [
    {
      "kind": "prose",
      "text": "Finite limits of \\(xp\\) and \\(x^2q\\) alone are not our analytic hypothesis; this lesson requires analytic extensions. Nor can an integer root difference decide whether logarithms occur. For \\(x^2y''+xy'+(x^2-1/4)y=0\\), the roots are \\(\\pm1/2\\), yet \\(x^{-1/2}\\cos x\\) and \\(x^{-1/2}\\sin x\\) are independent solutions on \\(x>0\\), both of Frobenius form. The second begins with \\(x^{1/2}\\). Direct substitution verifies them; their Wronskian is \\(1/x\\). This is a counterexample to a blanket logarithm rule, not a classification of all resonant equations."
    }
  ],
  "mistakes": [
    "Comparing \\(x^n\\) in one sum with \\(x^{n-2}\\) in another without reindexing.",
    "Dividing a recurrence by a coefficient that vanishes at a resonant index.",
    "Calling a formal series convergent because the first few coefficients exist.",
    "Applying ordinary initial data at a singular point or extending a real noninteger power through zero without specifying a branch."
  ],
  "exercises": [
    {
      "id": "resonance-obstruction",
      "revision": 1,
      "title": "A smaller indicial root fails",
      "problem": [
        {
          "kind": "prose",
          "text": "For \\(x^2y''-xy'+xy=0\\) on \\(x>0\\), find the indicial roots. Decide whether a solution \\(y=\\sum_{n=0}^\\infty a_nx^n\\) with \\(a_0\\ne0\\) can satisfy the equation even formally. Then construct the normalized series belonging to the larger root and justify its convergence; you need not construct the second solution."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "The coefficient of the lowest power gives \\(r(r-2)=0\\). For the root zero, set \\(a_{-1}=0\\) when writing a recurrence."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "The coefficient equation for root zero is \\(n(n-2)a_n+a_{n-1}=0\\). Compare the equations at \\(n=1\\) and \\(n=2\\)."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "For root two write \\(y=x^2\\sum b_nx^n\\), \\(b_0=1\\). Its recurrence is \\(n(n+2)b_n=-b_{n-1}\\) for \\(n\\ge1\\)."
          }
        ]
      ],
      "solution": [
        {
          "kind": "math",
          "latex": "r=0,2;\\qquad -a_1+a_0=0,\\qquad 0\\cdot a_2+a_1=0."
        },
        {
          "kind": "prose",
          "text": "The first equation gives \\(a_1=a_0\\ne0\\), while the second demands \\(a_1=0\\). Thus no proposed root-zero series with nonzero constant term exists, even formally. This is a resonant compatibility failure; it does not mean the differential equation has no solutions on a positive interval."
        },
        {
          "kind": "math",
          "latex": "y_2(x)=x^2\\sum_{n=0}^\\infty\\frac{2(-1)^n x^n}{n!(n+2)!}=x^2\\left(1-\\frac x3+\\frac{x^2}{24}-\\frac{x^3}{360}+\\cdots\\right)."
        },
        {
          "kind": "prose",
          "text": "The coefficient formula starts at one and satisfies \\(n(n+2)b_n=-b_{n-1}\\) for every \\(n\\ge1\\). The absolute term ratio is \\(|x|/[(n+1)(n+3)]\\), tending to zero. The analytic factor converges everywhere, and termwise differentiation verifies the equation on \\(x>0\\). Only this one branch is constructed here; the absent pure root-zero branch cannot be restored by assigning an arbitrary value to the incompatible coefficient."
        }
      ],
      "verification": [
        "Author self-check: two resonant coefficient equations, closed coefficient recurrence, four terms and convergence."
      ]
    },
    {
      "id": "ordinary-data-recurrence",
      "revision": 1,
      "title": "Two data channels in an analytic recurrence",
      "problem": [
        {
          "kind": "prose",
          "text": "For \\(y''-2xy'-2y=0\\), \\(y(0)=1\\), \\(y'(0)=2\\), derive the coefficient recurrence and first four nonzero terms. Prove that the resulting series converges for every real \\(x\\), then give an exact integral formula for the same solution."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "After reindexing, the coefficient equation is \\((n+2)(n+1)a_{n+2}-2(n+1)a_n=0\\)."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "The recurrence keeps even and odd coefficients separate. For a fixed parity, the term ratio is \\(2x^2/(n+2)\\)."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "The equation is the derivative of \\(y'-2xy\\). The data make this expression equal to two. Solve that first-order equation with integrating factor \\(e^{-x^2}\\)."
          }
        ]
      ],
      "solution": [
        {
          "kind": "math",
          "latex": "a_0=1,\\quad a_1=2,\\quad a_{n+2}=\\frac{2a_n}{n+2};\\qquad y(x)=1+2x+x^2+\\frac43x^3+\\cdots."
        },
        {
          "kind": "prose",
          "text": "In each parity subsequence the absolute ratio of consecutive terms tends to zero for fixed \\(x\\). Therefore the two subseries, and their sum, converge absolutely for every real \\(x\\). The infinite-radius power-series theorem permits termwise differentiation; the recurrence makes the equation hold and supplies both initial values."
        },
        {
          "kind": "math",
          "latex": "y'-2xy=2,\\qquad y(x)=e^{x^2}\\left(1+2\\int_0^x e^{-t^2}\\,\\mathrm dt\\right)."
        },
        {
          "kind": "prose",
          "text": "The first identity follows by integrating the differential equation once and using the initial data. The integrating factor then gives the second formula. It directly verifies the same equation and data on the whole real line, so uniqueness identifies it with the series. This example also shows why solving a recurrence can coexist with a useful exact quadrature."
        }
      ],
      "verification": [
        "Author self-check: recurrence, four terms, parity ratio limits, first integral, integrating factor and data."
      ]
    }
  ],
  "alternatives": [
    {
      "kind": "prose",
      "text": "Look for a lower-order derivative before expanding: the ordinary transfer reduces to a first-order equation, and the first worked example becomes linear after setting \\(v=y'\\). Frobenius is useful when the normalized coefficients are singular but the weighted coefficients are analytic. Known-solution reduction can supply a missing logarithmic branch, but the recurrence must first reveal what actually fails."
    }
  ],
  "related": [
    "ode-reduction",
    "series-errors",
    "taylor-remainders"
  ],
  "next": [],
  "references": [
    {
      "sourceId": "dlmf",
      "url": "https://dlmf.nist.gov/2.7#i",
      "use": "reference-only"
    },
    {
      "sourceId": "diffyqs",
      "url": "https://www.jirka.org/diffyqs/html/seriessols_section.html",
      "use": "reference-only"
    },
    {
      "sourceId": "diffyqs",
      "url": "https://www.jirka.org/diffyqs/html/frobenius_section.html",
      "use": "reference-only"
    }
  ],
  "readiness": [
    {
      "lessonId": "ode-reduction",
      "exerciseId": "known-mode-zero",
      "prompt": "Can you separate a division-method obstruction from a singularity of the original equation?"
    },
    {
      "lessonId": "power-series",
      "exerciseId": "weighted-geometric-center",
      "prompt": "Can you justify convergence and termwise operations on the claimed domain?"
    }
  ],
  "review": {
    "status": "draft"
  },
  "exposureAudit": {
    "status": "pending"
  }
};
