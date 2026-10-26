/* DOCX preview: preserve Word page geometry before producing a local PDF. */
(() => {
  'use strict';
  const assetRoot = new URL('./vendor/document-preview/', document.currentScript.src);
  let libraries;

  function loadScript(name) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL(name, assetRoot).href;
      script.onload = resolve;
      script.onerror = () => { script.remove(); reject(new Error('Komponen pratinjau gagal dimuat. Muat ulang halaman lalu coba lagi.')); };
      document.head.append(script);
    });
  }

  async function convertToPdf(blob, { isCurrent = () => true, onProgress = () => {} } = {}) {
    const check = () => { if (!isCurrent()) throw new DOMException('Pratinjau dibatalkan.', 'AbortError'); };
    if (!libraries) {
      libraries = Promise.all([
        loadScript('jszip-3.10.1.min.js').then(() => loadScript('docx-preview-0.3.7.min.js')),
        loadScript('html2canvas-1.4.1.min.js')
      ]).catch(error => { libraries = null; throw error; });
    }
    onProgress('Menyiapkan pratinjau Word…');
    await libraries;
    check();
    if (!window.PDFLib) throw new Error('Komponen PDF belum dimuat. Muat ulang halaman lalu coba lagi.');

    // Keep document CSS and links isolated from the dashboard, with scripts disabled.
    const frame = document.createElement('iframe');
    frame.title = 'Pemrosesan dokumen Word';
    frame.setAttribute('sandbox', 'allow-same-origin');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;left:-12000px;top:0;width:1200px;height:1600px;border:0;pointer-events:none;';
    const ready = new Promise((resolve, reject) => { frame.onload = resolve; frame.onerror = reject; });
    frame.srcdoc = `<!doctype html><html><head><meta charset="UTF-8"><meta http-equiv="Content-Security-Policy" content="script-src 'none'; object-src 'none'; img-src data: blob:; font-src data: blob:; connect-src 'none'"><style>html,body{margin:0;padding:0;background:white}section.docx{box-shadow:none!important;margin:0!important}a{pointer-events:none}</style></head><body></body></html>`;
    document.body.append(frame);
    try {
      await ready;
      check();
      const doc = frame.contentDocument;
      const archive = await window.JSZip.loadAsync(await blob.arrayBuffer());
      const main = archive.file('word/document.xml');
      if (!main) throw new Error('Berkas tidak memiliki struktur DOCX yang valid.');
      const xml = new DOMParser().parseFromString(await main.async('text'), 'application/xml');
      if (xml.getElementsByTagName('parsererror').length) throw new Error('Struktur dokumen Word tidak dapat dibaca.');
      const ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
      // Explicitly mark section boundaries in the preview copy: docxjs otherwise
      // groups differently sized consecutive sections into one sheet.
      for (const section of xml.getElementsByTagNameNS(ns, 'sectPr')) {
        if (section.parentNode.localName !== 'pPr') continue;
        const type = section.getElementsByTagNameNS(ns, 'type')[0]?.getAttributeNS(ns, 'val');
        if (type === 'continuous') continue;
        const paragraph = section.parentNode.parentNode;
        if (Array.from(paragraph.getElementsByTagNameNS(ns, 'br')).some(br => br.getAttributeNS(ns, 'type') === 'page')) continue;
        const run = xml.createElementNS(ns, 'w:r');
        const br = xml.createElementNS(ns, 'w:br'); br.setAttributeNS(ns, 'w:type', 'page');
        run.append(br); paragraph.append(run);
      }
      archive.file('word/document.xml', new XMLSerializer().serializeToString(xml));
      await window.docx.renderAsync(await archive.generateAsync({type:'uint8array'}), doc.body, doc.head, {
        inWrapper:false, ignoreWidth:false, ignoreHeight:false, ignoreFonts:false,
        breakPages:true, ignoreLastRenderedPageBreak:false, useBase64URL:true,
        renderHeaders:true, renderFooters:true, renderFootnotes:true, renderEndnotes:true,
        renderAltChunks:false, renderComments:false
      });
      check();
      for (const link of doc.querySelectorAll('a')) link.removeAttribute('href');
      // docxjs emits octet-stream data URLs. html2canvas recognizes embedded
      // images reliably when their actual MIME type is present.
      for (const image of doc.images) {
        if (!image.src.startsWith('data:application/octet-stream;base64,')) continue;
        const data = image.src.split(',')[1];
        const mime = data.startsWith('iVBOR') ? 'image/png' : data.startsWith('/9j/') ? 'image/jpeg' : data.startsWith('R0lGOD') ? 'image/gif' : data.startsWith('UklGR') ? 'image/webp' : null;
        if (mime) image.src = 'data:' + mime + ';base64,' + data;
      }
      await doc.fonts.ready;
      await Promise.all(Array.from(doc.images, image => image.decode()));
      check();
      const pages = Array.from(doc.querySelectorAll('body > section.docx'));
      if (!pages.length) throw new Error('Halaman Word tidak ditemukan. Pastikan berkas berformat DOCX dan tidak dilindungi kata sandi.');
      const pdf = await window.PDFLib.PDFDocument.create();
      const previewPages = [];
      for (let index = 0; index < pages.length; index++) {
        check();
        onProgress(`Mengonversi halaman ${index + 1} dari ${pages.length}…`);
        const page = pages[index];
        const style = frame.contentWindow.getComputedStyle(page);
        const width = page.getBoundingClientRect().width;
        const height = parseFloat(style.minHeight) || page.getBoundingClientRect().height;
        if (!(width > 0 && height > 0)) throw new Error('Ukuran halaman Word tidak dapat dibaca.');
        const canvas = await window.html2canvas(page, {
          scale:2, backgroundColor:'#ffffff', logging:false, useCORS:false,
          width:Math.ceil(width), height:Math.ceil(Math.max(height, page.scrollHeight)),
          windowWidth:1200, windowHeight:1600, scrollX:0, scrollY:0
        });
        check();
        // A section without Word page-break markers can overflow its paper size.
        // Split it into full-size sheets rather than shrinking the entire document.
        const sheetHeight = Math.round(height * canvas.width / width);
        for (let top = 0; top < canvas.height; top += sheetHeight) {
          const slice = document.createElement('canvas');
          slice.width = canvas.width; slice.height = sheetHeight;
          const context = slice.getContext('2d');
          context.fillStyle = '#ffffff'; context.fillRect(0, 0, slice.width, slice.height);
          context.drawImage(canvas, 0, top, canvas.width, Math.min(sheetHeight, canvas.height - top), 0, 0, slice.width, Math.min(sheetHeight, canvas.height - top));
          const src = slice.toDataURL('image/png');
          const image = await pdf.embedPng(src);
          const sheet = pdf.addPage([width * 0.75, height * 0.75]);
          sheet.drawImage(image, {x:0, y:0, width:sheet.getWidth(), height:sheet.getHeight()});
          previewPages.push({src, width, height});
          slice.width = 0; slice.height = 0;
        }
        canvas.width = 0; canvas.height = 0;
      }
      check();
      // Show the same page images embedded in the finished PDF. This avoids
      // depending on a browser PDF plug-in, which is unavailable on many phones.
      return Object.assign(new Blob([await pdf.save()], {type:'application/pdf'}), {previewPages});
    } finally {
      frame.remove();
    }
  }

  window.Smk3lDocumentPreview = Object.freeze({convertToPdf});
})();
