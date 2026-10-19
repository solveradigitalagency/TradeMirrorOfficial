
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Trade = {
  id: string;
  trade_date: string;
  symbol: string | null;
  market: string | null;
  pnl: number | string | null;
  result: string | null;
  risk_amount?: number | string | null;
  r_multiple?: number | string | null;
};

type Expense = {
  id: string;
  expense_date: string;
  category: string;
  vendor: string | null;
  description: string;
  amount: number | string;
  expense_type: string;
  status: string;
  receipt_url?: string | null;
};

type ExpenseForm = {
  expense_date: string;
  category: string;
  vendor: string;
  description: string;
  amount: string;
  expense_type: string;
  status: string;
};

const CATEGORIES = [
  "Evaluation fees",
  "Reset fees",
  "Activation fees",
  "Platform & data",
  "Education",
  "Hardware",
  "Software",
  "Other",
];

const today = () => new Date().toISOString().slice(0, 10);
const currentYear = new Date().getFullYear();

const emptyForm = (): ExpenseForm => ({
  expense_date: today(),
  category: "Evaluation fees",
  vendor: "",
  description: "",
  amount: "",
  expense_type: "prop_firm",
  status: "paid",
});

function money(value: number, cents = true) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function signedMoney(value: number) {
  if (value > 0) return `+${money(value)}`;
  if (value < 0) return `-${money(Math.abs(value))}`;
  return money(0);
}

function numeric(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function monthLabel(month: number) {
  return new Date(currentYear, month, 1).toLocaleDateString("en-US", {
    month: "short",
  });
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function Icon({
  name,
  size = 18,
}: {
  name: string;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "overview":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="8" height="8" rx="2" />
          <rect x="13" y="3" width="8" height="5" rx="2" />
          <rect x="13" y="10" width="8" height="11" rx="2" />
          <rect x="3" y="13" width="8" height="8" rx="2" />
        </svg>
      );
    case "expense":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="15" rx="2" />
          <path d="M3 10h18M7 5V3h10v2" />
          <path d="M7 15h4" />
        </svg>
      );
    case "report":
      return (
        <svg {...common}>
          <path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path d="M14 3v5h5M9 13h6M9 17h6" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M12 3v12m-5-5 5 5 5-5M4 17v3h16v-3" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 7v5h-5M4 17v-5h5" />
          <path d="M5.5 9a7 7 0 0 1 12-2L20 12M4 12l2.5 5a7 7 0 0 0 12-2" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4m0 4h.01" />
        </svg>
      );
  }
}

function StatCard({
  label,
  value,
  detail,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  icon: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  const valueColor =
    tone === "positive"
      ? "text-emerald-400"
      : tone === "negative"
        ? "text-red-400"
        : "text-white";

  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.09] bg-white/[0.025] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-white/45 sm:text-sm">{label}</p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white/65">
          <Icon name={icon} size={17} />
        </span>
      </div>
      <p className={`mt-4 break-words text-2xl font-semibold tracking-tight sm:text-[28px] ${valueColor}`}>
        {value}
      </p>
      <p className="mt-2 text-[11px] leading-5 text-white/35">{detail}</p>
    </div>
  );
}

function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-white/40">{description}</p>
      </div>
      {action}
    </div>
  );
}

export default function TaxCenterPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "expenses" | "reports" | "documents"
  >("overview");
  const [year, setYear] = useState(currentYear);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [form, setForm] = useState<ExpenseForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [monthFilter, setMonthFilter] = useState("All months");

  const supabase = useMemo(() => createClient(), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      setError("Please sign in to view your Tax Center.");
      setTrades([]);
      setExpenses([]);
      setLoading(false);
      return;
    }

    const [tradeResult, expenseResult] = await Promise.all([
      supabase
        .from("trades")
        .select("id, trade_date, symbol, market, pnl, result, risk_amount, r_multiple")
        .eq("user_id", authData.user.id)
        .gte("trade_date", `${year}-01-01`)
        .lte("trade_date", `${year}-12-31`)
        .order("trade_date", { ascending: true }),
      supabase
        .from("trading_expenses")
        .select(
          "id, expense_date, category, vendor, description, amount, expense_type, status, receipt_url",
        )
        .eq("user_id", authData.user.id)
        .gte("expense_date", `${year}-01-01`)
        .lte("expense_date", `${year}-12-31`)
        .order("expense_date", { ascending: false }),
    ]);

    if (tradeResult.error) {
      setError(`Could not load trades: ${tradeResult.error.message}`);
      setTrades([]);
    } else {
      setTrades((tradeResult.data ?? []) as Trade[]);
    }

    if (expenseResult.error) {
      setError((previous) =>
        previous
          ? `${previous} | Expenses: ${expenseResult.error!.message}`
          : `Could not load expenses: ${expenseResult.error!.message}`,
      );
      setExpenses([]);
    } else {
      setExpenses((expenseResult.data ?? []) as Expense[]);
    }

    setLoading(false);
  }, [supabase, year]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const yearTrades = useMemo(
    () => trades.filter((trade) => trade.trade_date?.startsWith(String(year))),
    [trades, year],
  );

  const yearExpenses = useMemo(
    () =>
      expenses.filter((expense) =>
        expense.expense_date?.startsWith(String(year)),
      ),
    [expenses, year],
  );

  const grossPnl = yearTrades.reduce((sum, trade) => sum + numeric(trade.pnl), 0);
  const totalExpenses = yearExpenses
    .filter((expense) => expense.status === "paid")
    .reduce((sum, expense) => sum + numeric(expense.amount), 0);
  const netAfterExpenses = grossPnl - totalExpenses;

  const wins = yearTrades.filter((trade) => numeric(trade.pnl) > 0).length;
  const losses = yearTrades.filter((trade) => numeric(trade.pnl) < 0).length;
  const closedTrades = wins + losses;
  const winRate = closedTrades ? (wins / closedTrades) * 100 : 0;
  const grossWins = yearTrades
    .filter((trade) => numeric(trade.pnl) > 0)
    .reduce((sum, trade) => sum + numeric(trade.pnl), 0);
  const grossLosses = Math.abs(
    yearTrades
      .filter((trade) => numeric(trade.pnl) < 0)
      .reduce((sum, trade) => sum + numeric(trade.pnl), 0),
  );
  const profitFactor =
    grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? Infinity : 0;

  const monthlyData = useMemo(
    () =>
      Array.from({ length: 12 }, (_, month) => {
        const monthTrades = yearTrades.filter(
          (trade) => new Date(`${trade.trade_date}T12:00:00`).getMonth() === month,
        );
        const monthExpenses = yearExpenses.filter(
          (expense) =>
            new Date(`${expense.expense_date}T12:00:00`).getMonth() === month &&
            expense.status === "paid",
        );

        const pnl = monthTrades.reduce(
          (sum, trade) => sum + numeric(trade.pnl),
          0,
        );
        const expenseTotal = monthExpenses.reduce(
          (sum, expense) => sum + numeric(expense.amount),
          0,
        );

        return {
          month,
          label: monthLabel(month),
          pnl,
          expenses: expenseTotal,
          net: pnl - expenseTotal,
          count: monthTrades.length,
        };
      }),
    [yearTrades, yearExpenses],
  );

  const maxChartValue = Math.max(
    1,
    ...monthlyData.map((item) => Math.abs(item.pnl)),
  );

  const categoryTotals = useMemo(() => {
    const totals = new Map<string, number>();

    yearExpenses
      .filter((expense) => expense.status === "paid")
      .forEach((expense) => {
        totals.set(
          expense.category,
          (totals.get(expense.category) ?? 0) + numeric(expense.amount),
        );
      });

    return Array.from(totals.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [yearExpenses]);

  const propFirmSpend = yearExpenses
    .filter(
      (expense) =>
        expense.status === "paid" && expense.expense_type === "prop_firm",
    )
    .reduce((sum, expense) => sum + numeric(expense.amount), 0);

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return yearExpenses.filter((expense) => {
      const matchesSearch =
        !query ||
        [expense.description, expense.vendor, expense.category]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));

      const matchesCategory =
        categoryFilter === "All categories" ||
        expense.category === categoryFilter;

      const matchesMonth =
        monthFilter === "All months" ||
        Number(expense.expense_date.slice(5, 7)) === Number(monthFilter);

      return matchesSearch && matchesCategory && matchesMonth;
    });
  }, [yearExpenses, search, categoryFilter, monthFilter]);

  function startNewExpense() {
    setEditingExpenseId(null);
    setForm(emptyForm());
    setError("");
    setSuccess("");
    setShowExpenseForm(true);
  }

  function startEditExpense(expense: Expense) {
    setEditingExpenseId(expense.id);
    setForm({
      expense_date: expense.expense_date,
      category: expense.category,
      vendor: expense.vendor ?? "",
      description: expense.description,
      amount: String(expense.amount),
      expense_type: expense.expense_type,
      status: expense.status,
    });
    setError("");
    setSuccess("");
    setShowExpenseForm(true);
  }

  async function saveExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter an expense amount greater than zero.");
      setSaving(false);
      return;
    }

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      setError("Please sign in before saving an expense.");
      setSaving(false);
      return;
    }

    const payload = {
      user_id: authData.user.id,
      expense_date: form.expense_date,
      category: form.category,
      vendor: form.vendor.trim() || null,
      description: form.description.trim(),
      amount,
      expense_type: form.expense_type,
      status: form.status,
    };

    const result = editingExpenseId
      ? await supabase
          .from("trading_expenses")
          .update(payload)
          .eq("id", editingExpenseId)
          .eq("user_id", authData.user.id)
      : await supabase.from("trading_expenses").insert(payload);

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setSuccess(editingExpenseId ? "Expense updated." : "Expense added.");
    setShowExpenseForm(false);
    setEditingExpenseId(null);
    setForm(emptyForm());
    await loadData();
    setSaving(false);
  }

  async function deleteExpense(expense: Expense) {
    const confirmed = window.confirm(
      `Delete "${expense.description}" (${money(numeric(expense.amount))})?`,
    );

    if (!confirmed) return;

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    const { error: deleteError } = await supabase
      .from("trading_expenses")
      .delete()
      .eq("id", expense.id)
      .eq("user_id", authData.user.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setSuccess("Expense deleted.");
    await loadData();
  }

  function exportTrades() {
    downloadCsv(`trademirror-trades-${year}.csv`, [
      ["Date", "Symbol", "Market", "P&L", "Result"],
      ...yearTrades.map((trade) => [
        trade.trade_date,
        trade.symbol ?? "",
        trade.market ?? "",
        numeric(trade.pnl).toFixed(2),
        trade.result ?? "",
      ]),
    ]);
  }

  function exportExpenses() {
    downloadCsv(`trademirror-expenses-${year}.csv`, [
      [
        "Date",
        "Category",
        "Vendor",
        "Description",
        "Amount",
        "Expense type",
        "Status",
      ],
      ...yearExpenses.map((expense) => [
        expense.expense_date,
        expense.category,
        expense.vendor ?? "",
        expense.description,
        numeric(expense.amount).toFixed(2),
        expense.expense_type,
        expense.status,
      ]),
    ]);
  }

  function exportAnnualSummary() {
    downloadCsv(`trademirror-annual-summary-${year}.csv`, [
      ["Metric", "Value"],
      ["Tax year", year],
      ["Total recorded trade P&L", grossPnl.toFixed(2)],
      ["Paid recorded expenses", totalExpenses.toFixed(2)],
      ["P&L after recorded expenses", netAfterExpenses.toFixed(2)],
      ["Trades recorded", yearTrades.length],
      ["Winning trades", wins],
      ["Losing trades", losses],
      ["Win rate (%)", winRate.toFixed(2)],
      [
        "Profit factor",
        Number.isFinite(profitFactor) ? profitFactor.toFixed(2) : "N/A",
      ],
      ["Prop firm costs paid", propFirmSpend.toFixed(2)],
      [],
      ["Monthly breakdown"],
      ["Month", "Recorded P&L", "Paid expenses", "P&L after expenses", "Trades"],
      ...monthlyData.map((item) => [
        item.label,
        item.pnl.toFixed(2),
        item.expenses.toFixed(2),
        item.net.toFixed(2),
        item.count,
      ]),
    ]);
  }

  const tabButton = (
    key: typeof activeTab,
    label: string,
  ) => (
    <button
      type="button"
      onClick={() => setActiveTab(key)}
      className={`relative whitespace-nowrap px-4 py-3 text-xs transition ${
        activeTab === key
          ? "text-white"
          : "text-white/40 hover:text-white/75"
      }`}
    >
      {label}
      {activeTab === key && (
        <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-white" />
      )}
    </button>
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 pb-12 pt-7 sm:px-6 lg:px-9 lg:pt-10">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.035] text-white/80">
              <Icon name="report" size={21} />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/35">
                TradeMirror / Records
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Tax Center
              </h1>
              <p className="mt-2 max-w-xl text-xs leading-5 text-white/45 sm:text-sm">
                Organize your trading performance, prop firm costs, and
                financial records in one place.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.025] px-3">
              <Icon name="calendar" size={15} />
              <span className="sr-only">Tax year</span>
              <select
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
                className="bg-transparent text-xs text-white outline-none"
              >
                {Array.from({ length: 7 }, (_, index) => currentYear - index).map(
                  (value) => (
                    <option className="bg-[#111]" key={value} value={value}>
                      {value}
                    </option>
                  ),
                )}
              </select>
            </label>

            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.025] px-3 text-xs text-white/70 transition hover:bg-white/[0.06] disabled:opacity-40"
            >
              <Icon name="refresh" size={15} />
              Refresh
            </button>

            <button
              type="button"
              onClick={startNewExpense}
              className="flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-black transition hover:bg-white/90"
            >
              <Icon name="plus" size={15} />
              Add expense
            </button>
          </div>
        </header>

        <nav className="mt-7 flex gap-1 overflow-x-auto border-b border-white/[0.09]">
          {tabButton("overview", "Overview")}
          {tabButton("expenses", "Expenses")}
          {tabButton("reports", "Reports & exports")}
          {tabButton("documents", "Documents")}
        </nav>

        {error && (
          <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-xs leading-5 text-red-300">
            {error}
            {error.includes("trading_expenses") && (
              <p className="mt-1 text-red-200/70">
                Make sure you have run the expense-table SQL included with this
                implementation.
              </p>
            )}
          </div>
        )}

        {success && (
          <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-3 text-xs text-emerald-300">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-white/40">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
              Loading your trading records...
            </div>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <div className="mt-6 space-y-5">
                <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    label="Recorded trade P&L"
                    value={money(grossPnl)}
                    detail={`${yearTrades.length} trades recorded in ${year}`}
                    icon="overview"
                    tone={grossPnl > 0 ? "positive" : grossPnl < 0 ? "negative" : "neutral"}
                  />
                  <StatCard
                    label="Paid recorded expenses"
                    value={money(totalExpenses)}
                    detail={`${yearExpenses.filter((item) => item.status === "paid").length} expenses marked paid`}
                    icon="expense"
                  />
                  <StatCard
                    label="P&L after expenses"
                    value={money(netAfterExpenses)}
                    detail="Recorded P&L minus paid expenses"
                    icon="overview"
                    tone={netAfterExpenses > 0 ? "positive" : netAfterExpenses < 0 ? "negative" : "neutral"}
                  />
                  <StatCard
                    label="Prop firm costs paid"
                    value={money(propFirmSpend)}
                    detail="Evaluations, resets, and activations"
                    icon="expense"
                  />
                </section>

                <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.9fr)]">
                  <div className="rounded-2xl border border-white/[0.09] bg-white/[0.02] p-4 sm:p-5">
                    <SectionTitle
                      title="Annual performance"
                      description={`Monthly recorded P&L for ${year}. Green is positive; red is negative.`}
                      action={
                        <span className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[10px] text-white/40">
                          {year}
                        </span>
                      }
                    />

                    <div className="mt-5 flex h-52 items-end gap-2 border-b border-white/[0.08] pb-2 sm:h-64 sm:gap-3">
                      {monthlyData.map((item) => {
                        const height = Math.max(
                          item.pnl === 0 ? 0 : 4,
                          (Math.abs(item.pnl) / maxChartValue) * 76,
                        );

                        return (
                          <div
                            key={item.month}
                            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                            title={`${item.label}: ${money(item.pnl)}`}
                          >
                            <div className="flex h-full w-full items-end justify-center">
                              {item.pnl !== 0 && (
                                <div
                                  className={`w-full max-w-8 rounded-t-md ${
                                    item.pnl > 0
                                      ? "bg-emerald-400/80"
                                      : "bg-red-400/80"
                                  }`}
                                  style={{ height: `${height}%` }}
                                />
                              )}
                            </div>
                            <span className="text-[9px] text-white/35 sm:text-[10px]">
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] text-white/40">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-sm bg-emerald-400" />
                        Positive P&L
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-sm bg-red-400" />
                        Negative P&L
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.09] bg-white/[0.02] p-4 sm:p-5">
                    <SectionTitle
                      title="Performance breakdown"
                      description="Calculated from your recorded trades."
                    />

                    <div className="divide-y divide-white/[0.06]">
                      {[
                        ["Trades recorded", String(yearTrades.length)],
                        ["Winning trades", String(wins)],
                        ["Losing trades", String(losses)],
                        ["Win rate", `${winRate.toFixed(1)}%`],
                        [
                          "Profit factor",
                          grossLosses > 0
                            ? profitFactor.toFixed(2)
                            : grossWins > 0
                              ? "∞"
                              : "—",
                        ],
                        [
                          "Average trade",
                          yearTrades.length
                            ? money(grossPnl / yearTrades.length)
                            : money(0),
                        ],
                        ["Gross winning P&L", money(grossWins)],
                        ["Gross losing P&L", `-${money(grossLosses)}`],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-4 py-3"
                        >
                          <span className="text-xs text-white/45">{label}</span>
                          <span
                            className={`text-xs font-medium ${
                              label === "Gross winning P&L"
                                ? "text-emerald-400"
                                : label === "Gross losing P&L"
                                  ? "text-red-400"
                                  : "text-white/80"
                            }`}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.09] bg-white/[0.02] p-4 sm:p-5">
                    <SectionTitle
                      title="Expense breakdown"
                      description="Where your recorded trading costs went."
                      action={
                        <button
                          type="button"
                          onClick={() => setActiveTab("expenses")}
                          className="flex items-center gap-1 text-[11px] text-white/55 hover:text-white"
                        >
                          View expenses <Icon name="arrow" size={13} />
                        </button>
                      }
                    />

                    {categoryTotals.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/[0.1] px-4 py-8 text-center">
                        <p className="text-sm text-white/65">
                          No expenses recorded yet
                        </p>
                        <p className="mt-2 text-xs text-white/35">
                          Add evaluation fees, resets, subscriptions, and other
                          trading costs to see your breakdown.
                        </p>
                        <button
                          type="button"
                          onClick={startNewExpense}
                          className="mt-4 rounded-lg bg-white px-3 py-2 text-xs font-medium text-black"
                        >
                          Add your first expense
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {categoryTotals.map((item) => (
                          <div key={item.category}>
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <span className="text-xs text-white/60">
                                {item.category}
                              </span>
                              <span className="text-xs text-white/80">
                                {money(item.amount)}
                              </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                              <div
                                className="h-full rounded-full bg-white/65"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (item.amount / Math.max(totalExpenses, 1)) *
                                      100,
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/[0.09] bg-white/[0.02] p-4 sm:p-5">
                    <SectionTitle
                      title="Monthly breakdown"
                      description="Recorded P&L, expenses, and P&L after expenses."
                    />

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[440px] text-left">
                        <thead>
                          <tr className="border-b border-white/[0.08] text-[10px] text-white/35">
                            <th className="pb-3 font-medium">Month</th>
                            <th className="pb-3 text-right font-medium">P&L</th>
                            <th className="pb-3 text-right font-medium">Expenses</th>
                            <th className="pb-3 text-right font-medium">Net</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthlyData.map((item) => (
                            <tr
                              key={item.month}
                              className="border-b border-white/[0.045] last:border-0"
                            >
                              <td className="py-2.5 text-xs text-white/60">
                                {item.label}
                              </td>
                              <td
                                className={`py-2.5 text-right text-xs tabular-nums ${
                                  item.pnl > 0
                                    ? "text-emerald-400"
                                    : item.pnl < 0
                                      ? "text-red-400"
                                      : "text-white/45"
                                }`}
                              >
                                {signedMoney(item.pnl)}
                              </td>
                              <td className="py-2.5 text-right text-xs tabular-nums text-white/55">
                                {money(item.expenses)}
                              </td>
                              <td
                                className={`py-2.5 text-right text-xs tabular-nums ${
                                  item.net > 0
                                    ? "text-emerald-400"
                                    : item.net < 0
                                      ? "text-red-400"
                                      : "text-white/45"
                                }`}
                              >
                                {signedMoney(item.net)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-white/[0.1]">
                            <td className="pt-3 text-xs font-semibold text-white">
                              Total
                            </td>
                            <td
                              className={`pt-3 text-right text-xs font-semibold ${
                                grossPnl > 0
                                  ? "text-emerald-400"
                                  : grossPnl < 0
                                    ? "text-red-400"
                                    : "text-white"
                              }`}
                            >
                              {signedMoney(grossPnl)}
                            </td>
                            <td className="pt-3 text-right text-xs font-semibold text-white/70">
                              {money(totalExpenses)}
                            </td>
                            <td
                              className={`pt-3 text-right text-xs font-semibold ${
                                netAfterExpenses > 0
                                  ? "text-emerald-400"
                                  : netAfterExpenses < 0
                                    ? "text-red-400"
                                    : "text-white"
                              }`}
                            >
                              {signedMoney(netAfterExpenses)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </section>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={exportAnnualSummary}
                    className="flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-medium text-black hover:bg-white/90"
                  >
                    <Icon name="download" size={15} />
                    Export annual summary
                  </button>
                  <button
                    type="button"
                    onClick={exportTrades}
                    className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.1] px-4 text-xs text-white/70 hover:bg-white/[0.04]"
                  >
                    <Icon name="download" size={15} />
                    Export trades CSV
                  </button>
                  <button
                    type="button"
                    onClick={exportExpenses}
                    className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.1] px-4 text-xs text-white/70 hover:bg-white/[0.04]"
                  >
                    <Icon name="download" size={15} />
                    Export expenses CSV
                  </button>
                </div>
              </div>
            )}

            {activeTab === "expenses" && (
              <section className="mt-6 space-y-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <StatCard
                    label="Total paid expenses"
                    value={money(totalExpenses)}
                    detail={`Recorded during ${year}`}
                    icon="expense"
                  />
                  <StatCard
                    label="Prop firm spending"
                    value={money(propFirmSpend)}
                    detail="Evaluation, reset, and activation costs"
                    icon="overview"
                  />
                  <StatCard
                    label="Expense entries"
                    value={String(yearExpenses.length)}
                    detail={`${yearExpenses.filter((item) => item.status === "paid").length} marked paid`}
                    icon="report"
                  />
                </div>

                <div className="rounded-2xl border border-white/[0.09] bg-white/[0.02] p-4 sm:p-5">
                  <SectionTitle
                    title="Expense history"
                    description="Track evaluation purchases, resets, activation fees, subscriptions, and other costs."
                    action={
                      <button
                        type="button"
                        onClick={startNewExpense}
                        className="flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-xs font-medium text-black"
                      >
                        <Icon name="plus" size={14} />
                        Add expense
                      </button>
                    }
                  />

                  <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <label className="flex h-10 items-center gap-2 rounded-lg border border-white/[0.09] bg-black/20 px-3">
                      <Icon name="search" size={15} />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search expenses..."
                        className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-white/25"
                      />
                    </label>

                    <select
                      value={categoryFilter}
                      onChange={(event) => setCategoryFilter(event.target.value)}
                      className="h-10 rounded-lg border border-white/[0.09] bg-[#090909] px-3 text-xs text-white/65 outline-none"
                    >
                      <option>All categories</option>
                      {CATEGORIES.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>

                    <select
                      value={monthFilter}
                      onChange={(event) => setMonthFilter(event.target.value)}
                      className="h-10 rounded-lg border border-white/[0.09] bg-[#090909] px-3 text-xs text-white/65 outline-none"
                    >
                      <option value="All months">All months</option>
                      {Array.from({ length: 12 }, (_, month) => (
                        <option key={month} value={String(month + 1)}>
                          {new Date(2000, month, 1).toLocaleDateString("en-US", {
                            month: "long",
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  {filteredExpenses.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/[0.1] px-5 py-12 text-center">
                      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-white/50">
                        <Icon name="expense" size={22} />
                      </span>
                      <h3 className="mt-4 text-sm font-medium">
                        No expenses found
                      </h3>
                      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/40">
                        Add your prop firm evaluation fees, account resets,
                        activation fees, and other trading costs.
                      </p>
                      <button
                        type="button"
                        onClick={startNewExpense}
                        className="mt-5 rounded-lg bg-white px-4 py-2.5 text-xs font-medium text-black"
                      >
                        Add your first expense
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[750px] text-left">
                        <thead>
                          <tr className="border-b border-white/[0.09] text-[10px] uppercase tracking-wider text-white/35">
                            <th className="pb-3 font-medium">Date</th>
                            <th className="pb-3 font-medium">Expense</th>
                            <th className="pb-3 font-medium">Category</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 text-right font-medium">Amount</th>
                            <th className="pb-3 text-right font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredExpenses.map((expense) => (
                            <tr
                              key={expense.id}
                              className="border-b border-white/[0.055] last:border-0"
                            >
                              <td className="py-4 text-xs text-white/45">
                                {expense.expense_date}
                              </td>
                              <td className="py-4">
                                <p className="text-xs font-medium text-white/80">
                                  {expense.description}
                                </p>
                                <p className="mt-1 text-[10px] text-white/35">
                                  {expense.vendor || "No vendor"}
                                </p>
                              </td>
                              <td className="py-4">
                                <span className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-2 py-1 text-[10px] text-white/55">
                                  {expense.category}
                                </span>
                              </td>
                              <td className="py-4 text-xs text-white/50">
                                {expense.status === "paid"
                                  ? "Paid"
                                  : expense.status === "refunded"
                                    ? "Refunded"
                                    : "Pending"}
                              </td>
                              <td className="py-4 text-right text-xs font-medium tabular-nums text-white/85">
                                {money(numeric(expense.amount))}
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => startEditExpense(expense)}
                                    className="rounded-lg border border-white/[0.09] px-2.5 py-1.5 text-[10px] text-white/60 hover:bg-white/[0.05]"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void deleteExpense(expense)}
                                    className="rounded-lg border border-red-400/15 px-2.5 py-1.5 text-[10px] text-red-300/75 hover:bg-red-400/[0.06]"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                    <p className="text-xs text-white/35">
                      Showing {filteredExpenses.length} of {yearExpenses.length}{" "}
                      expenses
                    </p>
                    <button
                      type="button"
                      onClick={exportExpenses}
                      className="flex items-center gap-2 text-xs text-white/65 hover:text-white"
                    >
                      <Icon name="download" size={14} />
                      Export expenses CSV
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
                  <h3 className="text-sm font-medium">Prop firm spending</h3>
                  <p className="mt-1 text-xs leading-5 text-white/40">
                    Use the expense type “Prop firm” for evaluations, resets,
                    and activation fees. Filter by vendor to see how much
                    you have spent with each firm.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/35">
                        Total recorded
                      </p>
                      <p className="mt-1 text-2xl font-semibold">
                        {money(propFirmSpend)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          ...emptyForm(),
                          category: "Evaluation fees",
                          expense_type: "prop_firm",
                        });
                        setEditingExpenseId(null);
                        setShowExpenseForm(true);
                      }}
                      className="rounded-xl border border-white/[0.12] px-4 py-2.5 text-xs text-white/75 hover:bg-white/[0.04]"
                    >
                      Record prop firm fee
                    </button>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "reports" && (
              <section className="mt-6">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold">Reports & exports</h2>
                  <p className="mt-1 text-xs text-white/40">
                    Download the records you've entered for {year}.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {[
                    {
                      title: "Annual activity summary",
                      description:
                        "Recorded P&L, paid expenses, monthly totals, and performance metrics.",
                      action: exportAnnualSummary,
                    },
                    {
                      title: "Trade history",
                      description:
                        "CSV containing recorded trade dates, instruments, results, and P&L.",
                      action: exportTrades,
                    },
                    {
                      title: "Expense ledger",
                      description:
                        "CSV containing expense dates, vendors, categories, amounts, and status.",
                      action: exportExpenses,
                    },
                  ].map((report) => (
                    <div
                      key={report.title}
                      className="flex flex-col justify-between gap-5 rounded-2xl border border-white/[0.09] bg-white/[0.02] p-5 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white/65">
                          <Icon name="report" size={18} />
                        </span>
                        <div>
                          <h3 className="text-sm font-medium">{report.title}</h3>
                          <p className="mt-1 max-w-md text-xs leading-5 text-white/40">
                            {report.description}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={report.action}
                        className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/[0.12] px-4 text-xs text-white/75 hover:bg-white/[0.05]"
                      >
                        <Icon name="download" size={14} />
                        Download CSV
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "documents" && (
              <section className="mt-6 rounded-2xl border border-white/[0.09] bg-white/[0.02] p-5 sm:p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-white/65">
                  <Icon name="report" size={20} />
                </span>
                <h2 className="mt-4 text-lg font-semibold">
                  Trading documents
                </h2>
                <p className="mt-2 max-w-xl text-xs leading-6 text-white/45">
                  Keep statements, receipts, and supporting documents organized
                  with your tax-year records. Document uploads can be added
                  here using a private Supabase Storage bucket.
                </p>
                <div className="mt-5 rounded-xl border border-dashed border-white/[0.12] p-5">
                  <p className="text-sm text-white/75">
                    Document storage is not connected yet.
                  </p>
                  <p className="mt-2 text-xs leading-5 text-white/40">
                    For now, you can export your trade history and expense
                    ledger. Before enabling uploads, configure private storage
                    permissions so receipts and statements are visible only to
                    their owners.
                  </p>
                </div>
              </section>
            )}
          </>
        )}

        <footer className="mt-8 rounded-xl border border-white/[0.08] bg-white/[0.018] p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-white/45">
              <Icon name="report" size={17} />
            </span>
            <div>
              <p className="text-xs font-medium text-white/70">
                Recordkeeping notice
              </p>
              <p className="mt-1 max-w-5xl text-[11px] leading-5 text-white/40">
                TradeMirror summarizes the trade and expense records you enter.
                “P&L after expenses” is an arithmetic recordkeeping figure,
                not taxable income or a determination of deductible expenses.
                Reports may omit records that you have not entered. Consult a
                qualified tax professional about the tax treatment of futures
                trading, prop firm fees, and other expenses.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {showExpenseForm && (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowExpenseForm(false);
            }
          }}
        >
          <div className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-white/[0.12] bg-[#0b0b0b] p-5 shadow-2xl sm:rounded-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                  Tax Center / Expenses
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  {editingExpenseId ? "Edit expense" : "Add expense"}
                </h2>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  Record what you paid so your yearly totals stay organized.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExpenseForm(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] text-white/60 hover:bg-white/[0.05]"
                aria-label="Close expense form"
              >
                <Icon name="close" size={17} />
              </button>
            </div>

            <form onSubmit={saveExpense} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs text-white/55">Date paid</span>
                  <input
                    type="date"
                    required
                    value={form.expense_date}
                    onChange={(event) =>
                      setForm({ ...form, expense_date: event.target.value })
                    }
                    className="h-11 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 text-sm text-white outline-none focus:border-white/30"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs text-white/55">Amount (USD)</span>
                  <div className="flex h-11 items-center rounded-xl border border-white/[0.1] bg-black/30 px-3 focus-within:border-white/30">
                    <span className="text-sm text-white/40">$</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={form.amount}
                      onChange={(event) =>
                        setForm({ ...form, amount: event.target.value })
                      }
                      placeholder="49.00"
                      className="h-full min-w-0 flex-1 bg-transparent pl-2 text-sm outline-none placeholder:text-white/20"
                    />
                  </div>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs text-white/55">Category</span>
                <select
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  className="h-11 w-full rounded-xl border border-white/[0.1] bg-[#101010] px-3 text-sm text-white outline-none focus:border-white/30"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs text-white/55">
                  Expense type
                </span>
                <select
                  value={form.expense_type}
                  onChange={(event) =>
                    setForm({ ...form, expense_type: event.target.value })
                  }
                  className="h-11 w-full rounded-xl border border-white/[0.1] bg-[#101010] px-3 text-sm text-white outline-none focus:border-white/30"
                >
                  <option value="prop_firm">Prop firm</option>
                  <option value="platform">Platform or market data</option>
                  <option value="education">Education</option>
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs text-white/55">
                  Prop firm or vendor (optional)
                </span>
                <input
                  value={form.vendor}
                  onChange={(event) => setForm({ ...form, vendor: event.target.value })}
                  placeholder="e.g. Prop firm, platform, or vendor"
                  className="h-11 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 text-sm outline-none placeholder:text-white/20 focus:border-white/30"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs text-white/55">Description</span>
                <input
                  required
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="e.g. 50K evaluation fee or account reset"
                  className="h-11 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 text-sm outline-none placeholder:text-white/20 focus:border-white/30"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs text-white/55">Payment status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                  className="h-11 w-full rounded-xl border border-white/[0.1] bg-[#101010] px-3 text-sm text-white outline-none focus:border-white/30"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
                </select>
              </label>

              <div className="flex flex-col-reverse gap-2 border-t border-white/[0.08] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowExpenseForm(false)}
                  className="h-11 rounded-xl border border-white/[0.1] px-5 text-xs text-white/65 hover:bg-white/[0.04]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 rounded-xl bg-white px-5 text-xs font-semibold text-black hover:bg-white/90 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingExpenseId
                      ? "Save changes"
                      : "Save expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
