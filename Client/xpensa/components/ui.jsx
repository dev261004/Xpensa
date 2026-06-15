"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, ReceiptText, ShieldCheck, Users, WalletCards, X } from "lucide-react";
import { clearAuth, getStoredUser } from "../lib/auth";

export function Button({ children, variant = "primary", className = "", type = "button", ...props }) {
  const variants = {
    primary: "border-transparent bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-900/20 hover:from-teal-500 hover:to-emerald-500 hover:shadow-lg hover:shadow-teal-900/30",
    secondary: "border-slate-200 bg-white/80 backdrop-blur-sm text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:shadow-md",
    danger: "border-transparent bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-900/20 hover:from-red-500 hover:to-rose-500 hover:shadow-lg hover:shadow-red-900/30",
    ghost: "border-transparent bg-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-900",
    success: "border-transparent bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-md shadow-emerald-900/20 hover:from-emerald-500 hover:to-green-400 hover:shadow-lg hover:shadow-emerald-900/30",
  };

  return (
    <button
      type={type}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block animate-fade-in">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <input
        className={`w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-sm text-slate-900 shadow-sm backdrop-blur-sm outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs font-medium text-red-500 animate-slide-up">{error}</span> : null}
    </label>
  );
}

export function Select({ label, error, children, className = "", ...props }) {
  return (
    <label className="block animate-fade-in">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <select
        className={`w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-sm text-slate-900 shadow-sm backdrop-blur-sm outline-none transition-all duration-300 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="mt-1 block text-xs font-medium text-red-500 animate-slide-up">{error}</span> : null}
    </label>
  );
}

export function Textarea({ label, error, className = "", ...props }) {
  return (
    <label className="block animate-fade-in">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        className={`w-full resize-none rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-sm text-slate-900 shadow-sm backdrop-blur-sm outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs font-medium text-red-500 animate-slide-up">{error}</span> : null}
    </label>
  );
}

export function Card({ children, className = "", hover = false }) {
  return (
    <section 
      className={`glass rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 ${hover ? "hover:-translate-y-1 hover:shadow-[0_14px_40px_rgb(0,0,0,0.08)]" : ""} ${className}`}
    >
      {children}
    </section>
  );
}

export function StatCard({ icon: Icon, label, value, tone = "slate" }) {
  const tones = {
    slate: "from-slate-500/20 to-slate-100 text-slate-700 icon-slate",
    teal: "from-teal-500/20 to-teal-50 text-teal-700 icon-teal",
    amber: "from-amber-500/20 to-amber-50 text-amber-700 icon-amber",
    green: "from-emerald-500/20 to-emerald-50 text-emerald-700 icon-emerald",
    red: "from-red-500/20 to-red-50 text-red-700 icon-red",
    blue: "from-blue-500/20 to-blue-50 text-blue-700 icon-blue",
  };
  
  const iconColors = {
    slate: "bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-700",
    teal: "bg-teal-100 text-teal-600 group-hover:bg-teal-200 group-hover:text-teal-700",
    amber: "bg-amber-100 text-amber-600 group-hover:bg-amber-200 group-hover:text-amber-700",
    emerald: "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200 group-hover:text-emerald-700",
    red: "bg-red-100 text-red-600 group-hover:bg-red-200 group-hover:text-red-700",
    blue: "bg-blue-100 text-blue-600 group-hover:bg-blue-200 group-hover:text-blue-700",
  };

  const styleParts = tones[tone]?.split(" ") || tones.slate.split(" ");
  const bgGradient = `${styleParts[0]} ${styleParts[1]}`;
  const iconTone = styleParts[3]?.replace("icon-", "") || "slate";

  return (
    <Card hover className="group relative overflow-hidden p-5 before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-50 before:-z-10 before:transition-opacity hover:before:opacity-100" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}>
      <div className={`absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-gradient-to-bl ${bgGradient} blur-2xl transition-transform duration-500 group-hover:scale-150`} />
      
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500/80">{label}</p>
          <p className="mt-1.5 text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm ${iconColors[iconTone]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

export function Badge({ children, tone = "slate", className = "" }) {
  const tones = {
    slate: "bg-slate-100/80 text-slate-700 border-slate-200",
    amber: "bg-amber-100/80 text-amber-800 border-amber-200",
    green: "bg-emerald-100/80 text-emerald-800 border-emerald-200",
    red: "bg-red-100/80 text-red-800 border-red-200",
    blue: "bg-blue-100/80 text-blue-800 border-blue-200",
    teal: "bg-teal-100/80 text-teal-800 border-teal-200",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide backdrop-blur-sm ${tones[tone]} ${className}`}>{children}</span>;
}

export function StatusBadge({ status }) {
  const normalized = status || "Draft";
  const tone = normalized === "Approved" ? "green" : normalized === "Rejected" ? "red" : normalized === "Waiting approval" ? "amber" : "slate";
  return (
    <Badge tone={tone} className="gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${tone === 'green' ? 'bg-emerald-500 animate-pulse' : tone === 'red' ? 'bg-red-500' : tone === 'amber' ? 'bg-amber-500 animate-pulse-slow' : 'bg-slate-500'}`}></span>
      {normalized}
    </Badge>
  );
}

export function EmptyState({ icon: Icon = ReceiptText, title, description, action }) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-slate-50/50 px-6 py-16 text-center shadow-inner transition-all hover:bg-slate-50/80">
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 transition-transform duration-500 hover:scale-110 hover:rotate-3">
        <Icon className="h-8 w-8 text-teal-600" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">{description}</p> : null}
      {action ? <div className="mt-6 animate-slide-up">{action}</div> : null}
    </div>
  );
}

export function Modal({ title, description, children, onClose, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md animate-fade-in">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/20 bg-white/95 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl animate-slide-up">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/80 px-6 py-5 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {description ? <p className="mt-1.5 text-sm font-medium text-slate-500">{description}</p> : null}
          </div>
          <Button variant="ghost" className="!p-2 -mr-2" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="px-6 py-6">{children}</div>
        {footer ? <div className="sticky bottom-0 z-10 border-t border-slate-100 bg-slate-50/80 px-6 py-4 backdrop-blur-md">{footer}</div> : null}
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
      <header className="sticky top-0 z-30 glass border-b-0 shadow-sm">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-teal-400 shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <RoleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-extrabold tracking-tight text-slate-900">Xpensa</p>
              <p className="text-xs font-semibold tracking-wide text-teal-600 uppercase">{role} workspace</p>
            </div>
          </Link>
          <div className="hidden items-center gap-4 sm:flex">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">{user?.name || role}</p>
              <p className="text-xs font-medium text-slate-500">{user?.companyId?.name || pathname}</p>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <Button variant="ghost" onClick={handleLogout} className="text-slate-500 hover:text-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[90rem] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="glass-dark flex flex-col rounded-2xl p-3 shadow-xl">
          <div className="mb-4 flex items-center gap-2 px-3 py-2 text-sm font-bold tracking-wide text-slate-400 uppercase lg:hidden">
            <Menu className="h-4 w-4" />
            Navigation
          </div>
          <nav className="grid gap-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const selected = active === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all duration-300 ${
                    selected 
                      ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-900/20 translate-x-1" 
                      : "text-slate-300 hover:bg-white/10 hover:text-white hover:translate-x-1"
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-transform duration-300 ${selected ? "scale-110" : "group-hover:scale-110"}`} />
                  {item.label}
                  {selected && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white animate-pulse"></div>}
                </button>
              );
            })}
          </nav>
          
          <div className="mt-6 rounded-xl bg-white/5 p-4 text-center">
            <p className="text-xs font-medium text-slate-400">Xpensa Enterprise</p>
            <p className="mt-1 text-[10px] text-slate-500">v2.0.0-beta</p>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-2 text-base font-medium text-slate-600">{subtitle}</p>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
