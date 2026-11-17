// display pieces shared by the dashboard, grant detail and applications pages
import { Briefcase, Building, CalendarClock, Check, GraduationCap, HelpCircle, Landmark, X } from "lucide-react";
import type { AppStatus, BreakdownItem, EligibilityItem, GrantSource } from "@/lib/schema";
import { statusLabel } from "@/lib/format";
import { Tag, cx } from "./ui";

const sourceTone: Record<GrantSource, "accent" | "good" | "violet" | "neutral"> = {
  grants_gov: "accent",
  foundation: "good",
  corporate: "violet",
  university: "neutral",
};
const sourceIcon = { grants_gov: Landmark, foundation: Building, corporate: Briefcase, university: GraduationCap };

export function SourceTag({ source, label }: { source: GrantSource; label: string }) {
  const Icon = sourceIcon[source];
  return (
    <Tag tone={sourceTone[source]}>
      <Icon size={10} />
      {label}
    </Tag>
  );
}

export function SampleTag() {
  return (
    <Tag tone="warn" className="border border-warn/30">
      Sample data
    </Tag>
  );
}

const statusTone: Record<AppStatus, "neutral" | "accent" | "violet" | "good" | "danger"> = {
  researching: "neutral",
  drafting: "accent",
  submitted: "violet",
  awarded: "good",
  declined: "danger",
};

export function StatusTag({ status }: { status: AppStatus }) {
  return <Tag tone={statusTone[status]}>{statusLabel[status]}</Tag>;
}

export function Countdown({ days }: { days: number | null }) {
  if (days == null) return <span className="text-[12px] text-faint">No deadline listed</span>;
  const urgent = days <= 10;
  return (
    <span className={cx("tnum inline-flex items-center gap-1 text-[12px] font-semibold", urgent ? "text-warn" : "text-muted")}>
      <CalendarClock size={13} />
      {days === 0 ? "Due today" : days < 0 ? `${-days} days ago` : `${days} days left`}
    </span>
  );
}

export function ScoreBars({ items }: { items: BreakdownItem[] }) {
  return (
    <div className="space-y-2.5">
      {items.map((b) => {
        const pct = Math.max(0, Math.min(100, (b.value / b.max) * 100));
        return (
          <div key={b.label}>
            <div className="mb-1 flex items-baseline justify-between text-[12.5px]">
              <span className="font-medium">{b.label}</span>
              <span className="tnum font-semibold">
                {b.value}
                <span className="text-faint">/{b.max}</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className={cx("h-full rounded-full", pct >= 90 ? "bg-good" : pct >= 60 ? "bg-accent" : "bg-warn")}
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

// unknown (pass: null) is shown as neutral, not as a failure
export function EligibilityList({ items }: { items: EligibilityItem[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((e) => (
        <li
          key={e.label}
          className={cx(
            "flex items-center gap-2 rounded-[8px] border px-2.5 py-1.5 text-[12.5px]",
            e.pass === false ? "border-danger/30 bg-danger-soft" : "border-line bg-surface-2/50",
          )}
        >
          <span
            className={cx(
              "grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full",
              e.pass === true ? "bg-good-soft text-good" : e.pass === false ? "bg-danger/20 text-danger" : "bg-info-soft text-muted",
            )}
          >
            {e.pass === true ? (
              <Check size={11} strokeWidth={3} />
            ) : e.pass === false ? (
              <X size={11} strokeWidth={3} />
            ) : (
              <HelpCircle size={11} strokeWidth={2.5} />
            )}
          </span>
          <span className="flex-1">{e.label}</span>
          {e.note && <span className={cx("text-[11.5px] font-semibold", e.pass === false ? "text-danger" : "text-muted")}>{e.note}</span>}
        </li>
      ))}
    </ul>
  );
}
