"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Layers3,
  Pencil,
  PieChart,
  Plus,
  RefreshCw,
  Settings2,
  TrendingUp,
  Trash2,
  Users,
  WalletCards,
} from "lucide-react";
import { apiFetch } from "../../../lib/api";
import { useRequireRole } from "../../../lib/hooks";
import { formatCurrency, formatDate } from "../../../lib/format";
import { userSchema } from "../../../lib/validators";
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

const initialUserForm = { name: "", email: "", role: "Employee", managerId: "" };

export default function AdminDashboard() {
  const { ready } = useRequireRole("Admin");
  const [active, setActive] = useState("overview");
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [rule, setRule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userModal, setUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [overrideExpense, setOverrideExpense] = useState(null);

  const navItems = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "users", label: "Users", icon: Users },
    { key: "rules", label: "Approval rules", icon: Settings2 },
    { key: "expenses", label: "All expenses", icon: ClipboardList },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, managersData, ruleData, expensesData] = await Promise.all([
        apiFetch("/admin/users"),
        apiFetch("/admin/managers"),
        apiFetch("/admin/approval-rule"),
        apiFetch("/admin/expenses"),
      ]);
      setUsers(usersData);
      setManagers(managersData);
      setRule(normalizeRule(ruleData));
      setExpenses(expensesData);
    } catch (error) {
      toast.error(error.message || "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready) loadData();
  }, [ready]);

  const stats = useMemo(
    () => ({
      employees: users.filter((user) => user.role === "Employee" && user.isActive).length,
      managers: users.filter((user) => user.role === "Manager" && user.isActive).length,
      pending: expenses.filter((expense) => expense.status === "Waiting approval").length,
      approved: expenses.filter((expense) => expense.status === "Approved").length,
      spend: expenses
        .filter((expense) => expense.status === "Approved")
        .reduce((sum, expense) => sum + expenseAmount(expense), 0),
      currency: companyCurrency(expenses),
    }),
    [expenses, users]
  );

  if (!ready) return <LoadingScreen />;

  return (
    <AppShell
      role="Admin"
      title="Admin Dashboard"
      subtitle="Manage users, approval rules, and oversee company expenses with ease."
      active={active}
      setActive={setActive}
      navItems={navItems}
    >
      <div className="mb-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <StatCard icon={Users} label="Active Employees" value={stats.employees} tone="blue" />
        <StatCard icon={Users} label="Active Managers" value={stats.managers} tone="teal" />
        <StatCard icon={RefreshCw} label="Pending Approvals" value={stats.pending} tone="amber" />
        <StatCard icon={WalletCards} label="Approved Spend" value={formatCurrency(stats.spend, stats.currency)} tone="green" />
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        {loading ? <LoadingPanel /> : null}
        {!loading && active === "overview" ? <OverviewPanel expenses={expenses} /> : null}
        {!loading && active === "users" ? (
          <UsersPanel
            users={users}
            managers={managers}
            onRefresh={loadData}
            onCreate={() => {
              setEditingUser(null);
              setUserModal(true);
            }}
            onEdit={(user) => {
              setEditingUser(user);
              setUserModal(true);
            }}
          />
        ) : null}
        {!loading && active === "rules" && rule ? <RulePanel rule={rule} setRule={setRule} managers={managers} onSaved={loadData} /> : null}
        {!loading && active === "expenses" ? <ExpensesPanel expenses={expenses} onOverride={setOverrideExpense} /> : null}
      </div>

      {userModal ? (
        <UserModal
          user={editingUser}
          managers={managers}
          onClose={() => setUserModal(false)}
          onSaved={() => {
            setUserModal(false);
            loadData();
          }}
        />
      ) : null}

      {overrideExpense ? (
        <OverrideModal
          expense={overrideExpense}
          onClose={() => setOverrideExpense(null)}
          onSaved={() => {
            setOverrideExpense(null);
            loadData();
          }}
        />
      ) : null}
    </AppShell>
  );
}

function normalizeRule(rule) {
  return {
    managerFirst: rule?.managerFirst ?? true,
    ruleType: rule?.ruleType || "percentage",
    minimumPercentage: rule?.minimumPercentage || 100,
    specificApproverId: rule?.specificApproverId?._id || rule?.specificApproverId || "",
    isActive: rule?.isActive ?? true,
    approvers: (rule?.approvers || []).map((item, index) => ({
      userId: item.userId?._id || item.userId || "",
      sequence: item.sequence || index + 1,
      required: Boolean(item.required),
    })),
  };
}

function expenseAmount(expense) {
  return Number(expense.convertedAmount || expense.amount || 0);
}

function companyCurrency(expenses) {
  return expenses.find((expense) => expense.convertedCurrency)?.convertedCurrency || expenses[0]?.currency || "USD";
}

function employeeName(expense) {
  return expense.employeeId?.name || expense.employee?.name || "Unassigned";
}

function monthLabel(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

function buildAnalytics(expenses) {
  const currency = companyCurrency(expenses);
  const approvedExpenses = expenses.filter((expense) => expense.status === "Approved");
  const spendBase = approvedExpenses.length ? approvedExpenses : expenses;

  const statusConfig = [
    { key: "Approved", label: "Approved", color: "#10b981", tone: "green" },
    { key: "Waiting approval", label: "Waiting", color: "#f59e0b", tone: "amber" },
    { key: "Rejected", label: "Rejected", color: "#ef4444", tone: "red" },
    { key: "Draft", label: "Draft", color: "#64748b", tone: "slate" },
  ];

  const statusData = statusConfig.map((item) => {
    const items = expenses.filter((expense) => expense.status === item.key);
    return {
      ...item,
      count: items.length,
      amount: items.reduce((sum, expense) => sum + expenseAmount(expense), 0),
    };
  });

  const categoryMap = new Map();
  spendBase.forEach((expense) => {
    const key = expense.category || "Other";
    const current = categoryMap.get(key) || { category: key, amount: 0, count: 0 };
    categoryMap.set(key, {
      ...current,
      amount: current.amount + expenseAmount(expense),
      count: current.count + 1,
    });
  });

  const monthlyMap = new Map();
  expenses.forEach((expense) => {
    const key = monthLabel(expense.date || expense.createdAt);
    const current = monthlyMap.get(key) || { month: key, amount: 0, count: 0 };
    monthlyMap.set(key, {
      ...current,
      amount: current.amount + expenseAmount(expense),
      count: current.count + 1,
    });
  });

  const employeeMap = new Map();
  spendBase.forEach((expense) => {
    const key = employeeName(expense);
    const current = employeeMap.get(key) || { name: key, amount: 0, count: 0 };
    employeeMap.set(key, {
      ...current,
      amount: current.amount + expenseAmount(expense),
      count: current.count + 1,
    });
  });

  return {
    currency,
    totalSubmitted: expenses.reduce((sum, expense) => sum + expenseAmount(expense), 0),
    approvedSpend: approvedExpenses.reduce((sum, expense) => sum + expenseAmount(expense), 0),
    pendingSpend: expenses
      .filter((expense) => expense.status === "Waiting approval")
      .reduce((sum, expense) => sum + expenseAmount(expense), 0),
    rejectedSpend: expenses.filter((expense) => expense.status === "Rejected").reduce((sum, expense) => sum + expenseAmount(expense), 0),
    statusData,
    categoryData: [...categoryMap.values()].sort((a, b) => b.amount - a.amount).slice(0, 6),
    monthlyData: [...monthlyMap.values()].slice(-6),
    topEmployees: [...employeeMap.values()].sort((a, b) => b.amount - a.amount).slice(0, 5),
    spendBaseLabel: approvedExpenses.length ? "approved spend" : "submitted spend",
  };
}

function formatCompactAmount(amount, currency) {
  const value = Number(amount || 0);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    return `${value.toFixed(0)} ${currency}`;
  }
}

function OverviewPanel({ expenses }) {
  const analytics = useMemo(() => buildAnalytics(expenses), [expenses]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-900 bg-slate-950 text-white shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-xs font-bold text-teal-100">
              <BarChart3 className="h-3.5 w-3.5" />
              Company expense intelligence
            </div>
            <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-normal">
              Spend visibility for approvals, categories, and team behavior.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Monitor how much the company has submitted, approved, rejected, and where expenses are concentrated.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <HeroMetric label="Submitted" value={formatCurrency(analytics.totalSubmitted, analytics.currency)} />
            <HeroMetric label="Approved" value={formatCurrency(analytics.approvedSpend, analytics.currency)} />
            <HeroMetric label="Pending" value={formatCurrency(analytics.pendingSpend, analytics.currency)} />
            <HeroMetric label="Rejected" value={formatCurrency(analytics.rejectedSpend, analytics.currency)} />
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-950">Expense Status</h3>
              <p className="text-sm text-slate-500">Approved, rejected, waiting, and draft requests.</p>
            </div>
            <PieChart className="h-5 w-5 text-teal-700" />
          </div>
          <StatusDonut data={analytics.statusData} />
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-950">Category-wise Spend</h3>
              <p className="text-sm text-slate-500">Based on {analytics.spendBaseLabel}.</p>
            </div>
            <Layers3 className="h-5 w-5 text-blue-700" />
          </div>
          <CategoryBars data={analytics.categoryData} currency={analytics.currency} />
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-950">Monthly Spend Trend</h3>
              <p className="text-sm text-slate-500">Submitted expense amount across recent months.</p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-700" />
          </div>
          <TrendChart data={analytics.monthlyData} currency={analytics.currency} />
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-950">Top Employees</h3>
              <p className="text-sm text-slate-500">Highest {analytics.spendBaseLabel} contributors.</p>
            </div>
            <Users className="h-5 w-5 text-indigo-700" />
          </div>
          <TopEmployees employees={analytics.topEmployees} currency={analytics.currency} />
        </Card>
      </div>

      {!expenses.length ? (
        <EmptyState
          title="No expense analytics yet"
          description="Charts will populate automatically when employees start submitting expenses."
        />
      ) : null}
    </div>
  );
}

function HeroMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-300">{label}</p>
      <p className="mt-2 break-words text-xl font-black text-white">{value}</p>
    </div>
  );
}

function StatusDonut({ data }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  let cursor = 0;
  const gradient = total
    ? `conic-gradient(${data
        .filter((item) => item.count > 0)
        .map((item) => {
          const start = cursor;
          const end = cursor + (item.count / total) * 100;
          cursor = end;
          return `${item.color} ${start}% ${end}%`;
        })
        .join(", ")})`
    : "conic-gradient(#e2e8f0 0% 100%)";

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
      <div className="relative mx-auto h-52 w-52 rounded-full shadow-inner" style={{ background: gradient }}>
        <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-sm">
          <p className="text-3xl font-black text-slate-950">{total}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Expenses</p>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.key} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <div>
                <p className="font-bold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.count} request{item.count === 1 ? "" : "s"}</p>
              </div>
            </div>
            <Badge tone={item.tone}>{item.count}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryBars({ data, currency }) {
  const max = Math.max(...data.map((item) => item.amount), 1);

  if (!data.length) {
    return <EmptyState title="No category spend yet" description="Category data appears after expenses are created." />;
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const width = Math.max((item.amount / max) * 100, 8);
        return (
          <div key={item.category}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900">{item.category}</p>
                <p className="text-xs text-slate-500">{item.count} expense{item.count === 1 ? "" : "s"}</p>
              </div>
              <p className="text-sm font-black text-slate-950">{formatCurrency(item.amount, currency)}</p>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all"
                style={{ width: `${width}%`, opacity: 1 - index * 0.08 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrendChart({ data, currency }) {
  const max = Math.max(...data.map((item) => item.amount), 1);
  const points = data
    .map((item, index) => {
      const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
      const y = 90 - (item.amount / max) * 70;
      return `${x},${y}`;
    })
    .join(" ");

  if (!data.length) {
    return <EmptyState title="No monthly trend yet" description="Trend data appears after expenses are created." />;
  }

  return (
    <div>
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <svg viewBox="0 0 100 100" className="h-64 w-full overflow-visible">
          <defs>
            <linearGradient id="adminTrend" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          <polyline points={points} fill="none" stroke="url(#adminTrend)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {data.map((item, index) => {
            const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
            const y = 90 - (item.amount / max) * 70;
            return <circle key={item.month} cx={x} cy={y} r="3.5" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />;
          })}
        </svg>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {data.map((item) => (
          <div key={item.month} className="rounded-xl border border-slate-100 bg-white px-3 py-2">
            <p className="text-xs font-bold text-slate-500">{item.month}</p>
            <p className="mt-1 text-sm font-black text-slate-950">{formatCompactAmount(item.amount, currency)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopEmployees({ employees, currency }) {
  const max = Math.max(...employees.map((item) => item.amount), 1);

  if (!employees.length) {
    return <EmptyState title="No employee spend yet" description="Employee rankings appear after expenses are submitted." />;
  }

  return (
    <div className="space-y-3">
      {employees.map((employee, index) => (
        <div key={employee.name} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-teal-300">
                {index + 1}
              </div>
              <div>
                <p className="font-bold text-slate-900">{employee.name}</p>
                <p className="text-xs text-slate-500">{employee.count} expense{employee.count === 1 ? "" : "s"}</p>
              </div>
            </div>
            <p className="text-sm font-black text-slate-950">{formatCompactAmount(employee.amount, currency)}</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.max((employee.amount / max) * 100, 8)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin"></div>
        <p className="text-sm font-semibold text-slate-400 animate-pulse">Loading workspace...</p>
      </div>
    </div>
  );
}

function LoadingPanel() {
  return (
    <Card className="flex items-center justify-center p-12">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin"></div>
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading admin data...</p>
      </div>
    </Card>
  );
}

function UsersPanel({ users, managers, onCreate, onEdit, onRefresh }) {
  const handleDelete = async (user) => {
    try {
      await apiFetch(`/admin/users/${user._id}`, { method: "DELETE" });
      toast.success("User deactivated");
      onRefresh();
    } catch (error) {
      toast.error(error.message || "Unable to deactivate user");
    }
  };

  return (
    <Card>
      <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">User Management</h2>
          <p className="mt-1 text-sm text-slate-500">Create and manage your workforce.</p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="h-5 w-5" />
          New User
        </Button>
      </div>
      <div className="overflow-x-auto p-2">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-4 font-semibold">Name</th>
              <th className="px-5 py-4 font-semibold">Role</th>
              <th className="px-5 py-4 font-semibold">Manager</th>
              <th className="px-5 py-4 font-semibold">Email</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user, idx) => (
              <tr key={user._id} className="transition-colors hover:bg-slate-50/50 animate-fade-in" style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <Badge tone={user.role === "Manager" ? "teal" : "blue"}>{user.role}</Badge>
                </td>
                <td className="px-5 py-4 text-slate-600 font-medium">{user.manager || "-"}</td>
                <td className="px-5 py-4 text-slate-500">{user.email}</td>
                <td className="px-5 py-4">
                  <Badge tone={user.isActive ? "green" : "red"}>{user.isActive ? "Active" : "Inactive"}</Badge>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => onEdit(user)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-emerald-600 transition-all duration-200 hover:bg-emerald-50 active:scale-90"
                      title="Edit User"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      disabled={!user.isActive}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-red-600 transition-all duration-200 hover:bg-red-50 active:scale-90 disabled:opacity-20 disabled:pointer-events-none"
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!users.length ? (
        <div className="p-8">
          <EmptyState title="No users yet" description="Create at least one manager before adding employees." action={<Button onClick={onCreate}>Create user</Button>} />
        </div>
      ) : null}
      {!managers.length && users.length ? <p className="border-t border-slate-100 p-4 text-sm font-medium text-amber-600 text-center">Please create a manager before adding employees.</p> : null}
    </Card>
  );
}

function UserModal({ user, managers, onClose, onSaved }) {
  const [form, setForm] = useState(user ? { ...initialUserForm, ...user, managerId: user.managerId || "" } : initialUserForm);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const parsed = userSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Check user details");
      return;
    }

    try {
      setSaving(true);
      const payload = { ...parsed.data, managerId: parsed.data.role === "Employee" ? parsed.data.managerId : undefined };
      if (user) {
        await apiFetch(`/admin/users/${user._id}`, { method: "PATCH", body: payload });
        toast.success("User updated successfully");
      } else {
        await apiFetch("/admin/users", { method: "POST", body: payload });
        toast.success("User created and credentials sent");
      }
      onSaved();
    } catch (error) {
      toast.error(error.message || "Unable to save user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={user ? "Edit User" : "Create New User"}
      description="Managers can approve requests; employees must be assigned to a manager."
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Saving changes..." : "Save User"}</Button>
        </div>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Input label="Full Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Jane Doe" />
        <Input label="Email Address" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="jane@company.com" />
        <Select label="Role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value, managerId: "" })}>
          <option value="Employee">Employee</option>
          <option value="Manager">Manager</option>
        </Select>
        {form.role === "Employee" ? (
          <Select label="Manager" value={form.managerId || ""} onChange={(event) => setForm({ ...form, managerId: event.target.value })}>
            <option value="">Select manager</option>
            {managers.map((manager) => (
              <option key={manager._id} value={manager._id}>
                {manager.name}
              </option>
            ))}
          </Select>
        ) : null}
      </div>
    </Modal>
  );
}

function RulePanel({ rule, setRule, managers, onSaved }) {
  const [saving, setSaving] = useState(false);

  const updateApprover = (index, patch) => {
    setRule({
      ...rule,
      approvers: rule.approvers.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    });
  };

  const addApprover = () => {
    setRule({
      ...rule,
      approvers: [...rule.approvers, { userId: "", sequence: rule.approvers.length + 1, required: false }],
    });
  };

  const removeApprover = (index) => {
    setRule({
      ...rule,
      approvers: rule.approvers.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, sequence: itemIndex + 1 })),
    });
  };

  const save = async () => {
    try {
      setSaving(true);
      const approvers = rule.approvers.filter((item) => item.userId).map((item, index) => ({ ...item, sequence: index + 1 }));
      await apiFetch("/admin/approval-rule", { method: "PUT", body: { ...rule, approvers } });
      toast.success("Approval rule saved successfully");
      onSaved();
    } catch (error) {
      toast.error(error.message || "Unable to save approval rule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Approval Workflow Builder</h2>
          <p className="mt-1 text-sm text-slate-500">Configure how expenses are routed for approval across the company.</p>
        </div>
        <Button onClick={save} disabled={saving}>{saving ? "Saving configuration..." : "Save Rule Configuration"}</Button>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-800 shadow-sm transition hover:border-teal-500 hover:shadow-md">
            <div className="relative flex h-6 w-6 items-center justify-center rounded border-2 border-slate-300 bg-white">
              <input type="checkbox" className="peer absolute h-full w-full cursor-pointer opacity-0" checked={rule.managerFirst} onChange={(event) => setRule({ ...rule, managerFirst: event.target.checked })} />
              <div className="pointer-events-none absolute hidden h-full w-full items-center justify-center bg-teal-500 text-white peer-checked:flex rounded-sm">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            Manager First
          </label>
          <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-800 shadow-sm transition hover:border-emerald-500 hover:shadow-md">
            <div className="relative flex h-6 w-6 items-center justify-center rounded border-2 border-slate-300 bg-white">
              <input type="checkbox" className="peer absolute h-full w-full cursor-pointer opacity-0" checked={rule.isActive} onChange={(event) => setRule({ ...rule, isActive: event.target.checked })} />
              <div className="pointer-events-none absolute hidden h-full w-full items-center justify-center bg-emerald-500 text-white peer-checked:flex rounded-sm">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            Rule Active
          </label>
          <Select label="Routing Type" value={rule.ruleType} onChange={(event) => setRule({ ...rule, ruleType: event.target.value })}>
            <option value="percentage">Percentage based</option>
            <option value="specific">Specific Approver</option>
            <option value="hybrid">Hybrid Approach</option>
          </Select>
          <Input
            label="Minimum Approval %"
            type="number"
            min="1"
            max="100"
            value={rule.minimumPercentage}
            onChange={(event) => setRule({ ...rule, minimumPercentage: Number(event.target.value) })}
          />
        </div>

        <div className="max-w-md rounded-xl bg-slate-50/50 p-5 border border-slate-100">
          <Select label="Specific Override Approver (Optional)" value={rule.specificApproverId || ""} onChange={(event) => setRule({ ...rule, specificApproverId: event.target.value })}>
            <option value="">None configured</option>
            {managers.map((manager) => (
              <option key={manager._id} value={manager._id}>{manager.name}</option>
            ))}
          </Select>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sequential Chain</h3>
              <p className="text-sm text-slate-500">Add mandatory extra approvers after the initial step.</p>
            </div>
            <Button variant="secondary" onClick={addApprover}>
              <Plus className="h-4 w-4" />
              Add Step
            </Button>
          </div>
          <div className="space-y-4">
            {rule.approvers.map((approver, index) => (
              <div key={`${approver.userId}-${index}`} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[100px_1fr_140px_60px] items-end transition hover:shadow-md hover:border-slate-300 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <Input label="Step" type="number" value={index + 1} readOnly className="font-bold text-center bg-slate-50" />
                <Select label="Approver" value={approver.userId} onChange={(event) => updateApprover(index, { userId: event.target.value })}>
                  <option value="">Select approver</option>
                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>{manager.name}</option>
                  ))}
                </Select>
                <label className="flex h-11 items-center gap-3 cursor-pointer rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <input type="checkbox" className="accent-teal-600 h-4 w-4" checked={approver.required} onChange={(event) => updateApprover(index, { required: event.target.checked })} />
                  Required
                </label>
                <Button variant="danger" className="!px-3 !h-11 w-full" onClick={() => removeApprover(index)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))}
            {!rule.approvers.length ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="font-medium text-slate-600">No extra approvers configured.</p>
                <p className="mt-1 text-sm text-slate-500">Expenses will only require the primary routing step.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}

function ExpensesPanel({ expenses, onOverride }) {
  return (
    <Card>
      <div className="border-b border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-900">Company Expense Ledger</h2>
        <p className="mt-1 text-sm text-slate-500">Monitor all claims globally and apply admin overrides when necessary.</p>
      </div>
      <div className="overflow-x-auto p-2">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-4 font-semibold">Expense Details</th>
              <th className="px-5 py-4 font-semibold">Employee</th>
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Amount</th>
              <th className="px-5 py-4 font-semibold">Current Step</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((expense, idx) => (
              <tr key={expense._id} className="transition-colors hover:bg-slate-50/50 animate-fade-in" style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}>
                <td className="px-5 py-4">
                  <p className="font-bold text-slate-900">{expense.description}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded-md">{expense.category}</p>
                </td>
                <td className="px-5 py-4 font-medium text-slate-700">{expense.employeeId?.name || "-"}</td>
                <td className="px-5 py-4 text-slate-500">{formatDate(expense.date)}</td>
                <td className="px-5 py-4">
                  <p className="font-bold text-slate-900">{formatCurrency(expense.convertedAmount || expense.amount, expense.convertedCurrency || expense.currency)}</p>
                  {expense.convertedAmount && <p className="text-xs text-slate-400 mt-0.5">{formatCurrency(expense.amount, expense.currency)}</p>}
                </td>
                <td className="px-5 py-4 text-slate-600">{expense.currentApproverId?.name || "Completed"}</td>
                <td className="px-5 py-4"><StatusBadge status={expense.status} /></td>
                <td className="px-5 py-4 text-right">
                  <Button variant="secondary" className="!px-3 !py-1.5 text-xs font-bold" onClick={() => onOverride(expense)} disabled={expense.status === "Draft"}>
                    Admin Override
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!expenses.length ? <div className="p-8"><EmptyState title="No expenses yet" description="Submitted expenses across the company will appear here." /></div> : null}
    </Card>
  );
}

function OverrideModal({ expense, onClose, onSaved }) {
  const [form, setForm] = useState({ action: "Approved", comment: "" });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    try {
      setSaving(true);
      await apiFetch(`/admin/expenses/${expense._id}/override`, { method: "POST", body: form });
      toast.success("Admin override applied successfully");
      onSaved();
    } catch (error) {
      toast.error(error.message || "Unable to apply override");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Admin Override"
      description={`Force an action on: ${expense.description}`}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant={form.action === "Approved" ? "success" : "danger"} onClick={submit} disabled={saving || form.comment.length < 3}>
            {saving ? "Applying..." : `Force ${form.action}`}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="rounded-xl bg-amber-50 p-4 border border-amber-200/50">
          <p className="text-sm text-amber-800">
            <strong>Warning:</strong> This action bypasses all standard approval rules. The change is immediate and irreversible.
          </p>
        </div>
        <Select label="Final Status Decision" value={form.action} onChange={(event) => setForm({ ...form, action: event.target.value })}>
          <option value="Approved">Approve Expense</option>
          <option value="Rejected">Reject Expense</option>
        </Select>
        <Textarea label="Reason for Override (Required)" rows={4} value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} placeholder="Explain why this rule was bypassed..." />
      </div>
    </Modal>
  );
}
