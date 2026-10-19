
"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Crosshair,
  Gauge,
  Layers3,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import PnlValue from "@/components/dashboard/PnlValue";

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
  emotion?: string | null;
  execution_rating?: string | null;
  risk_amount?: number | null;
};

type Range = "7D" | "30D" | "90D" | "YTD" | "All Time";
type Tab =
  | "Performance"
  | "By Setup"
  | "By Session"
  | "By Day"
  | "Advanced";
type ChartMode = "Equity" | "P&L" | "Drawdown";

const TABS: Tab[] = [
  "Performance",
  "By Setup",
  "By Session",
  "By Day",
  "Advanced",
];

const RANGES: Range[] = [
  "7D",
  "30D",
  "90D",
  "YTD",
  "All Time",
];

const money = (value: number, decimals = 2) =>
  `${value < 0 ? "-" : value > 0 ? "+" : ""}$${Math.abs(
    value
  ).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;

const plainMoney = (value: number) =>
  `$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const pct = (value: number) => `${value.toFixed(1)}%`;

function pnlColor(value: number) {
  if (value > 0) return "text-emerald-400";
  if (value < 0) return "text-red-400";
  return "text-white/45";
}

function getRangeStart(range: Range) {
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);

  if (range === "7D") start.setDate(start.getDate() - 6);
  if (range === "30D") start.setDate(start.getDate() - 29);
  if (range === "90D") start.setDate(start.getDate() - 89);
  if (range === "YTD") start.setMonth(0, 1);
  if (range === "All Time") return null;

  return start;
}

function safeNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function dateLabel(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function Panel({
  title,
  subtitle,
  icon: Icon,
  children,
  className = "",
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-white/[0.09] bg-[#101010] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] ${className}`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <div className="mt-0.5 rounded-lg border border-white/[0.08] bg-white/[0.035] p-2">
              <Icon className="h-4 w-4 text-white/65" strokeWidth={1.7} />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight text-white/90">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-xs leading-5 text-white/40">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  title,
  value,
  note,
  tone = "neutral",
  icon: Icon,
}: {
  title: string;
  value: React.ReactNode;
  note?: string;
  tone?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
}) {
  return (
    <div className="group min-w-0 rounded-2xl border border-white/[0.09] bg-gradient-to-br from-[#171717] to-[#0d0d0d] p-4 transition-colors hover:border-white/[0.15] sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-white/45">{title}</p>
        <Icon className="h-4 w-4 shrink-0 text-white/35" strokeWidth={1.7} />
      </div>
      <div
        className={`mt-4 truncate text-[22px] font-semibold tracking-[-0.045em] sm:text-[25px] ${
          tone === "positive"
            ? "text-emerald-400"
            : tone === "negative"
              ? "text-red-400"
              : "text-white/90"
        }`}
      >
        {value}
      </div>
      {note && (
        <p className="mt-2 text-[11px] leading-4 text-white/35">{note}</p>
      )}
    </div>
  );
}

function EmptyState({
  title,
  description,
  icon: Icon = Activity,
}: {
  title: string;
  description: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
        <Icon className="h-6 w-6 text-white/35" strokeWidth={1.5} />
      </div>
      <p className="mt-4 text-sm font-medium text-white/75">{title}</p>
      <p className="mt-2 max-w-sm text-xs leading-5 text-white/40">
        {description}
      </p>
    </div>
  );
}

function AnalysisBar({
  name,
  pnl,
  max,
  trades,
  winRate,
}: {
  name: string;
  pnl: number;
  max: number;
  trades: number;
  winRate?: number;
}) {
  const width = max > 0 ? (Math.abs(pnl) / max) * 100 : 0;

  return (
    <div className="grid grid-cols-[minmax(80px,1fr)_minmax(70px,1.5fr)_100px] items-center gap-3 sm:grid-cols-[minmax(120px,1fr)_minmax(80px,1.5fr)_120px_55px] sm:gap-4">
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-white/75">{name}</p>
        <p className="mt-1 text-[10px] text-white/35">
          {trades} {trades === 1 ? "trade" : "trades"}
          {winRate !== undefined ? ` · ${pct(winRate)} wins` : ""}
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            pnl > 0
              ? "bg-emerald-400"
              : pnl < 0
                ? "bg-red-400"
                : "bg-white/20"
          }`}
          style={{ width: `${Math.max(width, pnl !== 0 ? 1 : 0)}%` }}
        />
      </div>
      <PnlValue
        value={pnl}
        showSign
        className={`whitespace-nowrap text-right text-xs font-semibold ${pnlColor(pnl)}`}
      />
      <span className="hidden text-right text-[10px] text-white/35 sm:block">
        {max > 0 ? pct((Math.abs(pnl) / max) * 100) : "—"}
      </span>
    </div>
  );
}

function EquityChart({
  trades,
  mode,
}: {
  trades: Trade[];
  mode: ChartMode;
}) {
  const points = useMemo(() => {
    let equity = 0;
    let peak = 0;

    return trades.map((trade, index) => {
      const pnl = safeNumber(trade.pnl);
      equity += pnl;
      peak = Math.max(peak, equity);

      return {
        index,
        date: trade.trade_date,
        pnl,
        equity,
        drawdown: equity - peak,
      };
    });
  }, [trades]);

  if (!points.length) {
    return (
      <EmptyState
        title="Your chart starts here"
        description="Log your first trade to see your performance curve."
        icon={TrendingUp}
      />
    );
  }

  const values = points.map((point) =>
    mode === "P&L"
      ? point.pnl
      : mode === "Drawdown"
        ? point.drawdown
        : point.equity
  );

  let min = Math.min(...values, 0);
  let max = Math.max(...values, 0);

  if (max === min) {
    max += 1;
    min -= 1;
  }

  const padding = (max - min) * 0.1;
  min -= padding;
  max += padding;

  const width = 1000;
  const height = 300;

  const coordinates = values.map((value, index) => ({
    x: points.length === 1 ? width / 2 : (index / (points.length - 1)) * width,
    y: height - ((value - min) / (max - min)) * height,
    value,
  }));

  const path = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;
  const color =
    mode === "Drawdown"
      ? "#f87171"
      : values[values.length - 1] >= 0
        ? "#34d399"
        : "#f87171";

  const formatAxis = (value: number) =>
    `${value < 0 ? "-" : ""}$${Math.abs(value).toLocaleString("en-US", {
      maximumFractionDigits: 0,
    })}`;

  return (
    <div className="flex h-full min-h-[260px] flex-col">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className={`text-xl font-semibold tracking-tight ${pnlColor(values[values.length - 1])}`}>
            {mode === "Equity"
              ? money(values[values.length - 1])
              : mode === "P&L"
                ? money(values.reduce((sum, value) => sum + value, 0))
                : money(Math.min(...values))}
          </p>
          <p className="mt-1 text-[11px] text-white/35">
            {points.length} recorded trades · {mode}
          </p>
        </div>
        <div className="text-right text-[10px] leading-5 text-white/35">
          <div>{formatAxis(max)}</div>
          <div>{formatAxis(min)}</div>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((line) => (
            <div key={line} className="border-t border-white/[0.055]" />
          ))}
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
          role="img"
          aria-label={`${mode} chart across ${points.length} trades`}
        >
          <defs>
            <linearGradient id="trade-analytics-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#trade-analytics-fill)" />
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {coordinates.length < 40 &&
            coordinates.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="3"
                fill={color}
                stroke="#101010"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            ))}
        </svg>
      </div>

      <div className="mt-3 flex justify-between text-[10px] text-white/35">
        <span>{dateLabel(points[0].date)}</span>
        <span>{dateLabel(points[Math.floor((points.length - 1) / 2)].date)}</span>
        <span>{dateLabel(points[points.length - 1].date)}</span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [activeTab, setActiveTab] = useState<Tab>("Performance");
  const [range, setRange] = useState<Range>("30D");
  const [chartMode, setChartMode] = useState<ChartMode>("Equity");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const loadTrades = useCallback(async () => {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Please sign in again to view your analytics.");
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("trades")
      .select(
        "id, trade_date, created_at, symbol, direction, pnl, r_multiple, setup, session, followed_plan, emotion, execution_rating, risk_amount"
      )
      .eq("user_id", user.id)
      .order("trade_date", { ascending: true })
      .order("created_at", { ascending: true });

    if (queryError) {
      console.error("Analytics query failed:", queryError);
      setError("We couldn't load your trading data. Please try again.");
      setLoading(false);
      return;
    }

    setTrades((data ?? []) as Trade[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadTrades();
  }, [loadTrades, retryKey]);

  const filteredTrades = useMemo(() => {
    const start = getRangeStart(range);
    if (!start) return trades;

    const startDate = [
      start.getFullYear(),
      String(start.getMonth() + 1).padStart(2, "0"),
      String(start.getDate()).padStart(2, "0"),
    ].join("-");

    return trades.filter((trade) => trade.trade_date >= startDate);
  }, [trades, range]);

  const metrics = useMemo(() => {
    const winners = filteredTrades.filter((trade) => safeNumber(trade.pnl) > 0);
    const losers = filteredTrades.filter((trade) => safeNumber(trade.pnl) < 0);
    const breakevens = filteredTrades.filter((trade) => safeNumber(trade.pnl) === 0);

    const netPnl = filteredTrades.reduce((sum, trade) => sum + safeNumber(trade.pnl), 0);
    const grossProfit = winners.reduce((sum, trade) => sum + safeNumber(trade.pnl), 0);
    const grossLoss = Math.abs(losers.reduce((sum, trade) => sum + safeNumber(trade.pnl), 0));

    const winRate = filteredTrades.length ? (winners.length / filteredTrades.length) * 100 : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? null : 0;
    const avgWinner = winners.length ? grossProfit / winners.length : 0;
    const avgLoser = losers.length ? grossLoss / losers.length : 0;
    const expectancy = filteredTrades.length ? netPnl / filteredTrades.length : 0;

    const rValues = filteredTrades
      .map((trade) => trade.r_multiple)
      .filter((value): value is number => value !== null && value !== undefined && Number.isFinite(Number(value)))
      .map(Number);

    const averageR = rValues.length
      ? rValues.reduce((sum, value) => sum + value, 0) / rValues.length
      : null;

    let equity = 0;
    let peak = 0;
    let maxDrawdown = 0;

    for (const trade of filteredTrades) {
      equity += safeNumber(trade.pnl);
      peak = Math.max(peak, equity);
      maxDrawdown = Math.min(maxDrawdown, equity - peak);
    }

    const planTrades = filteredTrades.filter((trade) => trade.followed_plan !== null);
    const followed = planTrades.filter((trade) => trade.followed_plan === true);
    const planRate = planTrades.length ? (followed.length / planTrades.length) * 100 : null;

    const followedPnl = followed.reduce((sum, trade) => sum + safeNumber(trade.pnl), 0);
    const broken = planTrades.filter((trade) => trade.followed_plan === false);
    const brokenPnl = broken.reduce((sum, trade) => sum + safeNumber(trade.pnl), 0);

    const pnlValues = filteredTrades.map((trade) => safeNumber(trade.pnl));
    const mean = pnlValues.length ? netPnl / pnlValues.length : 0;
    const variance = pnlValues.length > 1
      ? pnlValues.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (pnlValues.length - 1)
      : 0;
    const stdDev = Math.sqrt(variance);

    // A descriptive trade-level ratio, not an annualized Sharpe ratio.
    const tradeReturnRatio = stdDev > 0 ? mean / stdDev : null;

    let currentStreak = 0;
    let longestLosingStreak = 0;

    for (const trade of filteredTrades) {
      if (safeNumber(trade.pnl) < 0) {
        currentStreak += 1;
        longestLosingStreak = Math.max(longestLosingStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    const largestWin = winners.length ? Math.max(...winners.map((trade) => safeNumber(trade.pnl))) : 0;
    const largestLoss = losers.length ? Math.min(...losers.map((trade) => safeNumber(trade.pnl))) : 0;

    return {
      netPnl,
      grossProfit,
      grossLoss,
      winRate,
      profitFactor,
      avgWinner,
      avgLoser,
      expectancy,
      averageR,
      maxDrawdown,
      planRate,
      followedPnl,
      followedCount: followed.length,
      brokenPnl,
      brokenCount: broken.length,
      tradeCount: filteredTrades.length,
      winners: winners.length,
      losers: losers.length,
      breakevens: breakevens.length,
      tradeReturnRatio,
      longestLosingStreak,
      largestWin,
      largestLoss,
    };
  }, [filteredTrades]);

  const groupBy = useCallback(
    (key: "setup" | "session" | "day" | "symbol") => {
      const groups = new Map<string, Trade[]>();

      for (const trade of filteredTrades) {
        let name = "";

        if (key === "setup") name = trade.setup?.trim() || "No Setup";
        if (key === "session") name = trade.session?.trim() || "No Session";
        if (key === "symbol") name = trade.symbol?.trim() || "Unknown";
        if (key === "day") {
          const day = new Date(`${trade.trade_date}T12:00:00`).getDay();
          name = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];
        }

        if (!groups.has(name)) groups.set(name, []);
        groups.get(name)!.push(trade);
      }

      return Array.from(groups.entries())
        .map(([name, groupTrades]) => {
          const pnl = groupTrades.reduce((sum, trade) => sum + safeNumber(trade.pnl), 0);
          const winners = groupTrades.filter((trade) => safeNumber(trade.pnl) > 0).length;
          const losers = groupTrades.filter((trade) => safeNumber(trade.pnl) < 0);
          const grossLoss = Math.abs(losers.reduce((sum, trade) => sum + safeNumber(trade.pnl), 0));
          const grossProfit = groupTrades.reduce((sum, trade) => sum + Math.max(0, safeNumber(trade.pnl)), 0);
          const rValues = groupTrades
            .map((trade) => trade.r_multiple)
            .filter((value): value is number => value !== null && value !== undefined && Number.isFinite(Number(value)))
            .map(Number);

          return {
            name,
            pnl,
            trades: groupTrades.length,
            winRate: groupTrades.length ? (winners / groupTrades.length) * 100 : 0,
            avgR: rValues.length ? rValues.reduce((sum, value) => sum + value, 0) / rValues.length : null,
            profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? null : 0,
          };
        })
        .sort((a, b) => b.pnl - a.pnl);
    },
    [filteredTrades]
  );

  const setupData = useMemo(() => groupBy("setup"), [groupBy]);
  const sessionData = useMemo(() => groupBy("session"), [groupBy]);
  const dayData = useMemo(() => groupBy("day"), [groupBy]);
  const symbolData = useMemo(() => groupBy("symbol"), [groupBy]);

  const setupMax = Math.max(...setupData.map((item) => Math.abs(item.pnl)), 1);
  const sessionMax = Math.max(...sessionData.map((item) => Math.abs(item.pnl)), 1);
  const dayMax = Math.max(...dayData.map((item) => Math.abs(item.pnl)), 1);

  const emotionData = useMemo(() => {
    const groups = new Map<string, Trade[]>();

    for (const trade of filteredTrades) {
      const emotion = trade.emotion?.trim() || "Not recorded";
      if (!groups.has(emotion)) groups.set(emotion, []);
      groups.get(emotion)!.push(trade);
    }

    return Array.from(groups.entries()).map(([name, rows]) => ({
      name,
      trades: rows.length,
      pnl: rows.reduce((sum, trade) => sum + safeNumber(trade.pnl), 0),
      winRate: rows.length
        ? (rows.filter((trade) => safeNumber(trade.pnl) > 0).length / rows.length) * 100
        : 0,
    })).sort((a, b) => b.pnl - a.pnl);
  }, [filteredTrades]);

  const executionData = useMemo(() => {
    const groups = new Map<string, Trade[]>();

    for (const trade of filteredTrades) {
      const rating = trade.execution_rating?.trim() || "Not recorded";
      if (!groups.has(rating)) groups.set(rating, []);
      groups.get(rating)!.push(trade);
    }

    return Array.from(groups.entries()).map(([name, rows]) => ({
      name,
      trades: rows.length,
      pnl: rows.reduce((sum, trade) => sum + safeNumber(trade.pnl), 0),
      winRate: rows.length
        ? (rows.filter((trade) => safeNumber(trade.pnl) > 0).length / rows.length) * 100
        : 0,
    })).sort((a, b) => b.pnl - a.pnl);
  }, [filteredTrades]);

  const dailyDistribution = useMemo(() => {
    const groups = new Map<string, number>();

    for (const trade of filteredTrades) {
      groups.set(trade.trade_date, (groups.get(trade.trade_date) ?? 0) + safeNumber(trade.pnl));
    }

    return Array.from(groups.values()).sort((a, b) => a - b);
  }, [filteredTrades]);

  const insight = useMemo(() => {
    if (filteredTrades.length < 5) {
      return {
        title: "Build your performance history",
        body: "Log more trades to uncover meaningful patterns. Insights become more useful as each setup and session has a larger sample size.",
      };
    }

    const bestSetup = setupData.filter((item) => item.trades >= 3).sort((a, b) => b.pnl - a.pnl)[0];
    const worstSetup = setupData.filter((item) => item.trades >= 3).sort((a, b) => a.pnl - b.pnl)[0];

    if (bestSetup && worstSetup && bestSetup.name !== worstSetup.name && worstSetup.pnl < 0) {
      return {
        title: `${bestSetup.name} is your strongest recorded setup`,
        body: `${bestSetup.trades} trades produced ${money(bestSetup.pnl)}. ${worstSetup.name} recorded ${money(worstSetup.pnl)} across ${worstSetup.trades} trades. Review those entries before making any strategy changes.`,
      };
    }

    if (metrics.planRate !== null && metrics.planRate < 70) {
      return {
        title: "Review trading-plan consistency",
        body: `Your plan was followed on ${pct(metrics.planRate)} of trades where adherence was recorded. Compare planned and unplanned trades before drawing conclusions.`,
      };
    }

    return {
      title: "Keep building a reliable sample",
      body: `You have ${filteredTrades.length} trades in this period. Compare setups, sessions, and plan adherence over time, and treat small samples as preliminary evidence.`,
    };
  }, [filteredTrades.length, setupData, metrics.planRate]);

  const activeGroup =
    activeTab === "By Setup"
      ? setupData
      : activeTab === "By Session"
        ? sessionData
        : dayData;

  const activeMax =
    activeTab === "By Setup"
      ? setupMax
      : activeTab === "By Session"
        ? sessionMax
        : dayMax;

  const noTrades = !loading && filteredTrades.length === 0;

  return (
    <main className="min-h-screen bg-background px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Page heading */}
        <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              <Activity className="h-3.5 w-3.5" />
              TradeMirror Pro
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.055em] text-white sm:text-4xl">
              Advanced analytics
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
              Understand your edge, measure your execution, and learn from your trading history.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {RANGES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRange(option)}
                className={`h-9 rounded-lg border px-3 text-xs font-medium transition ${
                  range === option
                    ? "border-white bg-white text-black"
                    : "border-white/[0.09] bg-white/[0.025] text-white/50 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setRetryKey((key) => key + 1)}
              title="Refresh analytics"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.09] bg-white/[0.025] text-white/55 transition hover:bg-white/[0.07] hover:text-white"
            >
              <Activity className="h-4 w-4" />
            </button>
          </div>
        </header>

        {error && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3">
            <p className="text-sm text-red-300">{error}</p>
            <button
              type="button"
              onClick={() => setRetryKey((key) => key + 1)}
              className="text-xs font-medium text-white underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Net P&L"
            icon={Wallet}
            value={loading ? "—" : money(metrics.netPnl)}
            tone={metrics.netPnl > 0 ? "positive" : metrics.netPnl < 0 ? "negative" : "neutral"}
            note={`${metrics.tradeCount} trades in selected period`}
          />
          <MetricCard
            title="Win rate"
            icon={Target}
            value={loading ? "—" : pct(metrics.winRate)}
            note={`${metrics.winners} wins · ${metrics.losers} losses · ${metrics.breakevens} breakeven`}
          />
          <MetricCard
            title="Profit factor"
            icon={BarChart3}
            value={loading ? "—" : metrics.profitFactor === null ? "∞" : metrics.profitFactor.toFixed(2)}
            note="Gross profit ÷ gross loss"
            tone={metrics.profitFactor !== null && metrics.profitFactor >= 1 ? "positive" : "neutral"}
          />
          <MetricCard
            title="Expectancy"
            icon={Gauge}
            value={loading ? "—" : money(metrics.expectancy)}
            note="Average net P&L per trade"
            tone={metrics.expectancy > 0 ? "positive" : metrics.expectancy < 0 ? "negative" : "neutral"}
          />
          <MetricCard
            title="Average R"
            icon={Crosshair}
            value={loading ? "—" : metrics.averageR === null ? "—" : `${metrics.averageR.toFixed(2)}R`}
            note="From trades with recorded R multiples"
            tone={metrics.averageR !== null && metrics.averageR > 0 ? "positive" : metrics.averageR !== null && metrics.averageR < 0 ? "negative" : "neutral"}
          />
          <MetricCard
            title="Maximum drawdown"
            icon={TrendingDown}
            value={loading ? "—" : money(metrics.maxDrawdown)}
            note="Largest peak-to-trough P&L decline"
            tone={metrics.maxDrawdown < 0 ? "negative" : "neutral"}
          />
          <MetricCard
            title="Average winner"
            icon={ArrowUpRight}
            value={loading ? "—" : plainMoney(metrics.avgWinner)}
            note={`${metrics.winners} winning trades`}
            tone="positive"
          />
          <MetricCard
            title="Average loser"
            icon={ArrowDownRight}
            value={loading ? "—" : `-${plainMoney(metrics.avgLoser)}`}
            note={`${metrics.losers} losing trades`}
            tone="negative"
          />
        </div>

        {/* Tab navigation */}
        <div className="overflow-x-auto">
          <div className="flex min-w-max items-center gap-1 border-b border-white/[0.09]">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-3 text-xs font-medium transition ${
                  activeTab === tab ? "text-white" : "text-white/40 hover:text-white/75"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-white" />
                )}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.025]"
              />
            ))}
          </div>
        ) : noTrades ? (
          <div className="rounded-2xl border border-white/[0.09] bg-[#101010]">
            <EmptyState
              title="Your analytics start with your first trade"
              description="There are no trades in this date range. Try All Time or record a trade in your journal to see your personal performance breakdown."
              icon={BarChart3}
            />
            <div className="border-t border-white/[0.07] px-5 py-4 text-center text-xs text-white/35">
              No sample results are displayed. Your analytics will use your saved trade records.
            </div>
          </div>
        ) : (
          <>
            {activeTab === "Performance" && (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.8fr)]">
                <Panel
                  title="Equity performance"
                  subtitle="Cumulative results in trade-date order"
                  icon={TrendingUp}
                  className="min-h-[390px]"
                  action={
                    <div className="flex rounded-lg border border-white/[0.08] bg-black/20 p-1">
                      {(["Equity", "P&L", "Drawdown"] as ChartMode[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setChartMode(mode)}
                          className={`rounded-md px-2.5 py-1.5 text-[10px] font-medium transition ${
                            chartMode === mode
                              ? "bg-white text-black"
                              : "text-white/45 hover:text-white"
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  }
                >
                  <EquityChart trades={filteredTrades} mode={chartMode} />
                </Panel>

                <Panel
                  title="Trade outcomes"
                  subtitle="How recorded trades performed"
                  icon={Layers3}
                  className="min-h-[390px]"
                >
                  <div className="flex flex-col items-center justify-center gap-5 py-4 sm:flex-row xl:flex-col">
                    <div
                      className="relative h-40 w-40 shrink-0 rounded-full"
                      style={{
                        background: `conic-gradient(#34d399 0% ${metrics.tradeCount ? (metrics.winners / metrics.tradeCount) * 100 : 0}%, #f87171 ${metrics.tradeCount ? (metrics.winners / metrics.tradeCount) * 100 : 0}% ${metrics.tradeCount ? ((metrics.winners + metrics.losers) / metrics.tradeCount) * 100 : 0}%, #737373 ${metrics.tradeCount ? ((metrics.winners + metrics.losers) / metrics.tradeCount) * 100 : 0}% 100%)`,
                      }}
                    >
                      <div className="absolute inset-[11px] flex flex-col items-center justify-center rounded-full border border-white/[0.07] bg-[#101010]">
                        <span className="text-2xl font-semibold text-white">
                          {metrics.tradeCount}
                        </span>
                        <span className="mt-1 text-[10px] text-white/40">total trades</span>
                      </div>
                    </div>

                    <div className="w-full space-y-4">
                      {[
                        { label: "Winning trades", count: metrics.winners, color: "bg-emerald-400", pnl: metrics.grossProfit },
                        { label: "Losing trades", count: metrics.losers, color: "bg-red-400", pnl: -metrics.grossLoss },
                        { label: "Breakeven trades", count: metrics.breakevens, color: "bg-white/40", pnl: 0 },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span className={`h-2 w-2 shrink-0 rounded-full ${item.color}`} />
                            <div className="min-w-0">
                              <p className="truncate text-xs text-white/65">{item.label}</p>
                              <p className="mt-1 text-[10px] text-white/35">
                                {metrics.tradeCount ? pct((item.count / metrics.tradeCount) * 100) : "0%"}
                              </p>
                            </div>
                          </div>
                          <PnlValue
                            value={item.pnl}
                            showSign
                            className={`whitespace-nowrap text-xs font-semibold ${pnlColor(item.pnl)}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>

                <Panel
                  title="Performance by setup"
                  subtitle="Find the strategies contributing to your results"
                  icon={Target}
                  className="xl:col-span-2"
                >
                  {setupData.length ? (
                    <div className="space-y-5">
                      {setupData.slice(0, 6).map((item) => (
                        <AnalysisBar
                          key={item.name}
                          name={item.name}
                          pnl={item.pnl}
                          max={setupMax}
                          trades={item.trades}
                          winRate={item.winRate}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="No setup data recorded" description="Add setup names to your journal entries to compare strategies." />
                  )}
                </Panel>

                <Panel
                  title="Performance insights"
                  subtitle="Observations from your recorded trades"
                  icon={Activity}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl border border-white/[0.09] bg-white/[0.035] p-2.5">
                      <CheckCircle2 className="h-4 w-4 text-white/65" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/85">{insight.title}</p>
                      <p className="mt-2 text-xs leading-6 text-white/45">{insight.body}</p>
                    </div>
                  </div>
                  <p className="mt-5 border-t border-white/[0.07] pt-4 text-[10px] leading-5 text-white/30">
                    Observations describe your logged history; they do not guarantee future results.
                  </p>
                </Panel>
              </div>
            )}

            {(activeTab === "By Setup" || activeTab === "By Session" || activeTab === "By Day") && (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">
                <Panel
                  title={
                    activeTab === "By Setup"
                      ? "Setup performance"
                      : activeTab === "By Session"
                        ? "Session performance"
                        : "Weekday performance"
                  }
                  subtitle={
                    activeTab === "By Setup"
                      ? "Compare the profitability of your recorded strategies"
                      : activeTab === "By Session"
                        ? "See which recorded trading sessions contribute to your results"
                        : "Compare results by the calendar day each trade was recorded"
                  }
                  icon={BarChart3}
                  className="min-h-[380px]"
                >
                  <div className="mb-4 grid grid-cols-[minmax(80px,1fr)_minmax(70px,1.5fr)_100px] gap-3 border-b border-white/[0.07] pb-3 text-[10px] uppercase tracking-wider text-white/30 sm:grid-cols-[minmax(120px,1fr)_minmax(80px,1.5fr)_120px_55px] sm:gap-4">
                    <span>Category</span>
                    <span>Relative P&L</span>
                    <span className="text-right">Net P&L</span>
                    <span className="hidden text-right sm:block">Share</span>
                  </div>
                  {activeGroup.length ? (
                    <div className="space-y-6">
                      {activeGroup.map((item) => (
                        <AnalysisBar
                          key={item.name}
                          name={item.name}
                          pnl={item.pnl}
                          max={activeMax}
                          trades={item.trades}
                          winRate={item.winRate}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No breakdown available"
                      description="Add more trades with the relevant information to see this analysis."
                    />
                  )}
                </Panel>

                <div className="space-y-4">
                  <Panel title="Category summary" subtitle="Selected period" icon={Activity}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/45">Categories</span>
                        <span className="text-sm font-medium text-white/85">{activeGroup.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/45">Trades analyzed</span>
                        <span className="text-sm font-medium text-white/85">{metrics.tradeCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/45">Best category</span>
                        <span className="max-w-[55%] truncate text-right text-sm font-medium text-emerald-400">
                          {activeGroup[0]?.name ?? "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/45">Weakest category</span>
                        <span className="max-w-[55%] truncate text-right text-sm font-medium text-red-400">
                          {[...activeGroup].sort((a, b) => a.pnl - b.pnl)[0]?.name ?? "—"}
                        </span>
                      </div>
                    </div>
                  </Panel>

                  <Panel title="Read the data carefully" icon={Shield}>
                    <p className="text-xs leading-6 text-white/45">
                      A category with only a few trades can look unusually strong or weak. Consider trade count, average R, and execution quality together before changing your strategy.
                    </p>
                  </Panel>
                </div>
              </div>
            )}

            {activeTab === "Advanced" && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    title="Trade-level return ratio"
                    icon={Gauge}
                    value={metrics.tradeReturnRatio === null ? "—" : metrics.tradeReturnRatio.toFixed(2)}
                    note="Mean trade P&L ÷ standard deviation of trade P&L; not annualized"
                  />
                  <MetricCard
                    title="Longest losing streak"
                    icon={TrendingDown}
                    value={`${metrics.longestLosingStreak} trades`}
                    note="Consecutive recorded losses in this period"
                    tone={metrics.longestLosingStreak > 0 ? "negative" : "neutral"}
                  />
                  <MetricCard
                    title="Largest winner"
                    icon={ArrowUpRight}
                    value={plainMoney(metrics.largestWin)}
                    note="Largest individual winning trade"
                    tone="positive"
                  />
                  <MetricCard
                    title="Largest loser"
                    icon={ArrowDownRight}
                    value={`-${plainMoney(Math.abs(metrics.largestLoss))}`}
                    note="Largest individual losing trade"
                    tone="negative"
                  />
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <Panel title="Plan adherence" subtitle="Compare trades by recorded rule adherence" icon={CheckCircle2}>
                    <div className="mb-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-3xl font-semibold tracking-tight text-white">
                          {metrics.planRate === null ? "—" : pct(metrics.planRate)}
                        </p>
                        <p className="mt-1 text-xs text-white/35">Plan followed when recorded</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${pnlColor(metrics.followedPnl)}`}>
                          {money(metrics.followedPnl)}
                        </p>
                        <p className="mt-1 text-[10px] text-white/35">
                          {metrics.followedCount} followed-plan trades
                        </p>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all"
                        style={{ width: `${metrics.planRate ?? 0}%` }}
                      />
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                      <div>
                        <p className="text-xs text-white/55">Plan not followed</p>
                        <p className="mt-1 text-[10px] text-white/35">{metrics.brokenCount} trades</p>
                      </div>
                      <PnlValue value={metrics.brokenPnl} showSign className={`text-sm font-semibold ${pnlColor(metrics.brokenPnl)}`} />
                    </div>
                  </Panel>

                  <Panel title="Daily P&L distribution" subtitle="Net result by trading date" icon={CalendarDays}>
                    {dailyDistribution.length ? (
                      <div className="space-y-3">
                        {dailyDistribution.map((value, index) => {
                          const maxValue = Math.max(...dailyDistribution.map(Math.abs), 1);
                          return (
                            <div key={`${index}-${value}`} className="flex items-center gap-3">
                              <span className="w-16 shrink-0 text-[10px] text-white/35">
                                Day {index + 1}
                              </span>
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                                <div
                                  className={`h-full rounded-full ${value > 0 ? "bg-emerald-400" : value < 0 ? "bg-red-400" : "bg-white/20"}`}
                                  style={{ width: `${(Math.abs(value) / maxValue) * 100}%` }}
                                />
                              </div>
                              <PnlValue value={value} showSign className={`w-24 text-right text-xs font-medium ${pnlColor(value)}`} />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <EmptyState title="No daily results" description="Your daily distribution will appear when trades are available." />
                    )}
                  </Panel>

                  <Panel title="Performance by emotion" subtitle="Based on the emotions recorded in your journal" icon={Activity}>
                    {emotionData.length ? (
                      <div className="space-y-4">
                        {emotionData.map((item) => (
                          <div key={item.name} className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-white/75">{item.name}</p>
                              <p className="mt-1 text-[10px] text-white/35">{item.trades} trades · {pct(item.winRate)} win rate</p>
                            </div>
                            <PnlValue value={item.pnl} showSign className={`whitespace-nowrap text-xs font-semibold ${pnlColor(item.pnl)}`} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState title="No emotion data" description="Record emotions in your journal to compare results." />
                    )}
                  </Panel>

                  <Panel title="Execution ratings" subtitle="Compare results by your saved execution rating" icon={Crosshair}>
                    {executionData.length ? (
                      <div className="space-y-4">
                        {executionData.map((item) => (
                          <div key={item.name} className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-white/75">{item.name}</p>
                              <p className="mt-1 text-[10px] text-white/35">{item.trades} trades · {pct(item.winRate)} win rate</p>
                            </div>
                            <PnlValue value={item.pnl} showSign className={`whitespace-nowrap text-xs font-semibold ${pnlColor(item.pnl)}`} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState title="No execution ratings" description="Record execution ratings to understand how your process relates to results." />
                    )}
                  </Panel>

                  <Panel title="Symbol performance" subtitle="Compare the markets you trade" icon={BarChart3} className="xl:col-span-2">
                    {symbolData.length ? (
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {symbolData.map((item) => (
                          <div key={item.name} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                            <p className="text-xs text-white/45">{item.name}</p>
                            <p className={`mt-3 text-xl font-semibold ${pnlColor(item.pnl)}`}>
                              {money(item.pnl)}
                            </p>
                            <div className="mt-3 flex items-center justify-between text-[10px] text-white/35">
                              <span>{item.trades} trades</span>
                              <span>{pct(item.winRate)} win rate</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState title="No symbol breakdown" description="Your symbol performance will appear here." />
                    )}
                  </Panel>
                </div>

                <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-2.5">
                      <Shield className="h-4 w-4 text-white/60" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white/85">{insight.title}</h3>
                      <p className="mt-2 max-w-3xl text-xs leading-6 text-white/45">{insight.body}</p>
                      <p className="mt-3 text-[10px] leading-5 text-white/30">
                        These are descriptive statistics from your logged trades, not predictions. Small samples, missing fields, fees, and unrecorded trades can affect the results.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <footer className="flex flex-col justify-between gap-2 border-t border-white/[0.07] py-4 text-[10px] text-white/30 sm:flex-row sm:items-center">
          <span>TradeMirror · Advanced Analytics</span>
          <span>Metrics reflect saved trade records for the selected period.</span>
        </footer>
      </div>
    </main>
  );
}
