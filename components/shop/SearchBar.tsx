"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaSearch, FaHistory, FaTimes } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useShopFilter } from '@/context/ShopFilterContext';

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const router = useRouter();
  const { user } = useAuth();
  const { setSearchQuery } = useShopFilter();
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
        setSearchQuery(query.trim());
        router.push(`/shop`);
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
                  onClick={() => { setQuery(term); saveRecentSearch(term); setIsFocused(false); setSearchQuery(term); router.push(`/shop`); }} 
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
                  onClick={() => { saveRecentSearch(p.name); setQuery(p.name); setIsFocused(false); setSearchQuery(p.name); router.push(`/shop`); }} 
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
