import Navbar from "@/components/layout/navbar";

import {
  BarChart3,
  BookOpen,
  Camera,
  Check,
  Lock,
  Search,
  Users,
} from "lucide-react";

const featureCards = [
  {
    eyebrow: "TRADING JOURNAL",
    title: "Turn every trade into something you can learn from.",
    description:
      "Capture the decisions behind every trade with notes, setups, emotions, execution, screenshots, and results.",
    icon: BookOpen,
    type: "journal",
  },
  {
    eyebrow: "ANALYTICS",
    title: "See the patterns behind your results.",
    description:
      "Understand what's actually working across setups, instruments, sessions, direction, and time.",
    icon: BarChart3,
    type: "analytics",
  },
  {
    eyebrow: "TRADER PROFILES",
    title: "Learn from other traders.",
    description:
      "Search public profiles and view the results and journal entries traders choose to share.",
    icon: Users,
    type: "profiles",
  },
  {
    eyebrow: "PRIVACY",
    title: "You decide what people see.",
    description:
      "Keep everything private, share selected entries, or show percentages without revealing exact dollar amounts.",
    icon: Lock,
    type: "privacy",
  },
  {
    eyebrow: "EXECUTION",
    title: "Separate results from discipline.",
    description:
      "A winning trade can still be poorly executed. Track whether you actually followed your plan.",
    icon: BarChart3,
    type: "execution",
  },
  {
    eyebrow: "SCREENSHOTS",
    title: "Save what you saw.",
    description:
      "Attach your chart to a trading day so you can review the exact setup later.",
    icon: Camera,
    type: "screenshots",
  },
];

function JournalPreview() {
  return (
    <div className="mt-8 overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#07111c] shadow-[0_25px_70px_rgba(0,0,0,0.3)] sm:mt-10">
      <div className="border-b border-white/[0.06] px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/25">
              Trade Journal
            </p>
            <p className="mt-1 text-[11px] text-white/35">
              August 31, 2026
            </p>
          </div>

          <div className="text-right">
            <p className="text-[20px] font-semibold tracking-[-0.04em] text-emerald-400 sm:text-[22px]">
              +$1,368
            </p>
            <p className="text-[9px] text-emerald-400/60">+2.58R</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4 sm:p-4">
        {[
          ["Instrument", "NQ"],
          ["Position", "Short"],
          ["Entry", "29,471.50"],
          ["Exit", "29,413.00"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3"
          >
            <p className="text-[8px] text-white/25">{label}</p>
            <p className="mt-1 text-[10px] font-medium text-white/65">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mx-3 rounded-xl border border-white/[0.06] bg-[#030910] p-3 sm:mx-4 sm:p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="rounded-lg border border-blue-400/20 bg-blue-500/[0.06] px-2 py-1 text-[8px] text-blue-300/70">
            NQ · 5m · CME
          </span>

          <span className="text-[8px] text-white/20">TRADE CHART</span>
        </div>

        <div className="relative h-[130px] overflow-hidden rounded-lg sm:h-[150px]">
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:38px_38px]" />

          <svg
            viewBox="0 0 600 180"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 142 L45 130 L82 137 L120 104 L158 119 L195 85 L235 98 L275 66 L315 82 L352 48 L390 63 L428 38 L468 55 L510 27 L550 43 L600 15"
              fill="none"
              stroke="#2387ff"
              strokeWidth="3"
            />
          </svg>

          <div className="absolute right-[20%] top-[30%] rounded-md border border-emerald-400/25 bg-emerald-500/[0.08] px-2 py-1 text-[8px] text-emerald-300">
            ENTRY
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 sm:p-4">
        {[
          ["Setup", "Liquidity Sweep into 5M RB + IFVG"],
          ["Emotion", "Confident"],
          ["Execution", "Great execution"],
          ["Plan", "Followed"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
          >
            <p className="text-[8px] uppercase tracking-[0.12em] text-white/20">
              {label}
            </p>
            <p className="mt-1.5 text-[10px] text-white/55">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsPreview() {
  return (
    <div className="mt-8 overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#07111c] p-4 shadow-[0_25px_70px_rgba(0,0,0,0.3)] sm:mt-10 sm:p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
            Equity Curve
          </p>

          <p className="mt-1 text-[23px] font-semibold tracking-[-0.04em] text-white sm:text-[26px]">
            +$12,420
          </p>
        </div>

        <span className="shrink-0 rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-2 text-[8px] text-white/35 sm:px-3">
          Last 30 Days
        </span>
      </div>

      <div className="relative mt-5 h-[155px] overflow-hidden rounded-xl border border-white/[0.06] bg-[#030910] sm:h-[190px]">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.055)_1px,transparent_1px)] [background-size:48px_48px]" />

        <svg
          viewBox="0 0 700 220"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 190 L70 178 L135 155 L195 160 L255 126 L315 135 L375 91 L435 106 L495 63 L555 78 L620 42 L700 18 L700 220 L0 220 Z"
            fill="rgba(35,135,255,0.13)"
          />

          <path
            d="M0 190 L70 178 L135 155 L195 160 L255 126 L315 135 L375 91 L435 106 L495 63 L555 78 L620 42 L700 18"
            fill="none"
            stroke="#2387ff"
            strokeWidth="3"
          />
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          ["Win Rate", "75.0%"],
          ["Profit Factor", "2.84"],
          ["Avg. R", "+1.42R"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 sm:p-3"
          >
            <p className="text-[8px] text-white/25">{label}</p>
            <p className="mt-1 text-[12px] font-semibold text-white/75 sm:text-[13px]">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilesPreview() {
  return (
    <div className="mt-8 rounded-[20px] border border-white/[0.08] bg-[#07111c] p-4 shadow-[0_25px_70px_rgba(0,0,0,0.3)] sm:mt-10 sm:p-5">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

        <div className="rounded-xl border border-white/[0.07] bg-[#030910] py-3 pl-11 pr-4 text-[10px] text-white/25">
          Search traders by name or @username
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {[
          ["JM", "Jordan Markets", "@jordantrades · NQ & ES"],
          ["AT", "Alex Trades", "@alextrades · Futures"],
          ["CM", "Chris Markets", "@chrismarkets · NQ"],
        ].map(([initials, name, handle]) => (
          <div
            key={name}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] px-3 py-3 sm:px-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[10px] font-semibold text-blue-300">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold text-white/75">
                  {name}
                </p>

                <p className="mt-0.5 truncate text-[8px] text-white/30">
                  {handle}
                </p>
              </div>
            </div>

            <button className="shrink-0 rounded-lg border border-blue-400/20 bg-blue-500/[0.04] px-3 py-2 text-[9px] font-medium text-blue-300 sm:px-4">
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrivacyPreview() {
  return (
    <div className="mt-8 space-y-2 sm:mt-10">
      {["Public profile", "Hide dollar amounts", "Approve followers"].map(
        (item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/[0.08]">
              <Check className="h-4 w-4 text-emerald-400" />
            </div>

            <span className="text-[11px] text-white/55">{item}</span>
          </div>
        ),
      )}
    </div>
  );
}

function ExecutionPreview() {
  return (
    <div className="mt-8 rounded-[20px] border border-white/[0.08] bg-[#07111c] p-4 shadow-[0_25px_70px_rgba(0,0,0,0.3)] sm:mt-10 sm:p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="border-b border-white/[0.07] pb-5 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-7">
          <p className="text-[40px] font-semibold tracking-[-0.06em] text-emerald-400 sm:text-[46px]">
            84%
          </p>

          <p className="mt-1 text-[10px] text-white/35">Plan followed</p>
        </div>

        <div className="flex-1 space-y-5">
          {[
            ["Risk management", "92%"],
            ["Entry patience", "84%"],
            ["Trade management", "89%"],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="mb-2 flex justify-between">
                <span className="text-[9px] text-white/40">{label}</span>
                <span className="text-[9px] text-white/25">{value}</span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                  style={{ width: value }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScreenshotPreview() {
  return (
    <div className="mt-8 overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#07111c] p-3 shadow-[0_25px_70px_rgba(0,0,0,0.3)] sm:mt-10 sm:p-4">
      <div className="relative h-[170px] overflow-hidden rounded-xl border border-white/[0.07] bg-[#030910] sm:h-[210px]">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:45px_45px]" />

        <svg
          viewBox="0 0 700 240"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 190 L60 175 L120 184 L180 142 L240 150 L300 105 L360 116 L420 70 L480 83 L540 46 L600 67 L700 20"
            fill="none"
            stroke="#8fb6ed"
            strokeWidth="3"
          />
        </svg>

        <div className="absolute left-[68%] top-[27%] rounded-lg border border-emerald-400/25 bg-emerald-500/[0.08] px-2.5 py-1.5 text-[9px] text-emerald-300 sm:px-3 sm:py-2">
          Entry
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[9px] text-white/25">NQ · 5m · CME</span>

        <span className="text-right text-[9px] text-white/20">
          Saved to Journal
        </span>
      </div>
    </div>
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
    <main className="min-h-screen overflow-x-hidden bg-[#02060b] text-white">
      <Navbar />

      <section
        id="features"
        className="relative overflow-hidden bg-[#02060b] py-20 sm:py-24 lg:py-28"
      >
        {/* Ambient lighting */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[5%] top-[10%] h-[450px] w-[450px] rounded-full bg-blue-500/[0.035] blur-[140px] sm:h-[600px] sm:w-[600px] sm:blur-[170px]" />

          <div className="absolute right-[5%] top-[35%] h-[500px] w-[500px] rounded-full bg-blue-500/[0.03] blur-[150px] sm:h-[700px] sm:w-[700px] sm:blur-[180px]" />

          <div className="absolute bottom-[5%] left-[30%] h-[500px] w-[550px] rounded-full bg-blue-600/[0.025] blur-[150px] sm:h-[600px] sm:w-[700px] sm:blur-[180px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1500px] px-4 sm:px-7 lg:px-12 xl:px-16">
          {/* Section intro */}
          <div className="mx-auto max-w-[760px] text-center">
            <h2 className="text-[39px] font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-[48px] md:text-[64px] lg:text-[76px]">
              Everything you need to{" "}
              <span className="text-[#2387ff]">understand</span> your trading.
            </h2>
          </div>

          {/* Feature showcase */}
          <div className="mt-14 grid gap-4 sm:mt-16 sm:gap-5 lg:mt-24 md:grid-cols-2">
            {featureCards.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group relative overflow-hidden rounded-[24px] border border-white/[0.09] bg-[#07111c]/90 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.22)] transition duration-500 hover:border-white/[0.14] hover:bg-[#091522] sm:rounded-[30px] sm:p-7"
                >
                  {/* Top shine */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/20 to-transparent" />

                  {/* Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-[15px] border border-blue-300/20 bg-blue-500/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition group-hover:border-blue-300/30 group-hover:bg-blue-500/[0.08] sm:h-14 sm:w-14 sm:rounded-[17px]">
                    <Icon
                      className="h-5 w-5 text-blue-300 sm:h-6 sm:w-6"
                      strokeWidth={1.7}
                    />
                  </div>

                  <p className="mt-8 text-[9px] font-semibold tracking-[0.17em] text-white/30 sm:mt-10 sm:text-[10px]">
                    {feature.eyebrow}
                  </p>

                  <h3 className="mt-3 max-w-[600px] text-[27px] font-medium leading-[1.05] tracking-[-0.045em] text-white sm:mt-4 sm:text-[30px] md:text-[34px] lg:text-[38px]">
                    {feature.title}
                  </h3>

                  <p className="mt-4 max-w-[610px] text-[13px] leading-[1.7] text-white/38 sm:mt-5 sm:text-[14px]">
                    {feature.description}
                  </p>

                  <FeaturePreview type={feature.type} />
                </article>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="relative mt-14 overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#07111c]/80 px-5 py-12 text-center shadow-[0_30px_100px_rgba(0,0,0,0.25)] sm:mt-20 sm:rounded-[30px] sm:px-8 sm:py-16 md:px-12">
            <div className="pointer-events-none absolute left-1/2 top-[-160px] h-[320px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/[0.06] blur-[100px] sm:top-[-200px] sm:h-[400px] sm:w-[700px] sm:blur-[120px]" />

            <div className="relative">
              <p className="text-[8px] font-semibold tracking-[0.18em] text-blue-300/60 sm:text-[9px]">
                YOUR TRADING. YOUR DATA. YOUR EDGE.
              </p>

              <h3 className="mx-auto mt-4 max-w-[700px] text-[34px] font-semibold leading-[1] tracking-[-0.05em] text-white sm:mt-5 sm:text-[40px] md:text-[52px]">
                Stop guessing.{" "}
                <span className="text-[#2387ff]">Start learning.</span>
              </h3>

              <p className="mx-auto mt-4 max-w-[520px] text-[13px] leading-6 text-white/35 sm:mt-5 sm:text-[14px] sm:leading-7">
                Build a journal around your actual trading and turn your
                history into an edge.
              </p>

              <a
                href="/signup"
                className="mt-7 inline-flex h-[50px] items-center rounded-[10px] bg-[#1677f3] px-5 text-[11px] font-semibold text-white shadow-[0_12px_35px_rgba(35,133,245,0.22),inset_0_1px_0_rgba(255,255,255,0.2)] transition hover:bg-[#2785f6] sm:mt-8 sm:h-[52px] sm:px-6"
              >
                Start Journaling Free
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}