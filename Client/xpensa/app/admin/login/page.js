"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail, ReceiptText } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import { routeForRole, setAuth } from "../../../lib/auth";
import { loginSchema } from "../../../lib/validators";
import { Button, Card, Input } from "../../../components/ui";

export default function LoginPage() {
  const router = useRouter();
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
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <div className="mb-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-teal-700 text-white">
            <ReceiptText className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-950">Sign in to Xpensa</h1>
          <p className="mt-1 text-sm text-slate-500">Use your admin, manager, or employee account.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-slate-400" />
            <Input label="Email" type="email" className="pl-10" error={errors.email?.message} {...register("email")} />
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-slate-400" />
            <Input label="Password" type="password" className="pl-10" error={errors.password?.message} {...register("password")} />
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
      </Card>
    </main>
  );
}
