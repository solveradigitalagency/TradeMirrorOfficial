"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Compass,
  LayoutDashboard,
  Menu,
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
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-2 lg:hidden"
    >
      <div className="mx-auto max-w-lg rounded-[24px] border border-white/[0.12] bg-[#090909]/95 p-1.5 shadow-[0_-8px_40px_rgba(0,0,0,0.30),0_12px_32px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
        <div className="grid grid-cols-5 gap-1">
          {items.map((item) => {
            const Icon = item.icon;

            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex min-h-[58px] flex-col items-center justify-center gap-1.5 rounded-[18px] px-1 py-2 transition-all duration-200 ${
                  active
                    ? "bg-white/[0.09]"
                    : "bg-transparent hover:bg-white/[0.04] active:bg-white/[0.07]"
                }`}
              >
                <Icon
                  className={`h-[20px] w-[20px] transition-all duration-200 ${
                    active
                      ? "scale-105 text-white"
                      : "text-white/45 group-hover:text-white/80"
                  }`}
                  strokeWidth={active ? 2 : 1.7}
                  aria-hidden="true"
                />

                <span
                  className={`text-[10px] leading-none transition-colors duration-200 ${
                    active
                      ? "font-semibold text-white"
                      : "font-medium text-white/45 group-hover:text-white/75"
                  }`}
                >
                  {item.label}
                </span>

                {active && (
                  <span className="absolute bottom-1 h-[2px] w-4 rounded-full bg-white/80" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}