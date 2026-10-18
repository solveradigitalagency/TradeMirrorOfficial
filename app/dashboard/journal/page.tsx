
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toBlob } from "html-to-image";
import { createClient } from "@/lib/supabase/client";

type Trade = {
  id: string;
  user_id?: string;
  trade_date: string | null;
  entry_time: string | null;
  exit_time: string | null;
  symbol: string | null;
  market: string | null;
  direction: string | null;
  entry_price: number | null;
  exit_price: number | null;
  quantity: number | null;
  pnl: number | null;
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
  result: string | null;
  created_at?: string | null;
};

const DEMO_TRADE: Trade = {
  id: "demo-trade",
  trade_date: "2026-10-14",
  entry_time: "09:42",
  exit_time: "09:51",
  symbol: "NQ",
  market: "Nasdaq Futures",
  direction: "Long",
  entry_price: 24150.25,
  exit_price: 24175.25,
  quantity: 1,
  pnl: 500,
  risk_amount: 250,
  r_multiple: 2,
  setup: "Liquidity sweep + IFVG",
  market_condition: "Trending",
  session: "New York",
  grade: "A",
  followed_plan: true,
  notes:
    "Price swept the previous session low before reclaiming the level. Waited for confirmation, entered on the inversion fair value gap, and took profit at the next liquidity target. Patient execution. No revenge trading.",
  screenshot_url: null,
  emotion: "Confident",
  execution_rating: "Excellent",
  result: "Win",
};

const money = (value: number | null | undefined) => {
  if (value == null || !Number.isFinite(Number(value))) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
};

const number = (value: number | null | undefined) => {
  if (value == null || !Number.isFinite(Number(value))) return "—";

  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 4,
  });
};

const dateLabel = (value: string | null) => {
  if (!value) return "Undated";

  const date = new Date(`${value.slice(0, 10)}T12:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// ---- Rewritten Detail component ----
function Detail({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number | null | undefined;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0 border-b border-stone-400/35 py-1.5 last:border-b-0">
      <span className="detail-label">
        {label}
        <span className="colon">:</span>
      </span>
      <span className={`detail-value ${accent ? "detail-value-accent" : ""}`}>
        {value == null || value === "" ? "—" : value}
      </span>
    </div>
  );
}
// ---- End Detail ----

// ----- BookDetail ROW and utils -----
function BookDetail({
  label,
  value,
  positive,
}: {
  label: string;
  value: string | number | null | undefined;
  positive?: boolean;
}) {
  return (
    <div className="book-detail-row">
      <span className="book-detail-label">{label}</span>
      <span
        className={`book-detail-value ${
          positive === true
            ? "book-value-positive"
            : positive === false
              ? "book-value-negative"
              : ""
        }`}
      >
        {value == null || value === "" ? "—" : value}
      </span>
    </div>
  );
}

const bookDateLabel = (value: string | null) => {
  if (!value) return "UNDATED";

  const date = new Date(`${value.slice(0, 10)}T12:00:00`);

  if (Number.isNaN(date.getTime())) return value.toUpperCase();

  return date
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
};

// ----------------------------------

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [showExample, setShowExample] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Export state and book ref
  const bookRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  // --- Share preview states ---
  const [isSharePreviewOpen, setIsSharePreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);

  const loadTrades = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      let user: { id: string } | null = null;

      try {
        const result = await supabase.auth.getUser();

        if (result.error) {
          const message = result.error.message?.toLowerCase() ?? "";

          if (
            !message.includes("session missing") &&
            !message.includes("auth session missing")
          ) {
            throw result.error;
          }
        } else {
          user = result.data.user;
        }
      } catch (authError) {
        const message =
          authError instanceof Error
            ? authError.message.toLowerCase()
            : "";

        if (
          !message.includes("session missing") &&
          !message.includes("auth session missing")
        ) {
          throw authError;
        }
      }

      if (!user) {
        setSignedIn(false);
        setTrades([]);
        return;
      }

      setSignedIn(true);

      const { data, error: queryError } = await supabase
        .from("trades")
        .select(
          "id,user_id,trade_date,entry_time,exit_time,symbol,market,direction,entry_price,exit_price,quantity,pnl,risk_amount,r_multiple,setup,market_condition,session,grade,followed_plan,notes,screenshot_url,emotion,execution_rating,result,created_at"
        )
        .eq("user_id", user.id)
        .order("trade_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;

      setTrades((data ?? []) as Trade[]);
    } catch (err) {
      console.error("Journal loading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your journal."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTrades();
  }, [loadTrades, refreshKey]);

  const journalTrades = useMemo(() => {
    const combined = [...trades];

    if (showExample) combined.push(DEMO_TRADE);

    return combined;
  }, [trades, showExample]);

  const currentTrade = journalTrades[activeIndex] ?? null;
  const isDemo = currentTrade?.id === "demo-trade";

  // --- PNG export and sharing functions ---

  const createBookPng = async (): Promise<Blob> => {
    const book = bookRef.current;

    if (!book) {
      throw new Error("The journal book could not be found.");
    }

    if ("fonts" in document) {
      await document.fonts.ready;
    }

    const images = Array.from(book.querySelectorAll("img"));

    await Promise.all(
      images.map(async (img) => {
        if (img.complete) {
          if (img.naturalWidth === 0 && img.src) {
            throw new Error(
              "A journal image could not be loaded. Please reload and try again."
            );
          }
          return;
        }

        await new Promise<void>((resolve, reject) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener(
            "error",
            () => reject(new Error("A journal image could not be loaded.")),
            { once: true }
          );
        });
      })
    );

    const blob = await toBlob(book, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: "#101011",
    });

    if (!blob) {
      throw new Error("Could not generate the journal PNG.");
    }

    return blob;
  };

  // REPLACE OLD shareJournalPng + downloadJournalPng WITH THIS SECTION

  const shareJournalPng = async () => {
    setIsExporting(true);
    setExportError("");

    try {
      const blob = await createBookPng();
      const url = URL.createObjectURL(blob);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewBlob(blob);
      setPreviewUrl(url);
      setIsSharePreviewOpen(true);
    } catch (error) {
      console.error("Journal preview failed:", error);

      setExportError(
        error instanceof Error
          ? error.message
          : "Unable to prepare your journal preview."
      );
    } finally {
      setIsExporting(false);
    }
  };

  const downloadPreviewPng = () => {
    if (!previewBlob) return;

    const url = URL.createObjectURL(previewBlob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `trademirror-journal-${
      currentTrade?.symbol || "entry"
    }-${currentTrade?.trade_date || "trade"}.png`.replace(
      /[^a-zA-Z0-9._-]/g,
      "-"
    );

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const closeSharePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setPreviewBlob(null);
    setIsSharePreviewOpen(false);
  };

  function toggleExample() {
    if (showExample) {
      setShowExample(false);
      setActiveIndex(0);
    } else {
      setShowExample(true);
      setActiveIndex(trades.length);
    }
  }

  function goToTrade(index: number) {
    if (!journalTrades.length) return;

    setActiveIndex(
      (index + journalTrades.length) % journalTrades.length
    );
  }

  return (
    <main className="journal-background">
      <div className="journal-stage">
        <section className="journal-layout">
          <div className="book-shell" ref={bookRef}>
            <div className="book-pages">
              <div className="book-spread">
                {/* LEFT PAGE: TRADE */}
                <article className="book-page book-left">
                  {loading ? (
                    <div className="empty-state">
                      <div className="loading-line w-20" />
                      <div className="loading-line mt-7 w-40" />
                      <div className="loading-line mt-4 w-3/4" />
                      <div className="loading-line mt-10 w-full" />
                      <div className="loading-line mt-4 w-5/6" />
                      <p className="mt-6 text-xs text-stone-400">
                        Opening your journal…
                      </p>
                    </div>
                  ) : error ? (
                    <div className="empty-state">
                      <p className="eyebrow">A little interruption</p>
                      <h2 className="mt-4 text-2xl font-semibold">
                        Couldn&apos;t load your entries.
                      </h2>
                      <p className="mt-3 break-words text-sm leading-6 text-stone-500">
                        {error}
                      </p>
                      <button
                        onClick={() =>
                          setRefreshKey((value) => value + 1)
                        }
                        className="action-button mt-5"
                      >
                        Try again
                      </button>
                    </div>
                  ) : currentTrade ? (
                    <>
                      <div className="page-content trade-page-content">

                        {/* Book Masthead */}
                        <div className="book-masthead">
                          <div className="brand-lockup">
                            {/* Removed <span className="brand-mark">TM</span> */}
                            <span className="brand-name">TRADEMIRROR</span>
                          </div>
                          <span className="masthead-label">TRADING JOURNAL</span>
                        </div>

                        {/* Trade Heading */}
                        <header className="trade-heading">
                          <div className="min-w-0">
                            <h1 className="trade-date">
                              {currentTrade.trade_date
                                ? new Date(`${currentTrade.trade_date.slice(0, 10)}T12:00:00`)
                                    .toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                    .toUpperCase()
                                : "UNDATED TRADE"}
                            </h1>
                            <div className="section-accent" />
                            <p className="trade-symbol">
                              {currentTrade.symbol || "TRADE"}
                            </p>
                          </div>
                          <span className="trade-badge">
                            {isDemo ? "Sample entry" : currentTrade.result || "Recorded"}
                          </span>
                        </header>

                        {/* Chart Section */}
                        <section className="chart-section">
                          <div className="book-chart-frame">
                            {currentTrade.screenshot_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={currentTrade.screenshot_url}
                                alt={`${currentTrade.symbol || "Trade"} chart`}
                                className="book-chart-image"
                              />
                            ) : (
                              <div className="book-chart-placeholder">
                                <span className="placeholder-mark">TM</span>
                                <span>CHART SCREENSHOT</span>
                                <span className="placeholder-caption">
                                  No chart attached to this trade
                                </span>
                              </div>
                            )}
                          </div>
                        </section>

                        {/* Setup Section */}
                        <section className="setup-section">
                          <h2 className="book-section-title">THE SETUP</h2>
                          <span className="blue-rule section-accent" />
                          <p className="setup-copy">
                            {currentTrade.setup ||
                              currentTrade.notes ||
                              "No setup notes recorded for this trade."}
                          </p>
                        </section>
                      </div>

                      {/* -- Footer updated to new format -- */}
                      <footer className="page-footer book-page-footer">
                        <span>
                          TRADEMIRROR #{activeIndex + 24}
                        </span>
                      </footer>
                    </>
                  ) : (
                    <div className="empty-state">
                      <p className="eyebrow">
                        TradeMirror · Personal logbook
                      </p>
                      <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight">
                        Every trade tells a story.
                      </h1>
                      <p className="mt-4 max-w-sm text-sm leading-6 text-stone-500">
                        Every setup, every decision, every lesson.
                        Your trading history starts with a single entry.
                      </p>
                      <div className="mt-7 border-t border-stone-300/80 pt-4">
                        <p className="text-xs text-stone-400">
                          {signedIn === false
                            ? "Sign in to access your saved trades."
                            : "Your journal is ready for its first entry."}
                        </p>
                        <button
                          onClick={toggleExample}
                          className="action-button mt-4 dark-button"
                        >
                          Preview a sample entry
                        </button>
                      </div>
                    </div>
                  )}
                </article>

                {/* RIGHT PAGE: REVIEW */}
                <article className="book-page book-right">
                  {loading ? (
                    <div className="empty-state">
                      <div className="loading-line w-24" />
                      <div className="loading-line mt-7 w-48" />
                      <div className="loading-line mt-4 w-full" />
                      <div className="loading-line mt-4 w-5/6" />
                    </div>
                  ) : error ? (
                    <div className="empty-state">
                      <p className="eyebrow">Journal status</p>
                      <h2 className="mt-4 text-2xl font-semibold">
                        Your pages are still here.
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-stone-500">
                        Try loading your journal again. Your saved
                        trades have not been changed.
                      </p>
                    </div>
                  ) : currentTrade ? (
                    <>
                      <div className="page-content review-content">
                        <header className="right-masthead">
                          <span>BETTER TRADES. CLEARER THINKING.</span>
                        </header>
                        <div className="flex min-h-0 flex-col">
                          <section className="journal-section trade-details-section">
                            <h2 className="section-title">TRADE DETAILS</h2>
                            <div className="section-accent" />

                            <div className="detail-grid">
                              <Detail label="Instrument" value={currentTrade.symbol} />
                              <Detail label="Direction" value={currentTrade.direction} />
                              <Detail label="Contracts" value={number(currentTrade.quantity)} />
                              <div className="min-w-0 border-b border-stone-400/35 py-1.5 last:border-b-0">
                                <span className="detail-label">
                                  P&amp;L
                                  <span className="colon">:</span>
                                </span>
                                <span
                                  className={`pnl-value ${
                                    Number(currentTrade.pnl ?? 0) > 0
                                      ? "text-emerald-700"
                                      : Number(currentTrade.pnl ?? 0) < 0
                                      ? "text-rose-700"
                                      : "text-stone-500"
                                  }`}
                                >
                                  {money(currentTrade.pnl)}
                                </span>
                              </div>
                              <Detail
                                label="Followed Plan"
                                value={
                                  currentTrade.followed_plan == null
                                  ? "—"
                                  : currentTrade.followed_plan
                                    ? "YES"
                                    : "NO"
                                }
                                accent={currentTrade.followed_plan === true}
                              />
                              <Detail label="Emotion" value={currentTrade.emotion} />
                            </div>
                          </section>
                          {/* Reflection section - compact mt-5 */}
                          <section className="mt-5 min-w-0">
                            <h2 className="text-xl font-bold tracking-[0.12em] text-[#142943]">
                              REFLECTION
                            </h2>
                            <div className="mt-2 h-[2px] w-10 bg-blue-600" />
                            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#3f3a33]">
                              {currentTrade.notes?.trim() || "No reflection recorded for this trade."}
                            </p>
                          </section>
                        </div>
                      </div>

                      <footer className="page-footer book-page-footer">
                        <span className="book-footer-symbol">⌂</span>
                        <span>{String(activeIndex * 2 + 25).padStart(2, "0")}</span>
                      </footer>
                    </>
                  ) : (
                    <div className="empty-state">
                      <p className="eyebrow">The next chapter</p>
                      <h2 className="mt-4 text-3xl font-semibold">
                        A fresh page.
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-stone-500">
                        Your future entries will live here alongside
                        your setups, execution notes, and lessons learned.
                      </p>
                      <div className="mt-8 border-t border-stone-300/80 pt-4 text-xs text-stone-400">
                        The best traders never stop learning.
                      </div>
                    </div>
                  )}
                </article>
              </div>
            </div>
            {/* PAGE CORNER NAVIGATION */}
            {currentTrade && !loading && !error && journalTrades.length > 1 && (
              <nav className="page-corner-navigation" aria-label="Trade navigation">
                <button
                  type="button"
                  className="page-corner page-corner-previous"
                  onClick={() => goToTrade(activeIndex - 1)}
                  aria-label="Previous trade"
                  title="Previous trade"
                >
                  <span aria-hidden="true">‹</span>
                </button>
                <button
                  type="button"
                  className="page-corner page-corner-next"
                  onClick={() => goToTrade(activeIndex + 1)}
                  aria-label="Next trade"
                  title="Next trade"
                >
                  <span aria-hidden="true">›</span>
                </button>
              </nav>
            )}
          </div>

          {/* JOURNAL COUNT */}
          <div className="journal-count">
            <span className="journal-count-number">
              {journalTrades.length}
            </span>
            <span className="journal-count-label">
              JOURNAL ENTRIES
            </span>
          </div>

          {/* Share and Download PNG & error */}
          <div className="share-actions">
            <button
              type="button"
              onClick={shareJournalPng}
              disabled={isExporting || !currentTrade || loading || !!error}
              className="share-button share-button-primary"
            >
              {isExporting ? "Preparing preview…" : "Share Journal"}
            </button>
          </div>
          {exportError && (
            <p className="export-error" role="alert">
              {exportError}
            </p>
          )}
        </section>
      </div>

      {/* Share Preview Overlay */}
      {isSharePreviewOpen && previewUrl && (
        <div
          className="share-preview-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Journal PNG preview"
        >
          <header className="share-preview-toolbar">
            <div className="share-preview-heading">
              <span className="share-preview-title">Journal Preview</span>
              <span className="share-preview-subtitle">
                {currentTrade?.symbol || "Trade"} · PNG
              </span>
            </div>
            <div className="share-preview-actions">
              <button
                type="button"
                className="preview-icon-button"
                onClick={downloadPreviewPng}
                aria-label="Save journal as PNG"
                title="Save PNG"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M12 15V3" />
                </svg>
              </button>
              <button
                type="button"
                className="preview-icon-button"
                onClick={closeSharePreview}
                aria-label="Close preview"
                title="Close"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>
          <div className="share-preview-canvas">
            <img
              src={previewUrl}
              alt="Full journal entry preview"
              className="share-preview-image"
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .journal-background {
          position: relative;
          width: 100%;
          min-height: calc(100svh - 4rem);
          height: auto;
          overflow: visible;
          color: white;
          background:
            radial-gradient(
              ellipse at 50% 42%,
              rgba(255, 255, 255, 0.055),
              transparent 58%
            ),
            #0b0b0c;
        }

        .journal-stage {
          width: 100%;
          min-height: calc(100svh - 4rem);
          height: auto;
          padding: 28px 28px 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .journal-layout {
          position: relative;
          width: 100%;
          max-width: 1160px;
          margin: 0 auto;
          padding-bottom: 12px;
        }

        @media (max-width: 767px) {
          .journal-stage {
            min-height: auto;
            padding: 20px 12px 28px;
          }
        }

        /* Book Shell - Navy Leather Cover */
        .book-shell {
          position: relative;
          isolation: isolate;
          width: 100%;
          margin: 0 auto;
          padding: 17px;
          border: 1px solid #263a50;
          border-radius: 23px 27px 27px 23px;
          background:
            radial-gradient(ellipse at 20% 8%, rgba(95, 130, 164, 0.2), transparent 38%),
            radial-gradient(ellipse at 80% 95%, rgba(0, 0, 0, 0.45), transparent 45%),
            repeating-linear-gradient(
              115deg,
              rgba(255, 255, 255, 0.012) 0px,
              rgba(255, 255, 255, 0.012) 1px,
              transparent 1px,
              transparent 4px
            ),
            linear-gradient(135deg, #182b40 0%, #091522 48%, #14283c 100%);
          box-shadow:
            0 35px 80px rgba(0, 0, 0, 0.55),
            0 8px 22px rgba(0, 0, 0, 0.35),
            inset 2px 0 4px rgba(255, 255, 255, 0.08);
        }

        .book-shell::before {
          position: absolute;
          z-index: -1;
          inset: 7px;
          border: 1px dashed rgba(140, 172, 202, 0.6);
          border-radius: 17px 21px 21px 17px;
          content: "";
          pointer-events: none;
        }

        .book-shell::after {
          content: none;
          display: none;
        }

        /* Book Pages */
        .book-pages {
          position: relative;
          background: #c8c0b2;
          border-radius: 5px;
          box-shadow:
            2px 2px 0 #e1d8c8,
            4px 4px 0 #a79d8e,
            6px 6px 0 #d2c9ba,
            8px 8px 0 #81796d,
            11px 12px 22px rgba(0, 0, 0, 0.4);
        }

        /* Book Spread & Pages - Paper Look */
        .book-spread {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          height: clamp(560px, calc(100svh - 220px), 760px);
          overflow: hidden;
          border-radius: 4px;
          background: #f1e8d9;
          box-shadow:
            0 0 0 1px rgba(87, 70, 49, 0.45),
            inset 0 0 18px rgba(93, 68, 42, 0.12);
        }

        @media (min-width: 768px) {
          .book-spread {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          }
        }

        @media (max-height: 760px) and (min-width: 768px) {
          .book-spread {
            height: calc(100svh - 190px);
            min-height: 480px;
          }
        }


        .book-page {
          position: relative;
          display: flex;
          min-width: 0;
          min-height: 0;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          padding: 30px 30px 19px;
          color: #10243e;
          font-family: Georgia, "Times New Roman", serif;
          background-color: #f4ecdf;
          background-image:
            radial-gradient(ellipse at 15% 10%, rgba(255, 255, 255, 0.52), transparent 55%),
            radial-gradient(ellipse at 90% 90%, rgba(157, 124, 84, 0.08), transparent 50%),
            repeating-linear-gradient(
              0deg,
              rgba(99, 77, 51, 0.018) 0px,
              rgba(99, 77, 51, 0.018) 1px,
              transparent 1px,
              transparent 4px
            );
        }

        .book-left {
          background-color: #f7efe3;
          box-shadow:
            inset -16px 0 22px -19px rgba(54, 39, 24, 0.75),
            inset 4px 0 8px rgba(255, 255, 255, 0.3);
        }

        .book-right {
          background-color: #f3eadc;
          box-shadow:
            inset 16px 0 22px -19px rgba(54, 39, 24, 0.75),
            inset -4px 0 8px rgba(255, 255, 255, 0.25);
        }

        .page-content {
          position: relative;
          z-index: 1;
          min-width: 0;
          min-height: 0;
        }

        /* Let the left page content use all available height. */
        .trade-page-content {
          display: flex;
          flex: 1;
          flex-direction: column;
          min-height: 0;
        }

        .right-masthead {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          min-height: 40px;
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(120, 110, 91, 0.28);
          color: #777064;
          font-size: 8px;
          letter-spacing: 0.15em;
          text-align: right;
        }

        .journal-section {
          min-width: 0;
        }

        .section-title {
          color: #10243e;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 19px;
          font-weight: 700;
          letter-spacing: 0.1em;
        }

        .section-accent {
          width: 42px;
          height: 2px;
          margin-top: 12px;
          background: #1765bd;
        }

        .trade-details-section {
          /* extra space if needed, see base journal-section */
        }

        .setup-section .section-accent,
        .reflection-section .section-accent {
          margin-top: 13px;
        }

        .reflection-section {
          margin-top: 28px;
        }

        .notes-copy {
          margin-top: 14px;
          color: #343a42;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 13px;
          line-height: 1.8;
          overflow-wrap: anywhere;
          white-space: pre-wrap;
        }

        .book-masthead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          min-height: 40px;
          margin-bottom: 22px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(120, 110, 91, 0.28);
        }

        .brand-lockup {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
        }

        /* .brand-mark removed (no longer needed for TM logo) */

        .brand-name {
          color: #10243e;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.17em;
        }

        .masthead-label {
          color: #777064;
          font-size: 8px;
          letter-spacing: 0.15em;
          text-align: right;
        }

        .trade-heading {
          display: block;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(120, 110, 91, 0.28);
        }

        .trade-date {
          color: #10243e;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(22px, 2.2vw, 31px);
          font-weight: 700;
          letter-spacing: 0.045em;
          line-height: 1.2;
        }

        .trade-symbol {
          margin-top: 13px;
          color: #10243e;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.13em;
        }

        .trade-badge {
          display: inline-block;
          margin-top: 12px;
          border: 1px solid #d4cec2;
          border-radius: 999px;
          padding: 5px 9px;
          color: #777064;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* Screenshot uses whatever space remains below the P&L. */
        .left-screenshot-section {
          display: flex;
          flex: 1 1 0;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
          margin-top: 12px;
          padding-bottom: 2px;
        }

        .left-screenshot-frame {
          display: flex;
          flex: 1;
          align-items: center;
          justify-content: center;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
        }

        .left-trade-screenshot {
          display: block;
          width: 100%;
          height: 100%;
          min-width: 0;
          min-height: 0;
          object-fit: contain;
          object-position: center;
          border: 1px solid rgba(27, 43, 58, 0.3);
          border-radius: 7px;
          box-shadow: 0 5px 14px rgba(38, 32, 23, 0.12);
        }

        /* Keep the reflection on the right page, without scrolling. */
        .review-content {
          flex: 1;
          min-height: 0;
          overflow: auto;
          padding-right: 3px;
        }

        @media (min-width: 768px) {
          .review-content {
            overflow: hidden;
          }
          .detail-row {
            padding: 9px 0;
          }
          .reflection-section {
            margin-top: 24px;
          }
          .notes-copy {
            font-size: 12px;
            line-height: 1.7;
          }
        }

        .empty-state {
          display: flex;
          min-height: 0;
          height: 100%;
          flex-direction: column;
          justify-content: center;
          overflow-wrap: anywhere;
        }

        .loading-line {
          height: 8px;
          max-width: 100%;
          border-radius: 999px;
          background: rgba(120, 110, 91, 0.15);
          animation: pulse 1.5s ease-in-out infinite;
        }

        .action-button {
          width: fit-content;
          border: 1px solid #d4cec2;
          border-radius: 999px;
          padding: 9px 15px;
          color: #575248;
          font-size: 12px;
          transition: background 150ms ease;
        }

        .action-button:hover {
          background: white;
        }

        .dark-button {
          border-color: #292825;
          background: #292825;
          color: white;
        }

        .dark-button:hover {
          background: #48453f;
        }


        /* --- Page Corner Navigation - FOLDED CORNER STYLE --- */
        .page-corner-navigation {
          position: absolute;
          z-index: 10;
          right: 0;
          bottom: 0;
          left: 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          pointer-events: none;
        }

        .page-corner {
          position: relative;
          display: grid;
          width: 48px;
          height: 48px;
          place-items: center;
          padding: 0;
          border: 0;
          border-radius: 0;
          background: transparent;
          color: #10243e;
          cursor: pointer;
          pointer-events: auto;
          isolation: isolate;
        }

        .page-corner::before {
          position: absolute;
          z-index: -1;
          inset: 0;
          content: "";
          background: linear-gradient(
            135deg,
            #d8d0c1 0%,
            #faf7ef 44%,
            #e9e1d3 100%
          );
          box-shadow:
            -2px -2px 4px rgba(71, 57, 39, 0.12),
            inset 1px 1px 2px rgba(255, 255, 255, 0.8);
          opacity: 0;
          transition: opacity 160ms ease;
        }

        .page-corner-previous::before {
          clip-path: polygon(0 0, 100% 100%, 0 100%);
        }

        .page-corner-next::before {
          clip-path: polygon(100% 0, 100% 100%, 0 100%);
        }

        .page-corner span {
          position: absolute;
          bottom: 5px;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 26px;
          line-height: 1;
          opacity: 0.82;
          transition:
            transform 160ms ease,
            opacity 160ms ease;
        }

        .page-corner-previous span {
          left: 8px;
        }

        .page-corner-next span {
          right: 8px;
        }

        .page-corner:hover::before,
        .page-corner:focus-visible::before {
          opacity: 1;
        }

        .page-corner:hover span {
          opacity: 1;
          transform: translateY(-2px);
        }

        .page-corner:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: -3px;
        }

        @media (max-width: 767px) {
          .page-corner {
            width: 40px;
            height: 40px;
          }
        }

        /* --- End Folded Corners --- */

        .journal-count {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          margin-top: 16px;
          text-align: center;
        }

        .journal-count-number {
          color: rgba(255, 255, 255, 0.8);
          font-size: 13px;
          font-variant-numeric: tabular-nums;
        }

        .journal-count-label {
          color: rgba(255, 255, 255, 0.35);
          font-size: 9px;
          letter-spacing: 0.2em;
        }

        .share-actions {
          display: flex;
          justify-content: center;
          margin-top: 14px;
          padding-bottom: 12px;
        }

        .share-button-primary {
          min-height: 42px;
          padding: 0 22px;
          border: 1px solid #fff;
          border-radius: 999px;
          background: #fff;
          color: #111;
          font-size: 12px;
          font-weight: 600;
        }

        .export-error {
          margin-top: 8px;
          color: #fca5a5;
          font-size: 12px;
          text-align: center;
        }

        /* Share Preview Styles */
        .share-preview-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          background: #0b0b0c;
          color: #f5f5f5;
        }

        .share-preview-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          min-height: 68px;
          padding: 12px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(16, 16, 17, 0.96);
        }

        .share-preview-heading {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .share-preview-title {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .share-preview-subtitle {
          color: rgba(255, 255, 255, 0.5);
          font-size: 11px;
        }

        .share-preview-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .preview-icon-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          color: #f5f5f5;
          cursor: pointer;
          transition: background 150ms ease;
        }

        .preview-icon-button:hover {
          background: rgba(255, 255, 255, 0.13);
        }

        .share-preview-canvas {
          display: flex;
          flex: 1;
          align-items: center;
          justify-content: center;
          min-height: 0;
          padding: 24px;
          overflow: auto;
        }

        .share-preview-image {
          display: block;
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 4px;
          box-shadow: 0 20px 80px rgba(0, 0, 0, 0.45);
        }

        @media (max-width: 640px) {
          .share-actions {
            gap: 8px;
          }

          .share-button-primary {
            min-height: 38px;
            padding: 0 12px;
            font-size: 11px;
          }
          .share-preview-toolbar {
            min-height: 60px;
            padding: 10px 14px;
          }

          .share-preview-canvas {
            padding: 12px;
          }

          .preview-icon-button {
            width: 38px;
            height: 38px;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.45;
          }
          50% {
            opacity: 1;
          }
        }

        @media (min-width: 768px) {
          .book-spread {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          }

          .book-page {
            padding: 30px 32px 19px;
          }

          .book-left {
            box-shadow: inset -17px 0 22px -19px rgba(54, 39, 24, 0.75);
          }

          .book-right {
            border-left: 1px solid rgba(107, 87, 62, 0.25);
            box-shadow: inset 17px 0 22px -19px rgba(54, 39, 24, 0.75);
          }

          .book-spread::after {
            position: absolute;
            z-index: 2;
            top: 0;
            bottom: 0;
            left: 50%;
            width: 19px;
            content: "";
            pointer-events: none;
            transform: translateX(-50%);
            background: linear-gradient(
              to right,
              rgba(66, 48, 28, 0.13),
              rgba(66, 48, 28, 0.035) 30%,
              rgba(255, 255, 255, 0.42) 50%,
              rgba(66, 48, 28, 0.035) 70%,
              rgba(66, 48, 28, 0.13)
            );
          }
        }

        @media (min-width: 1100px) {
          .book-page {
            padding-right: 36px;
            padding-left: 36px;
          }
        }

        @media (max-height: 720px) and (min-width: 768px) {
          .journal-stage {
            padding-top: 7px;
            padding-bottom: 7px;
          }

          .book-shell {
            padding: 10px 10px 13px;
          }

          .book-spread {
            height: calc(100svh - 205px);
            min-height: 360px;
          }

          .book-page {
            padding-top: 16px;
            padding-bottom: 12px;
          }

          .detail-grid {
            /* still block */
          }

          .detail-row {
            padding: 8px 0;
          }

          .reflection-section {
            margin-top: 18px;
          }

          .notes-copy {
            font-size: 11px;
            line-height: 1.5;
          }

          .page-footer {
            margin-top: 6px;
            padding-top: 6px;
          }
        }

        /* Book Details - STRONGER MOCKUP COLUMNS */
        .book-detail-list {
          width: 100%;
          margin-top: 9px;
        }

        .book-detail-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 0.85fr);
          align-items: center;
          column-gap: 20px;
          width: 100%;
          min-height: 43px;
          border-bottom: 1px solid rgba(93, 77, 56, 0.2);
          padding: 8px 0;
        }

        .book-detail-label {
          display: block;
          color: #26364a;
          font-size: 13px;
          line-height: 1.4;
          white-space: normal;
        }

        .book-detail-value {
          display: block;
          min-width: 0;
          color: #10243e;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.4;
          text-align: left;
          overflow-wrap: anywhere;
        }

        .book-value-positive {
          color: #00805f;
          font-weight: 600;
        }

        .book-value-negative {
          color: #b33d3d;
          font-weight: 600;
        }

        .book-page-footer {
          position: relative;
          min-height: 24px;
        }

        .book-footer-symbol {
          position: absolute;
          left: 50%;
          color: #969084;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
          transform: translateX(-50%);
        }

        @media (min-width: 768px) {
          .book-page {
            padding: 28px 30px 18px;
          }

          .trade-date-section {
            margin-top: 26px;
          }

          .chart-section {
            margin-top: 18px;
          }

          .setup-section {
            margin-top: 20px;
          }

          .book-details-section {
            margin-top: 30px;
          }

          .book-detail-row {
            min-height: 43px;
          }

          .reflection-section {
            margin-top: 31px;
          }
        }

        @media (max-width: 767px) {
          .book-date {
            font-size: 24px;
          }

          .book-masthead {
            gap: 6px;
          }

          .brand-name {
            font-size: 9px;
          }

          .masthead-label,
          .masthead-tagline {
            font-size: 7px;
          }

          .chart-section {
            flex: none;
            min-height: 220px;
          }

          .book-chart-frame {
            min-height: 190px;
          }

          .setup-copy {
            -webkit-line-clamp: 5;
          }

          .book-detail-row {
            min-height: 43px;
          }

          .reflection-copy {
            -webkit-line-clamp: 6;
          }
        }

        /* Keep the page footer in its own space. */
        .book-page {
          min-height: 0;
        }

        .trade-page-content {
          flex: 1 1 0;
          min-height: 0;
        }

        .page-footer {
          flex-shrink: 0;
          position: relative;
          z-index: 2;
          margin-top: 8px;
          padding-top: 8px;
        }

        /* ===== Targeted journal layout repair ===== */

        /* LEFT PAGE: reserve space for the footer and setup. */
        .book-left {
          min-height: 0;
        }

        .book-left > .page-content {
          display: flex;
          flex: 1 1 0;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        .book-left .trade-page-content {
          display: flex;
          flex: 1 1 0;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        /* Let the chart shrink before it pushes into the setup/footer. */
        .book-left .left-screenshot-section {
          flex: 1 1 0;
          min-height: 0;
          overflow: hidden;
        }

        .book-left .left-screenshot-frame {
          flex: 1 1 0;
          min-height: 0;
          overflow: hidden;
        }

        .book-left .left-trade-screenshot {
          display: block;
          width: 100%;
          height: 100%;
          min-height: 0;
          object-fit: contain;
        }

        /* Setup stays together and never grows over the footer. */
        .book-left .setup-section {
          flex: 0 0 auto;
          min-height: 0;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid rgba(120, 110, 91, 0.28);
        }

        .book-left .setup-copy {
          margin-top: 6px;
          line-height: 1.45;
          overflow-wrap: anywhere;
        }

        /* Footer stays at the bottom, separated from the content. */
        .book-left > .page-footer {
          position: relative;
          flex: 0 0 auto;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(120, 110, 91, 0.24);
        }

        /* RIGHT PAGE: separate every detail into a readable row. */
        .book-right .detail-grid {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-top: 12px;
        }

        /* These selectors match the Detail component with detail-row spans. */
        .book-right .detail-row,
        .book-right .detail-row.detail-row--with-line {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);
          align-items: center;
          gap: 16px;
          width: 100%;
          min-width: 0;
          padding: 10px 0;
          border-bottom: 1px solid rgba(130, 110, 91, 0.13); /* Subtle horizontal line */
        }
        .book-right .detail-row:last-child,
        .book-right .detail-row.detail-row--with-line:last-child {
          border-bottom: none;
        }

        .book-right .detail-label {
          min-width: 0;
          color: #343a42;
          text-align: left;
          overflow-wrap: anywhere;
          font-family: Georgia, "Times New Roman", serif;
        }
        .book-right .detail-label .colon {
          margin-left: 2px;
          margin-right: 6px;
          color: #7c776d;
        }

        .book-right .detail-value {
          min-width: 0;
          color: #10243e;
          text-align: right;
          overflow-wrap: anywhere;
        }

        .book-right .detail-value-accent {
          color: #00805f;
        }

        /* Ensure very subtle, light line separator for rows */
        .book-right .detail-row,
        .book-right .detail-row.detail-row--with-line {
          border-bottom: 1px solid rgba(102, 92, 73, 0.11);
        }
        .book-right .detail-row:last-child,
        .book-right .detail-row.detail-row--with-line:last-child {
          border-bottom: none;
        }
      `}</style>
    </main>
  );
}