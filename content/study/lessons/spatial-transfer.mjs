// Original author exercise-only amendment; no existing parent content changed.
export const spatialTransfer={
  "id": "bounded-half-hemisphere-two-coordinates",
  "revision": 1,
  "title": "One bounded solid in two coordinate systems",
  "problem": [
    {
      "kind": "prose",
      "text": String.raw`Let \(E=\{(x,y,z):x^2+y^2+z^2\le4,\ y\ge0,\ z\ge0\}\). Compute its volume and the average value of \(z\) over \(E\). Set up and evaluate both a cylindrical and a spherical description of the same volume, and explain the coordinate ranges, Jacobians and exceptional boundary sets.`
    }
  ],
  "solution": [
    {
      "kind": "prose",
      "text": String.raw`Define cylindrical coordinates by \(x=r\cos\theta\), \(y=r\sin\theta\), keeping \(z\) as height. Apart from the axis, \(y\ge0\) chooses \(0\le\theta\le\pi\); the sphere and nonnegative height give \(0\le r\le2\) and \(0\le z\le\sqrt{4-r^2}\). The absolute volume factor is \(r\). Thus`
    },
    {
      "kind": "math",
      "latex": String.raw`V=\int_0^\pi\int_0^2\int_0^{\sqrt{4-r^2}}r\,\mathrm dz\,\mathrm dr\,\mathrm d\theta=\pi\int_0^2r\sqrt{4-r^2}\,\mathrm dr=\frac{8\pi}{3}.`
    },
    {
      "kind": "prose",
      "text": String.raw`For spherical coordinates, let \(\rho\) be distance from the origin, \(\theta\) the same azimuth, and \(\phi\) inclination from the positive vertical axis. Then \(0\le\rho\le2\), \(0\le\theta\le\pi\), \(0\le\phi\le\pi/2\), and the absolute volume factor is \(\rho^2\sin\phi\).`
    },
    {
      "kind": "math",
      "latex": String.raw`V=\int_0^\pi\int_0^{\pi/2}\int_0^2\rho^2\sin\phi\,\mathrm d\rho\,\mathrm d\phi\,\mathrm d\theta=\pi\cdot1\cdot\frac83=\frac{8\pi}{3}.`
    },
    {
      "kind": "prose",
      "text": String.raw`The first moment about the xy-plane for unit density includes the integrand \(z=\rho\cos\phi\), so`
    },
    {
      "kind": "math",
      "latex": String.raw`M_{xy}=\iiint_E z\,\mathrm dV=\pi\left(\int_0^2\rho^3\,\mathrm d\rho\right)\left(\int_0^{\pi/2}\cos\phi\sin\phi\,\mathrm d\phi\right)=\pi\cdot4\cdot\frac12=2\pi,\qquad z_{\mathrm{avg}}=\frac{M_{xy}}{V}=\frac34.`
    },
    {
      "kind": "prose",
      "text": String.raw`The cylindrical calculation independently gives \(M_{xy}=(\pi/2)\int_0^2 r(4-r^2)\,\mathrm dr=2\pi\). The solid and both integrands are bounded, and the original functions 1 and \(z\) are continuous. The coordinate maps are one-to-one on the interiors after excluding the axis/poles and angular boundary surfaces; those exceptional sets have zero volume, so restoring them does not change these proper integrals. No angular interval wraps around twice. As a volume check, the conditions on \(y\) and \(z\) select one quarter of the radius-2 ball, giving \((1/4)(4\pi/3)2^3=8\pi/3\).`
    }
  ],
  "verification": [
    "Author self-check only: exact finite identities, inequality directions and endpoint cases; independent mathematical/exposure review remains pending."
  ],
  "hints": [
    [
      {
        "kind": "prose",
        "text": "The two sign restrictions select half of the azimuth directions and the upper half of the inclination directions. State what each angle measures before choosing its range."
      }
    ],
    [
      {
        "kind": "prose",
        "text": String.raw`In cylindrical coordinates the upper height is \(\sqrt{4-r^2}\). In spherical coordinates the outer radius is 2 and \(z=\rho\cos\phi\). Include the volume factor in each setup.`
      }
    ],
    [
      {
        "kind": "math",
        "latex": String.raw`0\le\theta\le\pi,\quad0\le\phi\le\pi/2,\quad0\le\rho\le2,\qquad z_{\mathrm{avg}}=\frac{\iiint_E z\,\mathrm dV}{\iiint_E1\,\mathrm dV}.`
      }
    ]
  ]
};
