import type { ReactNode } from "react";
import { member } from "@/lib/mock-data";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

type Tone = "neutral" | "accent" | "good" | "warn" | "danger" | "violet";

const toneClass: Record<Tone, string> = {
  neutral: "bg-info-soft text-muted",
  accent: "bg-accent-soft text-accent",
  good: "bg-good-soft text-good",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  violet: "bg-violet-soft text-violet",
};

// small status pill, sentence case per the brand guide
export function Tag({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-[2px] text-[11.5px] font-semibold",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// rounded chip, used for "why it matched" and similar
export function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  const border =
    tone === "good" ? "border-good/30 text-good" : tone === "accent" ? "border-accent/35 text-accent" : "border-line-strong text-ink";
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full border bg-surface px-2.5 py-[3px] text-[12px] font-medium", border)}>
      {children}
    </span>
  );
}

export function Avatar({ id, size = 24, ring }: { id: string; size?: number; ring?: boolean }) {
  const m = member(id);
  return (
    <span
      title={m.name}
      className={cx("inline-grid shrink-0 place-items-center rounded-full font-semibold text-white", ring && "ring-2 ring-surface")}
      style={{ width: size, height: size, background: m.color, fontSize: size * 0.4 }}
    >
      {m.initials}
    </span>
  );
}

const barClass = { accent: "border-t-accent", secondary: "border-t-accent-hover", violet: "border-t-violet" };

// white card; `bar` adds the colored top rule used across the brand decks
export function Card({ children, className, bar }: { children: ReactNode; className?: string; bar?: keyof typeof barClass }) {
  return (
    <div
      className={cx(
        "rounded-[12px] border border-line bg-surface",
        bar && `border-t-[5px] ${barClass[bar]}`,
        "shadow-[0_2px_8px_rgba(0,14,63,0.06)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHead({ title, right, sub }: { title: ReactNode; right?: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>
        <h3 className="text-[13.5px] font-semibold tracking-[-0.01em]">{title}</h3>
        {sub && <p className="mt-0.5 text-[12px] text-muted">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function scoreTone(score: number): "good" | "accent" | "warn" {
  if (score >= 85) return "good";
  if (score >= 70) return "accent";
  return "warn";
}

const ringColor = { good: "#1b7f47", accent: "#0069f3", warn: "#a85800" };

export function ScoreRing({ score, size = 56, stroke = 5, label }: { score: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = ringColor[scoreTone(score)];
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#dbe4f7" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * c} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">
        <div>
          <div className="tnum font-bold tracking-[-0.02em]" style={{ fontSize: size * 0.3, color }}>
            {score}
          </div>
          {label && <div className="mt-0.5 text-[10px] font-semibold text-muted">{label}</div>}
        </div>
      </div>
    </div>
  );
}

export function Button({
  children,
  variant = "secondary",
  size = "md",
  disabled,
  className,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}) {
  const v = {
    primary: "bg-accent text-white hover:bg-accent-hover border-transparent",
    secondary: "bg-surface-2 text-ink border-line-strong hover:bg-hover",
    ghost: "bg-transparent text-muted border-transparent hover:text-ink hover:bg-surface-2",
  }[variant];
  const s = size === "sm" ? "h-7 px-2.5 text-[12px]" : "h-8.5 px-3.5 text-[13px]";
  return (
    <button
      type="button"
      disabled={disabled}
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-[8px] border font-semibold transition-colors",
        v,
        s,
        disabled && "cursor-not-allowed opacity-45 hover:bg-surface-2",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function PageHeader({ title, sub, right }: { title: string; sub?: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-[28px] font-bold leading-tight text-navy">{title}</h1>
        {sub && <p className="mt-1 text-[13px] text-muted">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
