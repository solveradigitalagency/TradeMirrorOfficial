
import Navbar from "@/components/layout/navbar";
import { DashboardPreview } from "@/components/landing/hero";
import {
  CalendarDays,
  BookOpen,
  TrendingUp,
  Check,
  Camera,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRight,
  Minus,
  Sparkles,
} from "lucide-react";

type RoutineType = "result" | "review" | "pattern";

const routineCards = [
  {
    number: "01",
    eyebrow: "CAPTURE",
    icon: CalendarDays,
    title: "Log the result.",
    description:
      "Record your trading day, instrument, direction, setup, and P&L. Keep the important details in one place.",
    type: "result",
  },
  {
    number: "02",
    eyebrow: "REFLECT",
    icon: BookOpen,
    title: "Review the decision.",
    description:
      "Add your chart screenshots, emotions, and notes. Measure the quality of your execution, not just the outcome.",
    type: "review",
  },
  {
    number: "03",
    eyebrow: "IMPROVE",
    icon: TrendingUp,
    title: "Find the pattern.",
    description:
      "Look back across your trades to understand your strongest setups, recurring mistakes, and areas to improve.",
    type: "pattern",
  },
] satisfies {
  number: string;
  eyebrow: string;
  icon: typeof CalendarDays;
  title: string;
  description: string;
  type: RoutineType;
}[];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <span className="h-px w-5 bg-white/40" />
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
        {children}
      </span>
    </div>
  );
}

function RoutinePreview({ type }: { type: RoutineType }) {
  if (type === "result") {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0b0b]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-white/45" />
            <span className="text-[10px] text-white/55">
              Trading day
            </span>
          </div>
          <span className="text-[10px] text-white/30">
            Oct 14, 2026
          </span>
        </div>

        <div className="p-3.5 sm:p-4">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
            <p className="text-[10px] text-white/35">
              Daily profit & loss
            </p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-[28px] font-medium tracking-[-0.055em] text-white sm:text-[32px]">
                +$420.00
              </p>
              <div className="mb-1 flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1">
                <ArrowUpRight className="h-3 w-3 text-white/60" />
                <span className="text-[9px] text-white/60">
                  Profit
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-white/[0.06] p-3">
              <p className="text-[9px] text-white/30">Instrument</p>
              <p className="mt-1.5 text-sm font-medium text-white/80">
                NQ
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.06] p-3">
              <p className="text-[9px] text-white/30">Direction</p>
              <p className="mt-1.5 text-sm font-medium text-white/80">
                Long
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "review") {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0b0b]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-white/45" />
            <span className="text-[10px] text-white/55">
              Trade reflection
            </span>
          </div>

          <span className="rounded-md border border-white/[0.08] px-2 py-1 text-[9px] text-white/35">
            Private
          </span>
        </div>

        <div className="space-y-3.5 p-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
              <Check className="h-4 w-4 text-white/75" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium text-white/75">
                Trading plan followed
              </p>
              <p className="mt-1 text-[9px] text-white/30">
                Stayed with the original setup
              </p>
            </div>

            <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-white/40" />
          </div>

          <div className="rounded-xl border border-white/[0.07] p-3.5">
            <div className="flex items-center gap-2">
              <Camera className="h-3.5 w-3.5 text-white/45" />
              <span className="text-[10px] text-white/50">
                Chart screenshot
              </span>
            </div>

            <div className="mt-3 flex h-[72px] items-center justify-center rounded-lg border border-dashed border-white/[0.1] bg-white/[0.015]">
              <div className="flex items-center gap-2 text-white/30">
                <Camera className="h-4 w-4" />
                <span className="text-[10px]">
                  Entry chart attached
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0b0b]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5">
        <div className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-white/45" />
          <span className="text-[10px] text-white/55">
            Setup performance
          </span>
        </div>

        <span className="text-[9px] text-white/30">
          Example data
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[9px] uppercase tracking-[0.12em] text-white/30">
              Top-performing setup
            </p>
            <p className="mt-2 text-base font-medium tracking-tight text-white/85">
              Liquidity sweep + IFVG
            </p>
            <p className="mt-1.5 text-[10px] text-white/35">
              Futures · NQ
            </p>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035]">
            <TrendingUp className="h-4 w-4 text-white/65" />
          </div>
        </div>

        <div className="mt-5 border-t border-white/[0.07] pt-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/35">
              Illustrative win rate
            </span>
            <span className="text-sm font-medium text-white/80">
              72%
            </span>
          </div>

          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.08]">
            <div className="h-full w-[72%] rounded-full bg-white/70" />
          </div>
        </div>
      </div>
    </div>
  );
}

function RoutineCard({
  card,
}: {
  card: (typeof routineCards)[number];
}) {
  const Icon = card.icon;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-white/[0.085] bg-[#0a0a0a] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/[0.16] hover:bg-[#0d0d0d] sm:rounded-[28px] sm:p-7 lg:p-8">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.16] to-transparent" />

      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/[0.09] bg-white/[0.035] transition duration-300 group-hover:border-white/[0.17] group-hover:bg-white/[0.06] sm:h-12 sm:w-12">
          <Icon className="h-5 w-5 text-white/75" strokeWidth={1.6} />
        </div>

        <span className="font-mono text-[11px] tracking-wider text-white/25">
          {card.number}
        </span>
      </div>

      <div className="mt-8 sm:mt-10">
        <p className="text-[9px] font-medium tracking-[0.2em] text-white/35">
          {card.eyebrow}
        </p>

        <h3 className="mt-3 text-[25px] font-medium leading-[1.08] tracking-[-0.045em] text-white sm:text-[29px]">
          {card.title}
        </h3>

        <p className="mt-3 min-h-0 max-w-[390px] text-[13px] leading-[1.8] text-white/42 sm:min-h-[70px] sm:text-sm">
          {card.description}
        </p>
      </div>

      <div className="mt-7 flex-1 sm:mt-8">
        <RoutinePreview type={card.type} />
      </div>

      <div className="mt-5 flex items-center gap-2 text-[10px] text-white/30 transition-colors group-hover:text-white/55">
        <span>Part of your daily workflow</span>
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
      </div>
    </article>
  );
}

export default function ProductPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white selection:bg-white selection:text-black">
      <Navbar />

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-280px] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-white/[0.055] blur-[130px] sm:top-[-340px] sm:h-[680px] sm:w-[680px] sm:blur-[180px]" />
          <div className="absolute left-[-200px] top-[45%] h-[350px] w-[350px] rounded-full bg-white/[0.018] blur-[120px]" />
          <div className="absolute right-[-200px] top-[55%] h-[400px] w-[400px] rounded-full bg-white/[0.018] blur-[140px]" />
        </div>

        <div className="relative mx-auto max-w-[1500px] px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-24 md:pt-28 lg:px-10 lg:pb-24 lg:pt-32">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-7 flex justify-center sm:mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.035] px-3.5 py-2">
                <Sparkles className="h-3.5 w-3.5 text-white/65" />
                <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/55 sm:text-[10px]">
                  A clearer view of your trading
                </span>
              </div>
            </div>

            <h1 className="text-[43px] font-semibold leading-[0.98] tracking-[-0.065em] text-white sm:text-6xl md:text-7xl lg:text-[88px] xl:text-[100px]">
              One place to understand
              <span className="mt-1 block text-white/45">
                every trade.
              </span>
            </h1>

            {/* REMOVED PRODUCT DESCRIPTION */}

            {/* REMOVED: GET STARTED BUTTONS AND BADGE LIST */}

          </div>

          {/* DASHBOARD SHOWCASE */}
          <div className="relative mx-auto mt-14 w-full max-w-[1260px] sm:mt-16 lg:mt-20">
            <div className="pointer-events-none absolute -inset-5 rounded-[35px] bg-white/[0.035] blur-[50px] sm:-inset-10 sm:rounded-[45px] sm:blur-[75px]" />

            <div className="relative rounded-[20px] border border-white/[0.12] bg-[#111111] p-1.5 shadow-[0_40px_120px_rgba(0,0,0,0.55)] sm:rounded-[26px] sm:p-2 lg:rounded-[30px]">
              <div className="flex h-8 items-center justify-between rounded-t-[14px] border-b border-white/[0.06] px-3 sm:h-10 sm:px-5">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
                </div>

                <span className="text-[8px] tracking-[0.12em] text-white/25 sm:text-[9px]">
                  TRADEMIRROR / DASHBOARD
                </span>

                <div className="w-8 sm:w-12" />
              </div>

              <div className="overflow-hidden rounded-b-[14px] sm:rounded-b-[19px] lg:rounded-b-[22px]">
                <DashboardPreview />
              </div>
            </div>

            <div className="mx-auto mt-4 flex max-w-[760px] flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center text-[9px] text-white/30 sm:mt-5 sm:gap-x-8 sm:text-[10px]">
              <span>Trade history</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Performance analytics</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Personal journal</span>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section
        id="workflow"
        className="relative border-t border-white/[0.07] bg-[#070707]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-white/[0.018] to-transparent" />

        <div className="relative mx-auto max-w-[1450px] px-4 py-20 sm:px-6 sm:py-24 lg:px-10 lg:py-32">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
            <div className="max-w-2xl">
              <SectionLabel>The workflow</SectionLabel>

              <h2 className="mt-5 text-[35px] font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-5xl md:text-6xl lg:text-[68px]">
                Better trading starts
                <span className="block text-white/40">
                  with better review.
                </span>
              </h2>
            </div>

            <p className="max-w-[390px] text-[13px] leading-7 text-white/40 sm:text-sm sm:leading-8">
              A simple routine turns a collection of trades into a clearer
              picture of your decisions, discipline, and performance.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:mt-14 sm:gap-5 lg:mt-16 lg:grid-cols-3">
            {routineCards.map((card) => (
              <RoutineCard key={card.number} card={card} />
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="relative overflow-hidden border-t border-white/[0.07] bg-[#050505]">
        <div className="pointer-events-none absolute left-1/2 top-[-240px] h-[420px] w-[600px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[130px] sm:h-[520px] sm:w-[800px] sm:blur-[170px]" />

        <div className="relative mx-auto max-w-[1000px] px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-32">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.035]">
            <TrendingUp className="h-5 w-5 text-white/75" />
          </div>

          <h2 className="mx-auto mt-7 max-w-[800px] text-[37px] font-semibold leading-[1.02] tracking-[-0.06em] text-white sm:text-5xl md:text-6xl lg:text-[72px]">
            Your history has
            <span className="block text-white/40">
              something to teach you.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-[470px] text-[13px] leading-7 text-white/40 sm:mt-6 sm:text-sm sm:leading-8">
            Start documenting your decisions and build a more intentional
            approach to every trading session.
          </p>

          {/* REMOVED CTA BUTTON */}

          <p className="mt-4 text-[10px] text-white/25">
            Your trades. Your insights. Your next step.
          </p>
        </div>
      </section>
    </main>
  );
}

function LockIcon() {
  return <span className="inline-flex h-3 w-3 items-center justify-center"><Minus className="h-3 w-3" /></span>;
}
