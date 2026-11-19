export default {
  "id": "fourier-orthogonality",
  "revision": 1,
  "title": "Fourier coefficients, orthogonality and convergence",
  "summary": "Derive trigonometric coefficients from orthogonality, solve finite least-squares problems, and prove the pointwise convergence rule for a precisely defined piecewise smooth periodic function.",
  "objectives": [
    "Derive sine and cosine orthogonality and the constant-term normalization.",
    "Prove the finite least-squares projection identity without assuming an infinite expansion.",
    "Use a Dirichlet-kernel argument to justify convergence at continuity points and jumps.",
    "Distinguish pointwise convergence, uniform convergence and finite approximation under a constraint."
  ],
  "prerequisites": [
    "trig",
    "parts",
    "analysis",
    "linear-algebra",
    "derivative-shape"
  ],
  "readiness": [
    {
      "lessonId": "trig",
      "exerciseId": "trig-sign-interval",
      "prompt": "Use the stated quadrant and principal square root to determine exact trigonometric values and their signs."
    },
    {
      "lessonId": "parts",
      "exerciseId": "twice-trigonometric",
      "prompt": "Integrate a polynomial times a sine or cosine while retaining both endpoint terms."
    },
    {
      "lessonId": "derivative-shape",
      "exerciseId": "unique-root-residual",
      "prompt": "Use the mean-value theorem and a lower derivative bound to convert a residual into a bound on the root’s distance."
    },
    {
      "lessonId": "analysis",
      "exerciseId": "unbounded-domain",
      "prompt": "Explain the difference between a bound for each fixed point and one bound valid on the entire domain."
    },
    {
      "lessonId": "linear-algebra",
      "exerciseId": "quadratic-unit-circle",
      "prompt": "Use the quadratic form and its constraint to find the extreme values and every equality point."
    }
  ],
  "sections": [
    {
      "id": "period-and-scope",
      "title": "Fix the period and the regularity",
      "body": [
        {
          "kind": "prose",
          "text": "Unless stated otherwise, \\(f\\) is real-valued and \\(2\\pi\\)-periodic: \\(f(x+2\\pi)=f(x)\\). All trigonometric arguments are in radians. Coefficient integrals and finite approximation first require only a bounded, piecewise continuous function on one period. Here piecewise continuous means that a finite partition divides the period into continuous pieces with finite one-sided limits; values assigned at the partition points may differ from those limits."
        },
        {
          "kind": "prose",
          "text": "For the convergence proof below, impose the stronger piecewise \\(C^1\\) condition: on each open piece, \\(f\\) agrees with a function having a continuous derivative on that piece’s closed interval. Neighboring extensions may have different endpoint values. There are finitely many pieces. This gives bounded one-sided derivatives, including at the periodic seam. Isolated assigned point values may still be arbitrary finite numbers."
        },
        {
          "kind": "prose",
          "text": "For such a function, \\(f(x+)\\) and \\(f(x-)\\) denote its right and left limits, using the periodic continuation at a period boundary. Integrals do not depend on the values at finitely many individual points."
        }
      ]
    },
    {
      "id": "orthogonality",
      "title": "Compute the inner products",
      "body": [
        {
          "kind": "prose",
          "text": "For bounded piecewise continuous real functions, define the integral pairing \\(\\langle u,v\\rangle=\\int_{-\\pi}^{\\pi}u(x)v(x)\\,\\mathrm dx\\) and squared size \\(\\|u\\|^2=\\langle u,u\\rangle\\). This extends the dot-product idea from vectors to an integral. On continuous functions it is an inner product: in particular, a nonzero continuous function has a nonzero value on an interval, so its squared integral is positive. For piecewise continuous functions, the pairing ignores isolated assigned values. We use positive definiteness only on the continuous trigonometric polynomials."
        },
        {
          "kind": "prose",
          "text": "Two functions are orthogonal when their pairing is zero. For positive integers \\(m,n\\), the product-to-sum identities are"
        },
        {
          "kind": "math",
          "latex": "2\\cos(mx)\\cos(nx)=\\cos((m-n)x)+\\cos((m+n)x),"
        },
        {
          "kind": "math",
          "latex": "2\\sin(mx)\\sin(nx)=\\cos((m-n)x)-\\cos((m+n)x)."
        },
        {
          "kind": "prose",
          "text": "The integral of \\(\\cos(kx)\\) or \\(\\sin(kx)\\) over this period is zero for any nonzero integer \\(k\\). A sine times a cosine is odd. Therefore"
        },
        {
          "kind": "math",
          "latex": "\\langle1,1\\rangle=2\\pi,\\qquad\\langle1,\\cos(nx)\\rangle=\\langle1,\\sin(nx)\\rangle=0,"
        },
        {
          "kind": "math",
          "latex": "\\langle\\cos(mx),\\cos(nx)\\rangle=\\langle\\sin(mx),\\sin(nx)\\rangle=\\begin{cases}\\pi,&m=n,\\\\0,&m\\ne n,\\end{cases}"
        },
        {
          "kind": "math",
          "latex": "\\langle\\sin(mx),\\cos(nx)\\rangle=0."
        },
        {
          "kind": "prose",
          "text": "The constant has twice the squared size of each positive-frequency sine or cosine. Forgetting that distinction causes the familiar factor-of-two error in the constant coefficient."
        }
      ]
    },
    {
      "id": "coefficients",
      "title": "Derive the coefficients before asserting equality",
      "body": [
        {
          "kind": "prose",
          "text": "For a nonnegative integer \\(N\\), define the Fourier partial sum by"
        },
        {
          "kind": "math",
          "latex": "S_Nf(x)=\\frac{a_0}{2}+\\sum_{n=1}^N\\bigl(a_n\\cos(nx)+b_n\\sin(nx)\\bigr),"
        },
        {
          "kind": "math",
          "latex": "a_0=\\frac1\\pi\\int_{-\\pi}^{\\pi}f(x)\\,\\mathrm dx,"
        },
        {
          "kind": "math",
          "latex": "a_n=\\frac1\\pi\\int_{-\\pi}^{\\pi}f(x)\\cos(nx)\\,\\mathrm dx\\quad(n\\ge1),"
        },
        {
          "kind": "math",
          "latex": "b_n=\\frac1\\pi\\int_{-\\pi}^{\\pi}f(x)\\sin(nx)\\,\\mathrm dx\\quad(n\\ge1)."
        },
        {
          "kind": "prose",
          "text": "Orthogonality makes \\(f-S_Nf\\) orthogonal to \\(1,\\cos x,\\sin x,\\ldots,\\cos(Nx),\\sin(Nx)\\). These equations determine the coefficients uniquely. They are statements about finite sums and integrals; they do not yet assert that an infinite series equals \\(f\\). If \\(f\\) is even, every \\(b_n\\) is zero. If it is odd, \\(a_0\\) and every \\(a_n\\) are zero."
        },
        {
          "kind": "prose",
          "text": "For period \\(2L\\) with \\(L>0\\), changing variables \\(x=Lt/\\pi\\) gives the same convention with \\(\\cos(n\\pi x/L)\\), \\(\\sin(n\\pi x/L)\\), and a factor \\(1/L\\) in each coefficient integral over \\([-L,L]\\). The constant term remains \\(a_0/2\\)."
        }
      ]
    },
    {
      "id": "finite-projection",
      "title": "Why the partial sum is the best finite approximation",
      "body": [
        {
          "kind": "prose",
          "text": "Let \\(T\\) be any real trigonometric polynomial using the frequencies from 0 through \\(N\\). The difference \\(S_Nf-T\\) lies in the same finite span. Its pairing with \\(f-S_Nf\\) is zero, so expansion of a square gives"
        },
        {
          "kind": "math",
          "latex": "\\|f-T\\|^2=\\|f-S_Nf\\|^2+\\|S_Nf-T\\|^2."
        },
        {
          "kind": "prose",
          "text": "The last term is nonnegative, and it is zero only when the trigonometric polynomials \\(T\\) and \\(S_Nf\\) are identical. Thus \\(S_Nf\\) is the unique least-squares approximation in this finite span. Another finite identity is"
        },
        {
          "kind": "math",
          "latex": "\\|f-S_Nf\\|^2=\\|f\\|^2-\\frac{\\pi a_0^2}{2}-\\pi\\sum_{n=1}^N(a_n^2+b_n^2)."
        },
        {
          "kind": "prose",
          "text": "This follows by subtracting the squared size of the orthogonal finite projection. Sending \\(N\\) to infinity would require additional convergence reasoning; no infinite Parseval identity is being assumed. If an extra constraint is imposed on \\(T\\), first express the coefficient constraint, then minimize the remaining quadratic expression. The unconstrained projection may not satisfy the constraint."
        }
      ]
    },
    {
      "id": "oscillatory-lemma",
      "title": "An oscillatory integral tends to zero",
      "body": [
        {
          "kind": "prose",
          "text": "We need a bounded version of oscillatory cancellation. Suppose \\(g\\) is bounded and piecewise continuous on \\([0,\\pi]\\), and for every fixed \\(\\delta>0\\) it is piecewise \\(C^1\\) on \\([\\delta,\\pi]\\) in the closed-piece sense defined above. Then \\(\\int_0^\\pi g(u)\\sin(\\lambda u)\\,\\mathrm du\\to0\\) as real \\(\\lambda\\to+\\infty\\). Choose a finite bound \\(M\\ge|g(u)|\\). The integral over \\([0,\\delta]\\) has magnitude at most \\(M\\delta\\)."
        },
        {
          "kind": "prose",
          "text": "On each of the finitely many smooth pieces \\([a,b]\\) outside that short interval, integrate by parts using the one-sided endpoint values:"
        },
        {
          "kind": "math",
          "latex": "\\int_a^b g(u)\\sin(\\lambda u)\\,\\mathrm du=\\left[-\\frac{g(u)\\cos(\\lambda u)}\\lambda\\right]_a^b+\\frac1\\lambda\\int_a^b g^{\\prime}(u)\\cos(\\lambda u)\\,\\mathrm du."
        },
        {
          "kind": "prose",
          "text": "The absolute value is at most \\((|g(a+)|+|g(b-)|+\\int_a^b|g^{\\prime}(u)|\\,\\mathrm du)/\\lambda\\). Sum these finite bounds to obtain a constant \\(C_\\delta\\), which may depend on \\(\\delta\\) but not on \\(\\lambda\\). Thus"
        },
        {
          "kind": "math",
          "latex": "\\left|\\int_0^\\pi g(u)\\sin(\\lambda u)\\,\\mathrm du\\right|\\le M\\delta+\\frac{C_\\delta}{\\lambda}."
        },
        {
          "kind": "prose",
          "text": "Given \\(\\varepsilon>0\\), first choose a positive \\(\\delta<\\pi\\) with \\(M\\delta<\\varepsilon/2\\), then choose \\(\\lambda\\) so large that \\(C_\\delta/\\lambda<\\varepsilon/2\\). If \\(M=0\\), the result is immediate. The order matters: the derivative bound may deteriorate as \\(\\delta\\) shrinks. This proves the cancellation needed below without assuming a uniform rate near a possible corner."
        }
      ]
    },
    {
      "id": "pointwise-convergence",
      "title": "Prove the value at a continuity point or a jump",
      "body": [
        {
          "kind": "prose",
          "text": "Assume the piecewise \\(C^1\\) condition from the first section. The finite Dirichlet kernel is"
        },
        {
          "kind": "math",
          "latex": "D_N(u)=1+2\\sum_{n=1}^N\\cos(nu)=\\frac{\\sin((N+\\tfrac12)u)}{\\sin(u/2)}\\quad(0<u\\le\\pi),\\qquad\\int_0^\\pi D_N(u)\\,\\mathrm du=\\pi."
        },
        {
          "kind": "prose",
          "text": "The closed form follows by multiplying the finite sum by \\(\\sin(u/2)\\) and using \\(2\\sin(u/2)\\cos(nu)=\\sin((n+1/2)u)-\\sin((n-1/2)u)\\), which telescopes. At \\(u=0\\), the finite sum gives \\(D_N(0)=2N+1\\). Substituting the coefficient integrals into the finite partial sum, using the cosine difference identity, and shifting a periodic integral gives"
        },
        {
          "kind": "math",
          "latex": "S_Nf(x)=\\frac1{2\\pi}\\int_0^\\pi\\bigl(f(x+u)+f(x-u)\\bigr)D_N(u)\\,\\mathrm du."
        },
        {
          "kind": "prose",
          "text": "Fix \\(x\\) and set \\(c=f(x+)+f(x-)\\). For \\(0<u\\le\\pi\\), define"
        },
        {
          "kind": "math",
          "latex": "G_x(u)=\\frac{f(x+u)+f(x-u)-c}{\\sin(u/2)}."
        },
        {
          "kind": "prose",
          "text": "Near zero, the two one-sided \\(C^1\\) extensions make the numerator \\(O(u)\\): each difference from its one-sided endpoint value is bounded by a fixed derivative bound times \\(u\\). Here \\(O(u)\\) means bounded in magnitude by a constant times \\(u\\) for sufficiently small positive \\(u\\). Since the derivative of sine at zero gives \\(\\sin(u/2)/u\\to1/2\\), \\(G_x\\) is bounded near zero. The one-sided derivative limits give the more precise statement \\(G_x(0+)=2(f'(x+)-f'(x-))\\), so its right limit is finite. Away from zero it has only finitely many breaks, with finite one-sided limits. Assigning the limiting value at zero makes it bounded and piecewise continuous on the integration interval. For every fixed positive \\(\\delta\\), its pieces on \\([\\delta,\\pi]\\) have continuous derivatives up to their one-sided endpoints, because the denominator is separated from zero. These are exactly the hypotheses of the preceding oscillatory lemma."
        },
        {
          "kind": "math",
          "latex": "S_Nf(x)-\\frac c2=\\frac1{2\\pi}\\int_0^\\pi G_x(u)\\sin((N+\\tfrac12)u)\\,\\mathrm du\\longrightarrow0."
        },
        {
          "kind": "prose",
          "text": "The preceding lemma therefore proves that the Fourier series converges at each fixed \\(x\\) to \\((f(x+)+f(x-))/2\\). At continuity points this is \\(f(x)\\). At a jump, it is the midpoint of the two one-sided values, regardless of the value assigned at the point. At \\(\\pi\\) or \\(-\\pi\\), use the two sides of the periodic seam, not two values from the same side of the displayed interval."
        }
      ]
    },
    {
      "id": "limits-of-the-conclusion",
      "title": "Separate pointwise convergence from stronger claims",
      "body": [
        {
          "kind": "prose",
          "text": "The proof fixes \\(x\\); it does not provide one error estimate valid for every \\(x\\). If the pointwise limit has a jump, convergence of the continuous polynomials \\(S_Nf\\) cannot be uniform on the whole period. Indeed, a uniform limit \\(F\\) of continuous functions is continuous: choose one approximant with uniform error below \\(\\varepsilon/3\\), use its continuity near a fixed point, and bound the two remaining errors by \\(\\varepsilon/3\\) each."
        },
        {
          "kind": "prose",
          "text": "Coefficient calculation alone does not justify differentiating an infinite Fourier series, integrating a product of two infinite series, or applying a Fourier transform inversion formula. Each operation needs its own assumptions. The conclusions established here are finite projection and pointwise convergence under the stated piecewise \\(C^1\\) hypothesis."
        }
      ]
    }
  ],
  "worked": [
    {
      "id": "first-harmonic-approximation",
      "revision": 1,
      "title": "A best approximation with three coefficients",
      "problem": [
        {
          "kind": "prose",
          "text": "For \\(f(x)=x+\\cos(2x)\\) on \\([-\\pi,\\pi]\\), choose real \\(A,B,C\\) to minimize \\(\\int_{-\\pi}^{\\pi}(f(x)-A-B\\cos x-C\\sin x)^2\\,\\mathrm dx\\). Give the minimum as well as the coefficients."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "The constant and first cosine coefficients vanish by oddness of \\(x\\) and orthogonality of the second cosine. The first sine coefficient comes from the \\(x\\) term:"
        },
        {
          "kind": "math",
          "latex": "b_1=\\frac1\\pi\\int_{-\\pi}^{\\pi}x\\sin x\\,\\mathrm dx=\\frac1\\pi[-x\\cos x+\\sin x]_{-\\pi}^{\\pi}=2."
        },
        {
          "kind": "prose",
          "text": "The unique minimizer is \\(A=0,B=0,C=2\\), or \\(S_1f=2\\sin x\\). The squared size of \\(f\\) is \\(2\\pi^3/3+\\pi\\): the cross term is odd, and the squared cosine integrates to \\(\\pi\\). The finite error identity gives"
        },
        {
          "kind": "math",
          "latex": "\\min\\int_{-\\pi}^{\\pi}(f-T)^2\\,\\mathrm dx=\\frac{2\\pi^3}{3}+\\pi-4\\pi=\\frac{2\\pi^3}{3}-3\\pi."
        },
        {
          "kind": "prose",
          "text": "This minimum concerns a finite three-dimensional span. No infinite-series convergence or Parseval identity is needed."
        }
      ],
      "verification": [
        "Author self-checks only; independent mathematical review and teaching-exposure assessment remain pending."
      ]
    },
    {
      "id": "two-level-periodic-function",
      "revision": 1,
      "title": "A jump changes the represented value",
      "problem": [
        {
          "kind": "prose",
          "text": "Let \\(f\\) be \\(2\\pi\\)-periodic, with \\(f(x)=-2\\) for \\(-\\pi<x<0\\) and \\(f(x)=1\\) for \\(0<x<\\pi\\). Set \\(f(0)=5\\) and \\(f(\\pi)=f(-\\pi)=0\\). Compute its Fourier coefficients and the series limit at every point."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "The mean is \\(-1/2\\), so \\(a_0=-1\\). Every positive-frequency cosine coefficient is zero because the integral of a cosine on each half-period vanishes. Direct integration of the two sine pieces gives"
        },
        {
          "kind": "math",
          "latex": "b_n=\\frac{3(1-(-1)^n)}{\\pi n}=\\begin{cases}6/(\\pi n),&n\\text{ odd},\\\\0,&n\\text{ even}.\\end{cases}"
        },
        {
          "kind": "math",
          "latex": "S_Nf(x)=-\\frac12+\\frac6\\pi\\sum_{\\substack{1\\le n\\le N\\\\n\\ \\mathrm{odd}}}\\frac{\\sin(nx)}n."
        },
        {
          "kind": "prose",
          "text": "The function has a finite partition into constant \\(C^1\\) pieces. The series equals \\(-2\\) on the left open half-period and 1 on the right open half-period. At every integer multiple of \\(\\pi\\), the one-sided values are \\(-2\\) and 1 in one order or the other, so its limit is \\(-1/2\\). This also follows directly because every sine term vanishes there. The assigned values 5 and 0 do not change the coefficients or the limits. The limiting function has jumps, so the convergence is not uniform on a whole period."
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
      "text": "A constant illustrates the normalization: for \\(f(x)=3\\), the coefficient is \\(a_0=6\\), and the constant term \\(a_0/2\\) equals 3. Replacing that term by \\(a_0\\) would double the function."
    },
    {
      "kind": "prose",
      "text": "A coefficient formula may exist even when this convergence theorem is inapplicable. For example, periodically extend \\(f(x)=\\sqrt{|x|}\\) from \\([-\\pi,\\pi]\\). It is bounded and continuous, so the coefficients and finite projection exist. Its derivative is unbounded near zero, so it fails the closed-piece \\(C^1\\) hypothesis used here. This failure alone does not prove divergence of its Fourier series; a different convergence argument would be needed."
    },
    {
      "kind": "prose",
      "text": "Point values and function limits are different objects. The two-level example has \\(f(0)=5\\), but every partial sum at zero is \\(-1/2\\). A Fourier series does not recover an arbitrarily assigned isolated point value from an integral."
    }
  ],
  "mistakes": [
    "Using \\(a_0\\) as the constant term while keeping the \\(1/\\pi\\) coefficient convention.",
    "Applying \\(\\langle\\cos(mx),\\cos(nx)\\rangle=\\pi\\) when either index is zero or when the positive indices differ.",
    "Equating the series with the assigned value at a jump instead of averaging the periodic one-sided limits.",
    "Using finite orthogonality to justify an interchange of two infinite sums or an infinite product without convergence conditions.",
    "Calling pointwise convergence uniform, or calling a failed sufficient regularity condition a proof of divergence."
  ],
  "exercises": [
    {
      "id": "half-period-ramp",
      "revision": 1,
      "title": "A function supported on half a period",
      "problem": [
        {
          "kind": "prose",
          "text": "Extend \\(f(x)=x\\) for \\(-\\pi<x<0\\) and \\(f(x)=0\\) for \\(0\\le x<\\pi\\) periodically with period \\(2\\pi\\); set \\(f(\\pi)=f(-\\pi)=0\\). Find a trigonometric series representing \\(f\\) at its continuity points and determine its limit at the periodic seam. Can convergence be uniform on the whole period? What changes if only the values at integer multiples of \\(2\\pi\\) are reset to 7?"
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "All coefficient integrals reduce to \\([-\\pi,0]\\). Integration by parts gives"
        },
        {
          "kind": "math",
          "latex": "a_0=-\\frac\\pi2,\\qquad a_n=\\frac{1-(-1)^n}{\\pi n^2},\\qquad b_n=\\frac{(-1)^{n+1}}n\\quad(n\\ge1)."
        },
        {
          "kind": "math",
          "latex": "S_Nf(x)=-\\frac\\pi4+\\sum_{n=1}^N\\left(\\frac{1-(-1)^n}{\\pi n^2}\\cos(nx)+\\frac{(-1)^{n+1}}n\\sin(nx)\\right)."
        },
        {
          "kind": "prose",
          "text": "For verification, primitives for the nonconstant integrals are \\(x\\sin(nx)/n+\\cos(nx)/n^2\\) and \\(-x\\cos(nx)/n+\\sin(nx)/n^2\\). The function has two polynomial pieces with finite one-sided derivatives. Thus the pointwise limit is \\(x\\) for \\(-\\pi<x<0\\), zero for \\(0\\le x<\\pi\\), and \\(-\\pi/2\\) at the periodic seam, since the two seam limits are 0 and \\(-\\pi\\). These statements extend periodically."
        },
        {
          "kind": "prose",
          "text": "The seam jump rules out uniform convergence on a whole period. Resetting the values at \\(2\\pi\\mathbb Z\\) changes no integral and no series term; the limit at those points remains zero, now different from the newly assigned value 7. In particular, evaluating the original convergent series at zero also yields the derived identity \\(\\sum_{j=0}^{\\infty}(2j+1)^{-2}=\\pi^2/8\\). This follows from the proved pointwise limit, not from termwise differentiation."
        }
      ],
      "verification": [
        "Author self-checks only; independent mathematical review and teaching-exposure assessment remain pending."
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Compute the constant, cosine and sine integrals only on the half-period where the function is nonzero."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Keep both endpoints in the primitives for \\(x\\cos(nx)\\) and \\(x\\sin(nx)\\). Then inspect the two sides of the periodic seam separately from the interior point zero."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Apply the proved convergence theorem to the two polynomial pieces. A jump in the limiting function prevents uniform convergence of continuous partial sums; isolated reassigned values do not affect the coefficients."
          }
        ]
      ]
    },
    {
      "id": "constrained-approximation",
      "revision": 1,
      "title": "A three-coefficient approximation with a point constraint",
      "problem": [
        {
          "kind": "prose",
          "text": "Choose real \\(A,B,C\\) so that \\(T(x)=A+B\\cos x+C\\sin x\\) satisfies \\(T(0)=0\\) and minimizes \\(\\int_{-\\pi}^{\\pi}(x^2-T(x))^2\\,\\mathrm dx\\). Give the unique coefficients and the minimum error."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "The constraint is \\(B=-A\\). Since \\(x^2\\) and \\(1-\\cos x\\) are even whereas \\(\\sin x\\) is odd, all cross terms with \\(C\\) vanish. Also"
        },
        {
          "kind": "math",
          "latex": "\\int_{-\\pi}^{\\pi}x^4\\,\\mathrm dx=\\frac{2\\pi^5}{5},\\qquad\\int_{-\\pi}^{\\pi}x^2\\,\\mathrm dx=\\frac{2\\pi^3}{3},"
        },
        {
          "kind": "math",
          "latex": "\\int_{-\\pi}^{\\pi}x^2\\cos x\\,\\mathrm dx=-4\\pi,\\qquad\\int_{-\\pi}^{\\pi}(1-\\cos x)^2\\,\\mathrm dx=3\\pi."
        },
        {
          "kind": "prose",
          "text": "Expanding the finite square gives"
        },
        {
          "kind": "math",
          "latex": "J(A,C)=\\frac{2\\pi^5}{5}-2\\pi\\left(\\frac{2\\pi^2}{3}+4\\right)A+3\\pi A^2+\\pi C^2."
        },
        {
          "kind": "prose",
          "text": "Write \\(A_*=(2\\pi^2/3+4)/3\\) and complete the square:"
        },
        {
          "kind": "math",
          "latex": "J(A,C)=\\frac{2\\pi^5}{5}-\\frac\\pi3\\left(\\frac{2\\pi^2}{3}+4\\right)^2+3\\pi(A-A_*)^2+\\pi C^2."
        },
        {
          "kind": "prose",
          "text": "The two positive square coefficients give the unique minimizer"
        },
        {
          "kind": "math",
          "latex": "A=\\frac{2\\pi^2}{9}+\\frac43,\\qquad B=-\\frac{2\\pi^2}{9}-\\frac43,\\qquad C=0,\\qquad J_{\\min}=\\frac{2\\pi^5}{5}-\\frac\\pi3\\left(\\frac{2\\pi^2}{3}+4\\right)^2."
        },
        {
          "kind": "prose",
          "text": "The unconstrained first Fourier projection would instead have \\(A=\\pi^2/3\\), \\(B=-4\\), \\(C=0\\); it fails \\(A+B=0\\). A point constraint on a continuous approximating polynomial is real information even though changing a target function at a single point does not change its integral error."
        }
      ],
      "verification": [
        "Author self-checks only; independent mathematical review and teaching-exposure assessment remain pending."
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Translate the point constraint into an equation between coefficients before minimizing anything."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Substitute \\(B=-A\\). Separate even and odd terms in the square and compute the finite integrals."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "The error is a strictly positive quadratic expression in \\(A\\) and \\(C\\). Complete the square, keeping the constant term to recover the minimum value."
          }
        ]
      ]
    }
  ],
  "alternatives": [
    {
      "kind": "prose",
      "text": "For a finite approximation, differentiating the quadratic error with respect to its coefficients gives the same normal equations. Orthogonality makes their meaning and uniqueness especially transparent."
    },
    {
      "kind": "prose",
      "text": "Symmetry can eliminate coefficient integrals before integration by parts. For jump limits, the proved one-sided-limit theorem is usually shorter than summing a trigonometric series directly."
    },
    {
      "kind": "prose",
      "text": "Finite projections connect to vectors and quadratic minimization; infinite periodic expansions connect to series. Fourier transform inversion, contour integration and general spectral boundary problems require further theorems beyond this lesson."
    }
  ],
  "related": [
    "linear-algebra",
    "analysis",
    "summation-parts",
    "power-series"
  ],
  "next": [
    "strategy-choice"
  ],
  "references": [
    {
      "sourceId": "mathworld-fourier-series",
      "url": "https://mathworld.wolfram.com/FourierSeries.html",
      "use": "reference-only"
    },
    {
      "sourceId": "mathworld-dirichlet-kernel",
      "url": "https://mathworld.wolfram.com/DirichletKernel.html",
      "use": "reference-only"
    },
    {
      "sourceId": "mit-orthogonality-relations",
      "url": "https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/resources/mit18_03scf11_s21_7text/",
      "use": "reference-only"
    },
    {
      "sourceId": "ivrii-fourier-convergence",
      "url": "https://www.math.utoronto.ca/ivrii/PDE-textbook/Chapter4/S4.4.html",
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
