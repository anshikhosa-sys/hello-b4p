import { describe, expect, it } from "vitest";
import { sampleData } from "@/lib/sample-data";
import type { ApplicationRow, GrantRow, ScoreRow } from "@/lib/schema";
import { formatValue, humanizeKey, rankMatches, seasonStats, toApplication, toDetail, toMatch, upcomingDeadlines } from "@/lib/views";

const now = new Date("2026-11-17T15:00:00Z");
const s = sampleData(now);
const grant = (over: Partial<GrantRow> = {}): GrantRow => ({ ...s.grants[0], ...over });
const score = (over: Partial<ScoreRow> = {}): ScoreRow => ({ ...s.scores[0], ...over });

describe("toMatch", () => {
  it("handles a grant with no award or deadline as neutral", () => {
    const m = toMatch(grant({ award_min: null, award_max: null, deadline: null }), null, now);
    expect(m.award).toBe("Award not listed");
    expect(m.daysLeft).toBeNull();
    expect(m.deadline).toBeNull();
    expect(m.score).toBeNull();
    expect(m.matchReasons).toEqual([]);
  });

  it("marks grants first seen in the last day as new", () => {
    expect(toMatch(grant({ first_seen_at: "2026-11-17T01:00:00Z" }), null, now).isNew).toBe(true);
    expect(toMatch(grant({ first_seen_at: "2026-11-15T01:00:00Z" }), null, now).isNew).toBe(false);
  });
});

describe("rankMatches", () => {
  it("drops past deadlines and sorts by score, then earliest deadline", () => {
    const rows = [
      { grant: grant({ id: "1", deadline: "2026-11-10" }), score: score({ score: 99 }) }, // closed
      { grant: grant({ id: "2", deadline: "2026-12-20" }), score: score({ score: 80 }) },
      { grant: grant({ id: "3", deadline: "2026-11-30" }), score: score({ score: 80 }) },
      { grant: grant({ id: "4", deadline: null }), score: score({ score: 80 }) },
      { grant: grant({ id: "5", deadline: "2026-11-17" }), score: score({ score: 90 }) }, // due today stays
    ];
    expect(rankMatches(rows, now).map((m) => m.id)).toEqual(["5", "3", "2", "4"]);
  });
});

describe("upcomingDeadlines", () => {
  it("keeps dated grants inside the window, soonest first", () => {
    const ms = rankMatches(
      s.scores.map((sc) => ({ grant: s.grants.find((g) => g.id === sc.grant_id)!, score: sc })),
      now,
    );
    const up = upcomingDeadlines(ms, 40);
    expect(up.every((m) => m.daysLeft != null && m.daysLeft <= 40)).toBe(true);
    expect(up.map((m) => m.daysLeft)).toEqual([...up.map((m) => m.daysLeft)].sort((a, b) => a! - b!));
  });
});

describe("toDetail", () => {
  it("turns extracted fields into readable rows", () => {
    const d = toDetail(grant({ extracted: { match_required: false, applicant_types: ["A", "B"], notes: null } }), null, now);
    expect(d.extracted).toEqual([
      ["Match required", "No"],
      ["Applicant types", "A, B"],
      ["Notes", "Not listed"],
    ]);
    expect(d.breakdown).toEqual([]);
  });

  it("formats values", () => {
    expect(humanizeKey("award-ceiling")).toBe("Award ceiling");
    expect(formatValue([])).toBe("Not listed");
    expect(formatValue(3)).toBe("3");
  });
});

describe("applications", () => {
  const app = (over: Partial<ApplicationRow>): ApplicationRow => ({ ...s.applications[0], ...over });

  it("finds the owner's name and leaves unassigned as null", () => {
    expect(toApplication(app({ owner_id: s.members[1].id }), s.members, now).owner).toBe(s.members[1].display_name);
    expect(toApplication(app({ owner_id: null }), s.members, now).owner).toBeNull();
  });

  it("sums requested and awarded, and only counts decided ones toward win rate", () => {
    const st = seasonStats([
      app({ status: "researching", amount_requested: 9999 }),
      app({ status: "submitted", amount_requested: 2000 }),
      app({ status: "awarded", amount_requested: 1500, amount_awarded: 1000 }),
      app({ status: "declined", amount_requested: 5000 }),
    ]);
    expect(st).toEqual({ requested: 8500, awarded: 1000, decided: 2, won: 1 });
  });
});
