import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dashboardPath = new URL("../public/dashboard-smk3l-2026.html", import.meta.url);

test("PDF selection accepts more than two documents", async () => {
  const html = await readFile(dashboardPath, "utf8");
  const start = html.indexOf("function renderSelection() {");
  const end = html.indexOf("document.querySelector('.document-layout')", start);
  assert.notEqual(start, -1, "selection renderer should exist");
  assert.notEqual(end, -1, "selection renderer should end before its event handler");
  const renderer = html.slice(start, end).trim();

  const selectedPdfIds = ["one", "two", "three"];
  const selectedPdfList = { innerHTML: "" };
  const selectionCount = { textContent: "" };
  const mergeButton = { disabled: true };
  const checkboxes = selectedPdfIds.map(id => ({ dataset: { pdfId: id }, checked: false, disabled: false }));
  const records = new Map(selectedPdfIds.map(id => [id, { id, name: `${id}.pdf` }]));
  const scope = {
    selectedPdfIds,
    documentById: (id: string) => records.get(id),
    escapeHTML: (value: string) => value,
    $: (id: string) => ({ selectionCount, selectedPdfList, mergeButton })[id],
    document: { querySelectorAll: (selector: string) => selector === "[data-pdf-id]" ? checkboxes : [] },
    window: { PDFLib: {} },
    mergeInProgress: false,
  };
  const renderSelection = new Function("scope", `with(scope) { return (${renderer}); }`)(scope) as () => void;
  renderSelection();

  assert.equal(selectionCount.textContent, "3 dipilih");
  assert.equal((selectedPdfList.innerHTML.match(/class="selected-file/g) || []).length, 3);
  assert.equal(mergeButton.disabled, false);
  assert.equal(checkboxes.some(checkbox => checkbox.disabled), false);
});
