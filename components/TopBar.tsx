import { Bell, Search, ChevronDown } from "lucide-react";
import { Avatar, Tag } from "./ui";

export function TopBar() {
  return (
    <header className="fixed left-[232px] right-0 top-0 z-20 flex h-14 items-center gap-4 border-b border-line bg-surface/90 px-6 backdrop-blur">
      <div className="relative w-[420px]">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          placeholder="Search grants and funders…"
          className="h-9 w-full rounded-[9px] border border-line bg-surface pl-9 pr-14 text-[13px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
        />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-[5px] border border-line-strong bg-surface-2 px-1.5 font-mono text-[10.5px] text-muted">
          ⌘K
        </kbd>
      </div>

      <Tag tone="warn" className="border border-warn/30">
        <span className="h-1.5 w-1.5 rounded-full bg-warn" />
        Sample data
      </Tag>

      <div className="ml-auto flex items-center gap-3">
        <button className="relative grid h-9 w-9 place-items-center rounded-[9px] text-muted hover:bg-surface-2 hover:text-ink">
          <Bell size={17} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-bg" />
        </button>
        <div className="h-6 w-px bg-line" />
        <button className="flex items-center gap-2 rounded-[9px] py-1 pl-1 pr-2 hover:bg-surface-2">
          <Avatar id="ansh" size={28} />
          <div className="text-left leading-tight">
            <div className="text-[13px] font-semibold">Ansh K.</div>
            <div className="text-[11px] text-faint">Finance Lead</div>
          </div>
          <ChevronDown size={14} className="text-faint" />
        </button>
      </div>
    </header>
  );
}
