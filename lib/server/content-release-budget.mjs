// Cumulative reservations include the settled predecessor. Only the versioned
// first Milestone 4 combined import carries the owner's November 18 amendment.
export const historicalReleaseBudget=Object.freeze({reads:5000000,writes:1300000,bytes:150000000});
export const m4ReleaseBudget=Object.freeze({
 id:'m4-combined-first-import-2026-11-18',
 projectId:'appgprj_6ad91db3d4788191b3e73074e27447f5',
 priorBundleId:'a2e35e6b320cc7754a4a8e74f590e38189eb12965d7198c4436b9d043e436d15',
 reads:6300000,writes:1400000,bytes:150000000
});
export const m4OperationAllowance=Object.freeze({reads:1150000,writes:185000,bytes:150000000});
