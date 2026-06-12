"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import { Button, Card, Input } from "../../../components/ui";

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm({ defaultValues: { email: "" } });

  const onSubmit = async ({ email }) => {
    try {
      await apiFetch("/users/forgot-password", { method: "POST", body: { email }, auth: false });
      toast.success("Temporary password sent to your email.");
      reset();
    } catch (error) {
      toast.error(error.message || "Unable to send temporary password");
    }
  };

  return (
    <main className="auth-surface flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md overflow-hidden p-0">
        <div className="bg-slate-950 px-6 py-7 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-2xl font-black">Reset access</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">We will email a temporary password to the account address.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <Input label="Email" type="email" required {...register("email", { required: true })} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send temporary password"}
          </Button>
          <Link href="/admin/login" className="block text-center text-sm font-semibold text-teal-700 hover:text-teal-900">
            Back to sign in
          </Link>
        </form>
      </Card>
    </main>
  );
}
