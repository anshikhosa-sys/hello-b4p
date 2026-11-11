"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Building2, Settings, type LucideIcon } from "lucide-react";
import { cx } from "./ui";

type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };

const nav: NavItem[] = [
  { href: "/", label: "Matches", icon: LayoutDashboard, exact: true },
  { href: "/applications", label: "Applications", icon: ClipboardList },
  { href: "/prospects", label: "Prospects", icon: Building2 },
];

const adminNav: NavItem[] = [{ href: "/settings", label: "Settings", icon: Settings }];

function NavLink({ item, path }: { item: NavItem; path: string }) {
  const { href, label, icon: Icon, exact } = item;
  const active = exact ? path === href : path.startsWith(href);
  return (
    <Link
      href={href}
      className={cx(
        "group flex h-9 items-center gap-2.5 rounded-[8px] px-2.5 text-[13.5px] font-medium transition-colors",
        active ? "bg-accent-soft text-ink" : "text-muted hover:bg-surface-2 hover:text-ink",
      )}
    >
      <Icon size={16} className={active ? "text-accent" : "text-faint group-hover:text-muted"} />
      <span className="flex-1">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[232px] flex-col border-r border-line bg-[#11151b]">
      <div className="flex h-14 items-center gap-2.5 border-b border-line px-4">
        <div className="grid h-8 w-8 place-items-center rounded-[9px] bg-gradient-to-br from-accent to-violet text-[12px] font-bold tracking-[-0.03em] text-white shadow-[0_4px_14px_rgba(107,141,255,0.35)]">
          GF
        </div>
        <div className="leading-tight">
          <div className="text-[14px] font-semibold tracking-[-0.01em]">Grant Finder</div>
          <div className="text-[11px] text-faint">Blueprints for Pangaea</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="mb-2 px-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-faint">Finance</div>
        <ul className="space-y-0.5">
          {nav.map((item) => (
            <li key={item.href}>
              <NavLink item={item} path={path} />
            </li>
          ))}
        </ul>
        <div className="mb-2 mt-6 px-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-faint">Admin</div>
        <ul className="space-y-0.5">
          {adminNav.map((item) => (
            <li key={item.href}>
              <NavLink item={item} path={path} />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
