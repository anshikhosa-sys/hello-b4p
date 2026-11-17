import Link from "next/link";
import { Bell, Check, ChevronRight, ExternalLink } from "lucide-react";
import { dataSource } from "@/lib/data";
import { formatMoney, statusProgress } from "@/lib/format";
import { rankMatches, seasonStats, toApplication, upcomingDeadlines, type MatchView } from "@/lib/views";
import { Avatar, Button, Card, Chip, ScoreRing, SectionHead, Tag, cx } from "@/components/ui";
import { Countdown, SampleTag, SourceTag, StatusTag } from "@/components/grant-bits";

export const dynamic = "force-dynamic";

function GrantCard({ g, rank }: { g: MatchView; rank: number }) {
  return (
    <Card className="p-4">
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-1">
          <ScoreRing score={g.score ?? 0} size={58} label="fit" />
          <span className="tnum text-[11px] font-semibold text-faint">#{rank}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12.5px] font-semibold text-muted">{g.funder}</span>
            <SourceTag source={g.source} label={g.sourceLabel} />
            {g.isNew && <Tag tone="good">New</Tag>}
            {g.isSample && <SampleTag />}
          </div>
          <Link href={`/grants/${g.id}`} className="hover:text-accent">
            <h3 className="mt-0.5 text-[15.5px] font-semibold tracking-[-0.015em]">{g.title}</h3>
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[12.5px]">
            <span className="tnum font-semibold text-good">{g.award}</span>
            <span className="text-faint">·</span>
            {g.deadline && <span className="text-muted">Due {g.deadline}</span>}
            <Countdown days={g.daysLeft} />
          </div>
          {g.reason && <p className="mt-1.5 text-[12.5px] text-muted">{g.reason}</p>}
          {g.matchReasons.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="mr-0.5 text-[11.5px] text-faint">Why it matched</span>
              {g.matchReasons.map((w) => (
                <Chip key={w} tone="good">
                  <Check size={11} /> {w}
                </Chip>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between gap-2">
          {g.url && (
            <Button size="sm" href={g.url} external>
              <ExternalLink size={12} /> Listing
            </Button>
          )}
          <Link href={`/grants/${g.id}`} className="flex items-center gap-1 text-[12px] font-medium text-muted hover:text-ink">
            Score details <ChevronRight size={13} />
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default async function DashboardPage() {
  const { raw } = dataSource();
  const [scored, apps, members] = await Promise.all([raw.scored(), raw.applications(), raw.members()]);
  const matches = rankMatches(scored);
  const deadlines = upcomingDeadlines(matches).slice(0, 5);
  const newCount = matches.filter((m) => m.isNew).length;
  const active = apps.filter((a) => a.status !== "awarded" && a.status !== "declined").map((a) => toApplication(a, members));
  const stats = seasonStats(apps);

  return (
    <div className="flex gap-6 px-6 py-5">
      <div className="min-w-0 flex-1">
        <div className="mb-4">
          <h1 className="font-serif text-[28px] font-bold leading-tight text-navy">Matches</h1>
          <p className="mt-1 text-[13px] text-muted">Open grants ranked by fit to our mission, award target and capacity</p>
        </div>

        {newCount > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-[12px] border border-good/30 bg-good-soft px-4 py-3">
            <div className="grid h-8 w-8 place-items-center rounded-[9px] bg-good/15 text-good">
              <Bell size={16} />
            </div>
            <div className="text-[13.5px] font-semibold text-good">
              {newCount} new {newCount === 1 ? "match" : "matches"} in the last day
            </div>
          </div>
        )}

        {matches.length === 0 ? (
          <Card className="p-6 text-[13px] text-muted">No open matches yet. Run `npm run seed` to load sample data.</Card>
        ) : (
          <div className="space-y-3">
            {matches.map((g, i) => (
              <GrantCard key={g.id} g={g} rank={i + 1} />
            ))}
          </div>
        )}
      </div>

      <div className="w-[320px] shrink-0 space-y-4">
        <Card bar="accent" className="p-4">
          <SectionHead title="Upcoming deadlines" right={<span className="text-[12px] text-faint">Next 60 days</span>} />
          {deadlines.length === 0 && <p className="text-[12.5px] text-faint">Nothing due in the next 60 days.</p>}
          <ul className="space-y-1">
            {deadlines.map((d) => (
              <li key={d.id}>
                <Link href={`/grants/${d.id}`} className="flex items-center gap-3 rounded-[8px] px-1 py-2 hover:bg-surface-2">
                  <div
                    className={cx(
                      "grid h-11 w-11 shrink-0 place-items-center rounded-[9px] border text-center leading-none",
                      d.daysLeft! <= 10 ? "border-warn/35 bg-warn-soft text-warn" : "border-line bg-surface-2 text-ink",
                    )}
                  >
                    <div>
                      <div className="tnum text-[15px] font-bold">{d.daysLeft}</div>
                      <div className="mt-0.5 text-[9px] font-semibold opacity-80">days</div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold">{d.title}</div>
                    <div className="truncate text-[11.5px] text-muted">
                      {d.funder} · {d.deadline}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card bar="violet" className="p-4">
          <SectionHead
            title="Applications in progress"
            right={
              <Link href="/applications" className="tnum text-[12px] text-faint hover:text-ink">
                {active.length} active
              </Link>
            }
          />
          {active.length === 0 && <p className="text-[12.5px] text-faint">No applications in progress.</p>}
          <ul className="space-y-3">
            {active.map((a) => (
              <li key={a.id}>
                <div className="flex items-center gap-2.5">
                  {a.owner ? (
                    <Avatar name={a.owner} size={26} />
                  ) : (
                    <span className="h-[26px] w-[26px] rounded-full border border-dashed border-line-strong" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-semibold">{a.title}</span>
                      <StatusTag status={a.status} />
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className={cx("h-full rounded-full", a.status === "submitted" ? "bg-good" : "bg-accent")}
                        style={{ width: `${statusProgress[a.status]}%` }}
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card bar="secondary" className="p-4">
          <SectionHead title="Results so far" />
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { v: formatMoney(stats.requested), l: "Requested" },
              { v: formatMoney(stats.awarded), l: "Awarded" },
              { v: stats.decided ? `${stats.won} / ${stats.decided}` : "–", l: "Win rate" },
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
