"use client";

import {
  Plus,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Save,
  Loader2,
  FileImage,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type TradeRow = {
  id: string;
  user_id: string;
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
  result: "Win" | "Loss" | "Breakeven" | null;
  risk_amount: number | null;
  r_multiple: number | null;
  setup: string | null;
  market_condition: string | null;
  session: string | null;
  grade: string | null;
  followed_plan: boolean | null;
  notes: string | null;
  screenshot_url: string | null;
  created_at: string;
};

type Filter = "All" | "Wins" | "Losses" | "Breakeven" | "Long" | "Short";

type FormState = {
  trade_date: string;
  pnl: string;
  result: "Win" | "Loss" | "Breakeven";
  symbol: string;
  direction: "Long" | "Short";
  quantity: string;
  emotion: string;
  followed_plan: boolean;
  setup: string;
  execution_rating: string;
  visibility: "Private" | "Followers" | "Public";
  notes: string;
  screenshot_url: string;
};

const emptyForm: FormState = {
  trade_date: new Date().toISOString().split("T")[0],
  pnl: "",
  result: "Win",
  symbol: "",
  direction: "Long",
  quantity: "1",
  emotion: "Focused",
  followed_plan: true,
  setup: "",
  execution_rating: "Great execution",
  visibility: "Private",
  notes: "",
  screenshot_url: "",
};

function formatMoney(value: number | null) {
  if (value === null || Number.isNaN(Number(value))) {
    return "—";
  }

  const number = Number(value);

  return `${number >= 0 ? "+" : "-"}$${Math.abs(number).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

function formatPrice(value: number | null) {
  if (value === null || Number.isNaN(Number(value))) {
    return "—";
  }

  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatR(value: number | null) {
  if (value === null || Number.isNaN(Number(value))) {
    return "—";
  }

  return `${Number(value).toFixed(2)}R`;
}

function formatDate(date: string) {
  if (!date) return "—";

  const parsed = new Date(`${date}T12:00:00`);

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDuration(
  entryTime: string | null,
  exitTime: string | null
) {
  if (!entryTime || !exitTime) {
    return "—";
  }

  const difference =
    new Date(exitTime).getTime() - new Date(entryTime).getTime();

  if (difference <= 0) {
    return "—";
  }

  const minutes = Math.round(difference / 60000);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  return `${hours}h ${remaining}m`;
}

function Direction({
  direction,
}: {
  direction: TradeRow["direction"];
}) {
  const isLong = direction === "Long";

  return (
    <div
      className={`flex items-center gap-1.5 text-[11px] font-medium ${
        isLong ? "text-emerald-400" : "text-red-400"
      }`}
    >
      {isLong ? (
        <ArrowUpRight
          className="h-3 w-3"
          strokeWidth={2}
        />
      ) : (
        <ArrowDownRight
          className="h-3 w-3"
          strokeWidth={2}
        />
      )}
      {direction}
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 shrink-0 border-r border-white/[0.05] px-3 text-[10px] font-medium transition-colors last:border-r-0 ${
        active
          ? "bg-blue-500/[0.12] text-white"
          : "text-white/35 hover:bg-white/[0.025] hover:text-white/65"
      }`}
    >
      {children}
    </button>
  );
}

function AddTradeModal({
  form,
  setForm,
  onClose,
  onSubmit,
  saving,
  error,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onClose: () => void;
  onSubmit: (screenshotFile: File | null) => void;
  saving: boolean;
  error: string;
}) {
  const update = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const [screenshotFile, setScreenshotFile] =
    useState<File | null>(null);

  const [screenshotPreview, setScreenshotPreview] =
    useState("");

  function handleScreenshotChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Screenshot must be smaller than 10MB.");
      return;
    }

    setScreenshotFile(file);

    const previewUrl = URL.createObjectURL(file);
    setScreenshotPreview(previewUrl);
  }

  function removeScreenshot() {
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview);
    }

    setScreenshotFile(null);
    setScreenshotPreview("");
  }

  const formattedDate = new Date(
    `${form.trade_date}T12:00:00`
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const emotions = [
    "Focused",
    "Calm",
    "Confident",
    "Hesitant",
    "Nervous",
    "Scared",
    "Frustrated",
    "Impulsive",
    "Greedy",
  ];

  const executionRatings = [
    "Great execution",
    "Good execution",
    "Iffy execution",
    "Poor execution",
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/65 p-0 backdrop-blur-md sm:items-center sm:p-4">
      <div className="w-full max-w-[500px] max-h-[94vh] overflow-hidden rounded-t-[20px] border border-white/[0.09] bg-[#08111a] shadow-[0_35px_100px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)] sm:rounded-[18px]">
        {/* HEADER */}
        <div className="border-b border-white/[0.055] px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[17px] font-semibold tracking-[-0.025em] text-white">
                NEW JOURNAL ENTRY
              </h2>

              <p className="mt-1.5 text-[12px] text-white/35">
                {formattedDate}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.05] hover:text-white/70"
            >
              <X
                className="h-4 w-4"
                strokeWidth={1.8}
              />
            </button>
          </div>
        </div>

        {/* FORM */}
        <div className="max-h-[calc(94vh-125px)] overflow-y-auto px-4 py-5 sm:max-h-[72vh] sm:px-6 sm:py-6">
          {/* TRADE DATE */}
          <label className="block">
            <span className="mb-2 block text-[10px] font-medium text-white/40">
              Trade date
            </span>

            <input
              type="date"
              value={form.trade_date}
              onChange={(event) =>
                update("trade_date", event.target.value)
              }
              className="h-11 w-full rounded-[10px] border border-white/[0.07] bg-[#0a141e] px-3 text-[11px] text-white/70 outline-none transition focus:border-blue-400/30 [color-scheme:dark]"
            />
          </label>

          {/* RESULT */}
          <div className="mt-5">
            <span className="mb-2 block text-[10px] font-medium text-white/40">
              Result
            </span>

            <div className="grid h-11 grid-cols-3 overflow-hidden rounded-[10px] border border-white/[0.07] bg-[#0a141e]">
              {(["Win", "Loss", "Breakeven"] as const).map((result) => (
                <button
                  key={result}
                  type="button"
                  onClick={() => {
                    update("result", result);
                    if (result === "Breakeven") {
                      update("pnl", "0");
                    } else if (form.result === "Breakeven") {
                      update("pnl", "");
                    }
                  }}
                  className={`text-[10px] font-medium transition ${
                    form.result === result
                      ? result === "Win"
                        ? "bg-emerald-400/[0.10] text-emerald-400"
                        : result === "Loss"
                          ? "bg-red-400/[0.10] text-red-400"
                          : "bg-amber-400/[0.10] text-amber-300"
                      : "text-white/30 hover:bg-white/[0.025] hover:text-white/60"
                  }`}
                >
                  {result}
                </button>
              ))}
            </div>
          </div>

          {/* P&L */}
          <label className="mt-5 block">
            <span className="mb-2 block text-[10px] font-medium text-white/40">
              P&L
            </span>

            <input
              type="number"
              value={form.pnl}
              onChange={(event) =>
                update("pnl", event.target.value)
              }
              placeholder={form.result === "Breakeven" ? "0.00" : "0.00"}
              disabled={form.result === "Breakeven"}
              autoFocus
              className={`h-11 w-full rounded-[10px] border border-white/[0.07] bg-[#0a141e] px-3 text-[14px] text-white outline-none placeholder:text-white/20 transition focus:border-blue-400/30 ${
                form.result === "Breakeven" ? "cursor-not-allowed opacity-50" : ""
              }`}
            />

            {form.result === "Breakeven" && (
              <p className="mt-1.5 text-[9px] text-amber-300/45">
                Breakeven trades are automatically saved at $0.
              </p>
            )}
          </label>

          {/* INSTRUMENT + DIRECTION */}
          <div className="mt-5 grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-2 block text-[10px] font-medium text-white/40">
                Instrument
              </span>

              <input
                type="text"
                value={form.symbol}
                onChange={(event) =>
                  update(
                    "symbol",
                    event.target.value.toUpperCase()
                  )
                }
                placeholder="NQ"
                className="h-11 w-full rounded-[10px] border border-white/[0.07] bg-[#0a141e] px-3 text-[12px] text-white/75 outline-none placeholder:text-white/20 transition focus:border-blue-400/30"
              />
            </label>

            <div>
              <span className="mb-2 block text-[10px] font-medium text-white/40">
                Direction
              </span>

              <div className="grid h-11 grid-cols-2 overflow-hidden rounded-[10px] border border-white/[0.07] bg-[#0a141e]">
                {(["Long", "Short"] as const).map(
                  (direction) => (
                    <button
                      key={direction}
                      type="button"
                      onClick={() =>
                        update("direction", direction)
                      }
                      className={`text-[11px] font-medium transition ${
                        form.direction === direction
                          ? direction === "Long"
                            ? "bg-emerald-400/[0.10] text-emerald-400"
                            : "bg-red-400/[0.10] text-red-400"
                          : "text-white/30 hover:bg-white/[0.025] hover:text-white/60"
                      }`}
                    >
                      {direction}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* EMOTION */}
          <div className="mt-5">
            <span className="mb-2 block text-[10px] font-medium text-white/40">
              Emotion
            </span>

            <div className="flex flex-wrap gap-2">
              {emotions.map((emotion) => (
                <button
                  key={emotion}
                  type="button"
                  onClick={() =>
                    update("emotion", emotion)
                  }
                  className={`rounded-lg border px-3 py-2 text-[10px] transition ${
                    form.emotion === emotion
                      ? "border-blue-400/25 bg-blue-500/[0.10] text-blue-300"
                      : "border-white/[0.06] bg-white/[0.018] text-white/35 hover:bg-white/[0.035] hover:text-white/60"
                  }`}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>

          {/* PLAN */}
          <div className="mt-5">
            <span className="mb-2 block text-[10px] font-medium text-white/40">
              Followed your plan?
            </span>

            <div className="grid h-11 grid-cols-2 overflow-hidden rounded-[10px] border border-white/[0.07] bg-[#0a141e]">
              <button
                type="button"
                onClick={() =>
                  update("followed_plan", true)
                }
                className={`text-[11px] font-medium transition ${
                  form.followed_plan
                    ? "bg-emerald-400/[0.10] text-emerald-400"
                    : "text-white/30 hover:bg-white/[0.025]"
                }`}
              >
                Yes
              </button>

              <button
                type="button"
                onClick={() =>
                  update("followed_plan", false)
                }
                className={`text-[11px] font-medium transition ${
                  !form.followed_plan
                    ? "bg-red-400/[0.10] text-red-400"
                    : "text-white/30 hover:bg-white/[0.025]"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* SETUP */}
          <label className="mt-5 block">
            <span className="mb-2 block text-[10px] font-medium text-white/40">
              Setup
            </span>

            <input
              type="text"
              value={form.setup}
              onChange={(event) =>
                update("setup", event.target.value)
              }
              placeholder="FVG, liquidity sweep, etc."
              className="h-11 w-full rounded-[10px] border border-white/[0.07] bg-[#0a141e] px-3 text-[11px] text-white/75 outline-none placeholder:text-white/20 transition focus:border-blue-400/30"
            />
          </label>

          {/* EXECUTION */}
          <div className="mt-5">
            <span className="mb-2 block text-[10px] font-medium text-white/40">
              Execution rating
            </span>

            <div className="grid grid-cols-2 gap-2">
              {executionRatings.map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    update("execution_rating", rating)
                  }
                  className={`h-10 rounded-[9px] border text-[10px] transition ${
                    form.execution_rating === rating
                      ? "border-blue-400/25 bg-blue-500/[0.10] text-blue-300"
                      : "border-white/[0.06] bg-white/[0.018] text-white/35 hover:bg-white/[0.035] hover:text-white/60"
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          {/* JOURNAL */}
          <label className="mt-5 block">
            <span className="mb-2 block text-[10px] font-medium text-white/40">
              Journal
            </span>

            <textarea
              value={form.notes}
              onChange={(event) =>
                update("notes", event.target.value)
              }
              placeholder="Write about the trade..."
              className="h-28 w-full resize-none rounded-[10px] border border-white/[0.07] bg-[#0a141e] px-3 py-3 text-[11px] leading-5 text-white/70 outline-none placeholder:text-white/20 focus:border-blue-400/30"
            />
          </label>

          {/* VISIBILITY */}
          <div className="mt-5">
            <span className="mb-2 block text-[10px] font-medium text-white/40">
              Visibility
            </span>

            <div className="grid grid-cols-3 gap-2">
              {(
                ["Private", "Followers", "Public"] as const
              ).map((visibility) => (
                <button
                  key={visibility}
                  type="button"
                  onClick={() =>
                    update("visibility", visibility)
                  }
                  className={`h-10 rounded-[9px] border text-[10px] transition ${
                    form.visibility === visibility
                      ? "border-blue-400/25 bg-blue-500/[0.10] text-blue-300"
                      : "border-white/[0.06] bg-white/[0.018] text-white/35 hover:bg-white/[0.035] hover:text-white/60"
                  }`}
                >
                  {visibility}
                </button>
              ))}
            </div>
          </div>

          {/* SCREENSHOT */}
          <div className="mt-5">
            <span className="mb-2 block text-[10px] font-medium text-white/40">
              Trade screenshot
            </span>

            {!screenshotFile ? (
              <label className="group flex cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-white/[0.09] bg-[#0a141e] px-4 py-7 transition hover:border-blue-400/25 hover:bg-blue-500/[0.025]">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/[0.08] text-blue-400 transition group-hover:bg-blue-500/[0.12]">
                  <FileImage
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />
                </div>

                <p className="mt-3 text-[10px] font-medium text-white/55">
                  Upload trade screenshot
                </p>

                <p className="mt-1 text-[9px] text-white/25">
                  PNG, JPG or WebP · Max 10MB
                </p>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleScreenshotChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative overflow-hidden rounded-[12px] border border-white/[0.08] bg-[#050b12]">
                <img
                  src={screenshotPreview}
                  alt="Trade screenshot preview"
                  className="max-h-[220px] w-full object-contain"
                />

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-3 py-2 backdrop-blur-md">
                  <p className="max-w-[280px] truncate text-[9px] text-white/55">
                    {screenshotFile.name}
                  </p>

                  <button
                    type="button"
                    onClick={removeScreenshot}
                    className="flex h-7 items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.06] px-2.5 text-[9px] font-medium text-white/55 transition hover:bg-red-500/[0.08] hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 py-2.5 text-[10px] text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-2 border-t border-white/[0.055] px-4 py-3.5 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-10 rounded-[10px] border border-white/[0.07] bg-white/[0.018] px-5 text-[10px] font-medium text-white/50 transition hover:bg-white/[0.035] hover:text-white/75 disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onSubmit(screenshotFile)}
            disabled={saving}
            className="flex h-10 items-center gap-2 rounded-[10px] bg-blue-600 px-5 text-[10px] font-semibold text-white shadow-[0_8px_25px_rgba(35,133,245,0.18)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}

            {saving ? "Saving..." : "Save journal entry"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TradesPage() {
  const supabase = useMemo(() => createClient(), []);

  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [activeFilter, setActiveFilter] =
    useState<Filter>("All");

  const [selectedTrade, setSelectedTrade] =
    useState<string | null>(null);

  const [showAddTrade, setShowAddTrade] =
    useState(false);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [symbolFilter, setSymbolFilter] =
    useState("All Symbols");

  const [sortOrder, setSortOrder] =
    useState("Recent");

  async function loadTrades() {
    setLoading(true);
    setPageError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setPageError(
        "You must be signed in to view your trades."
      );
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("trade_date", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("TRADES LOAD ERROR:", error);

      setPageError(
        "We couldn't load your trades. Please try again."
      );

      setLoading(false);
      return;
    }

    const loadedTrades = (data ?? []) as TradeRow[];

    setTrades(loadedTrades);

    if (loadedTrades.length > 0) {
      setSelectedTrade((current) =>
        current &&
        loadedTrades.some(
          (trade) => trade.id === current
        )
          ? current
          : loadedTrades[0].id
      );
    } else {
      setSelectedTrade(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTrades();
  }, []);

  async function handleAddTrade(
    screenshotFile: File | null
  ) {
    setFormError("");

    if (!form.pnl.trim()) {
      setFormError("Please enter your P&L.");
      return;
    }

    if (!form.symbol.trim()) {
      setFormError("Please enter an instrument.");
      return;
    }

    const pnl = form.result === "Breakeven" ? 0 : Number(form.pnl);

    if (Number.isNaN(pnl)) {
      setFormError("Please enter a valid P&L.");
      return;
    }

    if (form.result === "Win" && pnl <= 0) {
      setFormError("A winning trade must have a positive P&L.");
      return;
    }

    if (form.result === "Loss" && pnl >= 0) {
      setFormError("A losing trade must have a negative P&L.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setFormError(
        "Your session has expired. Please log in again."
      );
      setSaving(false);
      return;
    }

    let screenshotUrl: string | null = null;

    if (screenshotFile) {
      const fileExtension =
        screenshotFile.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExtension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("trade-screenshots")
          .upload(filePath, screenshotFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: screenshotFile.type,
          });

      if (uploadError) {
        console.error(
          "SCREENSHOT UPLOAD ERROR:",
          uploadError
        );

        setFormError(
          "We couldn't upload your screenshot. Please try again."
        );

        setSaving(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("trade-screenshots")
        .getPublicUrl(filePath);

      screenshotUrl = publicUrl;
    }

    const { data, error } = await supabase
      .from("trades")
      .insert({
        user_id: user.id,
        trade_date: form.trade_date,
        symbol: form.symbol.trim().toUpperCase(),
        market: "Futures",
        direction: form.direction,
        quantity: Number(form.quantity) || 1,
        pnl,
        result: form.result,
        followed_plan: form.followed_plan,
        setup: form.setup.trim() || null,
        grade: form.execution_rating || null,
        emotion: form.emotion || null,
        execution_rating:
          form.execution_rating || null,
        visibility: form.visibility,
        notes: form.notes.trim() || null,
        screenshot_url: screenshotUrl,
      })
      .select()
      .single();

    if (error) {
      console.error("TRADE INSERT ERROR:", error);

      setFormError(
        error.message ||
          "Unable to save this journal entry."
      );

      setSaving(false);
      return;
    }

    setTrades((current) => [
      data as TradeRow,
      ...current,
    ]);

    setSelectedTrade(data.id);
    setForm(emptyForm);
    setShowAddTrade(false);
    setSaving(false);
  }

  const filteredTrades = useMemo(() => {
    let result = [...trades];

    if (activeFilter === "Wins") {
      result = result.filter(
        (trade) => Number(trade.pnl) > 0
      );
    }

    if (activeFilter === "Losses") {
      result = result.filter(
        (trade) => Number(trade.pnl) < 0
      );
    }

    if (activeFilter === "Breakeven") {
      result = result.filter(
        (trade) =>
          trade.result === "Breakeven" ||
          (trade.result === null && Number(trade.pnl) === 0)
      );
    }

    if (activeFilter === "Long") {
      result = result.filter(
        (trade) => trade.direction === "Long"
      );
    }

    if (activeFilter === "Short") {
      result = result.filter(
        (trade) => trade.direction === "Short"
      );
    }

    if (symbolFilter !== "All Symbols") {
      result = result.filter(
        (trade) => trade.symbol === symbolFilter
      );
    }

    if (sortOrder === "Oldest") {
      result.reverse();
    }

    return result;
  }, [
    trades,
    activeFilter,
    symbolFilter,
    sortOrder,
  ]);

  const symbols = useMemo(() => {
    return Array.from(
      new Set(trades.map((trade) => trade.symbol))
    ).sort();
  }, [trades]);

  const selected =
    trades.find(
      (trade) => trade.id === selectedTrade
    ) ??
    filteredTrades[0] ??
    null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#03070d] px-3 py-3 pb-24 text-white sm:px-4 sm:py-4 lg:h-screen lg:overflow-hidden lg:px-5 lg:pb-0">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1500px] flex-col sm:min-h-[calc(100vh-32px)] lg:h-full">
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between gap-3">
          <h1 className="text-[19px] font-semibold tracking-[-0.035em] text-white sm:text-[20px]">
            Trades
          </h1>

          <button
            type="button"
            onClick={() => {
              setForm(emptyForm);
              setFormError("");
              setShowAddTrade(true);
            }}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#2385f5] px-3 text-[10px] font-semibold text-white shadow-[0_8px_25px_rgba(35,133,245,0.18)] transition hover:bg-[#318ff7] sm:gap-2 sm:px-4 sm:text-[11px]"
          >
            <Plus
              className="h-3.5 w-3.5"
              strokeWidth={2.2}
            />
            Add Trade
          </button>
        </div>

        {/* FILTERS */}
        <div className="mt-3 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full overflow-x-auto rounded-lg border border-white/[0.07] bg-[#08111a] sm:w-auto">
            {(
              [
                "All",
                "Wins",
                "Losses",
                "Breakeven",
                "Long",
                "Short",
              ] as Filter[]
            ).map((filter) => (
              <FilterButton
                key={filter}
                active={activeFilter === filter}
                onClick={() =>
                  setActiveFilter(filter)
                }
              >
                {filter}
              </FilterButton>
            ))}
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <select
                value={symbolFilter}
                onChange={(event) =>
                  setSymbolFilter(event.target.value)
                }
                className="h-8 min-w-0 flex-1 appearance-none rounded-lg border border-white/[0.07] bg-[#09111b] px-3 pr-8 text-[10px] font-medium text-white/45 outline-none sm:flex-none"
              >
                <option>All Symbols</option>

                {symbols.map((symbol) => (
                  <option key={symbol}>
                    {symbol}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-white/25" />
            </div>

            <div className="relative flex-1 sm:flex-none">
              <select
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value)
                }
                className="h-8 min-w-0 flex-1 appearance-none rounded-lg border border-white/[0.07] bg-[#09111b] px-3 pr-8 text-[10px] font-medium text-white/45 outline-none sm:flex-none"
              >
                <option>Recent</option>
                <option>Oldest</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-white/25" />
            </div>
          </div>
        </div>

        {/* ERROR */}
        {pageError && (
          <div className="mt-3 shrink-0 rounded-lg border border-red-500/20 bg-red-500/[0.05] px-4 py-3 text-[10px] text-red-400">
            {pageError}
          </div>
        )}

        {/* TRADE TABLE */}
        <div className="mt-3 shrink-0 overflow-x-auto overflow-y-hidden rounded-[12px] border border-white/[0.065] bg-[#071019]/85 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <div className="min-w-[720px]">
            {/* TABLE HEADER */}
            <div className="grid grid-cols-[0.7fr_0.9fr_1.05fr_1.05fr_0.75fr_0.65fr_0.75fr_0.7fr] border-b border-white/[0.055] bg-white/[0.012] px-4 py-2.5">
              {[
                "Symbol",
                "Direction",
                "Entry",
                "Exit",
                "P&L",
                "R:R",
                "Setup",
                "Date",
              ].map((heading) => (
                <span
                  key={heading}
                  className="text-[9px] font-medium text-white/30"
                >
                  {heading}
                </span>
              ))}
            </div>

            {/* SCROLLABLE TRADE LIST */}
            <div className="max-h-[155px] overflow-y-auto">
              {loading ? (
                <div className="flex h-[115px] items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-400/60" />
                </div>
              ) : filteredTrades.length === 0 ? (
                <div className="flex h-[115px] flex-col items-center justify-center">
                  <p className="text-[11px] font-medium text-white/45">
                    No trades found
                  </p>

                  <p className="mt-1 text-[9px] text-white/25">
                    Add your first trade to start building your journal.
                  </p>
                </div>
              ) : (
                filteredTrades.map((trade) => (
                  <button
                    type="button"
                    key={trade.id}
                    onClick={() =>
                      setSelectedTrade(trade.id)
                    }
                    className={`grid w-full grid-cols-[0.7fr_0.9fr_1.05fr_1.05fr_0.75fr_0.65fr_0.75fr_0.7fr] border-b border-white/[0.045] px-4 py-2.5 text-left transition-colors last:border-b-0 ${
                      selectedTrade === trade.id
                        ? "bg-blue-500/[0.035]"
                        : "hover:bg-white/[0.018]"
                    }`}
                  >
                    <span className="text-[10px] font-medium text-white/70">
                      {trade.symbol}
                    </span>

                    <Direction
                      direction={trade.direction}
                    />

                    <span className="text-[10px] text-white/45">
                      {formatPrice(
                        trade.entry_price
                      )}
                    </span>

                    <span className="text-[10px] text-white/45">
                      {formatPrice(
                        trade.exit_price
                      )}
                    </span>

                    <span
                      className={`text-[10px] font-semibold ${
                        trade.result === "Breakeven" ||
                        (trade.result === null && Number(trade.pnl) === 0)
                          ? "text-amber-300"
                          : Number(trade.pnl) >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                      }`}
                    >
                      {formatMoney(trade.pnl)}
                    </span>

                    <span
                      className={`text-[10px] ${
                        trade.result === "Breakeven" ||
                        (trade.result === null && Number(trade.pnl) === 0)
                          ? "text-amber-300/80"
                          : Number(trade.pnl) >= 0
                            ? "text-white/45"
                            : "text-red-400/80"
                      }`}
                    >
                      {formatR(trade.r_multiple)}
                    </span>

                    <span className="truncate pr-2 text-[10px] text-white/45">
                      {trade.setup || "—"}
                    </span>

                    <span className="text-[10px] text-white/40">
                      {formatDate(
                        trade.trade_date
                      )}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* SELECTED TRADE */}
        <section className="mt-3 min-h-[520px] overflow-hidden rounded-[13px] border border-white/[0.075] bg-[#071019]/90 shadow-[0_25px_80px_rgba(0,0,0,0.24)] lg:min-h-0 lg:flex-1">
          {!selected ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-[12px] font-medium text-white/45">
                  No trade selected
                </p>

                <p className="mt-1 text-[10px] text-white/25">
                  Add a trade to see its details here.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* TITLE */}
              <div className="flex items-start justify-between gap-3 border-b border-white/[0.05] px-3 py-3 sm:px-4">
                <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
                  <h2 className="text-[13px] font-semibold text-white/85">
                    Trade
                  </h2>

                  <span className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-[9px] font-medium text-white/40">
                    {selected.symbol}
                  </span>

                  <span
                    className={`rounded-md border px-2 py-1 text-[9px] font-medium ${
                      selected.direction ===
                      "Long"
                        ? "border-emerald-400/10 bg-emerald-400/[0.06] text-emerald-400"
                        : "border-red-400/10 bg-red-400/[0.06] text-red-400"
                    }`}
                  >
                    {selected.direction ===
                    "Long"
                      ? "↗"
                      : "↘"}{" "}
                    {selected.direction}
                  </span>

                  <span
                    className={`rounded-md border px-2 py-1 text-[9px] font-medium ${
                      selected.result === "Breakeven" ||
                      (selected.result === null && Number(selected.pnl) === 0)
                        ? "border-amber-400/10 bg-amber-400/[0.06] text-amber-300"
                        : selected.result === "Loss" ||
                            (selected.result === null && Number(selected.pnl) < 0)
                          ? "border-red-400/10 bg-red-400/[0.06] text-red-400"
                          : "border-emerald-400/10 bg-emerald-400/[0.06] text-emerald-400"
                    }`}
                  >
                    {selected.result ??
                      (Number(selected.pnl) === 0
                        ? "Breakeven"
                        : Number(selected.pnl) > 0
                          ? "Win"
                          : "Loss")}
                  </span>

                  {selected.setup && (
                    <span className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-[9px] font-medium text-white/35">
                      {selected.setup}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[16px] font-semibold ${
                    selected.result === "Breakeven" ||
                    (selected.result === null && Number(selected.pnl) === 0)
                      ? "text-amber-300"
                      : Number(selected.pnl) >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                  }`}
                >
                  {formatMoney(selected.pnl)}
                </span>
              </div>

              <div className="grid min-h-0 gap-4 overflow-y-auto p-3 sm:p-4 lg:h-[calc(100%-53px)] lg:grid-cols-[1fr_1fr] lg:gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                {/* DETAILS */}
                <div className="flex h-full flex-col">
                  <div className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-6">
                    <div>
                      <p className="text-[8px] text-white/25">
                        Entry
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-white/65">
                        {formatPrice(
                          selected.entry_price
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[8px] text-white/25">
                        Exit
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-white/65">
                        {formatPrice(
                          selected.exit_price
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[8px] text-white/25">
                        Size
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-white/65">
                        {selected.quantity}
                      </p>
                    </div>

                    <div>
                      <p className="text-[8px] text-white/25">
                        R:R
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-white/65">
                        {formatR(
                          selected.r_multiple
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[8px] text-white/25">
                        Risk
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-white/65">
                        {selected.risk_amount !==
                        null
                          ? `$${Number(
                              selected.risk_amount
                            ).toFixed(2)}`
                          : "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[8px] text-white/25">
                        Duration
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-white/65">
                        {formatDuration(
                          selected.entry_time,
                          selected.exit_time
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/[0.05] pt-4 sm:grid-cols-3">
                    <div>
                      <p className="text-[8px] text-white/25">
                        Market Condition
                      </p>

                      <p className="mt-1 text-[10px] text-white/55">
                        {selected.market_condition ||
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[8px] text-white/25">
                        Session
                      </p>

                      <p className="mt-1 text-[10px] text-white/55">
                        {selected.session || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[8px] text-white/25">
                        Grade
                      </p>

                      <p
                        className={`mt-1 text-[10px] font-semibold ${
                          selected.grade
                            ? "text-emerald-400"
                            : "text-white/40"
                        }`}
                      >
                        {selected.grade || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-white/[0.05] pt-4">
                    <p className="text-[8px] text-white/25">
                      Notes
                    </p>

                    <p className="mt-2 max-w-[500px] text-[10px] leading-[1.6] text-white/45">
                      {selected.notes ||
                        "No notes were added to this trade."}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-white/[0.05] pt-4 lg:mt-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[8px] text-white/25">
                          Plan followed
                        </p>

                        <p
                          className={`mt-1 text-[10px] font-medium ${
                            selected.followed_plan
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {selected.followed_plan
                            ? "Yes"
                            : "No"}
                        </p>
                      </div>

                      <div>
                        <p className="text-right text-[8px] text-white/25">
                          Market
                        </p>

                        <p className="mt-1 text-right text-[10px] text-white/50">
                          {selected.market}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CHART / SCREENSHOT */}
                <div className="relative h-[210px] min-h-[210px] overflow-hidden rounded-lg border border-white/[0.06] bg-[#050b12] sm:h-[240px] sm:min-h-[240px] lg:h-full lg:min-h-[150px]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(35,133,245,0.08),transparent_55%)]" />

                  <div className="absolute inset-0 opacity-40">
                    <div className="absolute left-0 right-0 top-[25%] border-t border-white/[0.045]" />
                    <div className="absolute left-0 right-0 top-[50%] border-t border-white/[0.045]" />
                    <div className="absolute left-0 right-0 top-[75%] border-t border-white/[0.045]" />

                    <div className="absolute bottom-0 left-[15%] top-0 border-l border-white/[0.035]" />
                    <div className="absolute bottom-0 left-[35%] top-0 border-l border-white/[0.035]" />
                    <div className="absolute bottom-0 left-[55%] top-0 border-l border-white/[0.035]" />
                    <div className="absolute bottom-0 left-[75%] top-0 border-l border-white/[0.035]" />
                  </div>

                  <svg
                    viewBox="0 0 500 220"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full"
                  >
                    <path
                      d="M0 175 L35 168 L55 180 L82 160 L110 164 L135 145 L160 152 L184 130 L210 138 L236 119 L260 126 L284 103 L308 112 L332 91 L356 98 L382 73 L408 82 L435 56 L460 68 L500 34"
                      fill="none"
                      stroke="rgba(49,145,247,0.9)"
                      strokeWidth="2.5"
                    />

                    <path
                      d="M0 175 L35 168 L55 180 L82 160 L110 164 L135 145 L160 152 L184 130 L210 138 L236 119 L260 126 L284 103 L308 112 L332 91 L356 98 L382 73 L408 82 L435 56 L460 68 L500 34 L500 220 L0 220 Z"
                      fill="rgba(35,133,245,0.08)"
                    />
                  </svg>

                  <div className="absolute bottom-2 left-3 text-[8px] text-white/25">
                    Trade chart
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {/* ADD TRADE MODAL */}
      {showAddTrade && (
        <AddTradeModal
          form={form}
          setForm={setForm}
          onClose={() => {
            if (!saving) {
              setShowAddTrade(false);
            }
          }}
          onSubmit={handleAddTrade}
          saving={saving}
          error={formError}
        />
      )}
    </main>
  );
}