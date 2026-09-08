"use client";

import {
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  Mail,
  RotateCcw,
  Shield,
  Trash2,
  UserRound,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Remove "Integrations" and "Appearance" from settings tabs
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
      className={`overflow-hidden rounded-[13px] border border-white/[0.085] bg-[#0b141e]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_12px_35px_rgba(0,0,0,0.16)] ${className}`}
    >
      <div className="px-5 pt-5">
        <h2 className="text-[14px] font-semibold tracking-[-0.02em] text-white/85">
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
      <span className="mb-2 block text-[11px] font-medium text-white/55">
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
            className="h-[72px] w-full resize-none rounded-[7px] border border-white/[0.07] bg-[#0c1621] px-3 py-2 text-[11px] text-white/75 outline-none placeholder:text-white/20 transition focus:border-blue-400/30 disabled:cursor-not-allowed disabled:opacity-50"
          />

          <div className="mt-1 text-right text-[9px] text-white/25">
            {value.length}/160
          </div>
        </>
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="h-[33px] w-full rounded-[7px] border border-white/[0.07] bg-[#0c1621] px-3 text-[11px] text-white/75 outline-none placeholder:text-white/20 transition focus:border-blue-400/30 disabled:cursor-not-allowed disabled:opacity-50"
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
        <span className="mb-2 block text-[11px] font-medium text-white/55">
          {label}
        </span>
      )}

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-[33px] w-full cursor-pointer appearance-none rounded-[7px] border border-white/[0.07] bg-[#0c1621] px-3 pr-9 text-[11px] text-white/70 outline-none focus:border-blue-400/30"
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
      className={`relative h-[22px] w-[38px] shrink-0 cursor-pointer rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
        enabled
          ? "bg-blue-500 shadow-[0_0_14px_rgba(35,133,245,0.18)]"
          : "bg-white/[0.09]"
      }`}
    >
      <span
        className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
          enabled ? "left-[19px]" : "left-[3px]"
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
    <div className="flex items-center justify-between gap-5">
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-white/65">{title}</p>

        <p className="mt-1 text-[10px] leading-4 text-white/30">
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
    <div className="flex items-center justify-between border-b border-white/[0.045] py-2.5 last:border-0">
      <span className="text-[10px] text-white/40">{label}</span>

      <span className="max-w-[180px] truncate text-[10px] font-medium text-white/70">
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
      className="group flex w-full cursor-pointer items-center gap-3 rounded-[7px] border border-white/[0.07] bg-white/[0.018] p-3 text-left transition hover:bg-white/[0.035] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-white/[0.07] bg-white/[0.025]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-white/70">
          {title}
        </p>

        <p className="mt-1 text-[9px] text-white/30">
          {description}
        </p>
      </div>

      <ArrowRight className="h-3.5 w-3.5 text-white/35 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

export default function SettingsPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState("Profile");

  const [profile, setProfile] = useState<Profile | null>(null);

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const [tradingStyle, setTradingStyle] = useState("Intraday");
  const [experienceLevel, setExperienceLevel] =
    useState("Intermediate");

  const [isPublic, setIsPublic] = useState(false);
  const [showPnl, setShowPnl] = useState(true);
  const [showTrades, setShowTrades] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(true);

  const [defaultMarket, setDefaultMarket] = useState("Futures");
  const [accountSize, setAccountSize] = useState("$50,000");
  const [riskPerTrade, setRiskPerTrade] = useState("1.00");

  const [reviewTemplate, setReviewTemplate] =
    useState("Standard");
  const [gradeScale, setGradeScale] = useState("A+ → F");
  const [tradeStatus, setTradeStatus] =
    useState("Review Later");

  const [emailNotifications, setEmailNotifications] =
    useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [tradeReminders, setTradeReminders] = useState(true);
  const [communityActivity, setCommunityActivity] =
    useState(false);

  const [publicDiscoverable, setPublicDiscoverable] =
    useState(false);
  const [profileVisibility, setProfileVisibility] =
    useState("Public");
  const [showEmail, setShowEmail] = useState(false);

  // Removed compactMode, animations, glassEffects states

  const [tradeCount, setTradeCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [passwordResetSent, setPasswordResetSent] =
    useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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

        setDisplayName(profileData.display_name ?? "");
        setUsername(profileData.username ?? "");
        setBio(profileData.bio ?? "");

        setTradingStyle(
          profileData.trading_style ?? "Intraday"
        );

        setExperienceLevel(
          profileData.experience_level ?? "Intermediate"
        );

        setIsPublic(profileData.is_public ?? false);
        setShowPnl(profileData.show_pnl ?? true);
        setShowTrades(profileData.show_trades ?? true);
        setShowAnalytics(profileData.show_analytics ?? true);
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
  }, []);

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
        display_name: displayName.trim() || null,
        username:
          username.trim().replace(/^@/, "") || null,
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
      setMessage("Profile photos must be under 5 MB.");
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

    const ext = file.name.split(".").pop();

    const filePath = `${user.id}/avatar-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
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

    const avatarUrl = `${publicUrl}?v=${Date.now()}`;

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

    const { error } = await supabase.auth.resetPasswordForEmail(
      email
    );

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
      .order("trade_date", {
        ascending: false,
      });

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
      if (value === null || value === undefined) {
        return "";
      }

      const stringValue = String(value);

      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
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
            escapeCsv(
              (trade as Record<string, unknown>)[column]
            )
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
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
      <main className="flex h-screen items-center justify-center bg-[#03070d] text-white">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-blue-400" />

          <p className="mt-3 text-[11px] text-white/30">
            Loading settings...
          </p>
        </div>
      </main>
    );
  }

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(
        "en-US",
        {
          month: "long",
          day: "numeric",
          year: "numeric",
        }
      )
    : "—";

  return (
    <main className="h-screen overflow-hidden bg-[#03070d] px-4 py-3 text-white lg:px-5">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col overflow-hidden rounded-[12px] border border-white/[0.075] bg-[#060d15]/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">

        {/* HEADER */}

        <header className="shrink-0 px-5 pb-3 pt-4 lg:px-6">
          <h1 className="text-[24px] font-semibold tracking-[-0.045em] text-white/90">
            Settings
          </h1>

          <p className="mt-1 text-[12px] text-white/35">
            Manage your account, preferences, and journal
            settings.
          </p>
        </header>

        {/* TABS */}

        <div className="shrink-0 border-b border-white/[0.055] px-5 lg:px-6">
          <div className="flex h-[43px] items-end gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const active = activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={`relative h-full shrink-0 cursor-pointer px-3 text-[11px] font-medium transition-colors ${
                    active
                      ? "text-blue-400"
                      : "text-white/40 hover:text-white/65"
                  }`}
                >
                  {tab}

                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-blue-500 shadow-[0_0_10px_rgba(35,133,245,0.45)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}

        <div className="min-h-0 flex-1 overflow-hidden p-3 lg:p-4">
          <div className="h-full min-h-0 overflow-y-auto pr-1">

            {/* PROFILE */}

            {activeTab === "Profile" && (
              <div className="grid min-h-full grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">

                <div className="space-y-3">
                  <SectionCard title="Profile Information">
                    <div className="grid grid-cols-[125px_minmax(0,1fr)] gap-7 px-5 pb-5 pt-4">
                      <div className="flex flex-col items-center">
                        <div className="relative flex h-[108px] w-[108px] items-center justify-center overflow-hidden rounded-full border border-white/[0.10] bg-gradient-to-br from-[#3c4855] via-[#202a35] to-[#080d13] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_12px_30px_rgba(0,0,0,0.3)]">
                          {profile?.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound
                              className="h-12 w-12 text-white/25"
                              strokeWidth={1.2}
                            />
                          )}

                          <div className="pointer-events-none absolute inset-0 bg-blue-400/[0.025]" />
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
                          onClick={() =>
                            fileInputRef.current?.click()
                          }
                          disabled={uploadingPhoto}
                          className="mt-3 flex h-[29px] w-full cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-white/[0.07] bg-white/[0.018] text-[10px] text-white/60 transition hover:bg-white/[0.035] hover:text-white/80 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Camera className="h-3 w-3" />

                          {uploadingPhoto
                            ? "Uploading..."
                            : "Change Photo"}
                        </button>

                        <p className="mt-2 text-center text-[8px] text-white/20">
                          JPG, PNG or WebP · Max 5 MB
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
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
                          options={[
                            "Beginner",
                            "Intermediate",
                            "Advanced",
                            "Professional",
                          ]}
                        />

                        <div className="col-span-2">
                          <Field
                            label="Bio"
                            value={bio}
                            onChange={setBio}
                            placeholder="Tell traders a little about yourself..."
                            textarea
                          />
                        </div>

                        <div className="col-span-2 flex items-center justify-between">
                          <p
                            className={`text-[10px] transition-opacity ${
                              message
                                ? "opacity-100 text-emerald-400"
                                : "opacity-0"
                            }`}
                          >
                            {message}
                          </p>

                          <button
                            type="button"
                            onClick={saveProfile}
                            disabled={saving}
                            className="h-[31px] cursor-pointer rounded-[6px] bg-blue-600 px-5 text-[10px] font-semibold text-white shadow-[0_7px_20px_rgba(35,133,245,0.16)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {saving
                              ? "Saving..."
                              : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Trading Style">
                    <div className="grid grid-cols-2 gap-8 px-5 pb-5 pt-4">
                      <SelectField
                        label="Trading Style"
                        value={tradingStyle}
                        onChange={setTradingStyle}
                        options={[
                          "Scalping",
                          "Intraday",
                          "Swing",
                          "Position",
                        ]}
                      />

                      <div>
                        <p className="mb-2 text-[11px] font-medium text-white/55">
                          Profile Status
                        </p>

                        <div className="flex h-[33px] items-center gap-2 rounded-[7px] border border-white/[0.07] bg-[#0c1621] px-3">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                          <span className="text-[10px] text-white/55">
                            Account active
                          </span>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </div>

                <div className="space-y-3">
                  <SectionCard title="Profile Preview">
                    <div className="px-5 pb-5 pt-3">
                      <div className="rounded-[9px] border border-white/[0.06] bg-white/[0.018] p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.04]">
                            {profile?.avatar_url ? (
                              <img
                                src={profile.avatar_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserRound className="h-5 w-5 text-white/25" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-semibold text-white/75">
                              {displayName || "Your Name"}
                            </p>

                            <p className="mt-0.5 truncate text-[9px] text-white/30">
                              @{username || "trader"}
                            </p>
                          </div>
                        </div>

                        <p className="mt-4 text-[10px] leading-4 text-white/35">
                          {bio ||
                            "Your profile bio will appear here."}
                        </p>

                        <div className="mt-4 flex gap-2">
                          <span className="rounded-[5px] bg-blue-500/[0.08] px-2 py-1 text-[9px] text-blue-400/75">
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
                    <div className="px-5 pb-4 pt-3">
                      <SmallInfoRow
                        label="Member Since"
                        value={memberSince}
                      />

                      <SmallInfoRow
                        label="Email"
                        value={email || "—"}
                      />

                      <SmallInfoRow
                        label="Account Type"
                        value="Free"
                      />

                      <SmallInfoRow
                        label="Trades Logged"
                        value={String(tradeCount)}
                      />
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}

            {/* ACCOUNT */}

            {activeTab === "Account" && (
              <div className="grid min-h-full grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-3">
                  <SectionCard title="Account Information">
                    <div className="space-y-3 px-5 pb-5 pt-4">
                      <Field
                        label="Email Address"
                        value={email}
                        onChange={() => {}}
                        disabled
                      />

                      <div className="rounded-[7px] border border-white/[0.06] bg-white/[0.018] p-3">
                        <p className="text-[10px] font-medium text-white/65">
                          Email verification
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-400" />

                          <span className="text-[9px] text-white/35">
                            Your email is verified.
                          </span>
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Security">
                    <div className="space-y-2 px-5 pb-5 pt-4">
                      <SettingButton
                        icon={
                          <Shield className="h-3.5 w-3.5 text-white/45" />
                        }
                        title="Change Password"
                        description="Send a secure password reset link to your email."
                        onClick={resetPassword}
                      />

                      {passwordResetSent && (
                        <p className="px-1 text-[9px] text-emerald-400">
                          Password reset email sent.
                        </p>
                      )}
                    </div>
                  </SectionCard>
                </div>

                <div className="space-y-3">
                  <SectionCard title="Account Summary">
                    <div className="px-5 pb-4 pt-3">
                      <SmallInfoRow
                        label="Member Since"
                        value={memberSince}
                      />

                      <SmallInfoRow
                        label="Email"
                        value={email || "—"}
                      />

                      <SmallInfoRow
                        label="Account Type"
                        value="Free"
                      />

                      <SmallInfoRow
                        label="Trades Logged"
                        value={String(tradeCount)}
                      />
                    </div>
                  </SectionCard>

                  <SectionCard title="Export Data">
                    <div className="space-y-2 px-5 pb-4 pt-3">
                      <p className="mb-3 text-[10px] text-white/35">
                        Download your TradeMirror data.
                      </p>

                      <button
                        type="button"
                        onClick={exportTrades}
                        className="flex h-[34px] w-full cursor-pointer items-center justify-between rounded-[7px] border border-white/[0.07] bg-white/[0.018] px-3 text-[10px] text-white/65 transition hover:border-white/[0.12] hover:bg-white/[0.035]"
                      >
                        Export Trades (CSV)

                        <Download className="h-3.5 w-3.5 text-white/45" />
                      </button>

                      <button
                        type="button"
                        disabled
                        className="flex h-[34px] w-full cursor-not-allowed items-center justify-between rounded-[7px] border border-white/[0.07] bg-white/[0.018] px-3 text-[10px] text-white/30"
                      >
                        Export Journal (PDF)

                        <Download className="h-3.5 w-3.5 text-white/25" />
                      </button>

                      <button
                        type="button"
                        disabled
                        className="flex h-[34px] w-full cursor-not-allowed items-center justify-between rounded-[7px] border border-white/[0.07] bg-white/[0.018] px-3 text-[10px] text-white/30"
                      >
                        Export Analytics (CSV)

                        <Download className="h-3.5 w-3.5 text-white/25" />
                      </button>

                      {message && (
                        <p className="pt-2 text-[9px] text-emerald-400">
                          {message}
                        </p>
                      )}
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}

            {/* TRADING */}

            {activeTab === "Trading" && (
              <div className="grid min-h-full grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                <SectionCard title="Trading Preferences">
                  <div className="grid grid-cols-2 gap-8 px-5 pb-5 pt-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-[135px_1fr] items-center gap-3">
                        <span className="text-[10px] text-white/50">
                          Default Market
                        </span>

                        <SelectField
                          label=""
                          value={defaultMarket}
                          onChange={setDefaultMarket}
                          options={[
                            "Futures",
                            "Stocks",
                            "Options",
                            "Forex",
                            "Crypto",
                          ]}
                        />
                      </div>

                      <div className="grid grid-cols-[135px_1fr] items-center gap-3">
                        <span className="text-[10px] text-white/50">
                          Default Instruments
                        </span>

                        <div className="flex h-[33px] items-center gap-2 rounded-[7px] border border-white/[0.07] bg-[#0c1621] px-2">
                          {["NQ", "ES", "MNQ"].map(
                            (instrument) => (
                              <span
                                key={instrument}
                                className="rounded-[5px] bg-white/[0.05] px-2 py-1 text-[9px] text-white/55"
                              >
                                {instrument}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-[135px_1fr] items-center gap-3">
                        <span className="text-[10px] text-white/50">
                          Default Account Size
                        </span>

                        <input
                          value={accountSize}
                          onChange={(event) =>
                            setAccountSize(event.target.value)
                          }
                          className="h-[33px] rounded-[7px] border border-white/[0.07] bg-[#0c1621] px-3 text-[10px] text-white/70 outline-none focus:border-blue-400/30"
                        />
                      </div>

                      <div className="grid grid-cols-[135px_1fr] items-center gap-3">
                        <span className="text-[10px] text-white/50">
                          Default Risk per Trade
                        </span>

                        <div className="relative">
                          <input
                            value={riskPerTrade}
                            onChange={(event) =>
                              setRiskPerTrade(event.target.value)
                            }
                            className="h-[33px] w-full rounded-[7px] border border-white/[0.07] bg-[#0c1621] px-3 text-[10px] text-white/70 outline-none focus:border-blue-400/30"
                          />

                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/35">
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <PreferenceToggle
                        title="Public Profile"
                        description="Allow other traders to discover your profile."
                        enabled={isPublic}
                        onChange={() =>
                          setIsPublic(!isPublic)
                        }
                      />

                      <PreferenceToggle
                        title="Show P&L"
                        description="Allow your public profile to display P&L."
                        enabled={showPnl}
                        onChange={() =>
                          setShowPnl(!showPnl)
                        }
                      />

                      <PreferenceToggle
                        title="Show Trades"
                        description="Allow your public profile to display trades."
                        enabled={showTrades}
                        onChange={() =>
                          setShowTrades(!showTrades)
                        }
                      />

                      <PreferenceToggle
                        title="Show Analytics"
                        description="Allow your public profile to display analytics."
                        enabled={showAnalytics}
                        onChange={() =>
                          setShowAnalytics(!showAnalytics)
                        }
                      />

                      <div className="flex items-center justify-between pt-1">
                        <p
                          className={`text-[10px] ${
                            message
                              ? "text-emerald-400"
                              : "text-transparent"
                          }`}
                        >
                          {message || "Saved"}
                        </p>

                        <button
                          type="button"
                          onClick={saveProfile}
                          disabled={saving}
                          className="h-[29px] cursor-pointer rounded-[6px] bg-blue-600 px-5 text-[10px] font-semibold text-white shadow-[0_7px_20px_rgba(35,133,245,0.16)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {saving
                            ? "Saving..."
                            : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Trading Style">
                  <div className="space-y-4 px-5 pb-5 pt-4">
                    <SelectField
                      label="Trading Style"
                      value={tradingStyle}
                      onChange={setTradingStyle}
                      options={[
                        "Scalping",
                        "Intraday",
                        "Swing",
                        "Position",
                      ]}
                    />

                    <div className="rounded-[8px] border border-blue-500/10 bg-blue-500/[0.025] p-3">
                      <p className="text-[10px] font-medium text-blue-400/80">
                        Your trading setup
                      </p>

                      <p className="mt-1.5 text-[9px] leading-4 text-white/30">
                        TradeMirror will use these preferences
                        when building future analytics and journal
                        workflows.
                      </p>
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* JOURNAL */}

            {activeTab === "Journal" && (
              <div className="grid min-h-full grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                <SectionCard title="Journal Preferences">
                  <div className="grid grid-cols-2 gap-8 px-5 pb-5 pt-4">
                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-[10px] font-medium text-white/55">
                          Default Setup Tags
                        </p>

                        <div className="flex h-[34px] items-center gap-1.5 rounded-[7px] border border-white/[0.07] bg-[#0c1621] px-2">
                          {[
                            "FVG",
                            "Liquidity Sweep",
                            "CISD",
                          ].map((tag) => (
                            <span
                              key={tag}
                              className="rounded-[5px] bg-white/[0.05] px-2 py-1 text-[9px] text-white/50"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <SelectField
                        label="Trade Review Template"
                        value={reviewTemplate}
                        onChange={setReviewTemplate}
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
                        value={gradeScale}
                        onChange={setGradeScale}
                        options={[
                          "A+ → F",
                          "A → F",
                          "1 → 10",
                        ]}
                      />

                      <SelectField
                        label="Default Trade Status"
                        value={tradeStatus}
                        onChange={setTradeStatus}
                        options={[
                          "Review Later",
                          "Reviewed",
                          "Complete",
                        ]}
                      />
                    </div>
                  </div>
                </SectionCard>

                <div className="space-y-3">
                  <SectionCard title="Journal Overview">
                    <div className="px-5 pb-4 pt-3">
                      <SmallInfoRow
                        label="Entries"
                        value={String(tradeCount)}
                      />

                      <SmallInfoRow
                        label="Review Template"
                        value={reviewTemplate}
                      />

                      <SmallInfoRow
                        label="Grade Scale"
                        value={gradeScale}
                      />

                      <SmallInfoRow
                        label="Default Status"
                        value={tradeStatus}
                      />
                    </div>
                  </SectionCard>

                  <SectionCard title="Journal Philosophy">
                    <div className="px-5 pb-5 pt-3">
                      <p className="text-[10px] leading-5 text-white/35">
                        A journal should help you understand why
                        you traded, how you executed, and what you
                        can improve—not simply record the result.
                      </p>
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}

            {/* PRIVACY */}

            {activeTab === "Privacy" && (
              <div className="grid min-h-full grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                <SectionCard title="Privacy & Visibility">
                  <div className="space-y-5 px-5 pb-5 pt-4">
                    <PreferenceToggle
                      title="Public Profile"
                      description="Allow other traders to discover your profile."
                      enabled={isPublic}
                      onChange={() =>
                        setIsPublic(!isPublic)
                      }
                    />

                    <PreferenceToggle
                      title="Show P&L"
                      description="Display your performance results on your public profile."
                      enabled={showPnl}
                      onChange={() =>
                        setShowPnl(!showPnl)
                      }
                    />

                    <PreferenceToggle
                      title="Show Trades"
                      description="Allow visitors to see your shared trades."
                      enabled={showTrades}
                      onChange={() =>
                        setShowTrades(!showTrades)
                      }
                    />

                    <PreferenceToggle
                      title="Show Analytics"
                      description="Display your trading analytics publicly."
                      enabled={showAnalytics}
                      onChange={() =>
                        setShowAnalytics(!showAnalytics)
                      }
                    />

                    <PreferenceToggle
                      title="Show Email Address"
                      description="Display your email address on your public profile."
                      enabled={showEmail}
                      onChange={() =>
                        setShowEmail(!showEmail)
                      }
                    />

                    <div className="flex items-center justify-between pt-1">
                      <p
                        className={`text-[10px] ${
                          message
                            ? "text-emerald-400"
                            : "text-transparent"
                        }`}
                      >
                        {message || "Saved"}
                      </p>

                      <button
                        type="button"
                        onClick={saveProfile}
                        disabled={saving}
                        className="h-[29px] cursor-pointer rounded-[6px] bg-blue-600 px-5 text-[10px] font-semibold text-white shadow-[0_7px_20px_rgba(35,133,245,0.16)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving
                          ? "Saving..."
                          : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Privacy Summary">
                  <div className="px-5 pb-4 pt-3">
                    <SmallInfoRow
                      label="Profile"
                      value={
                        isPublic ? "Public" : "Private"
                      }
                    />

                    <SmallInfoRow
                      label="P&L"
                      value={showPnl ? "Visible" : "Hidden"}
                    />

                    <SmallInfoRow
                      label="Trades"
                      value={
                        showTrades ? "Visible" : "Hidden"
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
                  </div>
                </SectionCard>
              </div>
            )}

            {/* NOTIFICATIONS */}

            {activeTab === "Notifications" && (
              <div className="grid min-h-full grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                <SectionCard title="Notification Preferences">
                  <div className="space-y-5 px-5 pb-5 pt-4">
                    <PreferenceToggle
                      title="Email Notifications"
                      description="Receive important account and product updates."
                      enabled={emailNotifications}
                      onChange={() =>
                        setEmailNotifications(
                          !emailNotifications
                        )
                      }
                    />

                    <PreferenceToggle
                      title="Weekly Performance Summary"
                      description="Receive a weekly overview of your trading performance."
                      enabled={weeklySummary}
                      onChange={() =>
                        setWeeklySummary(!weeklySummary)
                      }
                    />

                    <PreferenceToggle
                      title="Trade Reminders"
                      description="Get reminders to journal and review your trades."
                      enabled={tradeReminders}
                      onChange={() =>
                        setTradeReminders(!tradeReminders)
                      }
                    />

                    <PreferenceToggle
                      title="Community Activity"
                      description="Get notified about activity around your public profile."
                      enabled={communityActivity}
                      onChange={() =>
                        setCommunityActivity(
                          !communityActivity
                        )
                      }
                    />
                  </div>
                </SectionCard>

                <SectionCard title="Notification Status">
                  <div className="px-5 pb-4 pt-3">
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
              <div className="grid min-h-full grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                <SectionCard title="Your Plan">
                  <div className="px-5 pb-5 pt-4">
                    <div className="relative overflow-hidden rounded-[11px] border border-blue-500/15 bg-blue-500/[0.025] p-5">
                      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/[0.08] blur-3xl" />

                      <div className="relative">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.14em] text-blue-400/70">
                              Current Plan
                            </p>

                            <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-white/90">
                              Free
                            </h2>
                          </div>

                          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-blue-400/10 bg-blue-400/[0.06]">
                            <Zap className="h-4 w-4 text-blue-400" />
                          </div>
                        </div>

                        <div className="mt-5 space-y-2.5">
                          {[
                            "Trading journal",
                            "Trade analytics",
                            "Performance calendar",
                            "Basic discovery",
                          ].map((feature) => (
                            <div
                              key={feature}
                              className="flex items-center gap-2"
                            >
                              <Check className="h-3.5 w-3.5 text-emerald-400" />

                              <span className="text-[10px] text-white/45">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="mt-5 h-[34px] cursor-pointer rounded-[7px] bg-blue-600 px-5 text-[10px] font-semibold text-white shadow-[0_8px_25px_rgba(35,133,245,0.16)] transition hover:bg-blue-500"
                        >
                          Explore Pro
                        </button>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <div className="space-y-3">
                  <SectionCard title="Plan Details">
                    <div className="px-5 pb-4 pt-3">
                      <SmallInfoRow
                        label="Plan"
                        value="Free"
                      />

                      <SmallInfoRow
                        label="Trades Logged"
                        value={String(tradeCount)}
                      />

                      <SmallInfoRow
                        label="Status"
                        value="Active"
                      />
                    </div>
                  </SectionCard>

                  <SectionCard title="TradeMirror Pro">
                    <div className="px-5 pb-5 pt-3">
                      <p className="text-[10px] leading-5 text-white/35">
                        Unlock deeper analytics, advanced reports,
                        expanded journal tools, and more as
                        TradeMirror Pro develops.
                      </p>
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}

            {/* GLOBAL DANGER ZONE */}

            <section className="mt-4 overflow-hidden rounded-[13px] border border-red-500/35 bg-red-500/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <div className="px-5 pb-4 pt-4">
                <h2 className="text-[14px] font-semibold text-red-400">
                  Danger Zone
                </h2>

                <p className="mt-4 text-[11px] font-medium text-red-400">
                  Delete Account
                </p>

                <p className="mt-1.5 text-[10px] leading-4 text-white/45">
                  Permanently delete your account and all data.
                  <br />
                  This action cannot be undone.
                </p>

                <button
                  type="button"
                  disabled
                  className="mt-3 flex h-[31px] w-full cursor-not-allowed items-center justify-center gap-2 rounded-[6px] border border-red-500/20 bg-red-500/[0.07] text-[10px] font-medium text-red-400/50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete My Account
                </button>
              </div>
            </section>

            {/* QUICK ACTIONS */}

            <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
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

          </div>
        </div>
      </div>
    </main>
  );
}