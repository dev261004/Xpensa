"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Building2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import { registerSchema } from "../../../lib/validators";
import { Button, Card, Input, Select } from "../../../components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [countries, setCountries] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", companyName: "", email: "", country: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    apiFetch("/meta/countries", { auth: false })
      .then(setCountries)
      .catch(() => toast.error("Unable to load country list"));
  }, []);

  const selectedCountry = countries.find((country) => country.name === watch("country"));

  const onSubmit = async (values) => {
    try {
      await apiFetch("/users/register", { method: "POST", body: values, auth: false });
      toast.success("Company created. You can sign in now.");
      router.push("/admin/login");
    } catch (error) {
      toast.error(error.message || "Registration failed");
    }
  };

  return (
    <main className="auth-surface flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="grid w-full max-w-6xl overflow-hidden p-0 lg:grid-cols-[360px_1fr]">
        <section className="bg-slate-950 p-7 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-400 text-slate-950">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="mt-8 text-3xl font-black tracking-normal">Create your workspace</h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">Set up the company currency, invite approvers, and start with a clean reimbursement flow.</p>
          <div className="mt-8 space-y-3">
            <div className="rounded-lg border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-black">3 roles</p>
              <p className="text-xs font-semibold text-slate-300">Admin, Manager, Employee</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-black">Live rules</p>
              <p className="text-xs font-semibold text-slate-300">Sequential and conditional approvals</p>
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-8">
          <div className="mb-7">
            <h2 className="text-2xl font-black text-slate-950">Company details</h2>
            <p className="mt-1 text-sm text-slate-500">The selected country sets your company currency automatically.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <Input label="Admin name" error={errors.name?.message} {...register("name")} />
          <Input label="Company name" error={errors.companyName?.message} {...register("companyName")} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Select label="Country" error={errors.country?.message} {...register("country")}>
            <option value="">Select country</option>
            {countries.map((country) => (
              <option key={country.name} value={country.name}>
                {country.name}
              </option>
            ))}
          </Select>
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              className="pr-10"
              error={errors.password?.message}
              {...register("password")}
            />
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
          <div className="relative">
            <Input
              label="Confirm password"
              type={showConfirmPassword ? "text" : "password"}
              className="pr-10"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute right-3 top-10 z-10 rounded-md p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {selectedCountry ? (
            <div className="md:col-span-2 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
              <CheckCircle2 className="mr-2 inline h-4 w-4" />
              {selectedCountry.currency} will be used as your company currency.
            </div>
          ) : null}

          <div className="md:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Link href="/admin/login" className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              Back to login
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create workspace"}
            </Button>
          </div>
          </form>
        </section>
      </Card>
    </main>
  );
}
