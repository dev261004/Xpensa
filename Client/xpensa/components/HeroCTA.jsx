"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getStoredUser, routeForRole } from "../lib/auth";

export default function HeroCTA() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  if (user) {
    return (
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={routeForRole(user.role)}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-400 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-teal-950/30 transition hover:bg-teal-300"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
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
  );
}
