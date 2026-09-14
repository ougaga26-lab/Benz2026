import * as event from '../app/api/event/route';
import * as staff from '../app/api/staff/route';
const allowed='https://ougaga26-lab.github.io';
export default {async fetch(req:Request){
const origin=req.headers.get('Origin');
if(origin!==allowed)return new Response('Forbidden',{status:403});
const cors={'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Expose-Headers':'X-Session','Vary':'Origin','Cache-Control':'no-store'};
if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
const path=new URL(req.url).pathname;const route=path==='/api/event'?event:path==='/api/staff'?staff:null;
if(!route||!['GET','POST'].includes(req.method))return new Response('Not found',{status:404,headers:cors});
const headers=new Headers(req.headers);headers.set('Origin',new URL(req.url).origin);headers.delete('cookie');
const token=req.headers.get('Authorization')?.replace(/^Bearer /,'');if(token)headers.set('cookie',(path==='/api/staff'?'mb_staff':'mb_guest')+'='+token);
const response=await route[req.method as 'GET'|'POST'](new Request(req,{headers}));
const out=new Headers(response.headers);for(const [k,v]of Object.entries(cors))out.set(k,v);
const session=out.get('set-cookie');if(session)out.set('X-Session',session.split(';')[0].split('=').slice(1).join('=')||'logout');out.delete('set-cookie');
return new Response(response.body,{status:response.status,headers:out});
}};
