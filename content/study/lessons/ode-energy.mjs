export default {
  "id": "ode-energy",
  "revision": 1,
  "title": "Energy, turning points and travel times",
  "summary": "Use a conserved quantity to bound motion, then prove whether the bound is reached; contrast conservative motion with dissipation.",
  "objectives": [
    "Derive a first integral without dividing by a velocity that may vanish.",
    "Use the connected accessible energy region and a continuation theorem to justify global motion.",
    "Distinguish finite turning-point travel, asymptotic approach and a dissipative energy estimate."
  ],
  "prerequisites": [
    "second-order-ode",
    "separable-ode",
    "existence-uniqueness",
    "improper",
    "derivative-shape"
  ],
  "sections": [
    {
      "id": "conserved-energy",
      "title": "Differentiate the proposed invariant",
      "body": [
        {
          "kind": "prose",
          "text": "Consider \\(y''+V'(y)=0\\), with \\(V\\) twice continuously differentiable on an open position interval. Write velocity as \\(v=y'\\). A first integral is a function of the state that stays constant along each solution; here the energy is"
        },
        {
          "kind": "math",
          "latex": "E(t)=\\frac12v(t)^2+V(y(t)),\\qquad E'(t)=v(t)\\bigl(y''(t)+V'(y(t))\\bigr)=0."
        },
        {
          "kind": "prose",
          "text": "This calculation remains valid when \\(v=0\\). It does not divide by velocity. An additive constant in \\(V\\) changes the numerical energy but leaves \\(E-V(y)\\) and the motion unchanged. At fixed energy \\(E_0\\),"
        },
        {
          "kind": "math",
          "latex": "v^2=2(E_0-V(y)),\\qquad V(y)\\le E_0."
        },
        {
          "kind": "prose",
          "text": "The sign of \\(v\\) is additional information. The two signs describe different directions along an energy curve; the initial data and equation determine which direction occurs."
        }
      ]
    },
    {
      "id": "continuation",
      "title": "When an energy bound gives global existence",
      "body": [
        {
          "kind": "prose",
          "text": "The second-order equation is the two-dimensional system \\(y'=v\\), \\(v'=-V'(y)\\). The local uniqueness and compact-continuation theorem extends to finite-dimensional states: a continuously differentiable vector field is locally Lipschitz, and a solution cannot have a finite maximal endpoint while its state remains in a compact subset of the field's open domain. To see the continuation mechanism, bounded derivatives make the state Cauchy at a finite endpoint; local existence from its limit extends the curve."
        },
        {
          "kind": "prose",
          "text": "When \\(V\\) is defined on all of \\(\\mathbb R\\) and \\(V(y)\\to+\\infty\\) as \\(|y|\\to\\infty\\), it is called coercive. Then a fixed energy traps \\(y\\) in a bounded closed set. The continuous potential has a minimum on that set, so \\(v^2=2(E_0-V(y))\\) also bounds \\(v\\). The state stays in a compact rectangle of \\(\\mathbb R^2\\), giving existence for all real time. Without these conditions a conserved quantity alone need not imply bounded motion or global existence."
        },
        {
          "kind": "prose",
          "text": "Even for a noncoercive potential, use the connected accessible position interval containing the initial point. A continuous trajectory cannot cross a region where \\(V>E_0\\). This component argument is useful for a pendulum, whose potential is periodic rather than coercive."
        }
      ]
    },
    {
      "id": "turning-time",
      "title": "A turning point requires an integrability check",
      "body": [
        {
          "kind": "prose",
          "text": "On a decreasing branch where \\(v<0\\), separation gives a travel-time integral. If motion starts at a positive turning point \\(A\\) and moves toward \\(B<A\\), then"
        },
        {
          "kind": "math",
          "latex": "T=\\int_B^A\\frac{\\mathrm du}{\\sqrt{2(E_0-V(u))}}."
        },
        {
          "kind": "prose",
          "text": "This formula applies only along a branch with \\(E_0>V(u)\\) in its interior. At a starting endpoint with \\(V(A)=E_0\\) and \\(V'(A)>0\\), Taylor's first-order estimate gives \\(E_0-V(u)\\sim V'(A)(A-u)\\) as \\(u\\uparrow A\\). Here \\(f\\sim g\\) means \\(f/g\\to1\\). Thus the time integrand has an integrable inverse-square-root singularity. The acceleration \\(-V'(A)<0\\) initiates the decreasing branch."
        },
        {
          "kind": "prose",
          "text": "A bound on speed is attained only if the required position is actually reached. A divergent travel integral instead describes an infinite-time approach on the chosen branch. Division by velocity cannot decide what happens at the turning point itself; use acceleration and uniqueness there."
        }
      ]
    },
    {
      "id": "dissipation",
      "title": "Friction changes an equality into a monotonicity law",
      "body": [
        {
          "kind": "prose",
          "text": "For \\(y''+\\gamma y'+V'(y)=0\\), with constant \\(\\gamma>0\\), the same calculation gives"
        },
        {
          "kind": "math",
          "latex": "E'(t)=-\\gamma v(t)^2,\\qquad E(t)=E(0)-\\gamma\\int_0^t v(s)^2\\,\\mathrm ds\\quad(t\\ge0)."
        },
        {
          "kind": "prose",
          "text": "Energy is nonincreasing forward in time. A coercive potential still yields a compact forward state bound. This estimate alone does not prove a limit of the state, a sharp speed maximum, or periodicity; those are additional conclusions requiring additional arguments."
        }
      ]
    }
  ],
  "worked": [
    {
      "id": "mixed-potential-speed",
      "revision": 1,
      "title": "Prove that the speed bound is attained",
      "problem": [
        {
          "kind": "prose",
          "text": "For \\(y''+y+y^3=0\\), \\(y(0)=2\\), \\(y'(0)=0\\), find the maximum forward speed and justify its attainment."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Use \\(V(y)=y^2/2+y^4/4\\). The initial energy is six, so"
        },
        {
          "kind": "math",
          "latex": "\\frac12(y')^2+\\frac12y^2+\\frac14y^4=6,\\qquad (y')^2=12-y^2-\\frac12y^4\\le12."
        },
        {
          "kind": "prose",
          "text": "The coercive potential bounds both state components, hence the solution is global. Its initial acceleration is \\(-10\\), so it begins decreasing. For \\(0<y<2\\), the right side for \\((y')^2\\) is strictly positive. Thus velocity cannot change sign there. The time to zero is"
        },
        {
          "kind": "math",
          "latex": "T=\\int_0^2\\frac{\\mathrm du}{\\sqrt{12-u^2-u^4/2}}<\\infty."
        },
        {
          "kind": "prose",
          "text": "At zero the denominator is nonzero. Near two, \\(6-V(u)\\sim10(2-u)\\), so the endpoint is integrable. More explicitly, separation defines a strictly increasing finite travel-time function along this decreasing branch; its inverse reaches zero at \\(T\\), and compact continuation supplies that endpoint. Therefore \\(y'(T)=-2\\sqrt3\\). The global bound \\(2\\sqrt3\\) is an attained maximum of speed, not merely an upper bound."
        }
      ],
      "verification": [
        "Author self-check: invariant, compact bound, simple turning root, finite-time criterion and attained speed."
      ]
    },
    {
      "id": "asymptotic-zero",
      "revision": 1,
      "title": "The same energy can describe two directions",
      "problem": [
        {
          "kind": "prose",
          "text": "For \\(y''=y\\), compare the forward motions from \\(y(0)=1\\) with \\(y'(0)=-1\\) and with \\(y'(0)=1\\). Does either reach zero in finite forward time?"
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "The potential is \\(V(y)=-y^2/2\\), and both data have energy zero. While \\(y>0\\), the energy equation allows \\(y'=\\pm y\\). Matching the initial signs gives"
        },
        {
          "kind": "math",
          "latex": "y_-(t)=e^{-t},\\qquad y_+(t)=e^t."
        },
        {
          "kind": "prose",
          "text": "Both directly satisfy the equation and their respective data. The decreasing branch tends to zero but never reaches it at finite time: \\(\\int_0^1\\mathrm du/u\\) diverges. The increasing branch moves away and is unbounded as \\(t\\to\\infty\\). Both formulas exist for all real time. Constant energy therefore neither specifies direction nor guarantees a bounded trajectory."
        }
      ],
      "verification": [
        "Author self-check: both residuals/data/energies, positive branches and divergent travel integral."
      ]
    }
  ],
  "contrast": [
    {
      "kind": "prose",
      "text": "The energy relation \\(v^2=2(E_0-V(y))\\) loses the sign of velocity. Replacing it everywhere by one square-root branch can incorrectly stop an oscillation at its first turning point. Conversely, an equilibrium may only be approached asymptotically. For example, the decreasing zero-energy branch of \\(y''=y\\) never arrives at zero. Conserved energy can also coexist with finite-time blowup: \\(y''=2y^3\\), \\(y(0)=y'(0)=1\\), has \\(y(t)=1/(1-t)\\) for \\(t<1\\), with \\((y')^2/2-y^4/2=0\\). Its potential is not coercive."
    }
  ],
  "mistakes": [
    "Calling an upper bound a maximum without proving that a trajectory reaches the equality state.",
    "Dividing by \\(y'\\) at a turning point or equilibrium.",
    "Using all components of \\(\\{y:V(y)\\le E_0\\}\\) as if the initial trajectory could jump between them.",
    "Treating decreasing energy as a proof of periodicity or convergence to an equilibrium."
  ],
  "exercises": [
    {
      "id": "pendulum-quarter-time",
      "revision": 1,
      "title": "A periodic potential and the least period",
      "problem": [
        {
          "kind": "prose",
          "text": "For \\(y''+\\sin y=0\\), \\(y(0)=\\pi/2\\), \\(y'(0)=0\\), find the maximum speed and express the least positive period as a definite integral. Justify finite travel and the factor of four."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Use \\(V(y)=1-\\cos y\\). Which connected component of \\(V(y)\\le E_0\\) contains the starting point?"
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Inside that component, \\((y')^2=2\\cos y\\). At \\(\\pi/2\\), the acceleration is negative and \\(V'=1\\)."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "First follow the decreasing motion from \\(\\pi/2\\) to zero. Evenness of the potential and time-reversal uniqueness relate the four monotone legs; an earlier return to the starting state would have to omit a leg."
          }
        ]
      ],
      "solution": [
        {
          "kind": "math",
          "latex": "E_0=1,\\qquad -\\frac\\pi2\\le y\\le\\frac\\pi2,\\qquad \\max_{t\\ge0}|y'(t)|=\\sqrt2."
        },
        {
          "kind": "prose",
          "text": "The energy component bounds position and velocity, giving global existence. Initially \\(y''=-1\\); between \\(\\pi/2\\) and zero velocity is negative. The quarter-time integral is finite because its only singular endpoint is an inverse square root. It reaches zero, where speed is \\(\\sqrt2\\)."
        },
        {
          "kind": "math",
          "latex": "P=4\\int_0^{\\pi/2}\\frac{\\mathrm du}{\\sqrt{2\\cos u}}."
        },
        {
          "kind": "prose",
          "text": "The potential is even. Reflection in position and reversal of time preserve the equation; uniqueness therefore gives four equal-time legs from the positive turning point to zero, to the negative turning point, back to zero, and back to the positive turning point. On each open leg the position is strictly monotone with a specified velocity sign. The initial state \\((\\pi/2,0)\\) first returns after these four legs. A period of the differentiable position also repeats its derivative, so this first state-return time is the least positive period."
        }
      ],
      "verification": [
        "Author self-check: energy component, endpoint order, speed at zero, reflection and first-return proof."
      ]
    },
    {
      "id": "damped-energy-bound",
      "revision": 1,
      "title": "Use the inequality without overclaiming",
      "problem": [
        {
          "kind": "prose",
          "text": "For \\(y''+2y'+y+y^3=0\\), \\(y(0)=1\\), \\(y'(0)=0\\), prove forward global existence and bounds on \\(|y|\\) and \\(|y'|\\) using energy. Is the initial energy strictly reduced for every \\(t>0\\)? Do not assume an asymptotic convergence theorem."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Use the same potential \\(y^2/2+y^4/4\\) and compute the initial energy."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "The energy identity is \\(E(t)=E(0)-2\\int_0^t(y')^2\\,\\mathrm ds\\). The potential is increasing as a function of \\(|y|\\)."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "The initial acceleration is \\(-2\\), so velocity is nonzero on a short positive-time interval. This makes every positive-time dissipation integral strictly positive."
          }
        ]
      ],
      "solution": [
        {
          "kind": "math",
          "latex": "E(t)=\\frac34-2\\int_0^t(y'(s))^2\\,\\mathrm ds,\\qquad |y(t)|\\le1,\\qquad |y'(t)|\\le\\sqrt{\\frac32}\\quad(t\\ge0)."
        },
        {
          "kind": "prose",
          "text": "The potential exceeds \\(3/4\\) whenever \\(|y|>1\\), and it is nonnegative. These give the displayed bounds on every existing forward interval. The vector field is continuously differentiable on \\(\\mathbb R^2\\); compact continuation makes the interval all of \\([0,\\infty)\\). Since \\(y''(0)=-2\\), continuity gives \\(y'(t)<0\\) for all sufficiently small positive \\(t\\). Hence the integral is positive for every \\(t>0\\), and \\(E(t)<3/4\\). In particular the displayed speed bound is not an attained maximum. This proof establishes bounds and energy loss; it does not establish a particular long-time state limit."
        }
      ],
      "verification": [
        "Author self-check: dissipation law, initial energy/acceleration, compact bounds and strictness."
      ]
    }
  ],
  "alternatives": [
    {
      "kind": "prose",
      "text": "When a closed-form solution is easy, direct verification can settle domain and limiting behavior, as for \\(y''=y\\). When no elementary position formula is available, an energy curve and an improper travel-time integral can still prove a sharp speed maximum or period. Phase-line reasoning applies to each signed branch but must be joined through the original second-order equation at turning points."
    }
  ],
  "related": [
    "ode-nonlinear",
    "ode-systems",
    "integral-applications"
  ],
  "next": [],
  "references": [
    {
      "sourceId": "diffyqs",
      "url": "https://www.jirka.org/diffyqs/html/nlinstability_section.html",
      "use": "reference-only"
    },
    {
      "sourceId": "diffyqs",
      "url": "https://www.jirka.org/diffyqs/html/nlinapps_section.html",
      "use": "reference-only"
    }
  ],
  "readiness": [
    {
      "lessonId": "existence-uniqueness",
      "exerciseId": "bounded-state-domain-boundary",
      "prompt": "Can you distinguish a bounded state from remaining inside the equation domain?"
    }
  ],
  "review": {
    "status": "draft"
  },
  "exposureAudit": {
    "status": "pending"
  }
};
