import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { dataSource } from "@/lib/data";
import { statusLabel } from "@/lib/format";
import { appStatuses } from "@/lib/schema";
import { toApplication } from "@/lib/views";
import { Avatar, Card, PageHeader, cx } from "@/components/ui";
import { SampleTag } from "@/components/grant-bits";

export const dynamic = "force-dynamic";

const columnBar = {
  researching: "border-t-line-strong",
  drafting: "border-t-accent",
  submitted: "border-t-violet",
  awarded: "border-t-good",
  declined: "border-t-danger",
};

// read-only board for now; editing comes with sign-in in phase 6
export default async function ApplicationsPage() {
  const { raw } = dataSource();
  const [apps, members] = await Promise.all([raw.applications(), raw.members()]);
  const views = apps.map((a) => toApplication(a, members));

  return (
    <div className="px-6 py-5">
      <PageHeader title="Applications" sub="Grants we're pursuing, by status." />
      <div className="grid grid-cols-5 gap-3">
        {appStatuses.map((status) => {
          const col = views.filter((v) => v.status === status);
          return (
            <section
              key={status}
              className={cx("rounded-[12px] border border-t-[4px] border-line bg-surface-2/60 p-2.5", columnBar[status])}
            >
              <h2 className="mb-2 flex items-center justify-between px-1 text-[13px] font-semibold">
                {statusLabel[status]}
                <span className="tnum text-[12px] text-faint">{col.length}</span>
              </h2>
              <div className="space-y-2">
                {col.map((a) => (
                  <Card key={a.id} className="p-3">
                    {a.grantId ? (
                      <Link href={`/grants/${a.grantId}`} className="text-[13px] font-semibold leading-snug hover:text-accent">
                        {a.title}
                      </Link>
                    ) : (
                      <div className="text-[13px] font-semibold leading-snug">{a.title}</div>
                    )}
                    {a.funder && <div className="mt-0.5 truncate text-[11.5px] text-muted">{a.funder}</div>}
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px]">
                      {a.requested && <span className="tnum font-semibold text-ink">Asked {a.requested}</span>}
                      {a.awarded && <span className="tnum font-semibold text-good">Won {a.awarded}</span>}
                      {a.internalDeadline && (
                        <span
                          className={cx("tnum inline-flex items-center gap-1", a.daysLeft! <= 7 ? "font-semibold text-warn" : "text-muted")}
                        >
                          <CalendarClock size={11} />
                          {a.internalDeadline}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5 text-[11.5px] text-muted">
                        {a.owner && <Avatar name={a.owner} size={20} />}
                        <span className="truncate">{a.owner ?? "Unassigned"}</span>
                      </span>
                      {a.isSample && <SampleTag />}
                    </div>
                  </Card>
                ))}
                {col.length === 0 && <p className="px-1 py-2 text-[12px] text-faint">None</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
