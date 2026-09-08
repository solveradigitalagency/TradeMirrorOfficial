"use client";

import { useEffect, useState } from "react";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

export default function DashboardGreeting({
  name,
}: {
  name: string;
}) {
  const [text, setText] = useState("");
  const [subtitleVisible, setSubtitleVisible] = useState(false);

  useEffect(() => {
    const greeting = `${getGreeting()}, ${name}.`;

    let index = 0;

    const typing = window.setInterval(() => {
      index += 1;
      setText(greeting.slice(0, index));

      if (index >= greeting.length) {
        window.clearInterval(typing);

        window.setTimeout(() => {
          setSubtitleVisible(true);
        }, 180);
      }
    }, 48);

    return () => {
      window.clearInterval(typing);
    };
  }, [name]);

  return (
    <div>
      <h1 className="min-h-[32px] text-[25px] font-semibold tracking-[-0.04em] text-white">
        {text}
        <span className="ml-1 inline-block h-[25px] w-[2px] translate-y-[4px] animate-pulse bg-blue-400/80" />
      </h1>

      <p
        className={`mt-1.5 text-[13px] text-white/35 transition-all duration-500 ${
          subtitleVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-1 opacity-0"
        }`}
      >
        Here's how you're trading.
      </p>
    </div>
  );
}