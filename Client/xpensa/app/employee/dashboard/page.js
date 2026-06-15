"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, Clock, FileText, Plus, ReceiptText, Upload, WalletCards, XCircle, Send } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import { useRequireRole } from "../../../lib/hooks";
import { formatCurrency, formatDate, statusKey } from "../../../lib/format";
import { expenseSchema } from "../../../lib/validators";
import {
  AppShell,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Select,
  StatCard,
  StatusBadge,
  Textarea,
} from "../../../components/ui";

const categories = ["Food", "Travel", "Office", "Accommodation", "Software", "Other"];
const currencies = ["INR", "USD", "EUR", "GBP", "AUD", "CAD", "SGD"];

export default function EmployeeDashboard() {
  const { ready } = useRequireRole("Employee");
  const [active, setActive] = useState("all");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const navItems = [
    { key: "all", label: "All Expenses", icon: ReceiptText },
    { key: "draft", label: "Drafts", icon: FileText },
    { key: "waiting-approval", label: "In Review", icon: Clock },
    { key: "approved", label: "Approved", icon: CheckCircle2 },
    { key: "rejected", label: "Rejected", icon: XCircle },
  ];

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setExpenses(await apiFetch("/expenses"));
    } catch (error) {
      toast.error(error.message || "Unable to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready) loadExpenses();
  }, [ready]);

  const filtered = useMemo(() => {
    if (active === "all") return expenses;
    return expenses.filter((expense) => statusKey(expense.status) === active);
  }, [active, expenses]);

  const stats = useMemo(
    () => ({
      total: expenses.length,
      waiting: expenses.filter((expense) => expense.status === "Waiting approval").length,
      approved: expenses.filter((expense) => expense.status === "Approved").length,
      amount: expenses.reduce((sum, expense) => sum + Number(expense.convertedAmount || expense.amount || 0), 0),
      currency: expenses.find((expense) => expense.convertedCurrency)?.convertedCurrency || expenses[0]?.currency || "USD",
    }),
    [expenses]
  );

  const submitExpense = async (expense) => {
    try {
      await apiFetch(`/expenses/${expense._id}/submit`, { method: "POST" });
      toast.success("Expense submitted successfully. It is now in review.");
      loadExpenses();
    } catch (error) {
      toast.error(error.message || "Unable to submit expense");
    }
  };

  if (!ready) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin"></div>
        <p className="text-sm font-semibold text-slate-400 animate-pulse">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <AppShell
      role="Employee"
      title="My Expenses"
      subtitle="Track your spending, upload receipts, and monitor approval status."
      active={active}
      setActive={setActive}
      navItems={navItems}
    >
      <div className="mb-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <StatCard icon={ReceiptText} label="Total Expenses" value={stats.total} tone="blue" />
        <StatCard icon={Clock} label="In Review" value={stats.waiting} tone="amber" />
        <StatCard icon={CheckCircle2} label="Approved" value={stats.approved} tone="green" />
        <StatCard icon={WalletCards} label={`Total Value (${stats.currency})`} value={formatCurrency(stats.amount, stats.currency)} tone="teal" />
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{navItems.find((n) => n.key === active)?.label || "Expenses"}</h2>
              <p className="mt-1 text-sm text-slate-500">Manage your claims and view their history.</p>
            </div>
            <Button onClick={() => setShowExpenseModal(true)} className="group animate-pulse-slow hover:animate-none shadow-lg shadow-teal-500/20">
              <Plus className="h-5 w-5 transition-transform group-hover:rotate-90 duration-300" />
              Submit New Expense
            </Button>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="h-8 w-8 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin"></div>
                <p className="text-sm font-medium text-slate-500 animate-pulse">Loading records...</p>
              </div>
            ) : null}
            {!loading && !filtered.length ? (
              <EmptyState 
                title="No expenses found" 
                description={`You don't have any expenses in the '${active}' category yet.`} 
                action={<Button onClick={() => setShowExpenseModal(true)}>Create One Now</Button>} 
              />
            ) : null}
            <div className="space-y-5">
              {filtered.map((expense, idx) => (
                <div key={expense._id} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}>
                  <ExpenseRow expense={expense} onSubmit={submitExpense} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {showExpenseModal ? (
        <ExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onSaved={() => {
            setShowExpenseModal(false);
            loadExpenses();
          }}
        />
      ) : null}
    </AppShell>
  );
}

function ExpenseRow({ expense, onSubmit }) {
  const statusColorMap = {
    "Approved": "bg-emerald-50 border-emerald-200 shadow-emerald-900/5",
    "Rejected": "bg-red-50 border-red-200 shadow-red-900/5",
    "Waiting approval": "bg-amber-50/50 border-amber-200/50 shadow-amber-900/5",
    "Draft": "bg-slate-50/50 border-slate-200 shadow-slate-900/5",
  };
  
  const cardColorClass = statusColorMap[expense.status] || statusColorMap["Draft"];

  return (
    <article className={`group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md ${cardColorClass}`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900">{expense.description}</h3>
            <StatusBadge status={expense.status} />
            {expense.receipt?.filename ? <Badge tone="teal" className="!py-1 shadow-sm">Receipt Attached</Badge> : null}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white border border-slate-200 shadow-sm text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium text-slate-700">{formatDate(expense.date)}</span>
            </div>
            <span className="inline-flex items-center rounded-md bg-white px-2 py-1 font-medium shadow-sm border border-slate-100">{expense.category}</span>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-base">{formatCurrency(expense.amount, expense.currency)}</span>
              {expense.convertedAmount && (
                <span className="text-xs font-semibold text-slate-400">({formatCurrency(expense.convertedAmount, expense.convertedCurrency)})</span>
              )}
            </div>
          </div>
          {expense.remarks ? (
            <div className="mt-4 border-l-2 border-slate-300 pl-3">
              <p className="text-sm italic text-slate-500">"{expense.remarks}"</p>
            </div>
          ) : null}
          <ApprovalTimeline steps={expense.approvalSteps || []} />
        </div>
        <div className="flex shrink-0 gap-3 border-t border-slate-200/60 pt-4 lg:border-t-0 lg:pt-0">
          {expense.status === "Draft" ? (
            <Button onClick={() => onSubmit(expense)} className="!px-5 w-full lg:w-auto shadow-md">
              <Send className="h-4 w-4" />
              Submit for Approval
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ApprovalTimeline({ steps }) {
  if (!steps.length) return null;
  return (
    <div className="mt-5 flex flex-wrap gap-3">
      {steps.map((step, index) => (
        <div key={`${step.approverId?._id || step.approverId}-${index}`} className="flex items-center gap-3 rounded-xl border border-white/60 bg-white/60 p-3 shadow-sm backdrop-blur-sm transition hover:bg-white/90">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm ${step.status === 'Approved' ? 'bg-emerald-500' : step.status === 'Rejected' ? 'bg-red-500' : 'bg-slate-400'}`}>
            {index + 1}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{step.approverName || step.approverId?.name || "Approver"}</p>
            <p className="text-xs font-medium text-slate-500">{step.status}{step.required ? " · Required" : ""}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExpenseModal({ onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      date: new Date().toISOString().slice(0, 10),
      category: "Food",
      amount: "",
      currency: "INR",
      remarks: "",
    },
  });

  const scanReceipt = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const body = new FormData();
    body.append("receipt", file);

    try {
      setOcrLoading(true);
      const data = await apiFetch("/expenses/ocr", { method: "POST", body });
      setReceiptData(data);
      const extracted = data.ocr?.extracted || {};
      if (extracted.amount) setValue("amount", extracted.amount);
      if (extracted.description) setValue("description", extracted.description);
      if (extracted.category) setValue("category", extracted.category);
      if (extracted.date) setValue("date", new Date(extracted.date).toISOString().slice(0, 10));
      toast.success("Receipt scanned. We've filled in what we could. Please review.");
    } catch (error) {
      toast.error(error.message || "Receipt scan failed");
    } finally {
      setOcrLoading(false);
    }
  };

  const save = async (values, submitAfterSave) => {
    try {
      setSaving(true);
      const expense = await apiFetch("/expenses", {
        method: "POST",
        body: {
          ...values,
          receipt: receiptData?.receipt,
          ocr: receiptData?.ocr,
        },
      });

      if (submitAfterSave) {
        await apiFetch(`/expenses/${expense._id}/submit`, { method: "POST" });
        toast.success("Awesome! Expense saved and submitted for review.");
      } else {
        toast.success("Draft saved. You can submit it later.");
      }
      onSaved();
    } catch (error) {
      toast.error(error.message || "Unable to save expense");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Create New Claim"
      description="Start by uploading a receipt, or fill out the details manually."
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="secondary" onClick={handleSubmit((values) => save(values, false))} disabled={saving || ocrLoading}>Save as Draft</Button>
          <Button onClick={handleSubmit((values) => save(values, true))} disabled={saving || ocrLoading}>{saving ? "Saving..." : "Save & Submit"}</Button>
        </div>
      }
    >
      <div className="mb-8 relative overflow-hidden rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/50 p-8 text-center transition hover:border-teal-400 hover:bg-teal-50 group">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 opacity-0 transition-opacity group-hover:opacity-100"></div>
        <label className="relative flex cursor-pointer flex-col items-center justify-center gap-3">
          <div className="rounded-full bg-white p-4 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
            <Upload className={`h-8 w-8 text-teal-600 ${ocrLoading ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <p className="text-base font-bold text-slate-800">{ocrLoading ? "Scanning your receipt magically..." : "Upload Receipt for Magic Scan"}</p>
            <p className="mt-1 text-sm text-slate-500">Supports JPG, PNG, and PDF up to 5MB</p>
          </div>
          <input type="file" accept="image/*,.pdf" className="hidden" onChange={scanReceipt} disabled={ocrLoading} />
        </label>
        {receiptData?.ocr?.extracted?.vendor ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-100/50 px-3 py-1.5 text-sm font-semibold text-teal-800 backdrop-blur-sm">
            <CheckCircle2 className="h-4 w-4" /> Detected Vendor: {receiptData.ocr.extracted.vendor}
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <Input label="What was this for? (Description)" error={errors.description?.message} {...register("description")} placeholder="e.g. Client lunch at Joe's" />
        </div>
        <Input label="Date of Expense" type="date" error={errors.date?.message} {...register("date")} />
        <Select label="Category" error={errors.category?.message} {...register("category")}>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </Select>
        <Input label="Amount" type="number" step="0.01" error={errors.amount?.message} {...register("amount")} placeholder="0.00" />
        <Select label="Currency" error={errors.currency?.message} {...register("currency")}>
          {currencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
        </Select>
        <div className="md:col-span-2">
          <Textarea label="Additional Remarks (Optional)" rows={3} error={errors.remarks?.message} {...register("remarks")} placeholder="Any extra context for your manager?" />
        </div>
      </div>
    </Modal>
  );
}
