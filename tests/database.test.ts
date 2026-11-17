// checks the sample data against the row schemas and the migrations against our rls rule
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { sampleData } from "@/lib/sample-data";
import { applicationRow, grantRow, memberRow, scoreRow } from "@/lib/schema";

describe("sample data", () => {
  const s = sampleData(new Date("2026-11-17T15:00:00Z"));

  it("matches the row schemas", () => {
    s.members.forEach((r) => memberRow.parse(r));
    s.grants.forEach((r) => grantRow.parse(r));
    s.scores.forEach((r) => scoreRow.parse(r));
    s.applications.forEach((r) => applicationRow.parse(r));
  });

  it("is all flagged as sample", () => {
    for (const rows of [s.members, s.grants, s.applications]) expect(rows.every((r) => r.is_sample)).toBe(true);
  });

  it("has consistent references", () => {
    const grantIds = new Set(s.grants.map((g) => g.id));
    const memberIds = new Set(s.members.map((m) => m.id));
    expect(s.scores.every((x) => grantIds.has(x.grant_id))).toBe(true);
    expect(s.applications.every((a) => a.grant_id == null || grantIds.has(a.grant_id))).toBe(true);
    expect(s.applications.every((a) => a.owner_id == null || memberIds.has(a.owner_id))).toBe(true);
    expect(new Set(s.grants.map((g) => g.id)).size).toBe(s.grants.length);
  });

  it("keeps breakdown points within their max", () => {
    for (const x of s.scores) for (const b of x.breakdown) expect(b.value).toBeLessThanOrEqual(b.max);
  });
});

describe("migrations", () => {
  const dir = join(__dirname, "..", "supabase", "migrations");
  const sql = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync(join(dir, f), "utf8"))
    .join("\n")
    .toLowerCase();

  it("turns on row-level security for every table", () => {
    const tables = [...sql.matchAll(/create table (?:if not exists )?public\.(\w+)/g)].map((m) => m[1]);
    expect(tables.length).toBeGreaterThan(0);
    for (const t of tables) expect(sql, `rls missing on ${t}`).toContain(`alter table public.${t} enable row level security`);
  });

  it("allows the same statuses as the app", async () => {
    const { appStatuses } = await import("@/lib/schema");
    for (const st of appStatuses) expect(sql).toContain(`'${st}'`);
  });
});
