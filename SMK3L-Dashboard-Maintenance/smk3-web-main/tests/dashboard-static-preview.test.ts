import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createContext, runInContext} from "node:vm";
import test from "node:test";

async function zoomHarness(target: unknown) {
  const html = await readFile(new URL("../public/dashboard-smk3l-2026.html", import.meta.url), "utf8");
  const start = html.indexOf("function setPreviewZoom(value)");
  const end = html.indexOf("function previewMessage(", start);
  assert.ok(start >= 0 && end > start);
  const controls: Record<string, any> = {
    previewContent:{querySelector:() => target}, previewZoomLevel:{textContent:"100%"},
    previewZoomOut:{disabled:false}, previewZoomIn:{disabled:false}, previewZoomReset:{disabled:false}
  };
  const context = createContext({previewZoom:1, $:(id:string) => controls[id]});
  runInContext(html.slice(start, end), context);
  return {set:(value:number) => runInContext(`setPreviewZoom(${value})`, context), controls};
}

test("PDF zoom changes document scale without scaling the viewer frame", async () => {
  const target = {tagName:"IFRAME",classList:{contains:()=>false},dataset:{pdfUrl:"blob:preview"},src:"",style:{}};
  const zoom = await zoomHarness(target);
  zoom.set(1.1);
  assert.equal(target.src,"blob:preview#zoom=110");
  assert.deepEqual(target.style,{});
  zoom.set(20);
  assert.equal(zoom.controls.previewZoomLevel.textContent,"250%");
  assert.equal(zoom.controls.previewZoomIn.disabled,true);
  zoom.set(0.1);
  assert.equal(zoom.controls.previewZoomLevel.textContent,"50%");
  assert.equal(zoom.controls.previewZoomOut.disabled,true);
  zoom.set(1);
  assert.equal(zoom.controls.previewZoomLevel.textContent,"100%");
});

test("Word PDF page previews zoom together and reset to fitted widths", async () => {
  const sheets = [{dataset:{baseWidth:600},style:{width:"600px"}},{dataset:{baseWidth:800},style:{width:"800px"}}];
  const zoom = await zoomHarness({classList:{contains:()=>true},querySelectorAll:()=>sheets});
  zoom.set(1.5);
  assert.deepEqual(sheets.map(sheet=>sheet.style.width),["900px","1200px"]);
  zoom.set(1);
  assert.deepEqual(sheets.map(sheet=>sheet.style.width),["600px","800px"]);
});

test("zoom controls stay disabled while a preview is loading", async () => {
  const zoom = await zoomHarness(null);
  zoom.set(1);
  assert.ok(zoom.controls.previewZoomIn.disabled && zoom.controls.previewZoomOut.disabled && zoom.controls.previewZoomReset.disabled);
});
