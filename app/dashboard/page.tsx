"use client";

import DashboardGreeting from "./dashboard-greeting";

import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  ChevronDown,
  CircleHelp,
  Search,
  X,
  UserRound,
  TrendingUp,
  BookOpen,
  Sparkles,
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
};

type Profile = {
  display_name: string | null;
  username: string | null;
};

type TraderProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  trading_style: string | null;
  avatar_url: string | null;
  is_public: boolean;
};

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  actor_user_id: string | null;
  related_trade_id: string | null;
  related_profile_id: string | null;
  created_at: string;
};

type Range = "Today" | "7D" | "30D" | "3M" | "YTD" | "All Time";

function formatMoney(value: number) {
  return `${value >= 0 ? "+" : "-"}$${Math.abs(value).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

function getRangeStart(range: Range) {
  const now = new Date();

  if (range === "Today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (range === "7D") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (range === "30D") {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (range === "3M") {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 3);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (range === "YTD") {
    return new Date(now.getFullYear(), 0, 1);
  }

  return null;
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const difference = now.getTime() - date.getTime();

  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return "Yesterday";
  }

  return `${days}d ago`;
}

function MetricCard({
  title,
  value,
  change,
  positive = true,
  children,
}: {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.085] bg-gradient-to-br from-[#111b2a] via-[#0b131f] to-[#08101a] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-[12px] font-medium text-white/65">
              {title}
            </p>

            <CircleHelp
              className="h-3.5 w-3.5 text-white/20"
              strokeWidth={1.8}
            />
          </div>

          <p
            className={`mt-3 text-[28px] font-semibold tracking-[-0.04em] ${
              title === "Net P&L"
                ? value.startsWith("-")
                  ? "text-red-400"
                  : "text-emerald-400"
                : "text-white"
            }`}
          >
            {value}
          </p>

          <p
            className={`mt-1 text-[10px] font-medium ${
              positive
                ? "text-emerald-400/90"
                : "text-red-400/90"
            }`}
          >
            {change}
          </p>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function MiniLineChart({
  data,
  purple = false,
}: {
  data: number[];
  purple?: boolean;
}) {
  const values =
    data.length >= 2
      ? data
      : [0, 0, 0, 0, 0, 0];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x =
        (index / (values.length - 1)) * 130;

      const y =
        48 - ((value - min) / range) * 40;

      return `${x},${y}`;
    })
    .join(" ");

  const fillPoints = `${points} 130,55 0,55`;

  return (
    <svg
      viewBox="0 0 130 55"
      className="h-[55px] w-[130px]"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id={purple ? "purpleFill" : "greenFill"}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={
              purple ? "#8b5cf6" : "#34d399"
            }
            stopOpacity="0.22"
          />

          <stop
            offset="100%"
            stopColor={
              purple ? "#8b5cf6" : "#34d399"
            }
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      <polygon
        points={fillPoints}
        fill={`url(#${
          purple ? "purpleFill" : "greenFill"
        })`}
      />

      <polyline
        points={points}
        fill="none"
        stroke={
          purple ? "#8b5cf6" : "#34d399"
        }
        strokeWidth="2"
      />
    </svg>
  );
}

function WinRateRing({
  value,
}: {
  value: number;
}) {
  const circumference = 2 * Math.PI * 23;

  const offset =
    circumference *
    (1 - Math.min(Math.max(value, 0), 100) / 100);

  return (
    <svg
      viewBox="0 0 60 60"
      className="h-[64px] w-[64px] -rotate-90"
    >
      <circle
        cx="30"
        cy="30"
        r="23"
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="7"
      />

      <circle
        cx="30"
        cy="30"
        r="23"
        fill="none"
        stroke="#3182f6"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function TradeBars({
  trades,
}: {
  trades: Trade[];
}) {
  const recent = trades.slice(0, 12).reverse();

  const values =
    recent.length > 0
      ? recent.map((trade) => trade.pnl)
      : [0];

  const max = Math.max(
    ...values.map((value) => Math.abs(value)),
    1
  );

  return (
    <div className="flex h-[58px] w-[120px] items-end justify-end gap-[5px]">
      {values.map((value, index) => {
        const height = Math.max(
          8,
          (Math.abs(value) / max) * 54
        );

        return (
          <div
            key={index}
            className={`w-[7px] rounded-t-[3px] ${
              value >= 0
                ? "bg-cyan-400/65"
                : "bg-red-400/55"
            }`}
            style={{
              height: `${height}px`,
            }}
          />
        );
      })}
    </div>
  );
}

function EquityChart({
  trades,
}: {
  trades: Trade[];
}) {
  if (trades.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-[11px] text-white/20">
        Add your first trade to build your equity curve.
      </div>
    );
  }

  const ordered = [...trades].reverse();

  let running = 0;

  const values = ordered.map((trade) => {
    running += Number(trade.pnl);
    return running;
  });

  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x =
        ordered.length === 1
          ? 320
          : (index / (ordered.length - 1)) * 624;

      const y =
        210 -
        ((value - min) / range) * 190;

      return `${x},${y}`;
    })
    .join(" ");

  const lastPoint =
    points.split(" ").at(-1) ?? "624,20";

  return (
    <svg
      viewBox="0 0 640 250"
      className="h-full w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id="equityFill"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor="#3182f6"
            stopOpacity="0.30"
          />

          <stop
            offset="100%"
            stopColor="#3182f6"
            stopOpacity="0"
          />
        </linearGradient>

        <linearGradient
          id="equityStroke"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop
            offset="0%"
            stopColor="#38bdf8"
          />

          <stop
            offset="100%"
            stopColor="#3182f6"
          />
        </linearGradient>
      </defs>

      {[45, 100, 155, 210].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="640"
          y2={y}
          stroke="rgba(255,255,255,0.045)"
          strokeWidth="1"
        />
      ))}

      <line
        x1="0"
        y1="210"
        x2="640"
        y2="210"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="1"
        strokeDasharray="3 4"
      />

      <polygon
        points={`${points} 624,250 0,250`}
        fill="url(#equityFill)"
      />

      <polyline
        points={points}
        fill="none"
        stroke="url(#equityStroke)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx={Number(lastPoint.split(",")[0])}
        cy={Number(lastPoint.split(",")[1])}
        r="5"
        fill="#3182f6"
        stroke="#08101a"
        strokeWidth="3"
      />
    </svg>
  );
}

export default function DashboardPage({
  preview = false,
}: {
  preview?: boolean;
}) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const previewTrades: Trade[] = [
    {
      id: "preview-1",
      trade_date: "2026-09-04",
      created_at: "2026-09-04T14:32:00Z",
      symbol: "NQ",
      direction: "Long",
      pnl: 1295,
      r_multiple: 2.59,
    },
    {
      id: "preview-2",
      trade_date: "2026-09-03",
      created_at: "2026-09-03T16:18:00Z",
      symbol: "ES",
      direction: "Short",
      pnl: 840,
      r_multiple: 1.68,
    },
    {
      id: "preview-3",
      trade_date: "2026-09-02",
      created_at: "2026-09-02T15:04:00Z",
      symbol: "NQ",
      direction: "Long",
      pnl: -420,
      r_multiple: -0.84,
    },
    {
      id: "preview-4",
      trade_date: "2026-09-01",
      created_at: "2026-09-01T13:47:00Z",
      symbol: "MNQ",
      direction: "Long",
      pnl: 620,
      r_multiple: 1.24,
    },
    {
      id: "preview-5",
      trade_date: "2026-08-31",
      created_at: "2026-08-31T17:21:00Z",
      symbol: "NQ",
      direction: "Short",
      pnl: 910,
      r_multiple: 1.82,
    },
    {
      id: "preview-6",
      trade_date: "2026-08-28",
      created_at: "2026-08-28T14:11:00Z",
      symbol: "ES",
      direction: "Long",
      pnl: 510,
      r_multiple: 1.02,
    },
  ];

  const [allTrades, setAllTrades] =
    useState<Trade[]>([]);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [range, setRange] =
    useState<Range>("30D");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [traders, setTraders] = useState<TraderProfile[]>([]);
  const [tradersLoading, setTradersLoading] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  // const [notificationsLoading, setNotificationsLoading] = useState(false); // Not used per instructions

  // ADD AI OVERVIEW PANEL STATES HERE
  const [aiOverviewOpen, setAiOverviewOpen] = useState(false);
  // Temporary for now.
  // Later this will come from whether the weekly AI review has actually been generated.
  const aiReviewReady = true;

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      if (preview) {
        setProfile({
          display_name: "Jake Carmona",
          username: "jakecarmona",
        });

        setAllTrades(previewTrades);

        setNotifications([]);

        setLoading(false);

        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Please sign in again.");
        setLoading(false);
        return;
      }

      const [
        profileResult,
        tradesResult,
        notificationsResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, username")
          .eq("id", user.id)
          .single(),

        supabase
          .from("trades")
          .select(
            "id, trade_date, created_at, symbol, direction, pnl, r_multiple"
          )
          .eq("user_id", user.id)
          .order("trade_date", {
            ascending: false,
          })
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("notifications")
          .select(
            "id, type, title, message, read, actor_user_id, related_trade_id, related_profile_id, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          })
          .limit(30),
      ]);

      if (profileResult.error) {
        console.error(
          "PROFILE LOAD ERROR:",
          profileResult.error
        );
      }

      if (tradesResult.error) {
        console.error("TRADES LOAD ERROR:", {
          message: tradesResult.error.message,
          details: tradesResult.error.details,
          hint: tradesResult.error.hint,
          code: tradesResult.error.code,
        });

        setError(
          "We couldn't load your trading data."
        );

        setLoading(false);
        return;
      }

      if (notificationsResult.error) {
        console.error(
          "NOTIFICATIONS LOAD ERROR:",
          notificationsResult.error
        );
      } else {
        setNotifications(
          (notificationsResult.data ?? []) as Notification[]
        );
      }

      setProfile(
        (profileResult.data as Profile | null) ??
          null
      );

      setAllTrades(
        (tradesResult.data ?? []) as Trade[]
      );

      setLoading(false);
    }

    loadDashboard();
  }, [supabase, preview]);

  useEffect(() => {
    if (preview) return;
    if (!searchOpen) return;

    const query = searchQuery.trim();

    if (!query) {
      setTraders([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setTradersLoading(true);

      const cleanQuery = query.replace(/^@/, "");

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, trading_style, avatar_url, is_public"
        )
        .eq("is_public", true)
        .or(
          `username.ilike.%${cleanQuery}%,display_name.ilike.%${cleanQuery}%`
        )
        .limit(6);

      if (!error) {
        setTraders((data ?? []) as TraderProfile[]);
      } else {
        console.error("TRADER SEARCH ERROR:", error);
        setTraders([]);
      }

      setTradersLoading(false);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchQuery, searchOpen, supabase, preview]);

  const filteredTrades = useMemo(() => {
    const start = getRangeStart(range);

    if (!start) {
      return allTrades;
    }

    return allTrades.filter((trade) => {
      const date = new Date(
        `${trade.trade_date}T12:00:00`
      );

      return date >= start;
    });
  }, [allTrades, range]);

  const stats = useMemo(() => {
    const pnlValues = filteredTrades.map(
      (trade) => Number(trade.pnl)
    );

    const netPnl = pnlValues.reduce(
      (sum, pnl) => sum + pnl,
      0
    );

    const winners = filteredTrades.filter(
      (trade) => Number(trade.pnl) > 0
    );

    const losers = filteredTrades.filter(
      (trade) => Number(trade.pnl) < 0
    );

    const winRate =
      filteredTrades.length > 0
        ? (winners.length /
            filteredTrades.length) *
          100
        : 0;

    const grossProfit = winners.reduce(
      (sum, trade) =>
        sum + Number(trade.pnl),
      0
    );

    const grossLoss = Math.abs(
      losers.reduce(
        (sum, trade) =>
          sum + Number(trade.pnl),
        0
      )
    );

    const profitFactor =
      grossLoss > 0
        ? grossProfit / grossLoss
        : grossProfit > 0
          ? grossProfit
          : 0;

    return {
      netPnl,
      winRate,
      profitFactor,
      tradeCount: filteredTrades.length,
      winners: winners.length,
      losers: losers.length,
    };
  }, [filteredTrades]);

  const pnlChartData = useMemo(() => {
    let running = 0;

    return [...filteredTrades]
      .reverse()
      .map((trade) => {
        running += Number(trade.pnl);
        return running;
      });
  }, [filteredTrades]);

  const previousRangeTrades = useMemo(() => {
    if (range === "All Time") {
      return [];
    }

    const now = new Date();
    const start = getRangeStart(range);

    if (!start) {
      return [];
    }

    const duration =
      now.getTime() - start.getTime();

    const previousStart = new Date(
      start.getTime() - duration
    );

    return allTrades.filter((trade) => {
      const date = new Date(
        `${trade.trade_date}T12:00:00`
      );

      return (
        date >= previousStart &&
        date < start
      );
    });
  }, [allTrades, range]);

  const previousStats = useMemo(() => {
    const pnl = previousRangeTrades.reduce(
      (sum, trade) =>
        sum + Number(trade.pnl),
      0
    );

    const winners =
      previousRangeTrades.filter(
        (trade) => Number(trade.pnl) > 0
      );

    const losers =
      previousRangeTrades.filter(
        (trade) => Number(trade.pnl) < 0
      );

    const winRate =
      previousRangeTrades.length > 0
        ? (winners.length /
            previousRangeTrades.length) *
          100
        : 0;

    const grossProfit = winners.reduce(
      (sum, trade) =>
        sum + Number(trade.pnl),
      0
    );

    const grossLoss = Math.abs(
      losers.reduce(
        (sum, trade) =>
          sum + Number(trade.pnl),
        0
      )
    );

    const profitFactor =
      grossLoss > 0
        ? grossProfit / grossLoss
        : grossProfit > 0
          ? grossProfit
          : 0;

    return {
      pnl,
      winRate,
      profitFactor,
      trades: previousRangeTrades.length,
    };
  }, [previousRangeTrades]);

  function percentageChange(
    current: number,
    previous: number
  ) {
    if (previous === 0) {
      return current === 0
        ? "No change"
        : "New";
    }

    const change =
      ((current - previous) /
        Math.abs(previous)) *
      100;

    return `${
      change >= 0 ? "+" : ""
    }${change.toFixed(2)}% vs prev`;
  }

  function numberChange(
    current: number,
    previous: number
  ) {
    const difference =
      current - previous;

    return `${
      difference >= 0 ? "+" : ""
    }${difference} vs prev`;
  }

  const displayName =
    profile?.display_name ||
    profile?.username ||
    "Trader";

  const recentTrades =
    filteredTrades.slice(0, 5);

  const rangeLabel =
    range === "All Time"
      ? "all time"
      : range;

  const searchTradeResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return [];

    return allTrades
      .filter((trade) => {
        return (
          trade.symbol.toLowerCase().includes(query) ||
          trade.direction.toLowerCase().includes(query)
        );
      })
      .slice(0, 6);
  }, [allTrades, searchQuery]);

  // Step 6: Add unread count
  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="min-h-screen bg-[#03070d]">

      {/* Ambient background */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[18%] top-[-220px] h-[550px] w-[550px] rounded-full bg-blue-500/[0.035] blur-[150px]" />

        <div className="absolute bottom-[-220px] right-[-180px] h-[500px] w-[500px] rounded-full bg-blue-500/[0.025] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-[1700px] px-5 py-4 xl:px-7">

        <div className="min-h-[calc(100vh-32px)] overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#050b13]/80 shadow-[0_35px_100px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.025)] backdrop-blur-2xl">

          {/* HEADER */}

          <header className="flex items-center justify-between px-7 pb-5 pt-7 xl:px-8">

            <DashboardGreeting
              name={displayName}
            />

            <div className="flex items-center gap-3">

              {/* RANGE */}

              <div className="hidden items-center overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b121c] p-1 md:flex">

                {(
                  [
                    "Today",
                    "7D",
                    "30D",
                    "3M",
                    "YTD",
                    "All Time",
                  ] as Range[]
                ).map((rangeOption) => (
                  <button
                    key={rangeOption}
                    type="button"
                    onClick={() =>
                      setRange(rangeOption)
                    }
                    className={`h-9 rounded-lg px-4 text-[11px] font-medium transition ${
                      range === rangeOption
                        ? "border border-blue-400/20 bg-blue-500/[0.22] text-blue-300 shadow-[0_0_18px_rgba(35,133,245,0.12)]"
                        : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                    }`}
                  >
                    {rangeOption}
                  </button>
                ))}

              </div>

              <button
                type="button"
                onClick={() => {
                  setSearchOpen(true);
                  setNotificationsOpen(false);
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-[#0b121c] text-white/55 transition hover:border-white/15 hover:bg-white/[0.045] hover:text-white"
              >
                <Search
                  className="h-[18px] w-[18px]"
                  strokeWidth={1.8}
                />
              </button>

              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((value) => !value);
                  setSearchOpen(false);
                }}
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-[#0b121c] text-white/55 transition hover:border-white/15 hover:bg-white/[0.045] hover:text-white"
              >
                <Bell
                  className="h-[18px] w-[18px]"
                  strokeWidth={1.8}
                />

                {unreadNotifications > 0 && (
                  <span className="absolute right-[7px] top-[6px] flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-blue-500 px-1 text-[8px] font-bold text-white ring-2 ring-[#0b121c]">
                    {unreadNotifications > 9
                      ? "9+"
                      : unreadNotifications}
                  </span>
                )}
              </button>

              {/* AI WEEKLY OVERVIEW BUTTON */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAiOverviewOpen((prev) => !prev)}
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 ${
                    aiReviewReady
                      ? "border-blue-400/20 bg-blue-500/[0.08] text-blue-300"
                      : "border-white/[0.06] bg-white/[0.025] text-white/45"
                  }`}
                  aria-label="AI Weekly Overview"
                >
                  {aiReviewReady && (
                    <span className="absolute inset-0 rounded-xl bg-blue-500/10 blur-md ai-heartbeat" />
                  )}

                  <Sparkles
                    className={`relative h-[18px] w-[18px] transition-all duration-300 ${
                      aiReviewReady
                        ? "ai-heartbeat drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                        : "group-hover:text-white/80"
                    }`}
                  />
                </button>

                {aiOverviewOpen && (
                  <div className="absolute right-0 top-12 z-50 w-[330px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a111b]/95 shadow-2xl shadow-black/40 backdrop-blur-2xl">
                    {/* subtle glow */}
                    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-500/10 blur-3xl" />

                    <div className="relative p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/[0.08]">
                          <Sparkles className="h-4 w-4 text-blue-300" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-semibold text-white">
                              AI Weekly Overview
                            </p>
                            <span className="rounded-full border border-blue-400/15 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-blue-300">
                              Ready
                            </span>
                          </div>
                          <p className="mt-1.5 text-[12px] leading-5 text-white/45">
                            Your weekly trading review is ready. TradeMirror analyzed your
                            performance and trading behavior from this week.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = "/dashboard/ai-review";
                        }}
                        className="mt-4 flex h-9 w-full items-center justify-center rounded-xl bg-blue-500 text-[12px] font-semibold text-white transition hover:bg-blue-400"
                      >
                        View Weekly Review
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Removed Settings2 button here as per instruction */}

            </div>

          </header>

          {/* CONTENT */}

          <div className="px-7 pb-8 xl:px-8">

            {/* KPI ROW */}

            <div className="grid gap-4 xl:grid-cols-4">

              <MetricCard
                title="Net P&L"
                value={
                  loading
                    ? "—"
                    : formatMoney(
                        stats.netPnl
                      )
                }
                change={
                  loading
                    ? "Loading..."
                    : range === "All Time"
                      ? `${filteredTrades.length} trades`
                      : percentageChange(
                          stats.netPnl,
                          previousStats.pnl
                        )
                }
                positive={
                  stats.netPnl >= 0
                }
              >
                <MiniLineChart
                  data={pnlChartData}
                />
              </MetricCard>

              <MetricCard
                title="Win Rate"
                value={
                  loading
                    ? "—"
                    : `${stats.winRate.toFixed(
                        1
                      )}%`
                }
                change={
                  loading
                    ? "Loading..."
                    : range === "All Time"
                      ? `${stats.winners} wins`
                      : `${
                          stats.winRate -
                          previousStats.winRate >=
                          0
                            ? "+"
                            : ""
                        }${(
                          stats.winRate -
                          previousStats.winRate
                        ).toFixed(2)}% vs prev`
                }
                positive={
                  stats.winRate >=
                  previousStats.winRate
                }
              >
                <WinRateRing
                  value={stats.winRate}
                />
              </MetricCard>

              <MetricCard
                title="Profit Factor"
                value={
                  loading
                    ? "—"
                    : stats.profitFactor.toFixed(
                        2
                      )
                }
                change={
                  loading
                    ? "Loading..."
                    : range === "All Time"
                      ? `${stats.winners}W / ${stats.losers}L`
                      : `${
                          stats.profitFactor -
                            previousStats.profitFactor >=
                          0
                            ? "+"
                            : ""
                        }${(
                          stats.profitFactor -
                          previousStats.profitFactor
                        ).toFixed(2)} vs prev`
                }
                positive={
                  stats.profitFactor >=
                  previousStats.profitFactor
                }
              >
                <MiniLineChart
                  data={pnlChartData}
                  purple
                />
              </MetricCard>

              <MetricCard
                title="Trades"
                value={
                  loading
                    ? "—"
                    : stats.tradeCount.toString()
                }
                change={
                  loading
                    ? "Loading..."
                    : range === "All Time"
                      ? "Total trades"
                      : numberChange(
                          stats.tradeCount,
                          previousStats.trades
                        )
                }
                positive={
                  stats.tradeCount >=
                  previousStats.trades
                }
              >
                <TradeBars
                  trades={filteredTrades}
                />
              </MetricCard>

            </div>

            {/* MAIN ANALYTICS */}

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(360px,0.9fr)]">

              {/* P&L PERFORMANCE */}

              <section className="h-[440px] overflow-hidden rounded-[20px] border border-white/[0.085] bg-gradient-to-br from-[#111b2a] via-[#0b131f] to-[#08101a] shadow-[0_18px_45px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.035)]">

                <div className="flex items-center justify-between px-6 pt-5">

                  <div>
                    <h2 className="text-[16px] font-semibold tracking-[-0.025em] text-white/90">
                      P&L Performance
                    </h2>

                    <p className="mt-1 text-[9px] text-white/25">
                      {rangeLabel}
                    </p>
                  </div>

                  <div className="flex h-8 items-center rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 text-[10px] font-medium text-white/55">
                    Cumulative P&L
                  </div>

                </div>

                <div className="relative mt-5 h-[330px] px-6">

                  <div className="absolute left-0 top-0 flex h-full flex-col justify-between py-2 text-[10px] text-white/25">
                    <span>$12K</span>
                    <span>$8K</span>
                    <span>$4K</span>
                    <span>$0</span>
                    <span>-$4K</span>
                  </div>

                  <div className="ml-12 h-[275px]">
                    <EquityChart
                      trades={filteredTrades}
                    />
                  </div>

                  <div className="ml-12 mt-[-2px] flex justify-between text-[10px] text-white/25">
                    <span>
                      {filteredTrades.length > 0
                        ? filteredTrades.at(-1)?.trade_date
                        : "—"}
                    </span>

                    <span>
                      {range === "Today"
                        ? "Today"
                        : range}
                    </span>

                    <span>
                      {filteredTrades.length > 0
                        ? filteredTrades[0]?.trade_date
                        : "—"}
                    </span>
                  </div>

                </div>

              </section>

              {/* RECENT TRADES */}

              <section className="h-[440px] overflow-hidden rounded-[20px] border border-white/[0.085] bg-gradient-to-br from-[#111b2a] via-[#0b131f] to-[#08101a] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.035)]">

                <div className="flex items-center justify-between">

                  <h2 className="text-[16px] font-semibold tracking-[-0.025em] text-white/90">
                    Recent Trades
                  </h2>

                  <a
                    href="/dashboard/trades"
                    className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[10px] text-white/55 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    View all
                  </a>

                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.055]">

                  <div className="grid grid-cols-[0.8fr_1fr_1fr_0.8fr_0.8fr] bg-white/[0.025] px-3 py-2.5 text-[9px] text-white/30">

                    <span>Symbol</span>
                    <span>Direction</span>
                    <span>P&L</span>
                    <span>R:R</span>
                    <span className="text-right">
                      Time
                    </span>

                  </div>

                  {loading ? (
                    <div className="flex h-[250px] items-center justify-center text-[10px] text-white/25">
                      Loading trades...
                    </div>
                  ) : recentTrades.length === 0 ? (
                    <div className="flex h-[250px] flex-col items-center justify-center text-center">

                      <p className="text-[11px] font-medium text-white/40">
                        No trades yet
                      </p>

                      <p className="mt-1 max-w-[220px] text-[9px] leading-4 text-white/20">
                        Add your first trade to start building your performance history.
                      </p>

                    </div>
                  ) : (
                    recentTrades.map(
                      (trade) => (
                        <div
                          key={trade.id}
                          className="grid grid-cols-[0.8fr_1fr_1fr_0.8fr_0.8fr] items-center border-t border-white/[0.045] px-3 py-3 text-[10px] transition hover:bg-white/[0.025]"
                        >

                          <span className="font-semibold text-white/75">
                            {trade.symbol}
                          </span>

                          <span
                            className={
                              trade.direction ===
                              "Long"
                                ? "flex items-center gap-1 text-emerald-400"
                                : "flex items-center gap-1 text-red-400"
                            }
                          >
                            {trade.direction ===
                            "Long" ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3" />
                            )}

                            {trade.direction}
                          </span>

                          <span
                            className={
                              Number(
                                trade.pnl
                              ) >= 0
                                ? "font-semibold text-emerald-400"
                                : "font-semibold text-red-400"
                            }
                          >
                            {formatMoney(
                              Number(
                                trade.pnl
                              )
                            )}
                          </span>

                          <span className="text-white/50">
                            {trade.r_multiple !==
                            null
                              ? `${Number(
                                  trade.r_multiple
                                ).toFixed(
                                  2
                                )}R`
                              : "—"}
                          </span>

                          <span className="text-right text-white/30">
                            {formatRelativeTime(
                              trade.created_at
                            )}
                          </span>

                        </div>
                      )
                    )
                  )}

                </div>

                <a
                  href="/dashboard/trades"
                  className="mt-4 flex h-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-[11px] font-medium text-white/55 transition hover:border-blue-400/15 hover:bg-blue-500/[0.05] hover:text-white"
                >
                  Go to Trades
                </a>

              </section>

            </div>

          </div>

        </div>

      </div>

      {/* SEARCH OVERLAY */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/55 px-5 pt-[12vh] backdrop-blur-sm"
          onMouseDown={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-[720px] overflow-hidden rounded-[20px] border border-white/[0.09] bg-[#08101a]/98 shadow-[0_35px_100px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Search header */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
              <Search className="h-5 w-5 text-white/30" />

              <input
                autoFocus
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search traders, trades, instruments, setups..."
                className="flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-white/25"
              />

              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/25 transition hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!searchQuery.trim() ? (
              <div className="px-5 py-10 text-center">
                <Search className="mx-auto h-7 w-7 text-white/10" />

                <p className="mt-3 text-[12px] font-medium text-white/45">
                  Search TradeMirror
                </p>

                <p className="mt-1 text-[10px] text-white/20">
                  Find traders, trades, instruments, and setups.
                </p>
              </div>
            ) : (
              <div className="max-h-[520px] overflow-y-auto">
                {/* TRADERS */}
                {traders.length > 0 && (
                  <div className="border-b border-white/[0.05] p-3">
                    <p className="px-2 pb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/25">
                      Traders
                    </p>

                    <div className="space-y-1">
                      {traders.map((trader) => (
                        <a
                          key={trader.id}
                          href={`/dashboard/discover?trader=${encodeURIComponent(
                            trader.username ?? ""
                          )}`}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[0.04]"
                        >
                          {trader.avatar_url ? (
                            <img
                              src={trader.avatar_url}
                              alt=""
                              className="h-9 w-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
                              <UserRound className="h-4 w-4 text-white/30" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-medium text-white/80">
                              {trader.display_name ||
                                trader.username ||
                                "Trader"}
                            </p>
                            <p className="mt-0.5 text-[9px] text-white/30">
                              @{trader.username || "trader"}
                              {trader.trading_style
                                ? ` · ${trader.trading_style}`
                                : ""}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* YOUR TRADES */}
                {searchTradeResults.length > 0 && (
                  <div className="border-b border-white/[0.05] p-3">
                    <p className="px-2 pb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/25">
                      Your Trades
                    </p>

                    <div className="space-y-1">
                      {searchTradeResults.map((trade) => (
                        <a
                          key={trade.id}
                          href="/dashboard/trades"
                          className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[0.04]"
                        >
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                              trade.direction === "Long"
                                ? "bg-emerald-400/[0.08]"
                                : "bg-red-400/[0.08]"
                            }`}
                          >
                            {trade.direction === "Long" ? (
                              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium text-white/75">
                              {trade.symbol} · {trade.direction}
                            </p>
                            <p className="mt-0.5 text-[9px] text-white/25">
                              {trade.trade_date}
                            </p>
                          </div>

                          <span
                            className={`text-[10px] font-semibold ${
                              Number(trade.pnl) >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {formatMoney(Number(trade.pnl))}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* NO RESULTS */}
                {!tradersLoading &&
                  traders.length === 0 &&
                  searchTradeResults.length === 0 && (
                    <div className="px-5 py-12 text-center">
                      <Search className="mx-auto h-7 w-7 text-white/10" />

                      <p className="mt-3 text-[11px] font-medium text-white/40">
                        No results found
                      </p>

                      <p className="mt-1 text-[9px] text-white/20">
                        Try a trader name, username, symbol, or direction.
                      </p>
                    </div>
                  )}

                {tradersLoading && (
                  <div className="px-5 py-10 text-center text-[10px] text-white/25">
                    Searching...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* NOTIFICATIONS PANEL */}
      {notificationsOpen && (
        <div className="fixed right-5 top-[92px] z-[90] w-[370px] overflow-hidden rounded-[18px] border border-white/[0.09] bg-[#08101a]/98 shadow-[0_25px_70px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl xl:right-10">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5">
            <div>
              <p className="text-[12px] font-semibold text-white/85">
                Notifications
              </p>

              <p className="mt-0.5 text-[9px] text-white/25">
                {unreadNotifications > 0
                  ? `${unreadNotifications} unread`
                  : "You're all caught up"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {unreadNotifications > 0 && (
                <button
                  type="button"
                  onClick={async () => {
                    const unreadIds = notifications
                      .filter((notification) => !notification.read)
                      .map((notification) => notification.id);

                    if (unreadIds.length === 0) return;

                    const { error } = await supabase
                      .from("notifications")
                      .update({ read: true })
                      .in("id", unreadIds);

                    if (error) {
                      console.error(
                        "MARK NOTIFICATIONS READ ERROR:",
                        error
                      );
                      return;
                    }

                    setNotifications((current) =>
                      current.map((notification) => ({
                        ...notification,
                        read: true,
                      }))
                    );
                  }}
                  className="rounded-lg px-2 py-1 text-[9px] font-medium text-blue-400/80 transition hover:bg-blue-400/[0.06] hover:text-blue-400"
                >
                  Mark all read
                </button>
              )}

              <button
                type="button"
                onClick={() => setNotificationsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/25 transition hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[440px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Bell className="mx-auto h-6 w-6 text-white/10" />

                <p className="mt-3 text-[11px] font-medium text-white/40">
                  You're all caught up
                </p>

                <p className="mt-1 text-[9px] text-white/20">
                  New activity will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={async () => {
                    if (!notification.read) {
                      await supabase
                        .from("notifications")
                        .update({ read: true })
                        .eq("id", notification.id);

                      setNotifications((current) =>
                        current.map((item) =>
                          item.id === notification.id
                            ? { ...item, read: true }
                            : item
                        )
                      );
                    }

                    if (notification.related_trade_id) {
                      window.location.href = "/dashboard/trades";
                    } else if (notification.related_profile_id) {
                      window.location.href = "/dashboard/discover";
                    }
                  }}
                  className={`flex w-full gap-3 border-b border-white/[0.045] px-4 py-3.5 text-left transition hover:bg-white/[0.025] ${
                    !notification.read
                      ? "bg-blue-500/[0.025]"
                      : ""
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-400/[0.08]">
                    <Bell className="h-3.5 w-3.5 text-blue-400" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[10px] font-medium text-white/75">
                        {notification.title}
                      </p>

                      {!notification.read && (
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                      )}
                    </div>

                    {notification.message && (
                      <p className="mt-1 text-[9px] leading-4 text-white/30">
                        {notification.message}
                      </p>
                    )}

                    <p className="mt-1.5 text-[8px] text-white/20">
                      {formatRelativeTime(
                        notification.created_at
                      )}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-5 right-5 rounded-xl border border-red-500/20 bg-[#0b1119]/95 px-4 py-3 text-[10px] text-red-400 shadow-2xl backdrop-blur-xl">
          {error}
        </div>
      )}

    </div>
  );
}