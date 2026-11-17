import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import { dataSource } from "@/lib/data";
import { toApplication, toDetail } from "@/lib/views";
import { Avatar, Button, Card, Chip, ScoreRing, SectionHead, Tag } from "@/components/ui";
import { Countdown, EligibilityList, SampleTag, ScoreBars, SourceTag, StatusTag } from "@/components/grant-bits";

export const dynamic = "force-dynamic";

export default async function GrantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { raw } = dataSource();
  const found = await raw.grant(id);
  if (!found) notFound();
  const g = toDetail(found.grant, found.score);
  const [apps, members] = await Promise.all([raw.applications(), raw.members()]);
  const linked = apps.filter((a) => a.grant_id === id).map((a) => toApplication(a, members));
  const total = g.breakdown.reduce((t, b) => t + b.value, 0);
  const passing = g.eligibility.filter((e) => e.pass === true).length;
  const unknown = g.eligibility.filter((e) => e.pass == null).length;

  return (
    <div className="px-6 py-5">
      <Link href="/" className="mb-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-muted hover:text-ink">
        <ArrowLeft size={13} /> Matches
      </Link>

      <Card className="mb-4 p-5">
        <div className="flex gap-5">
          {g.score != null && <ScoreRing score={g.score} size={76} stroke={6} label="fit" />}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-semibold text-muted">{g.funder}</span>
              <SourceTag source={g.source} label={g.sourceLabel} />
              {g.isNew && <Tag tone="good">New</Tag>}
              {g.isSample && <SampleTag />}
            </div>
            <h1 className="mt-1 font-serif text-[26px] font-bold leading-tight text-navy">{g.title}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[13px]">
              <span className="tnum font-semibold text-good">{g.award}</span>
              <span className="text-faint">·</span>
              {g.deadlineFull && <span className="text-muted">Due {g.deadlineFull}</span>}
              <Countdown days={g.daysLeft} />
            </div>
            {g.reason && <p className="mt-2 text-[13px] text-muted">{g.reason}</p>}
            {g.matchReasons.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {g.matchReasons.map((w) => (
                  <Chip key={w} tone="good">
                    {w}
                  </Chip>
                ))}
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            {g.url && (
              <Button href={g.url} external>
                <ExternalLink size={13} /> Open listing
              </Button>
            )}
            <Button variant="primary" disabled title="Comes with sign-in">
              <Sparkles size={13} /> Start application
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-[1.1fr_1fr] gap-4">
        <div className="space-y-4">
          <Card bar="accent" className="p-4">
            <SectionHead
              title="Score breakdown"
              right={
                g.breakdown.length > 0 && (
                  <span className="tnum text-[12px] text-muted">
                    {g.breakdown.map((b) => b.value).join(" + ")} = <span className="font-semibold text-good">{total}</span>
                  </span>
                )
              }
            />
            {g.breakdown.length ? <ScoreBars items={g.breakdown} /> : <p className="text-[12.5px] text-faint">Not scored yet.</p>}
          </Card>

          <Card bar="secondary" className="p-4">
            <SectionHead title="About this grant" />
            <p className="text-[13px] leading-relaxed">{g.summary ?? <span className="text-faint">No summary listed.</span>}</p>
            {g.eligibilityText && (
              <>
                <div className="mb-1 mt-4 text-[11px] font-semibold text-faint">Who can apply (from the listing)</div>
                <p className="text-[13px] leading-relaxed">{g.eligibilityText}</p>
              </>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card bar="violet" className="p-4">
            <SectionHead
              title="Eligibility"
              right={
                g.eligibility.length > 0 && (
                  <span className="text-[12px] text-muted">
                    <span className="font-semibold text-good">{passing}</span> of {g.eligibility.length} pass
                    {unknown > 0 && `, ${unknown} unknown`}
                  </span>
                )
              }
            />
            {g.eligibility.length ? (
              <EligibilityList items={g.eligibility} />
            ) : (
              <p className="text-[12.5px] text-faint">No eligibility checks yet.</p>
            )}
          </Card>

          <Card className="p-4">
            <SectionHead title="Extracted fields" />
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[12.5px]">
              <dt className="text-faint">Source</dt>
              <dd>{g.sourceLabel}</dd>
              <dt className="text-faint">Posted</dt>
              <dd>{g.postedOn ?? <span className="text-faint">Not listed</span>}</dd>
              {g.extracted.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-faint">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-4">
            <SectionHead title="Applications" />
            {linked.length === 0 && <p className="text-[12.5px] text-faint">Nobody has started one yet.</p>}
            <ul className="space-y-2">
              {linked.map((a) => (
                <li key={a.id} className="flex items-center gap-2.5">
                  {a.owner && <Avatar name={a.owner} size={24} />}
                  <span className="flex-1 truncate text-[13px] font-medium">{a.owner ?? "Unassigned"}</span>
                  <StatusTag status={a.status} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
