import test from "node:test";
import assert from "node:assert/strict";
import { createSessionToken, verifySessionToken } from "../lib/session-token";

test("signed session token validates, expires, and rejects tampering", () => {
  const now = 1_800_000_000_000;
  const token = createSessionToken("user-1", "test-secret", now);
  assert.deepEqual(verifySessionToken(token, "test-secret", now), { userId: "user-1", expiresAt: now + 8 * 60 * 60 * 1000 });
  assert.equal(verifySessionToken(token, "another-secret", now), null);
  assert.equal(verifySessionToken(`${token}x`, "test-secret", now), null);
  assert.equal(verifySessionToken(token, "test-secret", now + 8 * 60 * 60 * 1000), null);
});
