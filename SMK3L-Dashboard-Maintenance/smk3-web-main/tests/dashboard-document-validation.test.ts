import assert from "node:assert/strict";
import test from "node:test";
import { getDashboardDocumentType, parseDashboardDocumentPayload } from "../lib/dashboard-document-validation";

test("recognizes only supported activity document formats", () => {
  assert.deepEqual(getDashboardDocumentType("bukti.PDF"), { kind: "pdf", contentType: "application/pdf" });
  assert.deepEqual(getDashboardDocumentType("foto.JPEG"), { kind: "jpg", contentType: "image/jpeg" });
  assert.deepEqual(getDashboardDocumentType("template.docx"), { kind: "docx", contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  assert.equal(getDashboardDocumentType("script.exe"), null);
});

test("accepts safe upload metadata for an activity document", () => {
  assert.deepEqual(parseDashboardDocumentPayload({
    activityId: "a01", name: "Bukti APAR.pdf", source: "Unggahan", pages: 2,
  }), {
    activityId: "a01", name: "Bukti APAR.pdf", kind: "pdf", contentType: "application/pdf", source: "Unggahan", pages: 2,
  });
});

test("rejects unsafe or unsupported upload metadata", () => {
  for (const payload of [
    { activityId: "../private", name: "bukti.pdf", source: "Unggahan", pages: 1 },
    { activityId: "a01", name: "bukti.exe", source: "Unggahan", pages: 0 },
    { activityId: "a01", name: "../bukti.pdf", source: "Unggahan", pages: 0 },
    { activityId: "a01", name: "bukti.pdf", source: "tidak dikenal", pages: 0 },
    { activityId: "a01", name: "bukti.pdf", source: "Unggahan", pages: -1 },
  ]) assert.equal(parseDashboardDocumentPayload(payload), null);
});
