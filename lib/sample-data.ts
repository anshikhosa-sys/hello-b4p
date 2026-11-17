// made-up grants, scores and applications for demos. every row has is_sample = true and the
// ui labels it "Sample data". funders and programs are fictional. used by `npm run seed`
// and by the app when supabase isn't configured.
import { addDays, todayISO } from "./format";
import type { ApplicationRow, GrantRow, MemberRow, ScoreRow } from "./schema";

export type SampleSet = { members: MemberRow[]; grants: GrantRow[]; scores: ScoreRow[]; applications: ApplicationRow[] };

// fixed ids so re-seeding replaces the same rows and links stay stable
const id = (prefix: string, n: number) => `00000000-0000-4000-${prefix}-${String(n).padStart(12, "0")}`;
const M = (n: number) => id("a000", n);
const G = (n: number) => id("b000", n);
const A = (n: number) => id("c000", n);

export function sampleData(now: Date = new Date()): SampleSet {
  const today = todayISO(now);
  const day = (n: number) => addDays(today, n);
  const seenAt = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86_400_000).toISOString();

  const members: MemberRow[] = [
    { id: M(1), user_id: null, email: null, display_name: "Sample Member A", is_sample: true },
    { id: M(2), user_id: null, email: null, display_name: "Sample Member B", is_sample: true },
    { id: M(3), user_id: null, email: null, display_name: "Sample Member C", is_sample: true },
  ];

  const grant = (g: Partial<GrantRow> & Pick<GrantRow, "id" | "source" | "funder" | "title">): GrantRow => ({
    source_id: `sample-${g.id.slice(-2)}`,
    url: null,
    summary: null,
    award_min: null,
    award_max: null,
    deadline: null,
    posted_on: null,
    eligibility_text: null,
    extracted: {},
    is_sample: true,
    first_seen_at: seenAt(10),
    ...g,
  });

  const grants: GrantRow[] = [
    grant({
      id: G(1),
      source: "foundation",
      funder: "Lakeshore Health Foundation",
      title: "Community Health Access Grant",
      summary:
        "Supports nonprofits that improve access to basic medical care and supplies for under-resourced clinics in the Great Lakes region.",
      award_min: 5000,
      award_max: 25000,
      deadline: day(18),
      posted_on: day(-6),
      eligibility_text: "501(c)(3) organizations or fiscally sponsored projects. Student-led organizations are eligible.",
      extracted: { geography: "Great Lakes region", applicant_types: ["501(c)(3)", "Student organizations"], match_required: false },
      first_seen_at: seenAt(0),
    }),
    grant({
      id: G(2),
      source: "grants_gov",
      funder: "Sample Federal Health Office",
      title: "Medical Supply Equity Program",
      summary: "Funds projects that redistribute medical equipment and supplies to underserved communities.",
      award_min: 10000,
      award_max: 50000,
      deadline: day(34),
      posted_on: day(-3),
      eligibility_text: "Nonprofits with 501(c)(3) status. Applicants must have an active SAM.gov registration.",
      extracted: { geography: "United States", applicant_types: ["Nonprofits"], match_required: false },
      first_seen_at: seenAt(0),
    }),
    grant({
      id: G(3),
      source: "corporate",
      funder: "Meridian Healthcare Giving",
      title: "Healthcare Sustainability Fund",
      summary: "Supports programs that reduce waste in health care, including recovery and reuse of unused supplies.",
      award_min: 5000,
      award_max: 15000,
      deadline: day(9),
      eligibility_text: "Registered nonprofits.",
      first_seen_at: seenAt(0),
    }),
    grant({
      id: G(4),
      source: "university",
      funder: "Sample Campus Sustainability Fund",
      title: "Student Sustainability Mini-Grant",
      summary: "Small grants for student organizations running projects that cut campus waste.",
      award_min: 500,
      award_max: 2000,
      deadline: day(42),
      eligibility_text: "Registered student organizations.",
    }),
    grant({
      id: G(5),
      source: "grants_gov",
      funder: "Sample Rural Development Office",
      title: "Rural Health Capacity Grant",
      summary: "Capacity building for rural health providers.",
      award_min: 25000,
      award_max: 100000,
      deadline: day(57),
    }),
    grant({
      id: G(6),
      source: "foundation",
      funder: "Northstar Community Trust",
      title: "Student Service Innovation Award",
      summary: "Recognizes student-run service projects.",
      // no award or deadline listed: shows how missing data is handled
    }),
  ];

  const score = (s: Omit<ScoreRow, "scoring_version" | "scored_at">): ScoreRow => ({
    ...s,
    scoring_version: "sample",
    scored_at: seenAt(0),
  });

  const scores: ScoreRow[] = [
    score({
      grant_id: G(1),
      score: 92,
      reason: "Funds medical supply access for clinics in our region, and student-led groups are eligible.",
      match_reasons: ["Medical supply access", "Student orgs eligible", "Great Lakes region"],
      breakdown: [
        { label: "Mission fit", value: 37, max: 40, note: "Supply access for clinics is a named priority" },
        { label: "Award size", value: 20, max: 20, note: "Range fits the sample target" },
        { label: "Deadline", value: 16, max: 20, note: "18 days: time for one review cycle" },
        { label: "Eligibility", value: 19, max: 20, note: "All known requirements met" },
      ],
      eligibility: [
        { label: "501(c)(3) or fiscal sponsor", pass: true },
        { label: "Student-led organizations eligible", pass: true },
        { label: "Serves Michigan or Great Lakes region", pass: true },
        { label: "Letter of support from a partner clinic", pass: false, note: "Not on file yet" },
      ],
    }),
    score({
      grant_id: G(2),
      score: 86,
      reason: "Directly funds medical supply redistribution; needs SAM.gov registration.",
      match_reasons: ["Medical supply access", "Underserved communities", "Nonprofits eligible"],
      breakdown: [
        { label: "Mission fit", value: 38, max: 40, note: "Supply redistribution is the program's focus" },
        { label: "Award size", value: 16, max: 20, note: "Top of range is above the sample target" },
        { label: "Deadline", value: 18, max: 20, note: "34 days" },
        { label: "Eligibility", value: 14, max: 20, note: "SAM.gov registration unknown" },
      ],
      eligibility: [
        { label: "501(c)(3) nonprofit", pass: true },
        { label: "Active SAM.gov registration", pass: null, note: "Unknown, check before applying" },
      ],
    }),
    score({
      grant_id: G(3),
      score: 81,
      reason: "Rewards reducing health care waste, which is what supply recovery does.",
      match_reasons: ["Waste reduction", "Award fits target"],
      breakdown: [
        { label: "Mission fit", value: 33, max: 40, note: "Sustainability angle matches" },
        { label: "Award size", value: 20, max: 20, note: "Inside the sample target" },
        { label: "Deadline", value: 10, max: 20, note: "9 days: tight" },
        { label: "Eligibility", value: 18, max: 20, note: "Registered nonprofit" },
      ],
      eligibility: [{ label: "Registered nonprofit", pass: true }],
    }),
    score({
      grant_id: G(4),
      score: 77,
      reason: "Student sustainability fund; small award but an easy fit.",
      match_reasons: ["Student orgs eligible", "Waste reduction"],
      breakdown: [
        { label: "Mission fit", value: 28, max: 40, note: "Waste reduction on campus" },
        { label: "Award size", value: 12, max: 20, note: "Small award" },
        { label: "Deadline", value: 19, max: 20, note: "42 days" },
        { label: "Eligibility", value: 18, max: 20, note: "Student organizations eligible" },
      ],
      eligibility: [{ label: "Registered student organization", pass: true }],
    }),
    score({
      grant_id: G(5),
      score: 58,
      reason: "Health capacity focus, but aimed at rural providers and well above the sample award target.",
      match_reasons: ["Rural clinic partners"],
      breakdown: [
        { label: "Mission fit", value: 22, max: 40, note: "Indirect fit" },
        { label: "Award size", value: 8, max: 20, note: "Well above the sample target" },
        { label: "Deadline", value: 20, max: 20, note: "57 days" },
        { label: "Eligibility", value: 8, max: 20, note: "Applicant must be a rural provider" },
      ],
      eligibility: [{ label: "Rural health provider", pass: false }],
    }),
    score({
      grant_id: G(6),
      score: 64,
      reason: "Rewards student-run service; award and deadline not listed, so those count as neutral.",
      match_reasons: ["Student orgs eligible"],
      breakdown: [
        { label: "Mission fit", value: 24, max: 40, note: "Student service" },
        { label: "Award size", value: 10, max: 20, note: "Not listed: neutral" },
        { label: "Deadline", value: 10, max: 20, note: "Not listed: neutral" },
        { label: "Eligibility", value: 20, max: 20, note: "Student-run projects" },
      ],
      eligibility: [{ label: "Student-run project", pass: true }],
    }),
  ];

  const app = (a: Partial<ApplicationRow> & Pick<ApplicationRow, "id" | "title" | "status">): ApplicationRow => ({
    grant_id: null,
    funder: null,
    owner_id: null,
    amount_requested: null,
    amount_awarded: null,
    internal_deadline: null,
    notes: null,
    is_sample: true,
    updated_at: seenAt(1),
    ...a,
  });

  const applications: ApplicationRow[] = [
    app({
      id: A(1),
      grant_id: G(1),
      title: "Community Health Access Grant",
      funder: "Lakeshore Health Foundation",
      status: "drafting",
      owner_id: M(1),
      amount_requested: 15000,
      internal_deadline: day(12),
    }),
    app({
      id: A(2),
      grant_id: G(3),
      title: "Healthcare Sustainability Fund",
      funder: "Meridian Healthcare Giving",
      status: "researching",
      owner_id: M(2),
      internal_deadline: day(5),
    }),
    app({
      id: A(3),
      title: "Sample Regional Wellness Mini-Grant",
      funder: "Sample Regional Foundation",
      status: "submitted",
      owner_id: M(3),
      amount_requested: 2000,
    }),
    app({
      id: A(4),
      title: "Sample Spring Service Grant",
      funder: "Sample Community Fund",
      status: "awarded",
      owner_id: M(1),
      amount_requested: 1500,
      amount_awarded: 1500,
    }),
    app({
      id: A(5),
      title: "Sample Equipment Grant",
      funder: "Sample Equipment Trust",
      status: "declined",
      owner_id: M(2),
      amount_requested: 5000,
    }),
  ];

  return { members, grants, scores, applications };
}
