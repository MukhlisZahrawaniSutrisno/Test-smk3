const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { once } = require('node:events');
const { pathToFileURL } = require('node:url');

const dashboardPath = path.resolve(__dirname, '../public/dashboard-smk3l-2026.html');
assert.ok(fs.existsSync(dashboardPath), `Dashboard does not exist yet: ${dashboardPath}`);

const artifactDir = path.resolve(__dirname, '../../.artifacts/smk3l');
fs.mkdirSync(artifactDir, { recursive: true });
const { PDFDocument, StandardFonts, rgb } = require('../node_modules/pdf-lib');
const results = [];
const pageErrors = [];
const consoleErrors = [];
const failedRequests = [];
const report = { startedAt: new Date().toISOString(), results, pageErrors, consoleErrors, failedRequests };

function observePage(page) {
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
}

function discoverPlaywright() {
  const candidates = [process.env.SMK3L_PLAYWRIGHT, 'playwright', 'playwright-core'];
  const linkDir = path.join(os.homedir(), 'AppData/Local/ms-playwright/.links');
  if (fs.existsSync(linkDir)) {
    candidates.push(...fs.readdirSync(linkDir).map(name => fs.readFileSync(path.join(linkDir, name), 'utf8').trim())
      .sort((a, b) => Number(/patchright/.test(a)) - Number(/patchright/.test(b))));
  }
  for (const candidate of candidates.filter(Boolean)) {
    try {
      const runtime = require(candidate);
      if (runtime.chromium) return { runtime, source: candidate };
    } catch { /* Try another already installed runtime. */ }
  }
  throw new Error('No installed Playwright runtime found. Set SMK3L_PLAYWRIGHT to an existing package path.');
}

function discoverBrowser(chromium) {
  const candidates = [process.env.SMK3L_BROWSER, chromium.executablePath()];
  const cacheDir = path.join(os.homedir(), 'AppData/Local/ms-playwright');
  if (fs.existsSync(cacheDir)) {
    for (const name of fs.readdirSync(cacheDir).filter(name => /^chromium-\d+$/.test(name)).sort().reverse()) {
      candidates.push(path.join(cacheDir, name, 'chrome-win64/chrome.exe'));
    }
  }
  candidates.push('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe');
  const found = candidates.find(candidate => candidate && fs.existsSync(candidate));
  assert.ok(found, 'No installed Chromium/Edge found. Set SMK3L_BROWSER to an existing executable.');
  return found;
}

async function check(name, run) {
  const start = Date.now();
  try {
    await run();
    results.push({ name, status: 'passed', durationMs: Date.now() - start });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, status: 'failed', durationMs: Date.now() - start, error: error.message });
    throw error;
  }
}

async function waitCount(page, selector, count) {
  await page.waitForFunction(([selector, count]) => document.querySelectorAll(selector).length === count, [selector, count]);
}

async function makePdf(label, size = [420, 595]) {
  const doc = await PDFDocument.create();
  doc.setTitle(label);
  doc.setAuthor('SMK3L browser QA fixtures');
  doc.setSubject('Original uploaded file metadata');
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage(size);
  page.drawText(label, { x: 40, y: 525, font, size: 18, color: rgb(0.1, 0.2, 0.3) });
  return Buffer.from(await doc.save());
}

// A real, minimal DOCX fixture using stored ZIP entries; the dashboard need not parse it.
function makeDocx() {
  const entries = {
    '[Content_Types].xml': '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    'word/document.xml': '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>SMK3L browser QA evidence</w:t></w:r></w:p></w:body></w:document>',
  };
  const local = [], central = [];
  let offset = 0;
  for (const [name, content] of Object.entries(entries)) {
    const fileName = Buffer.from(name), data = Buffer.from(content);
    let crc = 0xffffffff;
    for (const byte of data) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const header = Buffer.alloc(30), directory = Buffer.alloc(46);
    header.writeUInt32LE(0x04034b50, 0); header.writeUInt16LE(20, 4); header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(data.length, 18); header.writeUInt32LE(data.length, 22); header.writeUInt16LE(fileName.length, 26);
    directory.writeUInt32LE(0x02014b50, 0); directory.writeUInt16LE(20, 4); directory.writeUInt16LE(20, 6);
    directory.writeUInt32LE(crc, 16); directory.writeUInt32LE(data.length, 20); directory.writeUInt32LE(data.length, 24);
    directory.writeUInt16LE(fileName.length, 28); directory.writeUInt32LE(offset, 42);
    local.push(header, fileName, data); central.push(directory, fileName);
    offset += header.length + fileName.length + data.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(central.length / 2, 8); end.writeUInt16LE(central.length / 2, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}

async function main() {
  const { runtime, source } = discoverPlaywright();
  const executablePath = discoverBrowser(runtime.chromium);
  report.runtime = source; report.browser = executablePath;
  const server = http.createServer((request, response) => {
    if (request.url.split('?')[0] !== '/dashboard-smk3l-2026.html') {
      response.writeHead(404); response.end('Not found'); return;
    }
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(fs.readFileSync(dashboardPath));
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  let browser, page;
  try {
    browser = await runtime.chromium.launch({ executablePath, headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true, reducedMotion: 'reduce' });
    page = await context.newPage();
    page.setDefaultTimeout(15000);
    observePage(page);
    const url = process.env.SMK3L_URL || `http://127.0.0.1:${server.address().port}/dashboard-smk3l-2026.html`;
    report.url = url;

    await check('Free-text description and user-owned template controls replace the old selects', async () => {
      const controlsContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      try {
        const controls = await controlsContext.newPage();
        observePage(controls);
        await controls.goto(url, { waitUntil: 'domcontentloaded' });
        await controls.waitForFunction(() => document.body.dataset.ready === 'true');
        await controls.locator('#addActivityButton').click();
        await controls.locator('#activityDialog').waitFor({ state: 'visible' });
        const missing = [];
        for (const selector of ['#activityDescription', '#activityTemplateUpload', '#activityTemplateList', '#activityUpload']) {
          if (await controls.locator(selector).count() !== 1) missing.push(selector);
        }
        for (const selector of ['#activityCategory', '#activityTemplateSelect']) {
          if (await controls.locator(selector).count()) missing.push(`Superseded select remains: ${selector}`);
        }
        await controls.locator('#activityDialog [data-close="activityDialog"]').first().click();
        await controls.locator('#scheduleBody [data-action="documents"][data-id="a01"]').click();
        await controls.locator('#documentDialog').waitFor({ state: 'visible' });
        for (const selector of ['#templateDocumentList', '#templateDocumentUpload']) {
          if (await controls.locator(selector).count() !== 1) missing.push(selector);
        }
        assert.deepEqual(missing, [], 'Description and uploaded-template controls must replace category and generated-template selects');
      } finally {
        await controlsContext.close();
      }
    });

    await check('Activity creation control opens a native dialog', async () => {
      const probeContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      try {
        const probe = await probeContext.newPage();
        observePage(probe);
        await probe.goto(url, { waitUntil: 'domcontentloaded' });
        await probe.waitForFunction(() => document.body.dataset.ready === 'true');
        assert.equal(await probe.locator('#addActivityButton').count(), 1, 'Dashboard must expose the Add activity button');
        await probe.locator('#addActivityButton').click();
        await probe.locator('#activityDialog').waitFor({ state: 'visible' });
        assert.equal(await probe.locator('#activityDialog').evaluate(element => element.tagName), 'DIALOG');
        await probe.locator('#activityDialog [data-close="activityDialog"]').first().click();
        await probe.locator('#activityDialog').waitFor({ state: 'hidden' });
      } finally {
        await probeContext.close();
      }
    });

    await check('Initial dashboard has 24 activities and seed KPIs', async () => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.body.dataset.ready === 'true');
      await waitCount(page, '#scheduleBody tr[data-activity-id]', 24);
      const renderedMonths = await page.locator('#scheduleBody .month-cell').allTextContents();
      assert.deepEqual(renderedMonths.map(text => text.replace(/\s*2026\s*$/, '').trim()), ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']);
      assert.equal(await page.locator('#yearFilter').inputValue(), '2026');
      assert.match(await page.locator('#kpiCompleted').innerText(), /^15\b/);
      assert.match(await page.locator('#kpiMissed').innerText(), /^3\b/);
      assert.match(await page.locator('#kpiRescheduled').innerText(), /^1\b/);
      assert.match(await page.locator('#kpiCompliance').innerText(), /^78[,.]9$/);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(artifactDir, 'desktop-viewport.png') });
      await page.screenshot({ path: path.join(artifactDir, 'desktop.png'), fullPage: true });
    });

    await check('Search, status and year filters change rendered activities', async () => {
      for (const [status, count] of [['completed', 15], ['missed', 3], ['rescheduled', 1], ['upcoming', 5]]) {
        await page.locator('#statusFilter').selectOption(status);
        await waitCount(page, '#scheduleBody tr[data-activity-id]', count);
      }
      await page.locator('#statusFilter').selectOption('all');
      await page.locator('#searchInput').fill('APAR');
      await page.locator('#scheduleBody tr[data-activity-id="a01"]').waitFor();
      const searchRows = await page.locator('#scheduleBody tr[data-activity-id]').allTextContents();
      assert.ok(searchRows.length > 0 && searchRows.length < 24);
      assert.ok(searchRows.every(text => /apar/i.test(text)), 'Search includes only matching activities');
      await page.locator('#searchInput').fill('no-matching-activity-qa');
      await waitCount(page, '#scheduleBody tr[data-activity-id]', 0);
      assert.ok(await page.locator('#scheduleEmpty').isVisible(), 'Empty results explain the empty state');
      await page.locator('#searchInput').fill('');
      const years = await page.locator('#yearFilter option').evaluateAll(options => options.map(option => option.value));
      const alternateYear = years.find(value => /^\d{4}$/.test(value) && value !== '2026');
      assert.ok(alternateYear, 'Year filter includes a year other than 2026');
      await page.locator('#yearFilter').selectOption(alternateYear);
      await waitCount(page, '#scheduleBody tr[data-activity-id]', 0);
      await page.locator('#yearFilter').selectOption('2026');
      await waitCount(page, '#scheduleBody tr[data-activity-id]', 24);
    });

    await check('Missed activity reschedules, updates KPIs and persists after reload', async () => {
      await page.locator('#scheduleBody [data-action="reschedule"][data-id="a16"]').click();
      await page.locator('#rescheduleDialog').waitFor({ state: 'visible' });
      await page.locator('#rescheduleDate').fill('2026-11-05');
      await page.locator('#rescheduleReason').fill('Koordinasi ulang inspeksi bersama tim lapangan QA');
      await page.locator('#rescheduleOwner').fill('Tim QA SMK3L');
      await page.locator('#rescheduleForm button[type="submit"]').click();
      await page.locator('#rescheduleDialog').waitFor({ state: 'hidden' });
      await page.waitForFunction(() => document.querySelector('#kpiMissed').textContent.trim().startsWith('2') && document.querySelector('#kpiRescheduled').textContent.trim().startsWith('2'));
      assert.match(await page.locator('#toastRegion').innerText(), /berhasil|tersimpan|diperbarui/i);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.body.dataset.ready === 'true');
      assert.match(await page.locator('#kpiMissed').innerText(), /^2\b/);
      assert.match(await page.locator('#kpiRescheduled').innerText(), /^2\b/);
      await page.locator('#statusFilter').selectOption('rescheduled');
      await waitCount(page, '#scheduleBody tr[data-activity-id]', 2);
      const row = page.locator('#scheduleBody tr[data-activity-id="a16"]');
      assert.match(await row.innerText(), /Nov|November|05[\/.\-]11|2026-11-05/i);
      await row.locator('[data-action="documents"]').click();
      await page.locator('#documentDialog').waitFor({ state: 'visible' });
      assert.match(await page.locator('#documentDetails').innerText(), /Tim QA SMK3L/);
      assert.match(await page.locator('#documentDetails').innerText(), /Koordinasi ulang inspeksi bersama tim lapangan QA/);
      await page.locator('#documentDialog [data-close="documentDialog"]').first().click();
      await page.locator('#statusFilter').selectOption('all');
    });

    const maliciousName = 'Laporan <img src=x onerror=window.__smk3lFilenameXss=1>.pdf';
    const pdfOne = await makePdf('SMK3L fixture A - first page');
    const pdfTwo = await makePdf('SMK3L fixture B - second page', [460, 620]);
    const pdfThree = await makePdf('SMK3L fixture C - excluded page', [500, 650]);
    const docx = makeDocx();
    const jpg = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABBQJ//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwF//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAGPwJ//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPyF//9oADAMBAAIAAwAAABAf/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPxB//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPxB//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxB//9k=', 'base64');
    let firstPdfRow, secondPdfRow, thirdPdfRow, evidenceCount;
    const findDocument = name => page.locator('#documentList [data-document-id]').filter({ hasText: name });
    const closeDialog = id => page.locator(`#${id} [data-close="${id}"]`).first().click();

    await check('PDF, DOCX and JPG uploads persist and filenames remain text', async () => {
      await page.locator('#scheduleBody [data-action="documents"][data-id="a01"]').click();
      await page.locator('#documentDialog').waitFor({ state: 'visible' });
      await page.screenshot({ path: path.join(artifactDir, 'documents.png') });
      await page.locator('#documentUpload').setInputFiles([
        { name: maliciousName, mimeType: 'application/pdf', buffer: pdfOne },
        { name: 'QA-inspection.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: docx },
        { name: 'QA-photo.jpg', mimeType: 'image/jpeg', buffer: jpg },
      ]);
      for (const name of [maliciousName, 'QA-inspection.docx', 'QA-photo.jpg']) await findDocument(name).waitFor({ state: 'visible' });
      assert.equal(await page.locator('img[src="x"]').count(), 0);
      assert.equal(await page.evaluate(() => window.__smk3lFilenameXss), undefined);
      evidenceCount = await page.locator('#documentList [data-document-id]').count();
      await closeDialog('documentDialog');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.body.dataset.ready === 'true');
      await page.locator('#scheduleBody [data-action="documents"][data-id="a01"]').click();
      await waitCount(page, '#documentList [data-document-id]', evidenceCount);
      firstPdfRow = findDocument(maliciousName);
      await firstPdfRow.waitFor({ state: 'visible' });
    });

    await check('Uploaded files preview and download their original bytes', async () => {
      await firstPdfRow.locator('[data-action="preview"]').click();
      await page.locator('#previewDialog').waitFor({ state: 'visible' });
      assert.ok(await page.locator('#previewDialog iframe, #previewDialog object, #previewDialog embed').count() > 0, 'PDF preview embeds the uploaded document');
      await closeDialog('previewDialog');
      await findDocument('QA-photo.jpg').locator('[data-action="preview"]').click();
      await page.locator('#previewDialog').waitFor({ state: 'visible' });
      await page.waitForFunction(() => [...document.querySelectorAll('#previewDialog img')].some(img => img.complete && img.naturalWidth > 0));
      await closeDialog('previewDialog');
      await findDocument('QA-inspection.docx').locator('[data-action="preview"]').click();
      await page.locator('#previewDialog').waitFor({ state: 'visible' });
      await page.waitForFunction(() => document.querySelector('#previewDialog').textContent.includes('SMK3L browser QA evidence'));
      await closeDialog('previewDialog');
      for (const [name, bytes, output] of [[maliciousName, pdfOne, 'downloaded-original.pdf'], ['QA-inspection.docx', docx, 'downloaded-original.docx'], ['QA-photo.jpg', jpg, 'downloaded-original.jpg']]) {
        const [download] = await Promise.all([page.waitForEvent('download'), findDocument(name).locator('[data-action="download"]').click()]);
        const filePath = path.join(artifactDir, output);
        await download.saveAs(filePath);
        assert.deepEqual(fs.readFileSync(filePath), bytes, `${name} downloads without changing bytes`);
      }
    });

    await check('Exactly two PDFs merge into a downloadable two-page PDF', async () => {
      await page.locator('#pdfUpload').setInputFiles([
        { name: 'QA-second.pdf', mimeType: 'application/pdf', buffer: pdfTwo },
        { name: 'QA-excluded.pdf', mimeType: 'application/pdf', buffer: pdfThree },
      ]);
      secondPdfRow = findDocument('QA-second.pdf'); thirdPdfRow = findDocument('QA-excluded.pdf');
      await secondPdfRow.waitFor({ state: 'visible' }); await thirdPdfRow.waitFor({ state: 'visible' });
      const selectedBoxes = page.locator('#documentList [data-pdf-id]:checked');
      while (await selectedBoxes.count()) await selectedBoxes.first().uncheck();
      assert.ok(await page.locator('#mergeButton').isDisabled(), 'Merge is blocked with no selected PDF');
      await firstPdfRow.locator('[data-pdf-id]').check();
      assert.ok(await page.locator('#mergeButton').isDisabled(), 'Merge is blocked with one selected PDF');
      await secondPdfRow.locator('[data-pdf-id]').check();
      assert.ok(await page.locator('#mergeButton').isEnabled(), 'Merge is enabled for exactly two PDFs');
      assert.ok(await thirdPdfRow.locator('[data-pdf-id]').isDisabled(), 'A third PDF cannot be selected');
      assert.equal(await page.locator('#documentList [data-pdf-id]:checked').count(), 2, 'Selection is capped at exactly two PDFs');
      await page.locator('#mergeName').fill('QA-gabungan-dua-dokumen');
      await page.locator('#mergeButton').click();
      await page.locator('#mergeResult').waitFor({ state: 'visible' });
      assert.match(await page.locator('#toastRegion').innerText(), /berhasil|digabung|tersimpan/i);
      const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#mergeResult [data-action="download"]').click()]);
      assert.match(download.suggestedFilename(), /QA-gabungan-dua-dokumen.*\.pdf$/i);
      const mergedPath = path.join(artifactDir, 'merged-two-pages.pdf');
      await download.saveAs(mergedPath);
      const bytes = fs.readFileSync(mergedPath);
      assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
      const merged = await PDFDocument.load(bytes);
      assert.equal(merged.getPageCount(), 2, 'Downloaded merged PDF includes exactly the selected two pages');
      assert.deepEqual(merged.getPages().map(page => page.getSize()), [{ width: 420, height: 595 }, { width: 460, height: 620 }], 'Merged page order and geometry match the selected source PDFs');
      assert.ok(bytes.length > 300, 'Downloaded PDF contains a complete document');
      report.mergedPdf = { path: mergedPath, bytes: bytes.length, pages: merged.getPageCount() };
    });

    await check('Corrupt PDF fails visibly without adding a document', async () => {
      const before = await page.locator('#documentList [data-document-id]').count();
      await page.locator('#pdfUpload').setInputFiles({ name: 'QA-corrupt.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7\nThis is deliberately not a valid PDF.') });
      await page.waitForFunction(() => /tidak valid|gagal|rusak|invalid/i.test((document.querySelector('#toastRegion')?.textContent || '') + (document.querySelector('#mergeStatus')?.textContent || '')));
      assert.equal(await findDocument('QA-corrupt.pdf').count(), 0, 'Invalid PDF was rejected');
      assert.equal(await page.locator('#documentList [data-document-id]').count(), before);
      await closeDialog('documentDialog');
    });

    await check('Mobile layout and document dialog fit a 390px viewport', async () => {
      while (await page.locator('#toastRegion button').count()) await page.locator('#toastRegion button').first().click();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.locator('#mobileSchedule').waitFor({ state: 'visible' });
      assert.ok((await page.locator('#mobileSchedule').innerText()).includes('APAR'));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'Mobile page has no horizontal overflow');
      await page.screenshot({ path: path.join(artifactDir, 'mobile.png') });
      await page.screenshot({ path: path.join(artifactDir, 'mobile-full.png'), fullPage: true });
      await page.locator('#mobileSchedule [data-action="documents"][data-id="a01"]').click();
      await page.locator('#documentDialog').waitFor({ state: 'visible' });
      const bounds = await page.locator('#documentDialog').boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 391, 'Mobile document dialog fits the viewport');
      assert.ok(await page.locator('#documentDialog').evaluate(dialog => dialog.scrollWidth <= dialog.clientWidth + 1), 'Long uploaded names do not overflow the mobile dialog');
      await page.screenshot({ path: path.join(artifactDir, 'mobile-documents.png') });
      await closeDialog('documentDialog');
      await page.setViewportSize({ width: 320, height: 740 });
      await page.evaluate(() => window.scrollTo(0, 0));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), '320px mobile page has no horizontal overflow');
      await page.screenshot({ path: path.join(artifactDir, 'mobile-320.png') });
      await page.locator('#mobileSchedule [data-action="documents"][data-id="a01"]').click();
      await page.locator('#documentDialog').waitFor({ state: 'visible' });
      const narrowBounds = await page.locator('#documentDialog').boundingBox();
      assert.ok(narrowBounds.x >= 0 && narrowBounds.x + narrowBounds.width <= 321, '320px document dialog fits the viewport');
      assert.ok(await page.locator('#documentDialog').evaluate(dialog => dialog.scrollWidth <= dialog.clientWidth + 1), '320px document content has no horizontal overflow');
      await closeDialog('documentDialog');
    });

    await check('Standalone file opens and persists a local agenda change', async () => {
      const standalone = await context.newPage();
      observePage(standalone);
      try {
        await standalone.goto(pathToFileURL(dashboardPath).href, { waitUntil: 'domcontentloaded' });
        await standalone.waitForFunction(() => document.body.dataset.ready === 'true');
        await waitCount(standalone, '#scheduleBody tr[data-activity-id]', 24);
        await standalone.locator('#scheduleBody [data-action="reschedule"][data-id="a18"]').click();
        await standalone.locator('#rescheduleDate').fill('2026-11-09');
        await standalone.locator('#rescheduleReason').fill('Verifikasi persistensi dokumen HTML lokal');
        await standalone.locator('#rescheduleOwner').fill('Tim QA Lokal');
        await standalone.locator('#rescheduleForm button[type="submit"]').click();
        await standalone.locator('#rescheduleDialog').waitFor({ state: 'hidden' });
        await standalone.reload({ waitUntil: 'domcontentloaded' });
        await standalone.waitForFunction(() => document.body.dataset.ready === 'true');
        assert.match(await standalone.locator('#kpiMissed').innerText(), /^2\b/);
        await standalone.locator('#scheduleBody [data-action="documents"][data-id="a18"]').click();
        await standalone.locator('#documentDialog').waitFor({ state: 'visible' });
        assert.match(await standalone.locator('#documentDetails').innerText(), /Tim QA Lokal/);
      } finally {
        await standalone.close();
      }
    });

    await check('Two stale tabs preserve both independent agenda updates', async () => {
      const separateContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      try {
        const [firstTab, staleTab] = await Promise.all([separateContext.newPage(), separateContext.newPage()]);
        for (const tab of [firstTab, staleTab]) observePage(tab);
        await Promise.all([firstTab.goto(url, { waitUntil: 'domcontentloaded' }), staleTab.goto(url, { waitUntil: 'domcontentloaded' })]);
        await Promise.all([firstTab.waitForFunction(() => document.body.dataset.ready === 'true'), staleTab.waitForFunction(() => document.body.dataset.ready === 'true')]);
        async function reschedule(tab, id, date, owner) {
          await tab.locator(`#scheduleBody [data-action="reschedule"][data-id="${id}"]`).click();
          await tab.locator('#rescheduleDate').fill(date);
          await tab.locator('#rescheduleReason').fill('Koordinasi agenda mandiri pada tab browser berbeda');
          await tab.locator('#rescheduleOwner').fill(owner);
          await tab.locator('#rescheduleForm button[type="submit"]').click();
          await tab.locator('#rescheduleDialog').waitFor({ state: 'hidden' });
        }
        await reschedule(firstTab, 'a16', '2026-11-10', 'Tim QA Tab A');
        await reschedule(staleTab, 'a18', '2026-11-11', 'Tim QA Tab B');
        await firstTab.reload({ waitUntil: 'domcontentloaded' });
        await firstTab.waitForFunction(() => document.body.dataset.ready === 'true');
        await firstTab.screenshot({ path: path.join(artifactDir, 'cross-tab-after-reload.png'), fullPage: true });
        assert.match(await firstTab.locator('#scheduleBody tr[data-activity-id="a16"]').innerText(), /10 Nov 2026/, 'Saving from a stale second tab must preserve the first tab update');
        assert.match(await firstTab.locator('#scheduleBody tr[data-activity-id="a18"]').innerText(), /11 Nov 2026/);
        assert.match(await firstTab.locator('#kpiMissed').innerText(), /^1\b/);
        assert.match(await firstTab.locator('#kpiRescheduled').innerText(), /^3\b/);
      } finally {
        await separateContext.close();
      }
    });

    const crudContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true, reducedMotion: 'reduce' });
    const crud = await crudContext.newPage();
    observePage(crud);
    let upcomingId, missedId;
    const activityName = 'QA <img src=x onerror=window.__smk3lActivityXss=1> & inspeksi';
    const activityRow = id => crud.locator(`#scheduleBody tr[data-activity-id="${id}"]`);
    const dismiss = async (tab, id) => tab.locator(`#${id} [data-close="${id}"]`).first().click();
    async function openReady(tab) {
      await tab.goto(url, { waitUntil: 'domcontentloaded' });
      await tab.waitForFunction(() => document.body.dataset.ready === 'true');
    }
    async function reloadReady(tab) {
      await tab.reload({ waitUntil: 'domcontentloaded' });
      await tab.waitForFunction(() => document.body.dataset.ready === 'true');
    }
    async function fillActivityForm(name, date, status, tab, options = {}) {
      await tab.locator('#addActivityButton').click();
      await tab.locator('#activityDialog').waitFor({ state: 'visible' });
      await tab.locator('#activityName').fill(name);
      await tab.locator('#activityDescription').fill(options.description || 'Deskripsi bebas kegiatan yang dicatat oleh tim QA.');
      await tab.locator('#activityDate').fill(date);
      await tab.locator('#activityStatus').selectOption(status);
      await tab.locator('#activityOwner').fill('Tim QA kegiatan baru');
      if (options.templates) await tab.locator('#activityTemplateUpload').setInputFiles(options.templates);
      if (options.files) await tab.locator('#activityUpload').setInputFiles(options.files);
    }
    async function saveActivity(tab, name) {
      await tab.locator('#saveActivityButton').click();
      await tab.locator('#activityDialog').waitFor({ state: 'hidden' });
      const row = tab.locator('#scheduleBody tr[data-activity-id]').filter({ hasText: name });
      await row.waitFor({ state: 'visible' });
      const id = await row.getAttribute('data-activity-id');
      assert.match(id, /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
      return id;
    }
    async function createActivity(name, date, status, tab = crud, options = {}) {
      await fillActivityForm(name, date, status, tab, options);
      return saveActivity(tab, name);
    }
    async function readStored(tab) {
      return tab.evaluate(() => new Promise((resolve, reject) => {
        const request = indexedDB.open('telkom-smk3l-dashboard-2026', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const transaction = database.transaction(['documents', 'settings'], 'readonly');
          const documents = transaction.objectStore('documents').getAll();
          const settings = transaction.objectStore('settings').getAll();
          transaction.oncomplete = () => {
            database.close();
            resolve({ documents: documents.result.map(record => ({ id: record.id, activityId: record.activityId, name: record.name, kind: record.kind, source: record.source, pages: record.pages, size: record.size })), settings: settings.result });
          };
          transaction.onerror = () => { database.close(); reject(transaction.error); };
        };
      }));
    }
    async function assertDeleted(tab, id) {
      const stored = await readStored(tab);
      assert.equal(stored.documents.filter(record => record.activityId === id).length, 0, 'Deleted activity has no orphan documents');
      assert.equal(stored.settings.filter(record => record.key === `activity:${id}`).length, 0, 'Deleted activity metadata was removed');
      assert.equal(stored.settings.filter(record => record.key === `deleted:${id}`).length, 1, 'Deletion tombstone persists');
    }
    async function deleteActivity(id) {
      await activityRow(id).locator('[data-action="delete"]').click();
      await crud.locator('#deleteActivityDialog').waitFor({ state: 'visible' });
      await crud.locator('#confirmDeleteActivity').click();
      await crud.locator('#deleteActivityDialog').waitFor({ state: 'hidden' });
      await waitCount(crud, `#scheduleBody tr[data-activity-id="${id}"]`, 0);
    }
    async function assertFits(tab, selector, width) {
      const bounds = await tab.locator(selector).boundingBox();
      assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width + 1, `${selector} fits ${width}px viewport`);
      assert.ok(await tab.locator(selector).evaluate(element => element.scrollWidth <= element.clientWidth + 1), `${selector} content has no horizontal overflow`);
    }
    try {
      await openReady(crud);
      await check('Create cancellation preserves the schedule; new activity resets filters and sorts', async () => {
        await crud.locator('#addActivityButton').click();
        await crud.locator('#activityName').fill('QA cancelled activity');
        await dismiss(crud, 'activityDialog');
        await waitCount(crud, '#scheduleBody tr[data-activity-id]', 24);
        await crud.locator('#statusFilter').selectOption('missed');
        await crud.locator('#searchInput').fill('no-matching-before-create');
        await crud.locator('#yearFilter').selectOption('2025');
        upcomingId = await createActivity(activityName, '2026-12-20', 'upcoming');
        assert.equal(await crud.locator('#yearFilter').inputValue(), '2026');
        assert.equal(await crud.locator('#statusFilter').inputValue(), 'all');
        assert.equal(await crud.locator('#searchInput').inputValue(), '');
        await waitCount(crud, '#scheduleBody tr[data-activity-id]', 25);
        assert.equal(await crud.locator('#monthStrip [data-month="all"]').getAttribute('aria-pressed'), 'true');
        assert.match(await crud.locator('#monthStrip [data-month="11"]').innerText(), /3 kegiatan/);
        const ids = await crud.locator('#scheduleBody tr[data-activity-id]').evaluateAll(rows => rows.map(row => row.dataset.activityId));
        assert.equal(ids.indexOf(upcomingId), ids.length - 2, 'December 20 sorts between the existing December 10 and December 23 activities');
        assert.equal(await crud.locator('img[src="x"]').count(), 0);
        assert.equal(await crud.evaluate(() => window.__smk3lActivityXss), undefined);
        assert.match(await crud.locator('#kpiCompleted').innerText(), /^15\b/);
        await crud.locator('#statusFilter').selectOption('upcoming');
        await waitCount(crud, '#scheduleBody tr[data-activity-id]', 6);
        await crud.locator('#searchInput').fill('QA <img');
        await waitCount(crud, '#scheduleBody tr[data-activity-id]', 1);
        await reloadReady(crud);
        await activityRow(upcomingId).waitFor({ state: 'visible' });
        assert.equal(await crud.locator('#scheduleBody').getByText('QA cancelled activity', { exact: true }).count(), 0);
      });

      await check('Completed 2025 and upcoming 2027 activities update yearly KPIs and persist', async () => {
        const completedId = await createActivity('QA completed previous-year inspection', '2025-06-11', 'completed');
        assert.equal(await crud.locator('#yearFilter').inputValue(), '2025');
        await waitCount(crud, '#scheduleBody tr[data-activity-id]', 1);
        assert.match(await crud.locator('#kpiCompleted').innerText(), /^1\b/);
        assert.equal(Number((await crud.locator('#kpiCompliance').innerText()).replace(',', '.')), 100);
        assert.match(await crud.locator('#monthStrip [data-month="5"]').innerText(), /1 kegiatan/);
        const futureId = await createActivity('QA future-year safety briefing', '2027-02-19', 'upcoming');
        assert.equal(await crud.locator('#yearFilter').inputValue(), '2027');
        await waitCount(crud, '#scheduleBody tr[data-activity-id]', 1);
        assert.match(await crud.locator('#kpiCompleted').innerText(), /^0\b/);
        assert.equal(Number((await crud.locator('#kpiCompliance').innerText()).replace(',', '.')), 0);
        await reloadReady(crud);
        await crud.locator('#yearFilter').selectOption('2027');
        await activityRow(futureId).waitFor({ state: 'visible' });
        await crud.locator('#statusFilter').selectOption('completed');
        await waitCount(crud, '#scheduleBody tr[data-activity-id]', 0);
        await crud.locator('#yearFilter').selectOption('2025');
        await activityRow(completedId).waitFor({ state: 'visible' });
        await crud.locator('#statusFilter').selectOption('all');
        await crud.locator('#yearFilter').selectOption('2026');
      });

      await check('New missed activity can reschedule without losing its custom metadata', async () => {
        missedId = await createActivity('QA missed custom inspection', '2026-10-01', 'missed');
        assert.match(await crud.locator('#kpiMissed').innerText(), /^4\b/);
        await activityRow(missedId).locator('[data-action="reschedule"]').click();
        await crud.locator('#rescheduleDate').fill('2026-11-12');
        await crud.locator('#rescheduleReason').fill('Penyesuaian agenda kegiatan baru untuk verifikasi QA');
        await crud.locator('#rescheduleOwner').fill('Tim QA kegiatan dijadwalkan ulang');
        await crud.locator('#rescheduleForm button[type="submit"]').click();
        await crud.locator('#rescheduleDialog').waitFor({ state: 'hidden' });
        await reloadReady(crud);
        assert.match(await activityRow(missedId).innerText(), /QA missed custom inspection/);
        assert.match(await activityRow(missedId).innerText(), /12 Nov 2026/);
        assert.match(await crud.locator('#kpiMissed').innerText(), /^3\b/);
        assert.match(await crud.locator('#kpiRescheduled').innerText(), /^2\b/);
      });

      await check('Create/delete dialogs and mobile action rows fit 390px and 320px', async () => {
        while (await crud.locator('#toastRegion button').count()) await crud.locator('#toastRegion button').first().click();
        await crud.locator('#searchInput').fill('QA <img');
        for (const width of [390, 320]) {
          await crud.setViewportSize({ width, height: 844 });
          await crud.evaluate(() => window.scrollTo(0, 0));
          assert.ok(await crud.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Mobile ${width}px has no page overflow`);
          const actions = await crud.locator('#mobileSchedule .row-actions button').evaluateAll(buttons => buttons.map(button => ({ left: button.getBoundingClientRect().left, right: button.getBoundingClientRect().right })));
          assert.ok(actions.length >= 2 && actions.every(bounds => bounds.left >= 0 && bounds.right <= width + 1), `Mobile ${width}px action buttons fit the viewport`);
          await crud.screenshot({ path: path.join(artifactDir, `crud-mobile-${width}.png`) });
          await crud.locator('#addActivityButton').click();
          await crud.locator('#activityName').fill(activityName);
          await assertFits(crud, '#activityDialog', width);
          await crud.screenshot({ path: path.join(artifactDir, `crud-add-mobile-${width}.png`) });
          await dismiss(crud, 'activityDialog');
          await crud.locator(`#mobileSchedule [data-action="delete"][data-id="${upcomingId}"]`).click();
          await crud.locator('#deleteActivityDialog').waitFor({ state: 'visible' });
          assert.equal(await crud.locator('#deleteActivityName').innerText(), activityName);
          await assertFits(crud, '#deleteActivityDialog', width);
          await crud.screenshot({ path: path.join(artifactDir, `crud-delete-mobile-${width}.png`) });
          await dismiss(crud, 'deleteActivityDialog');
        }
        await crud.setViewportSize({ width: 1440, height: 1000 });
        await crud.locator('#searchInput').fill('');
      });

      await check('Deleting a custom activity cancels safely and removes its documents atomically', async () => {
        await activityRow(upcomingId).locator('[data-action="documents"]').click();
        await crud.locator('#documentUpload').setInputFiles([
          { name: 'CRUD-evidence.pdf', mimeType: 'application/pdf', buffer: pdfOne },
          { name: 'CRUD-evidence.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: docx },
          { name: 'CRUD-photo.jpg', mimeType: 'image/jpeg', buffer: jpg },
        ]);
        await waitCount(crud, '#documentList [data-document-id]', 3);
        await dismiss(crud, 'documentDialog');
        await activityRow(upcomingId).locator('[data-action="delete"]').click();
        assert.equal(await crud.locator('#deleteActivityName').innerText(), activityName);
        assert.match(await crud.locator('#deleteActivityDocuments').innerText(), /\b3\b/);
        await dismiss(crud, 'deleteActivityDialog');
        await activityRow(upcomingId).locator('[data-action="documents"]').click();
        await waitCount(crud, '#documentList [data-document-id]', 3);
        await dismiss(crud, 'documentDialog');
        const staleUpload = await crudContext.newPage();
        observePage(staleUpload);
        try {
          await openReady(staleUpload);
          await staleUpload.locator(`#scheduleBody [data-action="documents"][data-id="${upcomingId}"]`).click();
          await deleteActivity(upcomingId);
          await assertDeleted(crud, upcomingId);
          await staleUpload.locator('#documentUpload').setInputFiles({ name: 'CRUD-late-upload.pdf', mimeType: 'application/pdf', buffer: pdfTwo });
          await staleUpload.waitForFunction(() => /dihapus|tidak ditemukan|tidak tersedia/i.test(document.querySelector('#toastRegion').textContent));
          await assertDeleted(staleUpload, upcomingId);
          await reloadReady(crud);
          await waitCount(crud, `#scheduleBody tr[data-activity-id="${upcomingId}"]`, 0);
          await waitCount(crud, '#scheduleBody tr[data-activity-id]', 25);
          assert.match(await crud.locator('#monthStrip [data-month="11"]').innerText(), /2 kegiatan/);
          await crud.locator('#statusFilter').selectOption('upcoming');
          await waitCount(crud, '#scheduleBody tr[data-activity-id]', 5);
          await crud.locator('#statusFilter').selectOption('all');
        } finally {
          await staleUpload.close();
        }
      });

      await check('Deleted seed activity and its sample documents never regenerate', async () => {
        await activityRow('a01').locator('[data-action="documents"]').click();
        await waitCount(crud, '#documentList [data-document-id]', 3);
        await dismiss(crud, 'documentDialog');
        await activityRow('a01').locator('[data-action="delete"]').click();
        assert.match(await crud.locator('#deleteActivityDocuments').innerText(), /\b3\b/);
        await crud.screenshot({ path: path.join(artifactDir, 'crud-delete-seed-desktop.png') });
        await crud.locator('#confirmDeleteActivity').click();
        await crud.locator('#deleteActivityDialog').waitFor({ state: 'hidden' });
        await reloadReady(crud);
        await waitCount(crud, '#scheduleBody tr[data-activity-id="a01"]', 0);
        assert.match(await crud.locator('#kpiCompleted').innerText(), /^14\b/);
        await assertDeleted(crud, 'a01');
        await reloadReady(crud);
        await assertDeleted(crud, 'a01');
        await waitCount(crud, '#scheduleBody tr[data-activity-id]', 24);
      });

      await check('Submitting a stale reschedule form cannot revive a deleted activity', async () => {
        const staleReschedule = await crudContext.newPage();
        observePage(staleReschedule);
        try {
          await openReady(staleReschedule);
          await staleReschedule.locator('#scheduleBody [data-action="reschedule"][data-id="a18"]').click();
          await staleReschedule.locator('#rescheduleDate').fill('2026-11-20');
          await staleReschedule.locator('#rescheduleReason').fill('Formulir lama yang terbuka sebelum kegiatan dihapus');
          await staleReschedule.locator('#rescheduleOwner').fill('Tim QA tab lama');
          await deleteActivity('a18');
          await staleReschedule.locator('#rescheduleForm button[type="submit"]').click();
          await staleReschedule.waitForFunction(() => /dihapus|tidak ditemukan|tidak tersedia/i.test(document.querySelector('#toastRegion').textContent));
          await assertDeleted(staleReschedule, 'a18');
          await reloadReady(crud);
          await waitCount(crud, '#scheduleBody tr[data-activity-id="a18"]', 0);
          await waitCount(crud, '#scheduleBody tr[data-activity-id]', 23);
          assert.match(await crud.locator('#kpiMissed').innerText(), /^2\b/);
          report.crud = { upcomingId, missedId, deletedSeedIds: ['a01', 'a18'], remaining2026: 23 };
        } finally {
          await staleReschedule.close();
        }
      });
    } catch (error) {
      await crud.screenshot({ path: path.join(artifactDir, 'crud-failure.png'), fullPage: true }).catch(() => {});
      throw error;
    } finally {
      await crudContext.close();
    }

    await check('December 31 missed activity reschedules across years and preserves planned grouping', async () => {
      const yearBoundaryContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      const yearBoundary = await yearBoundaryContext.newPage();
      observePage(yearBoundary);
      try {
        await openReady(yearBoundary);
        const id = await createActivity('QA December 31 missed activity', '2026-12-31', 'missed', yearBoundary);
        await yearBoundary.locator(`#scheduleBody [data-action="reschedule"][data-id="${id}"]`).click();
        await yearBoundary.locator('#rescheduleDate').fill('2026-12-31');
        assert.equal(await yearBoundary.locator('#rescheduleDate').evaluate(input => input.checkValidity()), false, 'Reschedule must be after the planned date');
        await yearBoundary.locator('#rescheduleDate').fill('2028-01-01');
        assert.equal(await yearBoundary.locator('#rescheduleDate').evaluate(input => input.checkValidity()), false, 'Reschedule cannot exceed the end of the following year');
        await yearBoundary.locator('#rescheduleDate').fill('2027-01-05');
        await yearBoundary.locator('#rescheduleReason').fill('Pelaksanaan inspeksi akhir tahun dialihkan ke awal tahun berikutnya');
        await yearBoundary.locator('#rescheduleOwner').fill('Tim QA lintas tahun');
        assert.ok(await yearBoundary.locator('#rescheduleDate').evaluate(input => input.checkValidity()), 'January 5 of the next year must be a valid reschedule date for a December 31 activity');
        await yearBoundary.locator('#rescheduleForm button[type="submit"]').click();
        await yearBoundary.locator('#rescheduleDialog').waitFor({ state: 'hidden' });
        await reloadReady(yearBoundary);
        assert.equal(await yearBoundary.locator('#yearFilter').inputValue(), '2026');
        await waitCount(yearBoundary, '#scheduleBody tr[data-activity-id]', 25);
        const row = yearBoundary.locator(`#scheduleBody tr[data-activity-id="${id}"]`);
        assert.match(await row.innerText(), /31 Des 2026/);
        assert.match(await row.innerText(), /05 Jan 2027/);
        assert.match(await yearBoundary.locator('#kpiMissed').innerText(), /^3\b/);
        assert.match(await yearBoundary.locator('#kpiRescheduled').innerText(), /^2\b/);
        assert.match(await yearBoundary.locator('#monthStrip [data-month="11"]').innerText(), /3 kegiatan/);
        await yearBoundary.locator('#yearFilter').selectOption('2027');
        await waitCount(yearBoundary, '#scheduleBody tr[data-activity-id]', 0);
        await yearBoundary.locator('#yearFilter').selectOption('2026');
        await yearBoundary.locator('#monthStrip [data-month="11"]').click();
        await waitCount(yearBoundary, '#scheduleBody tr[data-activity-id]', 3);
        await row.waitFor({ state: 'visible' });
        await yearBoundary.screenshot({ path: path.join(artifactDir, 'reschedule-year-boundary.png') });

        const lastSupportedYearId = await createActivity('QA last supported year December 31', '2027-12-31', 'missed', yearBoundary);
        await yearBoundary.locator(`#scheduleBody [data-action="reschedule"][data-id="${lastSupportedYearId}"]`).click();
        await yearBoundary.locator('#rescheduleDate').fill('2028-01-05');
        await yearBoundary.locator('#rescheduleReason').fill('Verifikasi agenda pada batas akhir tahun rencana yang didukung');
        await yearBoundary.locator('#rescheduleOwner').fill('Tim QA batas tahun 2028');
        assert.ok(await yearBoundary.locator('#rescheduleDate').evaluate(input => input.checkValidity()), 'A 2027 activity can reschedule into 2028');
        await yearBoundary.locator('#rescheduleForm button[type="submit"]').click();
        await yearBoundary.locator('#rescheduleDialog').waitFor({ state: 'hidden' });
        await reloadReady(yearBoundary);
        await yearBoundary.locator('#yearFilter').selectOption('2027');
        const lastYearRow = yearBoundary.locator(`#scheduleBody tr[data-activity-id="${lastSupportedYearId}"]`);
        await lastYearRow.waitFor({ state: 'visible' });
        assert.match(await lastYearRow.innerText(), /31 Des 2027/);
        assert.match(await lastYearRow.innerText(), /05 Jan 2028/);
        assert.match(await yearBoundary.locator('#monthStrip [data-month="11"]').innerText(), /1 kegiatan/);
        await yearBoundary.screenshot({ path: path.join(artifactDir, 'reschedule-year-2028.png') });
      } catch (error) {
        await yearBoundary.screenshot({ path: path.join(artifactDir, 'reschedule-year-boundary-failure.png') }).catch(() => {});
        throw error;
      } finally {
        await yearBoundaryContext.close();
      }
    });

    const attachmentContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true, reducedMotion: 'reduce' });
    const documentQA = await attachmentContext.newPage();
    observePage(documentQA);
    let templateActivityId;
    const uploadedPdfName = 'QA <img src=x onerror=window.__smk3lAttachmentXss=1>.pdf';
    let attachedActivityId;
    const documentRow = name => documentQA.locator('#documentList [data-document-id], #templateDocumentList [data-document-id]').filter({ hasText: name });
    async function openActivityDocuments(tab, id) {
      await tab.locator(`#scheduleBody [data-action="documents"][data-id="${id}"]`).click();
      await tab.locator('#documentDialog').waitFor({ state: 'visible' });
    }
    async function removeDocument(tab, id) {
      await tab.locator(`#documentDialog [data-action="delete-document"][data-doc-id="${id}"]`).click();
      await tab.locator('#deleteDocumentDialog').waitFor({ state: 'visible' });
      await tab.locator('#confirmDeleteDocument').click();
      await tab.locator('#deleteDocumentDialog').waitFor({ state: 'hidden' });
      await waitCount(tab, `#documentDialog [data-document-id="${id}"]`, 0);
    }
    async function downloadDocument(tab, row, artifactName) {
      const [download] = await Promise.all([tab.waitForEvent('download'), row.locator('[data-action="download"]').click()]);
      const output = path.join(artifactDir, artifactName);
      await download.saveAs(output);
      return fs.readFileSync(output);
    }
    try {
      await openReady(documentQA);
      const png = Buffer.from(await documentQA.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 32; canvas.height = 24;
        canvas.getContext('2d').fillRect(0, 0, 32, 24);
        return canvas.toDataURL('image/png').split(',')[1];
      }), 'base64');
      const creationFiles = [
        { name: uploadedPdfName, mimeType: 'application/pdf', buffer: pdfOne },
        { name: 'Create-evidence.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: docx },
        { name: 'Create-photo.jpg', mimeType: 'image/jpeg', buffer: jpg },
        { name: 'Create-diagram.png', mimeType: 'image/png', buffer: png },
      ];
      const templateFiles = [
        { name: 'Template <img src=x onerror=window.__smk3lTemplateXss=1>.pdf', mimeType: 'application/pdf', buffer: pdfOne },
        { name: 'Template-owned.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: docx },
        { name: 'Template-owned.jpg', mimeType: 'image/jpeg', buffer: jpg },
        { name: 'Template-owned.png', mimeType: 'image/png', buffer: png },
      ];

      await check('Free-text descriptions and user-owned template files persist without generated PDFs', async () => {
        await documentQA.locator('#searchInput').fill('Inspeksi & pengendalian');
        await documentQA.locator('#scheduleBody tr[data-activity-id="a01"]').waitFor({ state: 'visible' });
        assert.match(await documentQA.locator('#scheduleBody tr[data-activity-id="a01"]').innerText(), /Inspeksi & pengendalian/);
        await documentQA.locator('#searchInput').fill('');
        const description = 'Deskripsi bebas QA LampiranUnik77.\n<svg onload=window.__smk3lDescriptionXss=1> & tindak lanjut.';
        const name = 'QA user-owned templates';
        await fillActivityForm(name, '2026-12-26', 'upcoming', documentQA, { description, templates: templateFiles });
        const constraints = await documentQA.locator('#activityDescription').evaluate(input => ({ tag: input.tagName, required: input.required, min: input.minLength, max: input.maxLength }));
        assert.deepEqual(constraints, { tag: 'TEXTAREA', required: true, min: 3, max: 600 });
        await documentQA.locator('#activityDescription').fill('QA');
        await documentQA.locator('#saveActivityButton').click();
        assert.equal(await documentQA.locator('#activityDescription').evaluate(input => input.checkValidity()), false);
        assert.ok(await documentQA.locator('#activityDialog').isVisible());
        assert.equal((await readStored(documentQA)).documents.length, 3, 'Invalid description does not store pending template files');
        await documentQA.locator('#activityDescription').fill(description);
        await waitCount(documentQA, '#activityTemplateList [data-action="download-pending-template"]', 4);
        assert.ok((await documentQA.locator('#activityTemplateList').innerText()).includes(templateFiles[0].name));
        assert.equal(await documentQA.locator('img[src="x"], svg[onload]').count(), 0);
        for (const [index, file] of templateFiles.entries()) {
          const [download] = await Promise.all([documentQA.waitForEvent('download'), documentQA.locator(`#activityTemplateList [data-action="download-pending-template"][data-index="${index}"]`).click()]);
          const output = path.join(artifactDir, `pending-template-${index}.${file.name.split('.').pop()}`);
          await download.saveAs(output);
          assert.deepEqual(fs.readFileSync(output), file.buffer, 'Pending template download preserves original bytes');
        }
        if (await documentQA.locator('#activityTemplateList [data-action="remove-pending-template"]').count()) {
          await documentQA.locator('#activityTemplateList [data-action="remove-pending-template"]').last().click();
          await waitCount(documentQA, '#activityTemplateList [data-action="download-pending-template"]', 3);
          await documentQA.locator('#clearActivityTemplates').click();
          await waitCount(documentQA, '#activityTemplateList [data-action="download-pending-template"]', 0);
          await documentQA.locator('#activityTemplateUpload').setInputFiles(templateFiles);
        }
        templateActivityId = await saveActivity(documentQA, name);
        await reloadReady(documentQA);
        await documentQA.locator('#searchInput').fill('LampiranUnik77');
        await waitCount(documentQA, '#scheduleBody tr[data-activity-id]', 1);
        assert.match(await documentQA.locator('#scheduleBody tr[data-activity-id]').innerText(), /LampiranUnik77/);
        assert.equal(await documentQA.evaluate(() => window.__smk3lDescriptionXss), undefined);
        await openActivityDocuments(documentQA, templateActivityId);
        await waitCount(documentQA, '#templateDocumentList [data-document-id]', 4);
        await waitCount(documentQA, '#documentList [data-document-id]', 0);
        assert.match(await documentQA.locator('#documentCount').innerText(), /\b4\b/);
        const stored = await readStored(documentQA);
        const activity = stored.settings.find(record => record.key === `activity:${templateActivityId}`);
        assert.equal(activity.value.description, description);
        const templates = stored.documents.filter(record => record.activityId === templateActivityId);
        assert.equal(templates.length, 4, 'Only the four uploaded templates are stored');
        assert.ok(templates.every(record => record.source === 'Template'));
        for (const [index, file] of templateFiles.entries()) {
          const bytes = await downloadDocument(documentQA, documentRow(file.name), `owned-template-${index}.${file.name.split('.').pop()}`);
          assert.deepEqual(bytes, file.buffer);
          if (index === 0) {
            const pdf = await PDFDocument.load(bytes), original = await PDFDocument.load(file.buffer);
            assert.equal(pdf.getTitle(), original.getTitle());
            assert.equal(pdf.getAuthor(), original.getAuthor());
            assert.equal(pdf.getSubject(), original.getSubject());
          }
        }
        assert.equal(await documentQA.evaluate(() => window.__smk3lTemplateXss), undefined);
        await dismiss(documentQA, 'documentDialog');
        await documentQA.locator('#searchInput').fill('');
      });

      await check('Creating an activity stores original templates and supporting attachments in separate groups', async () => {
        const name = 'QA activity with template and four attachments';
        await fillActivityForm(name, '2026-12-24', 'upcoming', documentQA, { templates: templateFiles.slice(0, 2), files: creationFiles });
        await documentQA.waitForFunction(() => /\b4\b/.test(document.querySelector('#activityUploadSummary').textContent));
        await documentQA.screenshot({ path: path.join(artifactDir, 'activity-template-uploads-desktop.png') });
        attachedActivityId = await saveActivity(documentQA, name);
        await openActivityDocuments(documentQA, attachedActivityId);
        await waitCount(documentQA, '#documentList [data-document-id]', 4);
        await waitCount(documentQA, '#templateDocumentList [data-document-id]', 2);
        assert.match(await documentQA.locator('#documentCount').innerText(), /\b6\b/);
        assert.equal(await documentQA.locator('img[src="x"]').count(), 0);
        assert.equal(await documentQA.evaluate(() => window.__smk3lAttachmentXss), undefined);
        for (const [index, file] of creationFiles.entries()) {
          await documentRow(file.name).waitFor({ state: 'visible' });
          const bytes = await downloadDocument(documentQA, documentRow(file.name), `created-upload-${index}.${file.name.split('.').pop()}`);
          assert.deepEqual(bytes, file.buffer, 'Activity uploads preserve the original file bytes');
        }
        await documentRow('Create-diagram.png').locator('[data-action="preview"]').click();
        await documentQA.waitForFunction(() => [...document.querySelectorAll('#previewDialog img')].some(img => img.complete && img.naturalWidth > 0));
        await dismiss(documentQA, 'previewDialog');
        await dismiss(documentQA, 'documentDialog');
        await reloadReady(documentQA);
        const stored = await readStored(documentQA);
        assert.ok(stored.settings.some(record => record.key === `activity:${attachedActivityId}`));
        const attached = stored.documents.filter(record => record.activityId === attachedActivityId);
        assert.equal(attached.length, 6);
        assert.equal(attached.filter(record => record.source === 'Template').length, 2);
        await openActivityDocuments(documentQA, attachedActivityId);
        await waitCount(documentQA, '#documentList [data-document-id]', 4);
        await waitCount(documentQA, '#templateDocumentList [data-document-id]', 2);
        await dismiss(documentQA, 'documentDialog');
        const emptyId = await createActivity('QA optional template remains empty', '2026-12-25', 'upcoming', documentQA);
        assert.equal((await readStored(documentQA)).documents.filter(record => record.activityId === emptyId).length, 0);
      });

      await check('Invalid corrupt and oversized attachment batches block save without orphan data', async () => {
        const failures = [
          { name: 'QA-corrupt-create.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7\nNot a valid PDF document.') },
          { name: 'QA-unsupported-create.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('Unsupported attachment fixture') },
          { name: 'QA-oversized-create.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(20 * 1024 * 1024 + 1, 65) },
        ];
        for (const [index, invalid] of failures.entries()) {
          const before = await readStored(documentQA);
          const name = `QA invalid attachment batch ${index}`;
          const invalidTemplate = index !== 1;
          await fillActivityForm(name, '2026-12-29', 'upcoming', documentQA, {
            templates: invalidTemplate ? [templateFiles[1], invalid] : [templateFiles[0]],
            files: invalidTemplate ? [creationFiles[0]] : [creationFiles[0], invalid],
          });
          if (await documentQA.locator('#saveActivityButton').isEnabled()) await documentQA.locator('#saveActivityButton').click();
          await documentQA.locator('#activityError').waitFor({ state: 'visible' });
          assert.ok((await documentQA.locator('#activityError').innerText()).trim());
          assert.ok(await documentQA.locator('#activityDialog').isVisible());
          assert.equal(await documentQA.locator('#scheduleBody tr[data-activity-id]').filter({ hasText: name }).count(), 0);
          const after = await readStored(documentQA);
          assert.deepEqual(after.documents.map(record => record.id).sort(), before.documents.map(record => record.id).sort(), 'Rejected batch creates no orphan documents or templates');
          assert.deepEqual(after.settings.filter(record => record.key.startsWith('activity:')).map(record => record.key).sort(), before.settings.filter(record => record.key.startsWith('activity:')).map(record => record.key).sort(), 'Rejected batch creates no activity metadata');
          if (await documentQA.locator('#clearActivityFiles').count()) {
            await documentQA.locator('#clearActivityFiles').click();
            assert.equal(await documentQA.locator('#activityUpload').evaluate(input => input.files.length), 0);
          }
          await dismiss(documentQA, 'activityDialog');
        }
        const recoveredId = await createActivity('QA clean form after rejected attachment batches', '2026-12-30', 'upcoming', documentQA);
        assert.equal((await readStored(documentQA)).documents.filter(record => record.activityId === recoveredId).length, 0, 'Rejected/cancelled files do not leak into the next activity');
      });

      await check('Attachment controls and document deletion dialogs fit mobile 390px and 320px', async () => {
        while (await documentQA.locator('#toastRegion button').count()) await documentQA.locator('#toastRegion button').first().click();
        for (const width of [390, 320]) {
          await documentQA.setViewportSize({ width, height: 844 });
          await fillActivityForm('QA cancelled mobile attachments', '2026-12-31', 'upcoming', documentQA, { templates: [templateFiles[0], templateFiles[3]], files: [creationFiles[0], creationFiles[3]] });
          await assertFits(documentQA, '#activityDialog', width);
          await documentQA.locator('#activityTemplateList').scrollIntoViewIfNeeded();
          await documentQA.screenshot({ path: path.join(artifactDir, `activity-attachments-mobile-${width}.png`) });
          await dismiss(documentQA, 'activityDialog');
          await documentQA.locator(`#mobileSchedule [data-action="documents"][data-id="${attachedActivityId}"]`).click();
          await documentQA.locator('#documentDialog').waitFor({ state: 'visible' });
          await assertFits(documentQA, '#documentDialog', width);
          const malicious = documentRow(uploadedPdfName);
          await malicious.locator('[data-action="delete-document"]').click();
          await documentQA.locator('#deleteDocumentDialog').waitFor({ state: 'visible' });
          assert.equal(await documentQA.locator('#deleteDocumentName').innerText(), uploadedPdfName);
          await assertFits(documentQA, '#deleteDocumentDialog', width);
          await documentQA.screenshot({ path: path.join(artifactDir, `delete-document-mobile-${width}.png`) });
          await dismiss(documentQA, 'deleteDocumentDialog');
          await dismiss(documentQA, 'documentDialog');
        }
        await documentQA.setViewportSize({ width: 1440, height: 1000 });
      });

      await check('Document delete cancellation preserves selection; confirmed deletion disables merge', async () => {
        await openActivityDocuments(documentQA, attachedActivityId);
        await waitCount(documentQA, '#documentList [data-document-id]', 4);
        const pdfs = documentQA.locator('#documentDialog [data-pdf-id]');
        assert.equal(await pdfs.count(), 2);
        await pdfs.nth(0).check(); await pdfs.nth(1).check();
        assert.ok(await documentQA.locator('#mergeButton').isEnabled());
        const uploadedRow = documentRow(uploadedPdfName);
        const uploadedId = await uploadedRow.getAttribute('data-document-id');
        await uploadedRow.locator('[data-action="delete-document"]').click();
        await documentQA.locator('#deleteDocumentDialog').waitFor({ state: 'visible' });
        assert.equal(await documentQA.locator('#deleteDocumentName').innerText(), uploadedPdfName);
        await dismiss(documentQA, 'deleteDocumentDialog');
        await waitCount(documentQA, '#documentList [data-document-id]', 4);
        assert.equal(await documentQA.locator('#documentDialog [data-pdf-id]:checked').count(), 2);
        assert.ok(await documentQA.locator('#mergeButton').isEnabled());
        await removeDocument(documentQA, uploadedId);
        await waitCount(documentQA, '#documentList [data-document-id]', 3);
        assert.equal(await documentQA.locator('#documentDialog [data-pdf-id]:checked').count(), 1);
        assert.ok(await documentQA.locator('#mergeButton').isDisabled());
        await dismiss(documentQA, 'documentDialog');
        await reloadReady(documentQA);
        const activity = documentQA.locator(`#scheduleBody tr[data-activity-id="${attachedActivityId}"]`);
        await activity.waitFor({ state: 'visible' });
        assert.match(await activity.innerText(), /5 dokumen/);
        assert.equal((await readStored(documentQA)).documents.filter(record => record.id === uploadedId).length, 0);
      });

      await check('Templates can be uploaded in document management and merged or deleted without changing originals', async () => {
        const id = templateActivityId;
        await openActivityDocuments(documentQA, id);
        const templateId = (await readStored(documentQA)).documents.find(record => record.activityId === id && record.kind === 'pdf').id;
        await documentQA.locator('#templateDocumentUpload').setInputFiles({ name: 'Template-additional.pdf', mimeType: 'application/pdf', buffer: pdfThree });
        await waitCount(documentQA, '#templateDocumentList [data-document-id]', 5);
        await waitCount(documentQA, '#documentList [data-document-id]', 0);
        assert.match(await documentQA.locator('#documentCount').innerText(), /\b5\b/);
        const selected = documentQA.locator('#documentDialog [data-pdf-id]:checked');
        while (await selected.count()) await selected.first().uncheck();
        await documentQA.locator(`#templateDocumentList [data-pdf-id="${templateId}"]`).check();
        await documentRow('Template-additional.pdf').locator('[data-pdf-id]').check();
        await documentQA.locator('#mergeName').fill('QA-template-merged-delete');
        await documentQA.locator('#mergeButton').click();
        await documentQA.locator('#mergeResult').waitFor({ state: 'visible' });
        const mergedRecord = (await readStored(documentQA)).documents.find(record => record.activityId === id && record.source === 'Hasil gabungan');
        assert.ok(mergedRecord);
        const mergedRow = documentQA.locator(`#documentList [data-document-id="${mergedRecord.id}"]`);
        const bytes = await downloadDocument(documentQA, mergedRow, 'template-merged-before-delete.pdf');
        const merged = await PDFDocument.load(bytes);
        assert.equal(merged.getPageCount(), 2);
        assert.deepEqual(merged.getPages().map(page => page.getSize()), [{ width: 420, height: 595 }, { width: 500, height: 650 }]);
        await removeDocument(documentQA, mergedRecord.id);
        await waitCount(documentQA, '#documentList [data-document-id]', 0);
        await removeDocument(documentQA, templateId);
        await waitCount(documentQA, '#templateDocumentList [data-document-id]', 4);
        await dismiss(documentQA, 'documentDialog');
        await reloadReady(documentQA);
        await documentQA.locator(`#scheduleBody tr[data-activity-id="${id}"]`).waitFor({ state: 'visible' });
        const remaining = (await readStored(documentQA)).documents.filter(record => record.activityId === id);
        assert.equal(remaining.length, 4);
        assert.ok(remaining.every(record => record.source === 'Template'));
        await openActivityDocuments(documentQA, id);
        const originalBytes = await downloadDocument(documentQA, documentRow('Template-additional.pdf'), 'template-additional-original.pdf');
        assert.deepEqual(originalBytes, pdfThree);
        await dismiss(documentQA, 'documentDialog');
        report.templates = { uploadedFormats: ['pdf', 'docx', 'jpg', 'png'], templateActivityId, attachmentActivityId: attachedActivityId, generatedPdfs: 0 };
      });

      await check('Desktop and mobile typography keep body and form text readable', async () => {
        await reloadReady(documentQA);
        report.typography = [];
        async function audit(label) {
          const metrics = await documentQA.evaluate(() => {
            const visible = element => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
            const texts = [...document.querySelectorAll('body *')].filter(element => visible(element) && [...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())).map(element => ({
              element: element.id ? `#${element.id}` : `${element.tagName.toLowerCase()}.${typeof element.className === 'string' ? element.className.trim().replace(/\s+/g, '.') : ''}`,
              text: element.textContent.trim().slice(0, 70),
              size: parseFloat(getComputedStyle(element).fontSize),
            }));
            const inputs = [...document.querySelectorAll('input:not([type="checkbox"]):not([type="file"]):not([type="hidden"]),textarea,select')].filter(visible).map(element => ({ element: `#${element.id}`, size: parseFloat(getComputedStyle(element).fontSize) }));
            return { body: parseFloat(getComputedStyle(document.body).fontSize), minimumVisibleText: Math.min(...texts.map(entry => entry.size)), minimumFormText: Math.min(...inputs.map(entry => entry.size)), smallText: texts.filter(entry => entry.size < 14).slice(0, 15), smallInputs: inputs.filter(entry => entry.size < 16) };
          });
          report.typography.push({ label, ...metrics });
          assert.ok(metrics.body >= 16, `${label}: body font is at least 16px`);
          assert.deepEqual(metrics.smallText, [], `${label}: secondary text is at least 14px`);
          assert.deepEqual(metrics.smallInputs, [], `${label}: form fields use at least 16px`);
        }
        while (await documentQA.locator('#toastRegion button').count()) await documentQA.locator('#toastRegion button').first().click();
        await documentQA.evaluate(() => window.scrollTo(0, 0));
        await audit('desktop dashboard');
        await documentQA.screenshot({ path: path.join(artifactDir, 'large-font-desktop.png') });
        await openActivityDocuments(documentQA, attachedActivityId);
        await audit('desktop grouped documents');
        await documentQA.screenshot({ path: path.join(artifactDir, 'user-template-document-groups.png') });
        await dismiss(documentQA, 'documentDialog');
        for (const width of [390, 320]) {
          await documentQA.setViewportSize({ width, height: 844 });
          await documentQA.evaluate(() => window.scrollTo(0, 0));
          await audit(`mobile ${width}px dashboard`);
          assert.ok(await documentQA.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
          await documentQA.screenshot({ path: path.join(artifactDir, `large-font-mobile-${width}.png`) });
          await fillActivityForm('QA typography form', '2026-12-31', 'upcoming', documentQA, { templates: [templateFiles[0]], files: [creationFiles[1]] });
          await audit(`mobile ${width}px activity form`);
          await assertFits(documentQA, '#activityDialog', width);
          await documentQA.locator('#activityTemplateList').scrollIntoViewIfNeeded();
          await documentQA.screenshot({ path: path.join(artifactDir, `user-template-form-mobile-${width}.png`) });
          await dismiss(documentQA, 'activityDialog');
        }
      });
    } catch (error) {
      await documentQA.screenshot({ path: path.join(artifactDir, 'attachments-document-delete-failure.png'), fullPage: true }).catch(() => {});
      throw error;
    } finally {
      await attachmentContext.close();
    }

    await check('Deleting every seed document persists an empty document list without deleting its activity', async () => {
      const emptySeedContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      const emptySeed = await emptySeedContext.newPage();
      observePage(emptySeed);
      try {
        await openReady(emptySeed);
        await openActivityDocuments(emptySeed, 'a01');
        const examples = (await readStored(emptySeed)).documents;
        assert.equal(examples.length, 3, 'Fresh context contains only the three seed examples');
        for (const record of examples) await removeDocument(emptySeed, record.id);
        await waitCount(emptySeed, '#documentList [data-document-id]', 0);
        assert.equal((await readStored(emptySeed)).documents.length, 0);
        await dismiss(emptySeed, 'documentDialog');
        await reloadReady(emptySeed);
        await waitCount(emptySeed, '#scheduleBody tr[data-activity-id]', 24);
        assert.match(await emptySeed.locator('#kpiCompleted').innerText(), /^15\b/);
        await openActivityDocuments(emptySeed, 'a01');
        await waitCount(emptySeed, '#documentList [data-document-id]', 0);
        assert.equal((await readStored(emptySeed)).documents.length, 0, 'Last removed example does not regenerate on reload');
        await emptySeed.screenshot({ path: path.join(artifactDir, 'deleted-all-seed-documents.png') });
        const freshTab = await emptySeedContext.newPage();
        observePage(freshTab);
        await openReady(freshTab);
        await openActivityDocuments(freshTab, 'a01');
        await waitCount(freshTab, '#documentList [data-document-id]', 0);
        assert.equal((await readStored(freshTab)).documents.length, 0, 'Fresh tab also preserves removed examples');
      } finally {
        await emptySeedContext.close();
      }
    });

    await check('Application has no uncaught JavaScript errors', async () => {
      assert.deepEqual(pageErrors, []);
    });
    report.status = 'passed';
  } catch (error) {
    report.status = 'failed'; report.error = error.stack;
    console.error(error.stack);
    if (page) await page.screenshot({ path: path.join(artifactDir, 'failure.png'), fullPage: true }).catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
    report.finishedAt = new Date().toISOString();
    fs.writeFileSync(path.join(artifactDir, 'qa-report.json'), JSON.stringify(report, null, 2));
    console.log(`Report: ${path.join(artifactDir, 'qa-report.json')}`);
    console.log(`${results.filter(result => result.status === 'passed').length}/${results.length} checks passed`);
  }
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
