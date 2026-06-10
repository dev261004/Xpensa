"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, Clock, FileText, Plus, ReceiptText, Upload, WalletCards, XCircle } from "lucide-react";
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
    { key: "all", label: "All expenses", icon: ReceiptText },
    { key: "draft", label: "Drafts", icon: FileText },
    { key: "waiting-approval", label: "Waiting approval", icon: Clock },
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
      toast.success("Expense submitted for approval");
      loadExpenses();
    } catch (error) {
      toast.error(error.message || "Unable to submit expense");
    }
  };

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">Loading workspace...</div>;

  return (
    <AppShell
      role="Employee"
      title="Employee dashboard"
      subtitle="Create expense claims, scan receipts, and track approval progress."
      active={active}
      setActive={setActive}
      navItems={navItems}
    >
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard icon={ReceiptText} label="Total expenses" value={stats.total} tone="blue" />
        <StatCard icon={Clock} label="Waiting" value={stats.waiting} tone="amber" />
        <StatCard icon={CheckCircle2} label="Approved" value={stats.approved} tone="green" />
        <StatCard icon={WalletCards} label="Tracked amount" value={formatCurrency(stats.amount, stats.currency)} tone="teal" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-950">Expenses</h2>
            <p className="text-sm text-slate-500">Draft first, then submit when your claim is ready.</p>
          </div>
          <Button onClick={() => setShowExpenseModal(true)}>
            <Plus className="h-4 w-4" />
            New expense
          </Button>
        </div>
        <div className="p-4">
          {loading ? <p className="text-sm text-slate-500">Loading expenses...</p> : null}
          {!loading && !filtered.length ? (
            <EmptyState title="No expenses found" description="Create a draft expense or switch status filters." action={<Button onClick={() => setShowExpenseModal(true)}>New expense</Button>} />
          ) : null}
          <div className="space-y-3">
            {filtered.map((expense) => (
              <ExpenseRow key={expense._id} expense={expense} onSubmit={submitExpense} />
            ))}
          </div>
        </div>
      </Card>

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
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-950">{expense.description}</h3>
            <StatusBadge status={expense.status} />
            {expense.receipt?.filename ? <Badge tone="teal">Receipt</Badge> : null}
          </div>
          <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
            <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatDate(expense.date)}</span>
            <span>{expense.category}</span>
            <span>{formatCurrency(expense.amount, expense.currency)}</span>
            <span>{expense.convertedAmount ? formatCurrency(expense.convertedAmount, expense.convertedCurrency) : "Not converted yet"}</span>
          </div>
          {expense.remarks ? <p className="mt-3 text-sm text-slate-600">{expense.remarks}</p> : null}
          <ApprovalTimeline steps={expense.approvalSteps || []} />
        </div>
        <div className="flex shrink-0 gap-2">
          {expense.status === "Draft" ? <Button onClick={() => onSubmit(expense)}>Submit</Button> : null}
        </div>
      </div>
    </article>
  );
}

function ApprovalTimeline({ steps }) {
  if (!steps.length) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {steps.map((step, index) => (
        <div key={`${step.approverId?._id || step.approverId}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
          <p className="font-semibold text-slate-900">Step {index + 1}: {step.approverName || step.approverId?.name || "Approver"}</p>
          <p className="mt-0.5 text-slate-500">{step.status}{step.required ? " · required" : ""}</p>
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
      toast.success("Receipt scanned. Review the fields before saving.");
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
        toast.success("Expense saved and submitted");
      } else {
        toast.success("Expense draft saved");
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
      title="Create expense"
      description="Upload a receipt for OCR, then review and edit every field before saving."
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="secondary" onClick={handleSubmit((values) => save(values, false))} disabled={saving}>Save draft</Button>
          <Button onClick={handleSubmit((values) => save(values, true))} disabled={saving}>{saving ? "Saving..." : "Save & submit"}</Button>
        </div>
      }
    >
      <div className="mb-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700">
          <Upload className="h-5 w-5 text-teal-700" />
          <span>{ocrLoading ? "Scanning receipt..." : "Upload receipt for OCR"}</span>
          <input type="file" accept="image/*,.pdf" className="hidden" onChange={scanReceipt} disabled={ocrLoading} />
        </label>
        {receiptData?.ocr?.extracted?.vendor ? <p className="mt-2 text-xs text-slate-500">Detected vendor: {receiptData.ocr.extracted.vendor}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Input label="Description" error={errors.description?.message} {...register("description")} />
        </div>
        <Input label="Date" type="date" error={errors.date?.message} {...register("date")} />
        <Select label="Category" error={errors.category?.message} {...register("category")}>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </Select>
        <Input label="Amount" type="number" step="0.01" error={errors.amount?.message} {...register("amount")} />
        <Select label="Currency" error={errors.currency?.message} {...register("currency")}>
          {currencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
        </Select>
        <div className="md:col-span-2">
          <Textarea label="Remarks" rows={3} error={errors.remarks?.message} {...register("remarks")} />
        </div>
      </div>
    </Modal>
  );
}
