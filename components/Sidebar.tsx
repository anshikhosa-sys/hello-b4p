"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Building2, Settings, type LucideIcon } from "lucide-react";
import { cx } from "./ui";
import { BrandLogo } from "./BrandMark";

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
        active ? "bg-white/12 text-white shadow-[inset_3px_0_0_#0069f3]" : "text-white/65 hover:bg-white/8 hover:text-white",
      )}
    >
      <Icon size={16} className={active ? "text-light" : "text-white/45 group-hover:text-white/80"} />
      <span className="flex-1">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[232px] flex-col bg-navy">
      <BrandLogo />
      <div className="border-b border-white/10 px-5 py-3">
        <div className="font-serif text-[17px] font-bold text-white">Grant Finder</div>
        <div className="text-[11.5px] text-light/75">Finance team</div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="mb-2 px-2 text-[11.5px] font-semibold text-white/45">Finance</div>
        <ul className="space-y-0.5">
          {nav.map((item) => (
            <li key={item.href}>
              <NavLink item={item} path={path} />
            </li>
          ))}
        </ul>
        <div className="mb-2 mt-6 px-2 text-[11.5px] font-semibold text-white/45">Admin</div>
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
