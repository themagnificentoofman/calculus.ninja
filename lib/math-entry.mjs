export const ENTRY_LIMITS=Object.freeze({source:2048,draft:8192,depth:32,commands:384});
const safeCommands=new Set(('frac dfrac tfrac sqrt left right cdot times div pm mp pi infty e ln log exp sin cos tan sec csc cot arcsin arccos arctan sinh cosh tanh arcsinh arccosh arctanh int iint iiint oint sum prod lim to in le leq ge geq ne neq approx sim partial nabla mathrm mathbf mathbb mathcal operatorname text textnormal begin end cases matrix pmatrix bmatrix vmatrix Bmatrix array overline underline vec hat bar dot ddot alpha beta gamma delta epsilon varepsilon zeta eta theta vartheta iota kappa lambda mu nu xi omicron rho varrho sigma tau upsilon phi varphi chi psi omega Gamma Delta Theta Lambda Xi Pi Sigma Upsilon Phi Psi Omega quad qquad lvert rvert vert lVert rVert Vert langle rangle placeholder').split(' '));
/** Independent render gate. A broad palette is not a grading declaration. */
export function entrySafety(source){
 if(typeof source!=='string')return 'Enter mathematical text.';
 if(source.length>ENTRY_LIMITS.source)return 'Preview is paused above 2,048 characters. Shorten the answer; the source is retained.';
 if(/[<>`#$]|[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(source))return 'Preview is paused: use mathematical notation without HTML or control characters.';
 let depth=0,commands=0;for(const c of source){if('({['.includes(c)&&++depth>ENTRY_LIMITS.depth)return 'Preview is paused: use fewer nested groups.';if(')}]'.includes(c))depth--;}
 for(const[,name]of source.matchAll(/\\([A-Za-z]+)/g)){if(++commands>ENTRY_LIMITS.commands)return 'Preview is paused: too many commands.';if(!safeCommands.has(name))return `The \\${name} command is kept as source and will not be rendered.`;}
 for(const[,env]of source.matchAll(/\\(?:begin|end)\{([^}]+)\}/g))if(!['cases','matrix','pmatrix','bmatrix','vmatrix','Bmatrix','array'].includes(env))return 'This environment is kept as source and will not be rendered.';
 return null;
}
export const draftKey=scope=>`cn:math-draft:1:${JSON.stringify([scope.uid,scope.roundId,scope.problemId,scope.problemRevision,scope.contentHash,scope.contractHash,'free-response'])}`;
/** Access to the property itself can throw in blocked/private storage contexts. */
export function browserDraftStorage(){try{return globalThis.localStorage;}catch{return null;}}
export function readDraft(storage,scope){try{const text=storage.getItem(draftKey(scope));if(!text||text.length>24000)return null;const d=JSON.parse(text);if(d.version!==1||typeof d.source!=='string'||d.source.length>ENTRY_LIMITS.draft||!['raw','visual'].includes(d.mode))return null;return d;}catch{return null;}}
export function writeDraft(storage,scope,draft){try{if(typeof draft.source!=='string'||draft.source.length>ENTRY_LIMITS.draft)return false;storage.setItem(draftKey(scope),JSON.stringify({...draft,version:1}));return true;}catch{return false;}}
export function clearDraft(storage,scope){try{storage.removeItem(draftKey(scope));}catch{}}
