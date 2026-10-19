"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  ChevronRight,
  FileText,
  LogOut,
  MessageCircle,
  Settings,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  trading_style: string | null;
  plan: "free" | "pro";
  is_founder: boolean;
};

function getInitials(
  displayName: string | null,
  username: string | null
) {
  const value = displayName || username || "Trader";
  const words = value.trim().split(/\s+/);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

function Avatar({
  profile,
  large = false,
}: {
  profile: Profile;
  large?: boolean;
}) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.12] bg-gradient-to-br from-[#333333] via-[#171717] to-[#080808] text-white/75 ${
        large ? "h-14 w-14" : "h-10 w-10"
      }`}
    >
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span
          className={`font-semibold tracking-[-0.03em] ${
            large ? "text-[15px]" : "text-[11px]"
          }`}
        >
          {getInitials(
            profile.display_name,
            profile.username
          )}
        </span>
      )}

      <div className="pointer-events-none absolute inset-0 rounded-full bg-white/[0.025]" />
    </div>
  );
}

function MenuItem({
  href,
  icon,
  title,
  description,
  pro = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  pro?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.045] active:scale-[0.99]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.035] text-white/65 transition group-hover:border-white/[0.16] group-hover:text-white">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[12px] font-semibold text-white/75">
            {title}
          </p>

          {pro && (
            <span className="rounded-full border border-white/[0.15] bg-white/[0.06] px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-[0.08em] text-white/70">
              Pro
            </span>
          )}
        </div>

        <p className="mt-0.5 truncate text-[9px] text-white/25">
          {description}
        </p>
      </div>

      <ChevronRight
        className="h-4 w-4 shrink-0 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-white/40"
        strokeWidth={1.7}
      />
    </Link>
  );
}

export default function MorePage() {
  const supabase = useMemo(() => createClient(), []);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select(
          "display_name, username, avatar_url, trading_style, plan, is_founder"
        )
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data as Profile);
      }

      setLoading(false);
    }

    loadProfile();
  }, [supabase]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    await supabase.auth.signOut();

    window.location.href = "/";
  }

  const isPro = profile?.plan === "pro";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] px-4 py-5 pb-28 text-white sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[900px]">
        {/* HEADER */}
        <div className="px-1 pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">
            Menu
          </p>

          <h1 className="mt-1.5 text-[24px] font-semibold tracking-[-0.045em] text-white/90">
            More
          </h1>

          <p className="mt-1 text-[11px] text-white/30">
            Everything else in TradeMirror.
          </p>
        </div>

        {/* PROFILE CARD */}
        <Link
          href="/dashboard/settings"
          className="group relative block overflow-hidden rounded-[20px] border border-white/[0.10] bg-[#0b0b0b] p-4 shadow-[0_16px_45px_rgba(0,0,0,0.20)] transition hover:border-white/[0.16] hover:bg-[#101010]"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/[0.025] blur-3xl" />

          <div className="relative flex items-center gap-3.5">
            {profile ? (
              <Avatar profile={profile} large />
            ) : (
              <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-white/[0.04]" />
            )}

            <div className="min-w-0 flex-1">
              {loading ? (
                <>
                  <div className="h-4 w-28 animate-pulse rounded bg-white/[0.05]" />
                  <div className="mt-2 h-3 w-20 animate-pulse rounded bg-white/[0.035]" />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <p
                      className={`truncate text-[14px] font-semibold ${
                        profile?.is_founder
                          ? "text-[#E8C77A]"
                          : "text-white/85"
                      }`}
                    >
                      {profile?.display_name ||
                        "Trader"}
                    </p>

                    {isPro && (
                      <span className="rounded-full border border-white/[0.15] bg-white/[0.06] px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-[0.08em] text-white/70">
                        Pro
                      </span>
                    )}
                  </div>

                  <p className="mt-1 truncate text-[10px] text-white/30">
                    @
                    {profile?.username || "trader"}
                  </p>

                  {profile?.trading_style && (
                    <p className="mt-1 text-[9px] text-white/20">
                      {profile.trading_style}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.025] text-white/35 transition group-hover:border-white/[0.16] group-hover:text-white/80">
              <ChevronRight
                className="h-4 w-4"
                strokeWidth={1.7}
              />
            </div>
          </div>
        </Link>

        {/* QUICK ACCESS */}
        <section className="mt-5">
          <div className="mb-2.5 flex items-center gap-2 px-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.10em] text-white/25">
              Quick Access
            </p>

            <div className="h-px flex-1 bg-white/[0.045]" />
          </div>

          <div className="grid gap-2.5">
            <MenuItem
              href="/dashboard/messages"
              icon={
                <MessageCircle
                  className="h-[18px] w-[18px]"
                  strokeWidth={1.7}
                />
              }
              title="Messages"
              description="Chat with other traders."
            />

            <MenuItem
              href="/dashboard/settings"
              icon={
                <Settings
                  className="h-[18px] w-[18px]"
                  strokeWidth={1.7}
                />
              }
              title="Settings"
              description="Manage your account and preferences."
            />
          </div>
        </section>

        {/* PRO TOOLS */}
        <section className="mt-6">
          <div className="mb-2.5 flex items-center gap-2 px-1">
            <Sparkles
              className="h-3 w-3 text-white/55"
              strokeWidth={1.7}
            />

            <p className="text-[10px] font-semibold uppercase tracking-[0.10em] text-white/25">
              Pro Tools
            </p>

            <div className="h-px flex-1 bg-white/[0.045]" />
          </div>

          <div className="grid gap-2.5">
            <MenuItem
              href="/dashboard/analytics"
              icon={
                <BarChart3
                  className="h-[18px] w-[18px]"
                  strokeWidth={1.7}
                />
              }
              title="Analytics"
              description="Deep performance and risk analysis."
              pro
            />

            <MenuItem
              href="/dashboard/tax"
              icon={
                <FileText
                  className="h-[18px] w-[18px]"
                  strokeWidth={1.7}
                />
              }
              title="Tax Center"
              description="Review and export your trading tax data."
              pro
            />

            <MenuItem
              href="/dashboard/ai-review"
              icon={
                <Bot
                  className="h-[18px] w-[18px]"
                  strokeWidth={1.7}
                />
              }
              title="AI Weekly Overview"
              description="Get an AI-powered review of your trading."
              pro
            />
          </div>
        </section>

        {/* PRO UPGRADE */}
        {!isPro && (
          <Link
            href="/pricing"
            className="group relative mt-6 block overflow-hidden rounded-[20px] border border-white/[0.12] bg-gradient-to-br from-[#151515] to-[#090909] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.20)] transition hover:border-white/[0.20]"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/[0.04] blur-3xl" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] border border-white/[0.10] bg-white/[0.05]">
                <Sparkles
                  className="h-[18px] w-[18px] text-white/80"
                  strokeWidth={1.7}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-white/80">
                  Unlock TradeMirror Pro
                </p>

                <p className="mt-1 text-[9px] leading-4 text-white/30">
                  Unlock Analytics, Tax Center, and AI
                  Weekly Overview.
                </p>
              </div>

              <ArrowRight
                className="h-4 w-4 shrink-0 text-white/50 transition group-hover:translate-x-0.5 group-hover:text-white"
                strokeWidth={1.7}
              />
            </div>
          </Link>
        )}

        {/* LOG OUT */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.025] text-[12px] font-medium text-white/50 transition hover:border-red-400/[0.15] hover:bg-red-500/[0.04] hover:text-red-300/80 active:scale-[0.99] disabled:opacity-50"
        >
          {loggingOut ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
          ) : (
            <LogOut
              className="h-4 w-4"
              strokeWidth={1.7}
            />
          )}

          {loggingOut ? "Signing out..." : "Sign out"}
        </button>

        {/* FOOTER */}
        <div className="pb-4 pt-7 text-center">
          <p className="text-[8px] tracking-[0.08em] text-white/15">
            TRADEMIRROR
          </p>

          <p className="mt-1 text-[8px] text-white/10">
            Your journal. Your mirror. Your edge.
          </p>
        </div>
      </div>
    </main>
  );
}