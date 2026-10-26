const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

function playwright() {
  const links = path.join(os.homedir(), 'AppData/Local/ms-playwright/.links');
  const candidates = [process.env.SMK3L_PLAYWRIGHT, 'playwright', 'playwright-core'];
  if (fs.existsSync(links)) candidates.push(...fs.readdirSync(links).map(name => fs.readFileSync(path.join(links, name), 'utf8').trim()));
  for (const candidate of candidates.filter(Boolean)) {
    try { const runtime = require(candidate); if (runtime.chromium) return runtime; } catch { /* Try another installed runtime. */ }
  }
  throw new Error('Set SMK3L_PLAYWRIGHT to an installed Playwright package.');
}

// This fixture verifies the browser's real HTTP boundary, not a live PostgreSQL database.
async function activityApi(page) {
  const records = new Map();
  const requests = [];
  let initialized = false;
  let failureStatus = 0;
  await page.route('**/api/dashboard/activities**', async route => {
    const request = route.request();
    const method = request.method();
    const pathname = new URL(request.url()).pathname;
    const body = method === 'GET' ? undefined : request.postDataJSON();
    requests.push({ method, pathname, body });
    const reply = (status, value) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(value) });
    if (method === 'GET') return reply(200, { activities: [...records.values()], initialized });
    if (failureStatus) return reply(failureStatus, { error: failureStatus === 409 ? 'Kegiatan sudah diubah pengguna lain. Muat ulang halaman.' : 'Database tidak tersedia.' });
    if (pathname.endsWith('/initialize')) {
      if (initialized) return reply(409, { error: 'Agenda sudah diinisialisasi.' });
      assert.ok(Array.isArray(body.activities), 'initialization sends existing browser activities');
      for (const record of body.activities) records.set(record.id, { ...record, version: 1 });
      initialized = true;
      return reply(200, { activities: [...records.values()], initialized });
    }
    if (method === 'POST') {
      assert.ok(body.plannedDate && body.plannedEndDate, 'create sends both range boundaries');
      const record = { ...body, version: 1 };
      records.set(record.id, record);
      return reply(201, record);
    }
    const id = decodeURIComponent(pathname.split('/').pop());
    const previous = records.get(id);
    if (!previous) return reply(404, { error: 'Kegiatan tidak ditemukan.' });
    if (body.version !== previous.version) return reply(409, { error: 'Versi kegiatan berubah.' });
    if (method === 'PATCH') {
      const record = { ...body, id, version: previous.version + 1 };
      records.set(id, record);
      return reply(200, record);
    }
    if (method === 'DELETE') { records.delete(id); return reply(200, { id, version: previous.version + 1 }); }
    return reply(405, { error: 'Method not allowed' });
  });
  return { records, requests, fail: status => { failureStatus = status; } };
}

(async () => {
  const { chromium } = playwright();
  const browser = await chromium.launch({ headless: true, executablePath: process.env.SMK3L_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const artifacts = path.resolve(__dirname, '../artifacts/calendar-ranges');
  fs.mkdirSync(artifacts, { recursive: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/dashboard/documents**', route => route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }));
    const api = await activityApi(page);
    await page.addInitScript(() => {
      const NativeDate = Date;
      const fixed = NativeDate.parse('2026-10-26T03:00:00Z');
      window.Date = class extends NativeDate {
        constructor(...args) { if (args.length) super(...args); else super(fixed); }
        static now() { return fixed; }
      };
    });
    const ready = () => page.waitForFunction(() => document.body.dataset.ready === 'true');
    await page.goto(`${process.env.SMK3L_URL || 'http://localhost:3002'}/dashboard-smk3l-2026.html`, { waitUntil: 'domcontentloaded' });
    await ready();
    assert.equal(await page.locator('#reminderSound').count(), 0, 'bell remains silent');
    assert.equal(await page.locator('#activityEndDate').count(), 1, 'add form exposes the range end');
    const close = id => page.locator(`#${id} [data-close="${id}"]`).first().click();
    const day = date => page.locator(`.calendar-day[data-calendar-date="${date}"]`);
    const fragments = id => page.locator(`.calendar-range-event[data-calendar-activity="${id}"]`);
    async function fillAdd(name, start, end) {
      await page.locator('#addActivityButton').click();
      await page.locator('#activityName').fill(name);
      await page.locator('#activityDescription').fill('Verifikasi rentang waktu kegiatan keselamatan.');
      await page.locator('#activityDate').fill(start);
      await page.locator('#activityEndDate').fill(end);
      await page.locator('#activityOwner').fill('Tim Verifikasi');
    }
    async function add(name, start, end) {
      await fillAdd(name, start, end);
      await page.locator('#saveActivityButton').click();
      await page.locator('#activityDialog').waitFor({ state: 'hidden' });
      const record = [...api.records.values()].find(item => item.name === name);
      assert.ok(record, 'successful add reaches the shared API');
      return record.id;
    }
    async function search(name) { await page.locator('#searchInput').fill(name); }
    async function edit(date, name) {
      await day(date).click();
      const entry = page.locator('#calendarDayActivities .calendar-entry').filter({ has: page.getByRole('heading', { name, exact: true }) });
      await entry.locator('[data-action="edit-status"]').click();
    }
    async function assertDates(id, dates) {
      assert.equal(await fragments(id).count(), dates.length, 'each visible day has exactly one range fragment');
      for (const date of dates) assert.equal(await day(date).locator(`[data-calendar-activity="${id}"]`).count(), 1, `range includes ${date}`);
    }
    async function calendarScreenshot(filename) {
      await page.waitForFunction(() => document.querySelector('#toastRegion').children.length === 0);
      await page.locator('.safety-calendar').screenshot({ path: path.join(artifacts, filename) });
    }

    await search('Audit surveillance ISO 45001');
    await assertDates('a17', ['2026-10-28']);
    await day('2026-10-28').click();
    assert.match(await page.locator('#calendarDayActivities').innerText(), /1\s*hari/, 'legacy record without an end date remains a one-day activity');
    await close('calendarDayDialog');

    await fillAdd('Rentang tiga hari', '2026-10-26', '2026-10-28');
    assert.match(await page.locator('#activityDuration').innerText(), /3\s*hari/);
    await page.locator('#saveActivityButton').click();
    await page.locator('#activityDialog').waitFor({ state: 'hidden' });
    const range = [...api.records.values()].find(item => item.name === 'Rentang tiga hari');
    assert.ok(range, 'creation must persist through the API');
    assert.equal(range.plannedEndDate, '2026-10-28');
    const initialization = api.requests.filter(item => item.pathname.endsWith('/initialize'));
    assert.equal(initialization.length, 1, 'first write initializes the existing agenda once');
    assert.equal(initialization[0].body.activities.length, 24, 'the original 24 activities survive migration');
    assert.ok(api.requests.indexOf(initialization[0]) < api.requests.findIndex(item => item.method === 'POST' && !item.pathname.endsWith('/initialize')), 'migration precedes the first create');
    await search(range.name);
    await assertDates(range.id, ['2026-10-26', '2026-10-27', '2026-10-28']);
    assert.equal(await page.locator('#scheduleBody tr').count(), 1, 'list counts the activity once');
    assert.match(await page.locator('#filterCount').innerText(), /^1\s/);
    const lanes = await fragments(range.id).evaluateAll(elements => elements.map(element => element.dataset.lane));
    assert.equal(new Set(lanes).size, 1, 'a weekly segment keeps the same lane');
    assert.ok(lanes.every(lane => ['0', '1'].includes(lane)));
    assert.equal(await fragments(range.id).first().getAttribute('data-range-start'), 'true');
    assert.equal(await fragments(range.id).last().getAttribute('data-range-end'), 'true');
    const bars = await fragments(range.id).evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, right: box.right };
    }));
    for (let index = 1; index < bars.length; index++) {
      assert.ok(Math.abs(bars[index].y - bars[index - 1].y) < 1, 'connected fragments align vertically');
      assert.ok(Math.abs(bars[index].x - bars[index - 1].right) <= 2, 'range bar connects across adjacent calendar cells');
    }
    await calendarScreenshot('range-desktop.png');

    const countBeforeInvalid = api.records.size;
    const writesBeforeInvalid = api.requests.filter(item => item.method !== 'GET').length;
    await fillAdd('Rentang invalid', '2026-10-28', '2026-10-26');
    await page.locator('#saveActivityButton').click();
    assert.equal(await page.locator('#activityDialog').evaluate(dialog => dialog.open), true);
    assert.equal(api.records.size, countBeforeInvalid);
    assert.equal(api.requests.filter(item => item.method !== 'GET').length, writesBeforeInvalid, 'invalid dates never reach storage');
    assert.ok(await page.locator('#activityEndDate').evaluate(input => !input.validity.valid) || await page.locator('#activityError').isVisible(), 'invalid range has visible or native validation');
    await close('activityDialog');

    await edit('2026-10-26', range.name);
    assert.equal(await page.locator('#editActivityStartDate').inputValue(), '2026-10-26');
    await page.locator('#editActivityEndDate').fill('2026-10-29');
    assert.match(await page.locator('#editActivityDuration').innerText(), /4\s*hari/);
    await page.locator('#saveActivityStatusButton').click();
    await page.locator('#rescheduleDialog').waitFor({ state: 'hidden' });
    assert.equal(api.records.get(range.id).plannedEndDate, '2026-10-29');
    assert.equal(api.records.get(range.id).version, 2);
    const writesBeforeReload = api.requests.filter(item => item.method !== 'GET').length;
    await page.reload({ waitUntil: 'domcontentloaded' });
    await ready();
    await search(range.name);
    await assertDates(range.id, ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29']);
    assert.equal(api.requests.filter(item => item.pathname.endsWith('/initialize')).length, 1, 'reload reads authoritative data without repeating migration');
    assert.equal(api.requests.filter(item => item.method !== 'GET').length, writesBeforeReload, 'reload never rewrites the server from a browser snapshot');

    await edit('2026-10-26', range.name);
    await page.locator('#editActivityStatus').selectOption('rescheduled');
    await page.locator('#rescheduleDate').fill('2026-10-30');
    await page.locator('#rescheduleEndDate').fill('2026-11-02');
    await page.locator('#rescheduleReason').fill('Penyesuaian jadwal kegiatan lintas bulan');
    await page.locator('#rescheduleOwner').fill('Tim Verifikasi');
    assert.match(await page.locator('#rescheduleDuration').innerText(), /4\s*hari/);
    await page.locator('#saveActivityStatusButton').click();
    await page.locator('#rescheduleDialog').waitFor({ state: 'hidden' });
    assert.equal(api.records.get(range.id).rescheduledEndDate, '2026-11-02');
    await page.locator('#calendarMonthInput').selectOption('9');
    for (const date of ['2026-10-30', '2026-10-31', '2026-11-01']) assert.equal(await day(date).locator(`[data-calendar-activity="${range.id}"]`).count(), 1);
    await page.locator('#nextCalendarMonth').click();
    for (const date of ['2026-11-01', '2026-11-02']) assert.equal(await day(date).locator(`[data-calendar-activity="${range.id}"]`).count(), 1);
    assert.match(await page.locator('#filterCount').innerText(), /^1\s/);
    await page.locator('#statusFilter').selectOption('completed');
    assert.equal(await fragments(range.id).count(), 0, 'status filtering applies to the entire range');
    await page.locator('#statusFilter').selectOption('all');
    await search('tidak ada kecocokan');
    assert.equal(await fragments(range.id).count(), 0);
    await search(range.name);

    const weekId = await add('Lintas minggu', '2026-10-31', '2026-11-03');
    await search('Lintas minggu');
    await page.locator('#nextCalendarMonth').click();
    await assertDates(weekId, ['2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03']);
    const segmentEnds = await fragments(weekId).evaluateAll(elements => elements.filter(element => element.dataset.rangeEnd === 'true').length);
    assert.equal(segmentEnds, 2, 'cross-week ranges have a clear end at each weekly boundary');

    const yearId = await add('Lintas tahun', '2026-12-31', '2027-01-02');
    await search('Lintas tahun');
    assert.equal(await day('2026-12-31').locator(`[data-calendar-activity="${yearId}"]`).count(), 1);
    await page.locator('#nextCalendarMonth').click();
    for (const date of ['2027-01-01', '2027-01-02']) assert.equal(await day(date).locator(`[data-calendar-activity="${yearId}"]`).count(), 1);
    assert.match(await page.locator('#filterCount').innerText(), /^1\s/);
    const leapId = await add('Hari kabisat', '2028-02-28', '2028-03-01');
    await search('Hari kabisat');
    await assertDates(leapId, ['2028-02-28', '2028-02-29', '2028-03-01']);
    const singleId = await add('Satu hari kompatibel', '2026-10-26', '2026-10-26');
    await search('Satu hari kompatibel');
    await assertDates(singleId, ['2026-10-26']);

    await add('Tumpukan uji satu', '2026-10-26', '2026-10-28');
    await add('Tumpukan uji dua', '2026-10-26', '2026-10-28');
    await add('Tumpukan uji tiga', '2026-10-26', '2026-10-28');
    await search('Tumpukan uji');
    assert.equal(await day('2026-10-26').locator('.calendar-range-event').count(), 2, 'weekly bar lanes are capped at two');
    assert.match(await day('2026-10-26').locator('.calendar-more').innerText(), /\+1/);
    await day('2026-10-26').click();
    assert.equal(await page.locator('#calendarDayActivities .calendar-entry').count(), 3, 'overflow activities are accessible through the day');
    await close('calendarDayDialog');

    await page.setViewportSize({ width: 390, height: 844 });
    await search(range.name);
    await page.locator('#nextCalendarMonth').click();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, '390px page has no horizontal overflow');
    assert.ok(await fragments(range.id).count() > 0, 'range bars remain visible on mobile');
    const mobileBars = await fragments(range.id).evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const parentStyle = getComputedStyle(element.parentElement);
      const dayStyle = getComputedStyle(element.closest('.calendar-day'));
      const tableStyle = getComputedStyle(element.closest('table'));
      return { x: box.x, y: box.y, right: box.right, width: box.width, height: box.height,
        margin: style.margin, dayPadding: dayStyle.padding, borderSpacing: tableStyle.borderSpacing,
        gridColumns: parentStyle.gridTemplateColumns, gridJustify: parentStyle.justifyContent };
    }));
    assert.ok(mobileBars.every(box => box.width > 10 && box.height > 8), 'mobile keeps readable bars rather than event dots');
    await calendarScreenshot('range-mobile.png');
    let mobileConnections = 0;
    for (let index = 1; index < mobileBars.length; index++) {
      if (Math.abs(mobileBars[index].y - mobileBars[index - 1].y) < 1) {
        assert.ok(Math.abs(mobileBars[index].x - mobileBars[index - 1].right) <= 2, `mobile range fragments connect across cells: ${JSON.stringify(mobileBars)}`);
        mobileConnections++;
      }
    }
    assert.ok(mobileConnections >= 1, 'mobile geometry includes a connected multi-day segment');
    await page.setViewportSize({ width: 1440, height: 1000 });

    // Once connected, failed mutations must stay failed; browser storage cannot mask them.
    api.fail(503);
    const beforeFailure = api.records.size;
    await fillAdd('Server gagal', '2026-10-26', '2026-10-28');
    await page.locator('#saveActivityButton').click();
    await page.waitForFunction(() => !document.querySelector('#saveActivityButton').disabled);
    assert.equal(await page.locator('#activityDialog').evaluate(dialog => dialog.open), true);
    assert.equal(await page.locator('#activityError').isVisible(), true, '503 is shown as an error');
    assert.equal(api.records.size, beforeFailure);
    await close('activityDialog');
    api.fail(409);
    await search(range.name);
    await page.locator('#calendarMonthInput').selectOption('10');
    await edit('2026-11-02', range.name);
    await page.locator('#editActivityTitle').fill('Konflik tidak boleh tersimpan');
    await page.locator('#saveActivityStatusButton').click();
    await page.waitForFunction(() => !document.querySelector('#saveActivityStatusButton').disabled);
    assert.equal(await page.locator('#rescheduleDialog').evaluate(dialog => dialog.open), true);
    assert.equal(await page.locator('#rescheduleError').isVisible(), true, '409 is shown as a conflict');
    assert.equal(api.records.get(range.id).name, range.name);
    await close('rescheduleDialog');
    api.fail(0);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await ready();
    await search('Server gagal');
    assert.equal(await page.locator('#scheduleBody .activity-name').count(), 0, 'failed write does not survive reload via a local fallback');
    await search(range.name);
    await page.locator('#calendarMonthInput').selectOption('10');
    await assertDates(range.id, ['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02']);
    assert.match(await page.locator('#filterCount').innerText(), /^1\s/);
    assert.deepEqual(errors, []);
    console.log('PASS: browser add/edit/reschedule, inclusive duration, invalid ranges, weekly/monthly/yearly/leap ranges, unique counts, filters/search/navigation, API initialization and reload, 503/409 failures, mobile layout, screenshots; no page errors. HTTP API is stubbed; this is not a live PostgreSQL test.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
