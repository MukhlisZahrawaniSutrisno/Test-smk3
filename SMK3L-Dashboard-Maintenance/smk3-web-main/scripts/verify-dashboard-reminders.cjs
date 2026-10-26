const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

function playwright() {
  const links = path.join(os.homedir(), 'AppData/Local/ms-playwright/.links');
  const candidates = [process.env.SMK3L_PLAYWRIGHT, 'playwright', 'playwright-core'];
  if (fs.existsSync(links)) candidates.push(...fs.readdirSync(links).map(name => fs.readFileSync(path.join(links, name), 'utf8').trim()));
  for (const candidate of candidates.filter(Boolean)) {
    try { const runtime = require(candidate); if (runtime.chromium) return runtime; } catch { /* Try the next installed runtime. */ }
  }
  throw new Error('Set SMK3L_PLAYWRIGHT to an installed Playwright package.');
}

(async () => {
  const { chromium } = playwright();
  const browser = await chromium.launch({ headless: true, executablePath: process.env.SMK3L_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const artifacts = path.resolve(__dirname, '../artifacts/reminders');
  fs.mkdirSync(artifacts, { recursive: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/dashboard/documents', route => route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }));
    await page.addInitScript(() => {
      // Freeze the calendar day without adding test hooks to the production dashboard.
      const NativeDate = Date;
      const fixed = NativeDate.parse('2026-10-21T03:00:00Z');
      window.Date = class extends NativeDate {
        constructor(...args) { if (args.length) super(...args); else super(fixed); }
        static now() { return fixed; }
      };
    });
    const base = process.env.SMK3L_URL || 'http://localhost:3002';
    await page.goto(`${base}/dashboard-smk3l-2026.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.body.dataset.ready === 'true');
    assert.equal(await page.locator('#reminderList li').count(), 2);
    assert.deepEqual(await page.locator('.reminder-countdown').allTextContents(), ['H-1', 'H-7']);
    assert.equal(await page.locator('#reminderSound').count(), 0, 'sound controls are removed');
    const bell = page.locator('#reminderBell');
    assert.equal(await bell.getAttribute('aria-expanded'), 'false');
    assert.equal(await page.locator('#reminderCount').innerText(), '2');
    assert.equal(await page.locator('#reminderPanel').isVisible(), false);
    const bellBox = await bell.boundingBox();
    const profileBox = await page.locator('.profile').boundingBox();
    assert.ok(bellBox.y < 100 && bellBox.x < profileBox.x, 'bell sits in the top bar next to the profile');
    await page.screenshot({ path: path.join(artifacts, 'dashboard-background-desktop.png') });
    await bell.click();
    assert.equal(await page.locator('#reminderPanel').isVisible(), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#reminderPanel').isVisible(), false);
    assert.equal(await bell.evaluate(element => document.activeElement === element), true);
    await bell.click();
    await page.locator('h1').click();
    assert.equal(await page.locator('#reminderPanel').isVisible(), false, 'outside click closes notifications');
    await bell.click();
    await page.screenshot({ path: path.join(artifacts, 'dashboard-reminders-desktop.png') });
    // Reminder navigation must clear unrelated filters and open the real calendar dialog.
    await page.locator('#searchInput').fill('tidak cocok');
    await bell.click();
    await page.locator('#reminderList li').last().getByRole('button').click();
    assert.equal(await page.locator('#reminderPanel').isVisible(), false, 'opening an event closes notifications');
    assert.equal(await page.locator('#searchInput').inputValue(), '');
    assert.equal(await page.locator('#calendarDayDialog').evaluate(dialog => dialog.open), true);
    assert.match(await page.locator('#calendarDayActivities').innerText(), /Audit surveillance ISO 45001/);
    await page.locator('#calendarDayDialog [data-close="calendarDayDialog"]').first().click();
    // Updating the event through the existing status form must remove its reminder immediately.
    await bell.click();
    await page.locator('#reminderList li').first().getByRole('button').click();
    await page.locator('#calendarDayActivities [data-action="edit-status"]').first().click();
    await page.locator('#editActivityStatus').selectOption('completed');
    await page.locator('#saveActivityStatusButton').click();
    await page.locator('#rescheduleDialog').waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#reminderList li').count(), 1);
    assert.equal(await page.locator('#calendarDayDialog').evaluate(dialog => dialog.open), false);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.body.dataset.ready === 'true');
    assert.equal(await page.locator('#reminderList li').count(), 1, 'completed state must survive reload');
    assert.equal(await page.locator('#reminderCount').innerText(), '1');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(artifacts, 'dashboard-background-mobile.png') });
    await bell.click();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await page.screenshot({ path: path.join(artifacts, 'dashboard-reminders-mobile.png') });
    await page.locator('#reminderList li').first().getByRole('button').click();
    await page.locator('#calendarDayActivities [data-action="edit-status"]').first().click();
    await page.locator('#editActivityStatus').selectOption('completed');
    await page.locator('#saveActivityStatusButton').click();
    await page.locator('#rescheduleDialog').waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#reminderList li').count(), 0);
    assert.equal(await page.locator('#reminderCount').isVisible(), false);
    await bell.click();
    assert.match(await page.locator('#reminderSummary').innerText(), /Tidak ada kegiatan/);
    assert.deepEqual(errors, []);
    console.log('PASS: topbar bell, badge count, popup, Escape, outside click, no sound controls, calendar navigation, completion, empty state, mobile layout; no page errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
