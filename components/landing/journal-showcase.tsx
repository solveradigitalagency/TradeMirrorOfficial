import {
  ArrowRight,
  Check,
  TrendingUp,
} from "lucide-react";

import Link from "next/link";

const benefits = [
  "Track every entry, exit, and decision",
  "Understand which setups actually work",
  "Review your psychology and execution",
  "Turn your history into a repeatable edge",
  "Share your best trades with others",
];

export default function JournalShowcase() {
  return (
    <section className="relative overflow-hidden bg-[#02060b] py-20 sm:py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        {/* Screenshot */}
        <div className="relative mx-auto w-[94%] sm:w-[90%]">
          <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[32px] bg-white/[0.025] blur-3xl" />

          <div className="overflow-hidden rounded-[24px] border border-white/[0.12] bg-[#080a0d] shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
            <img
              src="/trademirror-shareable.png"
              alt="TradeMirror journal entry"
              className="block h-auto w-full"
            />
          </div>
        </div>

        {/* Text */}
        <div>
          <div className="mb-5 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-white/65">
            <TrendingUp className="h-4 w-4" />
            YOUR JOURNAL
          </div>

          <h2 className="text-[42px] font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            Your Journal.
            <br />
            Your Mirror.
            <br />
            <span className="text-white">Your Edge.</span>
          </h2>

          <p className="mt-6 text-[15px] leading-7 text-white/40 sm:mt-7 sm:text-[16px]">
            Trading isn't just about taking trades. It's about understanding
            them. TradeMirror turns your trading history into something you can
            actually learn from.
          </p>

          <div className="mt-7 space-y-4 sm:mt-8">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-start gap-3 text-sm text-white/55"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                  <Check className="h-3 w-3 text-white/80" />
                </span>

                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <Link
            href="/signup"
            className="group mt-8 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white px-5 py-3.5 text-sm font-semibold text-black transition duration-200 hover:bg-white/90 sm:mt-9"
          >
            Start Journaling Free
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}