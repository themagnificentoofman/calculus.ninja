// Original draft; independent review and owner corrections recorded privately. Admission remains pending.
export default {
  "id": "multi-moments",
  "revision": 1,
  "title": "Simplex moments and positive-definite Gaussian integrals",
  "summary": "Prove the Dirichlet simplex formula, normalize weighted moments, and reduce a positive-definite quadratic Gaussian to independent one-variable integrals.",
  "objectives": [
    "Distinguish a simplex coordinate from its remaining slack and prove the positive-exponent convergence conditions.",
    "Derive the finite-dimensional Dirichlet formula by repeated Beta integration.",
    "Compute a normalized moment by dividing its raw integral by the total mass.",
    "Check positive definiteness, the whole integration region and the absolute Jacobian before using a Gaussian determinant formula.",
    "Explain the factor-of-two difference between two common Gaussian exponent conventions."
  ],
  "prerequisites": [
    "beta-gamma",
    "coordinates-spatial",
    "linear-algebra"
  ],
  "readiness": [
    {
      "lessonId": "beta-gamma",
      "exerciseId": "rational-tail-parameter-range",
      "prompt": "Recover the strict convergence conditions from endpoint powers before using Gamma values."
    },
    {
      "lessonId": "coordinates-spatial",
      "exerciseId": "cartesian-tetrahedral-slices",
      "prompt": "Build a triple integral from the complete solid and check it in a second slicing order."
    },
    {
      "lessonId": "linear-algebra",
      "exerciseId": "quadratic-unit-circle",
      "prompt": "Use the signs of a symmetric quadratic form rather than the determinant alone."
    }
  ],
  "sections": [
    {
      "id": "finite-dimensional-integrals",
      "title": "Extend the measure and change-of-variable ledger",
      "body": [
        {
          "kind": "prose",
          "text": "Fix a positive integer \\(n\\). Write \\(\\mathbf x=(x_1,\\ldots,x_n)^{\\mathsf T}\\) for a column vector and \\(\\mathrm d\\mathbf x=\\mathrm dx_1\\cdots\\mathrm dx_n\\) for ordinary \\(n\\)-dimensional volume. A triple integral is the case \\(n=3\\), and a double integral is the case \\(n=2\\). The transpose sign turns a column into a row. Finite products and sums below always run over the displayed indices."
        },
        {
          "kind": "prose",
          "text": "We use the finite-dimensional versions of the integral rules already used in the plane: a nonnegative measurable function can be integrated in successive coordinates in any order (Tonelli), possibly with result \\(+\\infty\\); a signed function needs an integrable absolute value for the corresponding finite Fubini conclusion. Nonnegative integrals over increasing interior truncations increase to the full integral. These statements let us prove finiteness after making a positive transformation."
        },
        {
          "kind": "prose",
          "text": "For an invertible real linear map \\(\\mathbf x=L\\mathbf u+\\mathbf h\\), volume changes by \\(|\\det L|\\), and the image region must change with it. This is the linear \\(n\\)-dimensional change-of-variables rule. Diagonal scaling contributes the product of its positive scale factors; a shear has determinant 1. An orthogonal matrix \\(Q\\), defined by \\(Q^{\\mathsf T}Q=I\\), has \\(|\\det Q|=1\\), since taking determinants gives \\((\\det Q)^2=1\\). The general volume rule and Tonelli are used as theorems here; a measure-theoretic proof is outside this lesson. The simplex proof below only needs repeated one-variable Beta integrations."
        }
      ]
    },
    {
      "id": "simplex-domain",
      "title": "The slack is an extra exponent, not an extra coordinate integral",
      "body": [
        {
          "kind": "prose",
          "text": "The open standard simplex and its remaining slack are"
        },
        {
          "kind": "math",
          "latex": "\\Delta_n=\\{(t_1,\\ldots,t_n):t_j>0,\\ t_1+\\cdots+t_n<1\\},\\qquad t_{n+1}=1-\\sum_{j=1}^n t_j."
        },
        {
          "kind": "prose",
          "text": "There are \\(n\\) independent integration coordinates and \\(n+1\\) positive quantities whose sum is 1. For real parameters \\(\\alpha_1,\\ldots,\\alpha_{n+1}\\), let \\(w(\\mathbf t)=\\prod_{j=1}^{n+1}t_j^{\\alpha_j-1}\\). This means the ordinary positive real power on the interior, even if it becomes unbounded at a face."
        },
        {
          "kind": "prose",
          "text": "The integral is finite exactly when every \\(\\alpha_j>0\\). Sufficiency will follow from the formula proved next. For necessity at a coordinate face, keep the other coordinates in a small interior box with slack bounded away from zero. All their factors then have positive finite lower and upper bounds, leaving the one-variable test \\(\\int_0^\\varepsilon t_j^{\\alpha_j-1}\\,\\mathrm dt_j\\). For the slack face, use the slack itself in place of one coordinate near a point with the other coordinates positive; this linear change has absolute determinant 1 and gives the same test. Thus a nonpositive face parameter causes divergence. Faces have zero volume, but a singularity near a face can still have an infinite integral."
        }
      ]
    },
    {
      "id": "dirichlet-proof",
      "title": "Prove the Dirichlet integral by merging two parameters",
      "body": [
        {
          "kind": "prose",
          "text": "Set \\(\\alpha_0=\\sum_{j=1}^{n+1}\\alpha_j\\), with every \\(\\alpha_j>0\\). The Dirichlet integral is"
        },
        {
          "kind": "math",
          "latex": "Z(\\boldsymbol\\alpha)=\\int_{\\Delta_n}\\prod_{j=1}^{n+1}t_j^{\\alpha_j-1}\\,\\mathrm d\\mathbf t=\\frac{\\prod_{j=1}^{n+1}\\Gamma(\\alpha_j)}{\\Gamma(\\alpha_0)}."
        },
        {
          "kind": "prose",
          "text": "For \\(n=1\\), this is the proved Beta–Gamma identity. For \\(n\\ge2\\), fix \\(t_1,\\ldots,t_{n-1}>0\\) with sum below 1, and put \\(R=1-\\sum_{j=1}^{n-1}t_j>0\\). The last coordinate ranges over \\(0<t_n<R\\), and its two factors integrate to"
        },
        {
          "kind": "math",
          "latex": "\\int_0^R t_n^{\\alpha_n-1}(R-t_n)^{\\alpha_{n+1}-1}\\,\\mathrm dt_n=R^{\\alpha_n+\\alpha_{n+1}-1}B(\\alpha_n,\\alpha_{n+1})."
        },
        {
          "kind": "prose",
          "text": "This is the one-variable substitution \\(t_n=Ru\\), with the factor \\(R\\) from its differential. What remains is an \\((n-1)\\)-dimensional simplex integral whose slack parameter is \\(\\alpha_n+\\alpha_{n+1}\\). Apply induction and multiply by the Beta quotient. The factor \\(\\Gamma(\\alpha_n+\\alpha_{n+1})\\) cancels; the denominator stays \\(\\Gamma(\\alpha_0)\\). Positivity permits each successive integration, and the finite Gamma values prove convergence. In particular, if there is no displayed slack weight, its parameter is 1, not zero."
        },
        {
          "kind": "math",
          "latex": "\\int_{\\Delta_n}\\prod_{j=1}^n t_j^{a_j-1}\\,\\mathrm d\\mathbf t=\\frac{\\prod_{j=1}^n\\Gamma(a_j)}{\\Gamma(1+\\sum_{j=1}^n a_j)}\\qquad(a_j>0)."
        }
      ]
    },
    {
      "id": "normalized-moments",
      "title": "Divide by the mass before calling an integral an average",
      "body": [
        {
          "kind": "prose",
          "text": "For an integrable positive weight \\(w\\) with mass \\(Z=\\int w>0\\), its normalized density is \\(\\rho=w/Z\\). The weighted average, also called expectation, of an integrable quantity \\(g\\) is \\(\\mathbb E[g]=\\int g\\rho\\). A raw moment \\(\\int g w\\) is \\(Z\\) times that expectation."
        },
        {
          "kind": "prose",
          "text": "For the simplex density above, multiplying by \\(t_j\\) raises \\(\\alpha_j\\) by one. Dividing the new Dirichlet integral by \\(Z(\\boldsymbol\\alpha)\\) and using Gamma recurrence gives the following formulas, valid also for the slack index \\(j=n+1\\):"
        },
        {
          "kind": "math",
          "latex": "\\mathbb E[t_j]=\\frac{\\alpha_j}{\\alpha_0},\\qquad \\mathbb E[t_j^2]=\\frac{\\alpha_j(\\alpha_j+1)}{\\alpha_0(\\alpha_0+1)},\\qquad \\mathbb E[t_i t_j]=\\frac{\\alpha_i\\alpha_j}{\\alpha_0(\\alpha_0+1)}\\quad(i\\ne j)."
        },
        {
          "kind": "prose",
          "text": "The numerator shift contributes \\(\\Gamma(\\alpha_j+1)/\\Gamma(\\alpha_j)=\\alpha_j\\), and the total parameter shifts too. For a second power it contributes two successive factors; for two distinct coordinates it contributes one from each. Because each coordinate lies between 0 and 1, these moments are integrable once the mass is. As a check, \\(\\sum_{j=1}^{n+1}\\mathbb E[t_j]=1\\). A linear scaling back to the original region must also scale the requested coordinate, not just the mass."
        }
      ]
    },
    {
      "id": "gaussian-normalization",
      "title": "Positive definiteness is the convergence condition",
      "body": [
        {
          "kind": "prose",
          "text": "Let \\(A\\) be a real symmetric \\(n\\times n\\) matrix. Here positive definite means \\(\\mathbf x^{\\mathsf T}A\\mathbf x>0\\) for every nonzero real \\(\\mathbf x\\). The symmetric-matrix theorem from the linear algebra bridge gives an orthogonal matrix \\(Q\\) and real eigenvalues \\(\\lambda_j\\) with \\(A=Q\\operatorname{diag}(\\lambda_1,\\ldots,\\lambda_n)Q^{\\mathsf T}\\). Positive definiteness is equivalent to every \\(\\lambda_j>0\\), since in the new coordinates the form is \\(\\sum_j\\lambda_j y_j^2\\)."
        },
        {
          "kind": "prose",
          "text": "First, from \\(u=x^2\\) on the positive half-line and \\(\\Gamma(1/2)=\\sqrt\\pi\\),"
        },
        {
          "kind": "math",
          "latex": "\\int_{\\mathbb R}e^{-x^2}\\,\\mathrm dx=\\Gamma(1/2)=\\sqrt\\pi,\\qquad \\int_{\\mathbb R}x^2e^{-x^2}\\,\\mathrm dx=\\Gamma(3/2)=\\frac{\\sqrt\\pi}{2}."
        },
        {
          "kind": "prose",
          "text": "Now suppose \\(A\\) is positive definite and the region is the entire \\(\\mathbb R^n\\). Put \\(\\mathbf y=Q^{\\mathsf T}\\mathbf x\\), then \\(u_j=\\sqrt{\\lambda_j}y_j\\). Both maps are bijective, and the inverse volume factor is \\(\\prod_j\\lambda_j^{-1/2}=1/\\sqrt{\\det A}\\). Tonelli and the one-variable integrals give"
        },
        {
          "kind": "math",
          "latex": "Z_A=\\int_{\\mathbb R^n}e^{-\\mathbf x^{\\mathsf T}A\\mathbf x}\\,\\mathrm d\\mathbf x=\\frac{\\pi^{n/2}}{\\sqrt{\\det A}}."
        },
        {
          "kind": "prose",
          "text": "The positivity hypothesis is necessary for this real symmetric whole-space problem. If some \\(\\lambda_j\\le0\\), its one-variable factor \\(e^{-\\lambda_j y_j^2}\\ge1\\) has infinite integral. Restrict all other coordinates to \\([-1,1]\\), where their positive factors have a positive lower bound; the integral over this slab already diverges. This is a positive-volume argument, not a claim based only on one line of zero volume. A positive determinant alone is insufficient: \\(A=-I\\) in dimension two has determinant 1 but a divergent integral."
        }
      ]
    },
    {
      "id": "gaussian-second-moments",
      "title": "The exponent convention determines the covariance factor",
      "body": [
        {
          "kind": "prose",
          "text": "Normalize the positive-definite whole-space weight by \\(\\rho_A(\\mathbf x)=e^{-\\mathbf x^{\\mathsf T}A\\mathbf x}/Z_A\\). In the \\(\\mathbf u\\) coordinates above it becomes \\(\\pi^{-n/2}e^{-\\sum u_j^2}\\). Odd coordinate moments vanish by reflection. The one-variable second moment is \\(1/2\\), and products of two different coordinates have zero average."
        },
        {
          "kind": "prose",
          "text": "These signed integrations are legitimate: absolute first and second coordinate moments factor into finite Gamma integrals, and \\(2|u_i u_j|\\le u_i^2+u_j^2\\). The finite linear transformation back to \\(\\mathbf x\\) therefore preserves absolute moment integrability. Multiplying the coordinate formulas gives"
        },
        {
          "kind": "math",
          "latex": "\\mathbb E[\\mathbf x]=0,\\qquad \\mathbb E[\\mathbf x\\mathbf x^{\\mathsf T}]=\\frac12Q\\operatorname{diag}(\\lambda_1^{-1},\\ldots,\\lambda_n^{-1})Q^{\\mathsf T}=\\frac12A^{-1}."
        },
        {
          "kind": "prose",
          "text": "The matrix on the left has entries \\(\\mathbb E[x_i x_j]\\). It is the covariance matrix because the mean is zero; in general covariance uses \\(\\mathbb E[(x_i-\\mu_i)(x_j-\\mu_j)]\\), where \\(\\mu_i=\\mathbb E[x_i]\\). The notation \\(A^{-1}\\) denotes the inverse matrix, satisfying \\(AA^{-1}=I\\). Translating \\(\\mathbf x\\) to \\(\\mathbf x-\\boldsymbol\\mu\\) leaves mass and centered moments unchanged and gives mean \\(\\boldsymbol\\mu\\)."
        },
        {
          "kind": "prose",
          "text": "If the exponent is instead \\(-\\mathbf x^{\\mathsf T}A\\mathbf x/2\\), replace \\(A\\) by \\(A/2\\): the mass becomes \\((2\\pi)^{n/2}/\\sqrt{\\det A}\\), and covariance is \\(A^{-1}\\). Always read the coefficient in the exponent before identifying a precision or covariance matrix."
        }
      ]
    },
    {
      "id": "tier-relevance",
      "title": "What these bridges supply to each difficulty group",
      "body": [
        {
          "kind": "prose",
          "text": "Easy rectangular iteration and elementary derivatives are incoming foundations. Medium multivariable integration and Jacobians are extended here to a three-dimensional simplex and linear whole-space changes. Hard integration gains a concrete use of Beta and Gamma constants, while Hard coordinate work gains singular-face and positive-definiteness checks. For Olympiad multivariable structure and moment concepts, the Dirichlet and Gaussian formulas are direct tools with proofs and normalized moments. They do not establish a spherical surface reduction, a matrix-cone Jacobian, entropy optimality, eigenvalue inequalities or general geometric multiplicity. Those problems need their additional bridges."
        }
      ]
    }
  ],
  "worked": [
    {
      "id": "weighted-triangle-mass-and-mean",
      "revision": 1,
      "title": "A singular triangular weight and its normalized coordinate mean",
      "problem": [
        {
          "kind": "prose",
          "text": "Let \\(D=\\{(x,y):x>0,\\ y>0,\\ x+2y<2\\}\\), with weight \\(w(x,y)=x^{-1/2}y\\). Find its mass \\(Z=\\iint_Dw\\,\\mathrm dA\\) and the weighted mean of \\(x\\). Justify convergence."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Put \\(x=2u\\), \\(y=v\\). The new region is \\(\\Delta_2\\), the absolute Jacobian is 2, and \\(w\\,\\mathrm dA=\\sqrt2\\,u^{-1/2}v\\,\\mathrm du\\,\\mathrm dv\\). Thus the three parameters, including slack, are \\((1/2,2,1)\\), all positive. This proves convergence even though the original weight is unbounded near part of \\(x=0\\)."
        },
        {
          "kind": "math",
          "latex": "Z=\\sqrt2\\frac{\\Gamma(1/2)\\Gamma(2)\\Gamma(1)}{\\Gamma(7/2)}=\\frac{8\\sqrt2}{15}."
        },
        {
          "kind": "math",
          "latex": "\\mathbb E[x]=2\\mathbb E[u]=2\\frac{1/2}{7/2}=\\frac27,\\qquad \\iint_Dxw\\,\\mathrm dA=Z\\mathbb E[x]=\\frac{16\\sqrt2}{105}."
        },
        {
          "kind": "prose",
          "text": "For a separate slice check, integrate \\(y\\) from 0 to \\(1-x/2\\): \\(Z=\\frac12\\int_0^2x^{-1/2}(1-x/2)^2\\,\\mathrm dx\\). With \\(x=2u\\), this is \\(\\frac{\\sqrt2}{2}B(1/2,3)=8\\sqrt2/15\\). For the raw first moment, replace \\(x^{-1/2}\\) by \\(x^{1/2}\\), giving \\(\\sqrt2 B(3/2,3)=16\\sqrt2/105\\). Their ratio is \\(2/7\\), inside the actual coordinate range \\((0,2)\\)."
        }
      ],
      "verification": [
        "Author self-check: region, singular exponents, absolute determinant and Gamma ratios.",
        "Author second route: original-coordinate slices compute mass and raw first moment separately."
      ]
    },
    {
      "id": "shifted-correlated-gaussian",
      "revision": 1,
      "title": "Normalize a translated Gaussian and recover a mixed centered moment",
      "problem": [
        {
          "kind": "prose",
          "text": "On \\(\\mathbb R^2\\), let \\(w(x,y)=e^{-[3(x-1)^2+4(x-1)(y+2)+2(y+2)^2]}\\). Find its mass, its normalized density, its mean vector and \\(\\mathbb E[(x-1)(y+2)]\\) for that density."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Set \\(u=x-1\\), \\(v=y+2\\). The quadratic form is \\(q=3u^2+4uv+2v^2=u^2+2(u+v)^2\\), strictly positive for nonzero \\((u,v)\\). Its symmetric matrix is \\(A=\\begin{pmatrix}3&2\\\\2&2\\end{pmatrix}\\), with determinant 2. The cross coefficient is twice its off-diagonal entry."
        },
        {
          "kind": "math",
          "latex": "Z=\\frac\\pi{\\sqrt2},\\qquad \\rho(x,y)=\\frac{\\sqrt2}{\\pi}e^{-q},\\qquad \\mathbb E[(x,y)]=(1,-2)."
        },
        {
          "kind": "prose",
          "text": "For a direct moment calculation, use \\(z=u\\), \\(s=\\sqrt2(u+v)\\). The inverse is \\(u=z\\), \\(v=s/\\sqrt2-z\\), with absolute determinant \\(1/\\sqrt2\\), and the whole plane maps onto the whole plane. Its normalized density is \\(\\pi^{-1}e^{-(z^2+s^2)}\\). Reflection and the one-variable second moment give \\(\\mathbb E[z]=\\mathbb E[s]=\\mathbb E[zs]=0\\) and \\(\\mathbb E[z^2]=1/2\\), so"
        },
        {
          "kind": "math",
          "latex": "\\mathbb E[(x-1)(y+2)]=\\mathbb E[uv]=\\frac{\\mathbb E[zs]}{\\sqrt2}-\\mathbb E[z^2]=-\\frac12."
        },
        {
          "kind": "prose",
          "text": "Absolute integrability follows from \\(|zs|\\le(z^2+s^2)/2\\) and the finite Gaussian second moments. As a matrix check, \\(\\frac12A^{-1}=\\begin{pmatrix}1/2&-1/2\\\\-1/2&3/4\\end{pmatrix}\\). Its off-diagonal entry agrees, and translating does not change this centered covariance."
        }
      ],
      "verification": [
        "Author self-check: square completion, inverse shear-scale map, positive Jacobian and exact mixed-moment expansion.",
        "Author second route: inverse-matrix covariance with the correct factor 1/2."
      ]
    }
  ],
  "contrast": [
    {
      "kind": "prose",
      "text": "The simplex condition is a sum constraint, not independent bounds. Replacing \\(\\Delta_2\\) by \\((0,1)^2\\) generally changes the integral. Also, no slack factor means slack exponent zero and parameter 1; using parameter zero would invent a divergent boundary weight."
    },
    {
      "kind": "prose",
      "text": "The whole-space Gaussian formula cannot be applied unchanged on a quadrant. For the quadratic \\(q(x,y)=(x+y)^2+y^2\\), the substitution \\(u=x+y\\), \\(v=y\\) sends \\(x,y>0\\) to \\(u>v>0\\), not to the entire plane. The transformed wedge must still be integrated. A nonzero determinant does not erase the region."
    },
    {
      "kind": "prose",
      "text": "At a nonpositive eigenvalue the failure is divergence, not a choice of square-root branch for the determinant. For example \\(e^{-(x+y)^2}\\) has a whole undamped direction; in coordinates \\((x+y,y)\\), the integral includes \\(\\int_{\\mathbb R}1\\,\\mathrm dy\\)."
    }
  ],
  "mistakes": [
    "Omitting the slack parameter or treating it as an independent extra integration variable.",
    "Using a normalized moment formula for an unnormalized raw integral.",
    "Forgetting to scale the requested coordinate when rescaling a simplex.",
    "Taking the square root of a determinant before proving positive definiteness.",
    "Putting the full mixed-term coefficient in both off-diagonal matrix entries.",
    "Using covariance A inverse for an exponent without the conventional one-half.",
    "Rotating or shearing an integrand while leaving a restricted region unchanged.",
    "Claiming divergence only from behavior on a single zero-volume line."
  ],
  "exercises": [
    {
      "id": "tetrahedron-slack-moment",
      "revision": 1,
      "title": "A three-dimensional slack weight and a normalized mean",
      "problem": [
        {
          "kind": "prose",
          "text": "On \\(D=\\{(x,y,z):x,y,z>0,\\ x+y+z<1\\}\\), let \\(w(x,y,z)=xy(1-x-y-z)^2\\). Compute \\(\\iiint_Dw\\,\\mathrm dV\\) and the normalized weighted mean of \\(z\\). Verify the mass by integrating \\(z\\) first."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "There are four positive quantities: \\(x,y,z\\), and the slack \\(1-x-y-z\\). Add one to each of their powers to identify the parameters."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "The parameters are \\((2,2,1,3)\\), whose sum is 8. The third coordinate has parameter 1 even though no factor of \\(z\\) is printed."
          }
        ],
        [
          {
            "kind": "math",
            "latex": "\\int_0^{1-x-y}(1-x-y-z)^2\\,\\mathrm dz=\\frac{(1-x-y)^3}{3}."
          }
        ]
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "The parameters \\((2,2,1,3)\\) are positive. The weight is also bounded on the closed simplex, so the ordinary integral is finite. Dirichlet integration gives"
        },
        {
          "kind": "math",
          "latex": "Z=\\frac{\\Gamma(2)\\Gamma(2)\\Gamma(1)\\Gamma(3)}{\\Gamma(8)}=\\frac{2}{7!}=\\frac1{2520},\\qquad \\mathbb E[z]=\\frac18."
        },
        {
          "kind": "prose",
          "text": "To verify the mass by successive slices, integrate \\(z\\) first as in the hint. With \\(0<x<1\\), the remaining \\(y\\)-integral is"
        },
        {
          "kind": "math",
          "latex": "\\int_0^{1-x}y(1-x-y)^3\\,\\mathrm dy=(1-x)^5 B(2,4)=\\frac{(1-x)^5}{20}."
        },
        {
          "kind": "math",
          "latex": "Z=\\frac1{60}\\int_0^1x(1-x)^5\\,\\mathrm dx=\\frac1{60}B(2,6)=\\frac1{2520}."
        },
        {
          "kind": "prose",
          "text": "Raising the \\(z\\) parameter to 2 gives the raw first moment \\(\\Gamma(2)\\Gamma(2)\\Gamma(2)\\Gamma(3)/\\Gamma(9)=1/20160\\). Dividing by \\(Z\\) verifies the mean \\(1/8\\). The mass and the mean are different requested objects."
        }
      ],
      "verification": [
        "Author self-check: all four parameters, finite mass and raw first-moment ratio.",
        "Author second route: explicit z slice and two successive elementary Beta integrals."
      ]
    },
    {
      "id": "gaussian-parameter-threshold",
      "revision": 1,
      "title": "Locate the Gaussian convergence threshold and its second moment",
      "problem": [
        {
          "kind": "prose",
          "text": "For real \\(a\\), determine exactly when \\(Z(a)=\\iint_{\\mathbb R^2}e^{-(ax^2+2xy+2y^2)}\\,\\mathrm dx\\,\\mathrm dy\\) is finite. On that domain, find \\(Z(a)\\) and the normalized average \\(\\mathbb E[x^2]\\). State both values at \\(a=5/2\\)."
        }
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Complete the square in \\(y\\), retaining the coefficient of the remaining \\(x^2\\)."
          }
        ],
        [
          {
            "kind": "math",
            "latex": "ax^2+2xy+2y^2=2(y+x/2)^2+(a-1/2)x^2."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "The shear \\(u=y+x/2\\), \\(v=x\\) maps the plane bijectively with absolute determinant 1. If \\(a-1/2\\le0\\), integrate over \\(-1<u<1\\) and all \\(v\\) to prove divergence."
          }
        ]
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Write \\(b=a-1/2\\). The stated shear gives \\(q=2u^2+bv^2\\). If \\(b>0\\), positive one-variable Gaussian integrals converge, and Tonelli yields"
        },
        {
          "kind": "math",
          "latex": "Z(a)=\\sqrt{\\frac\\pi2}\\sqrt{\\frac\\pi b}=\\frac\\pi{\\sqrt{2a-1}}\\qquad(a>1/2)."
        },
        {
          "kind": "prose",
          "text": "If \\(b=0\\), the \\(v\\) factor is 1; if \\(b<0\\), it is at least 1. On \\(-1<u<1\\) the other factor is at least \\(e^{-2}\\), so the positive integral over that slab is infinite in both cases. Thus \\(a>1/2\\) is necessary and sufficient."
        },
        {
          "kind": "math",
          "latex": "\\mathbb E[x^2]=\\frac{\\int_{\\mathbb R}v^2e^{-bv^2}\\,\\mathrm dv}{\\int_{\\mathbb R}e^{-bv^2}\\,\\mathrm dv}=\\frac{\\sqrt\\pi/(2b^{3/2})}{\\sqrt\\pi/\\sqrt b}=\\frac1{2a-1}."
        },
        {
          "kind": "prose",
          "text": "The numerator identity follows from \\(r=\\sqrt b\\,v\\) and the proved standard second moment; its finiteness justifies the average. At \\(a=5/2\\), \\(Z=\\pi/2\\) and \\(\\mathbb E[x^2]=1/4\\). As a matrix check, \\(A^{-1}=(2a-1)^{-1}\\begin{pmatrix}2&-1\\\\-1&a\\end{pmatrix}\\), so one-half of its first diagonal entry gives the same second moment."
        }
      ],
      "verification": [
        "Author self-check: square completion and positive-volume divergence argument at and below the exact threshold.",
        "Author second route: finite scaled Gamma moment and inverse-matrix entry agree."
      ]
    }
  ],
  "alternatives": [
    {
      "kind": "prose",
      "text": "Repeated slices can evaluate integer simplex powers without matrix or probability notation. For a small quadratic form, completing squares often avoids finding eigenvectors and exposes convergence immediately. Orthogonal diagonalization supplies the finite-dimensional general formula, while a direct shear provides a useful independent calculation in two dimensions."
    },
    {
      "kind": "prose",
      "text": "The simplex formula can support power-coordinate volume calculations after every branch and Jacobian is established. Gaussian normalization can support spherical homogeneity or covariance arguments after the relevant geometric or probabilistic step is proved. This lesson stops before those reductions: logarithmic parameter moments, matrix-cone measure, spherical area elements, entropy optimization, spectral bounds and geometric multiplicity require separate instruction."
    }
  ],
  "related": [
    "multiple-integrals",
    "coordinates",
    "linear-algebra",
    "beta-gamma",
    "multi-constraints",
    "parameter-integrals"
  ],
  "next": [],
  "references": [
    {
      "sourceId": "dlmf",
      "url": "https://dlmf.nist.gov/5.14#E2",
      "use": "reference-only"
    },
    {
      "sourceId": "dlmf",
      "url": "https://dlmf.nist.gov/1.5#vi",
      "use": "reference-only"
    },
    {
      "sourceId": "mathworld",
      "url": "https://mathworld.wolfram.com/GaussianIntegral.html",
      "use": "reference-only"
    },
    {
      "sourceId": "mathworld",
      "url": "https://mathworld.wolfram.com/PositiveDefiniteMatrix.html",
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
