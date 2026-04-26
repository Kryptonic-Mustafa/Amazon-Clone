import os

FILES_TO_UPDATE = {
    # ==========================================
    # 1. THE MAIN SHOP PAGE (Logic Hub)
    # ==========================================
    "app/shop/page.tsx": r""""use client";

import { useEffect, useState } from 'react';
import ProductCard from '@/components/shop/ProductCard';
import FilterSidebar from '@/components/shop/FilterSidebar';
import { Loader2 } from 'lucide-react';
import Footer from '@/components/shop/Footer';

export default function ShopPage() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FILTER & SORT STATES ---
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('newest');

  // 1. Fetch Raw Data Once
  useEffect(() => {
    fetch('/api/shop/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllProducts(data);
          
          // Dynamically set the price slider max to the most expensive product
          const highestPrice = Math.max(...data.map(p => Number(p.price) || 0));
          if (highestPrice > 0) setMaxPrice(Math.ceil(highestPrice));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 2. THE MASTER FILTER & SORT ENGINE
  // This runs EVERY TIME a filter or sort option is clicked!
  useEffect(() => {
    let result = [...allProducts];

    // A. Filter by Category
    if (selectedCategory && selectedCategory !== 'All Products') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // B. Filter by Price
    result = result.filter(p => Number(p.price) <= maxPrice);

    // C. Filter by Brands (If any are checked)
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand || 'Generic'));
    }

    // D. Apply Sorting
    if (sortOption === 'price_asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price)); // Low to High
    } else if (sortOption === 'price_desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price)); // High to Low
    } else {
      // Newest (Sort by created_at date descending, fallback to highest ID)
      result.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        if (dateA === dateB) return b.id - a.id; 
        return dateB - dateA;
      });
    }

    // E. Set the final list to display
    setFilteredProducts(result);

  }, [allProducts, selectedCategory, maxPrice, selectedBrands, sortOption]); // <--- CRITICAL DEPENDENCIES

  // Dynamic Extractors for Sidebar
  const categories = ['All Products', ...Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)))];
  const brands = Array.from(new Set(allProducts.map(p => p.brand || 'Generic')));

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <FilterSidebar 
            categories={categories}
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
        <div className="flex-1">
          
          {/* Top Bar: Title & Dropdown */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800">
              Shop Products <span className="text-slate-400 text-lg font-normal ml-1">({filteredProducts.length})</span>
            </h1>
            
            <div className="relative w-full sm:w-auto">
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full sm:w-auto border border-slate-300 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-slate-50 hover:bg-white transition-colors appearance-none"
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

          {/* Product Grid Area */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-blue-600">
              <Loader2 className="animate-spin mb-4" size={48} />
              <p className="font-bold tracking-wider">LOADING COLLECTION...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center shadow-sm">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-2xl font-bold text-slate-800 mb-2">No exact matches found</p>
              <p className="text-slate-500 mb-8">Try widening your filters to see more amazing products.</p>
              <button 
                onClick={() => {
                  setSelectedCategory('All Products');
                  setMaxPrice(5000);
                  setSelectedBrands([]);
                  setSortOption('newest');
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
""",

    # ==========================================
    # 2. THE FILTER SIDEBAR (UI Component)
    # ==========================================
    "components/shop/FilterSidebar.tsx": r""""use client";

import React from 'react';

export default function FilterSidebar({
  categories, selectedCategory, setSelectedCategory,
  maxPrice, setMaxPrice,
  brands, selectedBrands, setSelectedBrands
}: any) {
  
  const handleBrandToggle = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter((b: string) => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-8 sticky top-24">
      
      {/* Categories */}
      <div>
        <h3 className="text-sm font-black text-blue-600 mb-4 tracking-widest uppercase">Categories</h3>
        <div className="space-y-1 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {categories.map((cat: string) => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`block w-full text-left text-sm py-2 px-3 rounded-lg transition-all font-medium ${
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
        <div className="flex justify-between items-end mb-4">
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
        <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
            <span>$0</span>
            <span>$5000+</span>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Brands */}
      <div>
        <h3 className="text-sm font-black text-blue-600 mb-4 tracking-widest uppercase">Brands</h3>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {brands.map((brand: string) => (
            <label key={brand} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandToggle(brand)}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
              />
              <span className={`text-sm transition-colors font-medium ${
                  selectedBrands.includes(brand) ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'
              }`}>
                  {brand}
              </span>
            </label>
          ))}
        </div>
      </div>

    </div>
  );
}
"""
}

def apply_shop_fixes():
    print("Fixing Shop Sorting and Filtering Logic...")
    for file_path, content in FILES_TO_UPDATE.items():
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"✅ Repaired: {file_path}")
        
    print("\n🎉 Shop page logic fixed! The Sorting Dropdown, Categories, Price Slider, and Brand Filters are now permanently linked to the display grid.")

if __name__ == "__main__":
    apply_shop_fixes()