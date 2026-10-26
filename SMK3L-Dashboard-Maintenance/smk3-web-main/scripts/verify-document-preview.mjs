import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile, readdir, mkdir, mkdtemp, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../public/', import.meta.url));
const artifacts = fileURLToPath(new URL('../artifacts/document-preview/', import.meta.url));
const tempRoot = path.resolve(tmpdir());
const profile = await mkdtemp(path.join(tempRoot, 'smk3l-preview-qa-'));
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const filename = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!filename.startsWith(root)) { res.writeHead(403).end(); return; }
    let body = await readFile(filename);
    if (filename.endsWith('dashboard-smk3l-2026.html')) {
      // Test hook only: open a real local Blob through the production preview flow.
      const html = body.toString();
      const marker = html.lastIndexOf('    })();');
      assert.ok(marker > 0);
      body = Buffer.from(html.slice(0, marker) + `window.__openPreview = async blob => { const record = {id:'qa-docx',activityId:activities[0].id,name:'Dokumen pemeriksaan.docx',kind:'docx',size:blob.size,blob,createdAt:new Date().toISOString()}; records.push(record); await previewDocument(record); };
window.__agendaQA = {snapshot:()=>JSON.stringify(activities),seed:()=>{activities.push({...activities[0],id:'qa-year-2027',name:'Agenda uji 2027',plannedDate:'2027-01-15'},{...activities[0],id:'qa-year-2042',name:'Agenda uji 2042',plannedDate:'2042-01-15'});},cleanup:()=>{for(let i=activities.length-1;i>=0;i--)if(activities[i].id.startsWith('qa-year-'))activities.splice(i,1);}};\n` + html.slice(marker));
    }
    res.setHeader('Content-Type', filename.endsWith('.js') ? 'text/javascript' : filename.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream');
    res.end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
let socket;
const pending = new Map();
let sequence = 0;
let sessionId;
function send(method, params = {}, session = sessionId) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 90000);
    pending.set(id, {resolve, reject, timeout});
    socket.send(JSON.stringify({id, method, params, ...(session ? {sessionId:session} : {})}));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {expression, awaitPromise:true, returnByValue:true});
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
try {
  let executable = process.env.CHROME_PATH;
  if (!executable) {
    const cache = path.join(process.env.LOCALAPPDATA, 'ms-playwright');
    const versions = (await readdir(cache)).filter(name => /^chromium-\d+$/.test(name)).sort((a,b) => Number(b.split('-')[1])-Number(a.split('-')[1]));
    executable = path.join(cache, versions[0], 'chrome-win64', 'chrome.exe');
  }
  browser = spawn(executable, ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], {windowsHide:true});
  const endpoint = await new Promise((resolve,reject) => {
    let output = '';
    const timeout = setTimeout(() => reject(new Error('Browser did not start: ' + output)), 20000);
    browser.once('error', reject);
    browser.stderr.on('data', chunk => { output += chunk; const found = output.match(/DevTools listening on (ws:\/\/[^\s]+)/); if (found) { clearTimeout(timeout); resolve(found[1]); } });
  });
  socket = new WebSocket(endpoint);
  await new Promise((resolve,reject) => { socket.onopen = resolve; socket.onerror = reject; });
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    const item = pending.get(message.id);
    if (!item) return;
    pending.delete(message.id); clearTimeout(item.timeout);
    if (message.error) item.reject(new Error(message.error.message)); else item.resolve(message.result);
  };
  const target = await send('Target.createTarget', {url:'about:blank'}, null);
  sessionId = (await send('Target.attachToTarget', {targetId:target.targetId, flatten:true}, null)).sessionId;
  await send('Network.enable');
  await send('Network.setBlockedURLs', {urls:['https://*','http://fonts.*']});
  await send('Emulation.setDeviceMetricsOverride', {width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate', {url:`http://127.0.0.1:${server.address().port}/dashboard-smk3l-2026.html`});
  for (let n=0; n<100; n++) {
    if (await evaluate('!!window.__openPreview && !!window.Smk3lDocumentPreview && !!window.PDFLib && document.body.dataset.ready === "true"')) break;
    if (n===99) throw new Error('Dashboard did not initialize');
    await new Promise(resolve => setTimeout(resolve,100));
  }
  const agenda = await evaluate(`(() => {
    const before=__agendaQA.snapshot();
    const today=new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',timeZone:'Asia/Jakarta'}).formatToParts(new Date());
    const year=today.find(part=>part.type==='year').value,month=Number(today.find(part=>part.type==='month').value)-1;
    document.getElementById('searchInput').value='filter lama';
    document.getElementById('statusFilter').value='missed';
    document.getElementById('focusCurrentMonth').click();
    const currentIds=Array.from(document.querySelectorAll('#scheduleBody tr'),row=>row.dataset.activityId);
    const activityDate=item=>item.status==='rescheduled'&&item.rescheduledDate?item.rescheduledDate:item.plannedDate;
    const expectedIds=JSON.parse(before).filter(item=>activityDate(item).slice(0,4)===year&&Number(activityDate(item).slice(5,7))-1===month).sort((a,b)=>activityDate(a).localeCompare(activityDate(b))||a.name.localeCompare(b.name,'id-ID')).map(item=>item.id);
    const activeMonth=document.getElementById('calendarMonthInput').value;
    const yearValue=document.getElementById('yearFilter').value;
    const searchCleared=document.getElementById('searchInput').value==='';
    __agendaQA.seed();
    document.getElementById('resetFilters').click();
    const field=document.getElementById('yearFilter');
    field.value='2027';field.dispatchEvent(new Event('change'));
    const year2027=Array.from(document.querySelectorAll('#scheduleBody tr'),row=>row.dataset.activityId);
    field.value='2042';field.dispatchEvent(new Event('change'));
    const year2042=Array.from(document.querySelectorAll('#scheduleBody tr'),row=>row.dataset.activityId);
    __agendaQA.cleanup();document.getElementById('resetFilters').click();
    const metadata=document.querySelector('.activity-meta');
    return {currentIds,expectedIds,activeMonth,month,yearValue,year,searchCleared,year2027,year2042,dataUnchanged:before===__agendaQA.snapshot(),oldStatusVisible:document.body.innerText.includes('Rescheduled'),fontSize:parseFloat(getComputedStyle(metadata).fontSize),pageFits:document.documentElement.scrollWidth<=innerWidth+1};
  })()`);
  assert.deepEqual(agenda.currentIds,agenda.expectedIds);
  assert.equal(agenda.activeMonth,String(agenda.month));
  assert.equal(agenda.yearValue,agenda.year);
  assert.ok(agenda.searchCleared && agenda.dataUnchanged && agenda.pageFits);
  assert.deepEqual(agenda.year2027,['qa-year-2027']);
  assert.deepEqual(agenda.year2042,['qa-year-2042']);
  assert.ok(!agenda.oldStatusVisible && agenda.fontSize>=15);
  const actions=await evaluate(`(() => {
    const rows=Array.from(document.querySelectorAll('#scheduleBody tr'));
    return {noMenu:!document.querySelector('.action-menu-toggle'),visible:rows.every(row=>{
      const group=row.querySelector('.activity-actions');if(!group)return false;
      const buttons=Array.from(group.querySelectorAll('button'));
      return buttons.length===2&&buttons.every(button=>button.dataset.id===row.dataset.activityId&&button.getBoundingClientRect().width>0&&button.getBoundingClientRect().height>=36)&&buttons[1].dataset.action==='delete';
    })};
  })()`);
  assert.ok(actions.noMenu&&actions.visible,'each activity should expose two separate visible action buttons');
  const rescheduleAction=await evaluate(`(() => {
    const before=__agendaQA.snapshot();
    const button=document.querySelector('#scheduleBody [data-action="reschedule"]');
    const label=button.textContent.trim();button.click();
    const opened=document.getElementById('rescheduleDialog').open&&document.getElementById('editActivityStatus').value==='rescheduled';
    document.getElementById('rescheduleDialog').close();
    return {label,opened,unchanged:before===__agendaQA.snapshot()};
  })()`);
  assert.ok(rescheduleAction.opened&&rescheduleAction.unchanged&&rescheduleAction.label==='Atur ulang');
  const calendar = await evaluate(`(() => {
    const before=__agendaQA.snapshot();
    const field=document.getElementById('yearFilter'),month=document.getElementById('calendarMonthInput');
    const change=(year,value)=>{field.value=year;field.dispatchEvent(new Event('change'));month.value=value;month.dispatchEvent(new Event('change'));};
    const record=JSON.parse(before).find(item=>item.status==='rescheduled');
    change(record.rescheduledDate.slice(0,4),String(Number(record.rescheduledDate.slice(5,7))-1));
    const button=document.querySelector('[data-calendar-date="'+record.rescheduledDate+'"]');
    const onNewDate=!!button.querySelector('[data-calendar-activity="'+record.id+'"]');
    button.click();
    const dayOpens=document.getElementById('calendarDayDialog').open;
    const dailyIds=Array.from(document.querySelectorAll('#scheduleBody tr'),row=>row.dataset.activityId);
    const datesShown=document.querySelectorAll('.calendar-entry-dates dd').length;
    document.querySelector('#calendarDayDialog [data-action="documents"]').click();
    const documentsOpen=!document.getElementById('calendarDayDialog').open&&document.getElementById('documentActivitySelect').value===record.id;
    document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());
    document.querySelector('[data-calendar-date="'+record.rescheduledDate+'"]').click();
    document.querySelector('#calendarDayDialog [data-action="edit-status"]').click();
    const editOpens=document.getElementById('rescheduleDialog').open&&document.getElementById('editActivityTitle').value===record.name;
    document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());
    document.querySelector('[data-calendar-date="'+record.rescheduledDate+'"]').click();
    document.querySelector('#calendarDayDialog [data-action="delete"]').click();
    const deleteOpens=!document.getElementById('calendarDayDialog').open&&!!document.querySelector('dialog[open]');
    document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());
    document.getElementById('showMonthAgenda').click();
    change(record.plannedDate.slice(0,4),String(Number(record.plannedDate.slice(5,7))-1));
    const offOldDate=!document.querySelector('[data-calendar-date="'+record.plannedDate+'"] [data-calendar-activity="'+record.id+'"]');
    change('2026','0');
    const lowerBound=document.getElementById('previousCalendarMonth').disabled;
    change('2026','11');document.getElementById('nextCalendarMonth').click();
    const rollover=field.value==='2027'&&month.value==='0';
    change('2028','1');
    const leapDay=!!document.querySelector('[data-calendar-date="2028-02-29"]');
    const leapWeeks=document.querySelectorAll('.calendar-table tbody tr').length;
    const keyboard=document.querySelector('[data-calendar-date="2028-02-28"]');keyboard.focus();keyboard.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
    const keyboardWorks=document.activeElement.dataset.calendarDate==='2028-02-29';
    document.querySelector('[data-calendar-date="2028-02-29"]').click();
    const emptyDay=!!document.querySelector('.calendar-day-empty');
    document.getElementById('addCalendarActivity').click();
    const prefilled=document.getElementById('activityDialog').open&&document.getElementById('activityDate').value==='2028-02-29';
    document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());
    document.getElementById('resetFilters').click();document.getElementById('focusCurrentMonth').click();
    return {onNewDate,offOldDate,dayOpens,dailyIds,recordId:record.id,datesShown,documentsOpen,editOpens,deleteOpens,lowerBound,rollover,leapDay,leapWeeks,keyboardWorks,emptyDay,prefilled,unchanged:before===__agendaQA.snapshot()};
  })()`);
  assert.ok(calendar.onNewDate&&calendar.offOldDate&&calendar.dayOpens&&calendar.datesShown===2&&calendar.documentsOpen&&calendar.editOpens&&calendar.deleteOpens);
  assert.deepEqual(calendar.dailyIds,[calendar.recordId]);
  assert.ok(calendar.lowerBound&&calendar.rollover&&calendar.leapDay&&calendar.leapWeeks===5);
  assert.ok(calendar.keyboardWorks&&calendar.emptyDay&&calendar.prefilled&&calendar.unchanged);
  console.log('Calendar verified:',JSON.stringify(calendar));
  await mkdir(artifacts,{recursive:true});
  await evaluate('document.querySelector(".safety-calendar").scrollIntoView({block:"start"}); new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  await writeFile(path.join(artifacts,'calendar-desktop.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  await evaluate('document.querySelector("[data-calendar-date=\\"2026-10-28\\"]").click(); new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  await writeFile(path.join(artifacts,'calendar-day.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  await evaluate('document.getElementById("calendarDayDialog").close();document.getElementById("showMonthAgenda").click();window.scrollTo(0,0);new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  await writeFile(path.join(artifacts,'dashboard-desktop.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  for(const width of [1366,1100]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const laptopActionsFit=await evaluate('(() => {const scope=getComputedStyle(document.querySelector(".table-wrap")).display==="none"?"#mobileSchedule":"#scheduleBody";const buttons=Array.from(document.querySelectorAll(scope+" .activity-action"));return document.documentElement.scrollWidth<=innerWidth+1&&buttons.length>0&&buttons.every(button=>button.getBoundingClientRect().right<=innerWidth&&button.getBoundingClientRect().height>=36);})()');
    assert.ok(laptopActionsFit,'activity action buttons should fit laptop screens at '+width+'px');
  }
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  const dashboardMobile = await evaluate('({fits:document.documentElement.scrollWidth<=innerWidth+1,cards:getComputedStyle(document.getElementById("mobileSchedule")).display,focusFits:document.getElementById("focusCurrentMonth").getBoundingClientRect().right<=innerWidth,actionsFit:Array.from(document.querySelectorAll("#mobileSchedule .activity-action")).every(button=>button.getBoundingClientRect().right<=innerWidth&&button.getBoundingClientRect().height>=44)})');
  assert.ok(dashboardMobile.fits && dashboardMobile.focusFits && dashboardMobile.cards==='grid'&&dashboardMobile.actionsFit);
  await writeFile(path.join(artifacts,'dashboard-mobile.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  await evaluate('document.querySelector(".safety-calendar").scrollIntoView({block:"start"}); new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  const calendarFits = await evaluate('document.querySelector(".calendar-table").getBoundingClientRect().right<=innerWidth');
  assert.ok(calendarFits,'calendar should fit the mobile viewport');
  await writeFile(path.join(artifacts,'calendar-mobile.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  await evaluate('document.querySelector(".mobile-activity").scrollIntoView({block:"start"});new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  await writeFile(path.join(artifacts,'activity-actions-mobile.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  console.log('Dashboard verified: current month, exact year, future years, readable text, unchanged data.');
  const result = await evaluate(`(async () => {
    await new Promise((resolve,reject) => {const script=document.createElement('script');script.src='./vendor/document-preview/jszip-3.10.1.min.js';script.onload=resolve;script.onerror=reject;document.head.append(script);});
    const logo=document.createElement('canvas');logo.width=160;logo.height=60;const c=logo.getContext('2d');c.fillStyle='#e30613';c.fillRect(0,0,160,60);c.fillStyle='white';c.font='bold 24px Arial';c.fillText('SMK3L',35,39);
    const zip=new JSZip();
    zip.file('[Content_Types].xml','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/></Types>');
    zip.file('_rels/.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
    zip.file('word/_rels/document.xml.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rLogo" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.png"/><Relationship Id="rHeader" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/></Relationships>');
    zip.file('word/media/logo.png',logo.toDataURL('image/png').split(',')[1],{base64:true});
    zip.file('word/header1.xml','<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:r><w:t>FORMULIR PEMERIKSAAN SMK3L</w:t></w:r></w:p></w:hdr>');
    const image='<w:p><w:r><w:drawing><wp:inline><wp:extent cx="1524000" cy="571500"/><wp:docPr id="1" name="Logo"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="Logo"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rLogo"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="1524000" cy="571500"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';
    const section='<w:sectPr><w:type w:val="nextPage"/><w:headerReference w:type="default" r:id="rHeader"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="400" w:footer="400"/></w:sectPr>';
    const landscape='<w:sectPr><w:type w:val="nextPage"/><w:headerReference w:type="default" r:id="rHeader"/><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="400" w:footer="400"/></w:sectPr>';
    zip.file('word/document.xml','<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>'+image+'<w:p><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>Pemeriksaan keselamatan kerja</w:t></w:r></w:p><w:tbl><w:tblPr><w:tblW w:w="8000" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="8"/><w:left w:val="single" w:sz="8"/><w:bottom w:val="single" w:sz="8"/><w:right w:val="single" w:sz="8"/><w:insideV w:val="single" w:sz="8"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="4000"/><w:gridCol w:w="4000"/></w:tblGrid><w:tr><w:tc><w:p><w:r><w:t>Nama kegiatan</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Inspeksi APAR</w:t></w:r></w:p></w:tc></w:tr></w:tbl><w:p><w:pPr>'+section+'</w:pPr></w:p>'+image+'<w:p><w:r><w:t>Halaman mendatar dengan foto dokumentasi</w:t></w:r></w:p>'+landscape+'</w:body></w:document>');
    window.__fixture=await zip.generateAsync({type:'blob'});
    let capture;
    Object.defineProperty(window,'html2canvas',{configurable:true,get:()=>capture,set:fn=>{capture=async (...args)=>{const canvas=await fn(...args);window.__capturedCanvas=canvas.toDataURL();return canvas;};}});
    const blob=await Smk3lDocumentPreview.convertToPdf(window.__fixture);
    const pdf=await PDFLib.PDFDocument.load(await blob.arrayBuffer());
    const dimensions=pdf.getPages().map(page=>({width:page.getWidth(),height:page.getHeight()}));
    let redPixels=0;
    for(const [,object] of pdf.context.enumerateIndirectObjects()) {
      if(object.dict?.get(PDFLib.PDFName.of('Subtype'))?.toString()!=='/Image')continue;
      if(object.dict.get(PDFLib.PDFName.of('ColorSpace'))?.toString()!=='/DeviceRGB')continue;
      const raw=new Uint8Array(await new Response(new Blob([object.getContents()]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer());
      for(let p=0;p<raw.length;p+=3)if(raw[p]>180&&raw[p+1]<80&&raw[p+2]<80)redPixels++;
    }
    let cancelled=false;
    try {await Smk3lDocumentPreview.convertToPdf(window.__fixture,{isCurrent:()=>false});} catch(error){cancelled=error.name==='AbortError';}
    let active=true;
    let cancelledDuringRender=false;
    try {await Smk3lDocumentPreview.convertToPdf(window.__fixture,{isCurrent:()=>active,onProgress:message=>{if(message.startsWith('Mengonversi'))active=false;}});} catch(error){cancelledDuringRender=error.name==='AbortError';}
    let invalidRejected=false;
    try {await Smk3lDocumentPreview.convertToPdf(new Blob(['invalid DOCX']));} catch{invalidRejected=true;}
    await window.__openPreview(window.__fixture);
    await Promise.all(Array.from(document.querySelectorAll('#previewContent img'),image=>image.decode()));
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const viewer=document.querySelector('#previewContent .preview-sheet');
    const initialWidth=viewer.getBoundingClientRect().width;
    const initialFrame=document.getElementById('previewContent').getBoundingClientRect();
    document.getElementById('previewZoomIn').click();
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const zoomedFrame=document.getElementById('previewContent').getBoundingClientRect();
    const zoom={level:document.getElementById('previewZoomLevel').textContent,pageIncreased:viewer.getBoundingClientRect().width>initialWidth,frameUnchanged:initialFrame.width===zoomedFrame.width&&initialFrame.height===zoomedFrame.height};
    document.getElementById('previewZoomReset').click();
    return {dimensions,redPixels,cancelled,cancelledDuringRender,invalidRejected,zoom,conversionFrames:document.querySelectorAll('iframe[aria-hidden="true"]').length,viewer:!!viewer};
  })()`);
  await mkdir(artifacts,{recursive:true});
  await writeFile(path.join(artifacts,'rendered-page.png'),Buffer.from((await evaluate('window.__capturedCanvas')).split(',')[1],'base64'));
  assert.equal(result.dimensions.length, 2, 'Word section breaks should produce two PDF pages');
  assert.ok(Math.abs(result.dimensions[0].width - 595.3) < 2);
  assert.ok(Math.abs(result.dimensions[0].height - 841.9) < 2);
  assert.ok(result.dimensions[1].width > result.dimensions[1].height, 'landscape page should stay landscape');
  assert.ok(result.redPixels > 1000, 'embedded logo should survive conversion into PDF pixels');
  assert.ok(result.cancelled && result.cancelledDuringRender && result.invalidRejected);
  assert.equal(result.conversionFrames, 0, 'conversion frames should always be removed');
  assert.ok(result.viewer && result.zoom.frameUnchanged, 'zoom should keep viewer controls at the same size');
  assert.equal(result.zoom.level, '110%');
  assert.ok(result.zoom.pageIncreased);
  await mkdir(artifacts, {recursive:true});
  await new Promise(resolve=>setTimeout(resolve,1200));
  await writeFile(path.join(artifacts,'desktop.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  const mobile=await evaluate('({width:document.getElementById("previewDialog").getBoundingClientRect().width,viewport:innerWidth,contentHeight:document.getElementById("previewContent").clientHeight})');
  assert.ok(mobile.width <= mobile.viewport);
  assert.ok(mobile.contentHeight > 200, 'mobile preview must have enough space to show pages');
  await writeFile(path.join(artifacts,'mobile.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  const sampleName = (await readdir(path.join(root,'dokumen'))).find(name=>name.endsWith('.docx'));
  if (sampleName) {
    await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
    const sample = (await readFile(path.join(root,'dokumen',sampleName))).toString('base64');
    await evaluate(`window.__openPreview(new Blob([Uint8Array.from(atob(${JSON.stringify(sample)}),char=>char.charCodeAt(0))]))`);
    const pages = await evaluate('document.querySelectorAll("#previewContent .preview-sheet").length');
    assert.ok(pages > 0, 'existing Word form should open through the full preview workflow');
    await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    await writeFile(path.join(artifacts,'existing-word-form.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
    console.log('Existing Word form verified:',pages,'PDF pages');
  }
  console.log(JSON.stringify(result,null,2));
  console.log('Browser verification passed; screenshots:',artifacts);
} finally {
  if (socket?.readyState===WebSocket.OPEN) { await send('Browser.close',{},null).catch(()=>{}); socket.close(); }
  if (browser && browser.exitCode===null) { browser.kill(); await new Promise(resolve=>browser.once('exit',resolve)); }
  server.close();
  if (path.dirname(profile) === tempRoot && path.basename(profile).startsWith('smk3l-preview-qa-')) {
    await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:200}).catch(()=>{});
  }
}
