"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Lock, ShoppingBag, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'My Profile', href: '/profile', icon: User },
    { name: 'My Orders', href: '/profile/orders', icon: ShoppingBag },
    { name: 'Change Password', href: '/profile/password', icon: Lock },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <nav className="flex flex-col">
                {menuItems.map((item: any) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href}
                      className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon size={18} />
                      {item.name}
                    </Link>
                  );
                })}
                <button 
                  onClick={logout}
                  className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 text-left w-full"
                >
                  <LogOut size={18} />
                  Log Out
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}