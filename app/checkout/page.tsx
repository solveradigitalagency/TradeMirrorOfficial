import Navbar from "@/components/layout/navbar";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[#02060b] text-white">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500/[0.05] blur-[180px]" />

        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">
              TradeMirror Pro
            </p>

            <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em]">
              Upgrade your trading journal.
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-white/40">
              Unlock advanced analytics, Tax Center, and the tools built to
              help you understand your trading at a deeper level.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-4xl rounded-3xl border border-white/[0.08] bg-white/[0.018] p-8 shadow-[0_0_60px_rgba(35,133,245,0.06)] md:p-10">
            <div className="grid gap-10 md:grid-cols-[1fr_0.8fr]">
              <div>
                <p className="text-sm font-medium text-white/50">
                  TradeMirror Pro
                </p>

                <div className="mt-3 flex items-end gap-2">
                  <span className="text-5xl font-semibold">$20</span>
                  <span className="pb-1 text-sm text-white/35">
                    / month
                  </span>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    "AI trade capture",
                    "Automatic trade imports",
                    "Weekly AI reviews",
                    "Advanced performance analytics",
                    "Multiple trading accounts",
                    "Payout and expense tracking",
                    "Tax-ready exports",
                    "Expanded screenshot storage",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-sm text-white/60"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-white/30">
                    Your plan
                  </p>

                  <p className="mt-3 text-lg font-medium text-white">
                    TradeMirror Pro
                  </p>

                  <p className="mt-1 text-sm text-white/35">
                    $20 billed monthly
                  </p>
                </div>

                <button
                  disabled
                  className="mt-8 h-12 w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.05] text-sm font-medium text-white/30"
                >
                  Coming soon
                </button>

                <p className="mt-3 text-center text-[11px] leading-5 text-white/25">
                  Secure payments will be processed through Stripe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}