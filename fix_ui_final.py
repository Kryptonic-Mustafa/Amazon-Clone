import os

FILES_TO_UPDATE = {
    # ==========================================
    # 1. PRODUCT CARD (Strict 'sale_flag' Logic)
    # ==========================================
    "components/shop/ProductCard.tsx": r""""use client";

import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();
  
  // --- STRICT SALE LOGIC ---
  // Look exactly at the sale_flag from your database screenshot
  const isSale = Number(product.sale_flag) === 1;

  const originalPrice = Number(product.compare_at_price || product.original_price || 0);
  const currentPrice = Number(product.price || 0);
  
  let discount = Number(product.discount_percent || product.discount || 0);
  if (discount === 0 && originalPrice > currentPrice) {
      discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }
  
  const imageSrc = product.image_urls ? product.image_urls.split(',')[0] : '/placeholder.png';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); 
    addToCart({ ...product, quantity: 1, image_urls: imageSrc });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      
      {/* TOP LEFT: Discount Percentage (STRICTLY IF sale_flag === 1) */}
      {isSale && discount > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
          -{discount}%
        </div>
      )}

      {/* TOP RIGHT: SALE Badge (STRICTLY IF sale_flag === 1) */}
      {isSale && (
        <div className="absolute top-3 right-3 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-sm tracking-wider uppercase shadow-sm">
          SALE
        </div>
      )}
      
      <Link href={`/shop/${product.id}`} className="block relative h-64 w-full bg-slate-50 p-6 overflow-hidden">
        <Image 
          src={imageSrc} 
          alt={product.name} 
          fill 
          className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
        />
      </Link>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
          {product.category || 'General'}
        </div>
        <Link href={`/shop/${product.id}`}>
          <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Ratings */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className={i < 4 ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200"} />
          ))}
          <span className="text-xs text-slate-500 ml-1">({product.rating || '4.0'})</span>
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div>
            {/* Show strikethrough original price ONLY if strictly on sale */}
            {isSale && (
              <div className="text-xs text-slate-400 line-through mb-0.5">
                ${originalPrice > 0 ? originalPrice.toFixed(2) : (currentPrice * (1 + (discount/100))).toFixed(2)}
              </div>
            )}
            <div className="text-xl font-black text-slate-900">
              ${currentPrice.toFixed(2)}
            </div>
          </div>
          
          <button 
            onClick={handleAdd}
            className="bg-slate-900 text-white p-3 rounded-xl hover:bg-blue-600 hover:shadow-lg transition-all active:scale-95"
            title="Add to Cart"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
""",

    # ==========================================
    # 2. FILTER SIDEBAR (Fixed Top Spacing)
    # ==========================================
    "components/shop/FilterSidebar.tsx": r""""use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
    // Changed 'top-24' to 'top-8' to remove the massive gap above the sidebar
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-6 sticky top-8 z-20">
      
      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="flex items-center gap-2 text-slate-700 hover:text-blue-700 font-bold transition-all w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 shadow-sm group"
      >
         <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform text-slate-500 group-hover:text-blue-600" /> 
         Back to Home
      </Link>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-black text-blue-600 mb-3 tracking-widest uppercase">Categories</h3>
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
        <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
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
""",

    # ==========================================
    # 3. SHOP PAGE (Solid Masking Sticky Header)
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

  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    fetch('/api/shop/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllProducts(data);
          const highestPrice = Math.max(...data.map(p => Number(p.price) || 0));
          if (highestPrice > 0) setMaxPrice(Math.ceil(highestPrice));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...allProducts];

    if (selectedCategory && selectedCategory !== 'All Products') {
      result = result.filter(p => p.category === selectedCategory);
    }
    result = result.filter(p => Number(p.price) <= maxPrice);
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand || 'Generic'));
    }

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
  }, [allProducts, selectedCategory, maxPrice, selectedBrands, sortOption]);

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
        <div className="flex-1 relative">
          
          {/* THE FIX: This outer div has 'bg-slate-50' (matching the page background).
            It acts as a solid physical mask so products scrolling underneath it become completely hidden.
            'pt-8 -mt-8' covers the top padding gap seamlessly.
          */}
          <div className="sticky top-0 z-30 bg-slate-50 pt-8 -mt-8 pb-4 mb-2">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <h1 className="text-2xl font-bold text-slate-800">
                Shop Products <span className="text-slate-400 text-lg font-normal ml-1">({filteredProducts.length})</span>
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
"""
}

def apply_shop_fixes():
    print("Applying Final UI Layout Repairs...")
    for file_path, content in FILES_TO_UPDATE.items():
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"✅ Fixed: {file_path}")
        
    print("\n🎉 DONE! The Shop Products header is now a solid sticky block, the sidebar aligns perfectly, and SALE badges respect your database flags.")

if __name__ == "__main__":
    apply_shop_fixes()