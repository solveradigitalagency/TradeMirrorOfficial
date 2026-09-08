import {
    ArrowDownRight,
    ArrowUpRight,
    Brain,
    CheckCircle2,
    CircleAlert,
    Lightbulb,
    Sparkles,
    Target,
    TrendingUp,
  } from "lucide-react";
  import { redirect } from "next/navigation";
  import { createClient } from "@/lib/supabase/server";
  
  export default async function AIReviewPage() {
    const supabase = await createClient();
  
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user) {
      redirect("/login");
    }
  
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();
  
    if (profile?.plan !== "pro") {
      redirect("/dashboard");
    }
  
    return (
      <main className="min-h-screen bg-[#03070d] px-6 py-7 text-white">
        <div className="mx-auto max-w-[1400px]">
  
          {/* HEADER */}
          <div className="mb-7 flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10">
                  <Sparkles className="h-4 w-4 text-blue-300" />
                </div>
  
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300/70">
                  AI Weekly Overview
                </span>
              </div>
  
              <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-white">
                Your Trading Review
              </h1>
  
              <p className="mt-1.5 text-sm text-white/35">
                September 1 – September 7, 2026
              </p>
            </div>
  
            <div className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-[11px] font-medium text-emerald-300/80">
                REVIEW READY
              </span>
            </div>
          </div>
  
          {/* AI INTRO */}
          <div className="relative mb-5 overflow-hidden rounded-[24px] border border-blue-400/10 bg-gradient-to-br from-blue-500/[0.09] via-[#08111d] to-[#050a11] p-6">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/[0.08] blur-3xl" />
  
            <div className="relative flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-300/15 bg-blue-400/10">
                <Sparkles className="h-5 w-5 text-blue-300" />
              </div>
  
              <div>
                <p className="text-sm font-medium text-white">
                  Your week at a glance
                </p>
  
                <p className="mt-1.5 max-w-3xl text-[13px] leading-6 text-white/45">
                  TradeMirror analyzed your trading performance, execution,
                  setups, and behavior from this week to identify the patterns
                  that matter most.
                </p>
              </div>
            </div>
          </div>
  
          {/* PERFORMANCE */}
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
  
            <StatCard
              label="Net P&L"
              value="+$3,420"
              positive
              icon={<TrendingUp className="h-4 w-4" />}
            />
  
            <StatCard
              label="Win Rate"
              value="68.4%"
              positive
              icon={<Target className="h-4 w-4" />}
            />
  
            <StatCard
              label="Profit Factor"
              value="2.14"
              positive
              icon={<ArrowUpRight className="h-4 w-4" />}
            />
  
            <StatCard
              label="Average R"
              value="+1.42R"
              positive
              icon={<ArrowUpRight className="h-4 w-4" />}
            />
  
            <StatCard
              label="Trades"
              value="19"
              icon={<Brain className="h-4 w-4" />}
            />
  
          </div>
  
          {/* AI SUMMARY */}
          <SectionCard
            icon={<Sparkles className="h-4 w-4 text-blue-300" />}
            label="AI SUMMARY"
            title="A strong week with disciplined execution."
          >
            <p className="text-[13px] leading-6 text-white/45">
              Your performance improved compared with the previous week.
              You maintained a positive expectancy while keeping your losses
              relatively controlled. The strongest part of your week was your
              ability to wait for higher-quality setups instead of forcing
              trades during slower conditions.
            </p>
  
            <p className="mt-3 text-[13px] leading-6 text-white/45">
              The main opportunity is consistency. Your best trades followed a
              clear process, while most of your weaker trades came from entering
              before your full confirmation was present.
            </p>
          </SectionCard>
  
          {/* TWO COLUMN */}
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
  
            {/* STRENGTHS */}
            <SectionCard
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-300" />}
              label="WHAT YOU DID WELL"
              title="Your strongest habits this week"
            >
              <Insight
                title="Stayed with your best setups"
                text="Your highest-performing trades came from the setups you consistently identified as A-quality opportunities."
                positive
              />
  
              <Insight
                title="Controlled losing trades"
                text="Average losing trades remained significantly smaller than your average winners."
                positive
              />
  
              <Insight
                title="Strong directional discipline"
                text="Your long and short performance stayed relatively balanced instead of repeatedly forcing one direction."
                positive
              />
            </SectionCard>
  
            {/* PATTERNS */}
            <SectionCard
              icon={<Brain className="h-4 w-4 text-purple-300" />}
              label="PATTERNS AI FOUND"
              title="What your data is telling you"
            >
              <Insight
                title="Best performance during New York"
                text="Your highest average R multiple came during the New York session."
              />
  
              <Insight
                title="Early entries reduced expectancy"
                text="Several losing trades entered before the setup received full confirmation."
                warning
              />
  
              <Insight
                title="A-quality setups outperform"
                text="Trades matching your preferred setup produced substantially better results than lower-quality entries."
              />
            </SectionCard>
  
          </div>
  
          {/* EXECUTION + PSYCHOLOGY */}
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
  
            <SectionCard
              icon={<Target className="h-4 w-4 text-blue-300" />}
              label="EXECUTION ANALYSIS"
              title="Your process was mostly consistent"
            >
              <p className="text-[13px] leading-6 text-white/45">
                Your execution rating was strongest on trades where you waited
                for confirmation and followed your predefined risk. Trades marked
                as lower-quality generally showed more deviation from your plan.
              </p>
  
              <div className="mt-5 space-y-3">
                <ProgressRow label="Followed Plan" value="84%" />
                <ProgressRow label="Execution Rating" value="79%" />
                <ProgressRow label="Setup Quality" value="76%" />
              </div>
            </SectionCard>
  
            <SectionCard
              icon={<Brain className="h-4 w-4 text-purple-300" />}
              label="PSYCHOLOGY"
              title="Confidence was a strength — patience was the opportunity"
            >
              <p className="text-[13px] leading-6 text-white/45">
                Your best results came when you described yourself as focused or
                confident. Lower-quality trades were more frequently associated
                with hesitation and impulsive decision-making.
              </p>
  
              <div className="mt-5 flex flex-wrap gap-2">
                <EmotionPill label="Focused" />
                <EmotionPill label="Confident" />
                <EmotionPill label="Calm" />
                <EmotionPill label="Hesitant" muted />
                <EmotionPill label="Impulsive" warning />
              </div>
            </SectionCard>
  
          </div>
  
          {/* IMPROVEMENTS */}
          <div className="mt-5">
            <SectionCard
              icon={<CircleAlert className="h-4 w-4 text-amber-300" />}
              label="WHAT TO IMPROVE"
              title="Three things to focus on next week"
            >
              <div className="grid gap-3 md:grid-cols-3">
  
                <Improvement
                  number="01"
                  title="Wait for confirmation"
                  text="Avoid entering simply because price reaches an area of interest. Require your full confirmation before committing."
                />
  
                <Improvement
                  number="02"
                  title="Protect your best days"
                  text="When your process is working, avoid taking additional low-quality trades simply because you are already profitable."
                />
  
                <Improvement
                  number="03"
                  title="Repeat what works"
                  text="Your highest-quality setups generated the strongest results. Prioritize those conditions instead of expanding your criteria."
                />
  
              </div>
            </SectionCard>
          </div>
  
          {/* NEXT WEEK */}
          <div className="relative mt-5 overflow-hidden rounded-[24px] border border-blue-400/15 bg-gradient-to-br from-blue-500/[0.10] to-[#07101a] p-6">
            <div className="pointer-events-none absolute -bottom-24 -right-20 h-56 w-56 rounded-full bg-blue-500/[0.08] blur-3xl" />
  
            <div className="relative flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-300/15 bg-blue-400/10">
                <Lightbulb className="h-5 w-5 text-blue-300" />
              </div>
  
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-300/65">
                  NEXT WEEK'S FOCUS
                </p>
  
                <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-white">
                  Trade less, but make every entry count.
                </h2>
  
                <p className="mt-2 max-w-3xl text-[13px] leading-6 text-white/40">
                  Your data suggests that your edge is strongest when you wait
                  for your highest-quality conditions. Focus on patience,
                  confirmation, and repeating the setups that consistently
                  produce your best results.
                </p>
              </div>
            </div>
          </div>
  
          {/* FOOTER */}
          <p className="py-6 text-center text-[11px] text-white/20">
            AI-generated analysis based on your TradeMirror journal data.
            This review is for educational and journaling purposes only.
          </p>
  
        </div>
      </main>
    );
  }
  
  
  /* =========================================================
     COMPONENTS
  ========================================================= */
  
  function StatCard({
    label,
    value,
    positive,
    icon,
  }: {
    label: string;
    value: string;
    positive?: boolean;
    icon: React.ReactNode;
  }) {
    return (
      <div className="rounded-[18px] border border-white/[0.06] bg-white/[0.025] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-white/30">
            {label}
          </span>
  
          <span className={positive ? "text-emerald-300/60" : "text-white/25"}>
            {icon}
          </span>
        </div>
  
        <p
          className={`mt-2 text-[19px] font-semibold tracking-[-0.03em] ${
            positive ? "text-emerald-300" : "text-white"
          }`}
        >
          {value}
        </p>
      </div>
    );
  }
  
  
  function SectionCard({
    icon,
    label,
    title,
    children,
  }: {
    icon: React.ReactNode;
    label: string;
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <section className="rounded-[24px] border border-white/[0.06] bg-white/[0.025] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
        <div className="flex items-center gap-2">
          {icon}
  
          <span className="text-[10px] font-semibold tracking-[0.17em] text-white/30">
            {label}
          </span>
        </div>
  
        <h2 className="mt-2 text-[17px] font-semibold tracking-[-0.025em] text-white">
          {title}
        </h2>
  
        <div className="mt-4">
          {children}
        </div>
      </section>
    );
  }
  
  
  function Insight({
    title,
    text,
    positive,
    warning,
  }: {
    title: string;
    text: string;
    positive?: boolean;
    warning?: boolean;
  }) {
    return (
      <div className="border-b border-white/[0.05] py-3.5 first:pt-0 last:border-0 last:pb-0">
        <div className="flex items-start gap-3">
          <span
            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
              positive
                ? "bg-emerald-400"
                : warning
                  ? "bg-amber-400"
                  : "bg-blue-400"
            }`}
          />
  
          <div>
            <p className="text-[13px] font-medium text-white/80">
              {title}
            </p>
  
            <p className="mt-1 text-[12px] leading-5 text-white/35">
              {text}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  
  function ProgressRow({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) {
    return (
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] text-white/35">{label}</span>
          <span className="text-[11px] font-medium text-white/60">{value}</span>
        </div>
  
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full bg-blue-400/70"
            style={{ width: value }}
          />
        </div>
      </div>
    );
  }
  
  
  function EmotionPill({
    label,
    muted,
    warning,
  }: {
    label: string;
    muted?: boolean;
    warning?: boolean;
  }) {
    return (
      <span
        className={`rounded-full border px-3 py-1 text-[11px] ${
          warning
            ? "border-amber-400/15 bg-amber-400/[0.06] text-amber-300/70"
            : muted
              ? "border-white/[0.06] bg-white/[0.025] text-white/30"
              : "border-blue-400/15 bg-blue-400/[0.06] text-blue-300/70"
        }`}
      >
        {label}
      </span>
    );
  }
  
  
  function Improvement({
    number,
    title,
    text,
  }: {
    number: string;
    title: string;
    text: string;
  }) {
    return (
      <div className="rounded-[18px] border border-white/[0.05] bg-black/10 p-4">
        <span className="text-[10px] font-semibold tracking-[0.15em] text-blue-300/45">
          {number}
        </span>
  
        <h3 className="mt-2 text-[13px] font-semibold text-white/80">
          {title}
        </h3>
  
        <p className="mt-1.5 text-[12px] leading-5 text-white/35">
          {text}
        </p>
      </div>
    );
  }