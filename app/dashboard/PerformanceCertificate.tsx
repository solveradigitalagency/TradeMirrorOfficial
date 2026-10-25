
"use client";

import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { X, Download, Share2, TrendingUp, BarChart3 } from "lucide-react";

type Trade = {
  id: string;
  trade_date: string;
  pnl: number;
  result: "Win" | "Loss" | "Breakeven" | null;
};

type Props = {
  trades: Trade[];
  displayName: string;
  month: Date;
  onClose: () => void;
  avatarUrl?: string;
};

export default function PerformanceCertificate({
  trades,
  displayName,
  month,
  onClose,
  avatarUrl,
}: Props) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const stats = useMemo(() => {
    const monthlyTrades = trades.filter((trade) => {
      const [year, monthNumber] = trade.trade_date
        .slice(0, 10)
        .split("-")
        .map(Number);

      return (
        year === month.getFullYear() &&
        monthNumber === month.getMonth() + 1
      );
    });

    const pnl = monthlyTrades.reduce(
      (sum, trade) => sum + Number(trade.pnl || 0),
      0
    );

    const completed = monthlyTrades.filter(
      (trade) => trade.result === "Win" || trade.result === "Loss"
    );

    const wins = completed.filter(
      (trade) => trade.result === "Win"
    ).length;

    return {
      pnl,
      trades: monthlyTrades.length,
      winRate: completed.length
        ? (wins / completed.length) * 100
        : 0,
    };
  }, [trades, month]);

  const monthLabel = month.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  }).toUpperCase();

  const startLabel = new Date(
    month.getFullYear(), month.getMonth(), 1
  ).toLocaleDateString("en-US", {
    month: "short", day: "2-digit",
  }).toUpperCase();

  const endLabel = new Date(
    month.getFullYear(), month.getMonth() + 1, 0
  ).toLocaleDateString("en-US", {
    month: "short", day: "2-digit",
  }).toUpperCase();

  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Math.abs(stats.pnl));

  const name = displayName?.trim() || "Trader";
  const fileName = `TradeMirror-${monthLabel.replace(/\s+/g, "-")}.png`;

  async function createPng() {
    const element = certificateRef.current;
    if (!element) throw new Error("Certificate unavailable.");

    await document.fonts.ready;

    await Promise.all(
      Array.from(element.querySelectorAll("img")).map(async (img) => {
        if (!img.complete) {
          await new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          });
        }

        if (img.complete && img.naturalWidth > 0) {
          try {
            await img.decode();
          } catch {
            // Continue if the browser has already decoded the image.
          }
        }
      })
    );

    return toPng(element, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: "#080808",
    });
  }

  async function downloadPng() {
    setBusy(true);
    setMessage("");

    try {
      const dataUrl = await createPng();
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      setMessage("Certificate downloaded.");
    } catch (error) {
      console.error(error);
      setMessage("Unable to generate the PNG. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function sharePng() {
    setBusy(true);
    setMessage("");

    try {
      const dataUrl = await createPng();
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], fileName, {
        type: "image/png",
      });

      if (
        navigator.share &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({
          title: `${monthLabel} — TradeMirror`,
          text: `${name}'s monthly trading performance.`,
          files: [file],
        });
      } else {
        const link = document.createElement("a");
        link.download = fileName;
        link.href = dataUrl;
        link.click();
        setMessage("Sharing is unavailable here. PNG downloaded instead.");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setMessage("");
      } else {
        console.error(error);
        setMessage("Unable to share the certificate.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/95 p-2 sm:p-3 backdrop-blur-md">
      <div className="my-auto w-full max-w-[900px]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white sm:text-lg">
              Performance Certificate
            </h2>
            <p className="mt-1 text-xs text-white/45 sm:text-sm">
              Preview and share your monthly results
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close certificate"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/65 hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <div
          ref={certificateRef}
          id="performance-certificate"
          className="tm-certificate relative isolate w-full overflow-hidden"
          style={{
            aspectRatio: "3 / 2",
            containerType: "inline-size",
            background:
              "radial-gradient(ellipse at 50% 45%, #111111 0%, #090909 48%, #050505 100%)",
            color: "#f1f1f1",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          <style>{`
            .tm-certificate * { box-sizing: border-box; }

            .tm-label {
              color: #969696;
              font-size: .76cqw;
              letter-spacing: .29em;
              line-height: 1.7;
            }

            .tm-certificate .tm-frame {
              position: absolute;
              inset: 2.7% 3.2%;
              border: 1px solid rgba(190, 190, 190, 0.34);
              border-radius: 0;
              clip-path: polygon(
                2.2% 0,
                97.8% 0,
                100% 3.2%,
                100% 96.8%,
                97.8% 100%,
                2.2% 100%,
                0 96.8%,
                0 3.2%
              );
              pointer-events: none;
            }

            .tm-certificate .tm-frame-inner {
              position: absolute;
              inset: 3.5% 3.9%;
              border: 1px solid rgba(160, 160, 160, 0.20);
              border-radius: 0;
              clip-path: polygon(
                2% 0,
                98% 0,
                100% 3%,
                100% 97%,
                98% 100%,
                2% 100%,
                0 97%,
                0 3%
              );
              pointer-events: none;
            }

            .tm-corner {
              position: absolute;
              border-style: solid;
              pointer-events: none;
            }

            .tm-corner-accent {
              position: absolute;
              width: 3.2%;
              height: 3.2%;
              border-color: #555555;
              border-style: solid;
              pointer-events: none;
            }

            .tm-metric {
              position: absolute;
              top: 61.2%;
              width: 22.5%;
              height: 13.8%;
              border: 1px solid #383838;
              border-radius: 1.1cqw;
              background: linear-gradient(140deg, #151515, #090909);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }

            .tm-script {
              font-family: "Snell Roundhand", "Apple Chancery",
                "Segoe Script", "Brush Script MT", cursive;
              font-size: 2.15cqw;
              font-style: italic;
              font-weight: 500;
              line-height: 1.1;
              letter-spacing: -.055em;
              color: #dedede;
              white-space: nowrap;
              transform: rotate(-8deg);
            }

            .tm-side-copy {
              position: absolute;
              top: 41.5%;
              width: 9%;
              font-size: .83cqw;
              line-height: 2.05;
              letter-spacing: .27em;
              color: #999999;
            }

            /* Make the founder label bigger, but not bold */
            .tm-founder-label {
              font-size: .8cqw !important;
              font-weight: 400;
              font-family: inherit;
              letter-spacing: .13em;
              color: #e5e5e5;
            }
          `}</style>

          {/* Layered charcoal and silver frame */}
          <div className="tm-frame" />
          <div className="tm-frame-inner" />

          {/* Angular metallic corner accents */}
          <div
            className="tm-corner"
            style={{
              top: "2.7%",
              left: "3.2%",
              width: "4.1%",
              height: "4.1%",
              borderWidth: "2px 0 0 2px",
              borderColor: "rgba(205,205,205,.65)",
            }}
          />

          <div
            className="tm-corner"
            style={{
              top: "2.7%",
              right: "3.2%",
              width: "4.1%",
              height: "4.1%",
              borderWidth: "2px 2px 0 0",
              borderColor: "rgba(205,205,205,.65)",
            }}
          />

          <div
            className="tm-corner"
            style={{
              bottom: "2.7%",
              left: "3.2%",
              width: "4.1%",
              height: "4.1%",
              borderWidth: "0 0 2px 2px",
              borderColor: "rgba(205,205,205,.65)",
            }}
          />

          <div
            className="tm-corner"
            style={{
              bottom: "2.7%",
              right: "3.2%",
              width: "4.1%",
              height: "4.1%",
              borderWidth: "0 2px 2px 0",
              borderColor: "rgba(205,205,205,.65)",
            }}
          />

          <div className="tm-corner-accent" style={{
            top: "3.2%", left: "3.2%",
            borderWidth: "2px 0 0 2px",
          }} />
          <div className="tm-corner-accent" style={{
            top: "3.2%", right: "3.2%",
            borderWidth: "2px 2px 0 0",
          }} />
          <div className="tm-corner-accent" style={{
            bottom: "3.2%", left: "3.2%",
            borderWidth: "0 0 2px 2px",
          }} />
          <div className="tm-corner-accent" style={{
            bottom: "3.2%", right: "3.2%",
            borderWidth: "0 2px 2px 0",
          }} />

          {/* Official logo: original brand colors preserved */}
          <div
            className="absolute"
            style={{ left: "8.1%", top: "4.0%", width: "22%" }}
            // The "top" was previously "5.2%"; moved higher by -1.2% to "4.0%".
          >
            <img
              src="/logo/trade-mirror-logo.png"
              alt="TradeMirror"
              crossOrigin="anonymous"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>

          <div
            className="tm-label absolute"
            style={{
              right: "8.1%", top: "7.1%",
              fontSize: ".7cqw",
            }}
          >
            DISCIPLINE / DATA / CONSISTENCY
          </div>

          <div className="absolute" style={{
            left: "8.2%", right: "8.2%", top: "14.2%",
            height: 1, background: "#292929",
          }} />

          {/* Title block */}
          <div className="absolute text-center" style={{
            top: "16.1%", left: "15%", width: "70%",
          }}>
            <div className="tm-label" style={{
              color: "#c5c5c5",
              fontSize: "1.0cqw",
              letterSpacing: ".34em",
            }}>
              TRADING PERFORMANCE DIVISION
            </div>

            <div style={{
              marginTop: ".85cqw",
              fontSize: "3.0cqw",
              lineHeight: 1.12,
              fontWeight: 600,
              letterSpacing: ".12em",
              whiteSpace: "nowrap",
              color: "#e8e8e8",
            }}>
              MONTHLY PERFORMANCE
            </div>

            <div style={{
              marginTop: ".45cqw",
              fontSize: "2.0cqw",
              fontWeight: 500,
              letterSpacing: ".43em",
              color: "#bdbdbd",
            }}>
              CERTIFICATE
            </div>

            <div className="tm-label" style={{
              marginTop: ".9cqw",
              fontSize: ".82cqw",
            }}>
              THIS CERTIFIES YOUR TRADING PERFORMANCE FOR
            </div>
          </div>

          {/* Month badge: separate from P&L label */}
          <div className="absolute flex items-center justify-center" style={{
            top: "35.3%",
            left: "38%",
            width: "24%",
            height: "3.8%",
            border: "1px solid #414141",
            background: "#0b0b0b",
            clipPath: "polygon(2% 0,98% 0,100% 15%,100% 85%,98% 100%,2% 100%,0 85%,0 15%)",
            color: "#d4d4d4",
            fontSize: "1.0cqw",
            letterSpacing: ".4em",
            whiteSpace: "nowrap",
          }}>
            {monthLabel}
          </div>

          {/* Side copy */}
          <div className="tm-side-copy" style={{ left: "8.2%" }}>
            BETTER<br />TRADES<br />BUILT<br />DIFFERENT
            <div style={{
              width: "3.2cqw", height: 1,
              background: "#bdbdbd", marginTop: "1.6cqw",
            }} />
          </div>

          <div className="tm-side-copy" style={{ right: "7.6%" }}>
            PROVEN<br />PERFORMANCE.<br />CONSISTENT<br />PROGRESS.
            <div style={{
              width: "3.2cqw", height: 1,
              background: "#bdbdbd", marginTop: "1.6cqw",
            }} />
          </div>

          {/* P&L panel */}
          <div className="absolute flex flex-col items-center justify-center" style={{
            left: "25.8%",
            top: "39.7%",
            width: "48.4%",
            height: "18.3%",
            border: "1px solid #555555",
            borderRadius: "1.1cqw",
            background: "radial-gradient(ellipse at center, #151515, #090909 78%)",
            boxShadow: "inset 0 0 25px rgba(255,255,255,.018)",
          }}>
            <div className="tm-label" style={{
              fontSize: ".92cqw",
              color: "#bcbcbc",
            }}>
              NET PROFIT &amp; LOSS
            </div>

            <div style={{
              marginTop: ".55cqw",
              fontSize: "5.0cqw",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-.035em",
              whiteSpace: "nowrap",
              color:
                stats.pnl > 0
                  ? "#25d69a"
                  : stats.pnl < 0
                  ? "#ff5b65"
                  : "#eeeeee",
              fontVariantNumeric: "tabular-nums",
            }}>
              {stats.pnl > 0 ? "+" : stats.pnl < 0 ? "−" : ""}
              {money}
            </div>

            <div className="tm-label" style={{
              marginTop: ".55cqw",
              fontSize: ".86cqw",
            }}>
              TOTAL P&amp;L FOR THE MONTH
            </div>
          </div>

          {/* Monthly metrics */}
          <div className="tm-metric" style={{ left: "26.5%" }}>
            <TrendingUp style={{
              width: "1.7cqw", height: "1.7cqw",
              color: "#a6a6a6", marginBottom: ".35cqw",
            }} />
            <div className="tm-label" style={{ fontSize: ".82cqw" }}>
              WIN RATE
            </div>
            <div style={{
              fontSize: "2.9cqw", lineHeight: 1.15,
              marginTop: ".3cqw", color: "#eeeeee",
              fontWeight: 500, fontVariantNumeric: "tabular-nums",
            }}>
              {stats.winRate.toFixed(1)}%
            </div>
          </div>

          <div className="tm-metric" style={{ left: "51.5%" }}>
            <BarChart3 style={{
              width: "1.7cqw", height: "1.7cqw",
              color: "#a6a6a6", marginBottom: ".35cqw",
            }} />
            <div className="tm-label" style={{ fontSize: ".82cqw" }}>
              TOTAL TRADES
            </div>
            <div style={{
              fontSize: "2.9cqw", lineHeight: 1.15,
              marginTop: ".3cqw", color: "#eeeeee",
              fontWeight: 500, fontVariantNumeric: "tabular-nums",
            }}>
              {stats.trades}
            </div>
          </div>

          {/* Footer separator */}
          <div className="absolute" style={{
            left: "18%", right: "18%", top: "79.7%",
            height: 1, background: "#303030",
          }} />

          {/* Trader identity — no profile picture */}
          <div
            className="absolute flex flex-col justify-center"
            style={{
              left: "8.0%",
              top: "84.0%",
            }}
          >
            <div
              style={{
                fontSize: "1.3cqw",
                fontWeight: 500,
                color: "#f1f1f1",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </div>

            <div
              className="tm-label"
              style={{
                fontSize: ".66cqw",
                marginTop: ".35cqw",
                color: "#999999",
              }}
            >
              TRADER
            </div>

            <div
              style={{
                marginTop: ".7cqw",
                width: "5.4cqw",
                height: "1px",
                background: "#777777",
              }}
            />
          </div>

          {/* Verification */}
          <div className="absolute" style={{
            left: "28%", top: "84.6%",
          }}>
            <div className="tm-label" style={{ fontSize: ".66cqw" }}>
              VERIFIED BY
            </div>
            <div className="tm-label" style={{
              fontSize: ".76cqw", marginTop: ".3cqw",
              color: "#d0d0d0",
            }}>
              TRADEMIRROR
            </div>
          </div>

          {/* Central certification seal */}
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: "50%",
              top: "80.5%",
              width: "15%",
              height: "15%",
              transform: "translateX(-50%)",
            }}
          >
            <img
              src="/certificate-badge.png"
              alt="TradeMirror Performance Certificate"
              crossOrigin="anonymous"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          {/* Reporting period */}
          <div className="absolute text-center" style={{
            left: "63%", top: "84.6%", width: "14%",
          }}>
            <div className="tm-label" style={{ fontSize: ".66cqw" }}>
              REPORT PERIOD
            </div>
            <div className="tm-label" style={{
              fontSize: ".72cqw", marginTop: ".35cqw",
              color: "#d0d0d0", whiteSpace: "nowrap",
            }}>
              {startLabel} — {endLabel}
            </div>
          </div>

          {/* Founder signature with real signature graphic */}
          <div className="absolute flex flex-col items-center" style={{
            right: "6.1%", top: "81.7%", width: "15%",
          }}>
            <img
              src="/jake-signature.png"
              alt="Jake Carmona Signature"
              crossOrigin="anonymous"
              style={{
                width: "100%",
                maxWidth: "100%",
                height: "4.0cqw",
                objectFit: "contain",
                objectPosition: "center",
                display: "block",
                margin: "0 auto",
                marginBottom: "-0.2cqw",
                filter: "drop-shadow(0 1px 0 #d4d4d4a0) drop-shadow(0 0 2px #2228)",
              }}
            />
            <div style={{
              width: "100%", height: 1,
              background: "#777777", marginTop: ".65cqw",
            }} />
            <div
              className="tm-label tm-founder-label"
              style={{
                marginTop: ".45cqw",
                textAlign: "center",
                lineHeight: 1.8,
                letterSpacing: ".12em",
                fontWeight: 400,
                fontFamily: "inherit",
              }}
            >
              JAKE CARMONA<br />
              FOUNDER, TRADEMIRROR
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p role="status" className="text-xs text-white/50">
            {busy ? "Preparing certificate…" : message}
          </p>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={downloadPng}
              disabled={busy}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/5 disabled:opacity-50"
            >
              <Download size={16} />
              Download PNG
            </button>

            <button
              type="button"
              onClick={sharePng}
              disabled={busy}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
            >
              <Share2 size={16} />
              Share certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
