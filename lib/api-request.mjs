export class ApiRequestError extends Error {
 constructor(message,status,code){super(message);this.status=status;this.code=code;}
}
const retryMessage='The request could not be completed. Please retry.';
const accountError=()=>new ApiRequestError('Your signed-in account changed. Refresh before continuing.',401,'SIGN_IN');

// One deadline covers authentication, transport and reading the response. A
// non-abortable token promise may settle later, but cannot send a late request.
export function createApiRequest({currentUser,fetch:send=globalThis.fetch,timeoutMs=resource=>['questions','rounds'].includes(resource)?85000:30000,setTimer=setTimeout,clearTimer=clearTimeout}){
 return async function apiRequest(resource,body,expectedUid){
  const user=currentUser();
  if(!user)throw new ApiRequestError('Please sign in.',401,'SIGN_IN');
  const uid=user.uid;
  if(expectedUid!==undefined&&uid!==expectedUid)throw accountError();
  const controller=new AbortController();let timer;
  const check=()=>{if(controller.signal.aborted)throw new ApiRequestError(retryMessage,408,'REQUEST_TIMEOUT');if(currentUser()?.uid!==uid)throw accountError();};
  const deadline=new Promise((_,reject)=>{timer=setTimer(()=>{controller.abort();reject(new ApiRequestError('The request took too long. Please retry.',408,'REQUEST_TIMEOUT'));},timeoutMs(resource));});
  const operation=(async()=>{
   const serialized=JSON.stringify(body),token=await user.getIdToken();check();
   const response=await send(`/api/${resource}`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:serialized,signal:controller.signal});check();
   const payload=await response.json().catch(()=>null);check();
   if(!response.ok||!payload||typeof payload!=='object'||Array.isArray(payload)){
    // Server validation messages are authored by this application's public API;
    // upstream failures and malformed responses always receive fixed copy.
    const message=response.status>=400&&response.status<500&&typeof payload?.error==='string'&&payload.error.length<=400?payload.error:retryMessage;
    throw new ApiRequestError(message,response.status,typeof payload?.code==='string'?payload.code:undefined);
   }
   return payload;
  })();
  try{return await Promise.race([operation,deadline]);}
  catch(error){if(error instanceof ApiRequestError)throw error;throw new ApiRequestError(retryMessage,503,'REQUEST_FAILED');}
  finally{clearTimer(timer);}
 };
}
