import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createContext, runInContext } from 'node:vm';
import test from 'node:test';

async function api() {
  const source = await readFile(new URL('../public/calendar-range.js', import.meta.url), 'utf8').catch(() => '');
  assert.ok(source, 'calendar range helper must exist');
  const context = createContext({ module: { exports: {} } });
  runInContext(source, context);
  return context.module.exports;
}
const activity = (id: string, start: string, end = start, extra = {}) => ({ id, name: id, status: 'upcoming', plannedDate: start, plannedEndDate: end, ...extra });
const plain = (value: unknown) => JSON.parse(JSON.stringify(value));

test('inclusive duration includes both endpoints and crosses leap days and years', async () => {
  const { inclusiveDays, addDays } = await api();
  assert.equal(inclusiveDays('2026-10-26', '2026-10-28'), 3);
  assert.equal(inclusiveDays('2026-10-26', '2026-10-26'), 1);
  assert.equal(inclusiveDays('2028-02-28', '2028-03-01'), 3);
  assert.equal(inclusiveDays('2026-12-31', '2027-01-01'), 2);
  assert.equal(addDays('2028-02-28', 2), '2028-03-01');
  assert.equal(addDays('2027-01-01', -1), '2026-12-31');
});

test('dates and ranges reject impossible, reversed, malformed and out of bounds values', async () => {
  const { validDate, inclusiveDays, addDays, activityRange, overlaps } = await api();
  for (const value of ['2026-02-29', '2026-02-30', '2026-13-01', '2026-1-01', '2025-12-31', null]) assert.equal(validDate(value), false);
  assert.equal(validDate('2028-02-29'), true);
  assert.equal(inclusiveDays('2026-10-28', '2026-10-26'), 0);
  assert.equal(inclusiveDays('bad', '2026-10-26'), 0);
  assert.equal(addDays('bad', 1), null);
  assert.equal(addDays('2026-01-01', -1), null);
  assert.equal(addDays('9999-12-31', 1), null);
  assert.equal(activityRange(activity('bad', '2026-10-28', '2026-10-26')), null);
  assert.equal(overlaps(activity('a', '2026-10-26'), 'bad', '2026-10-27'), false);
});

test('legacy activities default to one day and reschedules retain original duration', async () => {
  const { activityRange } = await api();
  assert.deepEqual(plain(activityRange({ plannedDate: '2026-10-26', status: 'upcoming' })), { start: '2026-10-26', end: '2026-10-26', duration: 1 });
  const original = activity('a', '2026-10-26', '2026-10-28', { status: 'rescheduled', rescheduledDate: '2026-12-31' });
  assert.deepEqual(plain(activityRange(original)), { start: '2026-12-31', end: '2027-01-02', duration: 3 });
  assert.deepEqual(plain(activityRange({ ...original, rescheduledEndDate: '2027-01-04' })), { start: '2026-12-31', end: '2027-01-04', duration: 5 });
  assert.deepEqual(plain(activityRange({ ...original, status: 'completed' })), { start: '2026-10-26', end: '2026-10-28', duration: 3 });
});

test('overlaps includes endpoints and clips a range across adjacent weeks and months', async () => {
  const { overlaps, layoutWeek } = await api();
  const record = activity('cross', '2026-10-30', '2026-11-04');
  assert.equal(overlaps(record, '2026-11-04', '2026-11-30'), true);
  assert.equal(overlaps(record, '2026-11-05', '2026-11-30'), false);
  const october = layoutWeek([record], '2026-10-26').segments[0];
  const november = layoutWeek([record], '2026-11-02').segments[0];
  assert.deepEqual(plain([october.startColumn, october.endColumn, october.continuesBefore, october.continuesAfter]), [4, 6, false, true]);
  assert.deepEqual(plain([november.startColumn, november.endColumn, november.continuesBefore, november.continuesAfter]), [0, 2, true, false]);
});

test('weekly lanes are deterministic, collision free and count hidden activities for every covered day', async () => {
  const { layoutWeek } = await api();
  const records = [activity('c', '2026-10-26', '2026-10-27'), activity('b', '2026-10-26', '2026-10-28'), activity('a', '2026-10-26', '2026-11-01'), activity('d', '2026-10-29', '2026-10-30')];
  const before = JSON.stringify(records);
  const result = layoutWeek(records, '2026-10-26');
  assert.deepEqual(plain(result.overflow), [1, 1, 0, 0, 0, 0, 0]);
  assert.deepEqual(plain(result.segments.map((s: { activity: { id: string }; lane: number }) => [s.activity.id, s.lane])), [['a', 0], ['b', 1], ['c', 2], ['d', 1]]);
  for (const a of result.segments) for (const b of result.segments) if (a !== b && a.lane === b.lane) assert.ok(a.endColumn < b.startColumn || b.endColumn < a.startColumn);
  assert.deepEqual(plain(layoutWeek([...records].reverse(), '2026-10-26')), plain(result));
  assert.equal(JSON.stringify(records), before);
  assert.deepEqual(plain(layoutWeek([], '2026-10-26')), { segments: [], overflow: [0, 0, 0, 0, 0, 0, 0] });
});

test('equal ranges break ties by ID and expose the same browser and CommonJS API', async () => {
  const range = await api();
  assert.deepEqual(plain(range.layoutWeek([activity('b', '2026-10-26'), activity('a', '2026-10-26')], '2026-10-26').segments.map((s: { activity: { id: string } }) => s.activity.id)), ['a', 'b']);
  const source = await readFile(new URL('../public/calendar-range.js', import.meta.url), 'utf8');
  const browser = createContext({ window: {} });
  runInContext(source, browser);
  assert.deepEqual(Object.keys(browser.window.Smk3lCalendarRange).sort(), Object.keys(range).sort());
});

test('boundary weeks include 2025 padding and remain clipped at the final supported year', async () => {
  const { layoutWeek } = await api();
  const january = layoutWeek([activity('new-year', '2026-01-01', '2026-01-04')], '2025-12-29', 0);
  assert.deepEqual(plain(january.overflow), [0, 0, 0, 1, 1, 1, 1]);
  assert.deepEqual(plain(january.segments.map((s: { startColumn: number; endColumn: number }) => [s.startColumn, s.endColumn])), [[3, 6]]);
  const last = layoutWeek([activity('last', '9999-12-31')], '9999-12-27');
  assert.equal(last.segments[0].startColumn, 4);
  assert.equal(last.segments[0].endColumn, 4);
});

test('invalid replacement ranges are excluded without altering their source records', async () => {
  const { activityRange, layoutWeek } = await api();
  const records = [activity('invalid', '2026-10-26', '2026-10-28', { status: 'rescheduled', rescheduledDate: '2026-11-05', rescheduledEndDate: '2026-11-04' })];
  const before = JSON.stringify(records);
  assert.equal(activityRange(records[0]), null);
  assert.equal(layoutWeek(records, '2026-11-02').segments.length, 0);
  assert.equal(JSON.stringify(records), before);
});
