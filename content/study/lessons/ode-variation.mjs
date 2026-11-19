export default {
  "id": "ode-variation",
  "revision": 1,
  "title": "Variation of parameters and forced-response kernels",
  "summary": "Derive a particular solution from two homogeneous modes, preserve initial data, and recognize when an exact integral is the useful answer.",
  "objectives": [
    "Derive the two coefficient equations and identify the nonzero Wronskian condition.",
    "Use a fixed integration base to separate zero-data forcing from the initial state.",
    "Verify variable-coefficient and constant-coefficient responses on their actual domains."
  ],
  "prerequisites": [
    "second-order-ode",
    "ftc",
    "parts"
  ],
  "sections": [
    {
      "id": "fundamental-pair",
      "title": "Two independent state vectors",
      "body": [
        {
          "kind": "prose",
          "text": "Work on an open interval \\(I\\) where \\(p,q,r\\) are continuous in the normalized equation \\(y''+p(x)y'+q(x)y=r(x)\\). If the original equation has a leading coefficient, divide only on an interval where it never vanishes. Suppose \\(y_1,y_2\\) are twice continuously differentiable homogeneous solutions. Their value-and-derivative data form two columns; the determinant below is called their Wronskian."
        },
        {
          "kind": "math",
          "latex": "W(x)=y_1(x)y_2'(x)-y_1'(x)y_2(x)."
        },
        {
          "kind": "prose",
          "text": "A two-by-two system with columns \\((y_1,y_1')\\) and \\((y_2,y_2')\\) has a unique solution precisely when \\(W\\ne0\\): eliminate one unknown by multiplying the equations and subtracting. Here this condition at a single point ensures it throughout \\(I\\). Differentiating the determinant, then substituting the homogeneous equation, gives"
        },
        {
          "kind": "math",
          "latex": "W'=-pW,\\qquad W(x)=W(a)\\exp\\!\\left(-\\int_a^x p(t)\\,\\mathrm dt\\right)\\quad(a\\in I)."
        },
        {
          "kind": "prose",
          "text": "The linear initial-value theorem gives a unique solution throughout \\(I\\) for every pair \\(y(a),y'(a)\\) when the normalized coefficients and forcing are continuous there. Thus a pair with \\(W(a)\\ne0\\) fits arbitrary two initial values. The linear uniqueness theorem makes its span the complete homogeneous solution family. This argument concerns two solutions of this equation; it is not a criterion for arbitrary unrelated functions."
        }
      ]
    },
    {
      "id": "coefficient-equations",
      "title": "Let the coefficients vary",
      "body": [
        {
          "kind": "prose",
          "text": "Seek \\(y_p=u_1y_1+u_2y_2\\). Impose \\(u_1'y_1+u_2'y_2=0\\), which cancels extra terms in the first derivative. Substitution into the ODE leaves the second equation below. Elimination gives the derivatives of the two unknown coefficients."
        },
        {
          "kind": "math",
          "latex": "\\begin{aligned}y_1u_1'+y_2u_2'&=0,\\\\y_1'u_1'+y_2'u_2'&=r,\\\\u_1'&=-\\frac{y_2r}{W},\\qquad u_2'=\\frac{y_1r}{W}.\\end{aligned}"
        },
        {
          "kind": "prose",
          "text": "The forcing here is the normalized \\(r\\). Choose the same base \\(a\\) in both integrals:"
        },
        {
          "kind": "math",
          "latex": "y_p(x)=-y_1(x)\\int_a^x\\frac{y_2(t)r(t)}{W(t)}\\,\\mathrm dt+y_2(x)\\int_a^x\\frac{y_1(t)r(t)}{W(t)}\\,\\mathrm dt."
        },
        {
          "kind": "prose",
          "text": "Both coefficients vanish at \\(a\\), and the auxiliary cancellation makes \\(y_p'(a)=0\\) as well. Add the homogeneous solution that fits the desired initial values. This constructs a solution for every continuous forcing on \\(I\\); elementary primitives are not required. Backward-oriented integrals also work for \\(x<a\\)."
        }
      ]
    },
    {
      "id": "response-kernel",
      "title": "Collect the forcing into one integral",
      "body": [
        {
          "kind": "prose",
          "text": "For \\(y''+\\omega^2y=r(x)\\), with \\(\\omega>0\\), use \\(\\cos(\\omega x)\\) and \\(\\sin(\\omega x)\\), whose Wronskian is \\(\\omega\\). The sine subtraction identity combines the two integrals into"
        },
        {
          "kind": "math",
          "latex": "y_p(x)=\\int_a^x K(x,t)r(t)\\,\\mathrm dt,\\qquad K(x,t)=\\frac{\\sin(\\omega(x-t))}{\\omega}."
        },
        {
          "kind": "prose",
          "text": "This is a forced-response kernel: a function of the observation point and source point. It is often called Duhamel's formula. At \\(x=t\\), \\(K=0\\) and \\(\\partial K/\\partial x=1\\). Differentiating the integral twice therefore supplies the forcing as its boundary term. Each differentiation is justified on finite compact subintervals by continuous integrands and continuous partial derivatives. A kernel formula is a starting point for endpoint constraints; it does not by itself solve an optimization over all possible forcings."
        }
      ]
    }
  ],
  "worked": [
    {
      "id": "secant-forcing",
      "revision": 1,
      "title": "A forcing with a restricted domain",
      "problem": [
        {
          "kind": "prose",
          "text": "Solve \\(y''+y=\\sec x\\), \\(y(0)=2\\), \\(y'(0)=-1\\), on \\((-\\pi/2,\\pi/2)\\)."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Take \\(y_1=\\cos x\\), \\(y_2=\\sin x\\), \\(W=1\\), and base zero. Then \\(u_1'=-\\tan x\\), \\(u_2'=1\\), so \\(u_1=\\ln(\\cos x)\\), \\(u_2=x\\). The logarithm is real on the stated interval because \\(\\cos x>0\\)."
        },
        {
          "kind": "math",
          "latex": "y(x)=2\\cos x-\\sin x+\\cos x\\ln(\\cos x)+x\\sin x."
        },
        {
          "kind": "prose",
          "text": "For the particular part, its first derivative is \\(-\\sin x\\ln(\\cos x)+x\\cos x\\). A second derivative gives \\(y_p''+y_p=\\sin x\\tan x+\\cos x=\\sec x\\). Its value and derivative vanish at zero. The equation's forcing has poles at the two endpoints; this solution is not extended through those points as a classical solution of the same equation."
        }
      ],
      "verification": [
        "Author self-check: residual and both initial conditions; forcing and logarithm domain."
      ]
    },
    {
      "id": "variable-coefficient-log",
      "revision": 1,
      "title": "A variable-coefficient pair",
      "problem": [
        {
          "kind": "prose",
          "text": "On \\(x>0\\), solve \\(y''-2y'/x+2y/x^2=\\ln x\\), with \\(y(1)=y'(1)=0\\). Use the homogeneous solutions \\(x,x^2\\)."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Direct substitution verifies both modes; their Wronskian is \\(x^2\\), nonzero on this interval. With base one,"
        },
        {
          "kind": "math",
          "latex": "u_1=-\\int_1^x\\ln t\\,\\mathrm dt=-x\\ln x+x-1,\\qquad u_2=\\int_1^x\\frac{\\ln t}{t}\\,\\mathrm dt=\\frac{(\\ln x)^2}{2}."
        },
        {
          "kind": "math",
          "latex": "y(x)=-x^2\\ln x+x^2-x+\\frac{x^2(\\ln x)^2}{2}."
        },
        {
          "kind": "prose",
          "text": "The lower limits guarantee both zero data. Differentiation and substitution give \\(\\ln x\\). The coefficient singularity at zero means the claimed solution interval remains \\((0,\\infty)\\)."
        }
      ],
      "verification": [
        "Author self-check: modes, Wronskian, residual, base data and positive domain."
      ]
    }
  ],
  "contrast": [
    {
      "kind": "prose",
      "text": "Choosing \\(y_1=e^x\\), \\(y_2=2e^x\\) for \\(y''-y=0\\) gives \\(W=0\\). These are two names for the same mode, so dividing by their Wronskian cannot find the missing mode. Use \\(e^{-x}\\) as the second solution. Also, an arbitrary primitive in one coefficient may insert a homogeneous term; that is harmless only if the final initial conditions are fitted again."
    }
  ],
  "mistakes": [
    "Using the unnormalized right side after dividing the equation by its leading coefficient.",
    "Changing the order in \\(W=y_1y_2'-y_1'y_2\\) without changing the signs in the formulas.",
    "Fitting initial data to a homogeneous term when the chosen particular solution has nonzero initial data.",
    "Assuming an unevaluated definite integral is an incomplete solution."
  ],
  "exercises": [
    {
      "id": "hyperbolic-response",
      "revision": 1,
      "title": "Compare a kernel and a trial solution",
      "problem": [
        {
          "kind": "prose",
          "text": "Solve \\(y''-y=e^{2x}\\), \\(y(0)=y'(0)=0\\), for real \\(x\\). Derive a zero-data integral and reduce it to exponentials."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Use \\(e^x,e^{-x}\\); their Wronskian is \\(-2\\)."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Their combined kernel is \\((e^{x-t}-e^{-(x-t)})/2\\). Integrate its product with \\(e^{2t}\\) from zero to \\(x\\)."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "The two integrals involve \\(e^t\\) and \\(e^{3t}\\). Keep the lower-endpoint terms before combining."
          }
        ]
      ],
      "solution": [
        {
          "kind": "math",
          "latex": "y(x)=\\frac12\\int_0^x\\bigl(e^{x-t}-e^{-(x-t)}\\bigr)e^{2t}\\,\\mathrm dt=\\frac{e^{2x}}3-\\frac{e^x}2+\\frac{e^{-x}}6."
        },
        {
          "kind": "prose",
          "text": "The last two terms cancel the value and derivative of the trial particular solution \\(e^{2x}/3\\) at zero. Applying \\(\\mathrm d^2/\\mathrm dx^2-1\\) leaves \\(e^{2x}\\); the coefficients sum to zero and their derivative-weighted sum is zero. All functions and coefficients are defined on the whole real line."
        }
      ],
      "verification": [
        "Author self-check: exact kernel integral, residual and both initial data."
      ]
    },
    {
      "id": "quadrature-response",
      "revision": 1,
      "title": "An exact answer without an elementary primitive",
      "problem": [
        {
          "kind": "prose",
          "text": "Solve \\(y''+3y'=1/(1+x^2)\\), \\(y(0)=2\\), \\(y'(0)=-1\\), for real \\(x\\). A definite integral is an acceptable final answer; justify the data and equation."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "The homogeneous modes are \\(1\\) and \\(e^{-3x}\\)."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "A zero-data kernel is \\(K(x,t)=(1-e^{-3(x-t)})/3\\); its value at \\(x=t\\) is zero and its first \\(x\\)-derivative there is one."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Add the homogeneous function with value two and derivative minus one at zero, then use the kernel against \\(1/(1+t^2)\\)."
          }
        ]
      ],
      "solution": [
        {
          "kind": "math",
          "latex": "y(x)=2-\\frac{1-e^{-3x}}3+\\frac13\\int_0^x\\frac{1-e^{-3(x-t)}}{1+t^2}\\,\\mathrm dt."
        },
        {
          "kind": "prose",
          "text": "Write the integral term as \\(z\\). Its derivative is \\(z'(x)=\\int_0^x e^{-3(x-t)}/(1+t^2)\\,\\mathrm dt\\), so \\(z''=1/(1+x^2)-3z'\\). Both \\(z(0)\\) and \\(z'(0)\\) vanish. The nonintegral part has the required data and solves the homogeneous equation. Continuous coefficients and finite integrals establish this formula for every real \\(x\\), including negative \\(x\\) with oriented limits."
        }
      ],
      "verification": [
        "Author self-check: kernel identities, initial data, derivative boundary term and domain."
      ]
    }
  ],
  "alternatives": [
    {
      "kind": "prose",
      "text": "Use a short trial particular solution when the forcing lies in a small derivative family, as in the exponential transfer. Use an integrating factor after setting \\(v=y'\\) when the equation contains no \\(y\\) term. Variation of parameters remains useful when neither shortcut gives an elementary expression."
    }
  ],
  "related": [
    "ode-reduction",
    "parameter-integrals",
    "linear-ode"
  ],
  "next": [
    "ode-laplace"
  ],
  "references": [
    {
      "sourceId": "diffyqs",
      "url": "https://www.jirka.org/diffyqs/html/solinear_section.html",
      "use": "reference-only"
    },
    {
      "sourceId": "diffyqs",
      "url": "https://www.jirka.org/diffyqs/html/sec_nonhom.html",
      "use": "reference-only"
    }
  ],
  "readiness": [
    {
      "lessonId": "second-order-ode",
      "exerciseId": "off-frequency-response",
      "prompt": "Can you fit both initial values after adding a particular response?"
    }
  ],
  "review": {
    "status": "draft"
  },
  "exposureAudit": {
    "status": "pending"
  }
};
