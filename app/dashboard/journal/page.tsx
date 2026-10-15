
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

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="min-w-0 border-b border-stone-300/80 py-2">
      <p className="eyebrow">{label}</p>
      <p className="mt-1 truncate text-[13px] font-medium text-stone-800">
        {value == null || value === "" ? "—" : value}
      </p>
    </div>
  );
}

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
                        <header className="trade-heading">
                          <div className="min-w-0">
                            <p className="eyebrow">
                              {isDemo ? "Sample entry" : "Trade journal"}
                            </p>
                            <h1 className="trade-symbol">
                              {currentTrade.symbol || "Trade"}
                            </h1>
                            <p className="mt-1 text-xs text-stone-500">
                              {dateLabel(currentTrade.trade_date)}
                            </p>
                          </div>

                          <span className="trade-badge">
                            {isDemo
                              ? "Preview"
                              : currentTrade.result || "Recorded"}
                          </span>
                        </header>

                        {/* Only the essential trade details remain. */}
                        <div className="detail-grid trade-details">
                          <Detail
                            label="Direction"
                            value={currentTrade.direction}
                          />
                          <Detail
                            label="Contracts"
                            value={number(currentTrade.quantity)}
                          />
                        </div>

                        {/* P&L now sits directly below the two details. */}
                        <div className="pnl-panel">
                          <div>
                            <p className="eyebrow">Realized P&amp;L</p>
                            <p
                              className={`pnl-value ${
                                Number(currentTrade.pnl ?? 0) > 0
                                  ? "text-emerald-700"
                                  : Number(currentTrade.pnl ?? 0) < 0
                                    ? "text-rose-700"
                                    : "text-stone-800"
                              }`}
                            >
                              {money(currentTrade.pnl)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="eyebrow">R-multiple</p>
                            <p className="mt-2 text-lg font-semibold text-stone-700">
                              {currentTrade.r_multiple == null
                                ? "—"
                                : `${number(currentTrade.r_multiple)}R`}
                            </p>
                          </div>
                        </div>

                        {currentTrade.screenshot_url && (
                          <div className="left-screenshot-section">
                            <p className="eyebrow mb-2">Chart screenshot</p>
                            <div className="left-screenshot-frame">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={currentTrade.screenshot_url}
                                alt="Trade chart screenshot"
                                className="left-trade-screenshot"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <footer className="page-footer">
                        <span>TRADEMIRROR</span>
                        <span>
                          {String(activeIndex * 2 + 1).padStart(2, "0")}
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
                        <header className="review-heading">
                          <p className="eyebrow">Review &amp; reflection</p>
                          <h2 className="mt-1 text-3xl font-semibold tracking-tight">
                            The details.
                          </h2>
                        </header>

                        {/* Session, market condition, and grade removed. */}
                        <div className="detail-grid review-grid">
                          <Detail
                            label="Setup"
                            value={currentTrade.setup}
                          />
                          <Detail
                            label="Emotion"
                            value={currentTrade.emotion}
                          />
                          <Detail
                            label="Execution"
                            value={currentTrade.execution_rating}
                          />
                          <Detail
                            label="Followed plan"
                            value={
                              currentTrade.followed_plan == null
                                ? "—"
                                : currentTrade.followed_plan
                                  ? "Yes"
                                  : "No"
                            }
                          />
                        </div>

                        <div className="notes-section">
                          <p className="eyebrow">Notes &amp; reflection</p>
                          <p
                            className="notes-copy"
                            title={currentTrade.notes || undefined}
                          >
                            {currentTrade.notes ||
                              "No notes recorded for this trade."}
                          </p>
                        </div>
                      </div>

                      <footer className="page-footer">
                        <span>
                          {isDemo ? "SAMPLE ENTRY" : "TRADING REFLECTION"}
                        </span>
                        <span>
                          {String(activeIndex * 2 + 2).padStart(2, "0")}
                        </span>
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
          </div>

          {/* BOOK NAVIGATION */}
          {currentTrade && !loading && !error && (
            <nav className="book-navigation" aria-label="Trade navigation">
              <button
                onClick={() => goToTrade(activeIndex - 1)}
                disabled={journalTrades.length < 2}
                aria-label="Previous trade"
                className="nav-button"
              >
                <span aria-hidden="true">←</span>
                Previous
              </button>

              <div className="text-center">
                <p className="text-xs font-medium tabular-nums text-white/75">
                  {activeIndex + 1} of {journalTrades.length}
                </p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/35">
                  {isDemo ? "Sample entry" : "Journal entries"}
                </p>
              </div>

              <button
                onClick={() => goToTrade(activeIndex + 1)}
                disabled={journalTrades.length < 2}
                aria-label="Next trade"
                className="nav-button"
              >
                Next
                <span aria-hidden="true">→</span>
              </button>
            </nav>
          )}

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

          {!loading && !error && (
            <div className="example-control">
              <button onClick={toggleExample}>
                {showExample ? "Hide sample entry" : "View sample entry"}
              </button>
            </div>
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
          width: 100%;
          height: calc(100svh - 4rem);
          min-height: 0;
          overflow: hidden;
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
          height: 100%;
          padding: 12px 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .journal-layout {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .book-shell {
          width: 100%;
          margin: 0 auto;
          padding: 15px 15px 18px;
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 10px 15px 15px 10px;
          background: linear-gradient(
            105deg,
            #101011 0%,
            #282829 8%,
            #111112 19%,
            #09090a 100%
          );
          box-shadow:
            0 25px 65px rgba(0, 0, 0, 0.45),
            inset 2px 0 4px rgba(255, 255, 255, 0.08),
            inset -2px 0 4px rgba(0, 0, 0, 0.8);
        }

        .book-pages {
          background: #d0ccc3;
          border-radius: 3px;
          box-shadow:
            2px 4px 0 #a9a59d,
            4px 7px 0 #88857e,
            6px 10px 0 #5d5a55,
            8px 13px 0 #252526,
            10px 16px 22px rgba(0, 0, 0, 0.4);
        }

        .book-spread {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          height: clamp(390px, calc(100svh - 250px), 620px);
          overflow: hidden;
          border-radius: 3px;
          background: #f4f1e9;
          box-shadow:
            0 0 0 1px rgba(64, 56, 44, 0.35),
            inset 0 0 12px rgba(78, 65, 47, 0.08);
        }

        .book-page {
          position: relative;
          display: flex;
          min-width: 0;
          min-height: 0;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          padding: 25px 25px 16px;
          color: #292825;
          background-color: #f8f6f0;
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent 31px,
            rgba(120, 110, 91, 0.045) 32px
          );
        }

        .book-left {
          background-color: #faf8f2;
          box-shadow: inset -13px 0 18px -17px rgba(48, 39, 28, 0.65);
        }

        .book-right {
          background-color: #f3f0e8;
          box-shadow: inset 13px 0 18px -17px rgba(48, 39, 28, 0.65);
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

        /* Screenshot uses whatever space remains below the P&L. */
        .left-screenshot-section {
          display: flex;
          flex: 1;
          flex-direction: column;
          min-height: 0;
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
          border: 1px solid #d6d0c5;
          border-radius: 6px;
        }

        /* Keep the reflection on the right page, without scrolling. */
        .review-content {
          flex: 1;
          min-height: 0;
          overflow: hidden;
          padding-right: 2px;
        }

        .notes-section {
          min-height: 0;
          margin-top: 10px;
        }

        .notes-copy {
          display: -webkit-box;
          overflow: hidden;
          overflow-wrap: anywhere;
          white-space: pre-wrap;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 10;
          margin-top: 6px;
          color: #6b665d;
          font-size: 11px;
          line-height: 1.5;
        }

        .trade-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px solid rgba(120, 110, 91, 0.3);
          padding-bottom: 15px;
        }

        .trade-symbol {
          margin-top: 7px;
          font-size: clamp(36px, 3.4vw, 52px);
          line-height: 1;
          font-weight: 650;
          letter-spacing: -0.055em;
        }

        .trade-badge {
          flex-shrink: 0;
          margin-top: 3px;
          border: 1px solid #d4cec2;
          border-radius: 999px;
          padding: 6px 10px;
          color: #777064;
          font-size: 9px;
          font-weight: 650;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .eyebrow {
          color: #a29b8e;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.19em;
          text-transform: uppercase;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          column-gap: 24px;
        }

        .trade-details {
          margin-top: 4px;
          column-gap: 24px;
        }

        .trade-details > div {
          padding-top: 8px;
          padding-bottom: 8px;
        }

        .pnl-panel {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 12px;
          border-top: 1px solid rgba(120, 110, 91, 0.28);
          border-bottom: 1px solid rgba(120, 110, 91, 0.28);
          padding: 13px 0;
        }

        .pnl-value {
          margin-top: 6px;
          font-size: clamp(28px, 2.8vw, 40px);
          line-height: 1.1;
          font-weight: 650;
          letter-spacing: -0.045em;
          font-variant-numeric: tabular-nums;
        }

        .review-heading {
          border-bottom: 1px solid rgba(120, 110, 91, 0.28);
          padding-bottom: 10px;
        }

        .review-grid {
          column-gap: 22px;
        }

        .review-grid > div {
          padding-top: 6px;
          padding-bottom: 6px;
        }

        /* Remove or override any legacy or now-unused screenshot-section/trade-screenshot rules if needed; we'll leave them for simplicity in case others use them elsewhere. */

        .page-footer {
          position: relative;
          z-index: 1;
          display: flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 8px;
          border-top: 1px solid rgba(120, 110, 91, 0.24);
          padding-top: 8px;
          color: #a29b8e;
          font-size: 9px;
          letter-spacing: 0.16em;
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

        .book-navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 14px;
        }

        .nav-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 36px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 999px;
          padding: 7px 16px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
          transition:
            background 150ms ease,
            border-color 150ms ease;
        }

        .nav-button:hover:not(:disabled) {
          border-color: rgba(255, 255, 255, 0.32);
          background: rgba(255, 255, 255, 0.06);
        }

        .nav-button:disabled {
          cursor: not-allowed;
          opacity: 0.25;
        }

        .example-control {
          margin-top: 8px;
          text-align: center;
        }

        .example-control button {
          color: rgba(255, 255, 255, 0.38);
          font-size: 10px;
          transition: color 150ms ease;
        }

        .example-control button:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .share-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
        }

        .share-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 38px;
          padding: 0 16px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.9);
          font-size: 12px;
          font-weight: 500;
          transition: background 150ms ease, opacity 150ms ease;
        }

        .share-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.12);
        }

        .share-button-primary {
          border-color: #fff;
          background: #fff;
          color: #111;
        }

        .share-button-primary:hover:not(:disabled) {
          background: #e7e7e7;
        }

        .share-button:disabled {
          cursor: not-allowed;
          opacity: 0.45;
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

          .share-button {
            min-height: 36px;
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
            padding: 25px 28px 16px;
          }

          .book-left {
            box-shadow: inset -13px 0 18px -17px rgba(48, 39, 28, 0.65);
          }

          .book-right {
            border-left: 1px solid rgba(120, 110, 91, 0.32);
            box-shadow: inset 13px 0 18px -17px rgba(48, 39, 28, 0.65);
          }

          .book-spread::after {
            position: absolute;
            z-index: 2;
            top: 0;
            bottom: 0;
            left: 50%;
            width: 15px;
            content: "";
            pointer-events: none;
            transform: translateX(-50%);
            background: linear-gradient(
              to right,
              rgba(64, 56, 44, 0.1),
              rgba(64, 56, 44, 0.025) 30%,
              rgba(255, 255, 255, 0.35) 50%,
              rgba(64, 56, 44, 0.04) 70%,
              rgba(64, 56, 44, 0.11)
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
            column-gap: 16px;
          }

          .detail-grid > div {
            padding-top: 5px;
            padding-bottom: 5px;
          }

          .pnl-panel {
            margin-top: 8px;
            padding: 9px 0;
          }

          .review-heading {
            padding-bottom: 8px;
          }

          .notes-section {
            margin-top: 7px;
          }

          .notes-copy {
            -webkit-line-clamp: 3;
          }

          .trade-screenshot {
            max-height: 135px;
          }

          .page-footer {
            margin-top: 6px;
            padding-top: 6px;
          }

          .example-control {
            margin-top: 3px;
          }

          /* Adjustments for short screens */
          .left-screenshot-section {
            margin-top: 8px;
          }
          .left-trade-screenshot {
            border-radius: 4px;
          }
        }

        @media (max-width: 767px) {
          .journal-background {
            height: auto;
            min-height: calc(100svh - 4rem);
            overflow: visible;
          }

          .journal-stage {
            height: auto;
            min-height: calc(100svh - 4rem);
            padding: 20px 12px 28px;
          }

          .book-shell {
            padding: 9px 8px 12px;
          }

          .book-spread {
            height: auto;
            overflow: visible;
          }

          .book-page {
            min-height: 390px;
            padding: 23px 20px 16px;
          }

          .book-right {
            border-top: 1px solid rgba(120, 110, 91, 0.32);
          }

          .review-content {
            overflow: visible;
          }

          .notes-copy {
            -webkit-line-clamp: 6;
          }

          .trade-screenshot {
            max-height: 260px;
          }

          .book-navigation {
            gap: 8px;
          }

          .nav-button {
            gap: 6px;
            padding-right: 12px;
            padding-left: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .loading-line {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
