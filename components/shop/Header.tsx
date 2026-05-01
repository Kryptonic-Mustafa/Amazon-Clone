"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useSettings } from "@/context/SettingsContext";
import { useWishlist } from "@/context/WishlistContext";
import { useShopFilter } from "@/context/ShopFilterContext";
import CartDrawer from "./CartDrawer";
import Link from "next/link";
import { FaShoppingCart, FaUser, FaSignOutAlt, FaCog, FaGlobe, FaMoneyBillWave, FaBars, FaHeart } from "react-icons/fa";
import SearchBar from "./SearchBar";

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { totalItems } = useCart(); 
  const { wishlist } = useWishlist();
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { settings } = useSettings();
  const { clearFilters } = useShopFilter();

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* LOGO */}
          <Link href="/" onClick={clearFilters} className="text-xl font-bold flex items-center gap-2 shrink-0">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-8 object-contain" />
            ) : (
              <span className="text-yellow-400">{settings?.website_name || "AmazonClone"}</span>
            )}
          </Link>

          {/* SEARCH & NAV */}
          <div className="flex-1 flex items-center gap-6">
            <div className="flex-1 max-w-2xl">
              <SearchBar />
            </div>
            <nav className="hidden xl:flex items-center space-x-6 text-sm font-bold uppercase tracking-wider">
              <Link href="/shop" onClick={clearFilters} className="hover:text-yellow-400 transition-colors">Shop</Link>
              <Link href="/contact" className="hover:text-yellow-400 transition-colors">Contact</Link>
            </nav>
          </div>

          {/* RIGHT ICONS */}
          <div className="flex items-center space-x-5 shrink-0">
            {/* Lang/Currency */}
            <div className="hidden lg:flex items-center gap-4 border-r border-slate-700 pr-4 text-xs font-bold">
              <div className="flex items-center gap-1">
                <FaGlobe className="text-yellow-400"/>
                <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent outline-none text-white cursor-pointer">
                  <option value="en" className="text-black">EN</option>
                  <option value="ar" className="text-black">AR</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <FaMoneyBillWave className="text-yellow-400"/>
                <select value={currency} onChange={(e) => setCurrency(e.target.value as any)} className="bg-transparent outline-none text-white cursor-pointer">
                  <option value="USD" className="text-black">USD</option>
                  <option value="KWD" className="text-black">KWD</option>
                </select>
              </div>
            </div>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative hover:text-yellow-400">
              <FaHeart size={22} />
              {wishlist?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Profile */}
            <div className="relative">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-400 text-slate-900 flex items-center justify-center font-bold">
                  {user ? user.name[0].toUpperCase() : <FaUser size={14}/>}
                </div>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white text-slate-900 rounded-xl shadow-xl py-2 border border-slate-100 z-50">
                  {user ? (
                    <>
                      <Link href="/profile" className="block px-4 py-2 hover:bg-slate-50 font-bold">My Profile</Link>
                      <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-bold">Logout</button>
                    </>
                  ) : (
                    <Link href="/login" className="block px-4 py-2 hover:bg-slate-50 font-bold">Login</Link>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <button onClick={() => setIsCartOpen(true)} className="relative hover:text-yellow-400">
              <FaShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
