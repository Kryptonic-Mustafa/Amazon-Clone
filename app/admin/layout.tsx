"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";
import { AdminNotificationProvider } from "@/context/AdminNotificationContext";
import { AdminLocaleProvider } from "@/context/AdminLocaleContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <AdminLocaleProvider>
        <AdminNotificationProvider>
          {children}
        </AdminNotificationProvider>
      </AdminLocaleProvider>
    );
  }

  return (
    <AdminLocaleProvider>
      <AdminNotificationProvider>
        <div className="flex min-h-screen bg-slate-50 font-sans">
          <AdminSidebar />
          <div className="flex-1 ltr:ml-64 rtl:mr-64 print:ml-0 print:mr-0 flex flex-col min-h-screen transition-all">
            <AdminTopBar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      </AdminNotificationProvider>
    </AdminLocaleProvider>
  );
}

