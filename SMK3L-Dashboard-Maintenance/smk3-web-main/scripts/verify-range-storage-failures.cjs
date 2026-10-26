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

const fixture = { id: 'storage-fixture', name: 'Storage fixture', description: 'Storage failure verification', owner: 'Tim Verifikasi', reference: 'TEST-2026', status: 'upcoming', plannedDate: '2026-10-26', plannedEndDate: '2026-10-28', rescheduledDate: '', rescheduledEndDate: '', reason: '', version: 1 };
const url = `${process.env.SMK3L_URL || 'http://localhost:3002'}/dashboard-smk3l-2026.html`;

async function setup(browser, server) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const writes = [];
  await page.route('**/api/dashboard/documents**', route => route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }));
  await page.route('**/api/dashboard/activities**', route => {
    const request = route.request();
    if (!server) return route.fulfill({ status: 401, contentType: 'application/json', body: '{}' });
    if (request.method() === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ activities: [fixture], initialized: true }) });
    const body = request.postDataJSON();
    writes.push(body);
    return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ...body, version: 1 }) });
  });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.body.dataset.ready === 'true');
  // Bootstrap must succeed first; only the operation under test loses storage.
  await page.evaluate(() => {
    IDBDatabase.prototype.transaction = function () { throw new DOMException('Injected storage failure', 'UnknownError'); };
    document.getElementById('toastRegion').replaceChildren();
  });
  return { context, page, writes };
}

async function localDelete(browser) {
  const { context, page } = await setup(browser, false);
  try {
    const button = page.locator('#scheduleBody [data-action="delete"]').first();
    const id = await button.getAttribute('data-id');
    await button.click();
    await page.locator('#confirmDeleteActivity').click();
    await page.waitForFunction(() => !document.getElementById('confirmDeleteActivity').disabled);
    assert.equal(await page.locator(`#scheduleBody [data-action="delete"][data-id="${id}"]`).count(), 1, 'failed local delete must retain the activity');
    assert.ok(await page.locator('#toastRegion .toast.error').count(), 'failed local delete must show an error');
    assert.equal(await page.locator('#toastRegion .toast.success').count(), 0, 'failed local delete must not claim success');
  } finally { await context.close(); }
}

async function serverAttachments(browser) {
  const { context, page, writes } = await setup(browser, true);
  try {
    await page.locator('#addActivityButton').click();
    await page.locator('#activityName').fill('Recoverable attachment activity');
    await page.locator('#activityDescription').fill('Attachment must survive a failed browser transaction.');
    await page.locator('#activityDate').fill('2026-10-26');
    await page.locator('#activityEndDate').fill('2026-10-28');
    await page.locator('#activityOwner').fill('Tim Verifikasi');
    await page.locator('#activityUpload').setInputFiles({ name: 'storage-proof.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') });
    await page.locator('#saveActivityButton').click();
    await page.waitForFunction(() => !document.getElementById('saveActivityButton').disabled);
    const success = await page.locator('#toastRegion .toast.success').allTextContents();
    assert.equal(success.length, 0, 'attachment storage failure must not make an unqualified success claim');
    if (!writes.length) {
      assert.equal(await page.locator('#activityDialog').evaluate(node => node.open), true, 'preflight failure keeps the form open');
      assert.equal(await page.locator('#activityUpload').evaluate(node => node.files.length), 1, 'preflight failure retains the selected attachment');
      assert.ok(await page.locator('#activityError').isVisible(), 'preflight failure explains why nothing was saved');
    } else {
      const messages = (await page.locator('#toastRegion').innerText()).toLowerCase();
      assert.match(messages, /dokumen|lampiran/, 'partial save warning must identify the affected attachment');
      assert.match(messages, /belum|gagal|tidak|sementara/, 'partial save warning must explain missing persistence');
      const id = writes[0].id;
      await page.locator(`#scheduleBody [data-action="documents"][data-id="${id}"]`).click();
      assert.equal(await page.locator('#documentList .document-file').count(), 1, 'attachment remains recoverable in memory after the activity commits');
      assert.ok(await page.locator('#documentList [data-action="download"]').isEnabled(), 'recoverable attachment can be downloaded');
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('#documentList [data-action="download"]').click(),
      ]);
      assert.equal(await download.failure(), null, 'recovery download completes');
      assert.equal(download.suggestedFilename(), 'storage-proof.png', 'recovery download retains the attachment filename');
      assert.equal(fs.readFileSync(await download.path()).toString('base64'), 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'recovery download retains the original attachment bytes');
    }
  } finally { await context.close(); }
}

(async () => {
  const browser = await playwright().chromium.launch({ headless: true, executablePath: process.env.SMK3L_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  let failures = 0;
  try {
    for (const [name, verify] of [['local delete storage failure', localDelete], ['server attachment storage failure', serverAttachments]]) {
      try { await verify(browser); console.log(`PASS ${name}`); }
      catch (error) { failures++; console.error(`FAIL ${name}: ${error.stack}`); }
    }
  } finally { await browser.close(); }
  if (failures) process.exitCode = 1;
})();
