"use client";

import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  BookOpen,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Trade = {
  id: string;
  trade_date: string;
  created_at: string;
  symbol: string;
  direction: "Long" | "Short";
  pnl: number;
  r_multiple: number | null;
  followed_plan: boolean | null;
};

function formatPnl(value: number) {
  return `${value >= 0 ? "+" : "-"}$${Math.abs(value).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  )}`;
}

function formatPnlPrecise(value: number) {
  return `${value >= 0 ? "+" : "-"}$${Math.abs(value).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayMonday(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function MetricCard({
  title,
  value,
  negative = false,
  progress,
  icon,
}: {
  title: string;
  value: string;
  negative?: boolean;
  progress?: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[16px] border border-white/[0.10] bg-[#0d1823]/90 px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_12px_35px_rgba(0,0,0,0.18)]">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-white/45">{title}</p>

        {icon && <div className="text-blue-300/80">{icon}</div>}
      </div>

      <p
        className={`mt-5 text-[29px] font-semibold tracking-[-0.045em] ${
          negative ? "text-red-400" : "text-emerald-400"
        }`}
      >
        {value}
      </p>

      {progress !== undefined && (
        <div className="mt-5 h-[6px] overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-400/80 to-emerald-400"
            style={{
              width: `${Math.min(Math.max(progress, 0), 100)}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  const supabase = useMemo(() => createClient(), []);

  const now = new Date();

  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(
    now.getDate()
  );

  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const monthName = new Date(year, month, 1).toLocaleString("en-US", {
    month: "long",
  });

  const firstDay = getFirstDayMonday(year, month);
  const daysInMonth = getDaysInMonth(year, month);

  /*
   * Load trades for the selected month.
   */
  useEffect(() => {
    async function loadTrades() {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Please sign in again.");
        setLoading(false);
        return;
      }

      const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;

      const nextMonthDate = new Date(year, month + 1, 1);

      const endDate = `${nextMonthDate.getFullYear()}-${String(
        nextMonthDate.getMonth() + 1
      ).padStart(2, "0")}-01`;

      const { data, error: tradesError } = await supabase
        .from("trades")
        .select(
          "id, trade_date, created_at, symbol, direction, pnl, r_multiple, followed_plan"
        )
        .eq("user_id", user.id)
        .gte("trade_date", startDate)
        .lt("trade_date", endDate)
        .order("trade_date", {
          ascending: true,
        })
        .order("created_at", {
          ascending: true,
        });

      if (tradesError) {
        console.error("CALENDAR TRADES ERROR:", tradesError);
        setError("We couldn't load your trading data.");
        setTrades([]);
        setLoading(false);
        return;
      }

      setTrades((data ?? []) as Trade[]);
      setLoading(false);
    }

    loadTrades();
  }, [supabase, month, year]);

  /*
   * Group trades by day.
   */
  const tradesByDay = useMemo(() => {
    const grouped: Record<number, Trade[]> = {};

    for (const trade of trades) {
      const day = Number(trade.trade_date.slice(8, 10));

      if (!grouped[day]) {
        grouped[day] = [];
      }

      grouped[day].push(trade);
    }

    return grouped;
  }, [trades]);

  /*
   * Monthly statistics.
   */
  const monthlyStats = useMemo(() => {
    const totalPnl = trades.reduce(
      (sum, trade) => sum + Number(trade.pnl),
      0
    );

    const winners = trades.filter((trade) => Number(trade.pnl) > 0);
    const losers = trades.filter((trade) => Number(trade.pnl) < 0);

    const winRate =
      trades.length > 0 ? (winners.length / trades.length) * 100 : 0;

    const grossProfit = winners.reduce(
      (sum, trade) => sum + Number(trade.pnl),
      0
    );

    const grossLoss = Math.abs(
      losers.reduce((sum, trade) => sum + Number(trade.pnl), 0)
    );

    const profitFactor =
      grossLoss > 0
        ? grossProfit / grossLoss
        : grossProfit > 0
          ? grossProfit
          : 0;

    const planTrades = trades.filter(
      (trade) => trade.followed_plan !== null
    );

    const followedPlan = planTrades.filter(
      (trade) => trade.followed_plan === true
    );

    const planFollowed =
      planTrades.length > 0
        ? (followedPlan.length / planTrades.length) * 100
        : 0;

    return {
      totalPnl,
      winRate,
      profitFactor,
      planFollowed,
      tradeCount: trades.length,
      winners: winners.length,
      losers: losers.length,
    };
  }, [trades]);

  /*
   * Calculate weekly P&L.
   *
   * Monday = week 0
   * Tuesday = week 0
   * ...
   * Sunday = week 0
   *
   * Each calendar row gets its own weekly total.
   */
  const weeklyPnl = useMemo(() => {
    const weeks: number[] = [];

    const totalCalendarCells = Math.ceil(
      (firstDay + daysInMonth) / 7
    );

    for (let week = 0; week < totalCalendarCells; week++) {
      let total = 0;

      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const day =
          week * 7 + dayOfWeek - firstDay + 1;

        if (day < 1 || day > daysInMonth) {
          continue;
        }

        const dayTrades = tradesByDay[day] ?? [];

        total += dayTrades.reduce(
          (sum, trade) => sum + Number(trade.pnl),
          0
        );
      }

      weeks.push(total);
    }

    return weeks;
  }, [
    firstDay,
    daysInMonth,
    tradesByDay,
  ]);

  /*
   * Selected day's trades.
   */
  const selectedDayTrades = selectedDay
    ? tradesByDay[selectedDay] ?? []
    : [];

  const selectedDayPnl = selectedDayTrades.reduce(
    (sum, trade) => sum + Number(trade.pnl),
    0
  );

  /*
   * Calendar rows.
   */
  const calendarWeeks = useMemo(() => {
    const totalCalendarCells = Math.ceil(
      (firstDay + daysInMonth) / 7
    );

    return Array.from(
      { length: totalCalendarCells },
      (_, weekIndex) => {
        return Array.from(
          { length: 7 },
          (_, dayOfWeek) => {
            const day =
              weekIndex * 7 +
              dayOfWeek -
              firstDay +
              1;

            return day >= 1 && day <= daysInMonth
              ? day
              : null;
          }
        );
      }
    );
  }, [firstDay, daysInMonth]);

  function previousMonth() {
    setSelectedDay(null);

    if (month === 0) {
      setMonth(11);
      setYear((current) => current - 1);
    } else {
      setMonth((current) => current - 1);
    }
  }

  function nextMonth() {
    setSelectedDay(null);

    if (month === 11) {
      setMonth(0);
      setYear((current) => current + 1);
    } else {
      setMonth((current) => current + 1);
    }
  }

  function goToToday() {
    const today = new Date();

    setMonth(today.getMonth());
    setYear(today.getFullYear());
    setSelectedDay(today.getDate());
  }

  return (
    <main className="h-screen overflow-hidden bg-[#03070d] px-4 py-4 text-white lg:px-5">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-4">
        {/* KPI ROW */}

        <div className="grid shrink-0 grid-cols-2 gap-4 xl:grid-cols-4">
          <MetricCard
            title="Monthly P&L"
            value={
              loading
                ? "—"
                : formatPnlPrecise(monthlyStats.totalPnl)
            }
            negative={monthlyStats.totalPnl < 0}
            icon={
              <svg
                width="26"
                height="26"
                viewBox="0 0 26 26"
                fill="none"
              >
                <path
                  d="M3 20L9 14L13 17L22 7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 7H22V12"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />

          <MetricCard
            title="Win rate"
            value={
              loading
                ? "—"
                : `${monthlyStats.winRate.toFixed(0)}%`
            }
            progress={
              loading
                ? undefined
                : monthlyStats.winRate
            }
          />

          <MetricCard
            title="Profit factor"
            value={
              loading
                ? "—"
                : monthlyStats.profitFactor.toFixed(2)
            }
            negative={
              monthlyStats.profitFactor > 0 &&
              monthlyStats.profitFactor < 1
            }
            icon={
              <svg
                width="26"
                height="26"
                viewBox="0 0 26 26"
                fill="none"
              >
                <path
                  d="M5 21V13"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M13 21V6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M21 21V10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            }
          />

          <MetricCard
            title="Plan followed"
            value={
              loading
                ? "—"
                : `${monthlyStats.planFollowed.toFixed(0)}%`
            }
            progress={
              loading
                ? undefined
                : monthlyStats.planFollowed
            }
          />
        </div>

        {/* MAIN AREA */}

        <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,3.25fr)_minmax(300px,1.25fr)]">
          {/* CALENDAR */}

          <section className="flex min-h-0 flex-col overflow-hidden rounded-[17px] border border-white/[0.10] bg-[#0d1823]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_20px_60px_rgba(0,0,0,0.20)]">
            <div className="shrink-0 px-7 pb-5 pt-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/35">
                    P&L Calendar
                  </p>

                  <h2 className="mt-4 text-[22px] font-semibold tracking-[-0.04em] text-white/90">
                    {monthName} {year}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={previousMonth}
                    className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/[0.09] bg-white/[0.018] text-white/40 transition hover:bg-white/[0.04] hover:text-white/70"
                  >
                    <ChevronLeft
                      className="h-5 w-5"
                      strokeWidth={1.8}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={goToToday}
                    className="h-11 rounded-[10px] border border-white/[0.09] bg-white/[0.018] px-4 text-[14px] font-medium text-white/55 transition hover:bg-white/[0.04] hover:text-white/80"
                  >
                    Today
                  </button>

                  <button
                    type="button"
                    onClick={nextMonth}
                    className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/[0.09] bg-white/[0.018] text-white/40 transition hover:bg-white/[0.04] hover:text-white/70"
                  >
                    <ChevronRight
                      className="h-5 w-5"
                      strokeWidth={1.8}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* WEEKDAY HEADERS */}

            <div className="grid shrink-0 grid-cols-[repeat(7,minmax(0,1fr))_120px] border-y border-white/[0.045]">
              {[
                "MON",
                "TUE",
                "WED",
                "THU",
                "FRI",
                "SAT",
                "SUN",
                "WEEKLY P&L",
              ].map((day, index) => (
                <div
                  key={day}
                  className={`m-1 flex h-9 items-center justify-center rounded-[9px] border text-[10px] font-medium tracking-wide ${
                    index === 7
                      ? "border-blue-400/[0.08] bg-blue-500/[0.025] text-[9px] font-semibold tracking-[0.04em] text-blue-300/45"
                      : "border-white/[0.055] bg-white/[0.018] text-white/30"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* CALENDAR GRID */}

            <div className="min-h-0 flex-1 p-4">
              <div
                className="grid h-full overflow-hidden rounded-[13px] border border-white/[0.055]"
                style={{
                  gridTemplateColumns:
                    "repeat(7, minmax(0, 1fr)) 120px",
                  gridTemplateRows: `repeat(${calendarWeeks.length}, minmax(0, 1fr))`,
                }}
              >
                {calendarWeeks.map(
                  (week, weekIndex) => (
                    <div
                      key={`week-${weekIndex}`}
                      className="contents"
                    >
                      {week.map((day, dayIndex) => {
                        if (day === null) {
                          return (
                            <div
                              key={`empty-${weekIndex}-${dayIndex}`}
                              className="m-0.5 rounded-[11px] border border-white/[0.035] bg-[#080f18]/30"
                            />
                          );
                        }

                        const dayTrades =
                          tradesByDay[day] ?? [];

                        const dayPnl =
                          dayTrades.reduce(
                            (sum, trade) =>
                              sum +
                              Number(trade.pnl),
                            0
                          );

                        const hasTrades =
                          dayTrades.length > 0;

                        const isSelected =
                          selectedDay === day;

                        return (
                          <button
                            key={`day-${day}`}
                            type="button"
                            onClick={() =>
                              setSelectedDay(day)
                            }
                            className={`group relative m-0.5 min-h-0 cursor-pointer overflow-hidden rounded-[11px] border border-white/[0.065] p-0 text-left transition-all ${
                              isSelected
                                ? "z-10 border-blue-400/25 bg-blue-500/[0.16] shadow-[inset_0_0_35px_rgba(35,133,245,0.10),0_0_18px_rgba(35,133,245,0.05)]"
                                : "bg-[#0a141f]/55 hover:border-white/[0.11] hover:bg-white/[0.035]"
                            }`}
                            style={{ minHeight: "70px" }} // optional: ensures a nice cell height
                          >
                            <div className="relative flex h-full min-h-[70px] items-start justify-start p-0">
                              <span
                                className={`pt-2 pl-2 text-[11px] font-medium ${
                                  isSelected
                                    ? "text-blue-100"
                                    : "text-white/40"
                                }`}
                              >
                                {day}
                              </span>

                              {/* Trade and PnL overlays - absolute positioning allows overlays */}
                              {hasTrades && (
                                <>
                                  <span
                                    className={`absolute bottom-3 left-3 text-[12px] font-semibold ${
                                      dayPnl > 0
                                        ? "text-emerald-400"
                                        : dayPnl < 0
                                          ? "text-red-400"
                                          : "text-white/35"
                                    }`}
                                  >
                                    {dayPnl === 0
                                      ? "$0"
                                      : formatPnl(
                                          dayPnl
                                        )}
                                  </span>

                                  <span
                                    className={`pointer-events-none absolute bottom-1 left-2 right-2 h-8 rounded-full blur-[18px] opacity-20 ${
                                      dayPnl > 0
                                        ? "bg-emerald-400"
                                        : dayPnl < 0
                                          ? "bg-red-400"
                                          : "bg-white"
                                    }`}
                                  />

                                  <span className="absolute right-3 top-3 rounded-full bg-white/[0.045] px-1.5 py-0.5 text-[8px] text-white/25">
                                    {dayTrades.length}
                                  </span>
                                </>
                              )}
                            </div>
                          </button>
                        );
                      })}

                      {/* WEEKLY P&L */}

                      <div
                        className={`m-0.5 flex min-h-0 items-center justify-center rounded-[11px] border px-3 text-center ${
                          weeklyPnl[weekIndex] > 0
                            ? "border-emerald-400/[0.08] bg-emerald-400/[0.035]"
                            : weeklyPnl[weekIndex] < 0
                              ? "border-red-400/[0.08] bg-red-400/[0.035]"
                              : "border-white/[0.035] bg-white/[0.008]"
                        }`}
                      >
                        <div>
                          <p
                            className={`text-[13px] font-semibold ${
                              weeklyPnl[weekIndex] > 0
                                ? "text-emerald-400"
                                : weeklyPnl[weekIndex] <
                                    0
                                  ? "text-red-400"
                                  : "text-white/25"
                            }`}
                          >
                            {weeklyPnl[weekIndex] ===
                            0
                              ? "$0"
                              : formatPnl(
                                  weeklyPnl[
                                    weekIndex
                                  ]
                                )}
                          </p>

                          <p className="mt-1 text-[8px] uppercase tracking-[0.08em] text-white/20">
                            Week {weekIndex + 1}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>

          {/* SELECTED DAY */}

          <section className="flex min-h-0 flex-col overflow-hidden rounded-[17px] border border-white/[0.10] bg-[#0d1823]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_20px_60px_rgba(0,0,0,0.20)]">
            <div className="shrink-0 px-7 pb-5 pt-7">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/35">
                    Selected Day
                  </p>

                  <h2 className="mt-4 text-[22px] font-semibold tracking-[-0.04em] text-white/90">
                    {selectedDay
                      ? `${monthName} ${selectedDay}, ${year}`
                      : "Select a day"}
                  </h2>
                </div>

                <BookOpen
                  className="mt-1 h-6 w-6 text-blue-300/70"
                  strokeWidth={1.6}
                />
              </div>
            </div>

            {selectedDay === null ? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-7 pb-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-white/[0.025] text-white/25">
                  <CalendarDays
                    className="h-8 w-8"
                    strokeWidth={1.5}
                  />
                </div>

                <h3 className="mt-6 text-[19px] font-semibold tracking-[-0.03em] text-white/85">
                  Select a day
                </h3>

                <p className="mt-3 max-w-[250px] text-[13px] leading-5 text-white/35">
                  Select a day on the calendar to view
                  its trades.
                </p>
              </div>
            ) : selectedDayTrades.length === 0 ? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-7 pb-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-white/[0.025] text-white/25">
                  <CalendarDays
                    className="h-8 w-8"
                    strokeWidth={1.5}
                  />
                </div>

                <h3 className="mt-6 text-[19px] font-semibold tracking-[-0.03em] text-white/85">
                  No trades recorded
                </h3>

                <p className="mt-3 max-w-[250px] text-[13px] leading-5 text-white/35">
                  Add a trade or journal entry for this
                  date.
                </p>

                <a
                  href={`/dashboard/trades?date=${year}-${String(
                    month + 1
                  ).padStart(2, "0")}-${String(
                    selectedDay
                  ).padStart(2, "0")}`}
                  className="mt-7 flex h-12 items-center gap-2 rounded-[11px] border border-blue-400/20 bg-blue-500/[0.04] px-5 text-[14px] font-medium text-blue-200/80 transition hover:border-blue-400/35 hover:bg-blue-500/[0.08] hover:text-blue-200"
                >
                  <Plus
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />
                  Add trade
                </a>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
                {/* DAY TOTAL */}

                <div className="rounded-[14px] border border-white/[0.07] bg-white/[0.018] p-5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/30">
                    Daily P&L
                  </p>

                  <p
                    className={`mt-2 text-[27px] font-semibold tracking-[-0.04em] ${
                      selectedDayPnl >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatPnlPrecise(
                      selectedDayPnl
                    )}
                  </p>

                  <p className="mt-1 text-[11px] text-white/25">
                    {selectedDayTrades.length}{" "}
                    {selectedDayTrades.length === 1
                      ? "trade"
                      : "trades"}
                  </p>
                </div>

                {/* TRADES */}

                <div className="mt-4 space-y-2">
                  {selectedDayTrades.map((trade) => (
                    <div
                      key={trade.id}
                      className="rounded-[13px] border border-white/[0.07] bg-white/[0.018] p-4 transition hover:bg-white/[0.03]"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[14px] font-semibold text-white/80">
                            {trade.symbol}
                          </p>

                          <p
                            className={`mt-1 text-[10px] ${
                              trade.direction ===
                              "Long"
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {trade.direction}
                          </p>
                        </div>

                        <p
                          className={`text-[14px] font-semibold ${
                            Number(trade.pnl) >= 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {formatPnlPrecise(
                            Number(trade.pnl)
                          )}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[9px] text-white/25">
                            R Multiple
                          </p>

                          <p className="mt-1 text-[11px] text-white/55">
                            {trade.r_multiple !==
                            null
                              ? `${Number(
                                  trade.r_multiple
                                ).toFixed(2)}R`
                              : "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] text-white/25">
                            Plan
                          </p>

                          <p className="mt-1 text-[11px] text-white/55">
                            {trade.followed_plan ===
                            true
                              ? "Followed"
                              : trade.followed_plan ===
                                  false
                                ? "Not followed"
                                : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <a
                  href="/dashboard/trades"
                  className="mt-4 flex h-11 items-center justify-center rounded-[11px] border border-white/[0.07] bg-white/[0.02] text-[11px] font-medium text-white/50 transition hover:border-blue-400/15 hover:bg-blue-500/[0.05] hover:text-white"
                >
                  View trades
                </a>
              </div>
            )}
          </section>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-5 right-5 rounded-xl border border-red-500/20 bg-[#0b1119]/95 px-4 py-3 text-[10px] text-red-400 shadow-2xl backdrop-blur-xl">
          {error}
        </div>
      )}
    </main>
  );
}