import assert from 'node:assert/strict';
import test from 'node:test';
import {NextRequest} from 'next/server';
import {GET,POST} from '../app/api/dashboard/activities/route';
import {PATCH,DELETE} from '../app/api/dashboard/activities/[id]/route';
import {POST as initialize} from '../app/api/dashboard/activities/initialize/route';
import {prisma} from '../lib/prisma';
import {createSessionToken} from '../lib/session-token';
import {SESSION_COOKIE} from '../lib/auth';
import {parseDashboardActivity} from '../lib/dashboard-activity';

type Row=NonNullable<ReturnType<typeof parseDashboardActivity>> & {version:number;deletedAt:Date|null;createdById:string};
type CreateData=Omit<Row,'version'|'deletedAt'>;

const payload={id:'a01',name:'Inspeksi APAR',description:'Inspeksi keselamatan',owner:'Tim K3L',reference:'SMK3L-2026-001',status:'upcoming',plannedDate:'2026-10-26',plannedEndDate:'2026-10-28',rescheduledDate:'',reason:'',version:1};
test('activity API protects auth/origin and persists ranges with version conflicts and tombstones',async(t)=>{
  const secret=process.env.AUTH_SECRET; process.env.AUTH_SECRET='test-only-activity-secret';
  const userFind=prisma.user.findUnique, transaction=prisma.$transaction;
  const model=prisma.dashboardActivity;
  const originals={findMany:model.findMany,count:model.count,updateMany:model.updateMany};
  t.after(()=>{if(secret===undefined) delete process.env.AUTH_SECRET; else process.env.AUTH_SECRET=secret; prisma.user.findUnique=userFind; prisma.$transaction=transaction; Object.assign(model,originals);});
  const rows:Row[]=[];
  const tx={
    $executeRaw:async()=>0,
    dashboardActivity:{
      create:async({data}:{data:CreateData})=>{if(rows.some(row=>row.id===data.id))throw {code:'P2002'};const row={...data,version:1,deletedAt:null};rows.push(row);return row;},
      count:async()=>rows.length,
      createMany:async({data}:{data:CreateData[]})=>{rows.push(...data.map(row=>({...row,version:1,deletedAt:null})));return {count:data.length};},
      findMany:async()=>rows.filter(row=>!row.deletedAt),
      updateMany:async({where,data}:{where:{id:string;version:number};data:Omit<Partial<Row>,'version'>&{version:{increment:number}}})=>{const row=rows.find(row=>row.id===where.id&&row.version===where.version&&!row.deletedAt);if(!row)return {count:0};Object.assign(row,data,{version:row.version+1});return {count:1};},
      findUnique:async({where}:{where:{id:string}})=>rows.find(row=>row.id===where.id),
    },
  };
  prisma.$transaction=(async(fn:(value:typeof tx)=>Promise<unknown>)=>fn(tx)) as unknown as typeof transaction;
  model.count=(async()=>rows.length) as typeof model.count;
  model.findMany=(async()=>rows.filter(row=>!row.deletedAt)) as typeof model.findMany;
  model.updateMany=tx.dashboardActivity.updateMany as unknown as typeof model.updateMany;
  prisma.user.findUnique=(async()=>({id:'user1',email:'user@example.test',role:'PEGAWAI',name:'User'})) as unknown as typeof userFind;
  const token=createSessionToken('user1',process.env.AUTH_SECRET);
  function request(method:string,body?:unknown,extra:Record<string,string>={}) {return new NextRequest('http://localhost/api/dashboard/activities',{method,headers:{cookie:`${SESSION_COOKIE}=${token}`,'content-type':'application/json',...extra},...(body===undefined?{}:{body:JSON.stringify(body)})});}
  const context={params:Promise.resolve({id:'a01'})};
  const anonymous=await GET(new NextRequest('http://localhost/api/dashboard/activities'));
  assert.equal(anonymous.status,401);assert.equal(anonymous.headers.get('cache-control'),'private, no-store');
  assert.equal((await POST(request('POST',payload,{origin:'http://evil.test'}))).status,403);
  assert.equal((await POST(request('POST',payload,{'sec-fetch-site':'cross-site'}))).status,403);
  assert.equal((await POST(request('POST',payload,{'content-type':'text/plain'}))).status,400);
  assert.deepEqual(await (await GET(request('GET'))).json(),{activities:[],initialized:false});
  assert.equal((await initialize(request('POST',{activities:[payload,payload]}))).status,400);
  const first=await initialize(request('POST',{activities:[payload]})); assert.equal(first.status,200);
  assert.equal((await first.json()).activities[0].plannedEndDate,'2026-10-28');
  assert.equal((await initialize(request('POST',{activities:[payload]}))).status,409);
  assert.equal((await POST(request('POST',payload))).status,409);
  assert.equal((await PATCH(request('PATCH',{...payload,version:undefined}),context)).status,400);
  const edited=await PATCH(request('PATCH',{...payload,name:'Inspeksi baru'}),context);assert.equal(edited.status,200);assert.equal((await edited.json()).version,2);
  assert.equal((await PATCH(request('PATCH',payload),context)).status,409);
  assert.equal((await DELETE(request('DELETE',{version:1}),context)).status,409);
  assert.equal((await DELETE(request('DELETE',{version:2}),context)).status,200);
  assert.deepEqual(await (await GET(request('GET'))).json(),{activities:[],initialized:true});
  assert.equal((await initialize(request('POST',{activities:[payload]}))).status,409);
  assert.equal((await PATCH(request('PATCH',{...payload,version:3}),context)).status,409);
  assert.equal((await POST(request('POST',{...payload,id:'new-id',plannedEndDate:'2026-10-25'}))).status,400);
  assert.equal((await POST(request('POST',{...payload,id:'new-id'}))).status,201);
  model.count=(async()=>{throw new Error('secret-database-address');}) as typeof model.count;
  const failure=await GET(request('GET'));assert.equal(failure.status,503);assert.ok(!JSON.stringify(await failure.json()).includes('secret-database-address'));
});
