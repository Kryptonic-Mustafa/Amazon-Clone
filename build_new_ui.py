import os

FILES_TO_UPDATE = {
    # ==========================================
    # 1. THE NEW HEADER (Navbar)
    # ==========================================
    "components/shop/Header.tsx": r""""use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, ShoppingCart, LogIn, Menu, X, LogOut, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Sales', path: '/shop?sale=true' },
    { name: 'Contact', path: '/contact' },
  ];

  const cartCount = cart?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        
        {/* LEFT: Brand Name */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tighter text-slate-900">
            AMAZON<span className="text-blue-600">CLONE</span>
          </span>
        </Link>

        {/* CENTER: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.path}
              className={`text-sm font-bold uppercase tracking-wider transition-colors ${
                pathname === link.path ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-4 sm:gap-6">
          
          {/* Search Icon */}
          <button className="text-slate-500 hover:text-blue-600 transition-colors">
            <Search size={22} />
          </button>

          {/* Cart Icon */}
          <Link href="/checkout" className="relative text-slate-500 hover:text-blue-600 transition-colors">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Profile / Login Button */}
          <div className="relative hidden sm:block" ref={dropdownRef}>
            {user ? (
              <div>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 max-w-[100px] truncate">
                    {user.name || 'My Profile'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden py-2 animate-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-100 mb-2">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600">
                      <User size={16} /> My Account
                    </Link>
                    <Link href="/profile/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600">
                      <Package size={16} /> My Orders
                    </Link>
                    <button 
                      onClick={() => { logout(); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 mt-1 border-t border-slate-100"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-600 transition-colors shadow-sm">
                <LogIn size={16} /> Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-slate-500 hover:text-slate-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </div>

      {/* MOBILE NAVIGATION MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white absolute w-full shadow-lg">
          <nav className="flex flex-col p-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3 px-4 text-sm font-bold text-slate-700 uppercase tracking-wider hover:bg-slate-50 rounded-lg"
              >
                {link.name}
              </Link>
            ))}
            {!user && (
              <Link href="/login" className="mt-4 flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-lg text-sm font-bold">
                <LogIn size={18} /> Sign In / Register
              </Link>
            )}
            {user && (
              <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="mt-4 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-bold border border-red-100">
                <LogOut size={18} /> Sign Out
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
""",

    # ==========================================
    # 2. THE NEW HERO SECTION
    # ==========================================
    "components/shop/HeroSection.tsx": r""""use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="relative bg-white overflow-hidden border-b border-slate-200">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[500px] py-16 lg:py-0">
          
          {/* Text Content */}
          <div className="flex flex-col justify-center max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest w-fit mb-6 border border-blue-100">
              <Star size={14} className="fill-blue-600" /> Top Rated Store 2025
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              Discover Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Next Favorite</span> <br/>
              Product.
            </h1>
            
            <p className="text-lg text-slate-500 mb-8 max-w-lg leading-relaxed">
              Shop the latest trends, premium electronics, and exclusive fashion at unbeatable prices. Free shipping on all orders over $50.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop" className="bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95">
                Shop Now <ArrowRight size={20} />
              </Link>
              <Link href="/shop?sale=true" className="bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all active:scale-95">
                View Flash Sales
              </Link>
            </div>
            
            <div className="mt-10 flex items-center gap-4 text-sm font-medium text-slate-500">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-slate-400 border-2 border-white"></div>
              </div>
              <p>Trusted by <span className="font-bold text-slate-900">10,000+</span> customers</p>
            </div>
          </div>

          {/* Hero Image / Graphic */}
          <div className="relative h-[400px] lg:h-[600px] hidden lg:block">
            {/* You can replace this placeholder with a real featured product image later */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-slate-50 rounded-3xl border border-slate-200 shadow-2xl flex items-center justify-center overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
               <div className="text-center p-10">
                  <div className="text-8xl mb-4">🛍️</div>
                  <h3 className="text-2xl font-black text-slate-800">Premium Goods</h3>
                  <p className="text-slate-500 mt-2">New arrivals daily.</p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
""",

    # ==========================================
    # 3. APPLY HEADER TO USER LAYOUT
    # ==========================================
    "app/(shop)/layout.tsx": r""""use client";

import Header from '@/components/shop/Header';
import Footer from '@/components/shop/Footer';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* This ensures the Header appears on ALL user pages (Home, Shop, Checkout, Profile) */}
      <Header />
      
      <main className="flex-grow">
        {children}
      </main>
      
      {/* The Footer is now guaranteed to be on all user pages too! */}
      <Footer />
    </div>
  );
}
"""
}

def build_new_ui():
    print("Building the New UI Layout...")
    for file_path, content in FILES_TO_UPDATE.items():
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"✅ Created/Updated: {file_path}")
        
    print("\n🎉 DONE! Your new Header with the Profile Dropdown and the gorgeous new Hero section are live!")
    print("⚠️  NOTE: Check your `app/page.tsx` and `app/shop/page.tsx`. If they currently have `<Footer />` written inside them at the bottom, you can delete that line, because the new layout file now handles the Footer automatically for every page!")

if __name__ == "__main__":
    build_new_ui()