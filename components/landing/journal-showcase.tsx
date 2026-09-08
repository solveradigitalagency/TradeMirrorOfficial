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
    <section className="relative overflow-hidden bg-[#02060b] py-32">
      <div className="mx-auto grid max-w-[1400px] items-center gap-16 px-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Screenshot */}
        <div className="relative">
          <div className="mx-auto w-[85%] overflow-hidden rounded-[24px] border border-white/[0.10] bg-[#07101a] shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
            <img
              src="/trademirror-shareable.png"
              alt="TradeMirror journal entry"
              className="block h-auto w-full"
            />
          </div>
        </div>

        {/* Text */}
        <div>
          <div className="mb-5 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-blue-400">
            <TrendingUp className="h-4 w-4" />
            YOUR JOURNAL
          </div>

          <h2 className="text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl">
            Your Journal.
            <br />
            Your Mirror.
            <br />
            <span className="text-blue-500">Your Edge.</span>
          </h2>

          <p className="mt-7 text-[16px] leading-7 text-white/40">
            Trading isn't just about taking trades. It's about understanding
            them. TradeMirror turns your trading history into something you can
            actually learn from.
          </p>

          <div className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-3 text-sm text-white/55"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                  <Check className="h-3 w-3 text-blue-400" />
                </span>
                {benefit}
              </div>
            ))}
          </div>

          <Link
            href="/signup"
            className="group mt-9 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(37,99,235,0.2)] transition hover:bg-blue-400"
          >
            Start Journaling Free
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}