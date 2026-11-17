// the only place pages get data from. reads supabase when configured, otherwise the
// built-in sample set. every row goes through zod before it's used.
import "server-only";
import { z } from "zod";
import { serverDb } from "./db";
import { sampleData } from "./sample-data";
import {
  applicationRow,
  grantRow,
  memberRow,
  scoreRow,
  scoredGrantRow,
  type ApplicationRow,
  type GrantRow,
  type MemberRow,
  type ScoreRow,
} from "./schema";

export type DataMode = "database" | "builtin";

type Raw = {
  scored(): Promise<{ grant: GrantRow; score: ScoreRow }[]>;
  grant(id: string): Promise<{ grant: GrantRow; score: ScoreRow | null } | null>;
  applications(): Promise<ApplicationRow[]>;
  members(): Promise<MemberRow[]>;
  hasSample(): Promise<boolean>;
};

function fail(what: string, error: { message: string }): never {
  throw new Error(`could not load ${what}: ${error.message}`);
}

const uuid = z.string().uuid();

function fromDatabase(db: NonNullable<ReturnType<typeof serverDb>>): Raw {
  return {
    async scored() {
      const { data, error } = await db.from("grant_scores").select("*, grants(*)").order("score", { ascending: false }).limit(500);
      if (error) fail("matches", error);
      return z
        .array(scoredGrantRow)
        .parse(data)
        .map(({ grants, ...score }) => ({ grant: grants, score }));
    },
    async grant(id) {
      if (!uuid.safeParse(id).success) return null;
      const [g, s] = await Promise.all([
        db.from("grants").select("*").eq("id", id).maybeSingle(),
        db.from("grant_scores").select("*").eq("grant_id", id).maybeSingle(),
      ]);
      if (g.error) fail("grant", g.error);
      if (s.error) fail("score", s.error);
      if (!g.data) return null;
      return { grant: grantRow.parse(g.data), score: s.data ? scoreRow.parse(s.data) : null };
    },
    async applications() {
      const { data, error } = await db.from("applications").select("*").order("updated_at", { ascending: false });
      if (error) fail("applications", error);
      return z.array(applicationRow).parse(data);
    },
    async members() {
      const { data, error } = await db.from("members").select("*");
      if (error) fail("members", error);
      return z.array(memberRow).parse(data);
    },
    async hasSample() {
      const checks = await Promise.all(
        ["grants", "applications"].map((t) => db.from(t).select("id", { count: "exact", head: true }).eq("is_sample", true)),
      );
      for (const c of checks) if (c.error) fail("sample flag", c.error);
      return checks.some((c) => (c.count ?? 0) > 0);
    },
  };
}

function fromSample(): Raw {
  const s = sampleData();
  return {
    async scored() {
      return s.scores.map((score) => ({ grant: s.grants.find((g) => g.id === score.grant_id)!, score }));
    },
    async grant(id) {
      const grant = s.grants.find((g) => g.id === id);
      return grant ? { grant, score: s.scores.find((x) => x.grant_id === id) ?? null } : null;
    },
    async applications() {
      return s.applications;
    },
    async members() {
      return s.members;
    },
    async hasSample() {
      return true;
    },
  };
}

export function dataSource(): { mode: DataMode; raw: Raw } {
  const db = serverDb();
  return db ? { mode: "database", raw: fromDatabase(db) } : { mode: "builtin", raw: fromSample() };
}
