"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Building2, CheckCircle2 } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import { registerSchema } from "../../../lib/validators";
import { Button, Card, Input, Select } from "../../../components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [countries, setCountries] = useState([]);
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
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <Card className="w-full max-w-2xl p-6">
        <div className="mb-7 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-700 text-white">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Create your company workspace</h1>
            <p className="mt-1 text-sm text-slate-500">The selected country sets your company currency automatically.</p>
          </div>
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
          <Input label="Password" type="password" error={errors.password?.message} {...register("password")} />
          <Input label="Confirm password" type="password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />

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
      </Card>
    </main>
  );
}
