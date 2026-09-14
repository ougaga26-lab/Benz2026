import fs from 'node:fs';import assert from 'node:assert/strict';
const url='https://benz2026-api.ougaga26.workers.dev/api/staff';const env=Object.fromEntries(fs.readFileSync('.env','utf8').trim().split(/\r?\n/).map(l=>{const i=l.indexOf('=');return[l.slice(0,i),l.slice(i+1)]}));let token='';
async function call(body){return fetch(url,{method:'POST',headers:{Origin:'https://ougaga26-lab.github.io','Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)})}
for(const action of ['stats','export'])assert.equal((await call({action})).status,401);
const login=await call({action:'login',password:env.STAFF_PASSWORD});assert.equal(login.status,200);token=login.headers.get('X-Session');
assert.equal((await call({action:'stats',page:-1})).status,400);
const res=await call({action:'stats'});assert.equal(res.status,200);const d=await res.json();assert.equal(d.summary.qualified,d.summary.redeemed+d.summary.pending);assert.equal(d.summary.stamps,d.stations.reduce((n,s)=>n+s.count,0));
for(const [daily,total]of [['joined','participants'],['qualified','qualified'],['redeemed','redeemed'],['stamps','stamps']])assert.equal(d.daily.reduce((n,r)=>n+r[daily],0),d.summary[total]);
const csv=await call({action:'export'});assert.equal(csv.status,200);assert.match(csv.headers.get('Content-Type'),/text\/csv/);const rows=(await csv.text()).trim().split(/\r?\n/).slice(1).map(l=>l.slice(1,-1).split('\",\"'));assert.equal(rows.length,d.summary.participants);assert.equal(rows.filter(r=>r[5]).length,d.summary.redeemed);assert.equal(rows.filter(r=>Number(r[2])>=3).length,d.summary.qualified);
assert.equal((await(await call({action:'stats',page:100000})).json()).records.length,0);
console.log('PASS: auth protection, pagination validation, summary/day/station totals and CSV agree.');
