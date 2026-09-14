import assert from 'node:assert/strict';
import {apiFetch} from '../pages-api.ts';
const store=new Map();globalThis.localStorage=globalThis.sessionStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
let calls=0;globalThis.fetch=async()=>{calls++;if(calls===1)throw new TypeError('Failed to fetch');return new Response('{}',{headers:{'X-Session':'test-session'}})};
assert.equal((await apiFetch('/api/event')).status,200);assert.equal(calls,2);assert.equal(store.get('benz_guest'),'test-session');
calls=0;globalThis.fetch=async()=>{calls++;throw new TypeError('Failed to fetch')};await assert.rejects(apiFetch('/api/staff',{method:'POST',body:'{}'}),/暫時無法連接/);assert.equal(calls,1);
console.log('PASS: failed GET recovers and stores session; POST is not replayed; readable network error.');
