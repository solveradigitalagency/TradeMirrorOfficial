"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Compass,
  LayoutDashboard,
  Menu,
  Sparkles,
} from "lucide-react";

const items = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Trades",
    href: "/dashboard/trades",
    icon: BarChart3,
  },
  {
    label: "Calendar",
    href: "/dashboard/calendar",
    icon: CalendarDays,
  },
  {
    label: "Discover",
    href: "/dashboard/discover",
    icon: Compass,
  },
  {
    label: "More",
    href: "/dashboard/more",
    icon: Menu,
  },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
      <div className="mx-3 mb-3 rounded-[22px] border border-white/[0.08] bg-[#07101a]/95 px-2 py-2 shadow-[0_-10px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        <div className="grid grid-cols-5">
          {items.map((item) => {
            const Icon = item.icon;

            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center gap-1 py-2"
              >
                {active && (
                  <span className="absolute inset-x-3 top-0 h-[2px] rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                )}

                <Icon
                  className={`h-[19px] w-[19px] transition-colors ${
                    active ? "text-blue-300" : "text-white/35"
                  }`}
                  strokeWidth={active ? 2.2 : 1.8}
                />

                <span
                  className={`text-[9px] font-medium ${
                    active ? "text-blue-300" : "text-white/30"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="h-[env(safe-area-inset-bottom)] bg-[#03070d]" />
    </nav>
  );
}