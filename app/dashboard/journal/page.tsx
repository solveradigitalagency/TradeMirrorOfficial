
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";

const JournalCover3D = dynamic(
  () => import("./JournalCover3D"),
  { ssr: false }
);

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
  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(true);
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

        {/* Book section */}
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
              {trades.length} {trades.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.025]">
              <div className="text-center">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-white/80" />
                <p className="mt-4 text-sm text-white/45">
                  Opening your journal…
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-400/20 bg-rose-400/[0.04] p-7 sm:p-10">
              <p className="text-sm font-semibold text-rose-300">
                We couldn&apos;t load your journal.
              </p>
              <p className="mt-2 break-words text-sm text-white/50">
                {error}
              </p>
              <button
                onClick={() => setRefreshKey((value) => value + 1)}
                className="mt-5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/85"
              >
                Try again
              </button>
            </div>
          ) : signedIn === false ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-14 text-center sm:px-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl">
                ↗
              </div>
              <h3 className="mt-5 text-lg font-semibold">
                Your journal is waiting.
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
                There&apos;s no active Supabase login session in this
                browser. Sign in to your local site, then return here
                to load your trades.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setRefreshKey((value) => value + 1)}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/85"
                >
                  Check session again
                </button>
                <button
                  onClick={toggleExample}
                  className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/75 hover:bg-white/5"
                >
                  Preview sample journal
                </button>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,255,255,0.075),transparent_55%)] px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="relative mx-auto flex min-h-[350px] max-w-5xl flex-col items-center justify-center">
                <div className="w-full max-w-[650px]">
                  <JournalCover3D onOpen={() => setIsOpen(true)} />
                </div>

                <p className="mt-3 text-center text-xs tracking-wide text-white/35">
                  {trades.length === 0
                    ? "Your first trade begins a new chapter."
                    : "A record of your decisions, one trade at a time."}
                </p>

                <button
                  onClick={() => {
                    if (journalTrades.length > 0) {
                      setActiveIndex(0);
                    }
                    setIsOpen(true);
                  }}
                  className="mt-5 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/30 hover:bg-white/5"
                >
                  Open journal
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Recent trades */}
        {!loading && signedIn && !error && trades.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  Recent activity
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">
                  Recent trades
                </h2>
              </div>
              <button
                onClick={() => {
                  setActiveIndex(0);
                  setIsOpen(true);
                }}
                className="text-sm text-white/50 transition hover:text-white"
              >
                Open logbook →
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10">
              <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/10 bg-white/[0.035] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35 sm:grid-cols-[1.2fr_1fr_1fr_auto]">
                <span>Date / contract</span>
                <span className="hidden sm:block">Direction</span>
                <span className="hidden sm:block">Setup</span>
                <span className="text-right">P&L</span>
              </div>

              {trades.slice(0, 6).map((trade) => (
                <button
                  key={trade.id}
                  onClick={() => {
                    const index = journalTrades.findIndex(
                      (item) => item.id === trade.id
                    );
                    setActiveIndex(Math.max(0, index));
                    setIsOpen(true);
                  }}
                  className="grid w-full grid-cols-[1fr_auto] items-center gap-4 border-b border-white/[0.06] px-5 py-4 text-left transition last:border-b-0 hover:bg-white/[0.035] sm:grid-cols-[1.2fr_1fr_1fr_auto]"
                >
                  <div>
                    <p className="text-sm font-medium text-white/85">
                      {trade.symbol || "—"}
                    </p>
                    <p className="mt-1 text-xs text-white/35">
                      {dateLabel(trade.trade_date)}
                    </p>
                  </div>

                  <span className="hidden text-sm text-white/60 sm:block">
                    {trade.direction || "—"}
                  </span>

                  <span className="hidden truncate text-sm text-white/45 sm:block">
                    {trade.setup || "—"}
                  </span>

                  <span
                    className={`text-right text-sm font-semibold ${
                      Number(trade.pnl ?? 0) > 0
                        ? "text-emerald-400"
                        : Number(trade.pnl ?? 0) < 0
                          ? "text-rose-400"
                          : "text-white/65"
                    }`}
                  >
                    {money(trade.pnl)}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Open book */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 backdrop-blur-md sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div className="flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#171717] shadow-2xl sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  TradeMirror · Logbook
                </p>
                <p className="mt-1 truncate text-sm font-medium text-white/85">
                  {currentTrade
                    ? `${currentTrade.symbol || "Trade"} · ${dateLabel(currentTrade.trade_date)}`
                    : "Your journal"}
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close journal"
                className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-lg text-white/65 transition hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-6">
              {currentTrade ? (
                <div className="mx-auto grid max-w-5xl gap-3 md:grid-cols-2">
                  {/* Left page */}
                  <article className="min-h-[460px] rounded-sm bg-[#f5f0e6] p-5 text-stone-900 shadow-lg sm:p-8">
                    <div className="flex items-start justify-between gap-3 border-b border-stone-300 pb-5">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-stone-400">
                          Trade entry
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                          {currentTrade.symbol || "Untitled"}
                        </h2>
                        <p className="mt-1 text-xs text-stone-500">
                          {dateLabel(currentTrade.trade_date)}
                        </p>
                      </div>

                      <span className="rounded-full border border-stone-300 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-600">
                        {isDemo ? "Sample" : currentTrade.result || "Logged"}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-x-5">
                      <Detail
                        label="Direction"
                        value={currentTrade.direction}
                      />
                      <Detail
                        label="Market"
                        value={currentTrade.market}
                      />
                      <Detail
                        label="Entry price"
                        value={number(currentTrade.entry_price)}
                      />
                      <Detail
                        label="Exit price"
                        value={number(currentTrade.exit_price)}
                      />
                      <Detail
                        label="Entry time"
                        value={timeLabel(currentTrade.entry_time)}
                      />
                      <Detail
                        label="Exit time"
                        value={timeLabel(currentTrade.exit_time)}
                      />
                      <Detail
                        label="Contracts"
                        value={number(currentTrade.quantity)}
                      />
                      <Detail
                        label="Risk amount"
                        value={money(currentTrade.risk_amount)}
                      />
                    </div>

                    <div className="mt-5 rounded-xl border border-stone-200 bg-white/60 p-4">
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

                    <div className="mt-5 border-t border-stone-300 pt-3">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">
                        TradeMirror
                      </p>
                      <p className="mt-1 text-[10px] italic text-stone-400">
                        Process over outcome.
                      </p>
                    </div>
                  </article>

                  {/* Right page */}
                  <article className="min-h-[460px] rounded-sm bg-[#f5f0e6] p-5 text-stone-900 shadow-lg sm:p-8">
                    <div className="border-b border-stone-300 pb-5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-stone-400">
                        Review & reflection
                      </p>
                      <h2 className="mt-2 text-xl font-semibold tracking-tight">
                        The details.
                      </h2>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-x-5">
                      <Detail label="Setup" value={currentTrade.setup} />
                      <Detail
                        label="Session"
                        value={currentTrade.session}
                      />
                      <Detail
                        label="Market condition"
                        value={currentTrade.market_condition}
                      />
                      <Detail label="Grade" value={currentTrade.grade} />
                      <Detail
                        label="Emotion"
                        value={currentTrade.emotion}
                      />
                      <Detail
                        label="Execution"
                        value={currentTrade.execution_rating}
                      />
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

                    <div className="mt-5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">
                        Notes
                      </p>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-600">
                        {currentTrade.notes ||
                          "No notes recorded for this trade."}
                      </p>
                    </div>

                    {currentTrade.screenshot_url && (
                      <div className="mt-5">
                        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">
                          Chart screenshot
                        </p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentTrade.screenshot_url}
                          alt="Trade chart screenshot"
                          className="max-h-64 w-full rounded-lg border border-stone-200 object-contain"
                        />
                      </div>
                    )}

                    <div className="mt-8 border-t border-stone-300 pt-3">
                      <p className="text-[10px] text-stone-400">
                        Entry {activeIndex + 1} of {journalTrades.length}
                        {isDemo ? " · Preview data" : ""}
                      </p>
                    </div>
                  </article>
                </div>
              ) : (
                <div className="flex min-h-[55vh] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 px-6 text-center">
                  <div className="text-4xl text-white/20">✳</div>
                  <h2 className="mt-4 text-xl font-semibold">
                    A fresh page.
                  </h2>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-white/45">
                    Your journal is ready. Once you record a trade,
                    its details will appear here.
                  </p>
                  <button
                    onClick={toggleExample}
                    className="mt-5 rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 hover:bg-white/5"
                  >
                    Preview a sample trade
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 sm:px-6">
              <button
                onClick={() => goToTrade(activeIndex - 1)}
                disabled={journalTrades.length < 2}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                ← Previous
              </button>

              <span className="text-xs tabular-nums text-white/35">
                {journalTrades.length
                  ? `${activeIndex + 1} / ${journalTrades.length}`
                  : "No entries"}
              </span>

              <button
                onClick={() => goToTrade(activeIndex + 1)}
                disabled={journalTrades.length < 2}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
