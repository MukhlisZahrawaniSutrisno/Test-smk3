import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createContext,runInContext} from 'node:vm';
import test from 'node:test';

async function calendarFunction(name:string) {
  const html=await readFile(new URL('../public/dashboard-smk3l-2026.html',import.meta.url),'utf8');
  const start=html.indexOf(`function ${name}(`);
  assert.ok(start>=0,`${name} should be implemented`);
  const end=html.indexOf('\n      function ',start+10);
  assert.ok(end>start);
  const context=createContext({});
  runInContext(html.slice(start,end),context);
  return (...args:unknown[])=>JSON.parse(runInContext(`JSON.stringify(${name}(...${JSON.stringify(args)}))`,context));
}

test('calendar includes leap day and complete Monday-to-Sunday weeks',async()=>{
  const days=await calendarFunction('calendarDays');
  const february=days(2028,1);
  assert.equal(february.length,35);
  assert.equal(february[0].date,'2028-01-31');
  assert.equal(february.at(-1).date,'2028-03-05');
  assert.equal(february.filter((day:any)=>day.inMonth).length,29);
  assert.ok(february.some((day:any)=>day.date==='2028-02-29'&&day.inMonth));
});

test('calendar grows to six weeks when 31 days need six rows',async()=>{
  const days=await calendarFunction('calendarDays');
  const august=days(2026,7);
  assert.equal(august.length,42);
  assert.equal(august[0].date,'2026-07-27');
  assert.equal(august.at(-1).date,'2026-09-06');
  assert.equal(august.filter((day:any)=>day.inMonth).length,31);
});

test('calendar includes adjacent-year dates without changing their year',async()=>{
  const days=await calendarFunction('calendarDays');
  assert.equal(days(2026,0)[0].date,'2025-12-29');
  assert.equal(days(2026,11).at(-1).date,'2027-01-03');
});

test('rescheduled activities appear on their new date without changing original data',async()=>{
  const activityDate=await calendarFunction('activityCalendarDate');
  const record={plannedDate:'2026-08-13',status:'rescheduled',rescheduledDate:'2027-01-28'};
  const before=JSON.stringify(record);
  assert.equal(activityDate(record),'2027-01-28');
  assert.equal(activityDate({...record,status:'completed'}),'2026-08-13');
  assert.equal(activityDate({...record,rescheduledDate:''}),'2026-08-13');
  assert.equal(JSON.stringify(record),before);
});
