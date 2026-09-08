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
        className="relative mx-auto max-w-[1300px] px-6 pb-28 lg:px-0"
      >
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#07101a]/80 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
  
              return (
                <div
                  key={feature.title}
                  className={`group relative px-8 py-9 text-center transition hover:bg-white/[0.025] ${
                    index !== 0
                      ? "border-t border-white/[0.07] md:border-l md:border-t-0"
                      : ""
                  }`}
                >
                  {/* Icon */}
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition group-hover:border-blue-400/35 group-hover:bg-blue-500/[0.07]">
                    <Icon className="h-7 w-7 text-blue-500" strokeWidth={1.8} />
                  </div>
  
                  <h3 className="text-sm font-semibold text-white/85">
                    {feature.title}
                  </h3>
  
                  <p className="mx-auto mt-4 max-w-[220px] text-[11px] leading-5 text-white/30">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }