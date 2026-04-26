import os

FILES_TO_UPDATE = {
    # ==========================================
    # 1. THE NEW AMAZON-STYLE SEARCH BAR
    # ==========================================
    "components/shop/SearchBar.tsx": r""""use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaSearch, FaHistory, FaTimes } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const router = useRouter();
  const { user } = useAuth();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 1. Fetch products once for lightning-fast autocomplete
  useEffect(() => {
    fetch('/api/shop/products')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setProducts(data); })
      .catch(console.error);
  }, []);

  // 2. Load Recent Searches with Expiration Logic
  useEffect(() => {
    const key = user ? `recent_searches_${user.id}` : `recent_searches_guest`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If guest, clear history if older than 24 hours (86400000 ms)
        if (!user && parsed.timestamp && (Date.now() - parsed.timestamp > 86400000)) {
          localStorage.removeItem(key);
          setRecentSearches([]);
        } else {
          setRecentSearches(parsed.searches || parsed);
        }
      } catch(e) { setRecentSearches([]); }
    }
  }, [user]);

  // 3. Handle clicking outside the search bar to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 4. Generate Autocomplete Suggestions
  useEffect(() => {
    if (query.trim().length > 0) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        (p.category_name && p.category_name.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 6); // Max 6 suggestions
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query, products]);

  // 5. Save Search Logic
  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const key = user ? `recent_searches_${user.id}` : `recent_searches_guest`;
    // Keep max 5 recent searches, remove duplicates
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    
    // Save format based on login state
    const payload = user ? updated : { searches: updated, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(payload));
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const key = user ? `recent_searches_${user.id}` : `recent_searches_guest`;
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    
    const payload = user ? updated : { searches: updated, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(payload));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
        saveRecentSearch(query.trim());
        setIsFocused(false);
        router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={wrapperRef} className="relative hidden sm:flex flex-1 max-w-2xl mx-6">
      <form onSubmit={handleSearchSubmit} className="flex w-full h-10 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-yellow-400 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 transition-all">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search AmazonClone"
          className="w-full py-2 px-4 text-black outline-none border-none"
        />
        <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-5 transition-colors flex items-center justify-center">
          <FaSearch size={18} />
        </button>
      </form>

      {/* DROPDOWN MENU */}
      {isFocused && (query.trim().length > 0 || recentSearches.length > 0) && (
        <div className="absolute top-full mt-1 left-0 w-full bg-white text-black shadow-xl border border-gray-200 rounded-md overflow-hidden z-50">
          
          {/* Default State: Show Recent Searches */}
          {query.trim().length === 0 ? (
            <div className="py-2">
              <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Searches</div>
              {recentSearches.map((term, i) => (
                <div 
                  key={i} 
                  onClick={() => { setQuery(term); saveRecentSearch(term); setIsFocused(false); router.push(`/shop?q=${encodeURIComponent(term)}`); }} 
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex items-center text-gray-700 gap-3">
                    <FaHistory className="text-gray-400" />
                    <span className="font-medium">{term}</span>
                  </div>
                  <button onClick={(e) => removeRecentSearch(e, term)} className="text-gray-400 hover:text-red-500">
                    <FaTimes size={12}/>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Typing State: Show Product Suggestions */
            <div className="py-2">
              {suggestions.length > 0 ? suggestions.map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => { saveRecentSearch(query); setIsFocused(false); router.push(`/shop/${p.id}`); }} 
                  className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="w-10 h-10 relative flex-shrink-0 bg-white border border-gray-100 rounded overflow-hidden">
                    <Image src={p.image_urls ? p.image_urls.split(',')[0] : '/placeholder.png'} alt={p.name} fill className="object-contain p-1" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-bold text-gray-900 truncate">{p.name}</span>
                    <span className="text-xs text-blue-600 font-medium">{p.category_name || p.category || p.brand || 'Store Item'}</span>
                  </div>
                </div>
              )) : (
                <div className="px-4 py-4 text-sm text-gray-500 flex flex-col items-center justify-center">
                    <FaSearch size={24} className="text-gray-300 mb-2"/>
                    No products found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
""",

    # ==========================================
    # 2. YOUR ORIGINAL HEADER (Updated with Search Bar)
    # ==========================================
    "components/shop/Header.tsx": r""""use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import CartDrawer from "./CartDrawer";
import Link from "next/link";
import { FaShoppingCart, FaSearch, FaBars, FaUser, FaSignOutAlt, FaCog } from "react-icons/fa";
import SearchBar from "./SearchBar";

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
          
          <Link href="/" className="text-2xl font-bold text-white tracking-wide shrink-0">
            Amazon<span className="text-yellow-400">Clone</span>
          </Link>

          {/* THE NEW AMAZON SEARCH BAR */}
          <SearchBar />

          <div className="flex items-center space-x-5 shrink-0">

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
                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl py-2 z-20 text-gray-800 animate-in fade-in slide-in-from-top-2 border border-gray-100">
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
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 text-sm mt-1 border-t border-gray-100 font-medium"
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login" className="flex items-center space-x-1 hover:text-yellow-400 text-sm font-medium">
                <FaUser /> <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            <button onClick={() => setIsCartOpen(true)} className="relative flex items-center hover:text-yellow-400 transition-colors">
              <FaShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <button className="md:hidden text-xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <FaBars />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-800 py-2 border-t border-gray-700">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="block px-4 py-3 text-sm font-medium text-gray-200 hover:bg-gray-700 hover:text-yellow-400" onClick={() => setIsMobileMenuOpen(false)}>
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
""",

    # ==========================================
    # 3. SHOP PAGE (Catches the Search Query)
    # ==========================================
    "app/shop/page.tsx": r""""use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/shop/ProductCard';
import FilterSidebar from '@/components/shop/FilterSidebar';
import { Loader2 } from 'lucide-react';
import Footer from '@/components/shop/Footer';

// Fallback mapping
const FALLBACK_CATEGORY_MAP: Record<string, string> = {
  '1': 'Electronics', '2': 'Laptops', '3': 'Phones',
  '4': 'Fashion', '5': 'Jackets', '6': 'Dresses',
  '7': 'Attar', '8': 'ArtsStudio', '9': 'Abaya'
};

function ShopContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q'); // Gets the query from the URL

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    Promise.all([
      fetch('/api/shop/products').then(res => res.json()),
      fetch('/api/admin/categories').then(res => res.json()).catch(() => [])
    ]).then(([productsData, catsData]) => {
      
      let validCategories = [];
      if (Array.isArray(catsData) && catsData.length > 0) {
        validCategories = catsData;
        setDbCategories(validCategories);
      }

      if (Array.isArray(productsData)) {
        const enriched = productsData.map(p => {
          let catName = 'General';
          if (p.category_ids) {
            const firstId = String(p.category_ids).split(',')[0].trim();
            if (validCategories.length > 0) {
              const cat = validCategories.find((c: any) => String(c.id) === firstId);
              if (cat) catName = cat.name;
            } else {
              catName = FALLBACK_CATEGORY_MAP[firstId] || 'General';
            }
          }
          return { ...p, category_name: catName };
        });

        setAllProducts(enriched);
        const highestPrice = Math.max(...enriched.map(p => Number(p.price) || 0));
        if (highestPrice > 0) setMaxPrice(Math.ceil(highestPrice));
      }
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...allProducts];

    // --- 0. SEARCH QUERY FILTER (NEW!) ---
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.category_name && p.category_name.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // --- 1. CATEGORY FILTER ---
    if (selectedCategory && selectedCategory !== 'All Products') {
      result = result.filter(p => {
        if (p.category_name === selectedCategory) return true;
        if (!p.category_ids) return false;
        const ids = String(p.category_ids).split(',').map(id => id.trim());
        
        if (dbCategories.length > 0) {
          const catObj = dbCategories.find(c => c.name === selectedCategory);
          return catObj ? ids.includes(String(catObj.id)) : false;
        } else {
          return ids.some(id => FALLBACK_CATEGORY_MAP[id] === selectedCategory);
        }
      });
    }

    // --- 2. PRICE FILTER ---
    result = result.filter(p => Number(p.price) <= maxPrice);

    // --- 3. BRAND FILTER ---
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand || 'Generic'));
    }

    // --- 4. SORTING ---
    if (sortOption === 'price_asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price)); 
    } else if (sortOption === 'price_desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price)); 
    } else {
      result.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        if (dateA === dateB) return b.id - a.id; 
        return dateB - dateA;
      });
    }

    setFilteredProducts(result);
  }, [allProducts, selectedCategory, maxPrice, selectedBrands, sortOption, dbCategories, searchQuery]);

  let sidebarCategories = ['All Products'];
  if (dbCategories.length > 0) {
    sidebarCategories = ['All Products', ...dbCategories.map(c => c.name)];
  } else {
    const uniqueCats = Array.from(new Set(allProducts.map(p => p.category_name).filter(c => c && c !== 'General')));
    if(uniqueCats.length > 0) {
        sidebarCategories = ['All Products', ...uniqueCats];
    } else {
        sidebarCategories = ['All Products', 'Electronics', 'Fashion', 'Attar', 'ArtsStudio', 'Laptops'];
    }
  }

  const brands = Array.from(new Set(allProducts.map(p => p.brand || 'Generic').filter(Boolean)));

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <FilterSidebar 
            categories={sidebarCategories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            brands={brands}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
          />
        </div>

        {/* Right Content Area */}
        <div className="flex-1 relative">
          
          <div className="sticky top-0 z-30 bg-slate-50 pt-8 -mt-8 pb-4 mb-2">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <h1 className="text-2xl font-bold text-slate-800">
                {searchQuery ? `Results for "${searchQuery}"` : 'Shop Products'} 
                <span className="text-slate-400 text-lg font-normal ml-2">({filteredProducts.length})</span>
              </h1>
              
              <div className="relative w-full sm:w-auto">
                <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full sm:w-auto border border-slate-300 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-slate-50 hover:bg-white transition-colors appearance-none shadow-sm"
                >
                  <option value="newest">Sort by: Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-blue-600">
              <Loader2 className="animate-spin mb-4" size={48} />
              <p className="font-bold tracking-wider">LOADING COLLECTION...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center shadow-sm">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-2xl font-bold text-slate-800 mb-2">No exact matches found</p>
              <p className="text-slate-500 mb-8">Try widening your filters or changing your search term.</p>
              <button 
                onClick={() => {
                  setSelectedCategory('All Products');
                  setMaxPrice(5000);
                  setSelectedBrands([]);
                  setSortOption('newest');
                  // Remove search query from URL
                  window.history.pushState({}, '', '/shop');
                  window.location.reload();
                }}
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg active:scale-95"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Next.js 13+ requires useSearchParams to be wrapped in a Suspense boundary
export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-blue-600 font-bold">Loading...</div>}>
      <ShopContent />
    </Suspense>
  )
}
"""
}

def inject_search_feature():
    print("Building Amazon Search Feature...")
    for file_path, content in FILES_TO_UPDATE.items():
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"✅ Added/Updated: {file_path}")
        
    print("\n🎉 DONE! The Amazon Search bar is fully integrated into your original Header and connected to your Shop Page filters.")

if __name__ == "__main__":
    inject_search_feature()