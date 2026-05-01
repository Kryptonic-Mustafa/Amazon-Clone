"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useShopFilter } from '@/context/ShopFilterContext';

export default function FilterSidebar({ categories, brands }: { categories: string[], brands: string[] }) {
  const { 
    selectedCategory, setSelectedCategory, 
    maxPrice, setMaxPrice, 
    selectedBrands, setSelectedBrands,
    clearFilters
  } = useShopFilter();
  
  const handleBrandToggle = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter((b: string) => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-6 sticky top-8 z-20">
      
      {/* Back to Home Button */}
      <Link 
        href="/" 
        onClick={clearFilters}
        className="flex items-center gap-2 text-slate-700 hover:text-blue-700 font-bold transition-all w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 shadow-sm group"
      >
         <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform text-slate-500 group-hover:text-blue-600" /> 
         Back to Home
      </Link>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-black text-blue-600 mb-3 tracking-widest uppercase">Categories</h3>
        <div className="space-y-1 max-h-64 overflow-y-auto pr-2 custom-scrollbar text-xs">
          {categories.map((cat: string) => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`block w-full text-left py-2 px-3 rounded-lg transition-all font-medium ${
                selectedCategory === cat 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Price Slider */}
      <div>
        <div className="flex justify-between items-end mb-3">
            <h3 className="text-sm font-black text-blue-600 tracking-widest uppercase">Max Price</h3>
            <span className="text-slate-900 font-bold bg-slate-100 px-2 py-1 rounded-md text-xs">
                ${maxPrice}
            </span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="5000" 
          step="50"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-slate-900 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
            <span>$0</span>
            <span>$5000+</span>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Brands */}
      <div>
        <h3 className="text-sm font-black text-blue-600 mb-3 tracking-widest uppercase">Brands</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {brands.map((brand: string) => (
            <label key={brand} className="flex items-center gap-3 cursor-pointer group py-1">
              <input 
                type="checkbox" 
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandToggle(brand)}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
              />
              <span className={`text-xs transition-colors font-medium ${
                  selectedBrands.includes(brand) ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'
              }`}>
                  {brand}
              </span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Clear Filters Button */}
      <button 
        onClick={clearFilters}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-slate-900 text-slate-900 rounded-xl font-bold hover:bg-slate-900 hover:text-white transition-all active:scale-95 text-sm"
      >
        <RotateCcw size={16} /> Reset Filters
      </button>

    </div>
  );
}
