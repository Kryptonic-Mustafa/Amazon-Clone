"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  RotateCcw,
  LayoutDashboard, Package, ShoppingCart, 
  Users, Settings, FileText, MessageSquare, LogOut, 
  ClipboardList, FileSpreadsheet, Truck, Calculator, BookOpen 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAdminLocale } from '@/context/AdminLocaleContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { t, isRTL } = useAdminLocale();

  const links = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', href: '/admin/inventory', icon: ClipboardList },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Sales Return', href: '/admin/sales-return', icon: RotateCcw },
    { name: 'Invoices', href: '/admin/invoices', icon: FileText },
    { name: 'Quotations', href: '/admin/quotations', icon: FileSpreadsheet },
    { name: 'Purchase Orders', href: '/admin/purchase-orders', icon: Truck },
    { name: 'Customers', href: '/admin/users/customers', icon: Users },
    { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
    { name: 'Page Content', href: '/admin/content', icon: FileText },
  ];

  const accountLinks = [
    { name: 'Ledger', href: '/admin/accounts/ledger', icon: BookOpen },
    { name: 'Taxes', href: '/admin/accounts/tax', icon: Calculator },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className={`w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col fixed top-0 bottom-0 z-50 print:hidden ${isRTL ? 'right-0 border-l border-slate-800' : 'left-0 border-r border-slate-800'}`}>
      <div className="h-20 flex items-center px-8 shrink-0 border-b border-slate-800">
        <span className="text-2xl font-black text-white tracking-tight">
          Admin<span className="text-yellow-400">Panel</span>
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-4">{t('Main Menu')}</div>
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link key={link.name} href={link.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
              <link.icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
              {t(link.name)}
            </Link>
          );
        })}

        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-8 mb-3 px-4">{t('Accounts & System')}</div>
        {accountLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link key={link.name} href={link.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
              <link.icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
              {t(link.name)}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 shrink-0">
        <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors font-medium text-sm">
          <LogOut size={18} className={isRTL ? "ml-2" : "mr-2"} /> {t('Sign Out')}
        </button>
      </div>
    </div>
  );
}
