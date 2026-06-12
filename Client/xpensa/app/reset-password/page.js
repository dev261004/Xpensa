"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { clearAuth, getStoredUser } from "../../lib/auth";
import { Button, Card, Input } from "../../components/ui";

export default function ResetPassword() {
  const router = useRouter();
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: { email: "", tempPassword: "", newPassword: "" },
  });

  useEffect(() => {
    const user = getStoredUser();
    if (user?.email) setValue("email", user.email);
  }, [setValue]);

  const onSubmit = async (values) => {
    try {
      await apiFetch("/users/reset-password", { method: "POST", body: values, auth: false });
      clearAuth();
      toast.success("Password updated. Please sign in again.");
      router.push("/admin/login");
    } catch (error) {
      toast.error(error.message || "Password reset failed");
    }
  };

  return (
    <main className="auth-surface flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md overflow-hidden p-0">
        <div className="bg-slate-950 px-6 py-7 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-400 text-slate-950">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-2xl font-black">Set a new password</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">Use the temporary password from your email or first login.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <Input label="Email" type="email" required {...register("email", { required: true })} />
          <div className="relative">
            <Input
              label="Temporary password"
              type={showTempPassword ? "text" : "password"}
              required
              className="pr-10"
              {...register("tempPassword", { required: true })}
            />
            <button
              type="button"
              aria-label={showTempPassword ? "Hide temporary password" : "Show temporary password"}
              onClick={() => setShowTempPassword((value) => !value)}
              className="absolute right-3 top-10 rounded-md p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              {showTempPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="relative">
            <Input
              label="New password"
              type={showNewPassword ? "text" : "password"}
              required
              minLength={8}
              className="pr-10"
              {...register("newPassword", { required: true, minLength: 8 })}
            />
            <button
              type="button"
              aria-label={showNewPassword ? "Hide new password" : "Show new password"}
              onClick={() => setShowNewPassword((value) => !value)}
              className="absolute right-3 top-10 rounded-md p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update password"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
