
import Link from "next/link";
import Navbar from "@/components/layout/navbar";

const freeFeatures = [
  "Manual P&L calendar",
  "Daily trading journal",
  "Chart screenshot uploads",
  "Emotion and discipline tracking",
  "Performance analytics",
  "Public or private trader profile",
  "Trader discovery and following",
];

const proFeatures = [
  "Automatic trade imports",
  "AI-powered trade capture",
  "Weekly AI performance reviews",
  "Advanced analytics and insights",
  "Multiple trading accounts",
  "Payout and expense tracking",
  "Tax-ready exports",
  "Expanded screenshot storage",
];

function CheckIcon({ muted = false }: { muted?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={`h-[17px] w-[17px] shrink-0 ${
        muted ? "text-white/35" : "text-white/80"
      }`}
    >
      <path
        d="m5 10.2 3.2 3.2L15.5 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeatureList({
  features,
  muted = false,
}: {
  features: string[];
  muted?: boolean;
}) {
  return (
    <ul className="space-y-3.5">
      {features.map((feature) => (
        <li
          key={feature}
          className={`flex items-center gap-3 text-[13px] leading-5 ${
            muted ? "text-white/45" : "text-white/70"
          }`}
        >
          <CheckIcon muted={muted} />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
    >
      <path
        d="M4.5 10h11m-4.5-4.5 4.5 4.5-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <Navbar />

      <section className="relative isolate">
        {/* Subtle background lighting */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.075),transparent_65%)]"
        />

        <div className="mx-auto max-w-[1200px] px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28 lg:px-10">
          {/* Page introduction */}
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.035] px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">
                Simple, transparent pricing
              </span>
            </div>

            <h1 className="text-4xl font-medium leading-[1.08] tracking-[-0.055em] sm:text-5xl md:text-[64px]">
              Start with the essentials.
              <span className="mt-1 block text-white/40">
                Grow at your own pace.
              </span>
            </h1>
          </div>

          {/* Pricing plans */}
          <div className="mx-auto mt-14 grid max-w-[940px] grid-cols-1 items-stretch gap-4 md:mt-16 md:grid-cols-2 md:gap-5">
            {/* Free plan */}
            <article className="flex flex-col rounded-[24px] border border-white/[0.13] bg-[#0b0b0b] p-6 sm:p-8 lg:p-9">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white/85">
                    TradeMirror Free
                  </p>
                  <p className="mt-2 text-xs text-white/40">
                    Everything you need to get started.
                  </p>
                </div>

                <span className="shrink-0 rounded-full border border-white/[0.12] bg-white/[0.04] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.13em] text-white/55">
                  Available now
                </span>
              </div>

              <div className="mt-9 flex items-baseline gap-2">
                <span className="text-[56px] font-medium leading-none tracking-[-0.07em]">
                  $0
                </span>
                <span className="text-sm text-white/35">forever</span>
              </div>

              <p className="mt-3 text-xs text-white/40">
                No credit card. No commitment.
              </p>

              <Link
                href="/signup"
                className="group mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0b]"
              >
                Start for free
                <ArrowIcon />
              </Link>

              <div className="my-8 h-px bg-white/[0.09]" />

              <div className="mb-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">
                  Included in Free
                </p>
              </div>

              <FeatureList features={freeFeatures} />

              <div className="mt-auto pt-9">
                <p className="text-[11px] leading-5 text-white/30">
                  A complete foundation for building a consistent review
                  process.
                </p>
              </div>
            </article>

            {/* Pro plan */}
            <article className="relative flex flex-col overflow-hidden rounded-[24px] border border-white/[0.09] bg-[#090909] p-6 sm:p-8 lg:p-9">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-0 top-0 h-48 w-48 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.055),transparent_70%)]"
              />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white/85">
                    TradeMirror Pro
                  </p>
                  <p className="mt-2 text-xs text-white/40">
                    For traders ready to go deeper.
                  </p>
                </div>

                <span className="shrink-0 rounded-full border border-white/[0.12] bg-white/[0.035] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.13em] text-white/45">
                  Coming soon
                </span>
              </div>

              <div className="mt-9">
                <p className="text-[27px] font-medium leading-tight tracking-[-0.04em] text-white/85">
                  More insight.
                  <br />
                  Less manual work.
                </p>
              </div>

              <p className="mt-4 min-h-[40px] max-w-sm text-xs leading-6 text-white/40">
                Spend less time organizing trades and more time understanding
                your performance.
              </p>

              <button
                type="button"
                disabled
                aria-disabled="true"
                className="mt-8 flex h-12 w-full cursor-not-allowed items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.035] px-4 text-sm font-medium text-white/30"
              >
                Coming soon
              </button>

              <div className="my-8 h-px bg-white/[0.08]" />

              <div className="mb-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
                  Planned for Pro
                </p>
              </div>

              <FeatureList features={proFeatures} muted />

              <div className="mt-auto pt-9">
                <p className="text-[11px] leading-5 text-white/25">
                  Pro features and pricing will be announced before launch.
                </p>
              </div>
            </article>
          </div>

          {/* Trust notes */}
          <div className="mx-auto mt-5 grid max-w-[940px] grid-cols-1 divide-y divide-white/[0.07] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.018] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="flex items-center gap-3 px-5 py-5 sm:px-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.035]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 text-white/60"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M8 19v2m8-2v2M8 9h8m-8 4h5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-white/75">
                  Your journal, everywhere
                </p>
                <p className="mt-1 text-[11px] leading-5 text-white/35">
                  Access it across your devices.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-5 sm:px-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.035]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 text-white/60"
                >
                  <path
                    d="M12 3 19 6v5c0 4.5-2.8 7.6-7 10-4.2-2.4-7-5.5-7-10V6l7-3Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-white/75">
                  Your data, your control
                </p>
                <p className="mt-1 text-[11px] leading-5 text-white/35">
                  Manage your trading information.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-5 sm:px-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.035]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 text-white/60"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="8.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M12 7v5l3 2"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-white/75">
                  No rush to upgrade
                </p>
                <p className="mt-1 text-[11px] leading-5 text-white/35">
                  Free stays useful on its own.
                </p>
              </div>
            </div>
          </div>

          {/* Closing note */}
          <p className="mt-12 text-center text-xs text-white/30">
            Better trading starts with better review.
          </p>
        </div>
      </section>
    </main>
  );
}
