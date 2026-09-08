"use client";

import {
  BarChart3,
  Check,
  ChevronDown,
  Search,
  Users,
  MessageCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

function formatMoney(value: number) {
  const sign = value >= 0 ? "+" : "-";

  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.12] bg-gradient-to-br from-[#344353] via-[#171f29] to-[#080d13] text-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_20px_rgba(0,0,0,0.25)] ${
        large ? "h-[72px] w-[72px]" : "h-10 w-10"
      }`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span
          className={`font-semibold tracking-[-0.03em] ${
            large ? "text-[18px]" : "text-[11px]"
          }`}
        >
          {initials}
        </span>
      )}

      <div className="pointer-events-none absolute inset-0 rounded-full bg-blue-400/[0.035]" />
    </div>
  );
}

function EquityCurve({ trades }: { trades: Trade[] }) {
  const width = 900;
  const height = 270;

  const sortedTrades = [...trades].sort((a, b) => {
    return (
      new Date(a.trade_date).getTime() -
      new Date(b.trade_date).getTime()
    );
  });

  if (sortedTrades.length === 0) {
    return (
      <div className="relative mt-5 flex h-[250px] items-center justify-center overflow-hidden rounded-[12px] border border-white/[0.055] bg-[#08121c]/70">
        <p className="text-[11px] text-white/25">
          No public trade data available.
        </p>
      </div>
    );
  }

  let running = 0;

  const pointsData = sortedTrades.map((trade) => {
    running += Number(trade.pnl || 0);
    return running;
  });

  const min = Math.min(...pointsData, 0);
  const max = Math.max(...pointsData, 0);
  const range = max - min || 1;

  const points = pointsData
    .map((value, index) => {
      const x =
        pointsData.length === 1
          ? width / 2
          : (index / (pointsData.length - 1)) * width;

      const y =
        height -
        ((value - min) / range) * (height - 35) -
        10;

      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="relative mt-5 h-[250px] overflow-hidden rounded-[12px] border border-white/[0.055] bg-[#08121c]/70">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 right-0 top-1/4 border-t border-white/[0.035]" />
        <div className="absolute left-0 right-0 top-1/2 border-t border-white/[0.035]" />
        <div className="absolute left-0 right-0 top-3/4 border-t border-white/[0.035]" />
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[88%] w-full"
      >
        <defs>
          <linearGradient
            id="equity-fill"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#2385f5"
              stopOpacity="0.18"
            />
            <stop
              offset="100%"
              stopColor="#2385f5"
              stopOpacity="0"
            />
          </linearGradient>

          <filter id="equity-glow">
            <feGaussianBlur
              stdDeviation="5"
              result="blur"
            />
          </filter>
        </defs>

        <polygon
          points={areaPoints}
          fill="url(#equity-fill)"
        />

        <polyline
          points={points}
          fill="none"
          stroke="#2385f5"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.35"
          filter="url(#equity-glow)"
        />

        <polyline
          points={points}
          fill="none"
          stroke="#3b8ff5"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="absolute left-3 top-4 flex flex-col gap-[48px] text-[10px] text-white/25">
        <span>
          ${Math.round(max).toLocaleString()}
        </span>

        <span>
          ${Math.round(max * 0.5).toLocaleString()}
        </span>

        <span>$0</span>

        <span>
          {min < 0
            ? `-$${Math.abs(Math.round(min)).toLocaleString()}`
            : "$0"}
        </span>
      </div>

      <div className="absolute bottom-3 left-14 right-4 flex justify-between text-[9px] text-white/25">
        <span>Start</span>
        <span>30D</span>
      </div>
    </div>
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
  const username = trader.profile.username
    ? `@${trader.profile.username}`
    : "@trader";

  return (
    <button
      onClick={onClick}
      className={`relative flex w-full items-center gap-3 overflow-hidden border-b border-white/[0.045] px-4 py-4 text-left transition-all duration-200 ${
        active
          ? "bg-blue-500/[0.11]"
          : "hover:bg-white/[0.025]"
      }`}
    >
      {active && (
        <div className="absolute inset-y-0 left-0 w-[2px] bg-blue-400 shadow-[0_0_12px_rgba(35,133,245,0.65)]" />
      )}

      <Avatar
        initials={getInitials(
          trader.profile.display_name,
          trader.profile.username
        )}
        avatarUrl={trader.profile.avatar_url}
      />

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-[12px] font-semibold ${
            active
              ? "text-blue-300"
              : "text-white/60"
          }`}
        >
          {username}
        </p>

        <p className="mt-1 text-[10px] text-white/30">
          {trader.profile.trading_style || "Trader"}
        </p>

        <div className="mt-1 flex items-center gap-2">
          {trader.profile.show_pnl ? (
            <span
              className={`text-[10px] font-semibold ${
                trader.pnl >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {formatMoney(trader.pnl)}
            </span>
          ) : (
            <span className="text-[10px] text-white/25">
              P&L hidden
            </span>
          )}

          {trader.profile.show_analytics && (
            <span className="text-[9px] text-white/30">
              {trader.winRate.toFixed(0)}% /{" "}
              {trader.profitFactor.toFixed(2)} PF
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

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

export default function DiscoverPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [traders, setTraders] = useState<Trader[]>([]);
  const [selectedTrader, setSelectedTrader] =
    useState<Trader | null>(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Current logged-in user
  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  // Stores which traders the current user follows
  const [following, setFollowing] = useState<
    Record<string, boolean>
  >({});

  // Prevents multiple clicks while Supabase is processing
  const [followLoading, setFollowLoading] =
    useState(false);

  const [followError, setFollowError] =
    useState("");

  useEffect(() => {
    async function loadDiscover() {
      setLoading(true);
      setFollowError("");

      // --------------------------------------------------
      // CURRENT USER
      // --------------------------------------------------

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);

        // Load everyone this user currently follows
        const {
          data: follows,
          error: followsError,
        } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id);

        if (followsError) {
          console.error(
            "FOLLOW LOAD ERROR:",
            followsError.message
          );
        } else {
          const followingMap: Record<string, boolean> = {};

          (follows || []).forEach((follow) => {
            followingMap[follow.following_id] = true;
          });

          setFollowing(followingMap);
        }
      }

      // --------------------------------------------------
      // PUBLIC PROFILES
      // --------------------------------------------------

      const { data: profiles, error } =
        await supabase
          .from("profiles")
          .select(
            "id, username, display_name, avatar_url, bio, trading_style, experience_level, is_public, show_pnl, show_trades, show_analytics"
          )
          .eq("is_public", true)
          .order("created_at", {
            ascending: false,
          });

      if (error) {
        console.error(
          "DISCOVER PROFILE ERROR:",
          error.message
        );

        setLoading(false);
        return;
      }

      if (!profiles || profiles.length === 0) {
        setTraders([]);
        setSelectedTrader(null);
        setLoading(false);
        return;
      }

      // --------------------------------------------------
      // PUBLIC TRADES
      // --------------------------------------------------

      const profileIds = profiles.map(
        (profile) => profile.id
      );

      const {
        data: trades,
        error: tradesError,
      } = await supabase
        .from("trades")
        .select(
          "id, user_id, trade_date, pnl, created_at, direction, setup"
        )
        .in("user_id", profileIds)
        .order("trade_date", {
          ascending: true,
        });

      if (tradesError) {
        console.error(
          "DISCOVER TRADE ERROR:",
          tradesError.message
        );
      }

      const calculated = profiles.map((profile) => {
        const profileTrades =
          trades?.filter(
            (trade) =>
              trade.user_id === profile.id
          ) || [];

        return calculateTrader(
          profile,
          profileTrades
        );
      });

      const visibleTraders = calculated.filter(
        (trader) =>
          trader.profile.show_trades ||
          trader.profile.show_pnl ||
          trader.profile.show_analytics
      );

      setTraders(visibleTraders);

      if (visibleTraders.length > 0) {
        setSelectedTrader(visibleTraders[0]);
      }

      setLoading(false);
    }

    loadDiscover();
  }, [supabase]);

  // --------------------------------------------------
  // MESSAGE TRADER
  // --------------------------------------------------

  async function startMessage(traderId: string) {
    if (!currentUserId) {
      setFollowError("You need to be logged in to message traders.");
      return;
    }

    if (currentUserId === traderId) {
      setFollowError("You can't message yourself.");
      return;
    }

    try {
      const { data: conversationId, error } = await supabase.rpc(
        "start_direct_conversation",
        {
          p_other_user_id: traderId,
        }
      );

      if (error) {
        console.error("START CONVERSATION ERROR:", error.message);
        setFollowError("We couldn't start this conversation.");
        return;
      }

      if (!conversationId) {
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

  // --------------------------------------------------
  // FOLLOW / UNFOLLOW
  // --------------------------------------------------

  async function toggleFollow(traderId: string) {
    if (!currentUserId) {
      setFollowError(
        "You need to be logged in to follow traders."
      );
      return;
    }

    // Prevent following yourself
    if (currentUserId === traderId) {
      setFollowError(
        "You can't follow your own profile."
      );
      return;
    }

    if (followLoading) return;

    setFollowLoading(true);
    setFollowError("");

    const isCurrentlyFollowing =
      !!following[traderId];

    if (isCurrentlyFollowing) {
      // ----------------------------------------------
      // UNFOLLOW
      // ----------------------------------------------

      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", traderId);

      if (error) {
        console.error(
          "UNFOLLOW ERROR:",
          error.message
        );

        setFollowError(
          "We couldn't update your follow status."
        );

        setFollowLoading(false);
        return;
      }

      setFollowing((current) => {
        const updated = { ...current };
        delete updated[traderId];
        return updated;
      });
    } else {
      // ----------------------------------------------
      // FOLLOW
      // ----------------------------------------------

      const { error } = await supabase
        .from("follows")
        .insert({
          follower_id: currentUserId,
          following_id: traderId,
        });

      if (error) {
        console.error(
          "FOLLOW ERROR:",
          error.message
        );

        setFollowError(
          "We couldn't follow this trader."
        );

        setFollowLoading(false);
        return;
      }

      setFollowing((current) => ({
        ...current,
        [traderId]: true,
      }));
    }

    setFollowLoading(false);
  }

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filteredTraders = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return traders;
    }

    return traders.filter((trader) => {
      const username =
        trader.profile.username?.toLowerCase() || "";

      const displayName =
        trader.profile.display_name?.toLowerCase() || "";

      const style =
        trader.profile.trading_style?.toLowerCase() || "";

      return (
        username.includes(query) ||
        displayName.includes(query) ||
        style.includes(query)
      );
    });
  }, [search, traders]);

  const selectedTrades =
    selectedTrader?.profile.show_trades
      ? selectedTrader.trades
      : [];

  // --------------------------------------------------
  // TOP SETUPS
  // --------------------------------------------------

  const topSetups = useMemo(() => {
    if (!selectedTrader) return [];

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
      .slice(0, 4)
      .map(([setup]) => setup);
  }, [selectedTrader]);

  const selectedIsFollowing = selectedTrader
    ? !!following[selectedTrader.profile.id]
    : false;

  const viewingOwnProfile =
    !!selectedTrader &&
    !!currentUserId &&
    selectedTrader.profile.id === currentUserId;

  return (
    <main className="h-screen overflow-hidden bg-[#03070d] px-4 py-4 text-white lg:px-5">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col">

        {/* HEADER */}
        <div className="shrink-0 px-2 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[25px] font-semibold tracking-[-0.045em] text-white/90">
                Discover
              </h1>

              <p className="mt-1 text-[12px] text-white/30">
                Explore traders, strategies, and performance.
              </p>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-9 items-center gap-2 rounded-[9px] border border-white/[0.07] bg-white/[0.018] px-3 text-[11px] text-white/35">
                <Users
                  className="h-3.5 w-3.5"
                  strokeWidth={1.7}
                />
                Public traders
              </div>
            </div>
          </div>
        </div>

        {/* MAIN PANEL */}
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[18px] border border-white/[0.10] bg-[#09121c]/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_30px_80px_rgba(0,0,0,0.28)]">

          {/* SEARCH */}
          <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.055] px-5 py-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25"
                strokeWidth={1.8}
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search traders..."
                className="h-9 w-full rounded-[9px] border border-white/[0.055] bg-white/[0.018] pl-9 pr-3 text-[11px] text-white/70 outline-none transition placeholder:text-white/25 focus:border-blue-400/25 focus:bg-white/[0.025]"
              />
            </div>

            <button className="flex h-9 shrink-0 items-center gap-2 rounded-[9px] border border-white/[0.055] bg-white/[0.018] px-4 text-[11px] text-white/45 transition hover:bg-white/[0.035] hover:text-white/70">
              Most Recent

              <ChevronDown
                className="h-3 w-3"
                strokeWidth={1.8}
              />
            </button>
          </div>

          {/* CONTENT */}
          <div className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)]">

            {/* TRADER LIST */}
            <aside className="min-h-0 overflow-y-auto border-r border-white/[0.055]">
              {loading ? (
                <div className="px-5 py-10 text-center text-[11px] text-white/25">
                  Loading traders...
                </div>
              ) : filteredTraders.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Users className="mx-auto h-7 w-7 text-white/15" />

                  <p className="mt-4 text-[12px] font-medium text-white/40">
                    No public traders yet
                  </p>

                  <p className="mt-2 text-[10px] leading-5 text-white/20">
                    Public profiles will appear here once
                    traders enable Discover visibility.
                  </p>
                </div>
              ) : (
                filteredTraders.map((trader) => (
                  <TraderRow
                    key={trader.profile.id}
                    trader={trader}
                    active={
                      selectedTrader?.profile.id ===
                      trader.profile.id
                    }
                    onClick={() =>
                      setSelectedTrader(trader)
                    }
                  />
                ))
              )}
            </aside>

            {/* TRADER PROFILE */}
            <div className="min-h-0 overflow-y-auto">
              {selectedTrader ? (
                <div className="p-7 xl:p-8">

                  {/* PROFILE HEADER */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                      <Avatar
                        initials={selectedTrader.avatar}
                        large
                        avatarUrl={
                          selectedTrader.profile.avatar_url
                        }
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-[20px] font-semibold tracking-[-0.04em] text-white/90">
                            @
                            {selectedTrader.profile
                              .username || "trader"}
                          </h2>

                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-[8px] text-blue-300">
                            ✓
                          </span>
                        </div>

                        <p className="mt-1 text-[12px] text-white/35">
                          {selectedTrader.profile
                            .trading_style || "Trader"}
                        </p>

                        {selectedTrader.profile
                          .experience_level && (
                          <p className="mt-2 text-[10px] text-white/25">
                            {
                              selectedTrader.profile
                                .experience_level
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    {/* FOLLOW AND MESSAGE BUTTONS */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={viewingOwnProfile}
                          onClick={() =>
                            startMessage(selectedTrader.profile.id)
                          }
                          className={`flex h-10 items-center justify-center gap-2 rounded-[9px] border px-4 text-[12px] font-semibold transition ${
                            viewingOwnProfile
                              ? "cursor-default border-white/[0.06] bg-white/[0.025] text-white/20"
                              : "border-white/[0.08] bg-white/[0.035] text-white/65 hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          <MessageCircle
                            className="h-3.5 w-3.5"
                            strokeWidth={1.8}
                          />
                          Message
                        </button>

                        <button
                          type="button"
                          disabled={
                            viewingOwnProfile ||
                            followLoading
                          }
                          onClick={() =>
                            toggleFollow(
                              selectedTrader.profile.id
                            )
                          }
                          className={`flex h-10 min-w-[104px] items-center justify-center gap-2 rounded-[9px] px-5 text-[12px] font-semibold transition ${
                            viewingOwnProfile
                              ? "cursor-default border border-white/[0.06] bg-white/[0.025] text-white/25"
                              : selectedIsFollowing
                                ? "border border-blue-400/[0.18] bg-blue-500/[0.08] text-blue-300 hover:bg-blue-500/[0.13]"
                                : "bg-[#2385f5] text-white shadow-[0_8px_25px_rgba(35,133,245,0.18)] hover:bg-[#318ff7] hover:shadow-[0_10px_30px_rgba(35,133,245,0.28)]"
                          }`}
                        >
                          {followLoading ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                          ) : selectedIsFollowing ? (
                            <>
                              <Check
                                className="h-3.5 w-3.5"
                                strokeWidth={2}
                              />
                              Following
                            </>
                          ) : (
                            "Follow"
                          )}
                        </button>
                      </div>

                      {followError && (
                        <p className="max-w-[250px] text-right text-[9px] text-red-400/75">
                          {followError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* BIO */}
                  {selectedTrader.profile.bio && (
                    <p className="mt-5 max-w-[650px] text-[11px] leading-5 text-white/30">
                      {selectedTrader.profile.bio}
                    </p>
                  )}

                  {/* METRICS */}
                  <div className="mt-8 grid grid-cols-3 border-y border-white/[0.055] py-5">
                    <div>
                      {selectedTrader.profile.show_pnl ? (
                        <>
                          <p
                            className={`text-[22px] font-semibold tracking-[-0.04em] ${
                              selectedTrader.pnl >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {formatMoney(
                              selectedTrader.pnl
                            )}
                          </p>

                          <p className="mt-1 text-[10px] text-white/30">
                            Total P&L
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-[22px] font-semibold text-white/30">
                            —
                          </p>

                          <p className="mt-1 text-[10px] text-white/30">
                            P&L hidden
                          </p>
                        </>
                      )}
                    </div>

                    <div className="border-l border-white/[0.055] pl-6">
                      {selectedTrader.profile
                        .show_analytics ? (
                        <>
                          <p className="text-[22px] font-semibold tracking-[-0.04em] text-white/80">
                            {selectedTrader.winRate.toFixed(
                              1
                            )}
                            %
                          </p>

                          <p className="mt-1 text-[10px] text-white/30">
                            Win Rate
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-[22px] font-semibold text-white/30">
                            —
                          </p>

                          <p className="mt-1 text-[10px] text-white/30">
                            Hidden
                          </p>
                        </>
                      )}
                    </div>

                    <div className="border-l border-white/[0.055] pl-6">
                      {selectedTrader.profile
                        .show_analytics ? (
                        <>
                          <p className="text-[22px] font-semibold tracking-[-0.04em] text-white/80">
                            {selectedTrader.profitFactor.toFixed(
                              2
                            )}
                          </p>

                          <p className="mt-1 text-[10px] text-white/30">
                            Profit Factor
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-[22px] font-semibold text-white/30">
                            —
                          </p>

                          <p className="mt-1 text-[10px] text-white/30">
                            Hidden
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* EQUITY */}
                  {selectedTrader.profile
                    .show_analytics && (
                    <div className="mt-7">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUpIcon />

                          <h3 className="text-[12px] font-medium text-white/55">
                            Equity Curve
                          </h3>
                        </div>

                        <span className="text-[10px] text-white/25">
                          All Time
                        </span>
                      </div>

                      <EquityCurve
                        trades={selectedTrades}
                      />
                    </div>
                  )}

                  {/* TOP SETUPS */}
                  {selectedTrader.profile
                    .show_trades &&
                    topSetups.length > 0 && (
                      <div className="mt-7">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-[12px] font-medium text-white/55">
                            Top Setups
                          </h3>

                          <span className="text-[9px] text-white/20">
                            ⓘ
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {topSetups.map((setup) => (
                            <span
                              key={setup}
                              className="rounded-full border border-blue-400/[0.10] bg-blue-500/[0.035] px-3 py-1.5 text-[10px] font-medium text-white/45"
                            >
                              {setup}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* TRADING STYLE */}
                  <div className="mt-6">
                    <h3 className="text-[12px] font-medium text-white/55">
                      Trading Style
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        selectedTrader.profile
                          .trading_style ||
                          "Not specified",
                        selectedTrader.profile
                          .experience_level ||
                          "Experience not specified",
                      ].map((style) => (
                        <span
                          key={style}
                          className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[10px] font-medium text-white/40"
                        >
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-[12px] text-white/25">
                  Select a trader to view their profile.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function TrendingUpIcon() {
  return (
    <BarChart3
      className="h-4 w-4 text-blue-300/65"
      strokeWidth={1.7}
    />
  );
}