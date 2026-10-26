import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createContext, runInContext } from 'node:vm';
import test from 'node:test';

async function reminders() {
  const source = await readFile(new URL('../public/dashboard-reminders.js', import.meta.url), 'utf8');
  const context = createContext({ module: { exports: {} }, Intl, Date });
  runInContext(source, context);
  return context.module.exports;
}

const activity = (id: string, plannedDate: string, extra = {}) => ({
  id, plannedDate, name: `Kegiatan ${id}`, owner: 'Tim K3L', status: 'upcoming', ...extra,
});

test('dashboard keeps warnings visible within seven days and sorts the nearest activity first', async () => {
  const { getReminders } = await reminders();
  const result = getReminders([
    activity('seven', '2026-11-07'), activity('five', '2026-11-05'),
    activity('three', '2026-11-03'), activity('one', '2026-11-01'),
    activity('later', '2026-11-08'), activity('past', '2026-10-30'),
  ], new Date('2026-10-31T17:00:00Z'));
  assert.deepEqual(JSON.parse(JSON.stringify(result.map((r: { activity: { id: string }; daysBefore: number; stage: number }) => [r.activity.id, r.daysBefore, r.stage]))), [
    ['one', 0, 1], ['three', 2, 3], ['five', 4, 5], ['seven', 6, 7],
    ['later', 7, 7],
  ]);
});

test('exact reminder milestones remain visible between checkpoints and on the event day', async () => {
  const { getReminders } = await reminders();
  for (const [date, days, stage] of [
    ['2026-11-08', 7, 7], ['2026-11-06', 5, 5], ['2026-11-04', 3, 3],
    ['2026-11-02', 1, 1], ['2026-11-01', 0, 1],
  ]) {
    const result = getReminders([activity('a', date as string)], new Date('2026-11-01T00:00:00Z'));
    assert.equal(result.length, 1);
    assert.equal(result[0].daysBefore, days);
    assert.equal(result[0].stage, stage);
  }
});

test('Jakarta midnight advances reminders even while UTC is still the previous day', async () => {
  const { getReminders } = await reminders();
  const records = [activity('a', '2026-11-08')];
  assert.equal(getReminders(records, new Date('2026-10-31T16:59:59Z')).length, 0);
  assert.equal(getReminders(records, new Date('2026-10-31T17:00:00Z'))[0].daysBefore, 7);
});

test('rescheduling uses the replacement date and completed or missed events do not warn', async () => {
  const { getReminders } = await reminders();
  const records = [
    activity('new-date', '2026-08-13', { status: 'rescheduled', rescheduledDate: '2026-11-04' }),
    activity('moved-away', '2026-11-02', { status: 'rescheduled', rescheduledDate: '2026-12-01' }),
    activity('done', '2026-11-02', { status: 'completed' }),
    activity('missed', '2026-11-02', { status: 'missed' }),
  ];
  const before = JSON.stringify(records);
  const result = getReminders(records, new Date('2026-11-01T03:00:00Z'));
  assert.equal(result.length, 1);
  assert.equal(result[0].activity.id, 'new-date');
  assert.equal(result[0].eventDate, '2026-11-04');
  assert.equal(JSON.stringify(records), before);
});

test('calendar reminders reject impossible dates and work across leap days and years', async () => {
  const { getReminders } = await reminders();
  assert.equal(getReminders([activity('bad', '2026-02-30')], new Date('2026-02-25T03:00:00Z')).length, 0);
  assert.equal(getReminders([activity('leap', '2028-03-01')], new Date('2028-02-29T03:00:00Z'))[0].daysBefore, 1);
  assert.equal(getReminders([activity('year', '2027-01-01')], new Date('2026-12-25T03:00:00Z'))[0].daysBefore, 7);
});
