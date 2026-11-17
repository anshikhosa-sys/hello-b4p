// turns database rows into what the pages show. pure functions, no data access.
import { daysUntil, formatAward, formatDate, formatMoney, sourceLabel } from "./format";
import type { AppStatus, ApplicationRow, BreakdownItem, EligibilityItem, GrantRow, GrantSource, MemberRow, ScoreRow } from "./schema";

export type MatchView = {
  id: string;
  score: number | null;
  reason: string | null;
  matchReasons: string[];
  funder: string;
  title: string;
  source: GrantSource;
  sourceLabel: string;
  award: string;
  deadline: string | null; // "Dec 13"
  daysLeft: number | null; // null when no deadline is listed
  isNew: boolean;
  isSample: boolean;
  url: string | null;
};

const NEW_WITHIN_MS = 24 * 3_600_000;

export function toMatch(g: GrantRow, s: ScoreRow | null, now: Date = new Date()): MatchView {
  return {
    id: g.id,
    score: s?.score ?? null,
    reason: s?.reason ?? null,
    matchReasons: s?.match_reasons ?? [],
    funder: g.funder,
    title: g.title,
    source: g.source,
    sourceLabel: sourceLabel[g.source],
    award: formatAward(g.award_min, g.award_max),
    deadline: g.deadline ? formatDate(g.deadline) : null,
    daysLeft: g.deadline ? daysUntil(g.deadline, now) : null,
    isNew: now.getTime() - Date.parse(g.first_seen_at) < NEW_WITHIN_MS,
    isSample: g.is_sample,
    url: g.url,
  };
}

// open grants only, best score first; ties go to the earlier deadline (no deadline last)
export function rankMatches(rows: { grant: GrantRow; score: ScoreRow }[], now: Date = new Date()): MatchView[] {
  return rows
    .map((r) => toMatch(r.grant, r.score, now))
    .filter((m) => m.daysLeft == null || m.daysLeft >= 0)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity));
}

export function upcomingDeadlines(matches: MatchView[], withinDays = 60): MatchView[] {
  return matches.filter((m) => m.daysLeft != null && m.daysLeft <= withinDays).sort((a, b) => a.daysLeft! - b.daysLeft!);
}

export type GrantDetail = MatchView & {
  summary: string | null;
  eligibilityText: string | null;
  postedOn: string | null;
  deadlineFull: string | null;
  breakdown: BreakdownItem[];
  eligibility: EligibilityItem[];
  extracted: [string, string][];
  scoredAt: string | null;
};

// "match_required" -> "Match required"
export function humanizeKey(k: string): string {
  const s = k.replace(/[_-]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatValue(v: unknown): string {
  if (v == null || v === "") return "Not listed";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.length ? v.map(formatValue).join(", ") : "Not listed";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export function toDetail(g: GrantRow, s: ScoreRow | null, now: Date = new Date()): GrantDetail {
  return {
    ...toMatch(g, s, now),
    summary: g.summary,
    eligibilityText: g.eligibility_text,
    postedOn: g.posted_on ? formatDate(g.posted_on, true) : null,
    deadlineFull: g.deadline ? formatDate(g.deadline, true) : null,
    breakdown: s?.breakdown ?? [],
    eligibility: s?.eligibility ?? [],
    extracted: Object.entries(g.extracted).map(([k, v]) => [humanizeKey(k), formatValue(v)]),
    scoredAt: s?.scored_at ?? null,
  };
}

export type ApplicationView = {
  id: string;
  grantId: string | null;
  title: string;
  funder: string | null;
  status: AppStatus;
  owner: string | null;
  requested: string | null;
  awarded: string | null;
  internalDeadline: string | null;
  daysLeft: number | null;
  isSample: boolean;
};

export function toApplication(a: ApplicationRow, members: MemberRow[], now: Date = new Date()): ApplicationView {
  const owner = members.find((m) => m.id === a.owner_id);
  return {
    id: a.id,
    grantId: a.grant_id,
    title: a.title,
    funder: a.funder,
    status: a.status,
    owner: owner?.display_name ?? null,
    requested: a.amount_requested != null ? formatMoney(a.amount_requested) : null,
    awarded: a.amount_awarded != null ? formatMoney(a.amount_awarded) : null,
    internalDeadline: a.internal_deadline ? formatDate(a.internal_deadline) : null,
    daysLeft: a.internal_deadline ? daysUntil(a.internal_deadline, now) : null,
    isSample: a.is_sample,
  };
}

export type SeasonStats = { requested: number; awarded: number; decided: number; won: number };

// requested counts anything that went out the door; win rate only counts decided applications
export function seasonStats(apps: ApplicationRow[]): SeasonStats {
  const sent = apps.filter((a) => a.status === "submitted" || a.status === "awarded" || a.status === "declined");
  const won = apps.filter((a) => a.status === "awarded");
  return {
    requested: sent.reduce((t, a) => t + (a.amount_requested ?? 0), 0),
    awarded: won.reduce((t, a) => t + (a.amount_awarded ?? 0), 0),
    decided: apps.filter((a) => a.status === "awarded" || a.status === "declined").length,
    won: won.length,
  };
}
