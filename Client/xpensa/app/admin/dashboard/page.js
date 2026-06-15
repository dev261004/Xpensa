"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ClipboardList, Pencil, Plus, RefreshCw, Settings2, Trash2, Users } from "lucide-react";
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
  const [active, setActive] = useState("users");
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [rule, setRule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userModal, setUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [overrideExpense, setOverrideExpense] = useState(null);

  const navItems = [
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
        <StatCard icon={CheckCircle2} label="Approved Expenses" value={stats.approved} tone="green" />
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        {loading ? <LoadingPanel /> : null}
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
