import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, storedHash] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !storedHash) {
    const supplied = Buffer.from(password);
    const legacy = Buffer.from(stored);
    return { valid: supplied.length === legacy.length && timingSafeEqual(supplied, legacy), needsUpgrade: true };
  }

  const expected = Buffer.from(storedHash, "hex");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return { valid: expected.length === actual.length && timingSafeEqual(expected, actual), needsUpgrade: false };
}
