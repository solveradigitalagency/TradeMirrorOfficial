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

// --- FIX 1: Change Trade type to have result as last field
type Trade = {
  id: string;
  trade_date: string;
  created_at: string;
  symbol: string;
  direction: "Long" | "Short";
  pnl: number;
  r_multiple: number | null;
  followed_plan: boolean | null;
  result: "Win" | "Loss" | "Breakeven" | null;
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
    <div className="relative overflow-hidden rounded-[14px] border border-white/[0.085] bg-gradient-to-br from-[#171717] via-[#111111] to-[#0a0a0a] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_12px_35px_rgba(0,0,0,0.18)] sm:rounded-[16px] sm:px-6 sm:py-6">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium text-white/45 sm:text-[13px]">
          {title}
        </p>

        {icon && (
          <div className="shrink-0 text-white/60">
            {icon}
          </div>
        )}
      </div>

      {/* --- METRIC CARD VALUE - Colorful based on negative prop */}
      <p
        className={`mt-3 text-[22px] font-semibold tracking-[-0.045em] sm:mt-5 sm:text-[29px] ${
          negative ? "text-red-400" : "text-emerald-400"
        }`}
      >
        {value}
      </p>

      {progress !== undefined && (
        <div className="mt-4 h-[5px] overflow-hidden rounded-full bg-white/[0.07] sm:mt-5 sm:h-[6px]">
          <div
            className="h-full rounded-full bg-white/65 transition-[width] duration-500"
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

  const monthName = new Date(year, month, 1).toLocaleString(
    "en-US",
    {
      month: "long",
    }
  );

  const firstDay = getFirstDayMonday(year, month);
  const daysInMonth = getDaysInMonth(year, month);

  /**
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

      const startDate = `${year}-${String(month + 1).padStart(
        2,
        "0"
      )}-01`;

      const nextMonthDate = new Date(year, month + 1, 1);

      const endDate = `${nextMonthDate.getFullYear()}-${String(
        nextMonthDate.getMonth() + 1
      ).padStart(2, "0")}-01`;

      // --- FIX 2: Select 'result' field in the .select() call
      const { data, error: tradesError } = await supabase
        .from("trades")
        .select(
          "id, trade_date, created_at, symbol, direction, pnl, r_multiple, followed_plan, result"
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
        console.error(
          "CALENDAR TRADES ERROR:",
          tradesError
        );
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

  /**
   * Group trades by day.
   */
  const tradesByDay = useMemo(() => {
    const grouped: Record<number, Trade[]> = {};

    for (const trade of trades) {
      const day = Number(
        trade.trade_date.slice(8, 10)
      );

      if (!grouped[day]) {
        grouped[day] = [];
      }

      grouped[day].push(trade);
    }

    return grouped;
  }, [trades]);

  /**
   * Monthly statistics.
   */
  const monthlyStats = useMemo(() => {
    const totalPnl = trades.reduce(
      (sum, trade) => sum + Number(trade.pnl),
      0
    );

    const winners = trades.filter(
      (trade) => Number(trade.pnl) > 0
    );

    const losers = trades.filter(
      (trade) => Number(trade.pnl) < 0
    );

    const breakevens = trades.filter(
      (trade) =>
        trade.result === "Breakeven" ||
        (trade.result === null && Number(trade.pnl) === 0)
    );

    const winRate =
      trades.length > 0
        ? (winners.length / trades.length) * 100
        : 0;

    const grossProfit = winners.reduce(
      (sum, trade) => sum + Number(trade.pnl),
      0
    );

    const grossLoss = Math.abs(
      losers.reduce(
        (sum, trade) => sum + Number(trade.pnl),
        0
      )
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
      breakevens: breakevens.length,
    };
  }, [trades]);

  /**
   * Calculate weekly P&L.
   *
   * Monday = week 0
   * Tuesday = week 0
   * ...
   * Sunday = week 0
   */
  const weeklyPnl = useMemo(() => {
    const weeks: number[] = [];

    const totalCalendarCells = Math.ceil(
      (firstDay + daysInMonth) / 7
    );

    for (
      let week = 0;
      week < totalCalendarCells;
      week++
    ) {
      let total = 0;

      for (
        let dayOfWeek = 0;
        dayOfWeek < 7;
        dayOfWeek++
      ) {
        const day =
          week * 7 +
          dayOfWeek -
          firstDay +
          1;

        if (day < 1 || day > daysInMonth) {
          continue;
        }

        const dayTrades =
          tradesByDay[day] ?? [];

        total += dayTrades.reduce(
          (sum, trade) =>
            sum + Number(trade.pnl),
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

  /**
   * Selected day's trades.
   */
  const selectedDayTrades = selectedDay
    ? tradesByDay[selectedDay] ?? []
    : [];

  const selectedDayPnl = selectedDayTrades.reduce(
    (sum, trade) => sum + Number(trade.pnl),
    0
  );

  /**
   * Calendar rows.
   */
  const calendarWeeks = useMemo(() => {
    const totalCalendarCells = Math.ceil(
      (firstDay + daysInMonth) / 7
    );

    return Array.from(
      {
        length: totalCalendarCells,
      },
      (_, weekIndex) => {
        return Array.from(
          { length: 7 },
          (_, dayOfWeek) => {
            const day =
              weekIndex * 7 +
              dayOfWeek -
              firstDay +
              1;

            return day >= 1 &&
              day <= daysInMonth
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
    <main className="min-h-screen bg-background px-3 py-3 text-white sm:px-4 sm:py-4 lg:h-screen lg:overflow-hidden lg:px-5">
      <div className="mx-auto flex min-h-full max-w-[1600px] flex-col gap-3 sm:gap-4 lg:h-full">

        {/* KPI ROW */}
        <div className="grid shrink-0 grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <MetricCard
            title="Monthly P&L"
            value={
              loading
                ? "—"
                : formatPnlPrecise(
                    monthlyStats.totalPnl
                  )
            }
            negative={monthlyStats.totalPnl < 0}
            icon={
              <svg
                width="26"
                height="26"
                viewBox="0 0 26 26"
                fill="none"
                className="h-5 w-5 sm:h-[26px] sm:w-[26px]"
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
                : `${monthlyStats.winRate.toFixed(
                    0
                  )}%`
            }
            negative={monthlyStats.winRate < 50}
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
                : monthlyStats.profitFactor.toFixed(
                    2
                  )
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
                className="h-5 w-5 sm:h-[26px] sm:w-[26px]"
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
                : `${monthlyStats.planFollowed.toFixed(
                    0
                  )}%`
            }
            negative={monthlyStats.planFollowed < 80}
            progress={
              loading
                ? undefined
                : monthlyStats.planFollowed
            }
          />
        </div>

        {/* MAIN AREA */}
        <div className="grid min-h-0 flex-1 gap-3 sm:gap-4 xl:grid-cols-[minmax(0,3.25fr)_minmax(300px,1.25fr)]">

          {/* CALENDAR */}
          <section className="flex min-h-[520px] flex-col overflow-hidden rounded-[16px] border border-white/[0.10] bg-gradient-to-br from-[#171717] via-[#111111] to-[#0a0a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_20px_60px_rgba(0,0,0,0.20)] sm:min-h-[600px] sm:rounded-[17px] lg:min-h-0">

            {/* Calendar Header */}
            <div className="shrink-0 px-4 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-7">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35 sm:text-[12px]">
                    P&L Calendar
                  </p>

                  <h2 className="mt-2 text-[19px] font-semibold tracking-[-0.04em] text-white/90 sm:mt-4 sm:text-[22px]">
                    {monthName} {year}
                  </h2>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={previousMonth}
                    className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-white/[0.09] bg-white/[0.018] text-white/40 transition hover:bg-white/[0.04] hover:text-white/70 sm:h-11 sm:w-11 sm:rounded-[10px]"
                  >
                    <ChevronLeft
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      strokeWidth={1.8}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={goToToday}
                    className="h-9 rounded-[9px] border border-white/[0.09] bg-white/[0.018] px-3 text-[11px] font-medium text-white/55 transition hover:bg-white/[0.04] hover:text-white/80 sm:h-11 sm:rounded-[10px] sm:px-4 sm:text-[14px]"
                  >
                    Today
                  </button>

                  <button
                    type="button"
                    onClick={nextMonth}
                    className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-white/[0.09] bg-white/[0.018] text-white/40 transition hover:bg-white/[0.04] hover:text-white/70 sm:h-11 sm:w-11 sm:rounded-[10px]"
                  >
                    <ChevronRight
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      strokeWidth={1.8}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* WEEKDAY HEADERS */}
            <div className="grid shrink-0 grid-cols-7 border-y border-white/[0.045] xl:grid-cols-[repeat(7,minmax(0,1fr))_120px]">
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
                  className={`m-0.5 flex h-7 items-center justify-center rounded-[7px] border text-[8px] font-medium tracking-wide sm:m-1 sm:h-9 sm:rounded-[9px] sm:text-[10px] ${
                    index === 7
                      ? "hidden border-white/[0.06] bg-white/[0.025] text-[9px] font-semibold tracking-[0.04em] text-white/40 xl:flex"
                      : "border-white/[0.055] bg-white/[0.018] text-white/30"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* CALENDAR GRID */}
            <div className="min-h-0 flex-1 p-2 sm:p-4">
              <div
                className="grid h-full overflow-hidden rounded-[11px] border border-white/[0.055] sm:rounded-[13px] xl:grid-cols-[repeat(7,minmax(0,1fr))_120px]"
                style={{
                  /*
                   * IMPORTANT:
                   * Do not set gridTemplateColumns here.
                   *
                   * The xl:grid-cols class above creates:
                   * 7 calendar columns + 1 Weekly P&L column.
                   *
                   * On mobile/tablet it remains a 7-column calendar.
                   */
                  gridTemplateRows: `repeat(${calendarWeeks.length}, minmax(0, 1fr))`,
                }}
              >
                {calendarWeeks.map(
                  (week, weekIndex) => (
                    <div
                      key={`week-${weekIndex}`}
                      className="contents"
                    >
                      {week.map(
                        (day, dayIndex) => {
                          if (day === null) {
                            return (
                              <div
                                key={`empty-${weekIndex}-${dayIndex}`}
                                className="m-0.5 rounded-[8px] border border-white/[0.035] bg-white/[0.01] sm:rounded-[11px]"
                              />
                            );
                          }

                          const dayTrades =
                            tradesByDay[day] ?? [];

                          const dayPnl =
                            dayTrades.reduce(
                              (sum, trade) =>
                                sum +
                                Number(
                                  trade.pnl
                                ),
                              0
                            );

                          const hasTrades =
                            dayTrades.length > 0;

                          const hasBreakeven = dayTrades.some(
                            (trade) => trade.result === "Breakeven"
                          );

                          const isSelected =
                            selectedDay === day;

                          return (
                            <button
                              key={`day-${day}`}
                              type="button"
                              onClick={() =>
                                setSelectedDay(day)
                              }
                              // --- MODIFIED BUTTON CLASSNAME (Prompt #1)
                              className={`group relative m-0.5 min-h-0 cursor-pointer overflow-hidden rounded-[8px] border p-0 text-left transition-all duration-300 sm:rounded-[11px] ${
                                dayTrades.length > 0 && dayPnl > 0
                                  ? isSelected
                                    ? "z-10 border-emerald-400/40 bg-emerald-400/[0.09] shadow-[inset_0_0_25px_rgba(52,211,153,0.08),0_0_22px_rgba(52,211,153,0.16)]"
                                    : "border-emerald-400/20 bg-emerald-400/[0.035] shadow-[inset_0_0_18px_rgba(52,211,153,0.035),0_0_12px_rgba(52,211,153,0.07)] hover:border-emerald-400/40 hover:bg-emerald-400/[0.07] hover:shadow-[inset_0_0_25px_rgba(52,211,153,0.07),0_0_20px_rgba(52,211,153,0.15)]"
                                  : dayTrades.length > 0 && dayPnl < 0
                                    ? isSelected
                                      ? "z-10 border-red-400/40 bg-red-400/[0.09] shadow-[inset_0_0_25px_rgba(248,113,113,0.08),0_0_22px_rgba(248,113,113,0.16)]"
                                      : "border-red-400/20 bg-red-400/[0.035] shadow-[inset_0_0_18px_rgba(248,113,113,0.035),0_0_12px_rgba(248,113,113,0.07)] hover:border-red-400/40 hover:bg-red-400/[0.07] hover:shadow-[inset_0_0_25px_rgba(248,113,113,0.07),0_0_20px_rgba(248,113,113,0.15)]"
                                    : isSelected
                                      ? "z-10 border-white/25 bg-white/[0.09] shadow-[inset_0_0_35px_rgba(255,255,255,0.035),0_0_18px_rgba(255,255,255,0.025)]"
                                      : "border-white/[0.065] bg-white/[0.015] hover:border-white/[0.11] hover:bg-white/[0.035]"
                              }`}
                            >
                              <div className="relative flex h-full min-h-[58px] items-start justify-start p-0 sm:min-h-[70px]">
                                <span
                                  className={`pt-1.5 pl-1.5 text-[9px] font-medium sm:pt-2 sm:pl-2 sm:text-[11px] ${
                                    isSelected
                                      ? "text-white"
                                      : "text-white/40"
                                  }`}
                                >
                                  {day}
                                </span>

                                {hasTrades && (
                                  <>
                                    {/* MODIFIED P&L AMOUNT CLASSNAME (Prompt #3) */}
                                    <span
                                      className={`absolute bottom-2 left-1.5 text-[9px] font-semibold sm:bottom-3 sm:left-3 sm:text-[12px] ${
                                        dayPnl > 0
                                          ? "text-emerald-300"
                                          : dayPnl < 0
                                            ? "text-red-300"
                                            : "text-white/45"
                                      }`}
                                    >
                                      {dayPnl === 0
                                        ? "$0"
                                        : formatPnl(
                                            dayPnl
                                          )}
                                    </span>

                                    {/* MODIFIED P&L AMOUNT GLOW (Prompt #2) */}
                                    <span
                                      className={`pointer-events-none absolute bottom-1 left-1 right-1 h-6 rounded-full blur-[15px] opacity-45 transition-opacity duration-300 group-hover:opacity-75 sm:bottom-1 sm:left-2 sm:right-2 sm:h-8 sm:blur-[18px] ${
                                        dayPnl > 0
                                          ? "bg-emerald-400/70"
                                          : dayPnl < 0
                                            ? "bg-red-400/60"
                                            : "bg-white/20"
                                      }`}
                                    />

                                    <span className="absolute right-1.5 top-1.5 rounded-full bg-white/[0.045] px-1 py-0.5 text-[7px] text-white/25 sm:right-3 sm:top-3 sm:px-1.5 sm:text-[8px]">
                                      {dayTrades.length}
                                    </span>

                                    {hasBreakeven && (
                                      <span
                                        className="absolute bottom-2 right-2 h-1.5 w-1.5 rounded-full bg-white/50 shadow-[0_0_8px_rgba(252,211,77,0.55)] sm:bottom-3 sm:right-3 sm:h-2 sm:w-2"
                                        title="Includes breakeven trade"
                                      />
                                    )}
                                  </>
                                )}
                              </div>
                            </button>
                          );
                        }
                      )}

                      {/* WEEKLY P&L — DESKTOP ONLY */}
                      <div
                        className={`m-0.5 hidden min-h-0 items-center justify-center rounded-[11px] border px-3 text-center xl:flex ${
                          weeklyPnl[weekIndex] > 0
                            ? "border-white/[0.08] bg-white/[0.025]"
                            : weeklyPnl[
                                  weekIndex
                                ] < 0
                              ? "border-white/[0.045] bg-white/[0.012]"
                              : "border-white/[0.035] bg-white/[0.008]"
                        }`}
                      >
                        <div>
                          <p
                            className={`text-[13px] font-semibold ${
                              weeklyPnl[weekIndex] > 0
                                ? "text-white/80"
                                : weeklyPnl[
                                      weekIndex
                                    ] < 0
                                  ? "text-white/45"
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
                            Week{" "}
                            {weekIndex + 1}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* MOBILE WEEKLY PERFORMANCE */}
            <div className="shrink-0 border-t border-white/[0.045] px-3 py-3 xl:hidden">
              <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                {weeklyPnl.map(
                  (value, index) => (
                    <div
                      key={`mobile-week-${index}`}
                      className={`flex min-w-[82px] flex-1 items-center justify-center rounded-[9px] border px-2 py-2 ${
                        value > 0
                          ? "border-white/[0.08] bg-white/[0.025]"
                          : value < 0
                            ? "border-white/[0.045] bg-white/[0.012]"
                            : "border-white/[0.035] bg-white/[0.008]"
                      }`}
                    >
                      <div className="text-center">
                        <p
                          className={`text-[10px] font-semibold ${
                            value > 0
                              ? "text-white/80"
                              : value < 0
                                ? "text-white/45"
                                : "text-white/25"
                          }`}
                        >
                          {value === 0
                            ? "$0"
                            : formatPnl(value)}
                        </p>

                        <p className="mt-0.5 text-[7px] uppercase tracking-[0.08em] text-white/20">
                          Week {index + 1}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>

          {/* SELECTED DAY */}
          <section className="flex min-h-[420px] flex-col overflow-hidden rounded-[16px] border border-white/[0.10] bg-gradient-to-br from-[#171717] via-[#111111] to-[#0a0a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_20px_60px_rgba(0,0,0,0.20)] sm:min-h-[450px] sm:rounded-[17px] lg:min-h-0">

            <div className="shrink-0 px-4 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-7">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35 sm:text-[12px]">
                    Selected Day
                  </p>

                  <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-white/90 sm:mt-4 sm:text-[22px]">
                    {selectedDay
                      ? `${monthName} ${selectedDay}, ${year}`
                      : "Select a day"}
                  </h2>
                </div>

                <BookOpen
                  className="mt-1 h-5 w-5 shrink-0 text-white/45 sm:h-6 sm:w-6"
                  strokeWidth={1.6}
                />
              </div>
            </div>

            {selectedDay === null ? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 pb-8 text-center sm:px-7 sm:pb-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-white/[0.025] text-white/25 sm:h-16 sm:w-16 sm:rounded-[16px]">
                  <CalendarDays
                    className="h-7 w-7 sm:h-8 sm:w-8"
                    strokeWidth={1.5}
                  />
                </div>

                <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.03em] text-white/85 sm:mt-6 sm:text-[19px]">
                  Select a day
                </h3>

                <p className="mt-2 max-w-[250px] text-[12px] leading-5 text-white/35 sm:mt-3 sm:text-[13px]">
                  Select a day on the calendar to
                  view its trades.
                </p>
              </div>
            ) : selectedDayTrades.length === 0 ? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 pb-8 text-center sm:px-7 sm:pb-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-white/[0.025] text-white/25 sm:h-16 sm:w-16 sm:rounded-[16px]">
                  <CalendarDays
                    className="h-7 w-7 sm:h-8 sm:w-8"
                    strokeWidth={1.5}
                  />
                </div>

                <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.03em] text-white/85 sm:mt-6 sm:text-[19px]">
                  No trades recorded
                </h3>

                <p className="mt-2 max-w-[250px] text-[12px] leading-5 text-white/35 sm:mt-3 sm:text-[13px]">
                  Add a trade or journal entry for
                  this date.
                </p>

                <a
                  href={`/dashboard/trades?date=${year}-${String(
                    month + 1
                  ).padStart(2, "0")}-${String(
                    selectedDay
                  ).padStart(2, "0")}`}
                  className="mt-6 flex h-11 items-center gap-2 rounded-[10px] border border-white/[0.12] bg-white/[0.04] px-4 text-[13px] font-medium text-white/80 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white sm:mt-7 sm:h-12 sm:rounded-[11px] sm:px-5 sm:text-[14px]"
                >
                  <Plus
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />
                  Add trade
                </a>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 sm:px-6 sm:pb-6">

                {/* DAY TOTAL */}
                <div className="rounded-[12px] border border-white/[0.07] bg-white/[0.018] p-4 sm:rounded-[14px] sm:p-5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-white/30 sm:text-[11px]">
                    Daily P&L
                  </p>

                  <p
                    className={`mt-1.5 text-[23px] font-semibold tracking-[-0.04em] sm:mt-2 sm:text-[27px] ${
                      selectedDayPnl >= 0
                        ? "text-white/80"
                        : "text-white/45"
                    }`}
                  >
                    {formatPnlPrecise(
                      selectedDayPnl
                    )}
                  </p>

                  <p className="mt-1 text-[10px] text-white/25 sm:text-[11px]">
                    {selectedDayTrades.length}{" "}
                    {selectedDayTrades.length === 1
                      ? "trade"
                      : "trades"}
                  </p>
                </div>

                {/* TRADES */}
                <div className="mt-3 space-y-2 sm:mt-4">
                  {selectedDayTrades.map(
                    (trade) => (
                      <div
                        key={trade.id}
                        className="rounded-[12px] border border-white/[0.07] bg-white/[0.018] p-3.5 transition hover:bg-white/[0.03] sm:rounded-[13px] sm:p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-white/80 sm:text-[14px]">
                              {trade.symbol}
                            </p>

                            <p
                              className={`mt-1 text-[9px] sm:text-[10px] ${
                                trade.direction ===
                                "Long"
                                  ? "text-white/80"
                                  : "text-white/45"
                              }`}
                            >
                              {trade.direction}
                            </p>

                            <span
                              className={`mt-1 inline-flex text-[8px] font-medium ${
                                trade.result === "Breakeven" ||
                                (trade.result === null && Number(trade.pnl) === 0)
                                  ? "text-white/55"
                                  : trade.result === "Loss" ||
                                      (trade.result === null && Number(trade.pnl) < 0)
                                    ? "text-white/45"
                                    : "text-white/70"
                              }`}
                            >
                              {trade.result ??
                                (Number(trade.pnl) === 0
                                  ? "Breakeven"
                                  : Number(trade.pnl) > 0
                                    ? "Win"
                                    : "Loss")}
                            </span>
                          </div>

                          <p
                            className={`shrink-0 text-[13px] font-semibold sm:text-[14px] ${
                              Number(
                                trade.pnl
                              ) >= 0
                                ? "text-white/80"
                                : "text-white/45"
                            }`}
                          >
                            {formatPnlPrecise(
                              Number(
                                trade.pnl
                              )
                            )}
                          </p>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4">
                          <div>
                            <p className="text-[8px] text-white/25 sm:text-[9px]">
                              R Multiple
                            </p>

                            <p className="mt-1 text-[10px] text-white/55 sm:text-[11px]">
                              {trade.r_multiple !==
                              null
                                ? `${Number(
                                    trade.r_multiple
                                  ).toFixed(
                                    2
                                  )}R`
                                : "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[8px] text-white/25 sm:text-[9px]">
                              Plan
                            </p>

                            <p className="mt-1 text-[10px] text-white/55 sm:text-[11px]">
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
                    )
                  )}
                </div>

                <a
                  href="/dashboard/trades"
                  className="mt-3 flex h-10 items-center justify-center rounded-[10px] border border-white/[0.07] bg-white/[0.02] text-[10px] font-medium text-white/50 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white sm:mt-4 sm:h-11 sm:rounded-[11px] sm:text-[11px]"
                >
                  View trades
                </a>
              </div>
            )}
          </section>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-20 left-3 right-3 z-[60] rounded-xl border border-red-500/20 bg-[#0b1119]/95 px-4 py-3 text-[10px] text-red-400 shadow-2xl backdrop-blur-xl sm:bottom-5 sm:left-auto sm:right-5">
          {error}
        </div>
      )}
    </main>
  );
}