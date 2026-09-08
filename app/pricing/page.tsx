import Link from "next/link";
import Navbar from "@/components/layout/navbar";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#02060b] text-white">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-[-200px] h-[650px] w-[650px] -translate-x-1/2 -translate-y-0 rounded-full bg-blue-500/[0.055] blur-[180px]" />

        <div className="relative mx-auto max-w-[1600px] px-6 py-28 text-center">
          <h1 className="text-5xl font-semibold tracking-[-0.05em] md:text-6xl">
            <span className="text-white">Start free</span>
            <span className="text-white">.</span>
            <span className="text-[#2385f5]"> Upgrade when you’re ready.</span>
          </h1>

          <div className="mx-auto mt-16 grid max-w-6xl gap-8 grid-cols-1 md:grid-cols-2">
            {/* FREE */}
            <div className="relative flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.018] px-14 py-10 text-left min-w-[410px] max-w-full">
              <span className="absolute right-6 top-6 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                Available Now
              </span>
              <p className="text-sm font-medium text-white/50 mb-2">
                TradeMirror Free
              </p>
              <div className="mt-2 text-5xl font-semibold text-white">$0</div>
              <div className="text-xs font-normal text-white/50 mb-1">forever</div>
              <div className="text-xs font-medium text-emerald-400 mb-4">
                No credit card required
              </div>
              <p className="mt-1 text-sm leading-6 text-white/35 mb-6">
                Everything you need to begin tracking, reviewing, and understanding your trades.
              </p>

              <Link
                href="/signup"
                className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border border-[#2385f5]/80 bg-[#2385f5] text-sm font-medium text-white/95 transition hover:bg-[#3696ff] shadow-[0_1px_9px_0_rgba(35,133,245,0.18)]"
              >
                Start journaling free
              </Link>

              <div className="mt-7">
                <p className="mb-2 text-xs font-medium tracking-widest text-white/35 uppercase">
                  What’s included
                </p>
                <ul className="ml-1.5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-white/65">
                  <li>Manual P&amp;L calendar</li>
                  <li>Daily trade journal</li>
                  <li>Screenshot uploads</li>
                  <li>Emotion and discipline tracking</li>
                  <li>Basic performance analytics</li>
                  <li>Public or private trader profile</li>
                  <li>Trader search and following</li>
                  <li className="invisible">Placeholder</li>
                </ul>
              </div>
            </div>

            {/* PRO */}
            <div className="relative rounded-2xl border border-blue-400/30 bg-blue-500/[0.045] px-14 py-10 text-left shadow-[0_0_60px_rgba(35,133,245,0.08)] flex flex-col min-w-[410px] max-w-full">
              <div className="absolute right-6 top-6 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-blue-400">
                Coming Later
              </div>

              <p className="text-xs font-medium text-blue-400 mb-2 uppercase tracking-widest">
                For Connected Traders
              </p>

              <p className="text-sm font-medium text-white/50 mb-2">
                TradeMirror Pro
              </p>

              <div className="text-lg font-semibold text-white mb-1">Coming soon</div>
              <div className="text-xs font-medium text-white/35 mb-4">
                Pricing will be announced before launch.
              </div>
              <p className="text-sm leading-6 text-white/45 mb-5">
                Automatic trade importing, verified results, and deeper performance insights.
              </p>

              {/* Not available yet button (styled same as free CTA but disabled and gray) */}
              <button
                disabled
                className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] text-sm font-medium text-white/30 cursor-not-allowed transition"
                style={{ opacity: 0.7 }}
                aria-disabled="true"
              >
                Not available yet
              </button>

              <div className="mt-7">
                <p className="mb-2 text-xs font-medium tracking-widest text-blue-400/80 uppercase">
                  Planned for Pro
                </p>
                <ul className="ml-1.5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-white/65">
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
            <div className="grid md:grid-cols-3">
              <div className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-400/15 bg-blue-500/[0.06]">
                  <svg
                    className="h-3.5 w-3.5 text-blue-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M7 8h10M7 12h6" />
                  </svg>
                </div>
                <p className="text-[11px] leading-5 text-white/50">
                  Your journal is available across your devices.
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-white/[0.06] px-5 py-3 md:border-l md:border-t-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-400/15 bg-blue-500/[0.06]">
                  <svg
                    className="h-3.5 w-3.5 text-blue-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path d="M12 3l7 3v5c0 4.5-3 7.8-7 10-4-2.2-7-5.5-7-10V6l7-3z" />
                    <path d="M9.5 12l1.7 1.7 3.5-3.5" />
                  </svg>
                </div>
                <p className="text-[11px] leading-5 text-white/50">
                  Your trading data remains under your control.
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-white/[0.06] px-5 py-3 md:border-l md:border-t-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-400/15 bg-blue-500/[0.06]">
                  <svg
                    className="h-3.5 w-3.5 text-blue-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path d="M5 12h14M12 5v14" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </div>
                <p className="text-[11px] leading-5 text-white/50">
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