const API='https://benz2026-api.ougaga26.workers.dev';
export async function apiFetch(path:string,init:RequestInit={}){
const isStaff=path==='/api/staff',storage=isStaff?sessionStorage:localStorage,key=isStaff?'benz_staff':'benz_guest';
const headers=new Headers(init.headers),token=storage.getItem(key);if(token)headers.set('Authorization','Bearer '+token);
// Only reads are retried automatically: a failed response to a mutation may already have committed.
const attempts=(!init.method||init.method==='GET')?3:1;
for(let attempt=0;attempt<attempts;attempt++){
try{
const response=await fetch(API+path,{...init,headers,credentials:'omit',signal:init.signal??AbortSignal.timeout(10000)});
const session=response.headers.get('X-Session');if(session==='logout')storage.removeItem(key);else if(session)storage.setItem(key,session);
return response;
}catch(error){if(init.signal?.aborted)throw error;if(attempt===attempts-1)throw new Error('暫時無法連接活動服務，請確認網路後重試。');await new Promise(resolve=>setTimeout(resolve,1000*(attempt+1)));}
}
throw new Error('活動服務連線失敗');
}
