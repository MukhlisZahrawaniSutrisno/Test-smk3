import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dashboardPath = new URL("../public/dashboard-smk3l-2026.html", import.meta.url);

test("demo upload keeps template and activity files locally when shared storage is unavailable", async () => {
  const html = await readFile(dashboardPath, "utf8");
  const start = html.indexOf("async function importFiles(files");
  const end = html.indexOf("async function readDocumentBlob(", start);
  assert.notEqual(start, -1, "upload handler should exist");
  assert.notEqual(end, -1, "upload handler should end before document reading");

  const handler = html.slice(start, end).trim().replace(
    "await import('https://esm.sh/@vercel/blob@2.8.2/client?bundle')",
    "await Promise.reject(new Error('shared storage unavailable'))",
  );
  const saved: Array<{ source: string; name: string; blob: unknown }> = [];

  for (const source of ["Template", "Unggahan"]) {
    const activity = { id: "a01", name: "Inspeksi APAR" };
    const status = { textContent: "" };
    const file = { name: `${source}.docx`, size: 12 };
    const scope = {
      activeActivityId: activity.id,
      activityById: () => activity,
      prepareUpload: async (_file: unknown, _target: string, _pdfOnly: boolean, fileSource: string) => ({
        id: `${fileSource}-id`, activityId: activity.id, name: file.name, kind: "docx", blob: file, size: file.size, source: fileSource,
      }),
      saveRecords: async (records: typeof saved) => saved.push(...records),
      records: [] as typeof saved,
      database: {},
      storageAvailable: true,
      selectedPdfIds: [],
      mergeInProgress: false,
      $: (id: string) => id === "storageStatus" ? status : {},
      renderDocuments: () => {},
      renderSchedule: () => {},
      paintIcons: () => {},
      toast: () => {},
    };
    const importFiles = new Function("scope", `with(scope) { return (${handler}); }`)(scope) as (
      files: Array<typeof file>, pdfOnly: boolean, fileSource: string,
    ) => Promise<void>;

    await importFiles([file], false, source);
    assert.equal(scope.records.length, 1, `${source} should appear in the document list`);
    assert.equal(scope.records[0].source, source);
    assert.equal(scope.records[0].blob, file, "the selected file content should be retained locally");
    assert.match(status.textContent, /tersimpan di browser ini saja/);
  }

  assert.deepEqual(saved.map(record => record.source), ["Template", "Unggahan"]);
});
