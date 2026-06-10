"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { clearAuth, getStoredUser } from "../../lib/auth";
import { Button, Card, Input } from "../../components/ui";

export default function ResetPassword() {
  const router = useRouter();
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
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <div className="mb-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-teal-700 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-950">Set a new password</h1>
          <p className="mt-1 text-sm text-slate-500">Use the temporary password from your email or first login.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" required {...register("email", { required: true })} />
          <Input label="Temporary password" type="password" required {...register("tempPassword", { required: true })} />
          <Input label="New password" type="password" required minLength={8} {...register("newPassword", { required: true, minLength: 8 })} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update password"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
