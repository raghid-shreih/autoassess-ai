import { test, before, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import type { Server } from "node:http";
import { createApp } from "../server/app";
import { MemStorage, WorkflowError } from "../server/storage";
import { MAX_CLAIMS, normalizeImage } from "../server/uploads";
import sharp from "sharp";

let server: Server;
let base: string;
let imageData: string;
before(async () => {
  imageData = `data:image/png;base64,${(await readFile("tests/fixtures/car-damage.png")).toString("base64")}`;
});
beforeEach(async () => {
  ({ httpServer: server } = await createApp());
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  base = `http://127.0.0.1:${address.port}`;
});
afterEach(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});
async function request(path: string, method = "GET", body?: unknown) {
  const response = await fetch(base + path, {
    method, headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, data: await response.json() };
}
async function newClaim() {
  const result = await request("/api/claims/assess", "POST", { imageData });
  assert.equal(result.status, 200);
  return result.data;
}

test("uploads are decoded, normalized, and excluded from list payloads", async () => {
  const claim = await newClaim();
  assert.match(claim.imageUrl, /^data:image\/jpeg;base64,/);
  assert.ok(claim.damages.length >= 2);
  const list = await request("/api/claims");
  const summary = list.data.find((item: { id: string }) => item.id === claim.id);
  assert.equal(summary.imageUrl, undefined);
  assert.equal(summary.damages, undefined);
  assert.equal(summary.agentNotes, undefined);
  assert.equal(summary.damageCount, claim.damages.length);
  assert.equal((await request(`/api/claims/${claim.id}`)).data.imageUrl, claim.imageUrl);
});

test("invalid upload bodies, format mismatches and corrupt images are rejected", async () => {
  for (const body of [{}, { imageData: 42 }, { imageData: "not-an-image" }, { imageData, extra: true },
    { imageData: "data:image/png;base64,aGVsbG8=" }, { imageData: imageData.replace("image/png", "image/jpeg") }]) {
    assert.equal((await request("/api/claims/assess", "POST", body)).status, 400);
  }
});

test("image byte and pixel limits are enforced", async () => {
  await assert.rejects(normalizeImage(`data:image/png;base64,${Buffer.alloc(10 * 1024 * 1024 + 1).toString("base64")}`), /10 MB/);
  const large = await sharp({ create: { width: 4001, height: 4000, channels: 3, background: "white" } }).png().toBuffer();
  await assert.rejects(normalizeImage(`data:image/png;base64,${large.toString("base64")}`), /megapixel/);
});

test("damage updates validate editable fields and keep totals consistent", async () => {
  const claim = await newClaim();
  const path = `/api/claims/${claim.id}/damage/${claim.damages[0].id}`;
  for (const body of [{}, { laborCost: -1 }, { partsCost: "100" }, { partsCost: 1_000_001 },
    { severity: "invalid" }, { confidence: 300 }, { id: "replacement" }, { reasoning: "override" }]) {
    assert.equal((await request(path, "PATCH", body)).status, 400);
  }
  const edited = await request(path, "PATCH", { laborCost: 10.5, partsCost: 20.25, severity: "minor", action: "repair" });
  assert.equal(edited.status, 200);
  assert.equal(edited.data.id, claim.damages[0].id);
  const stored = (await request(`/api/claims/${claim.id}`)).data;
  assert.equal(stored.totalEstimate, stored.damages.reduce((sum: number, damage: { laborCost: number; partsCost: number }) => sum + damage.laborCost + damage.partsCost, 0));
});

test("draft notes persist and approval saves final notes while locking the claim", async () => {
  const claim = await newClaim();
  const path = `/api/claims/${claim.id}`;
  assert.equal((await request(`${path}/notes`, "PATCH", { notes: "Draft review notes" })).status, 200);
  assert.equal((await request(path)).data.agentNotes, "Draft review notes");
  const approved = await request(`${path}/approve`, "POST", { notes: "Final review notes" });
  assert.equal(approved.status, 200);
  assert.equal(approved.data.status, "approved");
  assert.equal((await request(path)).data.agentNotes, "Final review notes");
  for (const [suffix, method, body] of [
    ["/notes", "PATCH", { notes: "Changed" }], ["/flag", "POST", {}], ["/approve", "POST", {}],
    [`/damage/${claim.damages[0].id}`, "PATCH", { laborCost: 0 }],
  ] as const) assert.equal((await request(path + suffix, method, body)).status, 409);
});

test("manual review preserves notes and locks the flagged claim", async () => {
  const claim = await newClaim();
  const path = `/api/claims/${claim.id}`;
  const flagged = await request(`${path}/flag`, "POST", { notes: "Structural damage needs a specialist" });
  assert.equal(flagged.status, 200);
  assert.equal(flagged.data.status, "flagged");
  assert.equal((await request(path)).data.agentNotes, "Structural damage needs a specialist");
  assert.equal((await request(`${path}/approve`, "POST", {})).status, 409);
  assert.equal((await request(`${path}/damage/${claim.damages[0].id}`, "PATCH", { partsCost: 0 })).status, 409);
});

test("notes constraints and missing resources return useful status codes", async () => {
  const claims = (await request("/api/claims")).data;
  const id = claims.find((claim: { status: string }) => claim.status === "pending").id;
  for (const body of [{}, { notes: 1 }, { notes: "x".repeat(5001) }, { notes: "ok", status: "approved" }]) {
    assert.equal((await request(`/api/claims/${id}/notes`, "PATCH", body)).status, 400);
  }
  assert.equal((await request("/api/claims/missing")).status, 404);
  assert.equal((await request("/api/claims/missing/approve", "POST", {})).status, 404);
  assert.equal((await request(`/api/claims/${id}/damage/missing`, "PATCH", { partsCost: 1 })).status, 404);
  assert.equal((await request("/api/unknown")).status, 404);
});

test("invalid JSON returns an error without terminating the server", async () => {
  const response = await fetch(base + "/api/claims/assess", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" });
  assert.equal(response.status, 400);
  assert.equal((await request("/api/claims")).status, 200);
});

test("claim capacity is bounded and assessment requests are rate limited", async () => {
  const storage = new MemStorage();
  const claim = await storage.getClaimById((await storage.getAllClaims())[0].id);
  assert.ok(claim);
  const { id: _id, ...insert } = claim;
  for (let i = 7; i < MAX_CLAIMS; i++) await storage.createClaim(insert);
  await assert.rejects(storage.createClaim(insert), (error: unknown) => error instanceof WorkflowError && error.status === 429);
  // Earlier tests also exercise this endpoint; by the eleventh request the limit applies.
  const responses = [];
  for (let i = 0; i < 11; i++) responses.push((await request("/api/claims/assess", "POST", {})).status);
  assert.ok(responses.includes(429));
});
