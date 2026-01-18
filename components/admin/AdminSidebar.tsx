// components/admin/AdminSidebar.tsx
"use client";

import React, { useState } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Added useRouter
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingBag, 
  Layers, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  ShieldCheck, 
  User,        
  BookOpen,    
  Calculator,  
  Receipt      
} from "lucide-react";

// Define the Exact Menu Structure
const menuStructure = [
  { 
    name: "Dashboard", 
    href: "/admin/dashboard", 
    icon: LayoutDashboard 
  },
  { 
    name: "User Management", 
    icon: Users,
    subItems: [
      { name: "Customers", href: "/admin/users/customers", icon: User },
      { name: "Admin Users", href: "/admin/users/admins", icon: ShieldCheck },
    ]
  },
  { 
    name: "Products Management", 
    href: "/admin/products", 
    icon: Package 
  },
  { 
    name: "Order & Sales", 
    href: "/admin/orders", 
    icon: ShoppingBag 
  },
  { 
    name: "Page Management", 
    href: "/admin/pages", 
    icon: Layers 
  },
  { 
    name: "Accounts", 
    icon: BookOpen,
    subItems: [
      { name: "Ledger", href: "/admin/accounts/ledger", icon: BookOpen },
      { name: "Tax", href: "/admin/accounts/tax", icon: Calculator },
      { name: "Order Accounts", href: "/admin/accounts/orders", icon: Receipt },
    ]
  },
  { 
    name: "Settings", 
    href: "/admin/settings", 
    icon: Settings 
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter(); // Hook for redirection
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (name: string) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  // --- LOGOUT LOGIC ---
  const handleLogout = async () => {
    try {
      // 1. Call the API to delete the cookie
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      
      if (res.ok) {
        // 2. Redirect to Login Page
        router.push('/admin/login');
        // 3. Force a refresh to ensure middleware catches the missing cookie
        router.refresh(); 
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col fixed left-0 top-0 overflow-y-auto z-50 shadow-xl">
      {/* 1. Brand / Header */}
      <div className="p-6 text-xl font-bold tracking-wider border-b border-slate-800 flex items-center gap-3">
        <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center font-bold">A</div>
        <span>Admin Panel</span>
      </div>

      {/* 2. Navigation Items */}
      <nav className="flex-1 p-4 space-y-1">
        {menuStructure.map((item) => {
          const isActive = item.href ? pathname === item.href : false;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isOpen = openMenu === item.name;

          return (
            <div key={item.name}>
              {/* Main Menu Item */}
              {hasSubItems ? (
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                    isOpen ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <Link
                  href={item.href!}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? "bg-blue-600 text-white shadow-lg translate-x-1" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )}

              {/* Sub Menu Items */}
              {hasSubItems && isOpen && (
                <div className="mt-1 ml-4 border-l-2 border-slate-700 pl-2 space-y-1 bg-slate-900/50">
                  {item.subItems.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                        pathname === sub.href
                          ? "text-blue-400 font-semibold bg-slate-800"
                          : "text-slate-500 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      {sub.icon && <sub.icon size={16} />}
                      <span>{sub.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 3. Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout} // Attached the function here
          className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors font-medium"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}