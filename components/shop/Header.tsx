"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import CartDrawer from "./CartDrawer";
import Link from "next/link";
import { FaShoppingCart, FaSearch, FaBars, FaUser, FaSignOutAlt, FaCog } from "react-icons/fa";

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { totalItems } = useCart(); 
  const { user, logout } = useAuth(); // Hook into Auth

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Sales", href: "/shop?filter=sale" },
    { name: "Contact", href: "/contact" },
  ];

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-gray-900 text-white shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          <Link href="/" className="text-2xl font-bold text-white tracking-wide">
            Amazon<span className="text-yellow-400">Clone</span>
          </Link>

          <nav className="hidden md:flex space-x-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="hover:text-yellow-400 transition-colors">
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-5">
            <button className="hidden sm:block hover:text-yellow-400">
              <FaSearch />
            </button>

            {/* DYNAMIC USER SECTION */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-yellow-400 text-gray-900 font-bold flex items-center justify-center hover:bg-white transition-colors">
                    {getInitials(user.name)}
                  </div>
                  <span className="hidden sm:block text-sm font-medium hover:text-yellow-400">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl py-2 z-20 text-gray-800 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="font-bold truncate text-sm">{user.email}</p>
                      </div>
                      <Link href="/profile" className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm">
                        <FaUser className="text-gray-400"/> My Profile
                      </Link>
                      {user.role_ids === 'admin' && (
                        <Link href="/admin/dashboard" className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-blue-600">
                           <FaCog /> Admin Dashboard
                        </Link>
                      )}
                      <button 
                        onClick={() => { logout(); setIsProfileOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 text-sm mt-1 border-t border-gray-100"
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login" className="flex items-center space-x-1 hover:text-yellow-400 text-sm">
                <FaUser /> <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            <button onClick={() => setIsCartOpen(true)} className="relative flex items-center hover:text-yellow-400">
              <FaShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <button className="md:hidden text-xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <FaBars />
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-800 py-2">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="block px-4 py-2 hover:bg-gray-700 hover:text-yellow-400" onClick={() => setIsMobileMenuOpen(false)}>
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}