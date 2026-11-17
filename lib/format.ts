// pure display helpers. no data access here so they're easy to test.
import type { AppStatus, GrantSource } from "./schema";

const TZ = "America/Detroit";

// today's date in Ann Arbor as YYYY-MM-DD
export function todayISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// whole days from today to the date; negative once it has passed
export function daysUntil(iso: string, now: Date = new Date()): number {
  const a = Date.parse(`${todayISO(now)}T00:00:00Z`);
  const b = Date.parse(`${iso}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

export function formatDate(iso: string, withYear = false): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

export function formatMoney(n: number): string {
  if (n >= 1000 && n % 1000 === 0) return `$${n / 1000}k`;
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

// missing award info is shown plainly, never as zero
export function formatAward(min: number | null, max: number | null): string {
  if (min == null && max == null) return "Award not listed";
  if (min != null && max != null) return min === max ? formatMoney(max) : `${formatMoney(min)} – ${formatMoney(max)}`;
  if (max != null) return `Up to ${formatMoney(max)}`;
  return `From ${formatMoney(min!)}`;
}

export const sourceLabel: Record<GrantSource, string> = {
  grants_gov: "Grants.gov",
  foundation: "Foundation",
  corporate: "Corporate",
  university: "University",
};

export const statusLabel: Record<AppStatus, string> = {
  researching: "Researching",
  drafting: "Drafting",
  submitted: "Submitted",
  awarded: "Awarded",
  declined: "Declined",
};

// stand-in for a progress bar on the dashboard
export const statusProgress: Record<AppStatus, number> = {
  researching: 15,
  drafting: 50,
  submitted: 85,
  awarded: 100,
  declined: 100,
};

export function initials(name: string): string {
  const parts = name
    .replace(/[^\p{L}\s]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  return ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
