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
      title="Admin dashboard"
      subtitle="Manage users, approval rules, and company expense visibility."
      active={active}
      setActive={setActive}
      navItems={navItems}
    >
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard icon={Users} label="Employees" value={stats.employees} tone="blue" />
        <StatCard icon={Users} label="Managers" value={stats.managers} tone="teal" />
        <StatCard icon={RefreshCw} label="Pending" value={stats.pending} tone="amber" />
        <StatCard icon={CheckCircle2} label="Approved" value={stats.approved} tone="green" />
      </div>

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
  return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">Loading workspace...</div>;
}

function LoadingPanel() {
  return <Card className="p-6 text-sm text-slate-500">Loading admin data...</Card>;
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
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-slate-950">User management</h2>
          <p className="text-sm text-slate-500">Create managers and employees, then assign employee managers.</p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4" />
          New user
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Manager</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-900">{user.name}</td>
                <td className="px-4 py-3">
                  <Badge tone={user.role === "Manager" ? "teal" : "blue"}>{user.role}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-600">{user.manager || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3">
                  <Badge tone={user.isActive ? "green" : "red"}>{user.isActive ? "Active" : "Inactive"}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" className="px-3" onClick={() => onEdit(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="danger" className="px-3" onClick={() => handleDelete(user)} disabled={!user.isActive}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!users.length ? (
        <div className="p-4">
          <EmptyState title="No users yet" description="Create at least one manager before adding employees." action={<Button onClick={onCreate}>Create user</Button>} />
        </div>
      ) : null}
      {!managers.length ? <p className="border-t border-slate-200 p-4 text-sm text-amber-700">Create a manager before adding employees.</p> : null}
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
        toast.success("User updated");
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
      title={user ? "Edit user" : "Create user"}
      description="Managers can approve requests; employees must be assigned to a manager."
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Saving..." : "Save user"}</Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
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
      toast.success("Approval rule saved");
      onSaved();
    } catch (error) {
      toast.error(error.message || "Unable to save approval rule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-slate-950">Approval rule builder</h2>
          <p className="text-sm text-slate-500">Configure manager-first, sequential, percentage, specific, or hybrid approval behavior.</p>
        </div>
        <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save rule"}</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={rule.managerFirst} onChange={(event) => setRule({ ...rule, managerFirst: event.target.checked })} />
          Manager first
        </label>
        <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={rule.isActive} onChange={(event) => setRule({ ...rule, isActive: event.target.checked })} />
          Rule active
        </label>
        <Select label="Rule type" value={rule.ruleType} onChange={(event) => setRule({ ...rule, ruleType: event.target.value })}>
          <option value="percentage">Percentage</option>
          <option value="specific">Specific approver</option>
          <option value="hybrid">Hybrid</option>
        </Select>
        <Input
          label="Minimum approval %"
          type="number"
          min="1"
          max="100"
          value={rule.minimumPercentage}
          onChange={(event) => setRule({ ...rule, minimumPercentage: Number(event.target.value) })}
        />
      </div>

      <div className="mt-4 max-w-md">
        <Select label="Specific approver" value={rule.specificApproverId || ""} onChange={(event) => setRule({ ...rule, specificApproverId: event.target.value })}>
          <option value="">None</option>
          {managers.map((manager) => (
            <option key={manager._id} value={manager._id}>{manager.name}</option>
          ))}
        </Select>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Sequential approvers</h3>
          <Button variant="secondary" onClick={addApprover}>
            <Plus className="h-4 w-4" />
            Add approver
          </Button>
        </div>
        <div className="space-y-3">
          {rule.approvers.map((approver, index) => (
            <div key={`${approver.userId}-${index}`} className="grid gap-3 rounded-lg border border-slate-200 p-3 md:grid-cols-[80px_1fr_140px_48px]">
              <Input label="Step" type="number" value={index + 1} readOnly />
              <Select label="Approver" value={approver.userId} onChange={(event) => updateApprover(index, { userId: event.target.value })}>
                <option value="">Select approver</option>
                {managers.map((manager) => (
                  <option key={manager._id} value={manager._id}>{manager.name}</option>
                ))}
              </Select>
              <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={approver.required} onChange={(event) => updateApprover(index, { required: event.target.checked })} />
                Required
              </label>
              <Button variant="danger" className="self-end px-3" onClick={() => removeApprover(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {!rule.approvers.length ? <EmptyState title="No extra approvers" description="Manager-first can still route expenses to the employee manager." /> : null}
        </div>
      </div>
    </Card>
  );
}

function ExpensesPanel({ expenses, onOverride }) {
  return (
    <Card>
      <div className="border-b border-slate-200 p-4">
        <h2 className="font-bold text-slate-950">Company expenses</h2>
        <p className="text-sm text-slate-500">Monitor every claim and override when needed.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Expense</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Current approver</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((expense) => (
              <tr key={expense._id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{expense.description}</p>
                  <p className="text-xs text-slate-500">{expense.category}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{expense.employeeId?.name || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(expense.date)}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">
                  {formatCurrency(expense.convertedAmount || expense.amount, expense.convertedCurrency || expense.currency)}
                </td>
                <td className="px-4 py-3 text-slate-600">{expense.currentApproverId?.name || "-"}</td>
                <td className="px-4 py-3"><StatusBadge status={expense.status} /></td>
                <td className="px-4 py-3 text-right">
                  <Button variant="secondary" onClick={() => onOverride(expense)} disabled={expense.status === "Draft"}>
                    Override
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!expenses.length ? <div className="p-4"><EmptyState title="No expenses yet" description="Submitted expenses will appear here." /></div> : null}
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
      toast.success("Override applied");
      onSaved();
    } catch (error) {
      toast.error(error.message || "Unable to apply override");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Admin override"
      description={expense.description}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || form.comment.length < 3}>{saving ? "Saving..." : "Apply override"}</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Select label="Final status" value={form.action} onChange={(event) => setForm({ ...form, action: event.target.value })}>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </Select>
        <Textarea label="Reason" rows={4} value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} />
      </div>
    </Modal>
  );
}
