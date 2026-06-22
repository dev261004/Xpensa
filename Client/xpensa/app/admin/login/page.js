"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ReceiptText } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import { routeForRole, setAuth } from "../../../lib/auth";
import { loginSchema } from "../../../lib/validators";
import { Button, Card, Input } from "../../../components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = async (values) => {
    try {
      const data = await apiFetch("/users/login", { method: "POST", body: values, auth: false });
      setAuth(data);
      toast.success(data.tempPassword ? "Please update your temporary password." : "Welcome back.");
      router.push(data.tempPassword ? "/reset-password" : routeForRole(data.user.role));
    } catch (error) {
      toast.error(error.message || "Login failed");
    }
  };

  return (
    <main className="auth-surface flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="grid w-full max-w-5xl overflow-hidden p-0 md:grid-cols-[1fr_440px]">
        <section className="hidden bg-slate-950 p-8 text-white md:block">
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-400 text-slate-950">
                <ReceiptText className="h-6 w-6" />
              </div>
              <h1 className="mt-8 text-4xl font-black tracking-normal">Welcome back to Xpensa</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
                Review claims, route approvals, and track reimbursements from a focused workspace.
              </p>
            </div>
            <div className="grid gap-3">
              {["OCR assisted claims", "Company currency conversion", "Approval timeline"].map((item) => (
                <div key={item} className="rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-8">
          <div className="mb-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-teal-300 md:hidden">
              <ReceiptText className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-2xl font-black text-slate-950">Sign in</h2>
            <p className="mt-1 text-sm text-slate-500">Use your admin, manager, or employee account.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Input label="Email" type="email" className="pl-10" error={errors.email?.message} {...register("email")} />
              <Mail className="pointer-events-none absolute left-3 top-10 z-10 h-4 w-4 text-slate-400" />
            </div>
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-10"
                error={errors.password?.message}
                {...register("password")}
              />
              <Lock className="pointer-events-none absolute left-3 top-10 z-10 h-4 w-4 text-slate-400" />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-10 z-10 rounded-md p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <Link href="/admin/forgotpassword" className="font-semibold text-teal-700 hover:text-teal-900">
              Forgot password?
            </Link>
            <Link href="/admin/register" className="font-semibold text-slate-600 hover:text-slate-950">
              Create company
            </Link>
          </div>
        </section>
      </Card>
    </main>
  );
}
