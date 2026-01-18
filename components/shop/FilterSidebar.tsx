"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [priceRange, setPriceRange] = useState(1000);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // Dynamic Categories

  useEffect(() => {
    // 1. Fetch Brands
    fetch('/api/shop/brands').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setBrands(data);
    });

    // 2. Fetch Categories
    fetch('/api/admin/categories').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setCategories(data);
    });
  }, []);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if(value) params.set(key, value);
    else params.delete(key);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <aside className="w-full md:w-64 bg-white p-4 border-r min-h-screen hidden md:block">
      <h2 className="text-xl text-blue-500 font-bold mb-6">Filters</h2>

      {/* Categories (Dynamic) */}
      <div className="mb-6">
        <h3 className="font-semibold text-blue-500 mb-2">Categories</h3>
        <ul className="space-y-2 text-sm text-gray-600 max-h-48 overflow-y-auto custom-scrollbar">
          <li className="cursor-pointer hover:text-blue-600 font-medium" onClick={() => updateFilter('category', '')}>
            All Products
          </li>
          {categories.map(cat => {
            const isActive = searchParams.get('category') === cat.id.toString();
            return (
              <li 
                key={cat.id} 
                className={`cursor-pointer hover:text-blue-600 flex items-center gap-2 ${isActive ? 'text-blue-600 font-bold' : ''}`} 
                onClick={() => updateFilter('category', cat.id.toString())}
              >
                {cat.name}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="font-semibold text-green-800 mb-2">Max Price: ${priceRange}</h3>
        <input 
          type="range" 
          min="0" 
          max="3000" 
          value={priceRange} 
          onChange={(e) => setPriceRange(Number(e.target.value))}
          onMouseUp={() => updateFilter('maxPrice', priceRange.toString())}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Brands (Dynamic) */}
      <div className="mb-6">
        <h3 className="font-semibold text-blue-700 mb-2">Brands</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
           {brands.length === 0 ? (
             <p className="text-xs text-gray-400">No brands found</p>
           ) : (
             brands.map(brand => (
              <label key={brand} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input 
                  type="checkbox" 
                  checked={searchParams.get('brand') === brand}
                  onChange={(e) => updateFilter('brand', e.target.checked ? brand : '')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{brand}</span>
              </label>
             ))
           )}
        </div>
      </div>
    </aside>
  );
}