import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../lib/password";

test("hashed passwords verify and wrong passwords do not", async () => {
  const hash = await hashPassword("safe-password");
  assert.notEqual(hash, "safe-password");
  assert.deepEqual(await verifyPassword("safe-password", hash), { valid: true, needsUpgrade: false });
  assert.deepEqual(await verifyPassword("wrong-password", hash), { valid: false, needsUpgrade: false });
});

test("legacy plaintext passwords can be upgraded on successful login", async () => {
  assert.deepEqual(await verifyPassword("legacy", "legacy"), { valid: true, needsUpgrade: true });
  assert.deepEqual(await verifyPassword("wrong", "legacy"), { valid: false, needsUpgrade: true });
});
