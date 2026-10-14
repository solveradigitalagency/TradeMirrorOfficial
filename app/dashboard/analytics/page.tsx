"use client";

import {
  BarChart3,
  ChevronDown,
  TrendingUp,
  CalendarDays,
  Clock3,
  Target,
  Activity,
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
  setup: string | null;
  session: string | null;
  followed_plan: boolean | null;
};

type Range = "7D" | "30D" | "90D" | "YTD" | "All Time";

const tabs = [
  "Performance",
  "By Setup",
  "By Session",
  "By Day",
  "Advanced",
];

function formatMoney(value: number, decimals = 2) {
  return `${value >= 0 ? "+" : "-"}$${Math.abs(value).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }
  )}`;
}

function getRangeStart(range: Range) {
  const today = new Date();
  const start = new Date(today);

  if (range === "7D") {
    start.setDate(today.getDate() - 6);
  }

  if (range === "30D") {
    start.setDate(today.getDate() - 29);
  }

  if (range === "90D") {
    start.setDate(today.getDate() - 89);
  }

  if (range === "YTD") {
    start.setMonth(0, 1);
  }

  if (range === "All Time") {
    return null;
  }

  return start;
}

function MetricCard({
  title,
  value,
  positive,
  negative,
}: {
  title: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[14px] border border-white/[0.09] bg-gradient-to-br from-[#171717] via-[#111111] to-[#0a0a0a] px-6 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_12px_30px_rgba(0,0,0,0.16)] transition-all duration-300 hover:border-white/[0.13] hover:bg-[#1c1c1c]">
      <p className="text-[12px] font-medium text-white/40">
        {title}
      </p>

      <p
        className={`mt-4 text-[22px] font-semibold tracking-[-0.04em] ${
          positive
            ? "text-white"
            : negative
              ? "text-white/50"
              : "text-white/85"
        }`}
      >
        {value}
      </p>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/0 to-transparent transition-all duration-300 group-hover:via-white/15" />
    </div>
  );
}

function AnalysisBar({
  name,
  pnl,
  percentage,
  max,
}: {
  name: string;
  pnl: number;
  percentage: number;
  max: number;
}) {
  const width =
    max > 0
      ? Math.max((Math.abs(pnl) / max) * 100, 4)
      : 0;

  return (
    <div className="grid grid-cols-[150px_minmax(0,1fr)_120px_55px] items-center gap-5">
      <span className="truncate text-[13px] font-medium text-white/50">
        {name}
      </span>

      <div className="h-[10px] overflow-hidden rounded-full bg-white/[0.055]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            pnl >= 0
              ? "bg-gradient-to-r from-white/45 to-white/90 shadow-[0_0_14px_rgba(255,255,255,0.08)]"
              : "bg-gradient-to-r from-white/15 to-white/35"
          }`}
          style={{ width: `${width}%` }}
        />
      </div>

      <span
        className={`text-right text-[12px] font-semibold ${
          pnl >= 0
            ? "text-white/85"
            : "text-white/45"
        }`}
      >
        {formatMoney(pnl)}
      </span>

      <span className="text-right text-[11px] text-white/35">
        {percentage.toFixed(1)}%
      </span>
    </div>
  );
}

export default function AnalyticsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [activeTab, setActiveTab] =
    useState("By Setup");

  const [range, setRange] =
    useState<Range>("30D");

  const [trades, setTrades] = useState<Trade[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * LOAD REAL TRADES
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

      const { data, error: tradesError } =
        await supabase
          .from("trades")
          .select(
            "id, trade_date, created_at, symbol, direction, pnl, r_multiple, setup, session, followed_plan"
          )
          .eq("user_id", user.id)
          .order("trade_date", {
            ascending: true,
          })
          .order("created_at", {
            ascending: true,
          });

      if (tradesError) {
        console.error(
          "ANALYTICS ERROR:",
          tradesError
        );

        setError(
          "We couldn't load your trading data."
        );

        setLoading(false);
        return;
      }

      setTrades((data ?? []) as Trade[]);
      setLoading(false);
    }

    loadTrades();
  }, [supabase]);

  /*
   * FILTER BY RANGE
   */

  const filteredTrades = useMemo(() => {
    const rangeStart = getRangeStart(range);

    if (!rangeStart) {
      return trades;
    }

    rangeStart.setHours(0, 0, 0, 0);

    return trades.filter((trade) => {
      const date = new Date(
        `${trade.trade_date}T12:00:00`
      );

      return date >= rangeStart;
    });
  }, [trades, range]);

  /*
   * CORE METRICS
   */

  const metrics = useMemo(() => {
    const winners = filteredTrades.filter(
      (trade) => Number(trade.pnl) > 0
    );

    const losers = filteredTrades.filter(
      (trade) => Number(trade.pnl) < 0
    );

    const netPnl = filteredTrades.reduce(
      (sum, trade) => sum + Number(trade.pnl),
      0
    );

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

    const winRate =
      filteredTrades.length > 0
        ? (winners.length /
            filteredTrades.length) *
          100
        : 0;

    const profitFactor =
      grossLoss > 0
        ? grossProfit / grossLoss
        : grossProfit > 0
          ? grossProfit
          : 0;

    const avgWinner =
      winners.length > 0
        ? grossProfit / winners.length
        : 0;

    const avgLoser =
      losers.length > 0
        ? grossLoss / losers.length
        : 0;

    const expectancy =
      filteredTrades.length > 0
        ? netPnl / filteredTrades.length
        : 0;

    const rValues = filteredTrades
      .filter(
        (trade) => trade.r_multiple !== null
      )
      .map((trade) => Number(trade.r_multiple));

    const averageR =
      rValues.length > 0
        ? rValues.reduce(
            (sum, value) => sum + value,
            0
          ) / rValues.length
        : 0;

    /*
     * Maximum drawdown
     */

    let equity = 0;
    let peak = 0;
    let maxDrawdown = 0;

    for (const trade of filteredTrades) {
      equity += Number(trade.pnl);

      if (equity > peak) {
        peak = equity;
      }

      const drawdown = equity - peak;

      if (drawdown < maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    /*
     * Sharpe-like trade return ratio.
     *
     * This is calculated from the P&L series.
     */

    const returns = filteredTrades.map((trade) =>
      Number(trade.pnl)
    );

    let sharpe = 0;

    if (returns.length > 1) {
      const mean =
        returns.reduce(
          (sum, value) => sum + value,
          0
        ) / returns.length;

      const variance =
        returns.reduce(
          (sum, value) =>
            sum + Math.pow(value - mean, 2),
          0
        ) /
        (returns.length - 1);

      const standardDeviation =
        Math.sqrt(variance);

      if (standardDeviation > 0) {
        sharpe =
          (mean / standardDeviation) *
          Math.sqrt(returns.length);
      }
    }

    const followed = filteredTrades.filter(
      (trade) =>
        trade.followed_plan === true
    ).length;

    const planTrades = filteredTrades.filter(
      (trade) =>
        trade.followed_plan !== null
    ).length;

    const planRate =
      planTrades > 0
        ? (followed / planTrades) * 100
        : 0;

    return {
      netPnl,
      winRate,
      profitFactor,
      expectancy,
      avgWinner,
      avgLoser,
      maxDrawdown,
      averageR,
      sharpe,
      planRate,
      tradeCount: filteredTrades.length,
    };
  }, [filteredTrades]);

  /*
   * GROUP BY SETUP
   */

  const setupData = useMemo(() => {
    const groups: Record<
      string,
      {
        pnl: number;
        trades: number;
      }
    > = {};

    for (const trade of filteredTrades) {
      const name =
        trade.setup?.trim() || "No Setup";

      if (!groups[name]) {
        groups[name] = {
          pnl: 0,
          trades: 0,
        };
      }

      groups[name].pnl += Number(trade.pnl);
      groups[name].trades += 1;
    }

    const totalAbs = Object.values(groups).reduce(
      (sum, group) =>
        sum + Math.abs(group.pnl),
      0
    );

    const items = Object.entries(groups)
      .map(([name, group]) => ({
        name,
        pnl: group.pnl,
        trades: group.trades,
        percentage:
          totalAbs > 0
            ? (Math.abs(group.pnl) /
                totalAbs) *
              100
            : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl);

    return items.slice(0, 8);
  }, [filteredTrades]);

  /*
   * GROUP BY SESSION
   */

  const sessionData = useMemo(() => {
    const groups: Record<
      string,
      {
        pnl: number;
        trades: number;
      }
    > = {};

    for (const trade of filteredTrades) {
      const name =
        trade.session?.trim() || "No Session";

      if (!groups[name]) {
        groups[name] = {
          pnl: 0,
          trades: 0,
        };
      }

      groups[name].pnl += Number(trade.pnl);
      groups[name].trades += 1;
    }

    const totalAbs = Object.values(groups).reduce(
      (sum, group) =>
        sum + Math.abs(group.pnl),
      0
    );

    return Object.entries(groups)
      .map(([name, group]) => ({
        name,
        pnl: group.pnl,
        trades: group.trades,
        percentage:
          totalAbs > 0
            ? (Math.abs(group.pnl) /
                totalAbs) *
              100
            : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [filteredTrades]);

  /*
   * GROUP BY DAY OF WEEK
   */

  const dayData = useMemo(() => {
    const groups: Record<
      string,
      {
        pnl: number;
        trades: number;
      }
    > = {};

    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ];

    for (const day of days) {
      groups[day] = {
        pnl: 0,
        trades: 0,
      };
    }

    for (const trade of filteredTrades) {
      const date = new Date(
        `${trade.trade_date}T12:00:00`
      );

      const dayIndex = date.getDay();

      const name =
        dayIndex === 0
          ? "Sunday"
          : dayIndex === 1
            ? "Monday"
            : dayIndex === 2
              ? "Tuesday"
              : dayIndex === 3
                ? "Wednesday"
                : dayIndex === 4
                  ? "Thursday"
                  : dayIndex === 5
                    ? "Friday"
                    : "Saturday";

      if (!groups[name]) {
        groups[name] = {
          pnl: 0,
          trades: 0,
        };
      }

      groups[name].pnl += Number(trade.pnl);
      groups[name].trades += 1;
    }

    const totalAbs = Object.values(groups).reduce(
      (sum, group) =>
        sum + Math.abs(group.pnl),
      0
    );

    return Object.entries(groups)
      .filter(([, group]) => group.trades > 0)
      .map(([name, group]) => ({
        name,
        pnl: group.pnl,
        trades: group.trades,
        percentage:
          totalAbs > 0
            ? (Math.abs(group.pnl) /
                totalAbs) *
              100
            : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [filteredTrades]);

  const activeData =
    activeTab === "By Setup"
      ? setupData
      : activeTab === "By Session"
        ? sessionData
        : activeTab === "By Day"
          ? dayData
          : [];

  const maxBarValue = Math.max(
    ...activeData.map((item) =>
      Math.abs(item.pnl)
    ),
    1
  );

  /*
   * PERFORMANCE TAB
   */

  const performanceData = useMemo(() => {
    let equity = 0;

    return filteredTrades.map((trade) => {
      equity += Number(trade.pnl);

      return {
        date: trade.trade_date,
        equity,
        pnl: Number(trade.pnl),
      };
    });
  }, [filteredTrades]);

  const equityMin = Math.min(
    ...performanceData.map(
      (point) => point.equity
    ),
    0
  );

  const equityMax = Math.max(
    ...performanceData.map(
      (point) => point.equity
    ),
    1
  );

  const equityRange =
    equityMax - equityMin || 1;

  /*
   * EMPTY STATE
   */

  const hasData = filteredTrades.length > 0;

  return (
    <main className="h-screen overflow-hidden bg-background px-4 py-4 text-white lg:px-5">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col">

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[18px] border border-white/[0.10] bg-gradient-to-br from-[#171717] via-[#111111] to-[#0a0a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_30px_80px_rgba(0,0,0,0.28)]">

          {/* HEADER */}

          <div className="flex shrink-0 items-center justify-between px-7 pb-4 pt-6">

            <div>
              <h1 className="text-[25px] font-semibold tracking-[-0.045em] text-white/90">
                Analytics
              </h1>

              <p className="mt-1 text-[11px] text-white/25">
                {loading
                  ? "Loading your performance..."
                  : `${filteredTrades.length} trades analyzed`}
              </p>
            </div>

            <div className="flex items-center gap-2">

              {(
                [
                  "7D",
                  "30D",
                  "90D",
                  "YTD",
                  "All Time",
                ] as Range[]
              ).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    setRange(option)
                  }
                  className={`h-9 rounded-[8px] border px-3 text-[11px] font-medium transition ${
                    range === option
                      ? "border-white/[0.18] bg-white/[0.10] text-white"
                      : "border-white/[0.08] bg-white/[0.02] text-white/40 hover:bg-white/[0.05] hover:text-white/70"
                  }`}
                >
                  {option}
                </button>
              ))}

            </div>

          </div>

          {/* TABS */}

          <div className="shrink-0 px-7">

            <div className="flex h-9 items-center rounded-[10px] border border-white/[0.045] bg-white/[0.018] p-1">

              {tabs.map((tab) => {
                const active =
                  activeTab === tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() =>
                      setActiveTab(tab)
                    }
                    className={`h-full rounded-[7px] px-5 text-[11px] font-medium transition-all ${
                      active
                        ? "border border-white/[0.14] bg-white/[0.09] text-white shadow-[0_0_18px_rgba(255,255,255,0.035)]"
                        : "text-white/40 hover:bg-white/[0.025] hover:text-white/65"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}

            </div>

          </div>

          {/* CONTENT */}

          <div className="min-h-0 flex-1 px-7 pb-7 pt-5">

            <div className="flex h-full flex-col gap-5">

              {/* METRICS */}

              <div className="grid shrink-0 grid-cols-2 gap-4 xl:grid-cols-4">

                <MetricCard
                  title="Net P&L"
                  value={
                    loading
                      ? "—"
                      : formatMoney(
                          metrics.netPnl
                        )
                  }
                  positive={
                    metrics.netPnl >= 0
                  }
                  negative={
                    metrics.netPnl < 0
                  }
                />

                <MetricCard
                  title="Win Rate"
                  value={
                    loading
                      ? "—"
                      : `${metrics.winRate.toFixed(
                          1
                        )}%`
                  }
                />

                <MetricCard
                  title="Profit Factor"
                  value={
                    loading
                      ? "—"
                      : metrics.profitFactor.toFixed(
                          2
                        )
                  }
                />

                <MetricCard
                  title="Expectancy"
                  value={
                    loading
                      ? "—"
                      : formatMoney(
                          metrics.expectancy
                        )
                  }
                  positive={
                    metrics.expectancy >= 0
                  }
                  negative={
                    metrics.expectancy < 0
                  }
                />

                <MetricCard
                  title="Avg Winner"
                  value={
                    loading
                      ? "—"
                      : formatMoney(
                          metrics.avgWinner
                        )
                  }
                  positive
                />

                <MetricCard
                  title="Avg Loser"
                  value={
                    loading
                      ? "—"
                      : formatMoney(
                          -metrics.avgLoser
                        )
                  }
                  negative
                />

                <MetricCard
                  title="Max Drawdown"
                  value={
                    loading
                      ? "—"
                      : formatMoney(
                          metrics.maxDrawdown
                        )
                  }
                  negative={
                    metrics.maxDrawdown < 0
                  }
                />

                <MetricCard
                  title="Average R"
                  value={
                    loading
                      ? "—"
                      : `${metrics.averageR.toFixed(
                          2
                        )}R`
                  }
                  positive={
                    metrics.averageR >= 0
                  }
                  negative={
                    metrics.averageR < 0
                  }
                />

              </div>

              {/* MAIN ANALYSIS */}

              <section className="min-h-0 flex-1 overflow-hidden rounded-[15px] border border-white/[0.075] bg-gradient-to-br from-[#141414] via-[#101010] to-[#0a0a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">

                {activeTab === "Performance" ? (
                  <div className="flex h-full flex-col">

                    <div className="flex shrink-0 items-center justify-between px-6 pt-5">

                      <div className="flex items-center gap-2.5">
                        <TrendingUp
                          className="h-4 w-4 text-white/60"
                          strokeWidth={1.7}
                        />

                        <h2 className="text-[13px] font-medium text-white/65">
                          Equity Performance
                        </h2>
                      </div>

                      <span className="text-[10px] text-white/20">
                        {range}
                      </span>

                    </div>

                    {!hasData ? (
                      <div className="flex flex-1 flex-col items-center justify-center text-center">

                        <Activity className="h-8 w-8 text-white/15" />

                        <p className="mt-4 text-[14px] font-medium text-white/50">
                          No trading data yet
                        </p>

                        <p className="mt-2 max-w-[280px] text-[11px] leading-5 text-white/25">
                          Add some trades to start seeing your performance analytics.
                        </p>

                      </div>
                    ) : (
                      <div className="min-h-0 flex-1 px-6 pb-6 pt-4">

                        <div className="relative h-full overflow-hidden rounded-[12px] border border-white/[0.055] bg-[#111111]/70">

                          {/* GRID */}

                          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5">

                            {[0, 1, 2, 3, 4].map(
                              (line) => (
                                <div
                                  key={line}
                                  className="border-t border-white/[0.035]"
                                />
                              )
                            )}

                          </div>

                          {/* SVG EQUITY CURVE */}

                          <svg
                            viewBox="0 0 1000 360"
                            preserveAspectRatio="none"
                            className="absolute inset-0 h-full w-full p-5"
                          >
                            <defs>
                              <linearGradient
                                id="analytics-equity-fill"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#ffffff"
                                  stopOpacity="0.12"
                                />

                                <stop
                                  offset="100%"
                                  stopColor="#ffffff"
                                  stopOpacity="0"
                                />
                              </linearGradient>
                            </defs>

                            <path
                              d={performanceData
                                .map(
                                  (
                                    point,
                                    index
                                  ) => {
                                    const x =
                                      performanceData.length ===
                                      1
                                        ? 0
                                        : (index /
                                            (performanceData.length -
                                              1)) *
                                          1000;

                                    const y =
                                      350 -
                                      ((point.equity -
                                        equityMin) /
                                        equityRange) *
                                        300;

                                    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                                  }
                                )
                                .join(" ")}
                              fill="none"
                              stroke="#ffffff"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              vectorEffect="non-scaling-stroke"
                            />

                            <path
                              d={`${performanceData
                                .map(
                                  (
                                    point,
                                    index
                                  ) => {
                                    const x =
                                      performanceData.length ===
                                      1
                                        ? 0
                                        : (index /
                                            (performanceData.length -
                                              1)) *
                                          1000;

                                    const y =
                                      350 -
                                      ((point.equity -
                                        equityMin) /
                                        equityRange) *
                                        300;

                                    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                                  }
                                )
                                .join(
                                  " "
                                )} L 1000 350 L 0 350 Z`}
                              fill="url(#analytics-equity-fill)"
                            />
                          </svg>

                          {/* LABELS */}

                          <div className="absolute left-5 top-4 text-[10px] text-white/25">
                            {formatMoney(
                              equityMax,
                              0
                            )}
                          </div>

                          <div className="absolute bottom-4 left-5 text-[10px] text-white/25">
                            {formatMoney(
                              equityMin,
                              0
                            )}
                          </div>

                          <div className="absolute bottom-4 right-5 text-[10px] text-white/25">
                            {performanceData.length} trades
                          </div>

                        </div>

                      </div>
                    )}

                  </div>
                ) : activeTab === "Advanced" ? (
                  <div className="grid h-full grid-cols-2 gap-5 p-6 xl:grid-cols-3">

                    <div className="rounded-[13px] border border-white/[0.07] bg-white/[0.018] p-5">
                      <Target
                        className="h-5 w-5 text-white/60"
                        strokeWidth={1.6}
                      />

                      <p className="mt-5 text-[11px] text-white/30">
                        Average R
                      </p>

                      <p className="mt-2 text-2xl font-semibold text-white/80">
                        {metrics.averageR.toFixed(
                          2
                        )}
                        R
                      </p>
                    </div>

                    <div className="rounded-[13px] border border-white/[0.07] bg-white/[0.018] p-5">
                      <Activity
                        className="h-5 w-5 text-white/60"
                        strokeWidth={1.6}
                      />

                      <p className="mt-5 text-[11px] text-white/30">
                        Sharpe Ratio
                      </p>

                      <p className="mt-2 text-2xl font-semibold text-white/80">
                        {metrics.sharpe.toFixed(
                          2
                        )}
                      </p>
                    </div>

                    <div className="rounded-[13px] border border-white/[0.07] bg-white/[0.018] p-5">
                      <CalendarDays
                        className="h-5 w-5 text-white/60"
                        strokeWidth={1.6}
                      />

                      <p className="mt-5 text-[11px] text-white/30">
                        Trades
                      </p>

                      <p className="mt-2 text-2xl font-semibold text-white/80">
                        {metrics.tradeCount}
                      </p>
                    </div>

                    <div className="rounded-[13px] border border-white/[0.07] bg-white/[0.018] p-5">
                      <TrendingUp
                        className="h-5 w-5 text-white/60"
                        strokeWidth={1.6}
                      />

                      <p className="mt-5 text-[11px] text-white/30">
                        Max Drawdown
                      </p>

                      <p className="mt-2 text-2xl font-semibold text-white/50">
                        {formatMoney(
                          metrics.maxDrawdown
                        )}
                      </p>
                    </div>

                    <div className="rounded-[13px] border border-white/[0.07] bg-white/[0.018] p-5">
                      <BarChart3
                        className="h-5 w-5 text-white/60"
                        strokeWidth={1.6}
                      />

                      <p className="mt-5 text-[11px] text-white/30">
                        Profit Factor
                      </p>

                      <p className="mt-2 text-2xl font-semibold text-white/80">
                        {metrics.profitFactor.toFixed(
                          2
                        )}
                      </p>
                    </div>

                    <div className="rounded-[13px] border border-white/[0.07] bg-white/[0.018] p-5">
                      <Clock3
                        className="h-5 w-5 text-white/60"
                        strokeWidth={1.6}
                      />

                      <p className="mt-5 text-[11px] text-white/30">
                        Plan Followed
                      </p>

                      <p className="mt-2 text-2xl font-semibold text-white/80">
                        {metrics.planRate.toFixed(
                          0
                        )}
                        %
                      </p>
                    </div>

                  </div>
                ) : (
                  <div className="flex h-full flex-col">

                    <div className="px-6 pt-5">

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-2.5">

                          <BarChart3
                            className="h-4 w-4 text-white/60"
                            strokeWidth={1.7}
                          />

                          <h2 className="text-[13px] font-medium text-white/65">
                            {activeTab === "By Setup"
                              ? "P&L by Setup"
                              : activeTab ===
                                  "By Session"
                                ? "P&L by Session"
                                : "P&L by Day"}
                          </h2>

                        </div>

                        <span className="text-[10px] text-white/20">
                          {range}
                        </span>

                      </div>

                    </div>

                    <div className="flex min-h-0 flex-1 flex-col justify-center gap-5 px-6">

                      {!hasData ||
                      activeData.length ===
                        0 ? (
                        <div className="flex flex-col items-center justify-center text-center">

                          <BarChart3 className="h-8 w-8 text-white/15" />

                          <p className="mt-4 text-[14px] font-medium text-white/50">
                            Not enough data
                          </p>

                          <p className="mt-2 max-w-[280px] text-[11px] leading-5 text-white/25">
                            Add more trades with setup and session information to see this analysis.
                          </p>

                        </div>
                      ) : (
                        activeData.map(
                          (item) => (
                            <AnalysisBar
                              key={item.name}
                              name={item.name}
                              pnl={item.pnl}
                              percentage={
                                item.percentage
                              }
                              max={
                                maxBarValue
                              }
                            />
                          )
                        )
                      )}

                    </div>

                  </div>
                )}

              </section>

            </div>

          </div>

        </section>

      </div>

      {error && (
        <div className="fixed bottom-5 right-5 rounded-xl border border-white/[0.12] bg-[#111111]/95 px-4 py-3 text-[10px] text-white/70 shadow-2xl backdrop-blur-xl">
          {error}
        </div>
      )}

    </main>
  );
}