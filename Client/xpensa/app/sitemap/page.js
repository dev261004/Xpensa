"use client";
import Link from "next/link";

const routes = [
  { path: "/", name: "Home" },
  { path: "/admin/dashboard", name: "Admin Dashboard" },
  { path: "/admin/forgotpassword", name: "Admin Forgot Password" },
  { path: "/admin/login", name: "Admin Login" },
  { path: "/admin/register", name: "Admin Register" },
  { path: "/employee/dashboard", name: "Employee Dashboard" },
  { path: "/manager/dashboard", name: "Manager Dashboard" },
  { path: "/reset-password", name: "Reset Password" },
  
];

export default function SiteMap() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-8">📌 Site Map</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
        {routes.map((route, idx) => (
          <Link
            key={idx}
            href={route.path}
            className="p-4 rounded-lg shadow-md bg-white hover:bg-gray-200 transition text-center font-medium">
            {route.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
