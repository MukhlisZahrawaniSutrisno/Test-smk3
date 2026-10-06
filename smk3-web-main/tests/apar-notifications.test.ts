import assert from "node:assert/strict";
import test from "node:test";
import { runAparNotifications, type AparNotificationDatabase } from "../lib/apar-notifications";

type StoredLog = { aparId: string; tipe: string; tanggalExpiredSnapshot: Date; pesan: string };
type LogQuery = { where: { aparId: string; tanggalExpiredSnapshot: Date } };

function fixture() {
  const asset = { id: "a1", kodeApar: "APAR-1", lokasi: "Lobby", status: "ACTIVE", tanggalExpired: new Date("2026-10-06"), picNomorWa: "6281234567890" };
  const logs: StoredLog[] = [];
  let locked = false;
  const storage = {
    apar: { findMany: async () => [asset], findUnique: async () => asset },
    notifikasiApar: {
      findMany: async ({ where }: LogQuery) => logs.filter(log => log.aparId === where.aparId && +log.tanggalExpiredSnapshot === +where.tanggalExpiredSnapshot),
      create: async ({ data }: { data: StoredLog }) => { logs.push(data); return data; },
    },
  };
  type TestTransaction = typeof storage & { $queryRaw: () => Promise<{ locked: boolean }[]> };
  const db = {
    ...storage,
    $transaction: async <T>(fn: (tx: TestTransaction) => Promise<T>) => {
      let acquired = false;
      const tx: TestTransaction = { ...storage, $queryRaw: async () => {
        if (locked) return [{ locked: false }];
        locked = true; acquired = true; return [{ locked: true }];
      } };
      try { return await fn(tx); } finally { if (acquired) locked = false; }
    },
  } as unknown as AparNotificationDatabase;
  return { db, asset, logs };
}
const now = new Date("2026-10-06T00:00:00Z");

test("successful notifications are recorded once per expiry cycle", async () => {
  const f = fixture(); let wa = 0; let email = 0;
  const deps = { db: f.db, now, waTo: "", emailTo: "k3@example.com", sendWhatsApp: async () => { wa++; }, sendEmail: async () => { email++; } };
  const first = await runAparNotifications(deps);
  await runAparNotifications(deps);
  assert.equal(first.created, 3); assert.equal(f.logs.length, 3); assert.equal(wa, 1); assert.equal(email, 1);
  f.asset.tanggalExpired = new Date("2026-10-05");
  await runAparNotifications(deps);
  assert.equal(f.logs.length, 6); assert.equal(wa, 2); assert.equal(email, 2);
});
test("failed WA creates no log, does not suppress email, and retries next run", async () => {
  const f = fixture(); let wa = 0; let email = 0;
  const deps = { db: f.db, now, waTo: "", emailTo: "k3@example.com", sendWhatsApp: async () => { if (++wa === 1) throw new Error("gateway down"); }, sendEmail: async () => { email++; } };
  const first = await runAparNotifications(deps);
  assert.equal(first.errors.length, 1); assert.deepEqual(f.logs.map(l => l.tipe), ["WEB_WARNING", "EMAIL_EXPIRED"]);
  const second = await runAparNotifications(deps);
  assert.equal(second.errors.length, 0); assert.equal(wa, 2); assert.equal(email, 1); assert.equal(f.logs.length, 3);
});
test("non-active assets are never notified", async () => {
  for (const status of ["IN_MAINTENANCE", "REFILLED", "DISPOSED"]) {
    const f = fixture(); f.asset.status = status;
    await runAparNotifications({ db: f.db, now, sendWhatsApp: async () => { assert.fail("WA sent"); }, sendEmail: async () => { assert.fail("email sent"); } });
    assert.equal(f.logs.length, 0);
  }
});
test("missing recipients are failures without successful external logs", async () => {
  const f = fixture(); f.asset.picNomorWa = "";
  const result = await runAparNotifications({ db: f.db, now, sendWhatsApp: async () => {}, sendEmail: async () => {} });
  assert.equal(result.errors.length, 2); assert.deepEqual(f.logs.map(l => l.tipe), ["WEB_WARNING"]);
});
test("email failure retains successful WA and retries email alone", async () => {
  const f = fixture(); let wa = 0; let email = 0;
  const deps = { db: f.db, now, emailTo: "k3@example.com", sendWhatsApp: async () => { wa++; }, sendEmail: async () => { if (++email === 1) throw new Error("SMTP down"); } };
  const first = await runAparNotifications(deps);
  assert.equal(first.errors.length, 1);
  assert.deepEqual(f.logs.map(l => l.tipe), ["WEB_WARNING", "WA_EXPIRED"]);
  await runAparNotifications(deps);
  assert.equal(wa, 1); assert.equal(email, 2); assert.equal(f.logs.length, 3);
});
test("warning window creates web notification without external sends", async () => {
  const f = fixture();
  const result = await runAparNotifications({ db: f.db, now: new Date("2026-08-06"), sendWhatsApp: async () => { assert.fail("WA sent early"); }, sendEmail: async () => { assert.fail("email sent early"); } });
  assert.equal(result.created, 1); assert.deepEqual(f.logs.map(l => l.tipe), ["WEB_WARNING"]);
});
test("overlapping cron skips an asset locked by another invocation", async () => {
  const f = fixture(); let entered!: () => void; let release!: () => void;
  const started = new Promise<void>(resolve => { entered = resolve; });
  const waiting = new Promise<void>(resolve => { release = resolve; });
  let wa = 0;
  const deps = { db: f.db, now, emailTo: "k3@example.com", sendWhatsApp: async () => { wa++; entered(); await waiting; }, sendEmail: async () => {} };
  const first = runAparNotifications(deps);
  await started;
  const overlapping = await runAparNotifications(deps);
  assert.equal(overlapping.skippedLocked, 1); assert.equal(overlapping.created, 0);
  release(); await first;
  assert.equal(wa, 1); assert.equal(f.logs.length, 3);
});
