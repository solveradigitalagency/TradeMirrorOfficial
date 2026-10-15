
"use client";

import type { ReactNode } from "react";

type PnlValueProps = {
  value: number | null | undefined;
  children?: ReactNode;
  className?: string;
  showSign?: boolean;
};

export default function PnlValue({
  value,
  children,
  className = "",
  showSign = false,
}: PnlValueProps) {
  const amount = Number(value ?? 0);

  const colorClass =
    amount > 0
      ? "text-emerald-400"
      : amount < 0
        ? "text-red-400"
        : "text-white/70";

  const formattedValue =
    children ??
    `${showSign && amount > 0 ? "+" : ""}${new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(amount)}`;

  return (
    <span className={`${colorClass} ${className}`}>
      {formattedValue}
    </span>
  );
}
