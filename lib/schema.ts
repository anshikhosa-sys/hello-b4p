// zod shapes for database rows. every row read from supabase is parsed through these.
import { z } from "zod";

export const grantSources = ["grants_gov", "foundation", "corporate", "university"] as const;
export type GrantSource = (typeof grantSources)[number];

export const appStatuses = ["researching", "drafting", "submitted", "awarded", "declined"] as const;
export type AppStatus = (typeof appStatuses)[number];

// postgres numeric can come back as a string depending on the client, so coerce
const money = z.coerce.number().nonnegative().nullable();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const memberRow = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  email: z.string().nullable(),
  display_name: z.string(),
  is_sample: z.boolean(),
});
export type MemberRow = z.infer<typeof memberRow>;

export const grantRow = z.object({
  id: z.string().uuid(),
  source: z.enum(grantSources),
  source_id: z.string(),
  url: z.string().nullable(),
  funder: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  award_min: money,
  award_max: money,
  deadline: isoDate.nullable(),
  posted_on: isoDate.nullable(),
  eligibility_text: z.string().nullable(),
  extracted: z.record(z.string(), z.unknown()),
  is_sample: z.boolean(),
  first_seen_at: z.string(),
});
export type GrantRow = z.infer<typeof grantRow>;

export const breakdownItem = z.object({
  label: z.string(),
  value: z.number(),
  max: z.number().positive(),
  note: z.string(),
});
export type BreakdownItem = z.infer<typeof breakdownItem>;

// pass: null means we don't know yet, which counts as neutral
export const eligibilityItem = z.object({
  label: z.string(),
  pass: z.boolean().nullable(),
  note: z.string().nullable().optional(),
});
export type EligibilityItem = z.infer<typeof eligibilityItem>;

export const scoreRow = z.object({
  grant_id: z.string().uuid(),
  score: z.number().int().min(0).max(100),
  reason: z.string(),
  match_reasons: z.array(z.string()),
  breakdown: z.array(breakdownItem),
  eligibility: z.array(eligibilityItem),
  scoring_version: z.string(),
  scored_at: z.string(),
});
export type ScoreRow = z.infer<typeof scoreRow>;

export const applicationRow = z.object({
  id: z.string().uuid(),
  grant_id: z.string().uuid().nullable(),
  title: z.string(),
  funder: z.string().nullable(),
  status: z.enum(appStatuses),
  owner_id: z.string().uuid().nullable(),
  amount_requested: money,
  amount_awarded: money,
  internal_deadline: isoDate.nullable(),
  notes: z.string().nullable(),
  is_sample: z.boolean(),
  updated_at: z.string(),
});
export type ApplicationRow = z.infer<typeof applicationRow>;

// grant_scores joined with its grant
export const scoredGrantRow = scoreRow.extend({ grants: grantRow });
