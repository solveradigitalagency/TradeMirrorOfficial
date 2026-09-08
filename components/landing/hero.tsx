import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="product"
      className="relative min-h-[calc(100vh-78px)] overflow-hidden bg-[#02060b]"
    >
      {/* Ambient lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[30%] top-[0%] h-[650px] w-[650px] rounded-full bg-blue-500/[0.045] blur-[170px]" />
        <div className="absolute right-[2%] top-[8%] h-[700px] w-[700px] rounded-full bg-blue-500/[0.055] blur-[180px]" />
        <div className="absolute bottom-[-30%] left-[25%] h-[600px] w-[800px] rounded-full bg-blue-600/[0.035] blur-[180px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-78px)] max-w-[1500px] items-center px-7 py-10 lg:px-8 xl:px-10">
        <div className="grid w-full grid-cols-[0.82fr_1.18fr] items-center gap-8 xl:gap-10">

          {/* LEFT SIDE */}
          <div className="relative z-20 -translate-y-8 max-w-[620px]">
            {/* Badge */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-[#07101a]/75 px-3.5 py-2 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2387ff] shadow-[0_0_10px_rgba(35,135,255,0.95)]" />

              <span className="text-[9px] font-medium tracking-[0.065em] text-white/55">
                BUILT BY TRADERS, FOR TRADERS
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-[78px] font-semibold leading-[0.9] tracking-[-0.055em] text-white lg:text-[88px] xl:text-[96px] 2xl:text-[102px]">
              <span className="block">See It.</span>
              <span className="block">Analyze It.</span>
              <span className="block text-[#2387ff]">Trade It.</span>
            </h1>

            {/* Description */}
            <p className="mt-8 max-w-[525px] text-[15px] leading-[1.7] text-white/45 lg:text-[16px]">
              The all-in-one trading journal that helps you reflect on every
              trade, find your edge, and become consistently profitable.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex items-center gap-3">
              <Link
                href="/signup"
                className="group flex h-[54px] items-center gap-3 rounded-[10px] border border-blue-300/25 bg-[#1677f3] px-4 text-[11px] font-semibold text-white shadow-[0_10px_35px_rgba(35,133,245,0.24),inset_0_1px_0_rgba(255,255,255,0.2)] transition hover:bg-[#2785f6]"
              >
                Start Journaling Free

                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                href="/features"
                className="flex h-[54px] items-center rounded-[10px] border border-white/[0.10] bg-white/[0.015] px-5 text-[11px] font-medium text-white/65 transition hover:border-white/20 hover:bg-white/[0.035] hover:text-white"
              >
                View Features
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE — STATIC DASHBOARD SCREENSHOT */}
          <div className="relative -translate-x-6 scale-[1.08]">
            <DashboardPreview />
          </div>

        </div>
      </div>
    </section>
  );
}

/**
 * Static dashboard preview.
 *
 * This is intentionally just an image.
 * It does NOT load the real dashboard, Supabase,
 * sidebar, charts, authentication, or any dashboard logic.
 */
export function DashboardPreview() {
  return (
    <div className="relative w-full overflow-hidden rounded-[28px] border border-white/[0.10] bg-[#03070d] shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
      
      {/* Blue ambient glow */}
      <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[40px] bg-blue-500/[0.06] blur-[70px]" />

      <img
        src="/dashboard-preview.png"
        alt="TradeMirror dashboard preview"
        className="block h-auto w-full"
      />
    </div>
  );
}