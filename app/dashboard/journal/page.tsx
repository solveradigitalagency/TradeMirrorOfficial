"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  Image as ImageIcon,
  Pencil,
  Search,
  Share2,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

import { createClient } from "@/lib/supabase/client";

type Trade = {
  id: string;
  trade_date: string;
  created_at: string;
  symbol: string;
  direction: "Long" | "Short";
  pnl: number;
  r_multiple: number | null;
  followed_plan: boolean | null;
  setup: string | null;
  notes: string | null;
  screenshot_url: string | null;
  emotion: string | null;
  execution_rating: string | null;
  visibility: "Private" | "Followers" | "Public" | null;
};

type Profile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type FilterType = "All" | "Wins" | "Losses" | "No Plan";

type EditForm = {
  trade_date: string;
  pnl: string;
  symbol: string;
  direction: "Long" | "Short";
  emotion: string;
  followed_plan: boolean;
  setup: string;
  execution_rating: string;
  visibility: "Private" | "Followers" | "Public";
  notes: string;
  screenshot_url: string;
};

function formatPnl(value: number) {
  return `${value >= 0 ? "+" : "-"}$${Math.abs(value).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/* =========================================================
   PNG EXPORT HELPERS
========================================================= */

function proxyImageUrl(url: string) {
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);

    image.onerror = () =>
      reject(new Error(`Could not load image: ${src}`));

    image.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - r,
    y + height,
  );
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - r,
  );
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const paragraphs = text.split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }

    const words = paragraph.split(/\s+/);
    let current = "";

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;

      if (ctx.measureText(test).width <= maxWidth) {
        current = test;
      } else {
        if (current) {
          lines.push(current);
        }

        current = word;
      }
    }

    if (current) {
      lines.push(current);
    }
  }

  return lines;
}

function drawContainedImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const boxRatio = width / height;

  let drawWidth = width;
  let drawHeight = height;

  if (imageRatio > boxRatio) {
    drawHeight = width / imageRatio;
  } else {
    drawWidth = height * imageRatio;
  }

  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;

  ctx.drawImage(
    image,
    drawX,
    drawY,
    drawWidth,
    drawHeight,
  );
}

async function createJournalPng(
  trade: Trade,
  profile: Profile | null,
) {
  const width = 1200;
  const padding = 56;
  const innerWidth = width - padding * 2;

  await document.fonts?.ready;

  /* ---------------------------------------------------------
     LOAD IMAGES
  --------------------------------------------------------- */

  const logo = await loadImage("/logo/trade-mirror-logo.png");

  let screenshot: HTMLImageElement | null = null;

  if (trade.screenshot_url) {
    try {
      screenshot = await loadImage(
        proxyImageUrl(trade.screenshot_url),
      );
    } catch (error) {
      console.error("SCREENSHOT LOAD ERROR:", error);
    }
  }

  let avatar: HTMLImageElement | null = null;

  if (profile?.avatar_url) {
    try {
      avatar = await loadImage(
        proxyImageUrl(profile.avatar_url),
      );
    } catch (error) {
      console.error("AVATAR LOAD ERROR:", error);
    }
  }

  /* ---------------------------------------------------------
     MEASURE JOURNAL
  --------------------------------------------------------- */

  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d");

  if (!measureCtx) {
    throw new Error("Canvas is not supported.");
  }

  measureCtx.font =
    '400 17px Inter, Arial, sans-serif';

  const journalLines = trade.notes
    ? wrapCanvasText(
        measureCtx,
        trade.notes,
        innerWidth - 64,
      )
    : [];

  const journalLineHeight = 30;

  const journalHeight = trade.notes
    ? Math.max(
        118,
        72 + journalLines.length * journalLineHeight,
      )
    : 0;

  /* ---------------------------------------------------------
     SCREENSHOT SIZE
  --------------------------------------------------------- */

  let screenshotHeight = 0;

  if (screenshot) {
    const maxHeight = 520;
    const ratio =
      screenshot.naturalWidth /
      screenshot.naturalHeight;

    screenshotHeight = Math.min(
      maxHeight,
      innerWidth / ratio,
    );

    screenshotHeight = Math.max(
      screenshotHeight,
      220,
    );
  }

  /* ---------------------------------------------------------
     CALCULATE CANVAS HEIGHT (REVISED AS PER INSTRUCTIONS)
  --------------------------------------------------------- */

  let y = padding;

  const headerHeight = 72;
  y += headerHeight;

  y += 42;

  const tradeHeaderHeight = 100;
  y += tradeHeaderHeight;

  if (screenshot) {
    y += 30;
    y += screenshotHeight;
  }

  y += 28;

  // --- REPLACED details DEFINITION PER INSTRUCTIONS ---
  const details: Array<[string, string]> = [
    ["Setup", trade.setup],
    ["Emotion", trade.emotion],
    ["Execution", trade.execution_rating],
    [
      "Plan",
      trade.followed_plan === true
        ? "Followed"
        : trade.followed_plan === false
          ? "Not followed"
          : "Not recorded",
    ],
  ].filter(
    (item): item is [string, string] =>
      Boolean(item[1]),
  );
  // ---------------------------------------------------

  const detailRows = Math.ceil(details.length / 2);

  const detailHeight = detailRows * 78 + Math.max(0, detailRows - 1) * 14;

  y += detailHeight;

  if (trade.notes) {
    y += 28;
    y += journalHeight;
  }

  // Instead of y += 38; y += footerHeight; y += padding;
  // use the revised calculation for canvas/card height as per instructions:
  // const footerHeight = 70;
  // const cardHeight = y + footerHeight + 32;
  // const canvasHeight = cardHeight + 64;
  const footerHeight = 70;
  const cardHeight = y + footerHeight + 32; // 32 is top breathing room for footer inside card
  const canvasHeight = cardHeight + padding * 2; // padding=56 so +112

  const height = Math.ceil(canvasHeight);

  /* ---------------------------------------------------------
     CREATE CANVAS
  --------------------------------------------------------- */

  const canvas = document.createElement("canvas");

  canvas.width = width * 2;
  canvas.height = height * 2;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas is not supported.");
  }

  ctx.scale(2, 2);

  /* ---------------------------------------------------------
     BACKGROUND
  --------------------------------------------------------- */

  ctx.fillStyle = "#03070d";
  ctx.fillRect(0, 0, width, height);

  /* subtle blue glow */

  const glow = ctx.createRadialGradient(
    width * 0.5,
    0,
    0,
    width * 0.5,
    0,
    600,
  );

  glow.addColorStop(0, "rgba(37, 99, 235, 0.12)");
  glow.addColorStop(1, "rgba(37, 99, 235, 0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, 600);

  /* ---------------------------------------------------------
     MAIN CARD
  --------------------------------------------------------- */

  const cardX = padding;
  const cardY = padding;
  const cardWidth = innerWidth;
  // Calculate actual card height for rect as everything between top and bottom padding
  // so cardHeight is correct already.
  roundRect(
    ctx,
    cardX,
    cardY,
    cardWidth,
    cardHeight,
    26,
  );

  ctx.fillStyle = "#07111b";
  ctx.fill();

  ctx.strokeStyle = "rgba(96, 165, 250, 0.16)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Content padding within main card
  const contentX = cardX + 38;
  let cursorY = cardY + 38;

  /* ---------------------------------------------------------
     HEADER
  --------------------------------------------------------- */

  // Updated logo sizing per prompt!
  const logoMaxWidth = 420;
  const logoMaxHeight = 88;
  const logoScale = Math.min(
    logoMaxWidth / logo.naturalWidth,
    logoMaxHeight / logo.naturalHeight,
  );
  const logoWidth = logo.naturalWidth * logoScale;
  const logoHeight = logo.naturalHeight * logoScale;

  ctx.drawImage(
    logo,
    contentX,
    cursorY,
    logoWidth,
    logoHeight,
  );

  ctx.font =
    '600 14px Inter, Arial, sans-serif';
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(
    "JOURNAL",
    cardX + cardWidth - 38,
    cursorY + logoHeight / 2,
  );

  ctx.textAlign = "left";

  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(
    contentX,
    cursorY + logoHeight + 26,
  );
  ctx.lineTo(
    cardX + cardWidth - 38,
    cursorY + logoHeight + 26,
  );
  ctx.stroke();

  cursorY += logoHeight + 42;

  /* ---------------------------------------------------------
     TRADE HEADER
  --------------------------------------------------------- */

  ctx.font =
    '600 58px Inter, Arial, sans-serif';

  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "alphabetic";

  ctx.fillText(
    trade.symbol,
    contentX,
    cursorY + 54,
  );

  const symbolWidth = ctx.measureText(
    trade.symbol,
  ).width;

  const directionX =
    contentX + symbolWidth + 24;

  const directionText =
    trade.direction === "Long"
      ? "↗  LONG"
      : "↘  SHORT";

  ctx.font =
    '600 13px Inter, Arial, sans-serif';

  const directionWidth =
    ctx.measureText(directionText).width + 28;

  roundRect(
    ctx,
    directionX,
    cursorY + 16,
    directionWidth,
    34,
    17,
  );

  /*
    Blue only here.
    Green/red reserved for actual P&L.
  */

  ctx.fillStyle = "rgba(59,130,246,0.10)";
  ctx.fill();

  ctx.strokeStyle =
    "rgba(96,165,250,0.20)";
  ctx.stroke();

  ctx.fillStyle =
    "rgba(147,197,253,0.85)";

  ctx.textBaseline = "middle";

  ctx.fillText(
    directionText,
    directionX + 14,
    cursorY + 33,
  );

  ctx.font =
    '400 17px Inter, Arial, sans-serif';

  ctx.fillStyle =
    "rgba(255,255,255,0.40)";

  ctx.textBaseline = "alphabetic";

  ctx.fillText(
    formatDate(trade.trade_date),
    contentX,
    cursorY + 91,
  );

  /* P&L */

  const pnl = Number(trade.pnl);

  ctx.font =
    '600 44px Inter, Arial, sans-serif';

  ctx.textAlign = "right";

  ctx.fillStyle =
    pnl >= 0
      ? "#34d399"
      : "#f87171";

  ctx.fillText(
    formatPnl(pnl),
    cardX + cardWidth - 38,
    cursorY + 48,
  );

  ctx.textAlign = "left";

  cursorY += 128;

  /* ---------------------------------------------------------
     SCREENSHOT
  --------------------------------------------------------- */

  if (screenshot) {
    const screenshotX = contentX;
    const screenshotY = cursorY;
    const screenshotWidth = cardWidth - 76;

    roundRect(
      ctx,
      screenshotX,
      screenshotY,
      screenshotWidth,
      screenshotHeight,
      16,
    );

    ctx.save();

    ctx.clip();

    ctx.fillStyle = "#03070d";

    ctx.fillRect(
      screenshotX,
      screenshotY,
      screenshotWidth,
      screenshotHeight,
    );

    drawContainedImage(
      ctx,
      screenshot,
      screenshotX,
      screenshotY,
      screenshotWidth,
      screenshotHeight,
    );

    ctx.restore();

    ctx.strokeStyle =
      "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;

    roundRect(
      ctx,
      screenshotX,
      screenshotY,
      screenshotWidth,
      screenshotHeight,
      16,
    );

    ctx.stroke();

    cursorY += screenshotHeight + 30;
  }

  /* ---------------------------------------------------------
     DETAILS
  --------------------------------------------------------- */

  const detailWidth =
    (cardWidth - 76 - 14) / 2;

  let detailX = contentX;
  let detailY = cursorY;

  details.forEach(([label, value], index) => {
    if (!value) return;

    if (index > 0 && index % 2 === 0) {
      detailX = contentX;
      detailY += 92;
    }

    roundRect(
      ctx,
      detailX,
      detailY,
      detailWidth,
      78,
      13,
    );

    ctx.fillStyle =
      "rgba(255,255,255,0.018)";
    ctx.fill();

    ctx.strokeStyle =
      "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font =
      '600 9px Inter, Arial, sans-serif';

    ctx.fillStyle =
      "rgba(255,255,255,0.25)";

    ctx.textBaseline = "alphabetic";

    ctx.fillText(
      label.toUpperCase(),
      detailX + 18,
      detailY + 25,
    );

    ctx.font =
      '400 14px Inter, Arial, sans-serif';

    ctx.fillStyle =
      "rgba(255,255,255,0.75)";

    ctx.fillText(
      String(value),
      detailX + 18,
      detailY + 51,
    );

    detailX += detailWidth + 14;
  });

  cursorY += detailHeight;

  /* ---------------------------------------------------------
     JOURNAL
  --------------------------------------------------------- */

  if (trade.notes) {
    cursorY += 28;

    roundRect(
      ctx,
      contentX,
      cursorY,
      cardWidth - 76,
      journalHeight,
      16,
    );

    ctx.fillStyle =
      "rgba(59,130,246,0.025)";
    ctx.fill();

    ctx.strokeStyle =
      "rgba(96,165,250,0.09)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font =
      '600 10px Inter, Arial, sans-serif';

    ctx.fillStyle =
      "rgba(147,197,253,0.45)";

    ctx.fillText(
      "JOURNAL",
      contentX + 24,
      cursorY + 28,
    );

    ctx.font =
      '400 17px Inter, Arial, sans-serif';

    ctx.fillStyle =
      "rgba(255,255,255,0.65)";

    const lines = wrapCanvasText(
      ctx,
      trade.notes,
      cardWidth - 124,
    );

    let lineY = cursorY + 68;

    for (const line of lines) {
      ctx.fillText(
        line,
        contentX + 24,
        lineY,
      );

      lineY += journalLineHeight;
    }

    cursorY += journalHeight;
  }

  /* ---------------------------------------------------------
     FOOTER (Updated: draw in card's content area)
  --------------------------------------------------------- */

  // New footer area sizing and avatar logic per prompt
  const footerAreaHeight = 76;
  const avatarSize = 50;
  const footerY = cursorY + 18 + (footerAreaHeight - avatarSize) / 2;
  const avatarX = contentX;
  const avatarY = footerY;

  // Divider
  ctx.strokeStyle =
    "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(
    contentX,
    footerY - 16,
  );
  ctx.lineTo(
    cardX + cardWidth - 38,
    footerY - 16,
  );
  ctx.stroke();

  // Avatar rendering logic per prompt
  if (avatar) {
    ctx.save();

    ctx.beginPath();
    ctx.arc(
      avatarX + avatarSize / 2,
      avatarY + avatarSize / 2,
      avatarSize / 2,
      0,
      Math.PI * 2,
    );
    ctx.clip();

    ctx.drawImage(
      avatar,
      avatarX,
      avatarY,
      avatarSize,
      avatarSize,
    );

    ctx.restore();
  } else {
    ctx.fillStyle = "#102033";
    ctx.beginPath();
    ctx.arc(
      avatarX + avatarSize / 2,
      avatarY + avatarSize / 2,
      avatarSize / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "600 22px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      (profile?.display_name || profile?.username || "T").charAt(0).toUpperCase(),
      avatarX + avatarSize / 2,
      avatarY + avatarSize / 2,
    );
  }

  // Center name and username vertically relative to the avatar
  const textY = footerY + avatarSize / 2;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#ffffff";
  ctx.font = "600 17px Inter, Arial, sans-serif";
  ctx.fillText(
    profile?.display_name || "Trader",
    avatarX + avatarSize + 16,
    textY - 2,
  );

  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "14px Inter, Arial, sans-serif";
  ctx.fillText(
    `@${profile?.username || "trader"}`,
    avatarX + avatarSize + 16,
    textY + 19,
  );

  /* ---------------------------------------------------------
     EXPORT
  --------------------------------------------------------- */

  return canvas.toDataURL(
    "image/png",
    1,
  );
}

/* =========================================================
   JOURNAL CARD
========================================================= */

// ...no changes below here

function JournalCard({
  trade,
  expanded,
  onToggle,
  onEdit,
  onShare,
}: {
  trade: Trade;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onShare: () => void;
}) {
  const pnl = Number(trade.pnl);
  const isWin = pnl > 0;
  const isLoss = pnl < 0;

  return (
    <div
      className={`overflow-hidden rounded-[14px] border transition-all duration-200 ${
        expanded
          ? "border-blue-400/[0.16] bg-[#0b1621]"
          : "border-white/[0.075] bg-[#0b1621]/80 hover:border-white/[0.11] hover:bg-[#0d1925]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full cursor-pointer p-5 text-left"
      >
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-semibold tracking-[-0.025em] text-white/90">
                  {trade.symbol}
                </span>

                <span
                  className={`flex items-center gap-1 text-[10px] font-medium ${
                    trade.direction === "Long"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {trade.direction === "Long" ? (
                    <ArrowUpRight
                      className="h-3 w-3"
                      strokeWidth={1.8}
                    />
                  ) : (
                    <ArrowDownRight
                      className="h-3 w-3"
                      strokeWidth={1.8}
                    />
                  )}

                  {trade.direction}
                </span>
              </div>

              <span className="text-[10px] text-white/20">
                •
              </span>

              <span className="text-[10px] text-white/30">
                {formatTime(trade.created_at)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {trade.emotion && (
                <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[9px] text-white/40">
                  {trade.emotion}
                </span>
              )}

              {trade.execution_rating && (
                <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[9px] text-white/40">
                  {trade.execution_rating}
                </span>
              )}

              {trade.setup && (
                <span className="rounded-full border border-blue-400/[0.10] bg-blue-500/[0.035] px-2.5 py-1 text-[9px] text-blue-300/55">
                  {trade.setup}
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <div className="text-right">
              <p
                className={`text-[17px] font-semibold tracking-[-0.025em] ${
                  isWin
                    ? "text-emerald-400"
                    : isLoss
                      ? "text-red-400"
                      : "text-white/40"
                }`}
              >
                {formatPnl(pnl)}
              </p>

              {trade.r_multiple !== null && (
                <p className="mt-1 text-[9px] text-white/25">
                  {Number(trade.r_multiple).toFixed(2)}R
                </p>
              )}
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-white/[0.06] bg-white/[0.02] text-white/30">
              {expanded ? (
                <ChevronUp
                  className="h-4 w-4"
                  strokeWidth={1.7}
                />
              ) : (
                <ChevronDown
                  className="h-4 w-4"
                  strokeWidth={1.7}
                />
              )}
            </div>
          </div>
        </div>

        {!expanded && trade.notes && (
          <p className="mt-4 line-clamp-2 max-w-[850px] text-[12px] leading-5 text-white/35">
            {trade.notes}
          </p>
        )}
      </button>

      {expanded && (
        <div className="border-t border-white/[0.055] px-5 pb-5 pt-5">
          <div className="mb-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
              className="flex h-8 cursor-pointer items-center gap-1.5 rounded-[9px] border border-white/[0.07] bg-white/[0.02] px-3 text-[9px] font-medium text-white/45 transition hover:border-white/[0.11] hover:bg-white/[0.035] hover:text-white/70"
            >
              <Pencil
                className="h-3 w-3"
                strokeWidth={1.7}
              />
              Edit
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onShare();
              }}
              className="flex h-8 cursor-pointer items-center gap-1.5 rounded-[9px] border border-blue-400/[0.12] bg-blue-500/[0.05] px-3 text-[9px] font-medium text-blue-300/70 transition hover:border-blue-400/[0.2] hover:bg-blue-500/[0.08] hover:text-blue-200"
            >
              <Share2
                className="h-3 w-3"
                strokeWidth={1.7}
              />
              Share Journal
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div>
              <div className="flex flex-wrap gap-2">
                {trade.emotion && (
                  <div className="rounded-[9px] border border-white/[0.06] bg-white/[0.018] px-3 py-2">
                    <p className="text-[8px] uppercase tracking-[0.08em] text-white/20">
                      Emotion
                    </p>
                    <p className="mt-1 text-[10px] text-white/55">
                      {trade.emotion}
                    </p>
                  </div>
                )}

                {trade.execution_rating && (
                  <div className="rounded-[9px] border border-white/[0.06] bg-white/[0.018] px-3 py-2">
                    <p className="text-[8px] uppercase tracking-[0.08em] text-white/20">
                      Execution
                    </p>
                    <p className="mt-1 text-[10px] text-white/55">
                      {trade.execution_rating}
                    </p>
                  </div>
                )}

                {trade.setup && (
                  <div className="rounded-[9px] border border-blue-400/[0.08] bg-blue-500/[0.025] px-3 py-2">
                    <p className="text-[8px] uppercase tracking-[0.08em] text-blue-300/30">
                      Setup
                    </p>
                    <p className="mt-1 text-[10px] text-blue-300/60">
                      {trade.setup}
                    </p>
                  </div>
                )}

                <div className="rounded-[9px] border border-white/[0.06] bg-white/[0.018] px-3 py-2">
                  <p className="text-[8px] uppercase tracking-[0.08em] text-white/20">
                    Plan
                  </p>

                  <div className="mt-1 flex items-center gap-1.5">
                    {trade.followed_plan === true ? (
                      <>
                        <Check
                          className="h-3 w-3 text-emerald-400"
                          strokeWidth={2}
                        />
                        <span className="text-[10px] text-emerald-400/80">
                          Followed
                        </span>
                      </>
                    ) : trade.followed_plan === false ? (
                      <>
                        <X
                          className="h-3 w-3 text-red-400"
                          strokeWidth={2}
                        />
                        <span className="text-[10px] text-red-400/80">
                          Not followed
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] text-white/35">
                        Not recorded
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {trade.notes && (
                <div className="mt-5 rounded-[11px] border border-white/[0.055] bg-white/[0.012] p-4">
                  <p className="text-[9px] font-medium uppercase tracking-[0.09em] text-white/25">
                    Journal
                  </p>

                  <p className="mt-3 whitespace-pre-wrap text-[12px] leading-6 text-white/55">
                    {trade.notes}
                  </p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {trade.visibility && (
                  <span className="rounded-full border border-white/[0.06] bg-white/[0.018] px-2.5 py-1 text-[8px] text-white/25">
                    {trade.visibility}
                  </span>
                )}

                <span className="rounded-full border border-white/[0.06] bg-white/[0.018] px-2.5 py-1 text-[8px] text-white/25">
                  {trade.symbol}
                </span>

                <span className="rounded-full border border-white/[0.06] bg-white/[0.018] px-2.5 py-1 text-[8px] text-white/25">
                  {trade.direction}
                </span>
              </div>
            </div>

            {trade.screenshot_url ? (
              <div className="overflow-hidden rounded-[11px] border border-white/[0.06] bg-black/20">
                <img
                  src={trade.screenshot_url}
                  alt="Trade screenshot"
                  className="h-full min-h-[150px] w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex min-h-[150px] items-center justify-center rounded-[11px] border border-dashed border-white/[0.055] bg-white/[0.008]">
                <div className="text-center">
                  <ImageIcon
                    className="mx-auto h-6 w-6 text-white/15"
                    strokeWidth={1.5}
                  />
                  <p className="mt-2 text-[9px] text-white/20">
                    No screenshot
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function JournalPage() {
  const supabase = useMemo(() => createClient(), []);

  const [trades, setTrades] = useState<Trade[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<FilterType>("All");

  const [expandedTrade, setExpandedTrade] =
    useState<string | null>(null);

  const [editingTrade, setEditingTrade] =
    useState<Trade | null>(null);

  const [editForm, setEditForm] =
    useState<EditForm | null>(null);

  const [editScreenshotFile, setEditScreenshotFile] =
    useState<File | null>(null);

  const [editScreenshotPreview, setEditScreenshotPreview] =
    useState<string | null>(null);

  const [savingEdit, setSavingEdit] =
    useState(false);

  const [sharingTradeId, setSharingTradeId] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadJournal() {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Please sign in again.");
        setLoading(false);
        return;
      }

      const { data: profileData } =
        await supabase
          .from("profiles")
          .select(
            "username, display_name, avatar_url",
          )
          .eq("id", user.id)
          .maybeSingle();

      setProfile(
        profileData as Profile | null,
      );

      const { data, error: tradesError } =
        await supabase
          .from("trades")
          .select(
            "id, trade_date, created_at, symbol, direction, pnl, r_multiple, followed_plan, setup, notes, screenshot_url, emotion, execution_rating, visibility",
          )
          .eq("user_id", user.id)
          .order("trade_date", {
            ascending: false,
          })
          .order("created_at", {
            ascending: false,
          });

      if (tradesError) {
        console.error(
          "JOURNAL LOAD ERROR:",
          tradesError,
        );

        setError(
          "We couldn't load your journal.",
        );

        setTrades([]);
        setLoading(false);
        return;
      }

      setTrades(
        (data ?? []) as Trade[],
      );

      setLoading(false);
    }

    loadJournal();
  }, [supabase]);

  const filteredTrades = useMemo(() => {
    const query = search.trim().toLowerCase();

    return trades.filter((trade) => {
      const matchesSearch =
        !query ||
        trade.symbol
          .toLowerCase()
          .includes(query) ||
        trade.setup
          ?.toLowerCase()
          .includes(query) ||
        trade.notes
          ?.toLowerCase()
          .includes(query) ||
        trade.emotion
          ?.toLowerCase()
          .includes(query) ||
        trade.execution_rating
          ?.toLowerCase()
          .includes(query);

      const pnl = Number(trade.pnl);

      const matchesFilter =
        filter === "All"
          ? true
          : filter === "Wins"
            ? pnl > 0
            : filter === "Losses"
              ? pnl < 0
              : trade.followed_plan === false;

      return matchesSearch && matchesFilter;
    });
  }, [trades, search, filter]);

  const groupedTrades = useMemo(() => {
    const groups: Record<string, Trade[]> =
      {};

    for (const trade of filteredTrades) {
      if (!groups[trade.trade_date]) {
        groups[trade.trade_date] = [];
      }

      groups[trade.trade_date].push(trade);
    }

    return Object.entries(groups);
  }, [filteredTrades]);

  const stats = useMemo(() => {
    const totalPnl = trades.reduce(
      (sum, trade) =>
        sum + Number(trade.pnl),
      0,
    );

    const winners = trades.filter(
      (trade) => Number(trade.pnl) > 0,
    );

    const planTrades = trades.filter(
      (trade) =>
        trade.followed_plan !== null,
    );

    const followedPlan = planTrades.filter(
      (trade) =>
        trade.followed_plan === true,
    );

    return {
      entries: trades.length,
      totalPnl,
      winRate:
        trades.length > 0
          ? (winners.length /
              trades.length) *
            100
          : 0,
      planFollowed:
        planTrades.length > 0
          ? (followedPlan.length /
              planTrades.length) *
            100
          : 0,
    };
  }, [trades]);

  const topSetups = useMemo(() => {
    const counts: Record<string, number> =
      {};

    for (const trade of trades) {
      if (!trade.setup) continue;

      counts[trade.setup] =
        (counts[trade.setup] ?? 0) + 1;
    }

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [trades]);

  function startEditing(trade: Trade) {
    setEditingTrade(trade);

    setEditForm({
      trade_date: trade.trade_date,
      pnl: String(trade.pnl),
      symbol: trade.symbol,
      direction: trade.direction,
      emotion:
        trade.emotion || "Focused",
      followed_plan:
        trade.followed_plan ?? true,
      setup: trade.setup || "",
      execution_rating:
        trade.execution_rating ||
        "Great execution",
      visibility:
        trade.visibility || "Private",
      notes: trade.notes || "",
      screenshot_url:
        trade.screenshot_url || "",
    });

    setEditScreenshotFile(null);

    setEditScreenshotPreview(
      trade.screenshot_url || null,
    );
  }

  function closeEditModal() {
    setEditingTrade(null);
    setEditForm(null);
    setEditScreenshotFile(null);
    setEditScreenshotPreview(null);
  }

  function handleEditScreenshot(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      ![
        "image/png",
        "image/jpeg",
        "image/webp",
      ].includes(file.type)
    ) {
      setError(
        "Please upload a PNG, JPG, or WebP image.",
      );
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setError(
        "Screenshot must be smaller than 10MB.",
      );
      return;
    }

    setEditScreenshotFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setEditScreenshotPreview(
      previewUrl,
    );
  }

  async function saveEdit() {
    if (!editingTrade || !editForm)
      return;

    if (!editForm.pnl.trim()) {
      setError("Please enter a P&L.");
      return;
    }

    if (!editForm.symbol.trim()) {
      setError(
        "Please enter an instrument.",
      );
      return;
    }

    const pnl = Number(
      editForm.pnl,
    );

    if (Number.isNaN(pnl)) {
      setError(
        "Please enter a valid P&L.",
      );
      return;
    }

    setSavingEdit(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError(
          "Your session has expired. Please log in again.",
        );
        return;
      }

      let screenshotUrl =
        editForm.screenshot_url ||
        null;

      if (editScreenshotFile) {
        const extension =
          editScreenshotFile.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("trade-screenshots")
          .upload(
            filePath,
            editScreenshotFile,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                editScreenshotFile.type,
            },
          );

        if (uploadError) {
          console.error(
            "SCREENSHOT UPLOAD ERROR:",
            uploadError,
          );

          throw new Error(
            "We couldn't upload the new screenshot.",
          );
        }

        const {
          data: { publicUrl },
        } =
          supabase.storage
            .from(
              "trade-screenshots",
            )
            .getPublicUrl(filePath);

        screenshotUrl = publicUrl;
      }

      const {
        data,
        error: updateError,
      } = await supabase
        .from("trades")
        .update({
          trade_date:
            editForm.trade_date,
          pnl,
          symbol:
            editForm.symbol
              .trim()
              .toUpperCase(),
          direction:
            editForm.direction,
          emotion:
            editForm.emotion || null,
          followed_plan:
            editForm.followed_plan,
          setup:
            editForm.setup.trim() ||
            null,
          execution_rating:
            editForm.execution_rating ||
            null,
          grade:
            editForm.execution_rating ||
            null,
          visibility:
            editForm.visibility,
          notes:
            editForm.notes.trim() ||
            null,
          screenshot_url:
            screenshotUrl,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", editingTrade.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        console.error(
          "JOURNAL UPDATE ERROR:",
          updateError,
        );

        throw updateError;
      }

      setTrades((current) =>
        current.map((trade) =>
          trade.id === editingTrade.id
            ? (data as Trade)
            : trade,
        ),
      );

      closeEditModal();
    } catch (err) {
      console.error(
        "JOURNAL EDIT ERROR:",
        err,
      );

      setError(
        "We couldn't save your changes.",
      );
    } finally {
      setSavingEdit(false);
    }
  }

  /* =========================================================
     SHARE JOURNAL
  ========================================================= */

  async function shareJournal(
    trade: Trade,
  ) {
    if (sharingTradeId) return;

    setSharingTradeId(trade.id);
    setError("");

    try {
      const dataUrl =
        await createJournalPng(
          trade,
          profile,
        );

      const link =
        document.createElement("a");

      link.download =
        `trademirror-${trade.symbol.toLowerCase()}-${trade.trade_date}.png`;

      link.href = dataUrl;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    } catch (err) {
      console.error(
        "PNG EXPORT ERROR:",
        err,
      );

      setError(
        "We couldn't create your journal image. Please try again.",
      );
    } finally {
      setSharingTradeId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#03070d] px-4 py-6 text-white lg:px-7">
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}

        <div>
          <div className="flex items-start justify-between gap-5">
            <div>
              <h1 className="mt-3 text-[29px] font-semibold tracking-[-0.045em] text-white/90">
                Your Journal
              </h1>

              <p className="mt-2 text-[13px] text-white/35">
                Your trades, thoughts, and decisions — all in one
                place.
              </p>
            </div>

            <div className="hidden h-11 w-11 items-center justify-center rounded-[11px] border border-white/[0.07] bg-white/[0.018] text-blue-300/70 sm:flex">
              <BookOpen
                className="h-5 w-5"
                strokeWidth={1.6}
              />
            </div>
          </div>
        </div>

        {/* TOOLBAR */}

        <div className="mt-7 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative max-w-[420px] flex-1">
            <Search
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25"
              strokeWidth={1.7}
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search your journal..."
              className="h-11 w-full rounded-[11px] border border-white/[0.075] bg-[#0b1621]/80 pl-11 pr-4 text-[12px] text-white/70 outline-none transition placeholder:text-white/20 focus:border-blue-400/20 focus:bg-[#0d1925]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-white/[0.06] bg-white/[0.018] text-white/25">
              <Filter
                className="h-3.5 w-3.5"
                strokeWidth={1.7}
              />
            </div>

            {(
              [
                "All",
                "Wins",
                "Losses",
                "No Plan",
              ] as FilterType[]
            ).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setFilter(item)
                }
                className={`h-9 shrink-0 cursor-pointer rounded-[9px] border px-4 text-[10px] font-medium transition ${
                  filter === item
                    ? "border-blue-400/20 bg-blue-500/[0.09] text-blue-200/80"
                    : "border-white/[0.06] bg-white/[0.015] text-white/35 hover:bg-white/[0.03] hover:text-white/55"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_270px]">
          <section>
            {loading ? (
              <div className="flex min-h-[400px] items-center justify-center rounded-[15px] border border-white/[0.07] bg-[#0b1621]/70">
                <p className="text-[11px] text-white/25">
                  Loading journal...
                </p>
              </div>
            ) : groupedTrades.length === 0 ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[15px] border border-white/[0.07] bg-[#0b1621]/70 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-white/[0.06] bg-white/[0.02]">
                  <BookOpen
                    className="h-6 w-6 text-white/20"
                    strokeWidth={1.5}
                  />
                </div>

                <h2 className="mt-5 text-[18px] font-semibold tracking-[-0.03em] text-white/75">
                  No journal entries
                </h2>

                <p className="mt-2 max-w-[300px] text-[12px] leading-5 text-white/30">
                  Your journaled trades will appear here once you
                  start recording your trading decisions.
                </p>
              </div>
            ) : (
              <div className="space-y-7">
                {groupedTrades.map(
                  ([date, dayTrades]) => {
                    const dayPnl =
                      dayTrades.reduce(
                        (sum, trade) =>
                          sum +
                          Number(
                            trade.pnl,
                          ),
                        0,
                      );

                    return (
                      <div key={date}>
                        <div className="mb-3 flex items-center justify-between px-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/30">
                            {formatDate(date)}
                          </p>

                          <p
                            className={`text-[11px] font-semibold ${
                              dayPnl > 0
                                ? "text-emerald-400"
                                : dayPnl < 0
                                  ? "text-red-400"
                                  : "text-white/30"
                            }`}
                          >
                            {formatPnl(dayPnl)}
                          </p>
                        </div>

                        <div className="space-y-2.5">
                          {dayTrades.map(
                            (trade) => (
                              <JournalCard
                                key={
                                  trade.id
                                }
                                trade={
                                  trade
                                }
                                expanded={
                                  expandedTrade ===
                                  trade.id
                                }
                                onToggle={() =>
                                  setExpandedTrade(
                                    (
                                      current,
                                    ) =>
                                      current ===
                                      trade.id
                                        ? null
                                        : trade.id,
                                  )
                                }
                                onEdit={() =>
                                  startEditing(
                                    trade,
                                  )
                                }
                                onShare={() =>
                                  shareJournal(
                                    trade,
                                  )
                                }
                              />
                            ),
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </section>

          {/* SUMMARY */}

          <aside className="h-fit space-y-3 xl:sticky xl:top-6">
            <div className="rounded-[14px] border border-white/[0.075] bg-[#0b1621]/80 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25">
                Journal Summary
              </p>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/30">
                    Entries
                  </span>

                  <span className="text-[13px] font-semibold text-white/70">
                    {stats.entries}
                  </span>
                </div>

                <div className="h-px bg-white/[0.045]" />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/30">
                    Total P&L
                  </span>

                  <span
                    className={`text-[13px] font-semibold ${
                      stats.totalPnl >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatPnl(
                      stats.totalPnl,
                    )}
                  </span>
                </div>

                <div className="h-px bg-white/[0.045]" />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/30">
                    Win rate
                  </span>

                  <span className="text-[13px] font-semibold text-white/70">
                    {stats.winRate.toFixed(
                      0,
                    )}
                    %
                  </span>
                </div>

                <div className="h-px bg-white/[0.045]" />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/30">
                    Plan followed
                  </span>

                  <span className="text-[13px] font-semibold text-white/70">
                    {stats.planFollowed.toFixed(
                      0,
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[14px] border border-white/[0.075] bg-[#0b1621]/80 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25">
                Top Setups
              </p>

              {topSetups.length === 0 ? (
                <p className="mt-5 text-[11px] text-white/20">
                  No setups recorded yet.
                </p>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {topSetups.map(
                    ([setup, count]) => (
                      <div
                        key={setup}
                        className="flex items-center justify-between"
                      >
                        <span className="max-w-[160px] truncate text-[11px] text-white/40">
                          {setup}
                        </span>

                        <span className="rounded-full bg-white/[0.025] px-2 py-1 text-[8px] text-white/25">
                          {count}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>

            <div className="rounded-[14px] border border-blue-400/[0.08] bg-blue-500/[0.025] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-blue-300/35">
                Journal Tip
              </p>

              <p className="mt-3 text-[11px] leading-5 text-white/35">
                Don't just record what happened. Write down why you
                entered, what you saw, and whether you followed your
                process.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editingTrade &&
        editForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
            <div className="max-h-[90vh] w-full max-w-[620px] overflow-hidden rounded-[18px] border border-white/[0.09] bg-[#07111b] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
                <div>
                  <p className="text-[16px] font-semibold tracking-[-0.025em] text-white/90">
                    Edit Journal Entry
                  </p>

                  <p className="mt-1 text-[10px] text-white/30">
                    Update your trade journal.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeEditModal
                  }
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[9px] border border-white/[0.06] bg-white/[0.02] text-white/35 transition hover:text-white/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-[10px] text-white/35">
                      Trade date
                    </span>

                    <input
                      type="date"
                      value={
                        editForm.trade_date
                      }
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          trade_date:
                            event.target
                              .value,
                        })
                      }
                      className="h-11 w-full rounded-[10px] border border-white/[0.07] bg-[#0a141e] px-3 text-[11px] text-white/70 outline-none [color-scheme:dark]"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-[10px] text-white/35">
                      P&L
                    </span>

                    <input
                      type="number"
                      step="0.01"
                      value={
                        editForm.pnl
                      }
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          pnl: event
                            .target
                            .value,
                        })
                      }
                      className="h-11 w-full rounded-[10px] border border-white/[0.07] bg-[#0a141e] px-3 text-[11px] text-white/70 outline-none"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-[10px] text-white/35">
                      Instrument
                    </span>

                    <input
                      value={
                        editForm.symbol
                      }
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          symbol:
                            event.target
                              .value,
                        })
                      }
                      className="h-11 w-full rounded-[10px] border border-white/[0.07] bg-[#0a141e] px-3 text-[11px] text-white/70 outline-none"
                    />
                  </label>

                  <div>
                    <span className="mb-2 block text-[10px] text-white/35">
                      Direction
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          "Long",
                          "Short",
                        ] as const
                      ).map(
                        (direction) => (
                          <button
                            key={
                              direction
                            }
                            type="button"
                            onClick={() =>
                              setEditForm(
                                {
                                  ...editForm,
                                  direction,
                                },
                              )
                            }
                            className={`h-11 cursor-pointer rounded-[10px] border text-[10px] ${
                              editForm.direction ===
                              direction
                                ? direction ===
                                  "Long"
                                  ? "border-emerald-400/20 bg-emerald-500/[0.07] text-emerald-400"
                                  : "border-red-400/20 bg-red-500/[0.07] text-red-400"
                                : "border-white/[0.07] bg-white/[0.02] text-white/35"
                            }`}
                          >
                            {direction}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <label>
                    <span className="mb-2 block text-[10px] text-white/35">
                      Emotion
                    </span>

                    <select
                      value={
                        editForm.emotion
                      }
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          emotion:
                            event.target
                              .value,
                        })
                      }
                      className="h-11 w-full rounded-[10px] border border-white/[0.07] bg-[#0a141e] px-3 text-[11px] text-white/70 outline-none"
                    >
                      {[
                        "Focused",
                        "Calm",
                        "Confident",
                        "Hesitant",
                        "Nervous",
                        "Scared",
                        "Frustrated",
                        "Impulsive",
                        "Greedy",
                      ].map(
                        (emotion) => (
                          <option
                            key={
                              emotion
                            }
                            value={
                              emotion
                            }
                          >
                            {emotion}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label>
                    <span className="mb-2 block text-[10px] text-white/35">
                      Execution
                    </span>

                    <select
                      value={
                        editForm.execution_rating
                      }
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          execution_rating:
                            event.target
                              .value,
                        })
                      }
                      className="h-11 w-full rounded-[10px] border border-white/[0.07] bg-[#0a141e] px-3 text-[11px] text-white/70 outline-none"
                    >
                      {[
                        "Great execution",
                        "Good execution",
                        "Iffy execution",
                        "Poor execution",
                      ].map(
                        (rating) => (
                          <option
                            key={
                              rating
                            }
                            value={
                              rating
                            }
                          >
                            {rating}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                </div>

                <label className="mt-4 block">
                  <span className="mb-2 block text-[10px] text-white/35">
                    Setup
                  </span>

                  <input
                    value={
                      editForm.setup
                    }
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        setup:
                          event.target
                            .value,
                      })
                    }
                    className="h-11 w-full rounded-[10px] border border-white/[0.07] bg-[#0a141e] px-3 text-[11px] text-white/70 outline-none"
                  />
                </label>

                <div className="mt-5">
                  <span className="mb-2 block text-[10px] text-white/35">
                    Followed your plan?
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {[true, false].map(
                      (value) => (
                        <button
                          key={String(
                            value,
                          )}
                          type="button"
                          onClick={() =>
                            setEditForm({
                              ...editForm,
                              followed_plan:
                                value,
                            })
                          }
                          className={`h-10 cursor-pointer rounded-[10px] border text-[10px] ${
                            editForm.followed_plan ===
                            value
                              ? "border-blue-400/20 bg-blue-500/[0.07] text-blue-300"
                              : "border-white/[0.07] bg-white/[0.02] text-white/35"
                          }`}
                        >
                          {value
                            ? "Yes"
                            : "No"}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <label className="mt-5 block">
                  <span className="mb-2 block text-[10px] text-white/35">
                    Journal
                  </span>

                  <textarea
                    value={
                      editForm.notes
                    }
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        notes:
                          event.target
                            .value,
                      })
                    }
                    rows={6}
                    className="w-full resize-none rounded-[11px] border border-white/[0.07] bg-[#0a141e] px-3 py-3 text-[11px] leading-5 text-white/70 outline-none"
                  />
                </label>

                <div className="mt-5">
                  <span className="mb-2 block text-[10px] text-white/35">
                    Visibility
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        "Private",
                        "Followers",
                        "Public",
                      ] as const
                    ).map(
                      (visibility) => (
                        <button
                          key={
                            visibility
                          }
                          type="button"
                          onClick={() =>
                            setEditForm({
                              ...editForm,
                              visibility,
                            })
                          }
                          className={`h-10 cursor-pointer rounded-[10px] border text-[10px] ${
                            editForm.visibility ===
                            visibility
                              ? "border-blue-400/20 bg-blue-500/[0.07] text-blue-300"
                              : "border-white/[0.07] bg-white/[0.02] text-white/35"
                          }`}
                        >
                          {visibility}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <span className="mb-2 block text-[10px] text-white/35">
                    Trade screenshot
                  </span>

                  {editScreenshotPreview ? (
                    <div className="relative overflow-hidden rounded-[12px] border border-white/[0.07]">
                      <img
                        src={
                          editScreenshotPreview
                        }
                        alt="Trade screenshot preview"
                        className="max-h-[260px] w-full object-contain"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setEditScreenshotFile(
                            null,
                          );

                          setEditScreenshotPreview(
                            null,
                          );

                          setEditForm({
                            ...editForm,
                            screenshot_url:
                              "",
                          });
                        }}
                        className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-[9px] border border-red-400/20 bg-black/60 text-red-400 backdrop-blur"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-white/[0.07] bg-white/[0.015] py-8">
                      <Upload className="h-5 w-5 text-white/20" />

                      <p className="mt-2 text-[10px] text-white/40">
                        Upload a new screenshot
                      </p>

                      <p className="mt-1 text-[9px] text-white/20">
                        PNG, JPG or WebP · Max 10MB
                      </p>

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={
                          handleEditScreenshot
                        }
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] px-6 py-4">
                <button
                  type="button"
                  onClick={
                    closeEditModal
                  }
                  className="h-10 cursor-pointer rounded-[10px] border border-white/[0.07] bg-white/[0.02] px-4 text-[10px] text-white/40 transition hover:text-white/70"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    savingEdit
                  }
                  onClick={
                    saveEdit
                  }
                  className="flex h-10 cursor-pointer items-center gap-2 rounded-[10px] bg-blue-500 px-5 text-[10px] font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingEdit
                    ? "Saving..."
                    : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* EXPORTING INDICATOR */}

      {sharingTradeId && (
        <div className="fixed bottom-5 right-5 z-[200] flex items-center gap-3 rounded-xl border border-blue-400/15 bg-[#0b1119]/95 px-4 py-3 text-[10px] text-blue-200/70 shadow-2xl backdrop-blur-xl">
          <div className="h-3 w-3 animate-spin rounded-full border border-blue-300/20 border-t-blue-400" />
          Creating journal image...
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="fixed bottom-5 right-5 z-[200] flex items-center gap-3 rounded-xl border border-red-500/20 bg-[#0b1119]/95 px-4 py-3 text-[10px] text-red-400 shadow-2xl backdrop-blur-xl">
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="cursor-pointer text-red-400/50 hover:text-red-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </main>
  );
}