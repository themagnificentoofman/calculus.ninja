import {calculusPreparation,corePaths} from './core-paths.mjs';
const vectorPreparation=[
 {lessonId:'linear-algebra',purpose:'Compute dot products, matrix actions and quadratic forms before using derivative matrices.'},
 {lessonId:'multi-local',purpose:'Interpret partial derivatives, gradients and tangent planes before combining changing inputs.'},
 {lessonId:'multi-chain',purpose:'Apply the multivariable chain rule, define derivative matrices and check mixed-partial hypotheses.'},
];
export const multivariablePaths=[
 {id:'multivariable-derivatives-extrema',revision:1,kind:'core',title:'Multivariable derivatives and constrained extrema',
  summary:'Build from partial derivatives and linear approximations to Hessian classification and a complete search for extrema on a planar region.',
  objectives:['Track every changing input and retain nonlinear second-order terms.','Check regularity before using mixed or implicit derivatives.','Compare feasible interior and boundary candidates, including singular cases.'],
  steps:[...calculusPreparation,...vectorPreparation,
   {lessonId:'multi-critical',purpose:'Use the derivative information to classify interior points, study regular constraints and compare the entire boundary.'},
  ],readiness:[
   {lessonId:'multi-chain',exerciseId:'two-input-mixed',prompt:'Keep the nonlinear-coordinate term in a mixed second derivative and check it by expansion.'},
   {lessonId:'multi-chain',exerciseId:'accelerating-curve',prompt:'Distinguish the curvature of the field from acceleration of the path.'},
   {lessonId:'multi-critical',exerciseId:'ellipse-boundary-comparison',prompt:'Find all regular boundary candidates and compare them with the interior point before claiming global extrema.'},
   {lessonId:'multi-critical',exerciseId:'degenerate-fourth-order',prompt:'Use higher-order sign information when the Hessian test is inconclusive.'},
   {lessonId:'multi-critical',exerciseId:'singular-constraint',prompt:'Inspect the whole feasible set when the regular multiplier hypothesis fails.'},
  ],review:{status:'draft'}},
 {id:'double-integrals-coordinate-changes',revision:1,kind:'core',title:'Double integrals and planar coordinate changes',
  summary:'Prepare one-variable integration and convergence, describe regions with explicit bounds, then transform them using a justified planar map.',
  objectives:['Choose an integration order from the same region inequalities.','Check the hypotheses for an improper or signed order exchange.','Track inverse branches, absolute Jacobians and image coverage.'],
  steps:[...corePaths.find(p=>p.id==='integration-methods').steps,
   {lessonId:'multiple-integrals',purpose:'Use one-variable integration on slices and justify when their order may be exchanged.'},
   ...vectorPreparation,
   {lessonId:'coordinates',purpose:'Combine region descriptions with derivative matrices to choose and justify a planar change of variables.'},
  ],readiness:[
   {lessonId:'multiple-integrals',exerciseId:'parabolic-lens',prompt:'Reconstruct both orders from the same region and verify the value independently.'},
   {lessonId:'multiple-integrals',exerciseId:'positive-unbounded-product',prompt:'Use nonnegativity and independent cutoffs to establish the improper integral.'},
   {lessonId:'coordinates',exerciseId:'elliptic-disk-moment',prompt:'Combine scaling with polar coordinates, including the area factor and coverage exceptions.'},
   {lessonId:'coordinates',exerciseId:'folded-rectangle',prompt:'Separate image area, repeated coverage and signed orientation in a folded map.'},
  ],review:{status:'draft'}},
];
