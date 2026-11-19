import {spatialTransfer} from './spatial-transfer.mjs';
// Original draft; independent review and owner corrections recorded privately. Admission remains pending.
const coordinatesSpatialBase={
  "id": "coordinates-spatial",
  "revision": 1,
  "title": "Triple integrals in Cartesian, cylindrical and spherical coordinates",
  "summary": "Build three-dimensional integration bounds from a solid, derive the cylindrical and spherical volume factors, and check angular coverage and singularities.",
  "objectives": [
    "Set up an iterated triple integral from a projection and two bounding surfaces.",
    "Change slicing order while describing exactly the same solid.",
    "Derive the cylindrical and spherical absolute Jacobians.",
    "Distinguish distance from an axis from distance from the origin and state every angle convention.",
    "Handle angular seams, poles and a radial singularity with the correct convergence argument."
  ],
  "prerequisites": [
    "coordinates"
  ],
  "readiness": [
    {
      "lessonId": "coordinates",
      "exerciseId": "folded-rectangle",
      "prompt": "Explain why local nonzero determinant and global one-to-one coverage are different checks."
    },
    {
      "lessonId": "multiple-integrals",
      "exerciseId": "parabolic-lens",
      "prompt": "Translate all region inequalities before changing the slicing order."
    },
    {
      "lessonId": "improper",
      "exerciseId": "logarithmic-endpoint",
      "prompt": "Use a one-sided cutoff, evaluate its boundary limit, and check absolute convergence."
    }
  ],
  "sections": [
    {
      "id": "triple-slices",
      "title": "A volume element and three successive bounds",
      "body": [
        {
          "kind": "prose",
          "text": "A small rectangular box has volume \\(\\Delta x\\Delta y\\Delta z\\). Triple integration sums an integrand against this volume and takes the limit as the boxes shrink. Write \\(\\mathrm dV=\\mathrm dx\\,\\mathrm dy\\,\\mathrm dz\\). Integrating 1 gives volume; integrating a nonnegative mass density gives mass. For a continuous function on a finite rectangular box, the triple integral equals every iterated order. For a solid with piecewise smooth boundary and continuous integrand, slice its actual region instead of pretending all three bounds are independent."
        },
        {
          "kind": "prose",
          "text": "For example, if \\(D\\) is a bounded planar region and continuous functions \\(g\\le h\\) describe a solid \\(E=\\{(x,y,z):(x,y)\\in D,\\ g(x,y)\\le z\\le h(x,y)\\}\\), then"
        },
        {
          "kind": "math",
          "latex": "\\iiint_E f(x,y,z)\\,\\mathrm dV=\\iint_D\\left(\\int_{g(x,y)}^{h(x,y)}f(x,y,z)\\,\\mathrm dz\\right)\\mathrm dA."
        },
        {
          "kind": "prose",
          "text": "This version assumes the solid and integrand are regular as just stated. For a nonnegative measurable integrand, Tonelli permits successive integrations even before finiteness is known; for a signed unbounded integrand, absolute integrability is a sufficient Fubini hypothesis. When changing order, fix the new outer variables and solve every original inequality for the inner interval. Split the region if a bound changes formula. A coordinate bound may depend on outer variables, never on a variable already integrated away."
        }
      ]
    },
    {
      "id": "spatial-change-rule",
      "title": "The three-dimensional determinant and its hypotheses",
      "body": [
        {
          "kind": "prose",
          "text": "Let \\(T\\) be a continuously differentiable bijection between open subsets of \\(\\mathbb R^3\\), with continuously differentiable inverse and nonzero determinant. For a compact region within its domain and a continuous integrand, the change-of-variables rule multiplies by \\(|\\det DT|\\). It also transforms the whole region. The rule extends to nonnegative improper integrals by increasing interior truncations, and to absolutely integrable signed functions. These are sufficient conditions, not a guarantee from a determinant alone."
        },
        {
          "kind": "math",
          "latex": "\\iiint_{T(F)}f(x,y,z)\\,\\mathrm dV=\\iiint_F f(T(u,v,w))\\left|\\frac{\\partial(x,y,z)}{\\partial(u,v,w)}\\right|\\,\\mathrm du\\,\\mathrm dv\\,\\mathrm dw."
        },
        {
          "kind": "prose",
          "text": "For clarity, a three-by-three determinant can be computed by expansion along its first row:"
        },
        {
          "kind": "math",
          "latex": "\\det\\begin{pmatrix}a&b&c\\\\d&e&f\\\\g&h&i\\end{pmatrix}=a(ei-fh)-b(di-fg)+c(dh-eg)."
        },
        {
          "kind": "prose",
          "text": "The sign records orientation; volume uses the absolute value. The determinant arises from the volume of the infinitesimal parallelepiped formed by the three derivative columns. Its general change-of-variables theorem is used here, not proved from measure theory."
        }
      ]
    },
    {
      "id": "cylindrical-map",
      "title": "Cylindrical radius is distance from the vertical axis",
      "body": [
        {
          "kind": "prose",
          "text": "Keep the planar azimuth \\(\\theta\\), measured counterclockwise from the positive \\(x\\)-axis in radians, and leave height \\(z\\) unchanged. Cylindrical coordinates are"
        },
        {
          "kind": "math",
          "latex": "x=r\\cos\\theta,\\quad y=r\\sin\\theta,\\quad z=z,\\qquad r=\\sqrt{x^2+y^2}\\ge0."
        },
        {
          "kind": "math",
          "latex": "\\det\\frac{\\partial(x,y,z)}{\\partial(r,\\theta,z)}=\\det\\begin{pmatrix}\\cos\\theta&-r\\sin\\theta&0\\\\\\sin\\theta&r\\cos\\theta&0\\\\0&0&1\\end{pmatrix}=r,\\qquad\\mathrm dV=r\\,\\mathrm dr\\,\\mathrm d\\theta\\,\\mathrm dz."
        },
        {
          "kind": "prose",
          "text": "On \\(r>0\\) and a single azimuth interval of length at most \\(2\\pi\\) with any repeated endpoint ray removed, each allowed point is covered once. At \\(r=0\\) the angle is undefined. For bounded integrands on bounded solids, the axis and the angular seam have zero volume; excluding them and taking limits causes no missing mass. An unbounded integrand still needs an integrability test near that axis. The equations \\(x^2+y^2=r^2\\) and \\(x^2+y^2+z^2=r^2+z^2\\) are different; a sphere is not a constant cylindrical radius."
        }
      ]
    },
    {
      "id": "spherical-map",
      "title": "State the two angles before computing the spherical factor",
      "body": [
        {
          "kind": "prose",
          "text": "Use \\(\\rho\\ge0\\) for distance from the origin, the same azimuth \\(\\theta\\) as above, and \\(\\phi\\in[0,\\pi]\\) for inclination down from the positive \\(z\\)-axis. Thus"
        },
        {
          "kind": "math",
          "latex": "x=\\rho\\sin\\phi\\cos\\theta,\\quad y=\\rho\\sin\\phi\\sin\\theta,\\quad z=\\rho\\cos\\phi,\\qquad r=\\rho\\sin\\phi."
        },
        {
          "kind": "prose",
          "text": "Different books interchange the angle letters. The definitions here determine the formula. In the derivative-column order \\((\\rho,\\phi,\\theta)\\), direct determinant expansion gives"
        },
        {
          "kind": "math",
          "latex": "\\det\\begin{pmatrix}\\sin\\phi\\cos\\theta&\\rho\\cos\\phi\\cos\\theta&-\\rho\\sin\\phi\\sin\\theta\\\\\\sin\\phi\\sin\\theta&\\rho\\cos\\phi\\sin\\theta&\\rho\\sin\\phi\\cos\\theta\\\\\\cos\\phi&-\\rho\\sin\\phi&0\\end{pmatrix}=\\rho^2\\sin\\phi."
        },
        {
          "kind": "math",
          "latex": "\\mathrm dV=\\rho^2\\sin\\phi\\,\\mathrm d\\rho\\,\\mathrm d\\phi\\,\\mathrm d\\theta\\qquad(\\rho>0,\\ 0<\\phi<\\pi)."
        },
        {
          "kind": "prose",
          "text": "The factor also reflects three perpendicular local lengths: radial change \\(\\mathrm d\\rho\\), inclination change \\(\\rho\\,\\mathrm d\\phi\\), and azimuthal change \\(\\rho\\sin\\phi\\,\\mathrm d\\theta\\). Away from the vertical axis and an azimuth seam, the inverse is unique: \\(\\rho=\\sqrt{x^2+y^2+z^2}\\), \\(\\phi=\\arccos(z/\\rho)\\in(0,\\pi)\\), and \\(\\theta\\) is the chosen argument of \\((x,y)\\). The arccosine uses its principal range \\([0,\\pi]\\); the sign of height is preserved by \\(\\cos\\phi\\)."
        },
        {
          "kind": "prose",
          "text": "The origin, poles and one angular seam can be omitted for a bounded integrand and restored by a limit. A full solid uses a single azimuth turn and \\(0\\le\\phi\\le\\pi\\); using both angles from 0 to \\(2\\pi\\) repeats points. These are volume coordinates. Surface area and oriented flux on a sphere require their own surface element, not this three-variable volume element."
        }
      ]
    },
    {
      "id": "bounds-and-singularities",
      "title": "Translate geometry and test the remaining radial power",
      "body": [
        {
          "kind": "prose",
          "text": "A ball of radius \\(R>0\\) gives \\(0\\le\\rho\\le R\\). The upper cone \\(z\\ge\\sqrt{x^2+y^2}\\) gives \\(\\cos\\phi\\ge\\sin\\phi\\), hence \\(0\\le\\phi\\le\\pi/4\\); squaring before checking \\(z\\ge0\\) would add the lower cone. A restriction such as \\(x\\ge0\\) restricts azimuth as well, because \\(x=\\rho\\sin\\phi\\cos\\theta\\). Every inequality must survive the transformation."
        },
        {
          "kind": "prose",
          "text": "For a radial integrand \\(f(\\rho)\\) over a whole ball, one full angular integration gives \\(\\int_0^{2\\pi}\\int_0^\\pi\\sin\\phi\\,\\mathrm d\\phi\\,\\mathrm d\\theta=4\\pi\\). The volume integral is therefore \\(4\\pi\\int_0^R f(\\rho)\\rho^2\\,\\mathrm d\\rho\\), when finite, or as a nonnegative improper integral. A singular power must be tested after multiplying by \\(\\rho^2\\); zero volume of the central point does not justify ignoring a divergent neighborhood."
        }
      ]
    },
    {
      "id": "tier-relevance",
      "title": "The Medium coordinate bridge and its limits",
      "body": [
        {
          "kind": "prose",
          "text": "Easy rectangular iteration and planar polar coordinates are prerequisites. The triple slices, two spatial maps, volume factors and exact region translations directly teach Medium multivariable integration and coordinate expectations. Singular radial powers and one-to-one coverage prepare Hard coordinate and convergence work. The lesson supplies geometric prerequisites for Olympiad moment and homogeneity arguments, but does not prove a spherical quadratic-form identity, a many-to-one area formula, matrix-cone integration or spectral estimates."
        }
      ]
    }
  ],
  "worked": [
    {
      "id": "paraboloid-quarter-solid",
      "revision": 1,
      "title": "A cylindrical solid checked by horizontal slices",
      "problem": [
        {
          "kind": "prose",
          "text": "Let \\(E=\\{(x,y,z):x,y\\ge0,\\ x^2+y^2\\le z\\le3\\}\\). Find its volume and the average height \\(z\\) under uniform volume measure."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "The two height bounds can be ordered only when \\(r^2\\le3\\). The quadrant restricts azimuth, so the exact cylindrical bounds are \\(0\\le\\theta\\le\\pi/2\\), \\(0\\le r\\le\\sqrt3\\), \\(r^2\\le z\\le3\\). The integrands 1 and \\(z\\) are bounded; the axis and boundary rays cause no singularity."
        },
        {
          "kind": "math",
          "latex": "V=\\int_0^{\\pi/2}\\int_0^{\\sqrt3}\\int_{r^2}^{3}r\\,\\mathrm dz\\,\\mathrm dr\\,\\mathrm d\\theta=\\frac\\pi2\\int_0^{\\sqrt3}(3-r^2)r\\,\\mathrm dr=\\frac{9\\pi}{8}."
        },
        {
          "kind": "math",
          "latex": "M=\\iiint_E z\\,\\mathrm dV=\\frac\\pi2\\int_0^{\\sqrt3}\\frac{9-r^4}{2}r\\,\\mathrm dr=\\frac{9\\pi}{4},\\qquad z_{\\mathrm{avg}}=\\frac MV=2."
        },
        {
          "kind": "prose",
          "text": "A horizontal slice at \\(0\\le z\\le3\\) is a quarter disk of radius \\(\\sqrt z\\), with area \\(\\pi z/4\\). Hence \\(V=\\int_0^3\\pi z/4\\,\\mathrm dz=9\\pi/8\\), and \\(M=\\int_0^3\\pi z^2/4\\,\\mathrm dz=9\\pi/4\\). This independently checks both the region and the density factor. The mean 2 lies in the height range \\([0,3]\\)."
        }
      ],
      "verification": [
        "Author self-check: all three inequalities, cylindrical determinant and both exact integrals.",
        "Author second route: horizontal quarter-disk sections verify the volume and first height moment."
      ]
    },
    {
      "id": "conical-half-shell",
      "revision": 1,
      "title": "A spherical shell with two angular restrictions",
      "problem": [
        {
          "kind": "prose",
          "text": "Let \\(E\\) satisfy \\(1\\le x^2+y^2+z^2\\le4\\), \\(z\\ge\\sqrt{x^2+y^2}\\), and \\(x\\ge0\\). Find its volume and the integral of \\(x^2+y^2+z^2\\) over it. Also find the average of this squared distance."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "The shell bounds give \\(1\\le\\rho\\le2\\). The upper-cone inequality gives \\(0\\le\\phi\\le\\pi/4\\). The half-space gives a single azimuth interval \\(-\\pi/2\\le\\theta\\le\\pi/2\\), since \\(\\cos\\theta\\ge0\\) there. This covers the region once off the zero-volume axis and boundary rays. All integrands are bounded on the shell."
        },
        {
          "kind": "math",
          "latex": "V=\\int_{-\\pi/2}^{\\pi/2}\\int_0^{\\pi/4}\\int_1^2\\rho^2\\sin\\phi\\,\\mathrm d\\rho\\,\\mathrm d\\phi\\,\\mathrm d\\theta=\\frac{7\\pi}{3}\\left(1-\\frac1{\\sqrt2}\\right)."
        },
        {
          "kind": "math",
          "latex": "I=\\iiint_E(x^2+y^2+z^2)\\,\\mathrm dV=\\frac{31\\pi}{5}\\left(1-\\frac1{\\sqrt2}\\right),\\qquad (\\rho^2)_{\\mathrm{avg}}=\\frac IV=\\frac{93}{35}."
        },
        {
          "kind": "prose",
          "text": "The same angular factor appears in both integrals and cancels in their ratio. The remaining ratio is \\((\\int_1^2\\rho^4\\,\\mathrm d\\rho)/(\\int_1^2\\rho^2\\,\\mathrm d\\rho)\\). The value \\(93/35\\) lies strictly between 1 and 4. Omitting the inclination factor would change the volume; including the lower cone would double the region."
        }
      ],
      "verification": [
        "Author self-check: square-root shell radii, upper rather than double cone, and exactly one half-turn azimuth.",
        "Author second calculation: radial moment-to-volume ratio and range check."
      ]
    }
  ],
  "contrast": [
    {
      "kind": "prose",
      "text": "An azimuth range \\(0\\le\\theta\\le4\\pi\\) covers a full cylinder twice, even when \\(r>0\\) makes the local determinant nonzero. For the unit-radius cylinder of height 1, integrating \\(r\\) over that range gives \\(2\\pi\\), while its volume is \\(\\pi\\)."
    },
    {
      "kind": "prose",
      "text": "The cone equations \\(z^2=x^2+y^2\\) and \\(z=\\sqrt{x^2+y^2}\\) differ: the squared equation includes the lower cone. A square-root branch is a geometric condition, not a notation preference."
    },
    {
      "kind": "prose",
      "text": "A bounded function can ignore a zero-volume point in an integral. The nonnegative function \\(\\rho^{-3}\\), however, has an infinite integral near the origin in three dimensions because its radial density becomes \\(\\rho^{-1}\\)."
    }
  ],
  "mistakes": [
    "Using the same symbol for cylindrical radius and distance from the origin without defining it.",
    "Changing coordinates in the integrand but retaining bounds for a different solid.",
    "Forgetting r or the spherical factor rho squared times sine of inclination.",
    "Swapping the angle roles while retaining the old sine factor.",
    "Squaring a cone inequality and losing the required sign of height.",
    "Using a doubled angular interval and counting the same volume twice.",
    "Discarding a singular neighborhood because its central set has zero volume.",
    "Confusing a volume integral with a surface-area or flux integral."
  ],
  "exercises": [
    {
      "id": "cartesian-tetrahedral-slices",
      "revision": 1,
      "title": "Two slicing orders for a solid with a sloping roof",
      "problem": [
        {
          "kind": "prose",
          "text": "Let \\(E=\\{(x,y,z):x,y,z\\ge0,\\ x+y\\le1,\\ z\\le2x\\}\\). Compute its volume and average height. Set up a second correct triple integral for the volume with \\(z\\) as the outer variable, and evaluate it."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "With \\(x\\) outermost, take \\(0\\le x\\le1\\), \\(0\\le y\\le1-x\\), \\(0\\le z\\le2x\\)."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "For fixed height \\(z\\), the condition \\(z\\le2x\\) means \\(x\\ge z/2\\). The full height range is \\(0\\le z\\le2\\)."
          }
        ],
        [
          {
            "kind": "math",
            "latex": "0\\le y\\le1-z/2,\\qquad z/2\\le x\\le1-y."
          }
        ]
      ],
      "solution": [
        {
          "kind": "math",
          "latex": "V=\\int_0^1\\int_0^{1-x}\\int_0^{2x}1\\,\\mathrm dz\\,\\mathrm dy\\,\\mathrm dx=\\int_0^1 2x(1-x)\\,\\mathrm dx=\\frac13."
        },
        {
          "kind": "math",
          "latex": "M=\\int_0^1\\int_0^{1-x}\\int_0^{2x}z\\,\\mathrm dz\\,\\mathrm dy\\,\\mathrm dx=\\int_0^1 2x^2(1-x)\\,\\mathrm dx=\\frac16,\\qquad z_{\\mathrm{avg}}=\\frac12."
        },
        {
          "kind": "prose",
          "text": "At fixed \\(z\\), the region is nonempty precisely for \\(0\\le z\\le2\\), and the remaining inequalities yield the hinted bounds. The new integral is"
        },
        {
          "kind": "math",
          "latex": "V=\\int_0^2\\int_0^{1-z/2}\\int_{z/2}^{1-y}1\\,\\mathrm dx\\,\\mathrm dy\\,\\mathrm dz=\\int_0^2\\frac{(1-z/2)^2}{2}\\,\\mathrm dz=\\frac13."
        },
        {
          "kind": "prose",
          "text": "The inner interval is nonnegative because the outer \\(y\\)-bound was derived from that requirement. The integrands are continuous on a bounded polyhedral solid, so these orders are justified. The horizontal slice area also checks \\(M=\\int_0^2 z(1-z/2)^2/2\\,\\mathrm dz=1/6\\)."
        }
      ],
      "verification": [
        "Author self-check: both sets of bounds imply and are implied by the original inequalities.",
        "Author second route: exact horizontal-slice volume and height moment agree."
      ]
    },
    {
      "id": "radial-singularity-threshold",
      "revision": 1,
      "title": "An excluded origin does not remove a divergent neighborhood",
      "problem": [
        {
          "kind": "prose",
          "text": "For real \\(p\\), determine exactly when \\(\\iiint_{0<x^2+y^2+z^2<9}(x^2+y^2+z^2)^{-p/2}\\,\\mathrm dV\\) converges, and evaluate it on its convergence domain. Describe what happens at the threshold."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "The integrand is \\(\\rho^{-p}\\) and the spherical radius satisfies \\(0<\\rho<3\\)."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Integrate the angular factor over one full turn and all inclinations, giving \\(4\\pi\\). Keep the extra radial power \\(\\rho^2\\)."
          }
        ],
        [
          {
            "kind": "math",
            "latex": "I=4\\pi\\lim_{\\varepsilon\\to0^+}\\int_\\varepsilon^3\\rho^{2-p}\\,\\mathrm d\\rho."
          }
        ]
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "On every punctured shell \\(\\varepsilon<\\rho<3\\), the integrand is bounded and the spherical change of variables is justified after omitting the angular seam and poles. It is nonnegative, so the shell integrals increase to the requested improper integral as \\(\\varepsilon\\to0^+\\). The radial power test gives finiteness exactly when \\(2-p>-1\\), that is \\(p<3\\)."
        },
        {
          "kind": "math",
          "latex": "I=\\frac{4\\pi\\,3^{3-p}}{3-p}\\qquad(p<3)."
        },
        {
          "kind": "prose",
          "text": "At \\(p=3\\), the truncated integral is \\(4\\pi\\ln(3/\\varepsilon)\\), which tends to \\(+\\infty\\). For \\(p>3\\), the lower power term tends to \\(+\\infty\\) as well. Thus excluding the origin does not produce a finite result at or above the threshold. As a check, \\(p=0\\) gives the radius-3 ball volume \\(36\\pi\\); \\(p=2\\) gives \\(12\\pi\\), a finite singular integral."
        }
      ],
      "verification": [
        "Author self-check: exact radial cutoff formula and power/log endpoint classifications.",
        "Author checks at p=0, p=2 and the threshold p=3; no cancellation or principal value is used."
      ]
    }
  ],
  "alternatives": [
    {
      "kind": "prose",
      "text": "Choose coordinates from the region and integrand together. Cartesian slices suit planar boundaries, cylindrical coordinates preserve height above a polar base, and spherical coordinates separate radial distance from direction. A horizontal-slice calculation is often an effective second route for a cylindrical setup."
    },
    {
      "kind": "prose",
      "text": "This bridge establishes volume coordinates and their convergence checks. General surface measure, oriented flux, coarea, overlapping geometric images, and advanced spherical homogeneity identities remain separate topics. The next moment lesson can now use a triple simplex with explicit volume notation and linear coordinate changes."
    }
  ],
  "related": [
    "multiple-integrals",
    "coordinates",
    "improper",
    "vector-surfaces",
    "multi-moments"
  ],
  "next": [
    "multi-moments"
  ],
  "references": [
    {
      "sourceId": "openstax-calculus-3",
      "url": "https://openstax.org/books/calculus-volume-3/pages/5-4-triple-integrals",
      "use": "reference-only"
    },
    {
      "sourceId": "openstax-calculus-3",
      "url": "https://openstax.org/books/calculus-volume-3/pages/5-5-triple-integrals-in-cylindrical-and-spherical-coordinates",
      "use": "reference-only"
    },
    {
      "sourceId": "dlmf",
      "url": "https://dlmf.nist.gov/1.5#ii",
      "use": "reference-only"
    },
    {
      "sourceId": "dlmf",
      "url": "https://dlmf.nist.gov/1.5#vi",
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

export default {...coordinatesSpatialBase,revision:2,exercises:[...coordinatesSpatialBase.exercises,spatialTransfer]};
