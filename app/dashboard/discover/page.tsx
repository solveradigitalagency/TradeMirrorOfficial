
"use client";

import {
  BarChart3,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  LineChart,
  MessageCircle,
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
};

type Trade = {
  id: string;
  user_id: string;
  trade_date: string;
  pnl: number;
  created_at: string;
  direction: "Long" | "Short";
  setup: string | null;
};

type Trader = {
  profile: Profile;
  trades: Trade[];
  pnl: number;
  winRate: number;
  profitFactor: number;
  avatar: string;
};

type SortOption = "recent" | "pnl" | "winRate" | "trades";
type ChartRange = "1M" | "3M" | "6M" | "ALL";

const PANEL =
  "rounded-2xl border border-white/[0.085] bg-[#0c0e11]";

function formatMoney(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";

  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatCompactMoney(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000) {
    return `${sign}$${(absolute / 1_000_000).toFixed(2)}M`;
  }

  if (absolute >= 10_000) {
    return `${sign}$${(absolute / 1_000).toFixed(1)}K`;
  }

  return `${sign}$${absolute.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(
  displayName: string | null,
  username: string | null
) {
  const value = (displayName || username || "Trader")
    .trim()
    .replace(/^@/, "");

  const words = value.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

function Avatar({
  initials,
  large = false,
  avatarUrl,
}: {
  initials: string;
  large?: boolean;
  avatarUrl?: string | null;
}) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.13] bg-gradient-to-br from-[#30343a] via-[#181b20] to-[#090a0c] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${
        large
          ? "h-[66px] w-[66px] text-xl sm:h-[76px] sm:w-[76px]"
          : "h-10 w-10 text-[11px]"
      }`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span className="font-semibold tracking-tight">
          {initials}
        </span>
      )}
    </div>
  );
}

function calculateTrader(
  profile: Profile,
  trades: Trade[]
): Trader {
  const pnl = trades.reduce(
    (sum, trade) => sum + Number(trade.pnl || 0),
    0
  );

  const winners = trades.filter(
    (trade) => Number(trade.pnl) > 0
  );

  const losers = trades.filter(
    (trade) => Number(trade.pnl) < 0
  );

  const winRate =
    trades.length > 0
      ? (winners.length / trades.length) * 100
      : 0;

  const grossProfit = winners.reduce(
    (sum, trade) => sum + Number(trade.pnl || 0),
    0
  );

  const grossLoss = Math.abs(
    losers.reduce(
      (sum, trade) => sum + Number(trade.pnl || 0),
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
    profile,
    trades,
    pnl,
    winRate,
    profitFactor,
    avatar: getInitials(
      profile.display_name,
      profile.username
    ),
  };
}

function getUsername(profile: Profile) {
  return profile.username
    ? `@${profile.username}`
    : profile.display_name || "Trader";
}

function getTraderMetric(trader: Trader) {
  if (trader.profile.show_analytics) {
    return `${trader.winRate.toFixed(1)}%`;
  }

  if (trader.profile.show_pnl) {
    return formatCompactMoney(trader.pnl);
  }

  return `${trader.trades.length} trades`;
}

function MiniSparkline({ trades }: { trades: Trade[] }) {
  const values = useMemo(() => {
    let running = 0;

    return [...trades]
      .sort(
        (a, b) =>
          new Date(a.trade_date).getTime() -
          new Date(b.trade_date).getTime()
      )
      .map((trade) => {
        running += Number(trade.pnl || 0);
        return running;
      });
  }, [trades]);

  if (values.length < 2) {
    return (
      <div className="flex h-7 w-[58px] items-center justify-center text-[10px] text-white/20">
        —
      </div>
    );
  }

  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 25 - ((value - min) / range) * 21;

      return `${x},${y}`;
    })
    .join(" ");

  const id = `spark-${trades[0]?.user_id || "trader"}`;

  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      className="h-7 w-[58px] shrink-0 overflow-visible"
      aria-label="Public trade equity trend"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7b8491" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TraderRow({
  trader,
  active,
  onClick,
}: {
  trader: Trader;
  active: boolean;
  onClick: () => void;
}) {
  const publicTrades = trader.profile.show_trades
    ? trader.trades
    : [];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 border-b border-white/[0.055] px-3 py-3.5 text-left transition duration-200 sm:px-4 ${
        active
          ? "bg-[#20252c]"
          : "hover:bg-white/[0.035]"
      }`}
    >
      {active && (
        <span className="absolute inset-y-0 left-0 w-[3px] rounded-r-full bg-[#dce7f8]" />
      )}

      <Avatar
        initials={trader.avatar}
        avatarUrl={trader.profile.avatar_url}
      />

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-[12px] font-semibold ${
            active ? "text-white" : "text-white/75"
          }`}
        >
          {getUsername(trader.profile)}
        </p>

        <p className="mt-1 truncate text-[10px] text-white/40">
          {trader.profile.trading_style || "Trader"}
          {trader.profile.experience_level
            ? ` · ${trader.profile.experience_level}`
            : ""}
        </p>

        <div className="mt-1.5 flex min-w-0 items-center gap-2">
          {trader.profile.show_pnl ? (
            <span
              className={`truncate text-[10px] font-medium ${
                trader.pnl > 0
                  ? "text-emerald-400"
                  : trader.pnl < 0
                    ? "text-red-400"
                    : "text-white/50"
              }`}
            >
              {formatMoney(trader.pnl)}
            </span>
          ) : (
            <span className="text-[10px] text-white/35">
              P&L private
            </span>
          )}

          {trader.profile.show_analytics && (
            <span className="text-[9px] text-white/40">
              {trader.winRate.toFixed(1)}% WR
            </span>
          )}
        </div>
      </div>

      <div className="hidden flex-col items-end gap-1 sm:flex">
        <MiniSparkline trades={publicTrades} />
        <span className="text-[9px] tabular-nums text-white/40">
          {getTraderMetric(trader)}
        </span>
      </div>
    </button>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  positive,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  positive?: boolean | null;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/[0.085] bg-[#0a0c0f] p-3.5 transition hover:border-white/[0.14] sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[11px] text-white/55 sm:text-xs">
          {label}
        </p>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/50">
          {icon}
        </span>
      </div>

      <p
        className={`mt-3 truncate text-[19px] font-semibold tracking-[-0.045em] sm:text-[23px] ${
          positive === true
            ? "text-emerald-400"
            : positive === false
              ? "text-red-400"
              : "text-white/90"
        }`}
      >
        {value}
      </p>

      <p className="mt-1.5 truncate text-[10px] text-white/35">
        {detail}
      </p>
    </div>
  );
}

function EquityCurve({
  trades,
  range,
  showTrades,
}: {
  trades: Trade[];
  range: ChartRange;
  showTrades: boolean;
}) {
  const width = 900;
  const height = 270;

  const sortedTrades = useMemo(() => {
    return [...trades].sort(
      (a, b) =>
        new Date(a.trade_date).getTime() -
        new Date(b.trade_date).getTime()
    );
  }, [trades]);

  const filteredTrades = useMemo(() => {
    if (range === "ALL" || sortedTrades.length === 0) {
      return sortedTrades;
    }

    const months = Number.parseInt(range, 10);
    const latest = new Date(
      `${sortedTrades[sortedTrades.length - 1].trade_date.slice(0, 10)}T12:00:00`
    );

    const cutoff = new Date(latest);
    cutoff.setMonth(cutoff.getMonth() - months);

    return sortedTrades.filter(
      (trade) =>
        new Date(`${trade.trade_date.slice(0, 10)}T12:00:00`) >=
        cutoff
    );
  }, [range, sortedTrades]);

  const chart = useMemo(() => {
    let running = 0;

    const values = filteredTrades.map((trade) => {
      running += Number(trade.pnl || 0);
      return running;
    });

    return {
      values,
      min: Math.min(0, ...values),
      max: Math.max(0, ...values),
    };
  }, [filteredTrades]);

  if (!showTrades) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.10] bg-white/[0.012] px-6 text-center sm:min-h-[270px]">
        <LineChart className="h-7 w-7 text-white/25" />
        <p className="mt-3 text-sm font-medium text-white/65">
          Equity curve unavailable
        </p>
        <p className="mt-1.5 max-w-xs text-xs leading-5 text-white/35">
          This trader has not made individual trade history public.
        </p>
      </div>
    );
  }

  if (filteredTrades.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.012] px-6 text-center sm:min-h-[270px]">
        <LineChart className="h-7 w-7 text-white/20" />
        <p className="mt-3 text-sm font-medium text-white/60">
          No trade data for this period
        </p>
        <p className="mt-1.5 text-xs text-white/30">
          Try a different time range or check back later.
        </p>
      </div>
    );
  }

  const { values, min, max } = chart;
  const valueRange = max - min || 1;
  const paddingLeft = 78;
  const paddingRight = 18;
  const paddingTop = 20;
  const paddingBottom = 30;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const coordinates = values.map((value, index) => {
    const x =
      paddingLeft +
      (values.length === 1
        ? chartWidth / 2
        : (index / (values.length - 1)) * chartWidth);

    const y =
      paddingTop +
      ((max - value) / valueRange) * chartHeight;

    return { x, y, value };
  });

  const points = coordinates
    .map(({ x, y }) => `${x},${y}`)
    .join(" ");

  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  const area = `${first.x},${height - paddingBottom} ${points} ${last.x},${height - paddingBottom}`;
  const gridValues = [0, 1, 2, 3, 4].map(
    (index) => max - (valueRange * index) / 4
  );

  const gradientId = `equity-gradient-${range}`;

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.085] bg-[#090b0e]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(96,165,250,0.045),transparent_65%)]" />

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="relative block h-[220px] w-full sm:h-[285px]"
        role="img"
        aria-label={`Cumulative P&L equity curve for ${range === "ALL" ? "all available history" : range}`}
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#60a5fa"
              stopOpacity="0.28"
            />
            <stop
              offset="100%"
              stopColor="#60a5fa"
              stopOpacity="0.01"
            />
          </linearGradient>
        </defs>

        {gridValues.map((value, index) => {
          const y = paddingTop + (index / 4) * chartHeight;

          return (
            <g key={index}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="rgba(255,255,255,0.07)"
                strokeDasharray="3 5"
              />
              <text
                x={paddingLeft - 10}
                y={y + 4}
                textAnchor="end"
                fill="rgba(255,255,255,0.38)"
                fontSize="12"
              >
                {formatCompactMoney(value)}
              </text>
            </g>
          );
        })}

        {[0, 1, 2, 3, 4].map((index) => {
          const x =
            paddingLeft + (index / 4) * chartWidth;

          return (
            <line
              key={index}
              x1={x}
              y1={paddingTop}
              x2={x}
              y2={height - paddingBottom}
              stroke="rgba(255,255,255,0.035)"
            />
          );
        })}

        <polygon points={area} fill={`url(#${gradientId})`} />

        <polyline
          points={points}
          fill="none"
          stroke="#60a5fa"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        <circle
          cx={last.x}
          cy={last.y}
          r="5"
          fill="#60a5fa"
          stroke="#dbeafe"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        <text
          x={paddingLeft}
          y={height - 8}
          fill="rgba(255,255,255,0.4)"
          fontSize="11"
        >
          {formatDate(filteredTrades[0].trade_date)}
        </text>

        <text
          x={width - paddingRight}
          y={height - 8}
          textAnchor="end"
          fill="rgba(255,255,255,0.4)"
          fontSize="11"
        >
          {formatDate(filteredTrades[filteredTrades.length - 1].trade_date)}
        </text>
      </svg>
    </div>
  );
}

export default function DiscoverPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [traders, setTraders] = useState<Trader[]>([]);
  const [selectedTraderId, setSelectedTraderId] =
    useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [chartRange, setChartRange] = useState<ChartRange>("ALL");

  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [following, setFollowing] = useState<
    Record<string, boolean>
  >({});

  const [followLoading, setFollowLoading] = useState(false);
  const [followError, setFollowError] = useState("");

  const [mobileListOpen, setMobileListOpen] = useState(false);

  const loadDiscover = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);

        const { data: follows, error: followsError } =
          await supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", user.id);

        if (followsError) {
          console.error(
            "FOLLOW LOAD ERROR:",
            followsError.message
          );
        } else {
          const map: Record<string, boolean> = {};

          (follows || []).forEach((follow) => {
            map[follow.following_id] = true;
          });

          setFollowing(map);
        }
      }

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, avatar_url, bio, trading_style, experience_level, is_public, show_pnl, show_trades, show_analytics, created_at"
        )
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("DISCOVER PROFILE ERROR:", error.message);
        setFollowError("We couldn't load public trader profiles.");
        return;
      }

      if (!profiles?.length) {
        setTraders([]);
        setSelectedTraderId(null);
        return;
      }

      const profileIds = profiles.map((profile) => profile.id);

      const { data: trades, error: tradesError } =
        await supabase
          .from("trades")
          .select(
            "id, user_id, trade_date, pnl, created_at, direction, setup"
          )
          .in("user_id", profileIds)
          .order("trade_date", { ascending: true });

      if (tradesError) {
        console.error("DISCOVER TRADE ERROR:", tradesError.message);
      }

      const calculated = profiles.map((profile) => {
        const profileTrades =
          (trades || []).filter(
            (trade) => trade.user_id === profile.id
          ) || [];

        return calculateTrader(
          profile as Profile,
          profileTrades as Trade[]
        );
      });

      const visibleTraders = calculated.filter(
        (trader) =>
          trader.profile.show_trades ||
          trader.profile.show_pnl ||
          trader.profile.show_analytics
      );

      setTraders(visibleTraders);

      setSelectedTraderId((current) => {
        if (
          current &&
          visibleTraders.some(
            (trader) => trader.profile.id === current
          )
        ) {
          return current;
        }

        return visibleTraders[0]?.profile.id ?? null;
      });
    } catch (error) {
      console.error("DISCOVER LOAD ERROR:", error);
      setFollowError("Something went wrong loading Discover.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadDiscover();
  }, [loadDiscover]);

  const selectedTrader = useMemo(
    () =>
      traders.find(
        (trader) => trader.profile.id === selectedTraderId
      ) || null,
    [traders, selectedTraderId]
  );

  const filteredTraders = useMemo(() => {
    const query = search.toLowerCase().trim();

    const result = traders.filter((trader) => {
      const username =
        trader.profile.username?.toLowerCase() || "";
      const displayName =
        trader.profile.display_name?.toLowerCase() || "";
      const style =
        trader.profile.trading_style?.toLowerCase() || "";
      const experience =
        trader.profile.experience_level?.toLowerCase() || "";

      return (
        !query ||
        username.includes(query) ||
        displayName.includes(query) ||
        style.includes(query) ||
        experience.includes(query)
      );
    });

    return result.sort((a, b) => {
      if (sortBy === "pnl") {
        return b.pnl - a.pnl;
      }

      if (sortBy === "winRate") {
        return b.winRate - a.winRate;
      }

      if (sortBy === "trades") {
        return b.trades.length - a.trades.length;
      }

      return (
        new Date(b.profile.id === a.profile.id ? 0 : 1).getTime() -
        new Date(a.profile.id === b.profile.id ? 0 : 1).getTime()
      );
    });
  }, [search, sortBy, traders]);

  // Preserve database creation order for "Most recent".
  const sortedFilteredTraders = useMemo(() => {
    if (sortBy !== "recent") return filteredTraders;

    const order = new Map(
      traders.map((trader, index) => [
        trader.profile.id,
        index,
      ])
    );

    return [...filteredTraders].sort(
      (a, b) =>
        (order.get(a.profile.id) ?? 0) -
        (order.get(b.profile.id) ?? 0)
    );
  }, [filteredTraders, sortBy, traders]);

  const selectedIsFollowing = selectedTrader
    ? !!following[selectedTrader.profile.id]
    : false;

  const viewingOwnProfile =
    !!selectedTrader &&
    !!currentUserId &&
    selectedTrader.profile.id === currentUserId;

  const selectedTrades =
    selectedTrader?.profile.show_trades
      ? selectedTrader.trades
      : [];

  const topSetups = useMemo(() => {
    if (!selectedTrader?.profile.show_trades) return [];

    const counts = new Map<string, number>();

    selectedTrader.trades.forEach((trade) => {
      if (!trade.setup) return;

      counts.set(
        trade.setup,
        (counts.get(trade.setup) || 0) + 1
      );
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([setup]) => setup);
  }, [selectedTrader]);

  async function startMessage(traderId: string) {
    setFollowError("");

    if (!currentUserId) {
      setFollowError("Log in to message other traders.");
      return;
    }

    if (currentUserId === traderId) {
      setFollowError("You can't message yourself.");
      return;
    }

    try {
      const { data: conversationId, error } =
        await supabase.rpc("start_direct_conversation", {
          p_other_user_id: traderId,
        });

      if (error || !conversationId) {
        console.error(
          "START CONVERSATION ERROR:",
          error?.message
        );
        setFollowError("We couldn't start this conversation.");
        return;
      }

      router.push(
        `/dashboard/messages?conversation=${conversationId}`
      );
    } catch (error) {
      console.error("MESSAGE ERROR:", error);
      setFollowError("We couldn't start this conversation.");
    }
  }

  async function toggleFollow(traderId: string) {
    if (!currentUserId) {
      setFollowError("Log in to follow other traders.");
      return;
    }

    if (currentUserId === traderId) {
      setFollowError("You can't follow your own profile.");
      return;
    }

    if (followLoading) return;

    setFollowLoading(true);
    setFollowError("");

    const isCurrentlyFollowing = !!following[traderId];

    try {
      if (isCurrentlyFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", traderId);

        if (error) throw error;

        setFollowing((current) => {
          const updated = { ...current };
          delete updated[traderId];
          return updated;
        });
      } else {
        const { error } = await supabase.from("follows").insert({
          follower_id: currentUserId,
          following_id: traderId,
        });

        if (error) throw error;

        setFollowing((current) => ({
          ...current,
          [traderId]: true,
        }));
      }
    } catch (error) {
      console.error("FOLLOW UPDATE ERROR:", error);
      setFollowError("We couldn't update your follow status.");
    } finally {
      setFollowLoading(false);
    }
  }

  const metricsVisible =
    !!selectedTrader?.profile.show_analytics;

  const tradesVisible =
    !!selectedTrader?.profile.show_trades;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07090c] px-3 py-3 pb-24 text-white sm:px-4 sm:py-4 lg:h-screen lg:overflow-hidden lg:px-5 lg:pb-4">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1700px] flex-col sm:min-h-[calc(100vh-32px)] lg:h-full">
        {/* PAGE HEADER */}
        <header className="flex shrink-0 items-start justify-between gap-4 px-1 pb-5 sm:px-2">
          <div>
            <h1 className="text-[25px] font-semibold tracking-[-0.055em] text-white sm:text-[29px]">
              Discover traders
            </h1>
            <p className="mt-1.5 text-[12px] text-white/45 sm:text-[13px]">
              Find traders. Study their process. Learn from their performance.
            </p>
          </div>

          <div className="hidden h-9 shrink-0 items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.025] px-3.5 text-[11px] font-medium text-white/65 sm:flex">
            <Users className="h-4 w-4 text-white/50" />
            Public profiles
          </div>
        </header>

        {/* DISCOVER WORKSPACE */}
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.10] bg-[#0b0d10] shadow-[0_28px_90px_rgba(0,0,0,0.25)]">
          {/* SEARCH AND FILTERS */}
          <div className="flex shrink-0 flex-col gap-2.5 border-b border-white/[0.08] p-3 sm:flex-row sm:items-center sm:p-3.5 lg:gap-3">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search traders, markets, or strategies"
                aria-label="Search traders"
                className="h-10 w-full rounded-xl border border-white/[0.10] bg-[#111419] pl-10 pr-10 text-[12px] text-white outline-none transition placeholder:text-white/35 hover:border-white/[0.15] focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
              <div className="relative">
                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/45" />
                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value as SortOption)
                  }
                  aria-label="Sort traders"
                  className="h-10 w-full appearance-none rounded-xl border border-white/[0.10] bg-[#111419] pl-9 pr-9 text-[11px] text-white/75 outline-none transition hover:border-white/[0.16] focus:border-blue-400/50 sm:w-[155px]"
                >
                  <option value="recent">Most recent</option>
                  <option value="pnl">Total P&amp;L</option>
                  <option value="winRate">Win rate</option>
                  <option value="trades">Trade count</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
              </div>

              <button
                type="button"
                onClick={() => setMobileListOpen((value) => !value)}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.10] bg-[#111419] px-3 text-[11px] text-white/70 transition hover:bg-white/[0.05] lg:hidden"
              >
                <Users className="h-3.5 w-3.5" />
                {mobileListOpen ? "Hide traders" : "Browse traders"}
              </button>

              <div className="hidden h-10 items-center gap-2 rounded-xl border border-white/[0.10] bg-[#111419] px-3 text-[11px] text-white/45 sm:flex">
                <Users className="h-3.5 w-3.5" />
                {loading ? "Loading…" : `${sortedFilteredTraders.length} traders`}
              </div>
            </div>
          </div>

          {/* MOBILE DIRECTORY */}
          {mobileListOpen && (
            <div className="max-h-[300px] shrink-0 overflow-y-auto border-b border-white/[0.08] lg:hidden">
              {sortedFilteredTraders.map((trader) => (
                <TraderRow
                  key={trader.profile.id}
                  trader={trader}
                  active={selectedTraderId === trader.profile.id}
                  onClick={() => {
                    setSelectedTraderId(trader.profile.id);
                    setMobileListOpen(false);
                  }}
                />
              ))}
              {!loading && sortedFilteredTraders.length === 0 && (
                <p className="px-5 py-8 text-center text-xs text-white/40">
                  No public traders match your search.
                </p>
              )}
            </div>
          )}

          {/* MAIN COLUMNS */}
          <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(280px,0.34fr)_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
            {/* TRADER DIRECTORY */}
            <aside className="hidden min-h-0 flex-col border-r border-white/[0.08] lg:flex">
              <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/45">
                  Traders
                </p>
                <span className="text-[10px] tabular-nums text-white/35">
                  {loading ? "—" : sortedFilteredTraders.length}
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-color:#343940_transparent] [scrollbar-width:thin]">
                {loading ? (
                  <div className="space-y-4 p-4">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div key={item} className="flex animate-pulse items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white/[0.06]" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-2/3 rounded bg-white/[0.06]" />
                          <div className="h-2.5 w-1/3 rounded bg-white/[0.04]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : sortedFilteredTraders.length === 0 ? (
                  <div className="px-5 py-14 text-center">
                    <Users className="mx-auto h-8 w-8 text-white/20" />
                    <p className="mt-4 text-sm font-medium text-white/70">
                      No traders found
                    </p>
                    <p className="mx-auto mt-2 max-w-[230px] text-xs leading-5 text-white/35">
                      Try another search, or check back when more public profiles are available.
                    </p>
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="mt-4 text-xs font-medium text-blue-300 hover:text-blue-200"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  sortedFilteredTraders.map((trader) => (
                    <TraderRow
                      key={trader.profile.id}
                      trader={trader}
                      active={selectedTraderId === trader.profile.id}
                      onClick={() => setSelectedTraderId(trader.profile.id)}
                    />
                  ))
                )}
              </div>
            </aside>

            {/* PROFILE DETAIL */}
            <div className="min-h-0 overflow-y-auto [scrollbar-color:#343940_transparent] [scrollbar-width:thin]">
              {loading ? (
                <div className="space-y-5 p-5 sm:p-8">
                  <div className="h-20 animate-pulse rounded-xl bg-white/[0.035]" />
                  <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="h-28 animate-pulse rounded-xl bg-white/[0.035]"
                      />
                    ))}
                  </div>
                  <div className="h-[280px] animate-pulse rounded-xl bg-white/[0.035]" />
                </div>
              ) : selectedTrader ? (
                <div className="space-y-5 p-4 sm:space-y-6 sm:p-6 xl:p-7">
                  {/* PROFILE INTRO */}
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <Avatar
                        initials={selectedTrader.avatar}
                        large
                        avatarUrl={selectedTrader.profile.avatar_url}
                      />

                      <div className="min-w-0 flex-1 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="max-w-full break-words text-[19px] font-semibold tracking-[-0.045em] text-white sm:text-[22px]">
                            {getUsername(selectedTrader.profile)}
                          </h2>

                          <span
                            title="Public profile"
                            className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-blue-400/15 text-blue-300"
                          >
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {selectedTrader.profile.trading_style && (
                            <span className="rounded-full border border-white/[0.10] bg-white/[0.035] px-2.5 py-1 text-[10px] text-white/70">
                              {selectedTrader.profile.trading_style}
                            </span>
                          )}
                          {selectedTrader.profile.experience_level && (
                            <span className="rounded-full border border-white/[0.10] bg-white/[0.035] px-2.5 py-1 text-[10px] text-white/60">
                              {selectedTrader.profile.experience_level}
                            </span>
                          )}
                        </div>

                        {selectedTrader.profile.bio && (
                          <p className="mt-3 max-w-2xl whitespace-pre-wrap text-[12px] leading-5 text-white/50">
                            {selectedTrader.profile.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        disabled={viewingOwnProfile}
                        onClick={() =>
                          startMessage(selectedTrader.profile.id)
                        }
                        className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.13] bg-white/[0.025] px-4 text-[11px] font-medium text-white/80 transition hover:border-white/[0.22] hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-35 sm:flex-none"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Message
                      </button>

                      <button
                        type="button"
                        disabled={viewingOwnProfile || followLoading}
                        onClick={() =>
                          toggleFollow(selectedTrader.profile.id)
                        }
                        className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 sm:min-w-[112px] sm:flex-none ${
                          selectedIsFollowing
                            ? "border border-white/[0.15] bg-white/[0.07] text-white/85 hover:bg-white/[0.11]"
                            : "bg-white text-black hover:bg-white/90"
                        }`}
                      >
                        {followLoading ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/25 border-t-current" />
                        ) : selectedIsFollowing ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Following
                          </>
                        ) : (
                          "Follow"
                        )}
                      </button>
                    </div>
                  </div>

                  {/* PERFORMANCE METRICS */}
                  <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    <MetricCard
                      label="Total P&L"
                      value={
                        selectedTrader.profile.show_pnl
                          ? formatMoney(selectedTrader.pnl)
                          : "Hidden"
                      }
                      detail={
                        selectedTrader.profile.show_pnl
                          ? `${selectedTrader.trades.length} available trades`
                          : "Private performance"
                      }
                      icon={<TrendingUp className="h-3.5 w-3.5" />}
                      positive={
                        selectedTrader.profile.show_pnl
                          ? selectedTrader.pnl > 0
                            ? true
                            : selectedTrader.pnl < 0
                              ? false
                              : null
                          : null
                      }
                    />

                    <MetricCard
                      label="Win rate"
                      value={
                        metricsVisible
                          ? `${selectedTrader.winRate.toFixed(1)}%`
                          : "Hidden"
                      }
                      detail={
                        metricsVisible
                          ? `${selectedTrader.trades.filter((trade) => Number(trade.pnl) > 0).length} winning trades`
                          : "Private analytics"
                      }
                      icon={<BarChart3 className="h-3.5 w-3.5" />}
                    />

                    <MetricCard
                      label="Profit factor"
                      value={
                        metricsVisible
                          ? selectedTrader.profitFactor.toFixed(2)
                          : "Hidden"
                      }
                      detail={
                        metricsVisible
                          ? "Gross profit ÷ gross loss"
                          : "Private analytics"
                      }
                      icon={<LineChart className="h-3.5 w-3.5" />}
                    />

                    <MetricCard
                      label="Public trades"
                      value={
                        tradesVisible
                          ? selectedTrader.trades.length.toLocaleString()
                          : "Hidden"
                      }
                      detail={
                        tradesVisible
                          ? "Available trade history"
                          : "Trade history is private"
                      }
                      icon={<Clock3 className="h-3.5 w-3.5" />}
                    />
                  </div>

                  {/* EQUITY CURVE */}
                  {metricsVisible && (
                    <section className={PANEL + " p-3.5 sm:p-4"}>
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <LineChart className="h-4 w-4 text-blue-300" />
                            <h3 className="text-[13px] font-semibold text-white/90">
                              Equity curve
                            </h3>
                          </div>
                          <p className="mt-1 text-[10px] text-white/35">
                            Cumulative P&amp;L from available trade history
                          </p>
                        </div>

                        <div className="flex items-center gap-0.5 rounded-xl border border-white/[0.08] bg-black/25 p-1">
                          {(["1M", "3M", "6M", "ALL"] as ChartRange[]).map(
                            (range) => (
                              <button
                                key={range}
                                type="button"
                                onClick={() => setChartRange(range)}
                                className={`rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition sm:px-3 ${
                                  chartRange === range
                                    ? "bg-[#252b33] text-white shadow-sm"
                                    : "text-white/45 hover:text-white/80"
                                }`}
                              >
                                {range}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <EquityCurve
                        trades={selectedTrades}
                        range={chartRange}
                        showTrades={tradesVisible}
                      />
                    </section>
                  )}

                  {/* LOWER PROFILE SECTIONS */}
                  <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                    {/* TRADING APPROACH */}
                    <section className={PANEL + " p-4 sm:p-5"}>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.035]">
                          <Filter className="h-4 w-4 text-white/65" />
                        </div>
                        <div>
                          <h3 className="text-[12px] font-semibold text-white/85">
                            Trading approach
                          </h3>
                          <p className="mt-0.5 text-[10px] text-white/35">
                            Public profile details
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 whitespace-pre-wrap text-[12px] leading-6 text-white/50">
                        {selectedTrader.profile.bio ||
                          "This trader hasn't added a public bio yet."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {selectedTrader.profile.trading_style && (
                          <span className="rounded-full border border-white/[0.10] bg-white/[0.035] px-3 py-1.5 text-[10px] text-white/65">
                            {selectedTrader.profile.trading_style}
                          </span>
                        )}
                        {selectedTrader.profile.experience_level && (
                          <span className="rounded-full border border-white/[0.10] bg-white/[0.035] px-3 py-1.5 text-[10px] text-white/55">
                            {selectedTrader.profile.experience_level}
                          </span>
                        )}
                        {topSetups.map((setup) => (
                          <span
                            key={setup}
                            className="max-w-full truncate rounded-full border border-blue-300/[0.15] bg-blue-300/[0.055] px-3 py-1.5 text-[10px] text-blue-100/75"
                          >
                            {setup}
                          </span>
                        ))}
                      </div>
                    </section>

                    {/* RECENT PUBLIC TRADES */}
                    <section className={PANEL + " min-w-0 overflow-hidden"}>
                      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-4 sm:px-5">
                        <div>
                          <h3 className="text-[12px] font-semibold text-white/85">
                            Recent public trades
                          </h3>
                          <p className="mt-1 text-[10px] text-white/35">
                            {tradesVisible
                              ? "Latest available entries"
                              : "Individual trades are private"}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full border border-white/[0.08] px-2.5 py-1 text-[9px] text-white/45">
                          {tradesVisible
                            ? `${selectedTrades.length} trades`
                            : "Private"}
                        </span>
                      </div>

                      {!tradesVisible ? (
                        <div className="flex min-h-[160px] flex-col items-center justify-center px-5 text-center">
                          <Users className="h-6 w-6 text-white/20" />
                          <p className="mt-3 text-xs text-white/55">
                            Trade history isn't public
                          </p>
                          <p className="mt-1 text-[10px] text-white/30">
                            Only this trader can change that setting.
                          </p>
                        </div>
                      ) : selectedTrades.length === 0 ? (
                        <div className="flex min-h-[160px] flex-col items-center justify-center px-5 text-center">
                          <Clock3 className="h-6 w-6 text-white/20" />
                          <p className="mt-3 text-xs text-white/55">
                            No public trades yet
                          </p>
                          <p className="mt-1 text-[10px] text-white/30">
                            Public entries will appear here.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[440px] text-left">
                            <thead>
                              <tr className="border-b border-white/[0.055] text-[9px] uppercase tracking-[0.08em] text-white/35">
                                <th className="px-4 py-3 font-medium sm:px-5">
                                  Date
                                </th>
                                <th className="px-3 py-3 font-medium">
                                  Side
                                </th>
                                <th className="px-3 py-3 font-medium">
                                  Result
                                </th>
                                <th className="px-4 py-3 text-right font-medium sm:px-5">
                                  P&amp;L
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {[...selectedTrades]
                                .sort(
                                  (a, b) =>
                                    new Date(b.trade_date).getTime() -
                                    new Date(a.trade_date).getTime()
                                )
                                .slice(0, 5)
                                .map((trade) => {
                                  const pnl = Number(trade.pnl || 0);
                                  const result =
                                    pnl > 0
                                      ? "Win"
                                      : pnl < 0
                                        ? "Loss"
                                        : "Breakeven";

                                  return (
                                    <tr
                                      key={trade.id}
                                      className="border-b border-white/[0.045] last:border-0 transition hover:bg-white/[0.02]"
                                    >
                                      <td className="whitespace-nowrap px-4 py-3 text-[10px] text-white/60 sm:px-5">
                                        {formatDate(trade.trade_date)}
                                      </td>

                                      <td className="px-3 py-3">
                                        <span className="inline-flex items-center gap-1.5 text-[10px] text-white/65">
                                          {trade.direction === "Long" ? (
                                            <TrendingUp className="h-3 w-3 text-emerald-400" />
                                          ) : (
                                            <TrendingDown className="h-3 w-3 text-red-400" />
                                          )}
                                          {trade.direction}
                                        </span>
                                      </td>

                                      <td className="px-3 py-3">
                                        <span
                                          className={`inline-flex rounded-full px-2 py-1 text-[9px] font-medium ${
                                            result === "Win"
                                              ? "bg-emerald-400/[0.12] text-emerald-300"
                                              : result === "Loss"
                                                ? "bg-red-400/[0.12] text-red-300"
                                                : "bg-white/[0.08] text-white/55"
                                          }`}
                                        >
                                          {result}
                                        </span>
                                      </td>

                                      <td
                                        className={`whitespace-nowrap px-4 py-3 text-right text-[10px] font-medium tabular-nums sm:px-5 ${
                                          pnl > 0
                                            ? "text-emerald-400"
                                            : pnl < 0
                                              ? "text-red-400"
                                              : "text-white/50"
                                        }`}
                                      >
                                        {formatMoney(pnl)}
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </section>
                  </div>

                  <p className="pb-1 text-center text-[9px] leading-4 text-white/25">
                    Performance metrics are calculated from available trade records and may not represent independently verified results.
                  </p>
                </div>
              ) : (
                <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.025]">
                    <Users className="h-6 w-6 text-white/30" />
                  </div>
                  <h2 className="mt-4 text-sm font-semibold text-white/75">
                    {search ? "No matching traders" : "No public traders yet"}
                  </h2>
                  <p className="mt-2 max-w-xs text-xs leading-5 text-white/40">
                    {search
                      ? "Try a different username, display name, or trading style."
                      : "When traders make their profiles public, they'll appear here."}
                  </p>
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="mt-4 rounded-lg border border-white/[0.10] px-3 py-2 text-xs text-white/70 hover:bg-white/[0.05]"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* FEEDBACK */}
      {followError && (
        <div
          role="status"
          className="fixed bottom-20 left-3 right-3 z-[60] flex items-start justify-between gap-3 rounded-xl border border-white/[0.12] bg-[#12161c]/95 px-4 py-3 text-xs text-white/75 shadow-2xl backdrop-blur-xl sm:bottom-5 sm:left-auto sm:right-5 sm:max-w-[360px]"
        >
          <p>{followError}</p>
          <button
            type="button"
            onClick={() => setFollowError("")}
            aria-label="Dismiss message"
            className="shrink-0 text-white/40 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </main>
  );
}
