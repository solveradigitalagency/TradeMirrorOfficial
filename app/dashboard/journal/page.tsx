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
    <div className="min-w-0 border-b border-stone-300/80 py-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-stone-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-stone-800">
        {value == null || value === "" ? "—" : value}
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
      let user = null;

      try {
        const result = await supabase.auth.getUser();

        if (result.error) {
          const message = result.error.message?.toLowerCase() ?? "";

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

  function toggleExample() {
    if (showExample) {
      setShowExample(false);
      setActiveIndex(0);
    } else {
      setShowExample(true);
      setActiveIndex(trades.length);
    }
  }

  function goToTrade(index: number) {
    if (journalTrades.length === 0) return;

    const next =
      (index + journalTrades.length) % journalTrades.length;

    setActiveIndex(next);
  }

  return (
    <main className="journal-background min-h-screen overflow-x-hidden px-3 py-4 text-white sm:px-6 sm:py-5 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-[1500px] flex-col justify-center translate-y-3">
        <section className="w-full">
          {/* The physical book */}
          <div className="book-shell mx-auto max-w-6xl">
            <div className="book-pages">
              <div className="book-spread">
                {/* LEFT PAGE */}
                <article className="book-page book-left">
                  {loading ? (
                    <div className="flex h-full min-h-[540px] flex-col justify-center px-8 sm:px-12">
                      <div className="loading-line w-20" />
                      <div className="loading-line mt-7 w-40" />
                      <div className="loading-line mt-4 w-3/4" />
                      <div className="loading-line mt-12 w-full" />
                      <div className="loading-line mt-4 w-5/6" />
                      <p className="mt-8 text-xs text-stone-400">
                        Opening your journal…
                      </p>
                    </div>
                  ) : error ? (
                    <div className="flex min-h-[540px] flex-col justify-center px-8 sm:px-12">
                      <p className="book-eyebrow">A little interruption</p>
                      <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                        Couldn&apos;t load your entries.
                      </h2>
                      <p className="mt-4 break-words text-sm leading-7 text-stone-500">
                        {error}
                      </p>
                      <button
                        onClick={() =>
                          setRefreshKey((value) => value + 1)
                        }
                        className="mt-7 w-fit rounded-full border border-stone-300 px-5 py-2.5 text-sm text-stone-700 transition hover:bg-white"
                      >
                        Try again
                      </button>
                    </div>
                  ) : currentTrade ? (
                    <>
                      <div className="book-page-content">
                        <div className="flex items-start justify-between gap-3 border-b border-stone-300/80 pb-6">
                          <div>
                            <p className="book-eyebrow">
                              {isDemo ? "Sample entry" : "Trade journal"}
                            </p>
                            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                              {currentTrade.symbol || "Trade"}
                            </h1>
                            <p className="mt-2 text-xs text-stone-500">
                              {dateLabel(currentTrade.trade_date)}
                            </p>
                          </div>

                          <span className="mt-1 rounded-full border border-stone-300 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-stone-500">
                            {isDemo
                              ? "Preview"
                              : currentTrade.result || "Recorded"}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-x-5">
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

                        <div className="mt-4 border-y border-stone-300/80 py-5">
                          <p className="book-eyebrow">Realized P&L</p>
                          <p
                            className={`mt-3 text-4xl font-semibold tracking-tight ${
                              Number(currentTrade.pnl ?? 0) > 0
                                ? "text-emerald-700"
                                : Number(currentTrade.pnl ?? 0) < 0
                                  ? "text-rose-700"
                                  : "text-stone-800"
                            }`}
                          >
                            {money(currentTrade.pnl)}
                          </p>
                          <p className="mt-2 text-xs text-stone-500">
                            {currentTrade.r_multiple == null
                              ? "R-multiple not recorded"
                              : `${number(currentTrade.r_multiple)}R return`}
                          </p>
                        </div>
                      </div>

                      <footer className="book-page-footer">
                        <span>TRADEMIRROR</span>
                        <span>
                          {String(activeIndex * 2 + 1).padStart(2, "0")}
                        </span>
                      </footer>
                    </>
                  ) : (
                    <div className="flex min-h-[540px] flex-col justify-center px-8 sm:px-12">
                      <p className="book-eyebrow">
                        TradeMirror · Personal logbook
                      </p>
                      <h1 className="mt-8 max-w-sm text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                        Every trade tells a story.
                      </h1>
                      <p className="mt-5 max-w-sm text-sm leading-7 text-stone-500">
                        Every setup, every decision, every lesson.
                        Your trading history starts with a single entry.
                      </p>

                      <div className="mt-9 border-t border-stone-300/80 pt-5">
                        <p className="text-xs text-stone-400">
                          {signedIn === false
                            ? "Sign in to access your saved trades."
                            : "Your journal is ready for its first entry."}
                        </p>
                        <button
                          onClick={toggleExample}
                          className="mt-4 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
                        >
                          Preview a sample entry
                        </button>
                      </div>
                    </div>
                  )}
                </article>

                {/* RIGHT PAGE */}
                <article className="book-page book-right">
                  {loading ? (
                    <div className="flex h-full min-h-[540px] flex-col justify-center px-8 sm:px-12">
                      <div className="loading-line w-24" />
                      <div className="loading-line mt-7 w-48" />
                      <div className="loading-line mt-4 w-full" />
                      <div className="loading-line mt-4 w-5/6" />
                      <div className="loading-line mt-4 w-4/6" />
                    </div>
                  ) : error ? (
                    <div className="flex min-h-[540px] flex-col justify-center px-8 sm:px-12">
                      <p className="book-eyebrow">Journal status</p>
                      <h2 className="mt-4 text-2xl font-semibold">
                        Your pages are still here.
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-stone-500">
                        Try loading your journal again. Your saved trades
                        have not been changed by this page.
                      </p>
                    </div>
                  ) : currentTrade ? (
                    <>
                      <div className="book-page-content">
                        <div className="border-b border-stone-300/80 pb-6">
                          <p className="book-eyebrow">
                            Review & reflection
                          </p>
                          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                            The details.
                          </h2>
                          <p className="mt-2 text-xs text-stone-500">
                            What happened. What mattered. What to learn.
                          </p>
                        </div>

                        <div className="mt-1 grid grid-cols-2 gap-x-5">
                          <Detail
                            label="Setup"
                            value={currentTrade.setup}
                          />
                          <Detail
                            label="Session"
                            value={currentTrade.session}
                          />
                          <Detail
                            label="Market condition"
                            value={currentTrade.market_condition}
                          />
                          <Detail
                            label="Grade"
                            value={currentTrade.grade}
                          />
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

                        <div className="mt-4">
                          <p className="book-eyebrow">
                            Notes & reflection
                          </p>
                          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-stone-600">
                            {currentTrade.notes ||
                              "No notes recorded for this trade."}
                          </p>
                        </div>

                        {currentTrade.screenshot_url && (
                          <div className="mt-6">
                            <p className="book-eyebrow mb-3">
                              Chart screenshot
                            </p>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={currentTrade.screenshot_url}
                              alt="Trade chart screenshot"
                              className="max-h-56 w-full rounded-lg border border-stone-300 object-contain"
                            />
                          </div>
                        )}
                      </div>

                      <footer className="book-page-footer">
                        <span>
                          {isDemo ? "SAMPLE ENTRY" : "TRADING REFLECTION"}
                        </span>
                        <span>
                          {String(activeIndex * 2 + 2).padStart(2, "0")}
                        </span>
                      </footer>
                    </>
                  ) : (
                    <div className="flex min-h-[540px] flex-col justify-center px-8 sm:px-12">
                      <p className="book-eyebrow">The next chapter</p>
                      <h2 className="mt-5 text-3xl font-semibold tracking-tight">
                        A fresh page.
                      </h2>
                      <p className="mt-4 max-w-sm text-sm leading-7 text-stone-500">
                        Your future entries will live here, alongside your
                        setups, execution notes, and lessons learned.
                      </p>
                      <div className="mt-10 border-t border-stone-300/80 pt-5 text-xs text-stone-400">
                        The best traders never stop learning.
                      </div>
                    </div>
                  )}
                </article>
              </div>
            </div>
          </div>

          {/* Navigation stays separate from the paper itself */}
          {currentTrade && !loading && !error && (
            <div className="mx-auto mt-5 flex max-w-6xl items-center justify-between gap-4 px-1 sm:px-3">
              <button
                onClick={() => goToTrade(activeIndex - 1)}
                disabled={journalTrades.length < 2}
                aria-label="Previous trade"
                className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-white/75 transition hover:border-white/30 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-25 sm:px-5"
              >
                <span aria-hidden="true">←</span>
                <span>Previous</span>
              </button>

              <div className="text-center">
                <p className="text-xs font-medium tabular-nums text-white/70">
                  {activeIndex + 1} of {journalTrades.length}
                </p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/30">
                  {isDemo ? "Sample entry" : "Journal entries"}
                </p>
              </div>

              <button
                onClick={() => goToTrade(activeIndex + 1)}
                disabled={journalTrades.length < 2}
                aria-label="Next trade"
                className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-white/75 transition hover:border-white/30 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-25 sm:px-5"
              >
                <span>Next</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </section>
      </div>

      <style jsx>{`

  .journal-background {

    background:

      radial-gradient(

        ellipse at 50% 38%,

        rgba(255, 255, 255, 0.055),

        transparent 55%

      ),

      #3b0764;

  }



  .book-shell {

    position: relative;

    isolation: isolate;

    padding: 13px 12px 16px;

    border: 1px solid rgba(255, 255, 255, 0.13);

    border-radius: 10px 15px 15px 10px;

    background: linear-gradient(

      105deg,

      #101011 0%,

      #282829 8%,

      #111112 19%,

      #09090a 100%

    );

    box-shadow:

      0 40px 100px rgba(0, 0, 0, 0.58),

      0 10px 28px rgba(0, 0, 0, 0.38),

      inset 2px 0 4px rgba(255, 255, 255, 0.08),

      inset -2px 0 4px rgba(0, 0, 0, 0.8);

  }



  .book-pages {

    position: relative;

    border-radius: 3px;

    background: #d0ccc3;

    box-shadow:

      2px 4px 0 #a9a59d,

      4px 7px 0 #88857e,

      6px 10px 0 #5d5a55,

      8px 13px 0 #252526,

      10px 17px 24px rgba(0, 0, 0, 0.48);

  }



  .book-spread {

    position: relative;

    display: grid;

    grid-template-columns: minmax(0, 1fr);

    overflow: hidden;

    border-radius: 3px;

    background: #f4f1e9;

    box-shadow:

      0 0 0 1px rgba(64, 56, 44, 0.35),

      inset 0 0 12px rgba(78, 65, 47, 0.08);

  }



  .book-page {

    position: relative;

    display: flex;

    min-width: 0;

    min-height: 0;

    flex-direction: column;

    justify-content: space-between;

    overflow: hidden;

    padding: 30px 24px 24px;

    color: #292825;

    background-color: #f8f6f0;

    background-image: repeating-linear-gradient(

      to bottom,

      transparent 0,

      transparent 31px,

      rgba(120, 110, 91, 0.055) 32px

    );

  }



  .book-left {

    background-color: #faf8f2;

    box-shadow: inset -13px 0 18px -17px rgba(48, 39, 28, 0.65);

  }



  .book-right {

    background-color: #f3f0e8;

    box-shadow: inset 13px 0 18px -17px rgba(48, 39, 28, 0.65);

  }



  .book-page-content {

    position: relative;

    z-index: 1;

    padding-bottom: 12px;

  }



  .book-page-footer {

    position: relative;

    z-index: 1;

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 12px;

    border-top: 1px solid rgba(120, 110, 91, 0.24);

    padding-top: 12px;

    color: #a29b8e;

    font-size: 9px;

    letter-spacing: 0.17em;

  }



  .book-eyebrow {

    color: #a29b8e;

    font-size: 9px;

    font-weight: 700;

    letter-spacing: 0.2em;

    text-transform: uppercase;

  }



  .loading-line {

    height: 9px;

    max-width: 100%;

    border-radius: 999px;

    background: rgba(120, 110, 91, 0.15);

    animation: pulse 1.5s ease-in-out infinite;

  }



  @keyframes pulse {

    0%, 100% {

      opacity: 0.45;

    }

    50% {

      opacity: 1;

    }

  }



  @media (min-width: 768px) {

    .book-shell {

      padding: 18px 18px 21px;

    }



    .book-spread {

      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);

    }



    .book-page {

      min-height: 0;

      padding: 24px 28px 18px;

    }



    .book-left {

      transform-origin: right center;

    }



    .book-right {

      border-left: 1px solid rgba(120, 110, 91, 0.32);

      transform-origin: left center;

    }



    .book-spread::after {

      position: absolute;

      z-index: 2;

      top: 0;

      bottom: 0;

      left: 50%;

      width: 15px;

      content: "";

      pointer-events: none;

      transform: translateX(-50%);

      background: linear-gradient(

        to right,

        rgba(64, 56, 44, 0.1),

        rgba(64, 56, 44, 0.025) 30%,

        rgba(255, 255, 255, 0.35) 50%,

        rgba(64, 56, 44, 0.04) 70%,

        rgba(64, 56, 44, 0.11)

      );

    }

  }



  @media (min-width: 1100px) {

    .book-page {

      min-height: 0;

      padding: 26px 32px 18px;

    }

  }



  @media (prefers-reduced-motion: reduce) {

    .loading-line {

      animation: none;

    }

  }

`}</style>

    </main>
  );
}