"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Compass,
  Crown,
  X,
  Sparkles,
  BookOpen,
  LayoutDashboard,
  ArrowLeftRight,
  Landmark,
  MessageCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Pro features list for potential future use
const proFeatures = [
  "AI trade capture",
  "Automatic trade imports",
  "Weekly AI reviews",
  "Advanced performance analytics",
  "Multiple trading accounts",
  "Payout and expense tracking",
  "Tax-ready exports",
  "Expanded screenshot storage",
];

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  trading_style: string | null;
  experience_level: string | null;
  is_public: boolean;
  show_pnl: boolean;
  show_trades: boolean;
  show_analytics: boolean;
  created_at: string;
  plan?: string | null; // <- add plan to type for runtime safety
  is_founder?: boolean; // Add this line for conditional founder color support
};

export default function DashboardSidebar() {
  const pathname = usePathname();

  const [profile, setProfile] = useState<Profile | null>(null);
  // State for showing/hiding the upgrade card (popup close)
  const [showProModal, setShowProModal] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (isMounted) setProfile(null);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!error && isMounted) {
          setProfile(data as Profile);
        }
      } catch (err) {
        // Silent fail, could add error state
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // Step 4 — badge dynamic
  const isPro = profile?.plan === "pro";

  // Step 5 — plan-filter the navigation list
  const navigation = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Trades",
      href: "/dashboard/trades",
      icon: ArrowLeftRight,
    },
    {
      label: "Journal",
      href: "/dashboard/journal",
      icon: BookOpen,
    },
    {
      label: "Calendar",
      href: "/dashboard/calendar",
      icon: CalendarDays,
    },
    ...(isPro
      ? [
          {
            label: "Analytics",
            href: "/dashboard/analytics",
            icon: BarChart3,
          },
          {
            label: "Tax Center",
            href: "/dashboard/tax",
            icon: Landmark,
          },
        ]
      : []),
    {
      label: "Discover",
      href: "/dashboard/discover",
      icon: Compass,
    },
    {
      label: "Messages",
      href: "/dashboard/messages",
      icon: MessageCircle,
    },
  ];

  return (
    <aside className="fixed left-3 top-3 bottom-3 z-40 flex w-[242px] flex-col overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#070d15]/95 shadow-[14px_0_45px_rgba(0,0,0,0.32),4px_0_18px_rgba(59,130,246,0.035),inset_-1px_0_0_rgba(255,255,255,0.025)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-y-5 right-0 w-px bg-gradient-to-b from-transparent via-white/[0.09] to-transparent" />

      {/* Logo */}
      <div className="relative flex h-[92px] items-center px-7 shrink-0">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/logo/trade-mirror-logo.png"
            alt="TradeMirror"
            width={220}
            height={64}
            priority
            className="h-auto w-[175px]"
          />
        </Link>
      </div>

      {/* Navigation - middle section, must be min-h-0 flex-1 to allow shrinking */}
      <div className="flex-1 min-h-0">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute left-[-120px] top-[80px] h-[350px] w-[350px] rounded-full bg-blue-500/[0.035] blur-[110px]" />
        {/* Main navigation */}
        <nav className="relative flex-1 px-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex h-[47px] items-center gap-3 rounded-xl px-4 text-[13px] font-medium transition-all duration-200 ${
                    active
                      ? "border border-blue-400/20 bg-blue-500/[0.13] text-white shadow-[0_0_28px_rgba(35,133,245,0.10),inset_0_1px_0_rgba(255,255,255,0.045)]"
                      : "border border-transparent text-white/42 hover:bg-white/[0.025] hover:text-white/75"
                  }`}
                >
                  {active && (
                    <span className="absolute left-[-1px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                  )}

                  <Icon
                    className={`h-[17px] w-[17px] ${
                      active
                        ? "text-blue-400"
                        : "text-white/35 group-hover:text-white/60"
                    }`}
                    strokeWidth={1.8}
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="my-7 h-px bg-white/[0.055]" />
          {/* Settings nav item removed per instruction */}
        </nav>
      </div>

      {/* Upgrade Pro Card */}
      {profile?.plan !== "pro" && showProModal && (
        <div className="mt-2 mb-2 shrink-0 relative w-[calc(100%-24px)] max-w-[calc(100%-24px)] overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#070d15] shadow-2xl mx-3">
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-500/[0.10] blur-[35px]" />

          <div className="relative flex items-start justify-between p-3.5 pb-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-500/[0.10]">
              <Sparkles
                className="h-3.5 w-3.5 text-blue-400"
                strokeWidth={1.8}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowProModal(false)}
              className="text-white/20 transition hover:text-white/50"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="relative mt-3 px-4">
            <p className="text-[12px] font-semibold text-white/85">
              Unlock Pro
            </p>
            <p className="mt-1.5 text-[10px] leading-[1.55] text-white/35">
              Get advanced analytics, Tax Center, and other powerful features.
            </p>
          </div>

          <div className="px-3.5 pt-2.5 pb-3.5">
            <Link
              href="/pricing"
              className="relative mt-2.5 flex h-8.5 items-center justify-center rounded-lg border border-blue-300/20 bg-blue-500 px-3 text-[11px] font-semibold text-white shadow-[0_8px_20px_rgba(35,133,245,0.18)] transition hover:bg-blue-400 w-full shrink-0"
            >
              <Crown className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.8} />
              Upgrade to Pro
            </Link>
          </div>
        </div>
      )}

      {/* User at bottom, outside scrollable wrapper */}
      <div className="shrink-0 border-t border-white/[0.06] p-3">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] p-3 transition hover:border-white/[0.10] hover:bg-white/[0.03]"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-zinc-600 to-zinc-900 text-[11px] font-semibold text-white overflow-hidden">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name || "Profile"}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-white/70">
                {(profile?.display_name || "J").charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={`truncate text-[11px] font-semibold ${
                profile?.is_founder
                  ? "text-[#E8C77A]"
                  : "text-white"
              }`}
            >
              {profile?.display_name || "Jake Carmona"}
            </p>

            <p className="mt-0.5 truncate text-[9px] text-white/30">
              @{profile?.username || "trader"}
            </p>
          </div>

          <span className="rounded-md border border-blue-400/15 bg-blue-500/[0.10] px-1.5 py-1 text-[8px] font-semibold text-blue-400">
            {profile?.plan === "pro" ? "PRO" : "FREE"}
          </span>
        </Link>
      </div>
    </aside>
  );
}