const API='https://benz2026-api.ougaga26.workers.dev';
export async function apiFetch(path:string,init:RequestInit={}){
const isStaff=path==='/api/staff',storage=isStaff?sessionStorage:localStorage,key=isStaff?'benz_staff':'benz_guest';
const headers=new Headers(init.headers),token=storage.getItem(key);if(token)headers.set('Authorization','Bearer '+token);
const response=await fetch(API+path,{...init,headers,credentials:'omit'});
const session=response.headers.get('X-Session');if(session==='logout')storage.removeItem(key);else if(session)storage.setItem(key,session);
return response;
}
