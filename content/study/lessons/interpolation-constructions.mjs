export default {
  "id": "interpolation-constructions",
  "revision": 1,
  "title": "Polynomial interpolation from rational data and repeated conditions",
  "summary": "Turn rational sample values into polynomial zeros, use degree and divisibility to determine the remaining coefficients, and recover values or derivatives while respecting repeated conditions.",
  "objectives": [
    "Prove why distinct sample values determine at most one polynomial of the stated degree, and construct one by finite interpolation.",
    "Choose a polynomial residual from rational data and calculate how many coefficients remain after factoring its known zeros.",
    "Use denominator roots or polynomial remainders to determine those coefficients without evaluating a rational function outside its domain.",
    "Translate matching values and first derivatives into double roots, then verify the constructed polynomial against every original condition."
  ],
  "prerequisites": [
    "algebra",
    "higher-derivatives"
  ],
  "readiness": [
    {
      "lessonId": "algebra",
      "exerciseId": "rational-equality",
      "prompt": "Solve the rational equation while retaining both excluded points, then check each candidate in the original domain."
    },
    {
      "lessonId": "higher-derivatives",
      "exerciseId": "vanishing-polynomial-factor",
      "prompt": "Explain which product-rule terms vanish at the specified point and which differentiated factor leaves a surviving term."
    }
  ],
  "sections": [
    {
      "id": "roots-and-degree",
      "title": "Polynomial zeros, factors and the degree bound",
      "body": [
        {
          "kind": "prose",
          "text": "All polynomials and nodes in this lesson are real. A node is a point where a value, or a value and derivative, is prescribed. Begin with a polynomial fact: if \\(R(a)=0\\), then \\(x-a\\) divides \\(R(x)\\). For every integer \\(k\\ge1\\),"
        },
        {
          "kind": "math",
          "latex": "x^k-a^k=(x-a)\\sum_{j=0}^{k-1}x^{k-1-j}a^j."
        },
        {
          "kind": "prose",
          "text": "Apply this finite identity to each term of \\(R(x)-R(a)\\). The result is a polynomial multiple of \\(x-a\\); when \\(R(a)=0\\), it is \\(R\\) itself. This proves the factor theorem without assuming a formula for the roots."
        },
        {
          "kind": "prose",
          "text": "Distinct roots give distinct factors. If \\(R=(x-a)Q\\) and \\(R(b)=0\\) with \\(b\\ne a\\), then \\((b-a)Q(b)=0\\), so \\(Q(b)=0\\). Repeating the argument factors out every distinct prescribed root. Therefore a nonzero polynomial of degree at most \\(d\\) has at most \\(d\\) distinct roots. The zero polynomial is the exception: it vanishes everywhere and must be kept as a separate possibility."
        },
        {
          "kind": "prose",
          "text": "If two polynomials of degree at most \\(d\\) have the same values at \\(d+1\\) distinct nodes, their difference has too many roots to be nonzero. This proves uniqueness. It does not yet construct the polynomial."
        }
      ]
    },
    {
      "id": "finite-interpolation",
      "title": "Construct a polynomial from distinct samples",
      "body": [
        {
          "kind": "prose",
          "text": "Let \\(d\\ge0\\) be an integer, let \\(x_0,\\ldots,x_d\\) be distinct real nodes, and prescribe real values \\(v_0,\\ldots,v_d\\). Define"
        },
        {
          "kind": "math",
          "latex": "L_j(x)=\\prod_{\\substack{0\\le k\\le d\\\\ k\\ne j}}\\frac{x-x_k}{x_j-x_k},\\qquad P(x)=\\sum_{j=0}^{d}v_jL_j(x)."
        },
        {
          "kind": "prose",
          "text": "Every denominator is nonzero. At \\(x_j\\), all factors in \\(L_j\\) equal 1; at any other node, one numerator factor is zero. Hence \\(P(x_j)=v_j\\) and \\(P\\) has degree at most \\(d\\). For \\(d=0\\), the empty product is 1 and the construction is the constant polynomial. Together with the root argument, this establishes existence and uniqueness for distinct value data."
        },
        {
          "kind": "prose",
          "text": "This is finite Lagrange interpolation. It is a useful fallback when no simpler structure appears in the data. If the samples come from a rational function, a polynomial residual can expose the needed derivative with less expansion. Neither finite interpolation nor agreement at finitely many points proves that the original function equals the polynomial everywhere, or that the polynomial is a good approximation away from the nodes."
        }
      ]
    },
    {
      "id": "rational-residual",
      "title": "Clear the denominator and count the remaining coefficients",
      "body": [
        {
          "kind": "prose",
          "text": "Suppose \\(q\\) is a polynomial of degree \\(e\\ge1\\), and \\(N\\) is zero or is a polynomial of degree less than \\(e\\). Let \\(f=N/q\\), using only nodes where \\(q\\ne0\\). If a polynomial \\(P\\) of degree at most \\(d\\) agrees with \\(f\\) at \\(d+1\\) distinct nodes, define"
        },
        {
          "kind": "math",
          "latex": "R(x)=q(x)P(x)-N(x),\\qquad W(x)=\\prod_{j=0}^{d}(x-x_j)."
        },
        {
          "kind": "prose",
          "text": "The rational equalities become \\(R(x_j)=0\\). Also \\(R\\) is zero or has degree at most \\(d+e\\). The root factors therefore give"
        },
        {
          "kind": "math",
          "latex": "R=WS,\\qquad S=0\\ \\text{or}\\ \\deg S\\le e-1,\\qquad qP=N+WS."
        },
        {
          "kind": "prose",
          "text": "The denominator degree controls the remaining freedom. A linear denominator leaves a constant \\(S\\); a quadratic denominator can leave a linear \\(S\\). Replacing \\(S\\) by a constant in every case would discard possible solutions. The strict degree condition on \\(N\\) is a sufficient assumption for this count. For a larger numerator, first perform polynomial division or recalculate the degree bound; do not reuse it unchanged."
        },
        {
          "kind": "prose",
          "text": "To determine \\(S\\), require \\(N+WS\\) to be divisible by \\(q\\). Polynomial division repeatedly subtracts a multiple of \\(q\\) that cancels the current highest power. It stops with a remainder of degree below \\(e\\), or zero. The quotient and remainder are unique: the difference of two proposed remainders cannot be a nonzero multiple of \\(q\\) while having smaller degree. Setting the remainder to zero supplies at most \\(e\\) coefficient equations."
        },
        {
          "kind": "prose",
          "text": "For \\(q=x^2+1\\), remainder calculations can replace \\(x^2\\) by \\(-1\\), because their difference \\(x^2+1\\) is divisible by \\(q\\). This is a rule for polynomial remainders, not an equality satisfied by real \\(x\\). It avoids introducing complex roots."
        },
        {
          "kind": "prose",
          "text": "When \\(q\\) has a real root \\(r\\), the polynomial identity gives \\(R(r)=-N(r)\\). This evaluates a polynomial at \\(r\\), not the undefined rational function \\(f(r)\\). If \\(q(r)=q^{\\prime}(r)=0\\), differentiating the polynomial identity also gives \\(R^{\\prime}(r)=-N^{\\prime}(r)\\). At a simple root, the term \\(q^{\\prime}(r)P(r)\\) need not vanish."
        },
        {
          "kind": "prose",
          "text": "Once the remainder is zero, division produces an actual polynomial \\(P=(N+WS)/q\\), of degree at most \\(d\\). The identity then checks every original value at a nonpole node. The apparent quotient is not a permission to add a forbidden node to the original rational data."
        }
      ]
    },
    {
      "id": "differentiate-the-identity",
      "title": "Recover a derivative at a node",
      "body": [
        {
          "kind": "prose",
          "text": "After establishing an identity of polynomials, differentiate it:"
        },
        {
          "kind": "math",
          "latex": "q^{\\prime}P+qP^{\\prime}-N^{\\prime}=W^{\\prime}S+WS^{\\prime}."
        },
        {
          "kind": "prose",
          "text": "At a simple interpolation node \\(x_j\\), \\(W(x_j)=0\\). In the product rule for \\(W^{\\prime}(x_j)\\), only the term differentiating \\(x-x_j\\) survives. Thus"
        },
        {
          "kind": "math",
          "latex": "W^{\\prime}(x_j)=\\prod_{k\\ne j}(x_j-x_k),"
        },
        {
          "kind": "math",
          "latex": "P^{\\prime}(x_j)=\\frac{W^{\\prime}(x_j)S(x_j)-q^{\\prime}(x_j)P(x_j)+N^{\\prime}(x_j)}{q(x_j)}."
        },
        {
          "kind": "prose",
          "text": "The denominator is nonzero by the original node condition. Keep the \\(q^{\\prime}P\\) term even when the requested answer is only \\(P^{\\prime}\\). No division by \\(P\\), no sign assumption on its values, and no infinite expansion is needed."
        },
        {
          "kind": "prose",
          "text": "One cannot differentiate isolated equalities \\(P(x_j)=f(x_j)\\) to conclude \\(P^{\\prime}(x_j)=f^{\\prime}(x_j)\\). Values at finitely many points do not determine derivatives of an arbitrary function. Here differentiation is justified by the globally valid polynomial identity \\(qP-N=WS\\), established using the degree bound."
        }
      ]
    },
    {
      "id": "repeated-conditions",
      "title": "A matching value and slope create a double factor",
      "body": [
        {
          "kind": "prose",
          "text": "For a polynomial \\(R\\), the conditions \\(R(a)=R^{\\prime}(a)=0\\) are equivalent to divisibility by \\((x-a)^2\\). To see the nontrivial direction, write \\(R=(x-a)Q\\). Then \\(R^{\\prime}(a)=Q(a)\\), so a second factor \\(x-a\\) divides \\(Q\\). The reverse implication follows from the product rule."
        },
        {
          "kind": "prose",
          "text": "If \\(q(a)\\ne0\\), the rational function \\(f=N/q\\) is differentiable near \\(a\\). When \\(P(a)=f(a)\\) and \\(P^{\\prime}(a)=f^{\\prime}(a)\\), differentiating \\(qf=N\\) near that node shows that \\(R=qP-N\\) and \\(R^{\\prime}\\) both vanish there. Thus a value-and-slope condition contributes a double factor. Repeating the same value statement does not supply a slope condition."
        },
        {
          "kind": "prose",
          "text": "Let distinct nodes have either a value condition or a value-and-first-derivative condition. Give each node multiplicity \\(m_j=1\\) or 2 respectively, and put \\(M=\\sum_jm_j\\). Their factors combine to"
        },
        {
          "kind": "math",
          "latex": "W(x)=\\prod_j(x-x_j)^{m_j}."
        },
        {
          "kind": "prose",
          "text": "To justify combining them, remove the factors at one node. At any other node the removed factor is nonzero, so a zero value of the product forces a zero value of the quotient. If the product derivative is also zero, the product rule then forces the quotient derivative to be zero. Continue node by node."
        },
        {
          "kind": "prose",
          "text": "If \\(\\deg P\\le M-1\\) and the proper-numerator assumptions from the previous section hold, \\(R=qP-N=WS\\) again has \\(S=0\\) or \\(\\deg S\\le e-1\\). Two proposed polynomials satisfying all the same value-and-slope data differ by a multiple of the degree-\\(M\\) polynomial \\(W\\), so the degree bound proves uniqueness. In the examples, divisibility explicitly constructs a polynomial and verifies existence. No general theorem about arbitrary patterns of higher-derivative data is being assumed."
        },
        {
          "kind": "prose",
          "text": "The simple-node derivative formula still works at a node whose multiplicity is 1: write \\(W=(x-b)V\\), so \\(W^{\\prime}(b)=V(b)\\), including all repeated factors at the other nodes. At a double node, \\(W^{\\prime}\\) vanishes and the first derivative is already prescribed; use the appropriate differentiated identity for any further quantity."
        }
      ]
    }
  ],
  "worked": [
    {
      "id": "quadratic-denominator",
      "revision": 1,
      "title": "Three samples with a quadratic denominator",
      "problem": [
        {
          "kind": "prose",
          "text": "Let \\(P\\) have degree at most 2 and agree with \\(f(x)=(2x+1)/(x^2+1)\\) at \\(x=-1,0,2\\). Determine \\(P^{\\prime}(2)\\)."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "The nodes are distinct and the denominator is positive everywhere, so a unique quadratic-or-lower interpolant exists. Set \\(R=(x^2+1)P-(2x+1)\\). Its degree is at most 4 and its three zeros give"
        },
        {
          "kind": "math",
          "latex": "R=W(Ax+B),\\qquad W=x(x+1)(x-2)=x^3-x^2-2x."
        },
        {
          "kind": "prose",
          "text": "The remainder of \\(W\\) on division by \\(x^2+1\\) is \\(1-3x\\). Consequently the remainder of \\(W(Ax+B)\\) is \\((3A+B)+(A-3B)x\\). It must be the remainder of \\(-(2x+1)\\):"
        },
        {
          "kind": "math",
          "latex": "3A+B=-1,\\qquad A-3B=-2,\\qquad A=-\\frac12,\\quad B=\\frac12."
        },
        {
          "kind": "prose",
          "text": "At the requested node, \\(W^{\\prime}(2)=2(2+1)=6\\) and \\(2A+B=-1/2\\). Therefore \\(R^{\\prime}(2)=-3\\). On the other hand, \\(P(2)=1\\), so"
        },
        {
          "kind": "math",
          "latex": "R^{\\prime}(2)=4P(2)+5P^{\\prime}(2)-2=2+5P^{\\prime}(2),"
        },
        {
          "kind": "math",
          "latex": "P^{\\prime}(2)=-1."
        },
        {
          "kind": "prose",
          "text": "As a full check, division gives \\(P(x)=1+x-x^2/2\\). It takes the values \\(-1/2,1,1\\) at \\(-1,0,2\\) respectively, exactly the three rational samples, and its derivative at 2 is \\(-1\\). A direct coefficient system or Lagrange interpolation gives the same polynomial; the residual calculation explains why only two unknown coefficients were needed after factoring."
        }
      ],
      "verification": [
        "Author exact calculations and analytic proof only; independent review and teaching-exposure review pending."
      ]
    },
    {
      "id": "one-repeated-node",
      "revision": 1,
      "title": "A value and slope at one node",
      "problem": [
        {
          "kind": "prose",
          "text": "Let \\(P\\) have degree at most 2 and satisfy \\(P(0)=1/2\\), \\(P^{\\prime}(0)=-1/4\\), and \\(P(1)=1/3\\). These are the value-and-slope data of \\(f(x)=1/(x+2)\\) at 0 and its value at 1. Find \\(P(2)\\)."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "Use \\(R=(x+2)P-1\\). The two conditions at zero imply \\(R(0)=R^{\\prime}(0)=0\\), and the value at 1 gives \\(R(1)=0\\). Since the residual has degree at most 3,"
        },
        {
          "kind": "math",
          "latex": "R(x)=C x^2(x-1)."
        },
        {
          "kind": "prose",
          "text": "Evaluate this polynomial identity at \\(-2\\). Its defining expression gives \\(R(-2)=-1\\), while \\((-2)^2(-2-1)=-12\\), hence \\(C=1/12\\). No value of \\(f(-2)\\) is used. At 2,"
        },
        {
          "kind": "math",
          "latex": "4P(2)-1=\\frac1{12}\\,2^2(2-1)=\\frac13,\\qquad P(2)=\\frac13."
        },
        {
          "kind": "prose",
          "text": "Dividing the identity gives \\(P(x)=1/2-x/4+x^2/12\\). This verifies both supplied values and the supplied derivative, so existence is established. If another degree-at-most-2 polynomial satisfied the conditions, their difference would have the three factors \\(x^2(x-1)\\) and would therefore be zero. Alternatively, the constant and linear coefficients of \\(P\\) are fixed immediately by the data at zero, leaving its quadratic coefficient to be determined at 1."
        }
      ],
      "verification": [
        "Author exact calculations and analytic proof only; independent review and teaching-exposure review pending."
      ]
    }
  ],
  "contrast": [
    {
      "kind": "prose",
      "text": "Without a degree bound, the distinct values do not determine a unique polynomial: if \\(P\\) fits the nodes and \\(W\\) is their product of factors, then \\(P+cW\\) fits them for every real \\(c\\). For value-and-slope data, use the corresponding product with double factors."
    },
    {
      "kind": "prose",
      "text": "A degree bound can also be too small for existence. No polynomial of degree at most 1 takes values 0, 1, 0 at \\(-1,0,1\\): a nonzero linear polynomial cannot have the two outer zeros, and the zero polynomial fails the middle value. The quadratic \\(1-x^2\\) does fit."
    },
    {
      "kind": "prose",
      "text": "Asking twice for \\(P(0)=0\\) gives only one condition. The polynomial \\(P(x)=x\\) satisfies it but has \\(P^{\\prime}(0)=1\\), so a double factor cannot be inferred. Asking simultaneously for \\(P(0)=0\\) and \\(P(0)=1\\) is inconsistent."
    },
    {
      "kind": "prose",
      "text": "A node with \\(q(x_j)=0\\) is outside the domain of the displayed rational formula. Even if numerator and denominator share a factor, a value at the removed point requires a separately specified extension. Evaluating a residual polynomial there does not define that missing sample."
    },
    {
      "kind": "prose",
      "text": "An equality of sample values cannot be differentiated. For example, \\(P(x)=0\\) and \\(g(x)=x(x-1)\\) agree at 0 and 1, but \\(P^{\\prime}(0)=0\\) and \\(g^{\\prime}(0)=-1\\)."
    },
    {
      "kind": "prose",
      "text": "With a quadratic denominator, setting \\(R=CW\\) may fail. In the first example, it would require both \\(C=-1\\) and \\(-3C=-2\\) from the remainder, which is impossible. The extra linear term in \\(S\\) is required by the degree count."
    }
  ],
  "mistakes": [
    "Factoring the sample zeros before checking the residual degree, or forgetting that the residual could be zero.",
    "Using a constant multiplier when the denominator degree allows a higher-degree residual quotient.",
    "Treating a remainder substitution such as \\(x^2\\mapsto-1\\) as an identity for real inputs.",
    "Evaluating the original rational function at a denominator root instead of evaluating the polynomial residual.",
    "Dropping \\(q^{\\prime}P\\) when differentiating \\(qP-N\\), or inferring a derivative equality from isolated equal values.",
    "Counting a repeated value statement as a derivative condition, or proving uniqueness without also checking existence."
  ],
  "exercises": [
    {
      "id": "squared-denominator-data",
      "revision": 1,
      "title": "Three rational samples and a slope",
      "problem": [
        {
          "kind": "prose",
          "text": "Let \\(P\\) be the polynomial of degree at most 2 with \\(P(0)=1\\), \\(P(1)=1/4\\), and \\(P(3)=1/16\\), the values of \\(f(x)=1/(x+1)^2\\) at those nodes. Determine \\(P^{\\prime}(1)\\), and verify that a polynomial with the stated conditions exists."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "The three nodes are distinct nonpoles. Set \\(R=(x+1)^2P-1\\). Its degree is at most 4, so"
        },
        {
          "kind": "math",
          "latex": "R=W(Ax+B),\\qquad W=x(x-1)(x-3)=x^3-4x^2+3x."
        },
        {
          "kind": "prose",
          "text": "At \\(-1\\), the denominator and its derivative both vanish. Hence the polynomial identity and its derivative give \\(R(-1)=-1\\) and \\(R^{\\prime}(-1)=0\\). Since \\(W(-1)=-8\\) and \\(W^{\\prime}(-1)=14\\),"
        },
        {
          "kind": "math",
          "latex": "-8(B-A)=-1,\\qquad14(B-A)-8A=0,"
        },
        {
          "kind": "math",
          "latex": "A=\\frac7{32},\\qquad B=\\frac{11}{32}."
        },
        {
          "kind": "prose",
          "text": "At 1, \\(W^{\\prime}(1)=1(1-3)=-2\\), so \\(R^{\\prime}(1)=-2(18/32)=-9/8\\). Differentiating the defining identity at 1 gives"
        },
        {
          "kind": "math",
          "latex": "-\\frac98=4P(1)+4P^{\\prime}(1)=1+4P^{\\prime}(1),\\qquad P^{\\prime}(1)=-\\frac{17}{32}."
        },
        {
          "kind": "prose",
          "text": "The resulting polynomial is \\(P(x)=1-31x/32+7x^2/32\\). Substitution gives \\(1,1/4,1/16\\) at the three nodes, and direct differentiation gives the same answer. This supplies existence as well as the uniqueness supplied by three distinct nodes. The extra normalization condition came from the double denominator root, not from a repeated interpolation node."
        }
      ],
      "verification": [
        "Author exact calculations and analytic proof only; independent review and teaching-exposure review pending."
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "Use the rational expression to form a polynomial that vanishes at all three sample points. Compare its maximum degree with the number of known roots."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "For \\(R=(x+1)^2P-1\\), factor \\(x(x-1)(x-3)\\); the remaining factor can be linear. At \\(-1\\), both the denominator and its derivative vanish."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Write \\(R=x(x-1)(x-3)(Ax+B)\\). Determine \\(A,B\\) from \\(R(-1)=-1\\), \\(R^{\\prime}(-1)=0\\), then differentiate the identity at 1, retaining the derivative of \\((x+1)^2\\)."
          }
        ]
      ]
    },
    {
      "id": "two-value-slope-pairs",
      "revision": 1,
      "title": "Two value-and-slope pairs and one further value",
      "problem": [
        {
          "kind": "prose",
          "text": "Let \\(f(x)=x/(x^2+1)\\). A polynomial \\(P\\) of degree at most 4 has the same value and first derivative as \\(f\\) at 0 and 1, and satisfies \\(P(2)=f(2)\\). Determine \\(P^{\\prime}(2)\\) and justify existence and uniqueness of \\(P\\)."
        }
      ],
      "solution": [
        {
          "kind": "prose",
          "text": "The denominator is positive. From \\(f^{\\prime}(x)=(1-x^2)/(x^2+1)^2\\), the conditions are \\(P(0)=0\\), \\(P^{\\prime}(0)=1\\), \\(P(1)=1/2\\), \\(P^{\\prime}(1)=0\\), \\(P(2)=2/5\\). For \\(R=(x^2+1)P-x\\), the value-and-slope pairs give double zeros at 0 and 1, while the remaining value gives a zero at 2. Degree at most 6 therefore implies"
        },
        {
          "kind": "math",
          "latex": "R=W(Ax+B),\\qquad W=x^2(x-1)^2(x-2)."
        },
        {
          "kind": "prose",
          "text": "On division by \\(x^2+1\\), the remainder of \\(W\\) is \\(-2-4x\\). The remainder of \\(W(Ax+B)\\) is \\((4A-2B)+(-2A-4B)x\\), which must equal \\(-x\\). Thus"
        },
        {
          "kind": "math",
          "latex": "4A-2B=0,\\qquad -2A-4B=-1,\\qquad A=\\frac1{10},\\quad B=\\frac15."
        },
        {
          "kind": "prose",
          "text": "At the simple node 2, \\(W^{\\prime}(2)=2^2(2-1)^2=4\\), so \\(R^{\\prime}(2)=4(2/5)=8/5\\). Meanwhile,"
        },
        {
          "kind": "math",
          "latex": "R^{\\prime}(2)=4P(2)+5P^{\\prime}(2)-1=\\frac35+5P^{\\prime}(2),"
        },
        {
          "kind": "math",
          "latex": "P^{\\prime}(2)=\\frac15."
        },
        {
          "kind": "prose",
          "text": "The zero remainder makes \\(P=(x+W(x)(x/10+1/5))/(x^2+1)\\) a polynomial of degree at most 4. The identity verifies its three values; at the two double nodes, \\(R=R^{\\prime}=0\\) and the nonzero denominator also verify the required slopes. Explicit division gives"
        },
        {
          "kind": "math",
          "latex": "P(x)=x-\\frac25x^2-\\frac15x^3+\\frac1{10}x^4."
        },
        {
          "kind": "prose",
          "text": "This polynomial satisfies all five conditions, so existence is checked. The difference of two proposed degree-at-most-4 polynomials would be divisible by the degree-5 polynomial \\(x^2(x-1)^2(x-2)\\); hence the difference is zero. This is uniqueness with multiplicities, not a count of five distinct nodes."
        }
      ],
      "verification": [
        "Author exact calculations and analytic proof only; independent review and teaching-exposure review pending."
      ],
      "hints": [
        [
          {
            "kind": "prose",
            "text": "List the five value or derivative conditions explicitly. Distinguish the two nodes with slope data from the node with value data alone."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "For \\(R=(x^2+1)P-x\\), the first two nodes are double zeros. Factor their multiplicities and the third zero, then use the residual degree to count the remaining coefficients."
          }
        ],
        [
          {
            "kind": "prose",
            "text": "Write \\(R=x^2(x-1)^2(x-2)(Ax+B)\\). The remainder on division by \\(x^2+1\\) must be \\(-x\\). Solve for \\(A,B\\), then differentiate at 2 and use the supplied value \\(P(2)=2/5\\)."
          }
        ]
      ]
    }
  ],
  "alternatives": [
    {
      "kind": "prose",
      "text": "For a small degree, write an undetermined-coefficient polynomial and solve the value-and-slope equations directly. This checks existence and can be faster when the data already fix low-order coefficients."
    },
    {
      "kind": "prose",
      "text": "For distinct values, the finite Lagrange formula always supplies a polynomial. The rational residual makes the denominator structure visible and can avoid expanding the entire interpolant when only one derivative is requested."
    },
    {
      "kind": "prose",
      "text": "A polynomial residual uses roots and degree. A positive exponential factor instead transfers zeros through Rolle’s theorem. Both are auxiliary-function choices, but their hypotheses and uniqueness arguments are different."
    },
    {
      "kind": "prose",
      "text": "Finite coefficient identities and Taylor polynomials share the idea of encoding derivatives. Interpolation data here may occur at several points, and no infinite-series convergence, inversion formula or numerical error estimate follows from the construction alone."
    }
  ],
  "related": [
    "auxiliary-functions",
    "taylor-remainders",
    "generating",
    "strategy-choice"
  ],
  "next": [
    "strategy-choice"
  ],
  "references": [
    {
      "sourceId": "mathworld-polynomial-factor",
      "url": "https://mathworld.wolfram.com/PolynomialFactorTheorem.html",
      "use": "reference-only"
    },
    {
      "sourceId": "nist-dlmf-lagrange",
      "url": "https://dlmf.nist.gov/3.3.i",
      "use": "reference-only"
    },
    {
      "sourceId": "mathworld-hermite",
      "url": "https://mathworld.wolfram.com/HermitesInterpolatingPolynomial.html",
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
