export default {
  "id": "ode-laplace",
  "revision": 1,
  "title": "Laplace transforms, initial data and step forcing",
  "summary": "Convert a forward initial-value problem into algebra while keeping boundary terms, transform convergence and switching conditions visible.",
  "objectives": [
    "Derive the basic real Laplace transform and derivative formulas under sufficient hypotheses.",
    "Recover solutions using algebraic decompositions and direct verification.",
    "Distinguish delayed functions, bounded forcing switches and impulses."
  ],
  "prerequisites": [
    "second-order-ode",
    "improper",
    "parts",
    "rational-trig",
    "growth"
  ],
  "sections": [
    {
      "id": "transform-domain",
      "title": "An integral with a convergence half-line",
      "body": [
        {
          "kind": "prose",
          "text": "For real \\(s\\), define the forward Laplace transform of \\(f\\) by"
        },
        {
          "kind": "math",
          "latex": "F(s)=\\mathcal L\\{f\\}(s)=\\int_0^\\infty e^{-st}f(t)\\,\\mathrm dt."
        },
        {
          "kind": "prose",
          "text": "A useful sufficient condition is that \\(f\\) is piecewise continuous on every bounded interval of \\([0,\\infty)\\), with finitely many pieces and finite one-sided limits there, and is of exponential order: there exist constants \\(M>0,c,T\\) such that \\(|f(t)|\\le Me^{ct}\\) for \\(t\\ge T\\). For \\(s>c\\), absolute convergence of the tail follows from"
        },
        {
          "kind": "math",
          "latex": "\\int_T^\\infty e^{-st}|f(t)|\\,\\mathrm dt\\le\\frac{M e^{-(s-c)T}}{s-c}."
        },
        {
          "kind": "prose",
          "text": "The finite initial part exists by piecewise continuity. The sufficient bound need not be the sharp convergence range; check any claimed endpoint separately. Linearity follows from linearity of these convergent integrals. A rational expression in \\(s\\) should be accompanied by a region where it represents the integral."
        }
      ]
    },
    {
      "id": "basic-pairs",
      "title": "Build the small transform table you need",
      "body": [
        {
          "kind": "prose",
          "text": "For a real constant \\(a\\), integrating an exponential gives \\(\\mathcal L\\{e^{at}\\}=1/(s-a)\\) when \\(s>a\\). Repeated integration by parts gives the polynomial pairs below; the exponential kills the polynomial boundary term at infinity. Here \\(n\\) is a nonnegative integer and \\(0!=1\\)."
        },
        {
          "kind": "math",
          "latex": "\\mathcal L\\{t^n\\}(s)=\\frac{n!}{s^{n+1}}\\quad(s>0),\\qquad \\mathcal L\\{t^ne^{at}\\}(s)=\\frac{n!}{(s-a)^{n+1}}\\quad(s>a)."
        },
        {
          "kind": "prose",
          "text": "The second identity follows by replacing \\(s\\) by \\(s-a\\) in the defining integral. Integrating sine and cosine by parts gives two coupled equations for their transforms; solving them yields, for \\(\\omega>0\\),"
        },
        {
          "kind": "math",
          "latex": "\\mathcal L\\{\\cos(\\omega t)\\}(s)=\\frac{s}{s^2+\\omega^2},\\qquad \\mathcal L\\{\\sin(\\omega t)\\}(s)=\\frac{\\omega}{s^2+\\omega^2}\\quad(s>0)."
        },
        {
          "kind": "prose",
          "text": "For clarity, if these two transforms are \\(C,S\\), the integration-by-parts equations are \\(C=1/s-\\omega S/s\\) and \\(S=\\omega C/s\\). Recover a candidate function by linearity and partial fractions, then verify the original initial-value problem. This route does not require a general complex inversion formula."
        }
      ]
    },
    {
      "id": "initial-boundaries",
      "title": "The derivative formulas contain the initial values",
      "body": [
        {
          "kind": "prose",
          "text": "Assume \\(y\\) is continuous, piecewise continuously differentiable on finite intervals, and both \\(y,y'\\) satisfy exponential-order bounds. Integrate by parts on each smooth piece. Interior boundary terms cancel because \\(y\\) is continuous. For sufficiently large real \\(s\\),"
        },
        {
          "kind": "math",
          "latex": "\\mathcal L\\{y'\\}=sY-y(0),\\qquad Y=\\mathcal L\\{y\\}."
        },
        {
          "kind": "prose",
          "text": "If \\(y\\) is continuously differentiable and piecewise twice continuously differentiable, with \\(y,y',y''\\) of exponential order, repeat the calculation to obtain"
        },
        {
          "kind": "math",
          "latex": "\\mathcal L\\{y''\\}=s^2Y-sy(0)-y'(0)."
        },
        {
          "kind": "prose",
          "text": "The boundary terms at infinity vanish under these bounds. The conditions at the finite joins matter: a jump in \\(y'\\) produces extra terms when integrating the classical second derivative piecewise. The displayed second-derivative formula cannot simply be used while ignoring such jumps. In the examples below, explicit candidates satisfy the required growth and matching conditions; substitution and uniqueness on each coefficient interval finish the argument."
        }
      ]
    },
    {
      "id": "delayed-switch",
      "title": "Delay the whole expression",
      "body": [
        {
          "kind": "prose",
          "text": "Let \\(H(t-a)\\) be zero for \\(t<a\\) and one for \\(t>a\\), with \\(a\\ge0\\); its value at the single switch point is irrelevant to the integral. For a transformable function \\(g\\), substituting \\(u=t-a\\) gives"
        },
        {
          "kind": "math",
          "latex": "\\mathcal L\\{H(t-a)g(t-a)\\}(s)=e^{-as}G(s),\\qquad G=\\mathcal L\\{g\\}."
        },
        {
          "kind": "prose",
          "text": "If the input is \\(H(t-a)g(t)\\), first rewrite \\(g(t)\\) as a function of \\(t-a\\). The two inputs are generally different. For a bounded piecewise continuous forcing in a second-order equation, the solution class here is \\(C^1\\), with the equation holding classically between switches. Integrating the acceleration across a shrinking switch interval gives no velocity jump; position also remains continuous. The acceleration may jump. A Dirac impulse, which is not an ordinary bounded forcing function, requires distributional or measure-based treatment outside this lesson."
        }
      ]
    }
  ],
  "worked": [
    {
      "id": "polynomial-input-data",
      "revision": 1,
      "title": "Initial data survive the algebra",
      "problem": [
        {
          "kind": "prose",
          "text": "Use Laplace transforms to solve \\(y'+2y=t^2\\), \\(y(0)=3\\), for \\(t\\ge0\\)."
        }
      ],
      "solution": [
        {
          "kind": "math",
          "latex": "(s+2)Y-3=\\frac{2}{s^3},\\qquad Y=\\frac{3}{s+2}+\\frac{2}{s^3(s+2)}."
        },
        {
          "kind": "prose",
          "text": "Partial fractions give the decomposition below for \\(s>0\\). Each term is one of the basic transform pairs."
        },
        {
          "kind": "math",
          "latex": "Y=\\frac{1}{s^3}-\\frac{1}{2s^2}+\\frac{1}{4s}+\\frac{11}{4(s+2)},\\qquad y(t)=\\frac{t^2}{2}-\\frac t2+\\frac14+\\frac{11}{4}e^{-2t}."
        },
        {
          "kind": "prose",
          "text": "Direct differentiation gives \\(y'+2y=t^2\\), and \\(y(0)=3\\). The candidate and derivative have polynomial growth plus a decaying exponential, so their transforms converge for \\(s>0\\). The first-order linear uniqueness theorem makes this the forward solution."
        }
      ],
      "verification": [
        "Author self-check: exact partial fractions, transform relation, residual/data and growth."
      ]
    },
    {
      "id": "finite-pulse",
      "revision": 1,
      "title": "Turn a bounded force on and off",
      "problem": [
        {
          "kind": "prose",
          "text": "Solve \\(y''+4y=3[H(t-1)-H(t-3)]\\), \\(y(0)=y'(0)=0\\), for \\(t\\ge0\\), in the \\(C^1\\), piecewise classical sense. State what happens to position, velocity and acceleration at each switch."
        }
      ],
      "solution": [
        {
          "kind": "math",
          "latex": "Y(s)=\\frac{3(e^{-s}-e^{-3s})}{s(s^2+4)},\\qquad \\frac{3}{s(s^2+4)}=\\frac34\\left(\\frac1s-\\frac{s}{s^2+4}\\right)\\quad(s>0)."
        },
        {
          "kind": "prose",
          "text": "The zero-data response to a constant force beginning at zero is \\(g(u)=3(1-\\cos(2u))/4\\). Delay it once to add the force, and once to remove it:"
        },
        {
          "kind": "math",
          "latex": "y(t)=\\frac34H(t-1)\\bigl(1-\\cos(2(t-1))\\bigr)-\\frac34H(t-3)\\bigl(1-\\cos(2(t-3))\\bigr)."
        },
        {
          "kind": "prose",
          "text": "Since \\(g(0)=g'(0)=0\\), both delayed terms join continuously with continuous first derivatives. On the three open intervals, substitution gives the appropriate forcing. The acceleration jumps by \\(+3\\) at one and \\(-3\\) at three, while position and velocity do not jump. The formulas are bounded, so the transforms used above exist for \\(s>0\\). The equation need not have a classical second derivative at a switch point."
        }
      ],
      "verification": [
        "Author self-check: transform decomposition, three piece residuals, both join values/velocities and acceleration jumps."
      ]
    }
  ],
  "contrast": [
    {
      "kind": "prose",
      "text": "Exponential order at infinity does not repair a nonintegrable origin: \\(f(t)=1/t\\) has no ordinary Laplace integral. Also, \\(\\mathcal L\\{fg\\}\\) is generally not \\(\\mathcal L\\{f\\}\\mathcal L\\{g\\}\\): take \\(f=g=1\\), whose two sides are \\(1/s\\) and \\(1/s^2\\). Finally, a bounded force switch does not allow an arbitrary velocity jump; that would change the solution class and introduce an impulsive effect."
    }
  ],
  "mistakes": [
    "Omitting \\(-y(0)\\), \\(-sy(0)\\) or \\(-y'(0)\\) in a derivative transform.",
    "Applying a delayed transform to \\(H(t-a)g(t)\\) as though the function were \\(g(t-a)\\).",
    "Reading a pole-free rational expression at a value of \\(s\\) where the defining integral diverges.",
    "Treating a piecewise formula as verified without checking the joins."
  ],
  "exercises": [
    {
      "id": "repeated-transform-pole",
      "revision": 1,
      "title": "A repeated root and nonzero data",
      "problem": [
        {
          "kind": "prose",
          "text": "Solve \\(y''+2y'+y=e^{-t}\\), \\(y(0)=2\\), \\(y'(0)=-1\\), for \\(t\\ge0\\), by transforming. Explain the quadratic factor in the answer."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Keep all three initial-data contributions in the transformed equation before collecting \\(Y\\)."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "The equation becomes \\((s+1)^2Y=2s+3+1/(s+1)\\). Write \\(2s+3=2(s+1)+1\\)."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Use \\(\\mathcal L\\{t^ne^{-t}\\}=n!/(s+1)^{n+1}\\). In particular the inverse of \\(1/(s+1)^3\\) contains \\(1/2\\)."
          }
        ]
      ],
      "solution": [
        {
          "kind": "math",
          "latex": "Y=\\frac2{s+1}+\\frac1{(s+1)^2}+\\frac1{(s+1)^3},\\qquad y(t)=e^{-t}\\left(2+t+\\frac{t^2}{2}\\right)."
        },
        {
          "kind": "prose",
          "text": "The transforms converge for \\(s>-1\\). Writing \\(y=e^{-t}z\\) gives \\(y''+2y'+y=e^{-t}z''\\); thus \\(z''=1\\), explaining the quadratic factor. The displayed \\(z\\) has \\(z(0)=2\\) and \\(z'(0)=1\\), so \\(y'(0)=1-2=-1\\). This verifies the total solution and the repeated-root resonance."
        }
      ],
      "verification": [
        "Author self-check: transformed data, exact inversion pairs, residual/data and domain."
      ]
    },
    {
      "id": "unshifted-ramp-input",
      "revision": 1,
      "title": "Distinguish an activated ramp from a delayed ramp",
      "problem": [
        {
          "kind": "prose",
          "text": "Solve \\(y'+y=H(t-2)t\\), \\(y(0)=0\\), for \\(t\\ge0\\), taking \\(y\\) continuous and the equation classical between switches. Explain why replacing the input by \\(H(t-2)(t-2)\\) changes the answer."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "After setting \\(u=t-2\\), the active input is \\(u+2\\), not \\(u\\)."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Its transform is \\(e^{-2s}(1/s^2+2/s)\\). Divide by \\(s+1\\) to obtain \\(Y\\)."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Solve the zero-data delayed equation \\(z'+z=u+2\\), \\(z(0)=0\\), and set \\(y(t)=H(t-2)z(t-2)\\)."
          }
        ]
      ],
      "solution": [
        {
          "kind": "math",
          "latex": "Y=e^{-2s}\\frac{2s+1}{s^2(s+1)},\\qquad \\frac{2s+1}{s^2(s+1)}=\\frac1{s^2}+\\frac1s-\\frac1{s+1}."
        },
        {
          "kind": "math",
          "latex": "y(t)=H(t-2)\\left(t-1-e^{-(t-2)}\\right)."
        },
        {
          "kind": "prose",
          "text": "The bracket is zero at two, so \\(y\\) is continuous. For \\(t>2\\), its derivative plus itself is \\(t\\); before two it is zero. The derivative jumps from zero to two at activation, as allowed for this first-order equation with discontinuous forcing. The genuinely delayed ramp would instead give \\(H(t-2)(t-3+e^{-(t-2)})\\), since its active equation is \\(z'+z=u\\). Their difference is \\(2H(t-2)(1-e^{-(t-2)})\\). Both transforms converge for \\(s>0\\)."
        }
      ],
      "verification": [
        "Author self-check: two distinct shifted inputs, partial fractions, first-order residual and continuous join."
      ]
    }
  ],
  "alternatives": [
    {
      "kind": "prose",
      "text": "An integrating factor solves the first-order examples without transforms. Solving separately on each forcing interval and carrying the endpoint state also handles the pulse. Laplace notation makes multiple delays compact; explicit interval verification still checks whether the compact formula describes the intended solution."
    }
  ],
  "related": [
    "ode-variation",
    "linear-ode",
    "parameter-integrals"
  ],
  "next": [],
  "references": [
    {
      "sourceId": "diffyqs",
      "url": "https://www.jirka.org/diffyqs/html/laplace_section.html",
      "use": "reference-only"
    },
    {
      "sourceId": "diffyqs",
      "url": "https://www.jirka.org/diffyqs/html/transformsofders_section.html",
      "use": "reference-only"
    }
  ],
  "readiness": [
    {
      "lessonId": "rational-trig",
      "exerciseId": "divide-before-decomposing",
      "prompt": "Can you obtain and verify a complete rational decomposition?"
    },
    {
      "lessonId": "second-order-ode",
      "exerciseId": "repeated-homogeneous-mode",
      "prompt": "Can you fit two data values in a repeated-root family?"
    }
  ],
  "review": {
    "status": "draft"
  },
  "exposureAudit": {
    "status": "pending"
  }
};
