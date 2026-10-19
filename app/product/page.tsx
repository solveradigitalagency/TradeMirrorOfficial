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
      <div className="rounded-2xl border border-white/[0.07] bg-[#071019]/80 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] sm:p-4">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-3.5 sm:p-4">
            <p className="text-[10px] text-white/30">Daily P&L</p>
            <p className="mt-2 text-base font-semibold text-emerald-400 sm:text-lg">
              +$420
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-3.5 sm:p-4">
            <p className="text-[10px] text-white/30">Instrument</p>
            <p className="mt-2 text-base font-semibold text-emerald-400 sm:text-lg">
              NQ
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (type === "review") {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-[#071019]/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] sm:p-5">
        <div className="flex items-center gap-3">
          <Check
            className="h-4 w-4 shrink-0 text-emerald-400"
            strokeWidth={2}
          />

          <span className="text-xs text-white/50">
            Followed my trading plan
          </span>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Camera
            className="h-4 w-4 shrink-0 text-white/60"
            strokeWidth={1.8}
          />

          <span className="text-xs text-white/50">
            Chart screenshot attached
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#071019]/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] sm:p-5">
      <div className="flex items-center gap-3">
        <Search
          className="h-4 w-4 shrink-0 text-white/40"
          strokeWidth={1.8}
        />

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
    <main className="min-h-screen overflow-x-hidden bg-[#02060b] text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative">
        <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/[0.025] blur-[150px] sm:top-[-220px] sm:h-[650px] sm:w-[650px] sm:blur-[180px]" />

        <div className="relative mx-auto max-w-[1450px] px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-20 md:pt-24 lg:px-10 lg:pb-16 lg:pt-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-[43px] font-semibold leading-[0.96] tracking-[-0.055em] text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-[84px]">
              One place to understand
              <br />
              <span>
                <span className="text-white">every trade</span>
                <span className="text-white">.</span>
              </span>
            </h1>
          </div>

          {/* DASHBOARD */}
          <div className="relative mx-auto mt-12 w-full max-w-[1250px] sm:mt-16 lg:mt-20">
            <div className="pointer-events-none absolute -inset-6 rounded-[35px] bg-white/[0.025] blur-[60px] sm:-inset-10 sm:rounded-[40px] sm:blur-[70px]" />

            <div className="relative overflow-hidden rounded-[20px] border border-white/[0.10] bg-[#08111a]/90 p-1.5 shadow-[0_30px_90px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)] sm:rounded-[24px] sm:p-2 lg:rounded-[28px]">
              <div className="overflow-hidden rounded-[16px] sm:rounded-[19px] lg:rounded-[22px]">
                <DashboardPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROUTINE */}
      <section className="relative border-t border-white/[0.045]">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[500px] -translate-x-1/2 bg-white/[0.015] blur-[140px] sm:h-[500px] sm:w-[700px] sm:blur-[160px]" />

        <div className="relative mx-auto max-w-[1450px] px-4 py-20 sm:px-6 sm:py-24 lg:px-10 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[34px] font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-4xl md:text-5xl lg:text-6xl">
              A simple routine built
              <br />
              around improvement.
            </h2>
          </div>

          {/* THREE CARDS */}
          <div className="mt-12 grid gap-4 sm:mt-16 sm:gap-5 lg:mt-20 lg:grid-cols-3">
            {routineCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.number}
                  className="group relative overflow-hidden rounded-[22px] border border-white/[0.085] bg-[#0a141e]/90 p-5 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-white/20 hover:bg-[#0c1823] hover:shadow-[0_25px_70px_rgba(0,0,0,0.35)] sm:rounded-[26px] sm:p-6"
                >
                  {/* Hover glow */}
                  <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/[0.04] blur-[70px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  {/* Top row */}
                  <div className="relative flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[15px] border border-white/10 bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-500 group-hover:border-white/20 group-hover:bg-white/[0.06] group-hover:shadow-[0_0_25px_rgba(255,255,255,0.04)] sm:h-14 sm:w-14 sm:rounded-[17px]">
                      <Icon
                        className="h-5 w-5 text-white/80 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:scale-110 sm:h-6 sm:w-6"
                        strokeWidth={1.7}
                      />
                    </div>

                    <span className="font-mono text-xs text-white/20 transition-colors duration-500 group-hover:text-white/50">
                      {card.number}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="relative mt-9 sm:mt-12">
                    <h3 className="text-xl font-semibold tracking-[-0.035em] text-white/90 sm:text-2xl">
                      {card.title}
                    </h3>

                    <p className="mt-4 min-h-0 text-sm leading-6 text-white/40 sm:min-h-[72px]">
                      {card.description}
                    </p>
                  </div>

                  {/* Mini UI */}
                  <div className="relative mt-7 sm:mt-9">
                    <RoutinePreview type={card.type} />
                  </div>

                  {/* Bottom highlight */}
                  <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-white/0 to-transparent transition-all duration-500 group-hover:via-white/20" />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}