import Link from "next/link";
import { ArrowRight, CheckCircle2, FileCheck2, Gauge, ReceiptText, ShieldCheck, Users, WalletCards } from "lucide-react";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Xpensa",
  description: "Professional expense approval management",
};

export default function Home() {
  const features = [
    { icon: ReceiptText, title: "Receipt OCR", text: "Capture the receipt, review the extracted data, and submit the claim." },
    { icon: ShieldCheck, title: "Approval rules", text: "Manager-first, sequential, percentage, specific approver, and hybrid flows." },
    { icon: Gauge, title: "Live visibility", text: "Employees, managers, and admins always know where a claim stands." },
  ];

  return (
    <main className="bg-slate-100 text-slate-950">
      <Navbar />
      <section className="hero-product-surface relative min-h-[65vh] overflow-hidden px-4 pt-24 pb-24 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 bottom-0 top-20 mx-auto hidden max-w-7xl opacity-70 lg:block">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[620px] rounded-lg border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="text-sm font-bold">Manager approval inbox</p>
                <p className="text-xs text-slate-300">Converted to INR</p>
              </div>
              <FileCheck2 className="h-5 w-5 text-teal-300" />
            </div>
            <div className="space-y-3">
              {[
                ["Client dinner", "Sarah", "INR 8,420", "Waiting"],
                ["Airport transfer", "Mohan", "INR 2,140", "Step 2"],
                ["Design tools", "Aditi", "INR 14,999", "CFO"],
              ].map(([name, owner, amount, status]) => (
                <div key={name} className="grid grid-cols-[1fr_100px_90px_82px] items-center gap-3 rounded-lg border border-white/10 bg-white/90 px-3 py-3 text-sm text-slate-950">
                  <span className="font-bold">{name}</span>
                  <span className="text-slate-600">{owner}</span>
                  <span className="font-semibold">{amount}</span>
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-center text-xs font-bold text-amber-800">{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto flex min-h-[50vh] max-w-7xl items-center">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-sm font-semibold text-teal-100">
              <CheckCircle2 className="h-4 w-4" />
              Expense workflows that feel under control
            </div>
            <h1 className="text-5xl font-black tracking-normal sm:text-6xl lg:text-7xl">Xpensa</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-200">
              Submit receipts, route approvals, convert currencies, and keep every reimbursement decision audit-ready.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/admin/register"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-400 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-teal-950/30 transition hover:bg-teal-300"
              >
                Create company
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/admin/login"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-8 px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-teal-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-base font-black">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
