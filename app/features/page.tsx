
import Navbar from "@/components/layout/navbar";

import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  Eye,
  Lock,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

const featureCards = [
  {
    number: "01",
    eyebrow: "THE JOURNAL",
    title: "Every trade has a story.",
    description:
      "Record the thinking behind each decision. Capture your setup, emotions, execution, chart screenshots, and the lessons worth carrying forward.",
    icon: BookOpen,
    type: "journal",
    size: "large",
  },
  {
    number: "02",
    eyebrow: "PERFORMANCE ANALYTICS",
    title: "Find your edge in the data.",
    description:
      "See how your performance changes across setups, sessions, direction, and time. Replace assumptions with evidence.",
    icon: BarChart3,
    type: "analytics",
    size: "large",
  },
  {
    number: "03",
    eyebrow: "TRADER DISCOVERY",
    title: "Learn beyond your own screen.",
    description:
      "Explore public trader profiles, compare approaches, and learn from the trade history people choose to share.",
    icon: Users,
    type: "profiles",
    size: "standard",
  },
  {
    number: "04",
    eyebrow: "BUILT AROUND PRIVACY",
    title: "Your data. Your decision.",
    description:
      "Choose what stays private and what becomes public. Share your process without having to reveal every detail.",
    icon: ShieldCheck,
    type: "privacy",
    size: "standard",
  },
  {
    number: "05",
    eyebrow: "EXECUTION & DISCIPLINE",
    title: "A result isn't the whole story.",
    description:
      "A winning trade can break your rules. A losing trade can follow them perfectly. Track the quality of your decisions, not just the outcome.",
    icon: Target,
    type: "execution",
    size: "standard",
  },
  {
    number: "06",
    eyebrow: "CHART CONTEXT",
    title: "Remember what you saw.",
    description:
      "Keep chart screenshots alongside your notes so you can revisit the setup, understand the context, and learn from the moment.",
    icon: Camera,
    type: "screenshots",
    size: "standard",
  },
];

const chartPoints =
  "0,145 42,135 75,143 110,113 145,123 180,91 215,101 250,73 285,88 320,54 355,65 390,43 425,53 460,29 495,42 530,19 570,25 610,8";

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
      {children}
    </p>
  );
}

function PreviewShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative mt-8 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0b0c0e] shadow-[0_24px_70px_rgba(0,0,0,0.25)] sm:mt-10 sm:rounded-[22px] ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/[0.13] to-transparent" />
      {children}
    </div>
  );
}

function JournalPreview() {
  return (
    <PreviewShell>
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.04]">
            <BookOpen className="h-[17px] w-[17px] text-white/75" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-white/85">
              Trading journal
            </p>
            <p className="mt-1 text-[10px] text-white/35">
              Monday, August 31
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[21px] font-semibold tracking-[-0.05em] text-emerald-400 sm:text-[25px]">
            +$1,368
          </p>
          <p className="mt-0.5 text-[10px] text-white/35">
            Net P&amp;L · +2.58R
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4 sm:p-4">
        {[
          ["Instrument", "NQ · Nasdaq"],
          ["Direction", "Short"],
          ["Entry", "29,471.50"],
          ["Exit", "29,413.00"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-white/[0.07] bg-white/[0.018] p-3"
          >
            <p className="text-[10px] text-white/35">{label}</p>
            <p className="mt-1.5 truncate text-[11px] font-medium text-white/80">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="rounded-xl border border-white/[0.07] bg-[#08090b] p-3 sm:p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium text-white/75">
                Chart screenshot
              </p>
              <p className="mt-1 text-[9px] text-white/30">
                NQ · 5 minute
              </p>
            </div>
            <span className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[9px] text-white/40">
              Saved
            </span>
          </div>

          <div className="relative h-[145px] overflow-hidden rounded-lg bg-[#080b0e] sm:h-[175px]">
            <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] [background-size:32px_32px]" />
            <svg
              viewBox="0 0 610 170"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              <defs>
                <linearGradient id="journalArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity=".13" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon
                points={`0,170 ${chartPoints} 610,170`}
                fill="url(#journalArea)"
              />
              <polyline
                points={chartPoints}
                fill="none"
                stroke="#d4d4d8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="320"
                y1="0"
                x2="320"
                y2="170"
                stroke="#34d399"
                strokeOpacity=".6"
                strokeDasharray="4 5"
              />
              <line
                x1="0"
                y1="87"
                x2="610"
                y2="87"
                stroke="#34d399"
                strokeOpacity=".35"
                strokeDasharray="4 5"
              />
            </svg>
            <span className="absolute left-[49%] top-[37%] rounded-md border border-emerald-400/20 bg-[#071b15]/90 px-2 py-1 text-[8px] font-medium tracking-wide text-emerald-300">
              ENTRY
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-white/[0.06] p-3 sm:p-4">
        {[
          ["SETUP", "Liquidity sweep · IFVG"],
          ["EMOTION", "Confident"],
          ["EXECUTION", "Great execution"],
          ["PLAN", "Followed"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl bg-white/[0.025] p-3"
          >
            <p className="text-[9px] font-medium uppercase tracking-[0.13em] text-white/30">
              {label}
            </p>
            <p className="mt-1.5 truncate text-[11px] text-white/70">
              {value}
            </p>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function AnalyticsPreview() {
  return (
    <PreviewShell className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <SectionLabel>Net performance</SectionLabel>
          <p className="mt-2 text-[28px] font-semibold tracking-[-0.06em] text-white sm:text-[34px]">
            +$12,420
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            Positive cumulative P&amp;L
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[10px] text-white/55">
          Last 30 days
        </div>
      </div>

      <div className="relative mt-5 h-[170px] overflow-hidden rounded-xl border border-white/[0.06] bg-[#08090b] sm:h-[205px]">
        <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] [background-size:40px_40px]" />
        <svg
          viewBox="0 0 700 220"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity=".16" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points="0,190 70,178 135,155 195,160 255,126 315,135 375,91 435,106 495,63 555,78 620,42 700,18 700,220 0,220"
            fill="url(#equityFill)"
          />
          <polyline
            points="0,190 70,178 135,155 195,160 255,126 315,135 375,91 435,106 495,63 555,78 620,42 700,18"
            fill="none"
            stroke="#e4e4e7"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="700" cy="18" r="5" fill="#34d399" />
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          ["Win rate", "75.0%"],
          ["Profit factor", "2.84"],
          ["Average R", "+1.42R"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3"
          >
            <p className="text-[9px] text-white/40">{label}</p>
            <p className="mt-1.5 text-[13px] font-semibold text-white/85">
              {value}
            </p>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function ProfilesPreview() {
  return (
    <PreviewShell className="p-3 sm:p-4">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        <div className="flex h-11 items-center rounded-xl border border-white/[0.08] bg-[#08090b] pl-10 pr-3 text-[11px] text-white/35">
          Search traders or strategies
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {[
          ["JM", "Jordan Markets", "@jordantrades", "NQ · ES"],
          ["AT", "Alex Trades", "@alextrades", "Futures"],
          ["CM", "Chris Markets", "@chrismarkets", "Nasdaq"],
        ].map(([initials, name, handle, market], index) => (
          <div
            key={name}
            className="flex items-center gap-3 rounded-xl border border-white/[0.065] bg-white/[0.018] p-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.06] text-[11px] font-semibold text-white/75">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-white/80">
                {name}
              </p>
              <p className="mt-1 truncate text-[9px] text-white/35">
                {handle} · {market}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-lg px-3 py-2 text-[9px] font-medium ${
                index === 0
                  ? "bg-white text-black"
                  : "border border-white/[0.10] bg-white/[0.025] text-white/65"
              }`}
            >
              {index === 0 ? "Following" : "View profile"}
            </span>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function PrivacyPreview() {
  const settings = [
    {
      icon: Users,
      title: "Public profile",
      detail: "Let other traders discover you",
      enabled: true,
    },
    {
      icon: Eye,
      title: "Display performance",
      detail: "Choose what your profile reveals",
      enabled: true,
    },
    {
      icon: Lock,
      title: "Private journal entries",
      detail: "Keep personal notes to yourself",
      enabled: true,
    },
  ];

  return (
    <div className="mt-8 space-y-2 sm:mt-10">
      {settings.map(({ icon: Icon, title, detail, enabled }) => (
        <div
          key={title}
          className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0b0c0e] p-3.5 sm:gap-4 sm:p-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035]">
            <Icon className="h-4 w-4 text-white/65" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-white/80">{title}</p>
            <p className="mt-1 text-[10px] text-white/35">{detail}</p>
          </div>
          <span className="flex h-6 w-10 shrink-0 items-center rounded-full border border-white/[0.12] bg-white/[0.08] p-[3px]">
            <span
              className={`h-[16px] w-[16px] rounded-full ${
                enabled ? "ml-auto bg-white" : "bg-white/40"
              }`}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

function ExecutionPreview() {
  const metrics = [
    ["Risk management", 92],
    ["Entry patience", 84],
    ["Trade management", 89],
  ];

  return (
    <PreviewShell className="p-4 sm:p-5">
      <div className="flex items-center gap-5 border-b border-white/[0.07] pb-5">
        <div className="flex h-[76px] w-[76px] shrink-0 flex-col items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.025]">
          <span className="text-[25px] font-semibold tracking-[-0.06em] text-white">
            84%
          </span>
          <span className="text-[8px] text-white/35">Plan followed</span>
        </div>
        <div>
          <p className="text-[12px] font-medium text-white/80">
            Consistency score
          </p>
          <p className="mt-1.5 text-[10px] leading-5 text-white/40">
            Measure the decisions behind your results, not just the P&amp;L.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {metrics.map(([label, value]) => (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-[10px] text-white/55">{label}</span>
              <span className="text-[10px] tabular-nums text-white/45">
                {value}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full bg-white/75"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function ScreenshotPreview() {
  return (
    <PreviewShell className="p-3 sm:p-4">
      <div className="relative h-[180px] overflow-hidden rounded-xl border border-white/[0.07] bg-[#08090b] sm:h-[220px]">
        <div className="absolute inset-0 opacity-75 [background-image:linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] [background-size:35px_35px]" />
        <svg
          viewBox="0 0 700 240"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <polyline
            points="0,190 60,175 120,184 180,142 240,150 300,105 360,116 420,70 480,83 540,46 600,67 700,20"
            fill="none"
            stroke="#d4d4d8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="470"
            y1="0"
            x2="470"
            y2="240"
            stroke="#34d399"
            strokeOpacity=".65"
            strokeDasharray="5 5"
          />
          <line
            x1="0"
            y1="83"
            x2="700"
            y2="83"
            stroke="#34d399"
            strokeOpacity=".45"
            strokeDasharray="5 5"
          />
        </svg>

        <div className="absolute left-3 top-3 rounded-lg border border-white/[0.10] bg-black/70 px-2.5 py-2 backdrop-blur">
          <p className="text-[9px] font-medium text-white/75">NQ · 5m</p>
          <p className="mt-0.5 text-[8px] text-white/35">Chart attachment</p>
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-[#071b15]/90 px-2.5 py-2 text-[9px] text-emerald-300">
          <Check className="h-3 w-3" />
          Saved to journal
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-1 pb-1 pt-3">
        <span className="text-[10px] text-white/50">October 14, 2026</span>
        <span className="text-[9px] text-white/30">Trade screenshot</span>
      </div>
    </PreviewShell>
  );
}

function FeaturePreview({ type }: { type: string }) {
  switch (type) {
    case "journal":
      return <JournalPreview />;
    case "analytics":
      return <AnalyticsPreview />;
    case "profiles":
      return <ProfilesPreview />;
    case "privacy":
      return <PrivacyPreview />;
    case "execution":
      return <ExecutionPreview />;
    case "screenshots":
      return <ScreenshotPreview />;
    default:
      return null;
  }
}

export default function FeaturesPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070707] text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-220px] h-[440px] w-[700px] -translate-x-1/2 rounded-full bg-white/[0.055] blur-[130px] sm:h-[600px] sm:w-[900px] sm:blur-[170px]" />
          <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:70px_70px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        </div>

        <div className="mx-auto max-w-[1240px] px-5 pb-20 pt-20 sm:px-8 sm:pb-24 sm:pt-28 lg:px-12 lg:pb-32 lg:pt-36">
          <div className="mx-auto max-w-[920px] text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.035] px-3.5 py-2">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.17em] text-white/65 sm:text-[10px]">
                A better way to review your trading
              </span>
            </div>

            <h1 className="mt-7 text-[43px] font-semibold leading-[0.99] tracking-[-0.07em] text-white sm:mt-8 sm:text-[60px] md:text-[76px] lg:text-[88px]">
              Trade with intention.
              <span className="mt-2 block text-white/45">
                Learn with evidence.
              </span>
            </h1>

            {/* Removed the paragraph with the text about TradeMirror combining features */}

            {/* Removed "Start journaling free" and "Explore features" buttons */}

            {/* Removed the "Built for futures traders", "Privacy you control", "Process over guesswork" bullet section */}
          </div>

          {/* PRODUCT PREVIEW */}
          <div className="mx-auto mt-14 max-w-[1000px] sm:mt-20 lg:mt-24">
            <div className="rounded-[24px] border border-white/[0.12] bg-[#0c0c0d] p-2 shadow-[0_40px_120px_rgba(0,0,0,0.55)] sm:rounded-[30px] sm:p-3">
              <div className="overflow-hidden rounded-[17px] border border-white/[0.07] bg-[#08090a] sm:rounded-[22px]">
                <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                  </div>
                  <span className="text-[9px] tracking-[0.12em] text-white/30">
                    TRADEMIRROR / JOURNAL
                  </span>
                  <div className="h-5 w-8" />
                </div>

                <div className="grid gap-0 md:grid-cols-[0.8fr_1.2fr]">
                  <div className="flex flex-col justify-between border-b border-white/[0.07] p-5 sm:p-7 md:border-b-0 md:border-r md:p-8">
                    <div>
                      <SectionLabel>YOUR TRADING JOURNAL</SectionLabel>
                      <h2 className="mt-4 max-w-[360px] text-[27px] font-medium leading-[1.08] tracking-[-0.055em] text-white sm:text-[36px]">
                        A clearer picture of every decision.
                      </h2>
                      <p className="mt-4 max-w-[360px] text-[12px] leading-6 text-white/45 sm:text-[13px]">
                        Review your trade, remember your reasoning, and build
                        a process you can repeat.
                      </p>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5">
                        <p className="text-[9px] text-white/35">Instrument</p>
                        <p className="mt-2 text-[15px] font-semibold text-white/85">
                          NQ
                        </p>
                        <p className="mt-1 text-[9px] text-white/30">Nasdaq futures</p>
                      </div>
                      <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5">
                        <p className="text-[9px] text-white/35">Execution</p>
                        <p className="mt-2 text-[15px] font-semibold text-white/85">
                          A
                        </p>
                        <p className="mt-1 text-[9px] text-white/30">Followed plan</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-5 md:p-6">
                    <JournalPreview />
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-[9px] text-white/25 sm:text-[10px]">
              Product preview · Illustrative sample data
            </p>
          </div>
        </div>
      </section>

      {/* FEATURE OVERVIEW */}
      <section
        id="features"
        className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-32"
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[650px]">
            <SectionLabel>THE TRADEMIRROR TOOLKIT</SectionLabel>
            <h2 className="mt-4 text-[35px] font-semibold leading-[1.02] tracking-[-0.06em] text-white sm:text-[47px] md:text-[58px]">
              Everything has a place.
              <span className="block text-white/40">Every detail matters.</span>
            </h2>
          </div>
          <p className="max-w-[370px] text-[12px] leading-6 text-white/40 sm:text-[13px] sm:leading-7">
            The tools to document your trades, understand your performance,
            and reflect on the habits shaping your results.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:mt-16 sm:gap-5 md:grid-cols-2">
          {featureCards.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.number}
                className={`group relative min-w-0 overflow-hidden rounded-[22px] border border-white/[0.09] bg-[#0b0b0c] p-5 transition duration-300 hover:border-white/[0.16] hover:bg-[#0e0e0f] sm:rounded-[28px] sm:p-7 lg:p-8 ${
                  feature.size === "large" ? "md:col-span-1" : ""
                }`}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/[0.10] bg-white/[0.035] transition group-hover:bg-white/[0.06] sm:h-12 sm:w-12">
                    <Icon className="h-[19px] w-[19px] text-white/75" strokeWidth={1.7} />
                  </div>
                  <span className="pt-1 text-[10px] tabular-nums tracking-[0.14em] text-white/25">
                    {feature.number}
                  </span>
                </div>

                <p className="mt-7 text-[9px] font-semibold tracking-[0.18em] text-white/35 sm:mt-8 sm:text-[10px]">
                  {feature.eyebrow}
                </p>
                <h3 className="mt-3 max-w-[500px] text-[26px] font-medium leading-[1.08] tracking-[-0.05em] text-white sm:text-[31px]">
                  {feature.title}
                </h3>
                <p className="mt-3 max-w-[530px] text-[12px] leading-6 text-white/45 sm:mt-4 sm:text-[13px] sm:leading-7">
                  {feature.description}
                </p>

                <FeaturePreview type={feature.type} />
              </article>
            );
          })}
        </div>
      </section>

      {/* CLOSING STATEMENT */}
      <section className="px-5 pb-20 sm:px-8 sm:pb-28 lg:px-12 lg:pb-32">
        <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[26px] border border-white/[0.10] bg-[#0c0c0d] px-5 py-14 text-center sm:rounded-[32px] sm:px-10 sm:py-20 md:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.065),transparent_65%)]" />

          <div className="relative mx-auto max-w-[760px]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.04]">
              <Activity className="h-5 w-5 text-white/80" />
            </div>

            <p className="mt-6 text-[9px] font-semibold tracking-[0.2em] text-white/40 sm:text-[10px]">
              YOUR TRADING. YOUR DATA. YOUR EDGE.
            </p>
            <h2 className="mt-4 text-[37px] font-semibold leading-[1] tracking-[-0.065em] text-white sm:text-[49px] md:text-[62px]">
              Make every trade
              <span className="block mt-2 text-white/45">
                worth learning from.
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-[510px] text-[12px] leading-6 text-white/45 sm:text-[14px] sm:leading-7">
              Build a record of your decisions, recognize your patterns, and
              keep refining your approach one session at a time.
            </p>

            <a
              href="/signup"
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[12px] font-semibold text-black transition hover:bg-white/90 sm:mt-9"
            >
              Start journaling free
              <ArrowRight className="h-4 w-4" />
            </a>
            <p className="mt-4 text-[9px] text-white/25">
              Your next session is another opportunity to improve.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] px-5 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <p className="text-[10px] text-white/30">
            TradeMirror · A journal for intentional traders.
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-1.5 text-[10px] text-white/50 transition hover:text-white"
          >
            Get started
            <ArrowDownRight className="h-3 w-3" />
          </a>
        </div>
      </footer>
    </main>
  );
}
