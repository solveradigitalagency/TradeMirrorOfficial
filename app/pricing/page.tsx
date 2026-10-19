import Link from "next/link";

import Navbar from "@/components/layout/navbar";

export default function PricingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#02060b] text-white">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-[-150px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/[0.025] blur-[150px] sm:top-[-200px] sm:h-[650px] sm:w-[650px] sm:blur-[180px]" />

        <div className="relative mx-auto max-w-[1600px] px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          {/* Heading */}
          <h1 className="mx-auto max-w-[950px] text-[39px] font-semibold leading-[0.98] tracking-[-0.05em] sm:text-5xl md:text-6xl">
            <span className="text-white">Start free</span>
            <span className="text-white">.</span>
            <span className="text-white">
              {" "}
              Upgrade when you’re ready.
            </span>
          </h1>

          {/* Pricing cards */}
          <div className="mx-auto mt-12 grid w-full max-w-6xl grid-cols-1 gap-5 sm:mt-14 sm:gap-6 md:mt-16 md:grid-cols-2 md:gap-8">
            {/* FREE */}
            <div className="relative flex min-w-0 max-w-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.018] px-5 py-8 text-left sm:px-8 sm:py-9 md:px-10 lg:px-14 lg:py-10">
              <span className="absolute right-4 top-4 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-wider text-emerald-400 sm:right-6 sm:top-6 sm:px-3 sm:text-[9px]">
                Available Now
              </span>

              <p className="pr-24 text-sm font-medium text-white/50 sm:pr-28">
                TradeMirror Free
              </p>

              <div className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
                $0
              </div>

              <div className="text-xs font-normal text-white/50">forever</div>

              <div className="mt-1 text-xs font-medium text-emerald-400">
                No credit card required
              </div>

              <p className="mt-4 max-w-[520px] text-sm leading-6 text-white/35 sm:mt-5">
                Everything you need to begin tracking, reviewing, and
                understanding your trades.
              </p>

              <Link
                href="/signup"
                className="mt-6 flex h-12 w-full items-center justify-center rounded-xl border border-white/20 bg-white text-sm font-medium text-black transition hover:bg-white/90 sm:mt-7"
              >
                Start journaling free
              </Link>

              <div className="mt-7">
                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/35">
                  What’s included
                </p>

                <ul className="ml-1 grid grid-cols-1 gap-y-2.5 text-sm text-white/65 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-2">
                  <li>Manual P&amp;L calendar</li>
                  <li>Daily trade journal</li>
                  <li>Screenshot uploads</li>
                  <li>Emotion and discipline tracking</li>
                  <li>Basic performance analytics</li>
                  <li>Public or private trader profile</li>
                  <li>Trader search and following</li>
                </ul>
              </div>
            </div>

            {/* PRO */}
            <div className="relative flex min-w-0 max-w-full flex-col rounded-2xl border border-white/[0.12] bg-white/[0.035] px-5 py-8 text-left shadow-[0_0_60px_rgba(255,255,255,0.025)] sm:px-8 sm:py-9 md:px-10 lg:px-14 lg:py-10">
              <div className="absolute right-4 top-4 rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[8px] font-semibold uppercase tracking-wider text-white/60 sm:right-6 sm:top-6 sm:px-3 sm:text-[9px]">
                Coming Later
              </div>

              <p className="pr-24 text-xs font-medium uppercase tracking-widest text-white/60 sm:pr-28">
                For Connected Traders
              </p>

              <p className="mt-2 text-sm font-medium text-white/50">
                TradeMirror Pro
              </p>

              <div className="mt-3 text-lg font-semibold text-white">
                Coming soon
              </div>

              <div className="mt-1 text-xs font-medium text-white/35">
                Pricing will be announced before launch.
              </div>

              <p className="mt-4 max-w-[520px] text-sm leading-6 text-white/45 sm:mt-5">
                Automatic trade importing, verified results, and deeper
                performance insights.
              </p>

              <button
                disabled
                className="mt-6 h-12 w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.04] text-sm font-medium text-white/30 opacity-70 transition sm:mt-7"
                aria-disabled="true"
              >
                Not available yet
              </button>

              <div className="mt-7">
                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/50">
                  Planned for Pro
                </p>

                <ul className="ml-1 grid grid-cols-1 gap-y-2.5 text-sm text-white/65 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-2">
                  <li>AI trade capture</li>
                  <li>Automatic trade imports</li>
                  <li>Weekly AI reviews</li>
                  <li>Advanced performance analytics</li>
                  <li>Multiple trading accounts</li>
                  <li>Payout and expense tracking</li>
                  <li>Tax-ready exports</li>
                  <li>Expanded screenshot storage</li>
                </ul>
              </div>
            </div>
          </div>

          {/* INFO CARDS BELOW PRICING */}
          <div className="mx-auto mt-5 w-full max-w-5xl overflow-hidden rounded-xl border border-white/[0.08] bg-[#07101a]/70 shadow-[0_16px_45px_rgba(0,0,0,0.15)] backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-3">
              {/* Info 1 */}
              <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035]">
                  <svg
                    className="h-3.5 w-3.5 text-white/70"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M7 8h10M7 12h6" />
                  </svg>
                </div>

                <p className="text-left text-[11px] leading-5 text-white/50">
                  Your journal is available across your devices.
                </p>
              </div>

              {/* Info 2 */}
              <div className="flex items-center gap-3 border-t border-white/[0.06] px-4 py-3.5 sm:px-5 md:border-l md:border-t-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035]">
                  <svg
                    className="h-3.5 w-3.5 text-white/70"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path d="M12 3l7 3v5c0 4.5-3 7.8-7 10-4-2.2-7-5.5-7-10V6l7-3z" />
                    <path d="M9.5 12l1.7 1.7 3.5-3.5" />
                  </svg>
                </div>

                <p className="text-left text-[11px] leading-5 text-white/50">
                  Your trading data remains under your control.
                </p>
              </div>

              {/* Info 3 */}
              <div className="flex items-center gap-3 border-t border-white/[0.06] px-4 py-3.5 sm:px-5 md:border-l md:border-t-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035]">
                  <svg
                    className="h-3.5 w-3.5 text-white/70"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path d="M5 12h14M12 5v14" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </div>

                <p className="text-left text-[11px] leading-5 text-white/50">
                  The free plan stays useful without upgrading.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}