"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, CheckCircle2, Clock, Eye, History, Search, Users, WalletCards, X } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import { useRequireRole } from "../../../lib/hooks";
import { formatCurrency, formatDate } from "../../../lib/format";
import {
  AppShell,
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  StatCard,
  StatusBadge,
  Textarea,
} from "../../../components/ui";

export default function ManagerDashboard() {
  const { ready } = useRequireRole("Manager");
  const [active, setActive] = useState("approvals");
  const [approvals, setApprovals] = useState([]);
  const [teamExpenses, setTeamExpenses] = useState([]);
  const [company, setCompany] = useState({ currency: "USD" });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [actionExpense, setActionExpense] = useState(null);

  const navItems = [
    { key: "approvals", label: "Approval Inbox", icon: CheckCircle2 },
    { key: "team", label: "Team History", icon: History },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/manager/approvals");
      setApprovals(data.approvals || []);
      setTeamExpenses(data.teamExpenses || []);
      setCompany(data.company || { currency: "USD" });
    } catch (error) {
      toast.error(error.message || "Unable to load approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready) loadData();
  }, [ready]);

  const filteredApprovals = useMemo(() => {
    const term = search.toLowerCase();
    return approvals.filter((expense) => {
      return (
        expense.description?.toLowerCase().includes(term) ||
        expense.category?.toLowerCase().includes(term) ||
        expense.employeeId?.name?.toLowerCase().includes(term)
      );
    });
  }, [approvals, search]);

  const stats = useMemo(
    () => ({
      pending: approvals.length,
      total: approvals.reduce((sum, expense) => sum + Number(expense.convertedAmount || expense.amount || 0), 0),
      team: teamExpenses.length,
      approved: teamExpenses.filter((expense) => expense.status === "Approved").length,
    }),
    [approvals, teamExpenses]
  );

  if (!ready) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin"></div>
        <p className="text-sm font-semibold text-slate-400 animate-pulse">Loading workspace...</p>
      </div>
    </div>
  );

  return (
    <AppShell
      role="Manager"
      title="Manager Dashboard"
      subtitle="Review pending approvals from your team and monitor expense history."
      active={active}
      setActive={setActive}
      navItems={navItems}
    >
      <div className="mb-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <StatCard icon={Clock} label="Pending Approvals" value={stats.pending} tone="amber" />
        <StatCard icon={WalletCards} label={`Pending Amount (${company.currency || "USD"})`} value={formatCurrency(stats.total, company.currency || "USD")} tone="teal" />
        <StatCard icon={Users} label="Team Requests" value={stats.team} tone="blue" />
        <StatCard icon={CheckCircle2} label="Approved Team" value={stats.approved} tone="green" />
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        {active === "approvals" ? (
          <Card className="overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Approval Inbox</h2>
                <p className="mt-1 text-sm text-slate-500">Expenses currently waiting for your review.</p>
              </div>
              <div className="relative w-full md:max-w-md">
                <Search className="pointer-events-none absolute left-4 top-3 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search expense, employee, or category..."
                  className="w-full rounded-xl border border-slate-200/80 bg-white/80 py-2.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm backdrop-blur-sm outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                />
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="h-8 w-8 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin"></div>
                  <p className="text-sm font-medium text-slate-500 animate-pulse">Loading inbox...</p>
                </div>
              ) : null}
              {!loading && !filteredApprovals.length ? <EmptyState title="Inbox Zero" description="You're all caught up! No expenses waiting for your approval right now." /> : null}
              <div className="space-y-4">
                {filteredApprovals.map((expense, idx) => (
                  <div key={expense._id} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}>
                    <ApprovalCard expense={expense} onView={setSelected} onAction={setActionExpense} />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ) : (
          <TeamHistory expenses={teamExpenses} loading={loading} />
        )}
      </div>

      {selected ? <ExpenseDetail expense={selected} onClose={() => setSelected(null)} /> : null}
      {actionExpense ? (
        <ActionModal
          expense={actionExpense.expense}
          action={actionExpense.action}
          onClose={() => setActionExpense(null)}
          onSaved={() => {
            setActionExpense(null);
            loadData();
          }}
        />
      ) : null}
    </AppShell>
  );
}

function ApprovalCard({ expense, onView, onAction }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:border-teal-300 hover:shadow-md">
      <div className="absolute left-0 top-0 h-full w-1 bg-amber-400"></div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between ml-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{expense.description}</h3>
            <StatusBadge status={expense.status} />
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
              {expense.category}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-600 font-bold text-[10px]">
                {expense.employeeId?.name?.charAt(0) || "E"}
              </div>
              <span className="font-medium text-slate-700">{expense.employeeId?.name || "Employee"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>{formatDate(expense.date)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="line-through opacity-70">{formatCurrency(expense.amount, expense.currency)}</span>
              <span className="font-extrabold text-slate-900 text-base bg-emerald-50 px-2 py-0.5 rounded text-emerald-700">{formatCurrency(expense.convertedAmount, expense.convertedCurrency)}</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-slate-100 pt-4 lg:border-t-0 lg:pt-0">
          <Button variant="ghost" onClick={() => onView(expense)} className="!px-3 text-slate-500 hover:text-slate-900 bg-slate-50">
            <Eye className="h-4 w-4" />
            Review
          </Button>
          <Button variant="danger" onClick={() => onAction({ expense, action: "Rejected" })} className="!px-3">
            <X className="h-4 w-4" />
            Reject
          </Button>
          <Button variant="success" onClick={() => onAction({ expense, action: "Approved" })} className="!px-5">
            <Check className="h-4 w-4" />
            Approve
          </Button>
        </div>
      </div>
    </article>
  );
}

function TeamHistory({ expenses, loading }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/50 p-6">
        <h2 className="text-lg font-bold text-slate-900">Team Expense History</h2>
        <p className="mt-1 text-sm text-slate-500">A complete log of requests from your assigned team members.</p>
      </div>
      <div className="overflow-x-auto p-2">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-4 font-semibold">Expense</th>
              <th className="px-5 py-4 font-semibold">Employee</th>
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Amount</th>
              <th className="px-5 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((expense, idx) => (
              <tr key={expense._id} className="transition-colors hover:bg-slate-50/50 animate-fade-in" style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}>
                <td className="px-5 py-4">
                  <p className="font-bold text-slate-900">{expense.description}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{expense.category}</p>
                </td>
                <td className="px-5 py-4 font-medium text-slate-700">{expense.employeeId?.name || "-"}</td>
                <td className="px-5 py-4 text-slate-500">{formatDate(expense.date)}</td>
                <td className="px-5 py-4 font-bold text-slate-900">{formatCurrency(expense.convertedAmount || expense.amount, expense.convertedCurrency || expense.currency)}</td>
                <td className="px-5 py-4"><StatusBadge status={expense.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && !expenses.length ? <div className="p-8"><EmptyState title="No team history yet" description="Team expenses will appear after employees submit requests." /></div> : null}
    </Card>
  );
}

function ExpenseDetail({ expense, onClose }) {
  return (
    <Modal title="Expense Details" description={`${expense.employeeId?.name || "Employee"} · ${expense.category}`} onClose={onClose}>
      <div className="mb-6 rounded-xl bg-slate-50 p-5 border border-slate-100">
        <h3 className="text-xl font-bold text-slate-900">{expense.description}</h3>
        <div className="mt-2 flex items-center gap-3">
          <StatusBadge status={expense.status} />
          <span className="text-sm font-medium text-slate-500">{formatDate(expense.date)}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Detail label="Requested Amount" value={formatCurrency(expense.amount, expense.currency)} />
        <Detail label="Company Currency" value={formatCurrency(expense.convertedAmount, expense.convertedCurrency)} highlight />
        <Detail label="Category" value={expense.category} />
        <Detail label="Paid By" value={expense.paidBy || expense.employeeId?.name || "-"} />
      </div>

      {expense.remarks ? (
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Employee Remarks</p>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed italic">&quot;{expense.remarks}&quot;</p>
        </div>
      ) : null}

      <div className="mt-8">
        <h3 className="mb-4 text-sm font-bold tracking-wide text-slate-900 uppercase">Approval Timeline</h3>
        <div className="space-y-4">
          {(expense.approvalSteps || []).map((step, index) => (
            <div key={`${step._id || index}`} className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-[-24px] before:w-px before:bg-slate-200 last:before:hidden">
              <div className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-white shadow-sm ${step.status === 'Approved' ? 'bg-emerald-500' : step.status === 'Rejected' ? 'bg-red-500' : 'bg-slate-300'}`}></div>
              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Step {index + 1}</p>
                    <p className="font-bold text-slate-900">{step.approverName || step.approverId?.name || "Approver"}</p>
                  </div>
                  <Badge tone={step.status === "Approved" ? "green" : step.status === "Rejected" ? "red" : "amber"}>{step.status}</Badge>
                </div>
                {step.comment ? (
                  <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-700">Comment:</span> {step.comment}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {(!expense.approvalSteps || expense.approvalSteps.length === 0) && (
            <p className="text-sm text-slate-500 italic">No timeline data available.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

function Detail({ label, value, highlight }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-teal-200 bg-teal-50/50' : 'border-slate-100 bg-white'}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 font-extrabold ${highlight ? 'text-2xl text-teal-900' : 'text-lg text-slate-900'}`}>{value || "-"}</p>
    </div>
  );
}

function ActionModal({ expense, action, onClose, onSaved }) {
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    try {
      setSaving(true);
      await apiFetch(`/manager/approvals/${expense._id}/action`, {
        method: "POST",
        body: { action, comment },
      });
      toast.success(`Expense ${action.toLowerCase()} successfully`);
      onSaved();
    } catch (error) {
      toast.error(error.message || "Unable to update expense");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`${action === "Approved" ? "Approve" : "Reject"} Expense`}
      description={`Reviewing: ${expense.description}`}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant={action === "Approved" ? "success" : "danger"} onClick={submit} disabled={saving || (action === "Rejected" && comment.length < 5)}>
            {saving ? "Processing..." : `Confirm ${action}`}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {action === "Rejected" && (
          <div className="rounded-xl bg-red-50 p-4 border border-red-100">
            <p className="text-sm text-red-800">You must provide a reason when rejecting an expense so the employee knows what to fix.</p>
          </div>
        )}
        <Textarea 
          label={`Add a comment ${action === "Rejected" ? "(Required)" : "(Optional)"}`} 
          rows={4} 
          value={comment} 
          onChange={(event) => setComment(event.target.value)} 
          placeholder={`Why are you ${action.toLowerCase()}ing this?`}
        />
      </div>
    </Modal>
  );
}
