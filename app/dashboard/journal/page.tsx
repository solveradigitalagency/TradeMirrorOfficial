
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Trade = {
  id: string;
  user_id?: string;
  trade_date: string | null;
  entry_time: string | null;
  exit_time: string | null;
  symbol: string | null;
  market: string | null;
  direction: string | null;
  entry_price: number | null;
  exit_price: number | null;
  quantity: number | null;
  pnl: number | null;
  risk_amount: number | null;
  r_multiple: number | null;
  setup: string | null;
  market_condition: string | null;
  session: string | null;
  grade: string | null;
  followed_plan: boolean | null;
  notes: string | null;
  screenshot_url: string | null;
  emotion: string | null;
  execution_rating: string | null;
  result: string | null;
  created_at?: string | null;
};

const DEMO_TRADE: Trade = {
  id: "demo-trade",
  trade_date: "2026-10-14",
  entry_time: "09:42",
  exit_time: "09:51",
  symbol: "NQ",
  market: "Nasdaq Futures",
  direction: "Long",
  entry_price: 24150.25,
  exit_price: 24175.25,
  quantity: 1,
  pnl: 500,
  risk_amount: 250,
  r_multiple: 2,
  setup: "Liquidity sweep + IFVG",
  market_condition: "Trending",
  session: "New York",
  grade: "A",
  followed_plan: true,
  notes:
    "Price swept the previous session low before reclaiming the level. Waited for confirmation, entered on the inversion fair value gap, and took profit at the next liquidity target. Patient execution. No revenge trading.",
  screenshot_url: null,
  emotion: "Confident",
  execution_rating: "Excellent",
  result: "Win",
};

const money = (value: number | null | undefined) => {
  if (value == null || !Number.isFinite(Number(value))) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
};

const number = (value: number | null | undefined) => {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 4,
  });
};

const dateLabel = (value: string | null) => {
  if (!value) return "Undated";

  const date = new Date(`${value.slice(0, 10)}T12:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const timeLabel = (value: string | null) => {
  if (!value) return "—";
  return value.slice(0, 5);
};

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="min-w-0 border-b border-stone-200/80 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-stone-800">
        {value == null || value === "" ? "—" : value}
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
        {label}
      </p>
      <p
        className={`mt-2 text-xl font-semibold tracking-tight ${
          positive === true
            ? "text-emerald-400"
            : positive === false
              ? "text-rose-400"
              : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [showExample, setShowExample] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadTrades = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // A missing browser session should be handled gracefully.
      let user = null;

      try {
        const result = await supabase.auth.getUser();

        if (result.error) {
          const message =
            result.error.message?.toLowerCase() ?? "";

          if (
            !message.includes("session missing") &&
            !message.includes("auth session missing")
          ) {
            throw result.error;
          }
        } else {
          user = result.data.user;
        }
      } catch (authError) {
        const message =
          authError instanceof Error
            ? authError.message.toLowerCase()
            : "";

        if (
          !message.includes("session missing") &&
          !message.includes("auth session missing")
        ) {
          throw authError;
        }
      }

      if (!user) {
        setSignedIn(false);
        setTrades([]);
        return;
      }

      setSignedIn(true);

      const { data, error: queryError } = await supabase
        .from("trades")
        .select(
          "id,user_id,trade_date,entry_time,exit_time,symbol,market,direction,entry_price,exit_price,quantity,pnl,risk_amount,r_multiple,setup,market_condition,session,grade,followed_plan,notes,screenshot_url,emotion,execution_rating,result,created_at"
        )
        .eq("user_id", user.id)
        .order("trade_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;

      setTrades((data ?? []) as Trade[]);
    } catch (err) {
      console.error("Journal loading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your journal."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTrades();
  }, [loadTrades, refreshKey]);

  const journalTrades = useMemo(() => {
    const combined = [...trades];

    if (showExample) {
      combined.push(DEMO_TRADE);
    }

    return combined;
  }, [trades, showExample]);

  const currentTrade = journalTrades[activeIndex] ?? null;
  const isDemo = currentTrade?.id === "demo-trade";

  const stats = useMemo(() => {
    const totalPnl = trades.reduce(
      (sum, trade) => sum + Number(trade.pnl ?? 0),
      0
    );

    const wins = trades.filter(
      (trade) => Number(trade.pnl ?? 0) > 0
    ).length;

    const losses = trades.filter(
      (trade) => Number(trade.pnl ?? 0) < 0
    ).length;

    const completed = wins + losses;

    return {
      totalPnl,
      count: trades.length,
      winRate: completed
        ? `${Math.round((wins / completed) * 100)}%`
        : "—",
      wins,
      losses,
    };
  }, [trades]);

  function toggleExample() {
    if (showExample) {
      if (currentTrade?.id === "demo-trade") {
        setActiveIndex(0);
      }
      setShowExample(false);
    } else {
      setShowExample(true);
      setActiveIndex(trades.length);
      // setIsOpen calls removed
    }
  }

  function goToTrade(index: number) {
    if (journalTrades.length === 0) return;

    const next =
      (index + journalTrades.length) % journalTrades.length;

    setActiveIndex(next);
  }

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-white">
      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-12">
        {/* Header */}
        <header className="flex flex-col justify-between gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-white/40">
              <span>TradeMirror</span>
              <span>/</span>
              <span className="text-white/70">Trading Journal</span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Your trading journal.
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
              Every setup. Every decision. Every lesson.
              A clearer picture of your trading performance.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleExample}
              className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium text-white/75 transition hover:border-white/30 hover:bg-white/5"
            >
              {showExample ? "Hide sample trade" : "Preview sample trade"}
            </button>

            <button
              onClick={() => setRefreshKey((value) => value + 1)}
              disabled={loading}
              className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/85 disabled:opacity-50"
            >
              {loading ? "Refreshing…" : "Refresh journal"}
            </button>
          </div>
        </header>

        {/* Performance overview */}
        <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            label="Net P&L"
            value={money(stats.totalPnl)}
            positive={
              stats.totalPnl > 0
                ? true
                : stats.totalPnl < 0
                  ? false
                  : null
            }
          />
          <Stat label="Total trades" value={String(stats.count)} />
          <Stat label="Win rate" value={stats.winRate} />
          <Stat
            label="Wins / losses"
            value={`${stats.wins} / ${stats.losses}`}
          />
        </section>

        {/* PERMANENTLY OPEN JOURNAL */}
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                The archive
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Trading logbook
              </h2>
            </div>

            <span className="text-xs text-white/35">
              {journalTrades.length}{" "}
              {journalTrades.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025]">
              <div className="text-center">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-white/80" />
                <p className="mt-4 text-sm text-white/45">
                  Loading your journal…
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8">
              <p className="text-sm text-white/70">
                We couldn&apos;t load your journal.
              </p>
              <p className="mt-2 break-words text-sm text-white/40">
                {error}
              </p>
              <button
                onClick={() => setRefreshKey((value) => value + 1)}
                className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
              >
                Try again
              </button>
            </div>
          ) : signedIn === false ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center">
              <h3 className="text-lg font-semibold">
                Your journal is waiting.
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
                Sign in to load your recorded trades, or preview a sample
                entry to see how your open journal works.
              </p>
              <button
                onClick={toggleExample}
                className="mt-5 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 hover:bg-white/5"
              >
                {showExample ? "Hide sample trade" : "Preview sample journal"}
              </button>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(ellipse_at_50%_25%,rgba(255,255,255,0.07),transparent_65%)] p-2 sm:p-5 lg:p-8">
              {/* Book frame */}
              <div className="mx-auto max-w-6xl">
                {currentTrade ? (
                  <>
                    <div
                      key={currentTrade.id}
                      className="journal-spread grid overflow-hidden rounded-[5px] bg-[#d8d5ce] shadow-[0_25px_80px_rgba(0,0,0,0.5)] md:grid-cols-2"
                    >
                      {/* LEFT PAGE */}
                      <article className="journal-page journal-left relative min-h-[460px] bg-[#f8f7f3] p-5 text-stone-900 sm:p-8 lg:p-10">
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-5 bg-gradient-to-l from-stone-300/40 to-transparent" />

                        <div className="relative flex items-start justify-between gap-3 border-b border-stone-300 pb-5">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-stone-400">
                              Trade entry
                            </p>
                            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                              {currentTrade.symbol || "Untitled"}
                            </h2>
                            <p className="mt-1 text-xs text-stone-500">
                              {dateLabel(currentTrade.trade_date)}
                            </p>
                          </div>

                          <span className="rounded-full border border-stone-300 px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-stone-500">
                            {isDemo ? "Sample" : currentTrade.result || "Logged"}
                          </span>
                        </div>

                        <div className="relative mt-5 grid grid-cols-2 gap-x-5">
                          <Detail label="Direction" value={currentTrade.direction} />
                          <Detail label="Market" value={currentTrade.market} />
                          <Detail label="Entry price" value={number(currentTrade.entry_price)} />
                          <Detail label="Exit price" value={number(currentTrade.exit_price)} />
                          <Detail label="Entry time" value={timeLabel(currentTrade.entry_time)} />
                          <Detail label="Exit time" value={timeLabel(currentTrade.exit_time)} />
                          <Detail label="Contracts" value={number(currentTrade.quantity)} />
                          <Detail label="Risk amount" value={money(currentTrade.risk_amount)} />
                        </div>

                        <div className="relative mt-6 rounded-xl border border-stone-200 bg-white/70 p-4 sm:p-5">
                          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400">
                            Realized P&L
                          </p>
                          <p
                            className={`mt-2 text-3xl font-semibold tracking-tight ${
                              Number(currentTrade.pnl ?? 0) > 0
                                ? "text-emerald-700"
                                : Number(currentTrade.pnl ?? 0) < 0
                                  ? "text-rose-700"
                                  : "text-stone-800"
                            }`}
                          >
                            {money(currentTrade.pnl)}
                          </p>
                          <p className="mt-1 text-xs text-stone-500">
                            {currentTrade.r_multiple == null
                              ? "R-multiple not recorded"
                              : `${number(currentTrade.r_multiple)}R return`}
                          </p>
                        </div>

                        <div className="absolute bottom-5 left-5 right-7 flex items-center justify-between border-t border-stone-200 pt-3 sm:bottom-7 sm:left-8 sm:right-10">
                          <span className="text-[9px] uppercase tracking-[0.18em] text-stone-400">
                            TradeMirror
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {activeIndex * 2 + 1}
                          </span>
                        </div>
                      </article>

                      {/* RIGHT PAGE */}
                      <article className="journal-page journal-right relative min-h-[460px] border-t border-stone-300 bg-[#f5f3ed] p-5 text-stone-900 md:border-l md:border-t-0 sm:p-8 lg:p-10">
                        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-5 bg-gradient-to-r from-stone-300/40 to-transparent md:block" />

                        <div className="relative border-b border-stone-300 pb-5">
                          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-stone-400">
                            Review & reflection
                          </p>
                          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                            The details.
                          </h2>
                        </div>

                        <div className="relative mt-2 grid grid-cols-2 gap-x-5">
                          <Detail label="Setup" value={currentTrade.setup} />
                          <Detail label="Session" value={currentTrade.session} />
                          <Detail label="Market condition" value={currentTrade.market_condition} />
                          <Detail label="Grade" value={currentTrade.grade} />
                          <Detail label="Emotion" value={currentTrade.emotion} />
                          <Detail label="Execution" value={currentTrade.execution_rating} />
                          <Detail
                            label="Followed plan"
                            value={
                              currentTrade.followed_plan == null
                                ? "—"
                                : currentTrade.followed_plan
                                  ? "Yes"
                                  : "No"
                            }
                          />
                        </div>

                        <div className="relative mt-6">
                          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">
                            Notes & reflection
                          </p>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-600">
                            {currentTrade.notes || "No notes recorded for this trade."}
                          </p>
                        </div>

                        {currentTrade.screenshot_url && (
                          <div className="relative mt-5">
                            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">
                              Chart screenshot
                            </p>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={currentTrade.screenshot_url}
                              alt="Trade chart screenshot"
                              className="max-h-56 w-full rounded-lg border border-stone-200 object-contain"
                            />
                          </div>
                        )}

                        <div className="absolute bottom-5 left-7 right-5 flex items-center justify-between border-t border-stone-200 pt-3 sm:bottom-7 sm:left-10 sm:right-8">
                          <span className="text-[10px] text-stone-400">
                            {isDemo ? "Sample entry" : "Trading reflection"}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {activeIndex * 2 + 2}
                          </span>
                        </div>
                      </article>
                    </div>

                    {/* PAGE NAVIGATION */}
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <button
                        onClick={() => goToTrade(activeIndex - 1)}
                        disabled={journalTrades.length < 2}
                        className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-white/75 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <span aria-hidden="true">←</span>
                        <span className="hidden sm:inline">Previous spread</span>
                        <span className="sm:hidden">Previous</span>
                      </button>

                      <span className="text-center text-[10px] tabular-nums text-white/40 sm:text-xs">
                        {activeIndex + 1} of {journalTrades.length}
                        {isDemo ? " · Sample" : ""}
                      </span>

                      <button
                        onClick={() => goToTrade(activeIndex + 1)}
                        disabled={journalTrades.length < 2}
                        className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-white/75 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <span className="hidden sm:inline">Next spread</span>
                        <span className="sm:hidden">Next</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="grid overflow-hidden rounded-[5px] shadow-[0_25px_80px_rgba(0,0,0,0.5)] md:grid-cols-2">
                    <article className="min-h-[420px] bg-[#f8f7f3] p-8 text-stone-900 sm:p-10">
                      <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-stone-400">
                        TradeMirror · Trading journal
                      </p>
                      <h2 className="mt-10 text-3xl font-semibold tracking-tight">
                        Every trade tells a story.
                      </h2>
                      <p className="mt-4 max-w-sm text-sm leading-7 text-stone-500">
                        Your trading history begins here. Each recorded trade
                        becomes a page in your personal logbook.
                      </p>
                      <div className="mt-10 border-t border-stone-200 pt-4 text-xs text-stone-400">
                        Page 1
                      </div>
                    </article>
                    <article className="min-h-[420px] border-t border-stone-300 bg-[#f5f3ed] p-8 text-stone-900 md:border-l md:border-t-0 sm:p-10">
                      <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-stone-400">
                        A fresh page
                      </p>
                      <h2 className="mt-6 text-xl font-semibold">
                        Ready when you are.
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-stone-500">
                        Record your first trade to begin building your journal.
                      </p>
                      <div className="mt-8 border-t border-stone-200 pt-4">
                        <button
                          onClick={toggleExample}
                          className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-white"
                        >
                          Preview sample trade
                        </button>
                      </div>
                      <div className="mt-10 border-t border-stone-200 pt-4 text-xs text-stone-400">
                        Page 2
                      </div>
                    </article>
                  </div>
                )}
              </div>

              {/* Subtle page-turn animation */}
              <style jsx>{`
                .journal-page {
                  transform-style: preserve-3d;
                  animation: pageTurn 420ms ease-out both;
                  backface-visibility: hidden;
                }
                .journal-left {
                  transform-origin: right center;
                }
                .journal-right {
                  transform-origin: left center;
                  animation-delay: 35ms;
                }
                @keyframes pageTurn {
                  from {
                    opacity: 0.72;
                    transform: perspective(1200px) rotateY(-4deg);
                  }
                  to {
                    opacity: 1;
                    transform: perspective(1200px) rotateY(0deg);
                  }
                }
                @media (prefers-reduced-motion: reduce) {
                  .journal-page {
                    animation: none;
                  }
                }
              `}</style>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
