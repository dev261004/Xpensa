import Link from "next/link";
import { ArrowRight, CheckCircle2, FileCheck2, Gauge, ReceiptText, ShieldCheck, Users } from "lucide-react";

export const metadata = {
  title: "Xpensa",
  description: "Professional expense approval management",
};

export default function Home() {
  const features = [
    { icon: ReceiptText, title: "Receipt to claim", text: "Upload receipts, review OCR suggestions, and submit clean expense records." },
    { icon: ShieldCheck, title: "Smart approvals", text: "Manager-first, sequential, percentage, specific approver, and hybrid rules." },
    { icon: Gauge, title: "Transparent tracking", text: "Every employee and approver can see current status and approval history." },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_480px] lg:px-8">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-teal-100">
            <CheckCircle2 className="h-4 w-4" />
            Built for reimbursement workflows
          </div>
          <h1 className="max-w-3xl text-4xl font-bold tracking-normal sm:text-5xl lg:text-6xl">Xpensa</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            A professional workspace for expense submission, multi-level approvals, currency conversion, receipt OCR, and audit-ready approval history.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/admin/register"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-400"
            >
              Create company
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white p-4 text-slate-950 shadow-2xl">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-sm font-bold text-slate-950">Approval queue</p>
                <p className="text-xs text-slate-500">Converted to company currency</p>
              </div>
              <FileCheck2 className="h-5 w-5 text-teal-700" />
            </div>
            <div className="mt-4 space-y-3">
              {["Team dinner", "Client travel", "Design software"].map((item, index) => (
                <div key={item} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item}</p>
                      <p className="text-xs text-slate-500">Step {index + 1}: Manager review</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">Waiting</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-teal-50 p-3">
              <Users className="mx-auto h-5 w-5 text-teal-700" />
              <p className="mt-1 text-xs font-semibold text-slate-700">Roles</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <ReceiptText className="mx-auto h-5 w-5 text-blue-700" />
              <p className="mt-1 text-xs font-semibold text-slate-700">OCR</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <ShieldCheck className="mx-auto h-5 w-5 text-emerald-700" />
              <p className="mt-1 text-xs font-semibold text-slate-700">Audit</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-100 px-4 py-12 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <Icon className="h-6 w-6 text-teal-700" />
                <h2 className="mt-4 text-base font-bold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
