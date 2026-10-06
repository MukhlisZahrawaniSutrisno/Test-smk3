import assert from "node:assert/strict";
import test from "node:test";
import { getJakartaToday, getWarningStart, getAparNotificationTypes } from "../lib/apar-policy";

test("Jakarta day changes at 17:00 UTC", () => {
  assert.equal(getJakartaToday(new Date("2026-10-05T16:59:59Z")).toISOString(), "2026-10-05T00:00:00.000Z");
  assert.equal(getJakartaToday(new Date("2026-10-05T17:00:00Z")).toISOString(), "2026-10-06T00:00:00.000Z");
});
test("two calendar months clamp month ends and handle leap years", () => {
  assert.equal(getWarningStart(new Date("2026-04-30")).toISOString().slice(0, 10), "2026-02-28");
  assert.equal(getWarningStart(new Date("2024-04-30")).toISOString().slice(0, 10), "2024-02-29");
  assert.equal(getWarningStart(new Date("2026-01-31")).toISOString().slice(0, 10), "2025-11-30");
});
test("warning boundary inclusive; external messages begin exactly on expiry and continue afterwards", () => {
  const expiry = new Date("2026-10-06");
  assert.deepEqual(getAparNotificationTypes(expiry, new Date("2026-08-05")), []);
  assert.deepEqual(getAparNotificationTypes(expiry, new Date("2026-08-06")), ["WEB_WARNING"]);
  assert.deepEqual(getAparNotificationTypes(expiry, new Date("2026-10-05")), ["WEB_WARNING"]);
  const expired = ["WEB_WARNING", "WA_EXPIRED", "EMAIL_EXPIRED"];
  assert.deepEqual(getAparNotificationTypes(expiry, new Date("2026-10-06")), expired);
  assert.deepEqual(getAparNotificationTypes(expiry, new Date("2026-12-31")), expired);
});
