"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/shop/Header'; // <--- 1. Import Header
import Footer from '@/components/shop/Footer'; // <--- 2. Import Footer
import FilterSidebar from '@/components/shop/FilterSidebar';
import ProductCard from '@/components/shop/ProductCard';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products whenever filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = searchParams.toString();
        const res = await fetch(`/api/shop/products?${query}`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed loading products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* 1. Header goes here */}
      <Header />

      {/* Main Layout Area */}
      <div className="flex-grow container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar (Hidden on mobile, often handled by a drawer, but kept simple here) */}
        <aside className="w-full md:w-64 flex-shrink-0 hidden md:block">
          <FilterSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Shop Products <span className="text-gray-500 text-lg font-normal">({products.length})</span>
            </h1>
            
            <select className="border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option>Sort by: Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
               {[...Array(8)].map((_, i) => (
                 <div key={i} className="bg-gray-200 h-80 rounded-xl"></div>
               ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-lg font-medium">No products found matching your filters.</p>
                  <button onClick={() => window.location.href='/shop'} className="mt-2 text-blue-600 hover:underline">
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 2. Footer goes here */}
      <Footer />
      
    </div>
  );
}