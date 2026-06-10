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
    { key: "approvals", label: "Approval inbox", icon: CheckCircle2 },
    { key: "team", label: "Team history", icon: History },
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

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">Loading workspace...</div>;

  return (
    <AppShell
      role="Manager"
      title="Manager dashboard"
      subtitle="Review assigned approvals and monitor team expense history."
      active={active}
      setActive={setActive}
      navItems={navItems}
    >
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard icon={Clock} label="Pending approvals" value={stats.pending} tone="amber" />
        <StatCard icon={WalletCards} label={`Pending amount (${company.currency || "USD"})`} value={formatCurrency(stats.total, company.currency || "USD")} tone="teal" />
        <StatCard icon={Users} label="Team requests" value={stats.team} tone="blue" />
        <StatCard icon={CheckCircle2} label="Approved team" value={stats.approved} tone="green" />
      </div>

      {active === "approvals" ? (
        <Card>
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-bold text-slate-950">Approval inbox</h2>
              <p className="text-sm text-slate-500">Only expenses currently assigned to you appear here.</p>
            </div>
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search expense, employee, category"
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>
          <div className="p-4">
            {loading ? <p className="text-sm text-slate-500">Loading approvals...</p> : null}
            {!loading && !filteredApprovals.length ? <EmptyState title="No approvals waiting" description="When an expense reaches your step, it will appear here." /> : null}
            <div className="space-y-3">
              {filteredApprovals.map((expense) => (
                <ApprovalCard key={expense._id} expense={expense} onView={setSelected} onAction={setActionExpense} />
              ))}
            </div>
          </div>
        </Card>
      ) : (
        <TeamHistory expenses={teamExpenses} loading={loading} />
      )}

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
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-950">{expense.description}</h3>
            <StatusBadge status={expense.status} />
            <Badge tone="blue">{expense.category}</Badge>
          </div>
          <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
            <span>{expense.employeeId?.name || "Employee"}</span>
            <span>{formatDate(expense.date)}</span>
            <span>{formatCurrency(expense.amount, expense.currency)}</span>
            <span className="font-semibold text-slate-900">{formatCurrency(expense.convertedAmount, expense.convertedCurrency)}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="secondary" onClick={() => onView(expense)}>
            <Eye className="h-4 w-4" />
            Details
          </Button>
          <Button variant="success" onClick={() => onAction({ expense, action: "Approved" })}>
            <Check className="h-4 w-4" />
            Approve
          </Button>
          <Button variant="danger" onClick={() => onAction({ expense, action: "Rejected" })}>
            <X className="h-4 w-4" />
            Reject
          </Button>
        </div>
      </div>
    </article>
  );
}

function TeamHistory({ expenses, loading }) {
  return (
    <Card>
      <div className="border-b border-slate-200 p-4">
        <h2 className="font-bold text-slate-950">Team expense history</h2>
        <p className="text-sm text-slate-500">Recent requests from employees assigned to you.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Expense</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((expense) => (
              <tr key={expense._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-900">{expense.description}</td>
                <td className="px-4 py-3 text-slate-600">{expense.employeeId?.name || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(expense.date)}</td>
                <td className="px-4 py-3">{formatCurrency(expense.convertedAmount || expense.amount, expense.convertedCurrency || expense.currency)}</td>
                <td className="px-4 py-3"><StatusBadge status={expense.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && !expenses.length ? <div className="p-4"><EmptyState title="No team history yet" description="Team expenses will appear after employees create requests." /></div> : null}
    </Card>
  );
}

function ExpenseDetail({ expense, onClose }) {
  return (
    <Modal title={expense.description} description={`${expense.employeeId?.name || "Employee"} · ${expense.category}`} onClose={onClose}>
      <div className="grid gap-4 md:grid-cols-2">
        <Detail label="Original amount" value={formatCurrency(expense.amount, expense.currency)} />
        <Detail label="Company amount" value={formatCurrency(expense.convertedAmount, expense.convertedCurrency)} />
        <Detail label="Expense date" value={formatDate(expense.date)} />
        <Detail label="Paid by" value={expense.paidBy || expense.employeeId?.name || "-"} />
      </div>
      {expense.remarks ? <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{expense.remarks}</p> : null}
      <div className="mt-5">
        <h3 className="mb-3 text-sm font-bold text-slate-900">Approval timeline</h3>
        <div className="space-y-2">
          {(expense.approvalSteps || []).map((step, index) => (
            <div key={`${step._id || index}`} className="rounded-lg border border-slate-200 p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">Step {index + 1}: {step.approverName || step.approverId?.name || "Approver"}</p>
                <Badge tone={step.status === "Approved" ? "green" : step.status === "Rejected" ? "red" : "amber"}>{step.status}</Badge>
              </div>
              {step.comment ? <p className="mt-2 text-slate-600">{step.comment}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-slate-950">{value || "-"}</p>
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
      toast.success(`Expense ${action.toLowerCase()}`);
      onSaved();
    } catch (error) {
      toast.error(error.message || "Unable to update expense");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`${action === "Approved" ? "Approve" : "Reject"} expense`}
      description={expense.description}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={action === "Approved" ? "success" : "danger"} onClick={submit} disabled={saving || comment.length < 2}>
            {saving ? "Saving..." : action}
          </Button>
        </div>
      }
    >
      <Textarea label="Comment" rows={4} value={comment} onChange={(event) => setComment(event.target.value)} />
    </Modal>
  );
}
