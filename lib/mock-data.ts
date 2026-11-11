// sample data for demo mode, until the database is wired up

export type Member = { id: string; name: string; initials: string; color: string };

export const team: Member[] = [
  { id: "ansh", name: "Ansh K.", initials: "AK", color: "#0069f3" },
  { id: "priya", name: "Priya S.", initials: "PS", color: "#1b7f47" },
  { id: "marcus", name: "Marcus T.", initials: "MT", color: "#a85800" },
  { id: "lena", name: "Lena W.", initials: "LW", color: "#373c82" },
  { id: "jordan", name: "Jordan P.", initials: "JP", color: "#0035a2" },
];

export const member = (id: string) => team.find((m) => m.id === id) ?? team[0];

export const currentUser = member("ansh");

// ---- grant finder ----

export type GrantSource = "Grants.gov" | "Foundation" | "Corporate";

export type Grant = {
  id: string;
  score: number;
  funder: string;
  program: string;
  award: string;
  deadlineDays: number;
  deadline: string;
  source: GrantSource;
  why: string[];
  isNew?: boolean;
  breakdown?: { label: string; value: number; max: number; note: string }[];
  eligibility?: { label: string; pass: boolean; note?: string }[];
};

export const grants: Grant[] = [
  {
    id: "g1",
    score: 92,
    funder: "Lakeshore Health Foundation",
    program: "Community Health Access Grant",
    award: "$5,000 – $25,000",
    deadlineDays: 18,
    deadline: "Nov 27",
    source: "Foundation",
    isNew: true,
    why: ["Medical supply access", "Student orgs eligible", "Award fits $5k-$25k"],
    breakdown: [
      { label: "Mission fit", value: 37, max: 40, note: "Supply redistribution named as a priority area" },
      { label: "Award size", value: 20, max: 20, note: "Range sits inside our $5k–$25k target" },
      { label: "Deadline", value: 16, max: 20, note: "18 days: enough time for one review cycle" },
      { label: "Funder history", value: 19, max: 20, note: "Funded 4 student health orgs since 2023" },
    ],
    eligibility: [
      { label: "501(c)(3) or fiscal sponsor", pass: true },
      { label: "Student-led organizations eligible", pass: true },
      { label: "Serves Michigan or Great Lakes region", pass: true },
      { label: "Operating budget under $250k", pass: true },
      { label: "Letter of support from a partner clinic", pass: false, note: "Not on file yet" },
    ],
  },
  {
    id: "g2",
    score: 86,
    funder: "U.S. Dept. of Health & Human Services",
    program: "Medical Supply Equity Program",
    award: "$10,000 – $50,000",
    deadlineDays: 34,
    deadline: "Dec 13",
    source: "Grants.gov",
    isNew: true,
    why: ["Medical supply access", "Underserved communities", "Nonprofits eligible"],
  },
  {
    id: "g3",
    score: 81,
    funder: "Meridian Healthcare Giving",
    program: "Healthcare Sustainability Fund",
    award: "$5,000 – $15,000",
    deadlineDays: 9,
    deadline: "Nov 18",
    source: "Corporate",
    isNew: true,
    why: ["Waste reduction", "Award fits $5k-$25k", "Funds in-kind logistics"],
  },
  {
    id: "g4",
    score: 74,
    funder: "Northstar Community Trust",
    program: "Student Service Innovation Award",
    award: "$2,500 – $10,000",
    deadlineDays: 42,
    deadline: "Dec 21",
    source: "Foundation",
    why: ["Student orgs eligible", "First-time applicants welcome"],
  },
  {
    id: "g5",
    score: 66,
    funder: "U.S. Dept. of Agriculture",
    program: "Rural Health Capacity Grant",
    award: "$25,000 – $100,000",
    deadlineDays: 57,
    deadline: "Jan 5",
    source: "Grants.gov",
    why: ["Rural clinic partners", "Award above target"],
  },
];

export const upcomingDeadlines = [
  { program: "Healthcare Sustainability Fund", funder: "Meridian Healthcare Giving", days: 9, date: "Nov 18" },
  { program: "Community Health Access Grant", funder: "Lakeshore Health Foundation", days: 18, date: "Nov 27" },
  { program: "Medical Supply Equity Program", funder: "HHS · Grants.gov", days: 34, date: "Dec 13" },
  { program: "Student Service Innovation Award", funder: "Northstar Community Trust", days: 42, date: "Dec 21" },
];

export type AppStatus = "Drafting" | "In review" | "Needs budget" | "Submitted";

export const applicationsInProgress: { program: string; owner: string; status: AppStatus; progress: number }[] = [
  { program: "Community Health Access Grant", owner: "ansh", status: "Drafting", progress: 60 },
  { program: "Healthcare Sustainability Fund", owner: "priya", status: "In review", progress: 85 },
  { program: "Youth Health Leaders Fund", owner: "lena", status: "Needs budget", progress: 40 },
  { program: "Regional Wellness Mini-Grant", owner: "marcus", status: "Submitted", progress: 100 },
];
