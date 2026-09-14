import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHmac} from 'node:crypto';
const origin=process.env.TEST_ORIGIN||'http://localhost:5173';
const env=Object.fromEntries(fs.readFileSync('.env','utf8').trim().split(/\r?\n/).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1)]}));
function client(){let cookie='';return async(path,body)=>{const r=await fetch(origin+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json',Origin:origin}:{}),Cookie:cookie},...(body?{body:JSON.stringify(body)}:{})});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data:await r.json()};};}
const user=client(),staff=client(),stranger=client();
const initial=await user('/api/event');assert.equal(initial.status,200);
assert.equal((await user('/api/event',{action:'stamp',station:1,pin:'123456'})).status,400);
assert.equal((await user('/api/event',{action:'qr',station:0})).status,409);
assert.equal((await staff('/api/staff',{action:'login',password:env.STAFF_PASSWORD})).status,200);
let t='';for(let station=1;station<=3;station++){const qr=await user('/api/event',{action:'qr',station});assert.equal(qr.status,200);t=qr.data.token;assert.equal((await stranger('/api/staff',{action:'inspect',token:t})).status,401);assert.equal((await staff('/api/staff',{action:'inspect',token:t+'x'})).status,400);assert.equal((await staff('/api/staff',{action:'inspect',token:t})).data.station,station);assert.equal((await staff('/api/staff',{action:'confirm',token:t,confirm:false})).status,400);const pair=await Promise.all([staff('/api/staff',{action:'confirm',token:t,confirm:true}),staff('/api/staff',{action:'confirm',token:t,confirm:true})]);assert.deepEqual(pair.map(x=>x.status).sort(),[200,409]);}
const reward=await user('/api/event',{action:'qr',station:0});assert.equal(reward.status,200);
const parts=reward.data.token.split('.');parts[2]=(Date.now()-1000).toString(36);const raw=parts.slice(0,3).join('.');const expired=raw+'.'+createHmac('sha256',env.EVENT_SECRET).update('qr:'+raw).digest('hex').slice(0,32);assert.equal((await staff('/api/staff',{action:'confirm',token:expired,confirm:true})).status,410);
const pair=await Promise.all([staff('/api/staff',{action:'confirm',token:reward.data.token,confirm:true}),staff('/api/staff',{action:'confirm',token:reward.data.token,confirm:true})]);assert.deepEqual(pair.map(x=>x.status).sort(),[200,409]);
const final=await user('/api/event');assert.equal(final.data.stamps.length,3);assert.ok(final.data.redeemedAt);assert.equal((await user('/api/event',{action:'qr',station:0})).status,409);
console.log('PASS: QR issuance, three stamps, attendee cannot stamp, authentication, tamper rejection, expiry, confirmation, concurrent duplicate prevention, reward eligibility, persistence.');
