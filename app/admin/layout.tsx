"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { usePathname } from "next/navigation";
import { AdminNotificationProvider } from "@/context/AdminNotificationContext"; // Import Provider

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Conditionally Render Sidebar */}
      {!isLoginPage && <AdminSidebar />}

      {/* Adjust margin based on whether sidebar is present */}
      <main className={`flex-1 p-8 ${!isLoginPage ? "ml-64" : "ml-0 p-0"}`}>
        {/* WRAP CHILDREN WITH NOTIFICATION PROVIDER */}
        <AdminNotificationProvider>
           {children}
        </AdminNotificationProvider>
      </main>
    </div>
  );
}