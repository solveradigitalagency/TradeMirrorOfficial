import {
  BarChart3,
  BookOpen,
  Share2,
  Target,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Journal Every Detail",
    description:
      "Log every trade with screenshots, notes, setups, emotions, and everything that matters.",
  },
  {
    icon: BarChart3,
    title: "Powerful Analytics",
    description:
      "Uncover patterns, track performance, and understand exactly what drives your results.",
  },
  {
    icon: Share2,
    title: "Share & Inspire",
    description:
      "Download beautiful trade cards and share your best trades with the trading community.",
  },
  {
    icon: Target,
    title: "Stay Consistent",
    description:
      "Set goals, track progress, and build the habits that turn good trading into consistency.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative mx-auto max-w-[1300px] px-4 pb-20 sm:px-6 sm:pb-24 lg:px-0 lg:pb-28"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="group relative flex h-full flex-col rounded-2xl border border-white/[0.09] bg-white/[0.02] p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.045] hover:shadow-[0_12px_40px_rgba(255,255,255,0.025)] sm:p-6 lg:p-5 xl:p-6"
            >
              {/* Subtle highlight along the top edge */}
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent transition-colors duration-300 group-hover:via-white/25" />

              {/* Icon */}
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.035] transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/[0.07]">
                <Icon
                  className="h-5 w-5 text-white/75 transition-colors duration-300 group-hover:text-white"
                  strokeWidth={1.7}
                />
              </div>

              {/* Content */}
              <h3 className="text-sm font-semibold tracking-[-0.01em] text-white/90 sm:text-[15px]">
                {feature.title}
              </h3>

              <p className="mx-auto mt-3 max-w-[260px] flex-1 text-xs leading-6 text-white/50 sm:text-[13px]">
                {feature.description}
              </p>

              {/* Small hover indicator */}
              <div className="mx-auto mt-4 h-px w-8 bg-white/10 transition-all duration-300 group-hover:w-12 group-hover:bg-white/35" />
            </div>
          );
        })}
      </div>
    </section>
  );
}