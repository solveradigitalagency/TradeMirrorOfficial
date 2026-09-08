import Navbar from "@/components/layout/navbar";
import { DashboardPreview } from "@/components/landing/hero";
import {
  CalendarDays,
  BookOpen,
  TrendingUp,
  Check,
  Camera,
  Search,
} from "lucide-react";

type RoutineType = "result" | "review" | "pattern";

const routineCards = [
  {
    number: "01",
    icon: CalendarDays,
    title: "Log the result",
    description:
      "Select a trading day and enter your P&L, instrument, setup, and trade direction.",
    type: "result",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Review the decision",
    description:
      "Add notes, screenshots, emotions, and whether you followed your trading plan.",
    type: "review",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Find the pattern",
    description:
      "Use your calendar and analytics to recognize what helps or hurts your performance.",
    type: "pattern",
  },
] satisfies {
  number: string;
  icon: typeof CalendarDays;
  title: string;
  description: string;
  type: RoutineType;
}[];

function RoutinePreview({
  type,
}: {
  type: RoutineType;
}) {
  if (type === "result") {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-[#071019]/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-4">
            <p className="text-[10px] text-white/30">Daily P&L</p>
            <p className="mt-2 text-lg font-semibold text-emerald-400">
              +$420
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-4">
            <p className="text-[10px] text-white/30">Instrument</p>
            <p className="mt-2 text-lg font-semibold text-emerald-400">
              NQ
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (type === "review") {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-[#071019]/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
        <div className="flex items-center gap-3">
          <Check className="h-4 w-4 text-emerald-400" strokeWidth={2} />
          <span className="text-xs text-white/50">
            Followed my trading plan
          </span>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Camera className="h-4 w-4 text-blue-400" strokeWidth={1.8} />
          <span className="text-xs text-white/50">
            Chart screenshot attached
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#071019]/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <div className="flex items-center gap-3">
        <Search className="h-4 w-4 text-white/40" strokeWidth={1.8} />
        <span className="text-xs text-white/40">Best setup</span>
      </div>

      <p className="mt-4 text-sm font-semibold text-white/80">
        Liquidity sweep + IFVG
      </p>

      <p className="mt-2 text-xs font-medium text-emerald-400">
        72% win rate
      </p>
    </div>
  );
}

export default function ProductPage() {
  return (
    <main className="min-h-screen bg-[#02060b] text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative">
        <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-blue-500/[0.07] blur-[180px]" />

        <div className="relative mx-auto max-w-[1450px] px-6 pb-16 pt-24 lg:px-10 lg:pt-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-5xl font-semibold leading-[0.95] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl xl:text-[84px]">
              One place to understand
              <br />
              <span>
                <span className="text-blue-400">every trade</span
                ><span className="text-blue-400">.</span>
              </span>
            </h1>
          </div>

          {/* DASHBOARD */}
          <div className="relative mx-auto mt-20 max-w-[1250px]">
            <div className="pointer-events-none absolute -inset-10 rounded-[40px] bg-blue-500/[0.045] blur-[70px]" />

            <div className="relative overflow-hidden rounded-[28px] border border-white/[0.10] bg-[#08111a]/90 p-2 shadow-[0_40px_120px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="overflow-hidden rounded-[22px]">
                <DashboardPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROUTINE */}
      <section className="relative border-t border-white/[0.045]">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 bg-blue-500/[0.025] blur-[160px]" />

        <div className="relative mx-auto max-w-[1450px] px-6 py-28 lg:px-10 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
              A simple routine built
              <br />
              around improvement.
            </h2>
          </div>

          {/* THREE CARDS */}
          <div className="mt-20 grid gap-5 lg:grid-cols-3">
            {routineCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.number}
                  className="group relative overflow-hidden rounded-[26px] border border-white/[0.085] bg-[#0a141e]/90 p-6 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-blue-400/30 hover:bg-[#0c1823] hover:shadow-[0_25px_70px_rgba(0,0,0,0.35),0_0_50px_rgba(35,133,245,0.07)]"
                >
                  {/* Hover glow */}
                  <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/[0.08] blur-[70px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  {/* Top row */}
                  <div className="relative flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[17px] border border-blue-400/20 bg-blue-500/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-500 group-hover:border-blue-400/40 group-hover:bg-blue-500/[0.09] group-hover:shadow-[0_0_25px_rgba(35,133,245,0.10)]">
                      <Icon
                        className="h-6 w-6 text-blue-400 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:scale-110"
                        strokeWidth={1.7}
                      />
                    </div>

                    <span className="font-mono text-xs text-white/20 transition-colors duration-500 group-hover:text-blue-400/40">
                      {card.number}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="relative mt-12">
                    <h3 className="text-2xl font-semibold tracking-[-0.035em] text-white/90">
                      {card.title}
                    </h3>

                    <p className="mt-4 min-h-[72px] text-sm leading-6 text-white/40">
                      {card.description}
                    </p>
                  </div>

                  {/* Mini UI */}
                  <div className="relative mt-9">
                    <RoutinePreview type={card.type} />
                  </div>

                  {/* Bottom highlight */}
                  <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/0 to-transparent transition-all duration-500 group-hover:via-blue-400/30" />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}