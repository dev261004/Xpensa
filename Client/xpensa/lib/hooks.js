"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredUser, routeForRole } from "./auth";

export function useRequireRole(role) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    const token = localStorage.getItem("token");

    if (!stored || !token) {
      router.replace("/admin/login");
      return;
    }

    if (stored.role !== role) {
      router.replace(routeForRole(stored.role));
      return;
    }

    setUser(stored);
    setReady(true);
  }, [role, router]);

  return { user, ready };
}
