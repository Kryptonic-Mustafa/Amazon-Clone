"use client";

import { useEffect, useState } from 'react';
import ProductCard from '@/components/shop/ProductCard';
import FilterSidebar from '@/components/shop/FilterSidebar';
import { Loader2, X } from 'lucide-react';
import { useShopFilter } from '@/context/ShopFilterContext';

export default function ShopPage() {
  const { 
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    maxPrice, setMaxPrice,
    selectedBrands, setSelectedBrands,
    sortOption, setSortOption,
    clearFilters
  } = useShopFilter();

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial Data Fetch
  useEffect(() => {
    Promise.all([
      fetch('/api/shop/products').then(res => res.json()),
      fetch('/api/admin/categories').then(res => res.json()).catch(() => [])
    ]).then(([productsData, catsData]) => {
      if (Array.isArray(catsData)) setDbCategories(catsData);
      if (Array.isArray(productsData)) {
        // Enrich products with category names from db
        const enriched = productsData.map((p: any) => {
          let catName = 'General';
          if (p.category_ids && Array.isArray(catsData)) {
            const firstId = String(p.category_ids).split(',')[0].trim();
            const cat = catsData.find((c: any) => String(c.id) === firstId);
            if (cat) catName = cat.name;
          }
          return { ...p, category_name: catName };
        });
        setAllProducts(enriched);
      }
    }).finally(() => setLoading(false));
  }, []);

  // Client-side Filtering Logic
  useEffect(() => {
    let result = [...allProducts];

    // 1. Search Query Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p: any) => 
        p.name.toLowerCase().includes(q) || 
        (p.category_name && p.category_name.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // 2. Category Filter
    if (selectedCategory && selectedCategory !== 'All Products') {
      result = result.filter((p: any) => {
        if (p.category_name === selectedCategory) return true;
        if (!p.category_ids) return false;
        const ids = String(p.category_ids).split(',').map((id: any) => id.trim());
        const catObj = dbCategories.find(c => c.name === selectedCategory);
        return catObj ? ids.includes(String(catObj.id)) : false;
      });
    }

    // 3. Price Filter
    result = result.filter((p: any) => Number(p.price) <= maxPrice);

    // 4. Brand Filter
    if (selectedBrands.length > 0) {
      result = result.filter((p: any) => selectedBrands.includes(p.brand || 'Generic'));
    }

    // 5. Sorting
    if (sortOption === 'price_asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOption === 'price_desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else {
      result.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
    }

    setFilteredProducts(result);
  }, [allProducts, selectedCategory, maxPrice, selectedBrands, sortOption, searchQuery, dbCategories]);

  const sidebarCategories = ['All Products', ...dbCategories.map((c: any) => c.name)];
  const brands = Array.from(new Set(allProducts.map((p: any) => p.brand || 'Generic').filter(Boolean)));

  return (
    <main className="flex-grow container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <FilterSidebar 
          categories={sidebarCategories}
          brands={brands}
        />
      </div>

      {/* Product Grid Area */}
      <div className="flex-1 relative">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-slate-50 pt-8 -mt-8 pb-4 mb-2">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800">
              {searchQuery ? `Results for "${searchQuery}"` : 'Shop Products'} 
              <span className="text-slate-400 text-lg font-normal ml-2">({filteredProducts.length})</span>
            </h1>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Active Search Badge */}
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  <X size={12} /> Search: {searchQuery}
                </button>
              )}
              
              <div className="relative flex-1 sm:flex-none">
                <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-slate-50 hover:bg-white transition-colors appearance-none shadow-sm"
                >
                  <option value="newest">Sort by: Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-blue-600">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-bold tracking-wider uppercase">Loading Collection...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center shadow-sm">
            <p className="text-2xl font-bold text-slate-800 mb-2">No exact matches found</p>
            <p className="text-slate-500 mb-6">Try adjusting your filters or search terms.</p>
            <button 
              onClick={clearFilters}
              className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg active:scale-95"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
