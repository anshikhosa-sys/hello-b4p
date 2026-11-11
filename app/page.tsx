import {
  Bell,
  CalendarClock,
  Check,
  ChevronDown,
  ExternalLink,
  Bookmark,
  Sparkles,
  X,
  SlidersHorizontal,
  Landmark,
  Building,
  Briefcase,
} from "lucide-react";
import { grants, upcomingDeadlines, applicationsInProgress, type Grant, type GrantSource, type AppStatus } from "@/lib/mock-data";
import { Avatar, Button, Card, Chip, ScoreRing, SectionHead, Tag, cx } from "@/components/ui";

const sourceTone: Record<GrantSource, "accent" | "good" | "violet"> = {
  "Grants.gov": "accent",
  Foundation: "good",
  Corporate: "violet",
};
const sourceIcon = { "Grants.gov": Landmark, Foundation: Building, Corporate: Briefcase };

const statusTone: Record<AppStatus, "accent" | "violet" | "warn" | "good"> = {
  Drafting: "accent",
  "In review": "violet",
  "Needs budget": "warn",
  Submitted: "good",
};

function Countdown({ days }: { days: number }) {
  const urgent = days <= 10;
  return (
    <span className={cx("tnum inline-flex items-center gap-1 text-[12px] font-semibold", urgent ? "text-warn" : "text-muted")}>
      <CalendarClock size={13} />
      {days} days left
    </span>
  );
}

function ScoreBars({ g }: { g: Grant }) {
  return (
    <div className="space-y-2.5">
      {g.breakdown!.map((b) => {
        const pct = (b.value / b.max) * 100;
        return (
          <div key={b.label}>
            <div className="mb-1 flex items-baseline justify-between text-[12.5px]">
              <span className="font-medium">
                {b.label} <span className="text-faint">({b.max})</span>
              </span>
              <span className="tnum font-semibold">
                {b.value}
                <span className="text-faint">/{b.max}</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className={cx("h-full rounded-full", pct >= 90 ? "bg-good" : pct >= 75 ? "bg-accent" : "bg-warn")}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-1 text-[11.5px] text-faint">{b.note}</div>
          </div>
        );
      })}
    </div>
  );
}

function GrantCard({ g, rank, expanded }: { g: Grant; rank: number; expanded?: boolean }) {
  const SourceIcon = sourceIcon[g.source];
  return (
    <Card className={cx("p-4", expanded && "border-accent/40 ring-1 ring-accent/20")}>
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-1">
          <ScoreRing score={g.score} size={58} label="fit" />
          <span className="tnum text-[11px] font-semibold text-faint">#{rank}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] font-semibold text-muted">{g.funder}</span>
            <Tag tone={sourceTone[g.source]}>
              <SourceIcon size={10} />
              {g.source}
            </Tag>
            {g.isNew && <Tag tone="good">New</Tag>}
          </div>
          <h3 className="mt-0.5 text-[15.5px] font-semibold tracking-[-0.015em]">{g.program}</h3>
          <div className="mt-1 flex items-center gap-3 text-[12.5px]">
            <span className="tnum font-semibold text-good">{g.award}</span>
            <span className="text-faint">·</span>
            <span className="text-muted">Due {g.deadline}</span>
            <Countdown days={g.deadlineDays} />
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="mr-0.5 text-[11.5px] text-faint">Why it matched</span>
            {g.why.map((w) => (
              <Chip key={w} tone="good">
                <Check size={11} /> {w}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between">
          <div className="flex gap-1.5">
            <Button size="sm" variant="ghost">
              <Bookmark size={13} />
            </Button>
            <Button size="sm">
              <ExternalLink size={12} /> View
            </Button>
          </div>
          {!expanded && (
            <button className="flex items-center gap-1 text-[12px] font-medium text-muted hover:text-ink">
              Score details <ChevronDown size={13} />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 grid grid-cols-[1.2fr_1fr] gap-5 border-t border-line pt-4">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-faint">Score breakdown</span>
              <span className="tnum text-[12px] text-muted">
                37 + 20 + 16 + 19 = <span className="font-semibold text-good">92</span>
              </span>
            </div>
            <ScoreBars g={g} />
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-faint">Eligibility</span>
              <span className="text-[12px] text-muted">
                <span className="font-semibold text-good">4</span> of 5 pass
              </span>
            </div>
            <ul className="space-y-1.5">
              {g.eligibility!.map((e) => (
                <li
                  key={e.label}
                  className={cx(
                    "flex items-center gap-2 rounded-[8px] border px-2.5 py-1.5 text-[12.5px]",
                    e.pass ? "border-line bg-surface-2/50" : "border-danger/30 bg-danger-soft",
                  )}
                >
                  <span
                    className={cx(
                      "grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full",
                      e.pass ? "bg-good-soft text-good" : "bg-danger/20 text-danger",
                    )}
                  >
                    {e.pass ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
                  </span>
                  <span className="flex-1">{e.label}</span>
                  {e.note && <span className="text-[11.5px] font-semibold text-danger">{e.note}</span>}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="primary">
                <Sparkles size={12} /> Start application
              </Button>
              <Button size="sm">Request letter</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex gap-6 px-6 py-5">
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h1 className="font-serif text-[28px] font-bold leading-tight text-navy">Matches</h1>
            <p className="mt-1 text-[13px] text-muted">
              Ranked by fit to our mission, award target and capacity · refreshed daily at 6:00 AM
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <SlidersHorizontal size={13} /> Filters
            </Button>
            <Button>
              Sort: Best fit <ChevronDown size={13} />
            </Button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-[12px] border border-good/30 bg-good-soft px-4 py-3">
          <div className="grid h-8 w-8 place-items-center rounded-[9px] bg-good/15 text-good">
            <Bell size={16} />
          </div>
          <div className="flex-1">
            <div className="text-[13.5px] font-semibold text-good">3 new matches today</div>
            <div className="text-[12px] text-muted">
              From Grants.gov, 2 foundation databases and 1 corporate giving page · 41 programs scanned
            </div>
          </div>
          <Button size="sm">Review new</Button>
        </div>

        <div className="space-y-3">
          {grants.map((g, i) => (
            <GrantCard key={g.id} g={g} rank={i + 1} expanded={i === 0} />
          ))}
        </div>
      </div>

      <div className="w-[320px] shrink-0 space-y-4">
        <Card bar="accent" className="p-4">
          <SectionHead title="Upcoming deadlines" right={<span className="text-[12px] text-faint">Next 60 days</span>} />
          <ul className="space-y-1">
            {upcomingDeadlines.map((d) => (
              <li key={d.program} className="flex items-center gap-3 rounded-[8px] px-1 py-2 hover:bg-surface-2">
                <div
                  className={cx(
                    "grid h-11 w-11 shrink-0 place-items-center rounded-[9px] border text-center leading-none",
                    d.days <= 10 ? "border-warn/35 bg-warn-soft text-warn" : "border-line bg-surface-2 text-ink",
                  )}
                >
                  <div>
                    <div className="tnum text-[15px] font-bold">{d.days}</div>
                    <div className="mt-0.5 text-[9px] font-semibold opacity-80">days</div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold">{d.program}</div>
                  <div className="truncate text-[11.5px] text-muted">
                    {d.funder} · {d.date}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card bar="violet" className="p-4">
          <SectionHead title="Applications in progress" right={<span className="tnum text-[12px] text-faint">4 active</span>} />
          <ul className="space-y-3">
            {applicationsInProgress.map((a) => (
              <li key={a.program}>
                <div className="flex items-center gap-2.5">
                  <Avatar id={a.owner} size={26} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-semibold">{a.program}</span>
                      <Tag tone={statusTone[a.status]}>{a.status}</Tag>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className={cx(
                          "h-full rounded-full",
                          a.status === "Submitted" ? "bg-good" : a.status === "Needs budget" ? "bg-warn" : "bg-accent",
                        )}
                        style={{ width: `${a.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card bar="secondary" className="p-4">
          <SectionHead title="This season" />
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { v: "$42k", l: "Requested" },
              { v: "$8k", l: "Awarded" },
              { v: "2 / 5", l: "Win rate" },
            ].map((s) => (
              <div key={s.l} className="rounded-[9px] border border-line bg-surface-2/60 py-2.5">
                <div className={cx("tnum text-[16px] font-semibold", s.l === "Awarded" && "text-good")}>{s.v}</div>
                <div className="text-[10.5px] font-semibold text-faint">{s.l}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
