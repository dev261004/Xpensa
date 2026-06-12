"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, ReceiptText, ShieldCheck, Users, WalletCards, X } from "lucide-react";
import { clearAuth, getStoredUser } from "../lib/auth";

export function Button({ children, variant = "primary", className = "", type = "button", ...props }) {
  const variants = {
    primary: "border-teal-700 bg-teal-700 text-white shadow-sm shadow-teal-900/20 hover:bg-teal-800",
    secondary: "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50",
    danger: "border-red-600 bg-red-600 text-white shadow-sm shadow-red-900/20 hover:bg-red-700",
    ghost: "border-transparent bg-transparent text-slate-700 hover:bg-slate-100",
    success: "border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-900/20 hover:bg-emerald-700",
  };

  return (
    <button
      type={type}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <input
        className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-3 focus:ring-teal-100 ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export function Select({ label, error, children, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <select
        className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-3 focus:ring-teal-100 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export function Textarea({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        className={`w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-3 focus:ring-teal-100 ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export function Card({ children, className = "" }) {
  return <section className={`rounded-lg border border-slate-200/80 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)] ${className}`}>{children}</section>;
}

export function StatCard({ icon: Icon, label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <Card className="group overflow-hidden p-4">
      <div className={`mb-4 h-1 w-12 rounded-full ${tones[tone] || tones.slate}`} />
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <div className={`rounded-lg p-2.5 transition group-hover:scale-105 ${tones[tone] || tones.slate}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

export function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-100 text-amber-800",
    green: "bg-emerald-100 text-emerald-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
    teal: "bg-teal-100 text-teal-800",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function StatusBadge({ status }) {
  const normalized = status || "Draft";
  const tone = normalized === "Approved" ? "green" : normalized === "Rejected" ? "red" : normalized === "Waiting approval" ? "amber" : "slate";
  return <Badge tone={tone}>{normalized}</Badge>;
}

export function EmptyState({ icon: Icon = ReceiptText, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-inner">
      <div className="rounded-lg bg-slate-100 p-3">
        <Icon className="h-8 w-8 text-slate-500" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Modal({ title, description, children, onClose, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/30 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <Button variant="ghost" className="px-2" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="px-5 py-5">{children}</div>
        {footer ? <div className="border-t border-slate-200 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

export function AppShell({ role, title, subtitle, active, setActive, navItems, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = getStoredUser();
  const roleIcons = { Admin: ShieldCheck, Manager: Users, Employee: WalletCards };
  const RoleIcon = roleIcons[role] || ReceiptText;

  const handleLogout = () => {
    clearAuth();
    router.push("/admin/login");
  };

  return (
    <div className="app-surface min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-teal-300 shadow-sm">
              <RoleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950">Xpensa</p>
              <p className="text-xs text-slate-500">{role} workspace</p>
            </div>
          </Link>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-right shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{user?.name || role}</p>
              <p className="text-xs text-slate-500">{user?.companyId?.name || pathname}</p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[248px_1fr] lg:px-8">
        <aside className="rounded-lg border border-slate-900/80 bg-slate-950 p-2 shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
          <div className="mb-2 flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-300 lg:hidden">
            <Menu className="h-4 w-4" />
            Navigation
          </div>
          <nav className="grid gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const selected = active === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                    selected ? "bg-teal-400 text-slate-950 shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0">
          <div className="mb-6 rounded-lg border border-white/70 bg-white/75 px-5 py-4 shadow-sm backdrop-blur">
            <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
