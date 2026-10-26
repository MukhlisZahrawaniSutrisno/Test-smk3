import assert from 'node:assert/strict';
import test from 'node:test';
import { parseDashboardActivity, serializeDashboardActivity } from '../lib/dashboard-activity';

const legacy = {id:'a17',name:'Audit K3L',category:'Audit',owner:'Tim K3L',reference:'SMK3L-2026-001',plannedDate:'2026-10-26',status:'upcoming',rescheduledDate:'',reason:''};

test('legacy single-day activities retain IDs and normalize range dates',()=>{
  const parsed=parseDashboardActivity(legacy)!;
  assert.ok(parsed);
  assert.equal(parsed.id,'a17');
  assert.equal(parsed.plannedEndDate.toISOString(),'2026-10-26T00:00:00.000Z');
  assert.equal(parsed.description,'Audit');
  assert.equal(serializeDashboardActivity({...parsed,version:1}).rescheduledDate,'');
});

test('rescheduled legacy range shifts original duration across year boundaries',()=>{
  const parsed=parseDashboardActivity({...legacy,plannedEndDate:'2026-10-28',status:'rescheduled',rescheduledDate:'2026-12-31',reason:'Jadwal auditor berubah'})!;
  assert.equal(parsed.rescheduledEndDate?.toISOString(),'2027-01-02T00:00:00.000Z');
});

test('rejects impossible and reversed dates, invalid statuses, and oversized fields',()=>{
  for(const change of [
    {plannedDate:'2026-02-29'}, {plannedDate:'2025-12-31'}, {plannedEndDate:'2026-10-25'},
    {plannedEndDate:'2026-02-31'}, {status:'constructor'}, {name:'a'.repeat(141)}, {owner:'ab'},
    {description:'a'.repeat(601)}, {reference:'a'.repeat(141)}, {reason:'a'.repeat(2001)}, {id:'../bad'},
    {status:'rescheduled',rescheduledDate:'2026-10-26',reason:'Jadwal auditor berubah'},
    {status:'rescheduled',rescheduledDate:'2026-10-29',rescheduledEndDate:'2026-10-28',reason:'Jadwal auditor berubah'},
  ]) assert.equal(parseDashboardActivity({...legacy,...change}),null,JSON.stringify(change));
});

test('completed activities retain valid reschedule history and reject invalid history',()=>{
  assert.ok(parseDashboardActivity({...legacy,status:'completed',rescheduledDate:'2026-11-01',rescheduledEndDate:'2026-11-02',reason:'Auditor berhalangan'}));
  assert.equal(parseDashboardActivity({...legacy,status:'completed',rescheduledDate:'2026-02-30'}),null);
});

test('legacy rescheduling duration cannot overflow the final supported year',()=>{
  assert.equal(parseDashboardActivity({...legacy,plannedEndDate:'2026-10-28',status:'rescheduled',rescheduledDate:'9999-12-31',reason:'Jadwal auditor berubah'}),null);
});
