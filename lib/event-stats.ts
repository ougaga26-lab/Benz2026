import {runtime,json,HttpError} from './event-server';
const participants=`WITH progress AS (SELECT p.id,p.created_at,p.redeemed_at,COUNT(s.station) AS completed,COALESCE(GROUP_CONCAT(s.station),'') AS stations,(SELECT completed_at FROM stamps WHERE participant_id=p.id ORDER BY completed_at,station LIMIT 1 OFFSET 2) AS qualified_at FROM participants p LEFT JOIN stamps s ON s.participant_id=p.id GROUP BY p.id)`;
export async function statistics(page=0){
if(!Number.isInteger(page)||page<0||page>100000)throw new HttpError('無效頁碼');
const db=runtime().DB;
const results=await db.batch([
db.prepare(participants+` SELECT COUNT(*) AS participants,COALESCE(SUM(completed>0),0) AS started,COALESCE(SUM(completed>=3),0) AS qualified,COALESCE(SUM(redeemed_at IS NOT NULL),0) AS redeemed,COALESCE(SUM(completed>=3 AND redeemed_at IS NULL),0) AS pending,COALESCE(SUM(completed),0) AS stamps FROM progress`),
db.prepare('SELECT station,COUNT(*) AS count FROM stamps GROUP BY station ORDER BY station'),
db.prepare(participants+` , events AS (SELECT date(created_at,'+8 hours') AS day,1 AS joined,0 AS qualified,0 AS redeemed,0 AS stamps FROM progress UNION ALL SELECT date(qualified_at,'+8 hours'),0,1,0,0 FROM progress WHERE qualified_at IS NOT NULL UNION ALL SELECT date(redeemed_at,'+8 hours'),0,0,1,0 FROM progress WHERE redeemed_at IS NOT NULL UNION ALL SELECT date(completed_at,'+8 hours'),0,0,0,1 FROM stamps) SELECT day,SUM(joined) AS joined,SUM(qualified) AS qualified,SUM(redeemed) AS redeemed,SUM(stamps) AS stamps FROM events GROUP BY day ORDER BY day DESC`),
db.prepare(participants+' SELECT * FROM progress ORDER BY created_at DESC,id LIMIT 50 OFFSET ?').bind(page*50)
]);
return json({summary:results[0].results[0],stations:results[1].results,daily:results[2].results,records:results[3].results,page,pageSize:50,updatedAt:new Date().toISOString()});
}
export async function exportRecords(){const rows=await runtime().DB.prepare(participants+' SELECT * FROM progress ORDER BY created_at,id LIMIT 10001').all<Record<string,unknown>>();if(rows.results.length>10000)throw new HttpError('資料超過一萬筆，請聯絡管理者分批匯出',413);
const cell=(v:unknown)=>'"'+String(v??'').replaceAll('"','""')+'"';
const lines=[['參加者編號','建立時間 UTC','通關數','完成關卡','達標時間 UTC','實際兌禮時間 UTC'],...rows.results.map(r=>[r.id,r.created_at,r.completed,r.stations,r.qualified_at,r.redeemed_at])];
return new Response('\uFEFF'+lines.map(r=>r.map(cell).join(',')).join('\r\n'),{headers:{'Content-Type':'text/csv; charset=utf-8','Cache-Control':'no-store','Content-Disposition':'attachment; filename="benz-event-records.csv"'}});}
