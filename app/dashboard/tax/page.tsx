"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  BarChart3,
  CalendarDays,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Filter,
  Landmark,
  Loader2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import jsPDF from "jspdf";
import { createClient } from "@/lib/supabase/client";
import PnlValue from "@/components/dashboard/PnlValue";

type Trade = {
  id: string;
  trade_date: string;
  entry_time: string | null;
  exit_time: string | null;
  symbol: string;
  market: string;
  direction: "Long" | "Short";
  entry_price: number | null;
  exit_price: number | null;
  quantity: number;
  pnl: number;
  risk_amount: number | null;
  r_multiple: number | null;
  setup: string | null;
  market_condition: string | null;
  session: string | null;
  grade: string | null;
  followed_plan: boolean | null;
  notes: string | null;
  screenshot_url: string | null;
  emotion: string | null;
  execution_rating: string | null;
  visibility: string;
};

type Breakdown = {
  name: string;
  trades: number;
  grossProfit: number;
  grossLoss: number;
  pnl: number;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function money(value: number) {
  return `${value < 0 ? "-" : ""}$${Math.abs(value).toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

function shortMoney(value: number) {
  if (Math.abs(value) >= 1000000) {
    return `${value < 0 ? "-" : ""}$${(
      Math.abs(value) / 1000000
    ).toFixed(1)}M`;
  }

  if (Math.abs(value) >= 1000) {
    return `${value < 0 ? "-" : ""}$${(
      Math.abs(value) / 1000
    ).toFixed(1)}K`;
  }

  return money(value);
}

// Net P&L colors: positive green, negative red, neutral off-white
function pnlClass(value: number) {
  if (value > 0) return "text-emerald-400";
  if (value < 0) return "text-rose-400";
  return "text-white/45";
}

function csvEscape(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: unknown[][]) {
  const csv = rows
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

function buildBreakdown(
  trades: Trade[],
  getName: (trade: Trade) => string,
): Breakdown[] {
  const map = new Map<string, Breakdown>();

  for (const trade of trades) {
    const name = getName(trade) || "Unspecified";

    if (!map.has(name)) {
      map.set(name, {
        name,
        trades: 0,
        grossProfit: 0,
        grossLoss: 0,
        pnl: 0,
      });
    }

    const row = map.get(name)!;

    row.trades += 1;
    row.pnl += trade.pnl;

    if (trade.pnl > 0) {
      row.grossProfit += trade.pnl;
    } else if (trade.pnl < 0) {
      row.grossLoss += trade.pnl;
    }
  }

  return [...map.values()].sort((a, b) => b.pnl - a.pnl);
}

function BreakdownTable({
  title,
  rows,
}: {
  title: string;
  rows: Breakdown[];
}) {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#171717] via-[#111111] to-[#0a0a0a] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-white">
            {title}
          </h2>

          <p className="mt-1 text-[11px] text-white/30">
            Performance breakdown
          </p>
        </div>

        <BarChart3 className="h-4 w-4 text-white/20" />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/[0.07] py-10 text-center text-xs text-white/25">
          No data available for this period.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/[0.06]">
          <div className="grid grid-cols-[1.3fr_0.7fr_1fr_1fr_1fr] border-b border-white/[0.06] bg-white/[0.025] px-4 py-3 text-[9px] font-medium uppercase tracking-[0.12em] text-white/25">
            <span>Name</span>
            <span>Trades</span>
            <span>Gross Profit</span>
            <span>Gross Loss</span>
            <span className="text-right">Net P&L</span>
          </div>

          {rows.map((row) => (
            <div
              key={row.name}
              className="grid grid-cols-[1.3fr_0.7fr_1fr_1fr_1fr] items-center border-b border-white/[0.045] px-4 py-3 last:border-0"
            >
              <span className="truncate text-[12px] font-medium text-white/75">
                {row.name}
              </span>

              <span className="text-[11px] text-white/40">
                {row.trades}
              </span>

              {/* Gross Profit coloring */}
              <span
                className={`text-[11px] font-medium ${
                  row.grossProfit > 0 ? "text-emerald-400" : "text-white/45"
                }`}
              >
                {money(row.grossProfit)}
              </span>

              {/* Gross Loss coloring */}
              <span
                className={`text-[11px] font-medium ${
                  row.grossLoss < 0 ? "text-rose-400" : "text-white/45"
                }`}
              >
                {money(row.grossLoss)}
              </span>

              <PnlValue
                value={row.pnl}
                showSign
                className={`text-right text-[12px] font-semibold ${pnlClass(
                  row.pnl,
                )}`}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function TaxCenterPage() {
  const supabase = useMemo(() => createClient(), []);

  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const [downloading, setDownloading] = useState<
    "detailed" | "pdf" | null
  >(null);

  const years = Array.from(
    { length: 6 },
    (_, index) => currentYear - index,
  );

  useEffect(() => {
    async function loadTrades() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setTrades([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("trades")
        .select(`
          id,
          trade_date,
          entry_time,
          exit_time,
          symbol,
          market,
          direction,
          entry_price,
          exit_price,
          quantity,
          pnl,
          risk_amount,
          r_multiple,
          setup,
          market_condition,
          session,
          grade,
          followed_plan,
          notes,
          screenshot_url,
          emotion,
          execution_rating,
          visibility
        `)
        .eq("user_id", user.id)
        .gte("trade_date", `${year}-01-01`)
        .lte("trade_date", `${year}-12-31`)
        .order("trade_date", { ascending: true });

      if (error) {
        console.error("TAX CENTER ERROR:", error.message);
        setTrades([]);
      } else {
        setTrades((data ?? []) as Trade[]);
      }

      setLoading(false);
    }

    loadTrades();
  }, [supabase, year]);

  const stats = useMemo(() => {
    let netPnl = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let winningTrades = 0;
    let losingTrades = 0;
    let breakevenTrades = 0;

    for (const trade of trades) {
      netPnl += trade.pnl;

      if (trade.pnl > 0) {
        grossProfit += trade.pnl;
        winningTrades++;
      } else if (trade.pnl < 0) {
        grossLoss += trade.pnl;
        losingTrades++;
      } else {
        breakevenTrades++;
      }
    }

    return {
      netPnl,
      grossProfit,
      grossLoss,
      totalTrades: trades.length,
      winningTrades,
      losingTrades,
      breakevenTrades,
    };
  }, [trades]);

  const winRate =
    stats.totalTrades > 0
      ? (stats.winningTrades / stats.totalTrades) * 100
      : 0;

  const profitFactor =
    Math.abs(stats.grossLoss) > 0
      ? stats.grossProfit / Math.abs(stats.grossLoss)
      : stats.grossProfit > 0
        ? Infinity
        : 0;

  const monthly = useMemo(() => {
    return MONTHS.map((month, index) => {
      const monthTrades = trades.filter(
        (trade) =>
          new Date(
            `${trade.trade_date}T00:00:00`,
          ).getMonth() === index,
      );

      const grossProfit = monthTrades
        .filter((trade) => trade.pnl > 0)
        .reduce((sum, trade) => sum + trade.pnl, 0);

      const grossLoss = monthTrades
        .filter((trade) => trade.pnl < 0)
        .reduce((sum, trade) => sum + trade.pnl, 0);

      return {
        month,
        trades: monthTrades.length,
        grossProfit,
        grossLoss,
        pnl: grossProfit + grossLoss,
      };
    });
  }, [trades]);

  const quarterly = useMemo(() => {
    return [0, 1, 2, 3].map((quarter) => {
      const quarterTrades = trades.filter((trade) => {
        const month = new Date(
          `${trade.trade_date}T00:00:00`,
        ).getMonth();

        return Math.floor(month / 3) === quarter;
      });

      const pnl = quarterTrades.reduce(
        (sum, trade) => sum + trade.pnl,
        0,
      );

      return {
        name: `Q${quarter + 1}`,
        trades: quarterTrades.length,
        pnl,
        grossProfit: quarterTrades
          .filter((trade) => trade.pnl > 0)
          .reduce((sum, trade) => sum + trade.pnl, 0),
        grossLoss: quarterTrades
          .filter((trade) => trade.pnl < 0)
          .reduce((sum, trade) => sum + trade.pnl, 0),
      };
    });
  }, [trades]);

  const instruments = useMemo(
    () => buildBreakdown(trades, (trade) => trade.symbol),
    [trades],
  );

  const directions = useMemo(
    () => buildBreakdown(trades, (trade) => trade.direction),
    [trades],
  );

  const setups = useMemo(
    () =>
      buildBreakdown(
        trades,
        (trade) => trade.setup || "Unspecified",
      ),
    [trades],
  );

  const maxMonthlyPnl = useMemo(() => {
    return Math.max(
      1,
      ...monthly.map((month) => Math.abs(month.pnl)),
    );
  }, [monthly]);

  function handleDetailedDownload() {
    setDownloading("detailed");

    const rows: unknown[][] = [
      [
        "Date",
        "Instrument",
        "Direction",
        "Entry",
        "Exit",
        "Quantity",
        "P&L",
        "R Multiple",
        "Setup",
        "Market",
        "Entry Time",
        "Exit Time",
        "Risk Amount",
        "Market Condition",
        "Session",
        "Grade",
        "Followed Plan",
        "Emotion",
        "Execution Rating",
        "Visibility",
        "Notes",
        "Trade ID",
      ],
    ];

    for (const trade of trades) {
      rows.push([
        trade.trade_date,
        trade.symbol,
        trade.direction,
        trade.entry_price,
        trade.exit_price,
        trade.quantity,
        trade.pnl,
        trade.r_multiple,
        trade.setup,
        trade.market,
        trade.entry_time,
        trade.exit_time,
        trade.risk_amount,
        trade.market_condition,
        trade.session,
        trade.grade,
        trade.followed_plan == null
          ? ""
          : trade.followed_plan
            ? "Yes"
            : "No",
        trade.emotion,
        trade.execution_rating,
        trade.visibility,
        trade.notes,
        trade.id,
      ]);
    }

    downloadCsv(
      `trademirror-${year}-detailed-trades.csv`,
      rows,
    );

    setTimeout(() => setDownloading(null), 500);
  }

  function handlePdfDownload() {
    setDownloading("pdf");

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 18;
    let y = 20;

    // <-- PDF color palette for more monochrome
    const blue = {
      r: 25,
      g: 25,
      b: 25,
    };

    const dark = {
      r: 25,
      g: 30,
      b: 38,
    };

    const gray = {
      r: 105,
      g: 110,
      b: 120,
    };

    const light = {
      r: 235,
      g: 237,
      b: 240,
    };

    function addPageIfNeeded(requiredHeight: number) {
      if (y + requiredHeight > pageHeight - 18) {
        doc.addPage();
        y = 20;
        return true;
      }

      return false;
    }

    function formatPdfMoney(value: number) {
      return `${value < 0 ? "-" : ""}$${Math.abs(value).toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      )}`;
    }

    function drawHeader() {
      doc.setFillColor(blue.r, blue.g, blue.b);
      doc.rect(0, 0, pageWidth, 5, "F");

      doc.setTextColor(dark.r, dark.g, dark.b);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("TradeMirror", margin, y);

      y += 9;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(gray.r, gray.g, gray.b);
      doc.text("Tax & Trading Activity Report", margin, y);

      y += 7;

      doc.setFontSize(10);
      doc.text(`Tax Year ${year}`, margin, y);

      y += 10;

      doc.setDrawColor(220, 223, 228);
      doc.line(margin, y, pageWidth - margin, y);

      y += 10;
    }

    function drawSectionTitle(title: string) {
      addPageIfNeeded(15);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(dark.r, dark.g, dark.b);
      doc.text(title, margin, y);

      y += 7;
    }

    function drawStat(
      label: string,
      value: string,
      x: number,
      width: number,
    ) {
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(x, y, width, 20, 2.5, 2.5, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(gray.r, gray.g, gray.b);
      doc.text(label.toUpperCase(), x + 4, y + 6);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(dark.r, dark.g, dark.b);
      doc.text(value, x + 4, y + 14);
    }

    drawHeader();

    drawSectionTitle("Trading Summary");

    const statGap = 4;
    const statWidth =
      (pageWidth - margin * 2 - statGap * 2) / 3;

    drawStat(
      "Net P&L",
      formatPdfMoney(stats.netPnl),
      margin,
      statWidth,
    );

    drawStat(
      "Gross Profit",
      formatPdfMoney(stats.grossProfit),
      margin + statWidth + statGap,
      statWidth,
    );

    drawStat(
      "Gross Loss",
      formatPdfMoney(stats.grossLoss),
      margin + (statWidth + statGap) * 2,
      statWidth,
    );

    y += 25;

    drawStat(
      "Total Trades",
      stats.totalTrades.toLocaleString(),
      margin,
      statWidth,
    );

    drawStat(
      "Win Rate",
      `${winRate.toFixed(2)}%`,
      margin + statWidth + statGap,
      statWidth,
    );

    drawStat(
      "Profit Factor",
      Number.isFinite(profitFactor)
        ? profitFactor.toFixed(2)
        : "∞",
      margin + (statWidth + statGap) * 2,
      statWidth,
    );

    y += 30;

    drawSectionTitle("Monthly Performance");

    const tableWidth = pageWidth - margin * 2;
    const colWidths = [
      34,
      25,
      34,
      34,
      tableWidth - 34 - 25 - 34 - 34,
    ];

    const headers = [
      "Month",
      "Trades",
      "Gross Profit",
      "Gross Loss",
      "Net P&L",
    ];

    function drawTableHeader() {
      doc.setFillColor(238, 238, 238);
      doc.rect(margin, y - 5, tableWidth, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(gray.r, gray.g, gray.b);

      let x = margin;

      headers.forEach((header, index) => {
        doc.text(header, x + 2, y);
        x += colWidths[index];
      });

      y += 6;
    }

    drawTableHeader();

    for (const month of monthly) {
      addPageIfNeeded(8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(dark.r, dark.g, dark.b);

      let x = margin;

      doc.text(month.month, x + 2, y);
      x += colWidths[0];

      doc.text(String(month.trades), x + 2, y);
      x += colWidths[1];

      doc.text(
        formatPdfMoney(month.grossProfit),
        x + 2,
        y,
      );
      x += colWidths[2];

      doc.text(
        formatPdfMoney(month.grossLoss),
        x + 2,
        y,
      );
      x += colWidths[3];

      doc.setFont("helvetica", "bold");
      doc.text(
        formatPdfMoney(month.pnl),
        x + 2,
        y,
      );

      y += 6;

      doc.setDrawColor(235, 237, 240);
      doc.line(margin, y - 3, pageWidth - margin, y - 3);
    }

    y += 8;

    drawSectionTitle("Performance by Instrument");

    if (instruments.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(gray.r, gray.g, gray.b);
      doc.text("No instrument data available.", margin, y);
      y += 8;
    } else {
      for (const row of instruments) {
        addPageIfNeeded(8);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(dark.r, dark.g, dark.b);

        doc.text(row.name, margin, y);
        doc.text(`${row.trades} trades`, 72, y);
        doc.text(
          `Gross Profit: ${formatPdfMoney(row.grossProfit)}`,
          108,
          y,
        );
        doc.text(
          `Net P&L: ${formatPdfMoney(row.pnl)}`,
          158,
          y,
        );

        y += 6;
      }
    }

    y += 6;

    drawSectionTitle("Performance by Direction");

    for (const row of directions) {
      addPageIfNeeded(8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(dark.r, dark.g, dark.b);

      doc.text(row.name, margin, y);
      doc.text(`${row.trades} trades`, 72, y);
      doc.text(
        `Gross Profit: ${formatPdfMoney(row.grossProfit)}`,
        108,
        y,
      );
      doc.text(
        `Net P&L: ${formatPdfMoney(row.pnl)}`,
        158,
        y,
      );

      y += 6;
    }

    y += 6;

    drawSectionTitle("Performance by Setup");

    if (setups.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(gray.r, gray.g, gray.b);
      doc.text("No setup data available.", margin, y);
      y += 8;
    } else {
      for (const row of setups) {
        addPageIfNeeded(8);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(dark.r, dark.g, dark.b);

        doc.text(row.name, margin, y);
        doc.text(`${row.trades} trades`, 72, y);
        doc.text(
          `Gross Profit: ${formatPdfMoney(row.grossProfit)}`,
          108,
          y,
        );
        doc.text(
          `Net P&L: ${formatPdfMoney(row.pnl)}`,
          158,
          y,
        );

        y += 6;
      }
    }

    y += 8;

    drawSectionTitle("Detailed Trade Activity");

    const detailHeaders = [
      "Date",
      "Instrument",
      "Dir.",
      "Entry",
      "Exit",
      "Qty",
      "P&L",
    ];

    const detailWidths = [25, 28, 18, 27, 27, 15, 40];

    function drawDetailHeader() {
      doc.setFillColor(238, 238, 238);
      doc.rect(margin, y - 5, tableWidth, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(gray.r, gray.g, gray.b);

      let x = margin;

      detailHeaders.forEach((header, index) => {
        doc.text(header, x + 1.5, y);
        x += detailWidths[index];
      });

      y += 6;
    }

    drawDetailHeader();

    for (const trade of trades) {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = 20;
        drawDetailHeader();
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.8);
      doc.setTextColor(dark.r, dark.g, dark.b);

      let x = margin;

      doc.text(trade.trade_date, x + 1.5, y);
      x += detailWidths[0];

      doc.text(
        trade.symbol.slice(0, 15),
        x + 1.5,
        y,
      );
      x += detailWidths[1];

      doc.text(
        trade.direction === "Long" ? "Long" : "Short",
        x + 1.5,
        y,
      );
      x += detailWidths[2];

      doc.text(
        trade.entry_price == null
          ? "-"
          : String(trade.entry_price),
        x + 1.5,
        y,
      );
      x += detailWidths[3];

      doc.text(
        trade.exit_price == null
          ? "-"
          : String(trade.exit_price),
        x + 1.5,
        y,
      );
      x += detailWidths[4];

      doc.text(
        String(trade.quantity),
        x + 1.5,
        y,
      );
      x += detailWidths[5];

      doc.setFont("helvetica", "bold");
      doc.text(
        formatPdfMoney(trade.pnl),
        x + 1.5,
        y,
      );

      y += 5;

      doc.setDrawColor(240, 241, 243);
      doc.line(margin, y - 2, pageWidth - margin, y - 2);
    }

    y += 10;

    addPageIfNeeded(25);

    doc.setFillColor(248, 249, 250);
    doc.roundedRect(
      margin,
      y,
      tableWidth,
      23,
      2,
      2,
      "F",
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(dark.r, dark.g, dark.b);
    doc.text("Important", margin + 5, y + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(gray.r, gray.g, gray.b);

    const disclaimer =
      "TradeMirror provides trading recordkeeping and reporting tools only. " +
      "This report is not tax, legal, or accounting advice and should be " +
      "reviewed with a qualified tax professional before filing.";

    const disclaimerLines = doc.splitTextToSize(
      disclaimer,
      tableWidth - 10,
    );

    doc.text(
      disclaimerLines,
      margin + 5,
      y + 13,
    );

    const pageCount = doc.getNumberOfPages();

    for (let page = 1; page <= pageCount; page++) {
      doc.setPage(page);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(150, 155, 165);

      doc.text(
        `TradeMirror · Tax Year ${year}`,
        margin,
        pageHeight - 9,
      );

      doc.text(
        `Page ${page} of ${pageCount}`,
        pageWidth - margin,
        pageHeight - 9,
        {
          align: "right",
        },
      );
    }

    doc.save(`trademirror-${year}-tax-report.pdf`);

    setTimeout(() => setDownloading(null), 700);
  }

  return (
    <div className="min-h-screen px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Landmark className="h-4 w-4 text-white/65" />

              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/55">
                Records & Reporting
              </span>
            </div>

            <h1 className="text-[28px] font-semibold tracking-[-0.045em] text-white">
              Tax Center
            </h1>

            <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-white/35">
              Keep your trading records organized and ready for tax season.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={year}
                onChange={(event) =>
                  setYear(Number(event.target.value))
                }
                className="h-10 appearance-none rounded-xl border border-white/[0.08] bg-white/[0.04] pl-10 pr-9 text-[12px] font-medium text-white outline-none transition hover:bg-white/[0.06] focus:border-white/25"
              >
                {years.map((option) => (
                  <option
                    key={option}
                    value={option}
                    className="bg-[#080d14]"
                  >
                    Tax Year {option}
                  </option>
                ))}
              </select>

              <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-white/25" />
            </div>

            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-[12px] font-medium text-white/65 transition hover:bg-white/[0.07] hover:text-white"
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-7">
          <StatCard
            label="Net P&L"
            value={stats.netPnl}
            isPnl
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            valueClass={pnlClass(stats.netPnl)}
          />

          <StatCard
            label="Gross Profit"
            value={stats.grossProfit}
            isPnl
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            valueClass="text-white/80"
          />

          <StatCard
            label="Gross Loss"
            value={stats.grossLoss}
            isPnl
            icon={<TrendingDown className="h-3.5 w-3.5" />}
            valueClass="text-white/45"
          />

          <StatCard
            label="Total Trades"
            value={stats.totalTrades.toLocaleString()}
            icon={<FileSpreadsheet className="h-3.5 w-3.5" />}
          />

          <StatCard
            label="Winning Trades"
            value={stats.winningTrades.toLocaleString()}
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            valueClass="text-white/80"
          />

          <StatCard
            label="Losing Trades"
            value={stats.losingTrades.toLocaleString()}
            icon={<TrendingDown className="h-3.5 w-3.5" />}
            valueClass="text-white/45"
          />

          <StatCard
            label="Breakeven"
            value={stats.breakevenTrades.toLocaleString()}
            icon={<BarChart3 className="h-3.5 w-3.5" />}
          />
        </div>

        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-white/55" />
          </div>
        ) : (
          <>
            {/* Annual P&L */}
            <section className="mt-5 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#171717] via-[#111111] to-[#0a0a0a] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-white">
                    P&L Overview
                  </h2>

                  <p className="mt-1 text-[11px] text-white/30">
                    Monthly performance for {year}
                  </p>
                </div>

                <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5 text-[10px] text-white/35">
                  {stats.totalTrades} trades
                </span>
              </div>

              <div className="grid h-[230px] grid-cols-12 items-end gap-2 sm:gap-3">
                {monthly.map((month) => {
                  const height =
                    month.pnl === 0
                      ? 4
                      : Math.max(
                          8,
                          (Math.abs(month.pnl) /
                            maxMonthlyPnl) *
                            100,
                        );

                  const positive = month.pnl >= 0;

                  return (
                    <div
                      key={month.month}
                      className="group flex h-full flex-col items-center justify-end"
                    >
                      <div className="mb-2 text-[9px] font-medium opacity-0 transition group-hover:opacity-100">
                        <span
                          className={pnlClass(month.pnl)}
                        >
                          {shortMoney(month.pnl)}
                        </span>
                      </div>

                      <div className="flex h-[175px] w-full items-end justify-center">
                        <div
                          className={`w-full max-w-[44px] rounded-t-lg transition-all duration-300 group-hover:brightness-125 ${
                            positive
                              ? "bg-white/75 shadow-[0_0_14px_rgba(255,255,255,0.06)]"
                              : "bg-white/25"
                          }`}
                          style={{
                            height: `${height}%`,
                          }}
                        />
                      </div>

                      <span className="mt-3 text-[9px] text-white/25">
                        {month.month.slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Monthly */}
            <section className="mt-5 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#171717] via-[#111111] to-[#0a0a0a] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
              <div className="mb-5">
                <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-white">
                  P&L by Month
                </h2>

                <p className="mt-1 text-[11px] text-white/30">
                  Complete monthly trading record
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/[0.06]">
                <div className="grid grid-cols-[1.2fr_0.7fr_1fr_1fr_1fr] border-b border-white/[0.06] bg-white/[0.025] px-4 py-3 text-[9px] font-medium uppercase tracking-[0.12em] text-white/25">
                  <span>Month</span>
                  <span>Trades</span>
                  <span>Gross Profit</span>
                  <span>Gross Loss</span>
                  <span className="text-right">Net P&L</span>
                </div>

                {monthly.map((month) => (
                  <div
                    key={month.month}
                    className="grid grid-cols-[1.2fr_0.7fr_1fr_1fr_1fr] items-center border-b border-white/[0.045] px-4 py-3 last:border-0"
                  >
                    <span className="text-[12px] font-medium text-white/70">
                      {month.month}
                    </span>

                    <span className="text-[11px] text-white/35">
                      {month.trades}
                    </span>

                    <span className={`text-[11px] font-medium ${month.grossProfit > 0 ? "text-emerald-400" : "text-white/45"}`}>
                      {money(month.grossProfit)}
                    </span>

                    <span className={`text-[11px] font-medium ${month.grossLoss < 0 ? "text-rose-400" : "text-white/45"}`}>
                      {money(month.grossLoss)}
                    </span>

                    <PnlValue
                      value={month.pnl}
                      showSign
                      className={`text-right text-[12px] font-semibold ${pnlClass(
                        month.pnl,
                      )}`}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Breakdowns */}
            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <BreakdownTable
                title="P&L by Instrument"
                rows={instruments}
              />

              <BreakdownTable
                title="P&L by Direction"
                rows={directions}
              />

              <BreakdownTable
                title="P&L by Setup"
                rows={setups}
              />

              <BreakdownTable
                title="Quarterly Performance"
                rows={quarterly}
              />
            </div>

            {/* Export */}
            <section className="mt-5 overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.025] shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
              <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <div className="mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-white/65" />

                    <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/55">
                      Tax Reporting
                    </span>
                  </div>

                  <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-white">
                    Export your trading records
                  </h2>

                  <p className="mt-1.5 text-[12px] leading-5 text-white/35">
                    Download a detailed CSV containing your {year} trading
                    activity or generate a professional PDF report for your
                    records and tax professional.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleDetailedDownload}
                    disabled={downloading !== null}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.05] px-5 text-[12px] font-medium text-white/75 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
                  >
                    {downloading === "detailed" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ArrowDownToLine className="h-3.5 w-3.5" />
                    )}

                    Detailed CSV
                  </button>

                  <button
                    type="button"
                    onClick={handlePdfDownload}
                    disabled={downloading !== null}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-[12px] font-semibold text-black shadow-[0_8px_25px_rgba(255,255,255,0.06)] transition hover:bg-white/90 disabled:opacity-50"
                  >
                    {downloading === "pdf" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ArrowDownToLine className="h-3.5 w-3.5" />
                    )}

                    Tax Report PDF
                  </button>
                </div>
              </div>
            </section>

            {/* Disclaimer */}
            <div className="mt-5 rounded-xl border border-white/[0.05] bg-white/[0.015] px-5 py-4">
              <p className="text-[10px] leading-5 text-white/25">
                <span className="font-medium text-white/40">
                  Important:
                </span>{" "}
                TradeMirror provides trading recordkeeping and reporting tools
                only. The information shown here is not tax, legal, or
                accounting advice and should be reviewed with a qualified tax
                professional.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  valueClass = "text-white",
  isPnl = false,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  valueClass?: string;
  isPnl?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#171717] via-[#111111] to-[#0a0a0a] p-4 shadow-[0_14px_35px_rgba(0,0,0,0.16)]">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-medium uppercase tracking-[0.11em] text-white/25">
          {label}
        </span>

        <span className="text-white/20">
          {icon}
        </span>
      </div>

      {isPnl ? (
        <PnlValue
          value={typeof value === "string" ? Number(value.replace(/[^0-9.-]/g, "")) : value}
          showSign
          className={`mt-3 text-[18px] font-semibold tracking-[-0.035em] tabular-nums ${valueClass}`}
        />
      ) : (
        <p
          className={`mt-3 text-[18px] font-semibold tracking-[-0.035em] ${valueClass}`}
        >
          {value}
        </p>
      )}
    </div>
  );
}