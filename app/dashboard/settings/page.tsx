"use client";

import {
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  Download,
  Mail,
  RotateCcw,
  Shield,
  Trash2,
  UserRound,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const tabs = [
  "Profile",
  "Account",
  "Trading",
  "Journal",
  "Privacy",
  "Notifications",
  "Plan",
];

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
  plan: "free" | "pro";
  is_founder: boolean;
  created_at: string;
};

function SectionCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-[16px] border border-white/[0.075] bg-gradient-to-br from-[#171717] via-[#111111] to-[#0a0a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_12px_35px_rgba(0,0,0,0.16)] ${className}`}
    >
      <div className="px-4 pb-0 pt-4 sm:px-5 sm:pt-5">
        <h2 className="text-[13px] font-semibold tracking-[-0.02em] text-white/85 sm:text-[14px]">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-medium text-white/50 sm:mb-2 sm:text-[11px]">
        {label}
      </span>

      {textarea ? (
        <>
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            maxLength={160}
            disabled={disabled}
            className="h-[82px] w-full resize-none rounded-[9px] border border-white/[0.07] bg-[#141414] px-3 py-2.5 text-[11px] leading-4 text-white/75 outline-none transition placeholder:text-white/20 focus:border-white/25 focus:bg-[#181818] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[76px]"
          />

          <div className="mt-1 text-right text-[8px] text-white/20">
            {value.length}/160
          </div>
        </>
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="h-[38px] w-full rounded-[9px] border border-white/[0.07] bg-[#141414] px-3 text-[11px] text-white/75 outline-none transition placeholder:text-white/20 focus:border-white/25 focus:bg-[#181818] disabled:cursor-not-allowed disabled:opacity-50"
        />
      )}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-[10px] font-medium text-white/50 sm:mb-2 sm:text-[11px]">
          {label}
        </span>
      )}

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-[38px] w-full cursor-pointer appearance-none rounded-[9px] border border-white/[0.07] bg-[#141414] px-3 pr-9 text-[11px] text-white/70 outline-none focus:border-white/25 focus:bg-[#181818]"
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
      </div>
    </label>
  );
}

function Toggle({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      aria-pressed={enabled}
      className={`relative h-[23px] w-[40px] shrink-0 cursor-pointer rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
        enabled
          ? "bg-white shadow-[0_0_12px_rgba(255,255,255,0.08)]"
          : "bg-white/[0.09]"
      }`}
    >
      <span
        className={`absolute top-[3px] h-[17px] w-[17px] rounded-full shadow-sm transition-all ${
          enabled
            ? "left-[20px] bg-black"
            : "left-[3px] bg-white"
        }`}
      />
    </button>
  );
}

function PreferenceToggle({
  title,
  description,
  enabled,
  onChange,
  disabled = false,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[11px] border border-white/[0.045] bg-white/[0.012] p-3.5">
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-white/70">
          {title}
        </p>

        <p className="mt-1 text-[9px] leading-4 text-white/28">
          {description}
        </p>
      </div>

      <Toggle
        enabled={enabled}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

function SmallInfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 border-b border-white/[0.045] py-2.5 last:border-0">
      <span className="shrink-0 text-[9px] text-white/35 sm:text-[10px]">
        {label}
      </span>

      <span className="max-w-[58%] truncate text-right text-[9px] font-medium text-white/65 sm:text-[10px]">
        {value}
      </span>
    </div>
  );
}

function SettingButton({
  icon,
  title,
  description,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-[11px] border border-white/[0.065] bg-white/[0.018] p-3 text-left transition hover:bg-white/[0.035] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-white/[0.07] bg-white/[0.025]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-white/70">
          {title}
        </p>

        <p className="mt-1 text-[9px] leading-4 text-white/25">
          {description}
        </p>
      </div>

      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [activeTab, setActiveTab] = useState("Profile");

  const [profile, setProfile] = useState<Profile | null>(null);

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const [tradingStyle, setTradingStyle] =
    useState("Intraday");
  const [experienceLevel, setExperienceLevel] =
    useState("Intermediate");

  const [isPublic, setIsPublic] = useState(false);
  const [showPnl, setShowPnl] = useState(true);
  const [showTrades, setShowTrades] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(true);

  const [defaultMarket, setDefaultMarket] =
    useState("Futures");
  const [accountSize, setAccountSize] =
    useState("$50,000");
  const [riskPerTrade, setRiskPerTrade] =
    useState("1.00");

  const [reviewTemplate, setReviewTemplate] =
    useState("Standard");
  const [gradeScale, setGradeScale] =
    useState("A+ → F");
  const [tradeStatus, setTradeStatus] =
    useState("Review Later");

  const [emailNotifications, setEmailNotifications] =
    useState(true);
  const [weeklySummary, setWeeklySummary] =
    useState(true);
  const [tradeReminders, setTradeReminders] =
    useState(true);
  const [communityActivity, setCommunityActivity] =
    useState(false);

  const [showEmail, setShowEmail] = useState(false);

  const [tradeCount, setTradeCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [passwordResetSent, setPasswordResetSent] =
    useState(false);

  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setEmail(user.email ?? "");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);

        setDisplayName(
          profileData.display_name ?? ""
        );
        setUsername(
          profileData.username ?? ""
        );
        setBio(profileData.bio ?? "");

        setTradingStyle(
          profileData.trading_style ?? "Intraday"
        );

        setExperienceLevel(
          profileData.experience_level ??
            "Intermediate"
        );

        setIsPublic(
          profileData.is_public ?? false
        );

        setShowPnl(
          profileData.show_pnl ?? true
        );

        setShowTrades(
          profileData.show_trades ?? true
        );

        setShowAnalytics(
          profileData.show_analytics ?? true
        );
      }

      const { count } = await supabase
        .from("trades")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id);

      setTradeCount(count ?? 0);
      setLoading(false);
    }

    loadSettings();
  }, [supabase]);

  async function saveProfile() {
    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        display_name:
          displayName.trim() || null,

        username:
          username.trim().replace(/^@/, "") ||
          null,

        bio: bio.trim() || null,

        trading_style: tradingStyle,

        experience_level: experienceLevel,

        is_public: isPublic,

        show_pnl: showPnl,

        show_trades: showTrades,

        show_analytics: showAnalytics,

        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error(
        "PROFILE UPDATE ERROR:",
        error.message
      );

      setMessage("Couldn't save changes.");
      setSaving(false);
      return;
    }

    setProfile(data);
    setMessage("Changes saved.");
    setSaving(false);
  }

  async function uploadAvatar(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage(
        "Profile photos must be under 5 MB."
      );
      return;
    }

    setUploadingPhoto(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUploadingPhoto(false);
      return;
    }

    const ext =
      file.name.split(".").pop() || "jpg";

    const filePath = `${user.id}/avatar-${Date.now()}.${ext}`;

    const { error: uploadError } =
      await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

    if (uploadError) {
      console.error(
        "AVATAR UPLOAD ERROR:",
        uploadError.message
      );

      setMessage("Couldn't upload photo.");
      setUploadingPhoto(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const avatarUrl =
      `${publicUrl}?v=${Date.now()}`;

    const {
      data,
      error: profileError,
    } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (profileError) {
      console.error(
        "AVATAR PROFILE UPDATE ERROR:",
        profileError.message
      );

      setMessage(
        "Photo uploaded, but profile couldn't be updated."
      );

      setUploadingPhoto(false);
      return;
    }

    setProfile(data);
    setMessage("Profile photo updated.");
    setUploadingPhoto(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function resetPassword() {
    if (!email) return;

    setMessage("");

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email
      );

    if (error) {
      setMessage(
        "Couldn't send the password reset email."
      );
      return;
    }

    setPasswordResetSent(true);
    setMessage(
      "Password reset email sent."
    );
  }

  async function exportTrades() {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please log in again.");
      return;
    }

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("trade_date", {
        ascending: false,
      });

    if (error) {
      console.error(
        "EXPORT ERROR:",
        error.message
      );

      setMessage(
        "Couldn't export your trades."
      );

      return;
    }

    if (!data || data.length === 0) {
      setMessage(
        "You don't have any trades to export yet."
      );

      return;
    }

    const columns = [
      "trade_date",
      "symbol",
      "market",
      "direction",
      "quantity",
      "pnl",
      "risk_amount",
      "r_multiple",
      "setup",
      "market_condition",
      "session",
      "grade",
      "emotion",
      "execution_rating",
      "followed_plan",
      "visibility",
      "notes",
    ];

    const escapeCsv = (value: unknown) => {
      if (
        value === null ||
        value === undefined
      ) {
        return "";
      }

      const stringValue = String(value);

      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(
          /"/g,
          '""'
        )}"`;
      }

      return stringValue;
    };

    const csv = [
      columns.join(","),
      ...data.map((trade) =>
        columns
          .map((column) =>
            escapeCsv(
              (
                trade as Record<
                  string,
                  unknown
                >
              )[column]
            )
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `trademirror-trades-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    setMessage(
      "Trades exported successfully."
    );
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab);
    setMessage("");
    setPasswordResetSent(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-white">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-white" />

          <p className="mt-3 text-[11px] text-white/30">
            Loading settings...
          </p>
        </div>
      </main>
    );
  }

  const memberSince = profile?.created_at
    ? new Date(
        profile.created_at
      ).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const isPro = profile?.plan === "pro";

  const accountType = isPro
    ? "Pro"
    : "Free";

  return (
    <main className="min-h-screen overflow-x-hidden bg-background px-3 py-3 pb-24 text-white sm:px-4 sm:py-4 lg:h-screen lg:overflow-hidden lg:px-5 lg:pb-0">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1600px] flex-col overflow-hidden rounded-[16px] border border-white/[0.075] bg-[#0a0a0a]/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] sm:min-h-[calc(100vh-32px)] lg:h-full">
        {/* HEADER */}
        <header className="shrink-0 px-4 pb-3 pt-4 sm:px-5 sm:pb-4 sm:pt-5 lg:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-semibold tracking-[-0.045em] text-white/90 sm:text-[24px]">
                Settings
              </h1>

              <p className="mt-1 max-w-[500px] text-[10px] leading-4 text-white/30 sm:text-[12px]">
                Manage your account, preferences,
                and journal settings.
              </p>
            </div>

            {isPro && (
              <div className="mt-1 flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.05] px-2.5 py-1">
                <Zap
                  className="h-3 w-3 text-white/70"
                  strokeWidth={1.8}
                />
                <span className="text-[8px] font-semibold uppercase tracking-[0.08em] text-white/70">
                  Pro
                </span>
              </div>
            )}
          </div>
        </header>

        {/* TABS */}
        <div className="shrink-0 border-b border-white/[0.055] px-3 sm:px-5 lg:px-6">
          <div className="scrollbar-none flex h-[43px] items-end gap-0.5 overflow-x-auto">
            {tabs.map((tab) => {
              const active =
                activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() =>
                    handleTabChange(tab)
                  }
                  className={`relative h-full shrink-0 cursor-pointer px-3 text-[10px] font-medium transition-colors sm:px-3.5 sm:text-[11px] ${
                    active
                      ? "text-white"
                      : "text-white/35 hover:text-white/65"
                  }`}
                >
                  {tab}

                  {active && (
                    <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.15)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}
        <div className="min-h-0 flex-1 overflow-hidden p-2.5 sm:p-3 lg:p-4">
          <div className="h-full min-h-0 overflow-y-auto pr-0.5 sm:pr-1">
            {/* PROFILE */}
            {activeTab === "Profile" && (
              <div className="space-y-3.5 xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-4 xl:space-y-0">
                <div className="space-y-3.5">
                  <SectionCard title="Profile Information">
                    <div className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                        {/* AVATAR */}
                        <div className="flex shrink-0 flex-col items-center sm:w-[125px]">
                          <div className="relative flex h-[96px] w-[96px] items-center justify-center overflow-hidden rounded-full border border-white/[0.10] bg-gradient-to-br from-[#3c4855] via-[#202a35] to-[#080d13] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_12px_30px_rgba(0,0,0,0.3)] sm:h-[108px] sm:w-[108px]">
                            {profile?.avatar_url ? (
                              <img
                                src={
                                  profile.avatar_url
                                }
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserRound
                                className="h-11 w-11 text-white/25"
                                strokeWidth={1.2}
                              />
                            )}

                            <div className="pointer-events-none absolute inset-0 bg-white/[0.02]" />
                          </div>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={
                              uploadAvatar
                            }
                            className="hidden"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              fileInputRef.current?.click()
                            }
                            disabled={
                              uploadingPhoto
                            }
                            className="mt-3 flex h-[32px] w-full cursor-pointer items-center justify-center gap-2 rounded-[8px] border border-white/[0.07] bg-white/[0.018] text-[9px] text-white/55 transition hover:bg-white/[0.035] hover:text-white/80 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Camera className="h-3 w-3" />

                            {uploadingPhoto
                              ? "Uploading..."
                              : "Change Photo"}
                          </button>

                          <p className="mt-2 text-center text-[8px] leading-3 text-white/20">
                            JPG, PNG or WebP
                            <br />
                            Max 5 MB
                          </p>
                        </div>

                        {/* FIELDS */}
                        <div className="min-w-0 flex-1">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <Field
                              label="Full Name"
                              value={
                                displayName
                              }
                              onChange={
                                setDisplayName
                              }
                              placeholder="Your name"
                            />

                            <Field
                              label="Email"
                              value={email}
                              onChange={() => {}}
                              disabled
                            />

                            <Field
                              label="Username"
                              value={username}
                              onChange={
                                setUsername
                              }
                              placeholder="username"
                            />

                            <SelectField
                              label="Experience Level"
                              value={
                                experienceLevel
                              }
                              onChange={
                                setExperienceLevel
                              }
                              options={[
                                "Beginner",
                                "Intermediate",
                                "Advanced",
                                "Professional",
                              ]}
                            />

                            <div className="sm:col-span-2">
                              <Field
                                label="Bio"
                                value={bio}
                                onChange={setBio}
                                placeholder="Tell traders a little about yourself..."
                                textarea
                              />
                            </div>
                          </div>

                          <div className="mt-3 flex flex-col-reverse gap-3 border-t border-white/[0.045] pt-3 sm:flex-row sm:items-center sm:justify-between">
                            <p
                              className={`text-[9px] ${
                                message
                                  ? "text-white/75"
                                  : "text-transparent"
                              }`}
                            >
                              {message ||
                                "Saved"}
                            </p>

                            <button
                              type="button"
                              onClick={
                                saveProfile
                              }
                              disabled={saving}
                              className="h-[34px] w-full cursor-pointer rounded-[8px] bg-white px-5 text-[10px] font-semibold text-black shadow-[0_7px_20px_rgba(255,255,255,0.05)] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                              {saving
                                ? "Saving..."
                                : "Save Changes"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Trading Style">
                    <div className="grid grid-cols-1 gap-4 px-4 pb-4 pt-4 sm:grid-cols-2 sm:px-5 sm:pb-5">
                      <SelectField
                        label="Trading Style"
                        value={
                          tradingStyle
                        }
                        onChange={
                          setTradingStyle
                        }
                        options={[
                          "Scalping",
                          "Intraday",
                          "Swing",
                          "Position",
                        ]}
                      />

                      <div>
                        <p className="mb-1.5 text-[10px] font-medium text-white/50 sm:mb-2 sm:text-[11px]">
                          Profile Status
                        </p>

                        <div className="flex h-[38px] items-center gap-2 rounded-[9px] border border-white/[0.07] bg-[#141414] px-3">
                          <span className="h-1.5 w-1.5 rounded-full bg-white/70" />

                          <span className="text-[10px] text-white/50">
                            Account active
                          </span>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </div>

                <div className="space-y-3.5">
                  <SectionCard title="Profile Preview">
                    <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
                      <div className="rounded-[11px] border border-white/[0.06] bg-white/[0.018] p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.04]">
                            {profile?.avatar_url ? (
                              <img
                                src={
                                  profile.avatar_url
                                }
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserRound
                                className="h-5 w-5 text-white/25"
                                strokeWidth={1.2}
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-semibold text-white/75">
                              {displayName ||
                                "Your Name"}
                            </p>

                            <p className="mt-0.5 truncate text-[9px] text-white/30">
                              @
                              {username ||
                                "trader"}
                            </p>
                          </div>
                        </div>

                        <p className="mt-4 text-[10px] leading-4 text-white/35">
                          {bio ||
                            "Your profile bio will appear here."}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-[5px] bg-white/[0.07] px-2 py-1 text-[9px] text-white/65">
                            {tradingStyle}
                          </span>

                          <span className="rounded-[5px] bg-white/[0.04] px-2 py-1 text-[9px] text-white/40">
                            {experienceLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Account Summary">
                    <div className="px-4 pb-4 pt-3 sm:px-5">
                      <SmallInfoRow
                        label="Member Since"
                        value={
                          memberSince
                        }
                      />

                      <SmallInfoRow
                        label="Email"
                        value={
                          email || "—"
                        }
                      />

                      <SmallInfoRow
                        label="Account Type"
                        value={
                          accountType
                        }
                      />

                      <SmallInfoRow
                        label="Trades Logged"
                        value={String(
                          tradeCount
                        )}
                      />
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}

            {/* ACCOUNT */}
            {activeTab === "Account" && (
              <div className="space-y-3.5 xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-4 xl:space-y-0">
                <div className="space-y-3.5">
                  <SectionCard title="Account Information">
                    <div className="space-y-3 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                      <Field
                        label="Email Address"
                        value={email}
                        onChange={() => {}}
                        disabled
                      />

                      <div className="rounded-[10px] border border-white/[0.08] bg-white/[0.02] p-3.5">
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-white/75" />

                          <span className="text-[10px] font-medium text-white/60">
                            Email verified
                          </span>
                        </div>

                        <p className="mt-1.5 pl-5 text-[9px] text-white/25">
                          Your email address is
                          verified and ready to
                          use.
                        </p>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Security">
                    <div className="space-y-2 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                      <SettingButton
                        icon={
                          <Shield className="h-3.5 w-3.5 text-white/45" />
                        }
                        title="Change Password"
                        description="Send a secure password reset link to your email."
                        onClick={
                          resetPassword
                        }
                      />

                      {passwordResetSent && (
                        <p className="px-1 text-[9px] text-white/75">
                          Password reset
                          email sent.
                        </p>
                      )}
                    </div>
                  </SectionCard>

                  <section className="overflow-hidden rounded-[16px] border border-white/[0.10] bg-white/[0.02]">
                    <div className="px-4 pb-4 pt-4 sm:px-5">
                      <h2 className="text-[13px] font-semibold text-white/75">
                        Danger Zone
                      </h2>

                      <p className="mt-2 text-[10px] font-medium text-white/65">
                        Delete Account
                      </p>

                      <p className="mt-1.5 text-[9px] leading-4 text-white/35">
                        Permanently delete your
                        account and all associated
                        data. This action cannot be
                        undone.
                      </p>

                      <button
                        type="button"
                        disabled
                        className="mt-3 flex h-[34px] w-full cursor-not-allowed items-center justify-center gap-2 rounded-[8px] border border-white/[0.10] bg-white/[0.025] text-[10px] font-medium text-white/35"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete My Account
                      </button>
                    </div>
                  </section>
                </div>

                <div className="space-y-3.5">
                  <SectionCard title="Account Summary">
                    <div className="px-4 pb-4 pt-3 sm:px-5">
                      <SmallInfoRow
                        label="Member Since"
                        value={
                          memberSince
                        }
                      />

                      <SmallInfoRow
                        label="Email"
                        value={
                          email || "—"
                        }
                      />

                      <SmallInfoRow
                        label="Account Type"
                        value={
                          accountType
                        }
                      />

                      <SmallInfoRow
                        label="Trades Logged"
                        value={String(
                          tradeCount
                        )}
                      />
                    </div>
                  </SectionCard>

                  <SectionCard title="Export Data">
                    <div className="space-y-2 px-4 pb-4 pt-3 sm:px-5">
                      <p className="mb-3 text-[9px] leading-4 text-white/30">
                        Download a copy of your
                        TradeMirror data.
                      </p>

                      <button
                        type="button"
                        onClick={
                          exportTrades
                        }
                        className="flex h-[36px] w-full cursor-pointer items-center justify-between rounded-[8px] border border-white/[0.07] bg-white/[0.018] px-3 text-[10px] text-white/60 transition hover:border-white/[0.12] hover:bg-white/[0.035]"
                      >
                        Export Trades (CSV)

                        <Download className="h-3.5 w-3.5 text-white/40" />
                      </button>

                      <button
                        type="button"
                        disabled
                        className="flex h-[36px] w-full cursor-not-allowed items-center justify-between rounded-[8px] border border-white/[0.07] bg-white/[0.018] px-3 text-[10px] text-white/25"
                      >
                        Export Journal (PDF)

                        <Download className="h-3.5 w-3.5 text-white/20" />
                      </button>

                      <button
                        type="button"
                        disabled
                        className="flex h-[36px] w-full cursor-not-allowed items-center justify-between rounded-[8px] border border-white/[0.07] bg-white/[0.018] px-3 text-[10px] text-white/25"
                      >
                        Export Analytics (CSV)

                        <Download className="h-3.5 w-3.5 text-white/20" />
                      </button>

                      {message && (
                        <p className="pt-2 text-[9px] text-white/75">
                          {message}
                        </p>
                      )}
                    </div>
                  </SectionCard>

                  <SectionCard title="Quick Actions">
                    <div className="space-y-2 px-4 pb-4 pt-3 sm:px-5">
                      <SettingButton
                        icon={
                          <Download className="h-3.5 w-3.5 text-white/45" />
                        }
                        title="Import Trades"
                        description="Import trades from CSV or Excel."
                      />

                      <SettingButton
                        icon={
                          <RotateCcw className="h-3.5 w-3.5 text-white/45" />
                        }
                        title="Reset Onboarding"
                        description="Restart the onboarding experience."
                      />

                      <SettingButton
                        icon={
                          <Mail className="h-3.5 w-3.5 text-white/45" />
                        }
                        title="Contact Support"
                        description="Get help from our support team."
                      />
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}

            {/* TRADING */}
            {activeTab === "Trading" && (
              <div className="space-y-3.5">
                <SectionCard title="Trading Preferences">
                  <div className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
                      <div className="space-y-3.5">
                        <SelectField
                          label="Default Market"
                          value={
                            defaultMarket
                          }
                          onChange={
                            setDefaultMarket
                          }
                          options={[
                            "Futures",
                            "Stocks",
                            "Options",
                            "Forex",
                            "Crypto",
                          ]}
                        />

                        <div>
                          <p className="mb-1.5 text-[10px] font-medium text-white/50">
                            Default Instruments
                          </p>

                          <div className="flex min-h-[38px] flex-wrap items-center gap-1.5 rounded-[9px] border border-white/[0.07] bg-[#141414] px-2 py-1.5">
                            {[
                              "NQ",
                              "ES",
                              "MNQ",
                            ].map(
                              (instrument) => (
                                <span
                                  key={
                                    instrument
                                  }
                                  className="rounded-[5px] bg-white/[0.05] px-2 py-1 text-[9px] text-white/55"
                                >
                                  {instrument}
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        <Field
                          label="Default Account Size"
                          value={
                            accountSize
                          }
                          onChange={
                            setAccountSize
                          }
                        />

                        <div>
                          <label className="block">
                            <span className="mb-1.5 block text-[10px] font-medium text-white/50">
                              Default Risk per
                              Trade
                            </span>

                            <div className="relative">
                              <input
                                value={
                                  riskPerTrade
                                }
                                onChange={(
                                  event
                                ) =>
                                  setRiskPerTrade(
                                    event
                                      .target
                                      .value
                                  )
                                }
                                className="h-[38px] w-full rounded-[9px] border border-white/[0.07] bg-[#141414] px-3 pr-8 text-[11px] text-white/70 outline-none focus:border-white/25 focus:bg-[#181818]"
                              />

                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/30">
                                %
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <div className="mb-1">
                          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-white/25">
                            Trading Profile
                          </p>
                        </div>

                        <div className="rounded-[11px] border border-white/[0.08] bg-white/[0.018] p-3.5">
                          <p className="text-[10px] font-medium text-white/65">
                            {tradingStyle}
                          </p>

                          <p className="mt-1 text-[9px] leading-4 text-white/25">
                            Your trading preferences
                            help TradeMirror tailor
                            your journal and
                            analytics experience.
                          </p>
                        </div>

                        <div className="rounded-[11px] border border-white/[0.045] bg-white/[0.012] p-3.5">
                          <p className="text-[10px] font-medium text-white/55">
                            Default setup
                          </p>

                          <p className="mt-1 text-[9px] text-white/25">
                            Futures ·{" "}
                            {defaultMarket}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <div className="flex flex-col items-stretch justify-between gap-3 rounded-[13px] border border-white/[0.055] bg-white/[0.012] p-3.5 sm:flex-row sm:items-center">
                  <p
                    className={`text-[9px] ${
                      message
                        ? "text-white/75"
                        : "text-transparent"
                    }`}
                  >
                    {message || "Saved"}
                  </p>

                  <button
                    type="button"
                    onClick={
                      saveProfile
                    }
                    disabled={saving}
                    className="h-[34px] w-full cursor-pointer rounded-[8px] bg-white px-5 text-[10px] font-semibold text-black shadow-[0_7px_20px_rgba(255,255,255,0.05)] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* JOURNAL */}
            {activeTab === "Journal" && (
              <div className="space-y-3.5 xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-4 xl:space-y-0">
                <SectionCard title="Journal Preferences">
                  <div className="grid grid-cols-1 gap-5 px-4 pb-4 pt-4 sm:grid-cols-2 sm:px-5 sm:pb-5">
                    <div className="space-y-4">
                      <div>
                        <p className="mb-1.5 text-[10px] font-medium text-white/50">
                          Default Setup Tags
                        </p>

                        <div className="flex min-h-[38px] flex-wrap items-center gap-1.5 rounded-[9px] border border-white/[0.07] bg-[#141414] px-2 py-1.5">
                          {[
                            "FVG",
                            "Liquidity Sweep",
                            "CISD",
                          ].map(
                            (tag) => (
                              <span
                                key={tag}
                                className="rounded-[5px] bg-white/[0.05] px-2 py-1 text-[9px] text-white/50"
                              >
                                {tag}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      <SelectField
                        label="Trade Review Template"
                        value={
                          reviewTemplate
                        }
                        onChange={
                          setReviewTemplate
                        }
                        options={[
                          "Standard",
                          "Detailed",
                          "Minimal",
                        ]}
                      />
                    </div>

                    <div className="space-y-4">
                      <SelectField
                        label="Grade Scale"
                        value={
                          gradeScale
                        }
                        onChange={
                          setGradeScale
                        }
                        options={[
                          "A+ → F",
                          "A → F",
                          "1 → 10",
                        ]}
                      />

                      <SelectField
                        label="Default Trade Status"
                        value={
                          tradeStatus
                        }
                        onChange={
                          setTradeStatus
                        }
                        options={[
                          "Review Later",
                          "Reviewed",
                          "Complete",
                        ]}
                      />
                    </div>
                  </div>
                </SectionCard>

                <div className="space-y-3.5">
                  <SectionCard title="Journal Overview">
                    <div className="px-4 pb-4 pt-3 sm:px-5">
                      <SmallInfoRow
                        label="Entries"
                        value={String(
                          tradeCount
                        )}
                      />

                      <SmallInfoRow
                        label="Review Template"
                        value={
                          reviewTemplate
                        }
                      />

                      <SmallInfoRow
                        label="Grade Scale"
                        value={
                          gradeScale
                        }
                      />

                      <SmallInfoRow
                        label="Default Status"
                        value={
                          tradeStatus
                        }
                      />
                    </div>
                  </SectionCard>

                  <SectionCard title="Journal Philosophy">
                    <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
                      <p className="text-[10px] leading-5 text-white/30">
                        A journal should help you
                        understand why you traded,
                        how you executed, and what
                        you can improve — not simply
                        record the result.
                      </p>
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}

            {/* PRIVACY */}
            {activeTab === "Privacy" && (
              <div className="space-y-3.5 xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-4 xl:space-y-0">
                <SectionCard title="Privacy & Visibility">
                  <div className="space-y-2.5 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                    <PreferenceToggle
                      title="Public Profile"
                      description="Allow other traders to discover your profile."
                      enabled={isPublic}
                      onChange={() =>
                        setIsPublic(
                          !isPublic
                        )
                      }
                    />

                    <PreferenceToggle
                      title="Show P&L"
                      description="Display your performance results on your public profile."
                      enabled={showPnl}
                      onChange={() =>
                        setShowPnl(
                          !showPnl
                        )
                      }
                    />

                    <PreferenceToggle
                      title="Show Trades"
                      description="Allow visitors to see your shared trades."
                      enabled={showTrades}
                      onChange={() =>
                        setShowTrades(
                          !showTrades
                        )
                      }
                    />

                    <PreferenceToggle
                      title="Show Analytics"
                      description="Display your trading analytics publicly."
                      enabled={showAnalytics}
                      onChange={() =>
                        setShowAnalytics(
                          !showAnalytics
                        )
                      }
                    />

                    <PreferenceToggle
                      title="Show Email Address"
                      description="Display your email address on your public profile."
                      enabled={showEmail}
                      onChange={() =>
                        setShowEmail(
                          !showEmail
                        )
                      }
                    />

                    <div className="flex flex-col-reverse gap-3 border-t border-white/[0.045] pt-3 sm:flex-row sm:items-center sm:justify-between">
                      <p
                        className={`text-[9px] ${
                          message
                            ? "text-white/75"
                            : "text-transparent"
                        }`}
                      >
                        {message ||
                          "Saved"}
                      </p>

                      <button
                        type="button"
                        onClick={
                          saveProfile
                        }
                        disabled={saving}
                        className="h-[34px] w-full cursor-pointer rounded-[8px] bg-white px-5 text-[10px] font-semibold text-black shadow-[0_7px_20px_rgba(255,255,255,0.05)] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        {saving
                          ? "Saving..."
                          : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Privacy Summary">
                  <div className="px-4 pb-4 pt-3 sm:px-5">
                    <SmallInfoRow
                      label="Profile"
                      value={
                        isPublic
                          ? "Public"
                          : "Private"
                      }
                    />

                    <SmallInfoRow
                      label="P&L"
                      value={
                        showPnl
                          ? "Visible"
                          : "Hidden"
                      }
                    />

                    <SmallInfoRow
                      label="Trades"
                      value={
                        showTrades
                          ? "Visible"
                          : "Hidden"
                      }
                    />

                    <SmallInfoRow
                      label="Analytics"
                      value={
                        showAnalytics
                          ? "Visible"
                          : "Hidden"
                      }
                    />

                    <SmallInfoRow
                      label="Email"
                      value={
                        showEmail
                          ? "Visible"
                          : "Hidden"
                      }
                    />
                  </div>
                </SectionCard>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === "Notifications" && (
              <div className="space-y-3.5 xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-4 xl:space-y-0">
                <SectionCard title="Notification Preferences">
                  <div className="space-y-2.5 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                    <PreferenceToggle
                      title="Email Notifications"
                      description="Receive important account and product updates."
                      enabled={
                        emailNotifications
                      }
                      onChange={() =>
                        setEmailNotifications(
                          !emailNotifications
                        )
                      }
                    />

                    <PreferenceToggle
                      title="Weekly Performance Summary"
                      description="Receive a weekly overview of your trading performance."
                      enabled={
                        weeklySummary
                      }
                      onChange={() =>
                        setWeeklySummary(
                          !weeklySummary
                        )
                      }
                    />

                    <PreferenceToggle
                      title="Trade Reminders"
                      description="Get reminders to journal and review your trades."
                      enabled={
                        tradeReminders
                      }
                      onChange={() =>
                        setTradeReminders(
                          !tradeReminders
                        )
                      }
                    />

                    <PreferenceToggle
                      title="Community Activity"
                      description="Get notified about activity around your public profile."
                      enabled={
                        communityActivity
                      }
                      onChange={() =>
                        setCommunityActivity(
                          !communityActivity
                        )
                      }
                    />
                  </div>
                </SectionCard>

                <SectionCard title="Notification Status">
                  <div className="px-4 pb-4 pt-3 sm:px-5">
                    <SmallInfoRow
                      label="Email"
                      value={
                        emailNotifications
                          ? "Enabled"
                          : "Disabled"
                      }
                    />

                    <SmallInfoRow
                      label="Weekly Summary"
                      value={
                        weeklySummary
                          ? "Enabled"
                          : "Disabled"
                      }
                    />

                    <SmallInfoRow
                      label="Reminders"
                      value={
                        tradeReminders
                          ? "Enabled"
                          : "Disabled"
                      }
                    />

                    <SmallInfoRow
                      label="Community"
                      value={
                        communityActivity
                          ? "Enabled"
                          : "Disabled"
                      }
                    />
                  </div>
                </SectionCard>
              </div>
            )}

            {/* PLAN */}
            {activeTab === "Plan" && (
              <div className="space-y-3.5 xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-4 xl:space-y-0">
                <SectionCard title="Your Plan">
                  <div className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                    <div className="relative overflow-hidden rounded-[14px] border border-white/[0.12] bg-gradient-to-br from-[#171717] via-[#111111] to-[#0a0a0a] p-4 sm:p-5">
                      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/[0.04] blur-3xl" />

                      <div className="relative">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[9px] uppercase tracking-[0.14em] text-white/60">
                              Current Plan
                            </p>

                            <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-white/90">
                              {isPro
                                ? "Pro"
                                : "Free"}
                            </h2>
                          </div>

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.06]">
                            <Zap
                              className="h-4 w-4 text-white"
                              strokeWidth={
                                1.7
                              }
                            />
                          </div>
                        </div>

                        <div className="mt-5 space-y-2.5">
                          {(
                            isPro
                              ? [
                                  "Trading journal",
                                  "Advanced analytics",
                                  "Tax Center",
                                  "AI Weekly Overview",
                                  "Performance calendar",
                                  "Discovery",
                                ]
                              : [
                                  "Trading journal",
                                  "Basic analytics",
                                  "Performance calendar",
                                  "Basic discovery",
                                ]
                          ).map(
                            (feature) => (
                              <div
                                key={
                                  feature
                                }
                                className="flex items-center gap-2"
                              >
                                <Check className="h-3.5 w-3.5 text-white/75" />

                                <span className="text-[10px] text-white/45">
                                  {feature}
                                </span>
                              </div>
                            )
                          )}
                        </div>

                        {!isPro && (
                          <button
                            type="button"
                            onClick={() =>
                              (window.location.href =
                                "/pricing")
                            }
                            className="mt-5 h-[35px] w-full cursor-pointer rounded-[8px] bg-white px-5 text-[10px] font-semibold text-black shadow-[0_8px_25px_rgba(255,255,255,0.06)] transition hover:bg-white/90 sm:w-auto"
                          >
                            Explore Pro
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <div className="space-y-3.5">
                  <SectionCard title="Plan Details">
                    <div className="px-4 pb-4 pt-3 sm:px-5">
                      <SmallInfoRow
                        label="Plan"
                        value={
                          accountType
                        }
                      />

                      <SmallInfoRow
                        label="Trades Logged"
                        value={String(
                          tradeCount
                        )}
                      />

                      <SmallInfoRow
                        label="Status"
                        value="Active"
                      />
                    </div>
                  </SectionCard>

                  <SectionCard title="TradeMirror Pro">
                    <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
                      <p className="text-[10px] leading-5 text-white/30">
                        Unlock deeper analytics,
                        advanced reports, AI-powered
                        reviews, and additional
                        TradeMirror tools.
                      </p>
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}