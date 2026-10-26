/** Opt-in: TEST_DATABASE_URL must point to a disposable PostgreSQL database.
 * Migrations and test data use a fresh isolated schema, removed afterward.
 * Run: node --import tsx scripts/test-dashboard-database.ts
 */
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {PrismaClient} from '@prisma/client';
import {NextRequest} from 'next/server';

async function main() {
  if(!process.env.TEST_DATABASE_URL) {
    console.log('SKIP: TEST_DATABASE_URL belum dikonfigurasi; database tidak diubah.');
    return;
  }
  const schema=`dashboard_test_${randomUUID().replaceAll('-','')}`;
  const url=new URL(process.env.TEST_DATABASE_URL);
  if(!['postgresql:','postgres:'].includes(url.protocol))throw new Error('TEST_DATABASE_URL harus PostgreSQL.');
  url.searchParams.set('schema',schema);
  const previousDatabase=process.env.DATABASE_URL, previousSecret=process.env.AUTH_SECRET;
  process.env.DATABASE_URL=url.toString();
  process.env.AUTH_SECRET='isolated-database-test-session-secret';
  const control=new PrismaClient({datasources:{db:{url:process.env.TEST_DATABASE_URL}}});
  let app:PrismaClient|undefined;
  try {
    await control.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    const migration=spawnSync(process.execPath,['node_modules/prisma/build/index.js','migrate','deploy'],{cwd:process.cwd(),env:process.env,encoding:'utf8',timeout:60000});
    assert.equal(migration.status,0,'Migrasi di schema pengujian harus berhasil.');
    const {prisma}=await import('../lib/prisma'); app=prisma;
    const collection=await import('../app/api/dashboard/activities/route');
    const item=await import('../app/api/dashboard/activities/[id]/route');
    const initialization=await import('../app/api/dashboard/activities/initialize/route');
    const {createSessionToken}=await import('../lib/session-token');
    const {SESSION_COOKIE}=await import('../lib/auth');
    const user=await prisma.user.create({data:{email:'database-test@example.test',password:'test-only-unused-password',name:'Database test'}});
    const token=createSessionToken(user.id,process.env.AUTH_SECRET);
    function request(method:string,body?:unknown) {return new NextRequest('http://localhost/api/dashboard/activities',{method,headers:{'content-type':'application/json',origin:'http://localhost',cookie:`${SESSION_COOKIE}=${token}`},...(body===undefined?{}:{body:JSON.stringify(body)})});}
    const activity={id:'a01',name:'Inspeksi tiga hari',description:'Inspeksi APAR bersama',owner:'Tim K3L',reference:'SMK3L-2026-001',status:'upcoming',plannedDate:'2026-10-26',plannedEndDate:'2026-10-28',rescheduledDate:'',reason:''};
    const doc=await prisma.dashboardActivityDocument.create({data:{activityId:'a01',name:'Bukti lama.pdf',kind:'pdf',blobPathname:'test-existing-document',size:123,uploadedById:user.id}});
    const imports=await Promise.all([initialization.POST(request('POST',{activities:[activity]})),initialization.POST(request('POST',{activities:[activity]}))]);
    assert.deepEqual(imports.map(result=>result.status).sort(),[200,409]);
    const loaded=await (await collection.GET(request('GET'))).json();
    assert.equal(loaded.activities[0].plannedEndDate,'2026-10-28');
    const context={params:Promise.resolve({id:'a01'})};
    const edits=await Promise.all([item.PATCH(request('PATCH',{...activity,name:'Perubahan pertama',version:1}),context),item.PATCH(request('PATCH',{...activity,name:'Perubahan kedua',version:1}),context)]);
    assert.deepEqual(edits.map(result=>result.status).sort(),[200,409]);
    await prisma.$disconnect();
    const reloaded=new PrismaClient({datasources:{db:{url:url.toString()}}});
    try {
      const persisted=await reloaded.dashboardActivity.findUniqueOrThrow({where:{id:'a01'}});
      assert.equal(persisted.version,2);
      assert.equal(persisted.plannedEndDate.toISOString().slice(0,10),'2026-10-28');
      await assert.rejects(reloaded.$executeRaw`UPDATE "DashboardActivity" SET "plannedEndDate" = DATE '2026-10-25' WHERE "id" = 'a01'`);
      assert.equal((await item.DELETE(request('DELETE',{version:2}),context)).status,200);
      assert.equal((await initialization.POST(request('POST',{activities:[activity]}))).status,409);
      const afterDelete=await (await collection.GET(request('GET'))).json();
      assert.deepEqual(afterDelete,{activities:[],initialized:true});
      assert.equal(await reloaded.dashboardActivityDocument.count({where:{id:doc.id}}),1);
      assert.equal((await collection.POST(request('POST',{...activity,id:'new-activity'}))).status,201);
      console.log('PASS: migrations, atomic initialization, concurrent version conflicts, persisted reload, DB date constraint, soft delete, document preservation, and create.');
    } finally {await reloaded.$disconnect();}
  } finally {
    await app?.$disconnect();
    // schema is generated locally from a UUID, never from user input.
    await control.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await control.$disconnect();
    if(previousDatabase===undefined)delete process.env.DATABASE_URL;else process.env.DATABASE_URL=previousDatabase;
    if(previousSecret===undefined)delete process.env.AUTH_SECRET;else process.env.AUTH_SECRET=previousSecret;
  }
}

main().catch(()=>{console.error('FAIL: uji database agenda gagal. Periksa koneksi dan izin schema pada database pengujian.');process.exitCode=1;});
