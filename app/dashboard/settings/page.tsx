
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

const inputClass =
  "h-10 w-full rounded-xl border border-white/[0.08] bg-[#141414] px-3.5 text-[12px] text-white/85 outline-none transition duration-200 placeholder:text-white/25 hover:border-white/[0.15] focus:border-white/30 focus:bg-[#181818] focus:ring-2 focus:ring-white/[0.04] disabled:cursor-not-allowed disabled:opacity-45";

const buttonSecondary =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.035] px-3.5 text-[11px] font-medium text-white/65 transition duration-200 hover:border-white/[0.16] hover:bg-white/[0.075] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-40";

const buttonPrimary =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-xl bg-white px-5 text-[11px] font-semibold text-black transition duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101010] disabled:cursor-not-allowed disabled:opacity-50";

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
      className={`overflow-hidden rounded-2xl border border-white/[0.075] bg-[#101010] shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${className}`}
    >
      <div className="px-4 pt-4 sm:px-5 sm:pt-5">
        <h2 className="text-[13px] font-semibold tracking-[-0.025em] text-white/90 sm:text-sm">
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
    <label className="block min-w-0">
      <span className="mb-2 block text-[11px] font-medium text-white/50">
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
            className="min-h-[92px] w-full resize-y rounded-xl border border-white/[0.08] bg-[#141414] px-3.5 py-3 text-xs leading-5 text-white/85 outline-none transition duration-200 placeholder:text-white/25 hover:border-white/[0.15] focus:border-white/30 focus:bg-[#181818] focus:ring-2 focus:ring-white/[0.04] disabled:cursor-not-allowed disabled:opacity-45"
          />
          <div className="mt-1.5 text-right text-[9px] tabular-nums text-white/25">
            {value.length}/160
          </div>
        </>
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClass}
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
    <label className="block min-w-0">
      {label && (
        <span className="mb-2 block text-[11px] font-medium text-white/50">
          {label}
        </span>
      )}

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} cursor-pointer appearance-none pr-10`}
        >
          {options.map((option) => (
            <option key={option} value={option} className="bg-[#141414] text-white">
              {option}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
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
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      disabled={disabled}
      className={`relative h-[25px] w-[44px] shrink-0 rounded-full transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101010] disabled:cursor-not-allowed disabled:opacity-40 ${
        enabled ? "bg-white" : "bg-white/[0.13]"
      }`}
    >
      <span
        className={`absolute top-[3px] h-[19px] w-[19px] rounded-full shadow-sm transition-all duration-200 ${
          enabled ? "left-[22px] bg-black" : "left-[3px] bg-white/85"
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
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.055] bg-white/[0.015] p-4 transition-colors hover:bg-white/[0.025]">
      <div className="min-w-0">
        <p className="text-xs font-medium text-white/80">{title}</p>
        <p className="mt-1.5 text-[10px] leading-4 text-white/40">
          {description}
        </p>
      </div>
      <Toggle enabled={enabled} onChange={onChange} disabled={disabled} />
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
    <div className="flex min-w-0 items-center justify-between gap-4 border-b border-white/[0.055] py-3 last:border-0">
      <span className="shrink-0 text-[10px] text-white/40">{label}</span>
      <span className="max-w-[60%] truncate text-right text-[11px] font-medium text-white/75">
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
      className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.065] bg-white/[0.015] p-3.5 text-left transition duration-200 hover:border-white/[0.12] hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] transition group-hover:bg-white/[0.07]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-white/80">{title}</p>
        <p className="mt-1 text-[10px] leading-4 text-white/40">
          {description}
        </p>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-white/60" />
    </button>
  );
}

function SaveBar({
  message,
  saving,
  onSave,
}: {
  message: string;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.065] bg-[#101010] p-4 sm:flex-row sm:items-center sm:justify-between">
      <p
        aria-live="polite"
        className={`min-h-4 text-[11px] ${
          message ? "text-white/65" : "text-transparent"
        }`}
      >
        {message || " "}
      </p>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className={buttonPrimary}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
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

  const [tradingStyle, setTradingStyle] = useState("Intraday");
  const [experienceLevel, setExperienceLevel] = useState("Intermediate");

  const [isPublic, setIsPublic] = useState(false);
  const [showPnl, setShowPnl] = useState(true);
  const [showTrades, setShowTrades] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(true);

  const [defaultMarket, setDefaultMarket] = useState("Futures");
  const [accountSize, setAccountSize] = useState("$50,000");
  const [riskPerTrade, setRiskPerTrade] = useState("1.00");

  const [reviewTemplate, setReviewTemplate] = useState("Standard");
  const [gradeScale, setGradeScale] = useState("A+ → F");
  const [tradeStatus, setTradeStatus] = useState("Review Later");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [tradeReminders, setTradeReminders] = useState(true);
  const [communityActivity, setCommunityActivity] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const [tradeCount, setTradeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (cancelled) return;

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

        if (cancelled) return;

        if (profileData) {
          setProfile(profileData);
          setDisplayName(profileData.display_name ?? "");
          setUsername(profileData.username ?? "");
          setBio(profileData.bio ?? "");
          setTradingStyle(profileData.trading_style ?? "Intraday");
          setExperienceLevel(profileData.experience_level ?? "Intermediate");
          setIsPublic(profileData.is_public ?? false);
          setShowPnl(profileData.show_pnl ?? true);
          setShowTrades(profileData.show_trades ?? true);
          setShowAnalytics(profileData.show_analytics ?? true);
        }

        const { count } = await supabase
          .from("trades")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (cancelled) return;
        setTradeCount(count ?? 0);
      } catch (error) {
        console.error("SETTINGS LOAD ERROR:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  async function saveProfile() {
    setSaving(true);
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please log in again.");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim() || null,
          username: username.trim().replace(/^@/, "") || null,
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
        console.error("PROFILE UPDATE ERROR:", error.message);
        setMessage("Couldn't save changes.");
        return;
      }

      setProfile(data);
      setMessage("Changes saved.");
    } catch (error) {
      console.error("PROFILE SAVE ERROR:", error);
      setMessage("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Profile photos must be under 5 MB.");
      return;
    }

    setUploadingPhoto(true);
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please log in again.");
        return;
      }

      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("AVATAR UPLOAD ERROR:", uploadError.message);
        setMessage("Couldn't upload photo.");
        return;
      }

      const { data: publicData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = `${publicData.publicUrl}?v=${Date.now()}`;

      const { data, error: profileError } = await supabase
        .from("profiles")
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (profileError) {
        console.error("AVATAR PROFILE UPDATE ERROR:", profileError.message);
        setMessage("Photo uploaded, but profile couldn't be updated.");
        return;
      }

      setProfile(data);
      setMessage("Profile photo updated.");

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("AVATAR ERROR:", error);
      setMessage("Something went wrong while uploading the photo.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function resetPassword() {
    if (!email) return;

    setMessage("");
    setPasswordResetSent(false);

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setMessage("Couldn't send the password reset email.");
      return;
    }

    setPasswordResetSent(true);
    setMessage("Password reset email sent.");
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
      .order("trade_date", { ascending: false });

    if (error) {
      console.error("EXPORT ERROR:", error.message);
      setMessage("Couldn't export your trades.");
      return;
    }

    if (!data || data.length === 0) {
      setMessage("You don't have any trades to export yet.");
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
      if (value === null || value === undefined) return "";

      const stringValue = String(value);

      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n") ||
        stringValue.includes("\r")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    };

    const csv = [
      columns.join(","),
      ...data.map((trade) =>
        columns
          .map((column) =>
            escapeCsv((trade as Record<string, unknown>)[column])
          )
          .join(",")
      ),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `trademirror-trades-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setMessage("Trades exported successfully.");
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
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" />
          <p className="mt-4 text-xs text-white/40">Loading settings...</p>
        </div>
      </main>
    );
  }

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const isPro = profile?.plan === "pro";
  const accountType = isPro ? "Pro" : "Free";

  return (
    <main className="min-h-screen overflow-x-hidden bg-background px-3 py-3 pb-24 text-white sm:px-5 sm:py-5 lg:h-screen lg:overflow-hidden lg:px-6 lg:pb-0">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1600px] flex-col overflow-hidden rounded-[22px] border border-white/[0.075] bg-[#0b0b0b] shadow-[0_20px_70px_rgba(0,0,0,0.2)] sm:min-h-[calc(100vh-40px)] lg:h-full">
        {/* Header */}
        <header className="shrink-0 px-5 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                TRADEMIRROR / PREFERENCES
              </p>
              <h1 className="text-2xl font-semibold tracking-[-0.055em] text-white sm:text-[28px]">
                Settings
              </h1>
              <p className="mt-2 max-w-xl text-xs leading-5 text-white/40 sm:text-[13px]">
                Manage your account, preferences, and journal settings.
              </p>
            </div>

            {isPro && (
              <div className="mt-1 flex shrink-0 items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1.5">
                <Zap className="h-3.5 w-3.5 text-white/80" />
                <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/75">
                  Pro
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Tabs */}
        <nav
          aria-label="Settings sections"
          className="shrink-0 border-y border-white/[0.06] px-3 py-3 sm:px-6"
        >
          <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto">
            {tabs.map((tab) => {
              const active = activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  aria-pressed={active}
                  className={`shrink-0 rounded-full border px-4 py-2.5 text-[11px] font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 ${
                    active
                      ? "border-white bg-white text-black"
                      : "border-transparent bg-white/[0.035] text-white/50 hover:border-white/[0.08] hover:bg-white/[0.07] hover:text-white/85"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-hidden p-3 sm:p-5">
          <div className="h-full min-h-0 overflow-y-auto overscroll-contain pr-1">
            {/* PROFILE */}
            {activeTab === "Profile" && (
              <div className="space-y-4 xl:grid xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-5 xl:space-y-0">
                <div className="space-y-4">
                  <SectionCard title="Profile Information">
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                        <div className="flex shrink-0 flex-col items-center sm:w-[130px]">
                          <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/[0.1] bg-[#1b1b1b] shadow-[0_8px_30px_rgba(0,0,0,0.25)] sm:h-[108px] sm:w-[108px]">
                            {profile?.avatar_url ? (
                              <img
                                src={profile.avatar_url}
                                alt="Profile"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserRound className="h-10 w-10 text-white/30" strokeWidth={1.3} />
                            )}
                          </div>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={uploadAvatar}
                            className="hidden"
                          />

                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingPhoto}
                            className={`${buttonSecondary} mt-3 w-full`}
                          >
                            <Camera className="h-3.5 w-3.5" />
                            {uploadingPhoto ? "Uploading..." : "Change Photo"}
                          </button>

                          <p className="mt-2 text-center text-[10px] text-white/30">
                            PNG, JPG or WebP · 5 MB max
                          </p>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field
                              label="Full Name"
                              value={displayName}
                              onChange={setDisplayName}
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
                              onChange={setUsername}
                              placeholder="username"
                            />
                            <SelectField
                              label="Experience Level"
                              value={experienceLevel}
                              onChange={setExperienceLevel}
                              options={["Beginner", "Intermediate", "Advanced", "Professional"]}
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

                          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <p aria-live="polite" className={`text-[11px] ${message ? "text-white/65" : "text-transparent"}`}>
                              {message || " "}
                            </p>
                            <button
                              type="button"
                              onClick={saveProfile}
                              disabled={saving}
                              className={buttonPrimary}
                            >
                              {saving ? "Saving..." : "Save Changes"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Trading Style">
                    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
                      <SelectField
                        label="Trading Style"
                        value={tradingStyle}
                        onChange={setTradingStyle}
                        options={["Scalping", "Intraday", "Swing", "Position"]}
                      />
                      <div>
                        <p className="mb-2 text-[11px] font-medium text-white/50">Profile Status</p>
                        <div className="flex h-10 items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#141414] px-3.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                          <span className="text-[11px] text-white/60">Account active</span>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </div>

                <div className="space-y-4">
                  <SectionCard title="Profile Preview">
                    <div className="p-4 sm:p-5">
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.04]">
                            {profile?.avatar_url ? (
                              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <UserRound className="h-5 w-5 text-white/30" strokeWidth={1.3} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-white/85">
                              {displayName || "Your Name"}
                            </p>
                            <p className="mt-1 truncate text-[10px] text-white/40">
                              @{username.replace(/^@/, "") || "trader"}
                            </p>
                          </div>
                        </div>
                        <p className="mt-4 min-h-10 whitespace-pre-wrap break-words text-[11px] leading-5 text-white/45">
                          {bio || "Your profile bio will appear here."}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-lg border border-white/[0.06] bg-white/[0.05] px-2.5 py-1.5 text-[10px] text-white/70">
                            {tradingStyle}
                          </span>
                          <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5 text-[10px] text-white/45">
                            {experienceLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Account Summary">
                    <div className="px-4 pb-3 pt-2 sm:px-5">
                      <SmallInfoRow label="Member Since" value={memberSince} />
                      <SmallInfoRow label="Email" value={email || "—"} />
                      <SmallInfoRow label="Account Type" value={accountType} />
                      <SmallInfoRow label="Trades Logged" value={String(tradeCount)} />
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}

            {/* ACCOUNT */}
            {activeTab === "Account" && (
              <div className="space-y-4 xl:grid xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-5 xl:space-y-0">
                <div className="space-y-4">
                  <SectionCard title="Account Information">
                    <div className="space-y-4 p-4 sm:p-5">
                      <Field label="Email Address" value={email} onChange={() => {}} disabled />
                      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                        <div className="flex items-center gap-2.5">
                          <Check className="h-4 w-4 text-white/75" />
                          <span className="text-[11px] font-medium text-white/70">Email verified</span>
                        </div>
                        <p className="mt-2 pl-6 text-[10px] leading-4 text-white/40">
                          Your email address is verified and ready to use.
                        </p>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Security">
                    <div className="space-y-3 p-4 sm:p-5">
                      <SettingButton
                        icon={<Shield className="h-4 w-4 text-white/60" />}
                        title="Change Password"
                        description="Send a secure password reset link to your email."
                        onClick={resetPassword}
                      />
                      {passwordResetSent && (
                        <p className="px-1 text-[11px] text-white/65" aria-live="polite">
                          Password reset email sent.
                        </p>
                      )}
                    </div>
                  </SectionCard>

                  <section className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#101010]">
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4 text-white/40" />
                        <h2 className="text-sm font-semibold text-white/80">Danger Zone</h2>
                      </div>
                      <p className="mt-3 text-xs font-medium text-white/70">Delete Account</p>
                      <p className="mt-1.5 text-[11px] leading-5 text-white/40">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <button type="button" disabled className={`${buttonSecondary} mt-4 w-full`}>
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete My Account
                      </button>
                    </div>
                  </section>
                </div>

                <div className="space-y-4">
                  <SectionCard title="Account Summary">
                    <div className="px-4 pb-3 pt-2 sm:px-5">
                      <SmallInfoRow label="Member Since" value={memberSince} />
                      <SmallInfoRow label="Email" value={email || "—"} />
                      <SmallInfoRow label="Account Type" value={accountType} />
                      <SmallInfoRow label="Trades Logged" value={String(tradeCount)} />
                    </div>
                  </SectionCard>

                  <SectionCard title="Export Data">
                    <div className="space-y-3 p-4 sm:p-5">
                      <p className="text-[11px] leading-5 text-white/40">
                        Download a copy of your TradeMirror trade history.
                      </p>
                      <button type="button" onClick={exportTrades} className={`${buttonSecondary} w-full justify-between`}>
                        Export Trades (CSV)
                        <Download className="h-4 w-4 text-white/45" />
                      </button>
                      <button type="button" disabled className={`${buttonSecondary} w-full justify-between`}>
                        Export Journal (PDF)
                        <Download className="h-4 w-4 text-white/25" />
                      </button>
                      <button type="button" disabled className={`${buttonSecondary} w-full justify-between`}>
                        Export Analytics (CSV)
                        <Download className="h-4 w-4 text-white/25" />
                      </button>
                      {message && <p className="text-[11px] text-white/65" aria-live="polite">{message}</p>}
                    </div>
                  </SectionCard>

                  <SectionCard title="Quick Actions">
                    <div className="space-y-3 p-4 sm:p-5">
                      <SettingButton icon={<Download className="h-4 w-4 text-white/55" />} title="Import Trades" description="Import trades from CSV or Excel." />
                      <SettingButton icon={<RotateCcw className="h-4 w-4 text-white/55" />} title="Reset Onboarding" description="Restart the onboarding experience." />
                      <SettingButton icon={<Mail className="h-4 w-4 text-white/55" />} title="Contact Support" description="Get help from our support team." />
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}

            {/* TRADING */}
            {activeTab === "Trading" && (
              <div className="space-y-4">
                <SectionCard title="Trading Preferences">
                  <div className="grid grid-cols-1 gap-6 p-4 sm:p-5 lg:grid-cols-2 lg:gap-8">
                    <div className="space-y-5">
                      <SelectField label="Default Market" value={defaultMarket} onChange={setDefaultMarket} options={["Futures", "Stocks", "Options", "Forex", "Crypto"]} />

                      <div>
                        <p className="mb-2 text-[11px] font-medium text-white/50">Default Instruments</p>
                        <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-xl border border-white/[0.08] bg-[#141414] px-3 py-2">
                          {["NQ", "ES", "MNQ"].map((instrument) => (
                            <span key={instrument} className="rounded-lg border border-white/[0.07] bg-white/[0.045] px-2.5 py-1.5 text-[10px] font-medium text-white/65">
                              {instrument}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Field label="Default Account Size" value={accountSize} onChange={setAccountSize} />

                      <label className="block">
                        <span className="mb-2 block text-[11px] font-medium text-white/50">Default Risk per Trade</span>
                        <div className="relative">
                          <input
                            value={riskPerTrade}
                            onChange={(event) => setRiskPerTrade(event.target.value)}
                            inputMode="decimal"
                            className={`${inputClass} pr-9`}
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-white/35">%</span>
                        </div>
                      </label>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">Trading Profile</p>
                      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                        <p className="text-xs font-medium text-white/75">{tradingStyle}</p>
                        <p className="mt-2 text-[11px] leading-5 text-white/40">
                          Your trading preferences help TradeMirror tailor your journal and analytics experience.
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
                        <p className="text-[11px] font-medium text-white/60">Default setup</p>
                        <p className="mt-1.5 text-[11px] text-white/35">Futures · {defaultMarket}</p>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SaveBar message={message} saving={saving} onSave={saveProfile} />
              </div>
            )}

            {/* JOURNAL */}
            {activeTab === "Journal" && (
              <div className="space-y-4 xl:grid xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-5 xl:space-y-0">
                <SectionCard title="Journal Preferences">
                  <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 sm:p-5">
                    <div className="space-y-5">
                      <div>
                        <p className="mb-2 text-[11px] font-medium text-white/50">Default Setup Tags</p>
                        <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-xl border border-white/[0.08] bg-[#141414] px-3 py-2">
                          {["FVG", "Liquidity Sweep", "CISD"].map((tag) => (
                            <span key={tag} className="rounded-lg border border-white/[0.06] bg-white/[0.045] px-2.5 py-1.5 text-[10px] text-white/55">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <SelectField label="Trade Review Template" value={reviewTemplate} onChange={setReviewTemplate} options={["Standard", "Detailed", "Minimal"]} />
                    </div>
                    <div className="space-y-5">
                      <SelectField label="Grade Scale" value={gradeScale} onChange={setGradeScale} options={["A+ → F", "A → F", "1 → 10"]} />
                      <SelectField label="Default Trade Status" value={tradeStatus} onChange={setTradeStatus} options={["Review Later", "Reviewed", "Complete"]} />
                    </div>
                  </div>
                </SectionCard>

                <div className="space-y-4">
                  <SectionCard title="Journal Overview">
                    <div className="px-4 pb-3 pt-2 sm:px-5">
                      <SmallInfoRow label="Entries" value={String(tradeCount)} />
                      <SmallInfoRow label="Review Template" value={reviewTemplate} />
                      <SmallInfoRow label="Grade Scale" value={gradeScale} />
                      <SmallInfoRow label="Default Status" value={tradeStatus} />
                    </div>
                  </SectionCard>
                  <SectionCard title="Journal Philosophy">
                    <div className="p-4 sm:p-5">
                      <p className="text-[11px] leading-5 text-white/40">
                        A journal should help you understand why you traded, how you executed, and what you can improve — not simply record the result.
                      </p>
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}

            {/* PRIVACY */}
            {activeTab === "Privacy" && (
              <div className="space-y-4 xl:grid xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-5 xl:space-y-0">
                <SectionCard title="Privacy & Visibility">
                  <div className="space-y-3 p-4 sm:p-5">
                    <PreferenceToggle title="Public Profile" description="Allow other traders to discover your profile." enabled={isPublic} onChange={() => setIsPublic(!isPublic)} />
                    <PreferenceToggle title="Show P&L" description="Display your performance results on your public profile." enabled={showPnl} onChange={() => setShowPnl(!showPnl)} />
                    <PreferenceToggle title="Show Trades" description="Allow visitors to see your shared trades." enabled={showTrades} onChange={() => setShowTrades(!showTrades)} />
                    <PreferenceToggle title="Show Analytics" description="Display your trading analytics publicly." enabled={showAnalytics} onChange={() => setShowAnalytics(!showAnalytics)} />
                    <PreferenceToggle title="Show Email Address" description="Display your email address on your public profile." enabled={showEmail} onChange={() => setShowEmail(!showEmail)} />

                    <div className="border-t border-white/[0.06] pt-4">
                      <SaveBar message={message} saving={saving} onSave={saveProfile} />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Privacy Summary">
                  <div className="px-4 pb-3 pt-2 sm:px-5">
                    <SmallInfoRow label="Profile" value={isPublic ? "Public" : "Private"} />
                    <SmallInfoRow label="P&L" value={showPnl ? "Visible" : "Hidden"} />
                    <SmallInfoRow label="Trades" value={showTrades ? "Visible" : "Hidden"} />
                    <SmallInfoRow label="Analytics" value={showAnalytics ? "Visible" : "Hidden"} />
                    <SmallInfoRow label="Email" value={showEmail ? "Visible" : "Hidden"} />
                  </div>
                </SectionCard>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === "Notifications" && (
              <div className="space-y-4 xl:grid xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-5 xl:space-y-0">
                <SectionCard title="Notification Preferences">
                  <div className="space-y-3 p-4 sm:p-5">
                    <PreferenceToggle title="Email Notifications" description="Receive important account and product updates." enabled={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
                    <PreferenceToggle title="Weekly Performance Summary" description="Receive a weekly overview of your trading performance." enabled={weeklySummary} onChange={() => setWeeklySummary(!weeklySummary)} />
                    <PreferenceToggle title="Trade Reminders" description="Get reminders to journal and review your trades." enabled={tradeReminders} onChange={() => setTradeReminders(!tradeReminders)} />
                    <PreferenceToggle title="Community Activity" description="Get notified about activity around your public profile." enabled={communityActivity} onChange={() => setCommunityActivity(!communityActivity)} />
                  </div>
                </SectionCard>

                <SectionCard title="Notification Status">
                  <div className="px-4 pb-3 pt-2 sm:px-5">
                    <SmallInfoRow label="Email" value={emailNotifications ? "Enabled" : "Disabled"} />
                    <SmallInfoRow label="Weekly Summary" value={weeklySummary ? "Enabled" : "Disabled"} />
                    <SmallInfoRow label="Reminders" value={tradeReminders ? "Enabled" : "Disabled"} />
                    <SmallInfoRow label="Community" value={communityActivity ? "Enabled" : "Disabled"} />
                  </div>
                </SectionCard>
              </div>
            )}

            {/* PLAN */}
            {activeTab === "Plan" && (
              <div className="space-y-4 xl:grid xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-5 xl:space-y-0">
                <SectionCard title="Your Plan">
                  <div className="p-4 sm:p-5">
                    <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-br from-[#191919] via-[#111111] to-[#0b0b0b] p-5 sm:p-6">
                      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/[0.035] blur-3xl" />
                      <div className="relative">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/40">Current Plan</p>
                            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">{isPro ? "Pro" : "Free"}</h2>
                          </div>
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.05]">
                            <Zap className="h-5 w-5 text-white/85" strokeWidth={1.6} />
                          </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {(isPro
                            ? ["Trading journal", "Advanced analytics", "Tax Center", "AI Weekly Overview", "Performance calendar", "Discovery"]
                            : ["Trading journal", "Basic analytics", "Performance calendar", "Basic discovery"]
                          ).map((feature) => (
                            <div key={feature} className="flex items-center gap-2.5">
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.08]">
                                <Check className="h-3 w-3 text-white/75" />
                              </div>
                              <span className="text-[11px] text-white/55">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {!isPro && (
                          <button
                            type="button"
                            onClick={() => (window.location.href = "/pricing")}
                            className={`${buttonPrimary} mt-6`}
                          >
                            Explore Pro <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <div className="space-y-4">
                  <SectionCard title="Plan Details">
                    <div className="px-4 pb-3 pt-2 sm:px-5">
                      <SmallInfoRow label="Plan" value={accountType} />
                      <SmallInfoRow label="Trades Logged" value={String(tradeCount)} />
                      <SmallInfoRow label="Status" value="Active" />
                    </div>
                  </SectionCard>
                  <SectionCard title="TradeMirror Pro">
                    <div className="p-4 sm:p-5">
                      <p className="text-[11px] leading-5 text-white/40">
                        Unlock deeper analytics, advanced reports, AI-powered reviews, and additional TradeMirror tools.
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
