"use client";

import { useEffect, useState } from 'react';
import HeroSection from '@/components/shop/HeroSection';
import Footer from '@/components/shop/Footer';
import ProductCard from '@/components/shop/ProductCard';
import Link from 'next/link';

export default function LandingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("newest");
  
  useEffect(() => {
    fetch('/api/shop/products')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        // SAFETY CHECK: Only update if data is actually an array
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error("API Error: Expected array but got:", data);
          setProducts([]); 
        }
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setProducts([]); 
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // SAFETY CHECK: Ensure products is an array before filtering
  const productList = Array.isArray(products) ? products : [];
  
  // Logic: 
  // 1. Sale Products: sale_flag is 1 AND discount > 0
  const saleProducts = productList
    .filter(p => p.sale_flag === 1 && p.discount_percent > 0)
    .slice(0, 4);

  // 2. Top Rated: Rating > 4.5
  const topRatedProducts = productList
    .filter(p => Number(p.rating) >= 4.0)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeroSection />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-12 space-y-16">
        
        {/* Section 1: Flash Sales */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-3xl font-bold text-gray-800 border-l-4 border-yellow-400 pl-4">
              Flash Sales
            </h2>
            <Link href="/shop" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
              View All Deals
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {loading ? (
              <p className="col-span-full text-center py-10 text-gray-500">Loading deals...</p>
            ) : saleProducts.length > 0 ? (
              saleProducts.map(p => <ProductCard key={p.id} product={p} />)
            ) : (
              <div className="col-span-full text-center text-gray-400 py-10 bg-white rounded-lg border border-dashed border-gray-300">
                No active sales right now. Check back later!
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Banner Strip */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-10 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold mb-2">Join AmazonClone Prime</h3>
            <p className="text-blue-100 text-lg">Get free fast delivery on all orders over $50.</p>
          </div>
          <button className="mt-6 md:mt-0 bg-white text-blue-700 px-8 py-3 rounded-full font-bold hover:bg-gray-100 hover:shadow-lg transition-all">
            Start Free Trial
          </button>
        </section>

        {/* Section 3: Top Rated */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-3xl font-bold text-gray-800 border-l-4 border-green-500 pl-4">
              Top Rated
            </h2>
            <Link href="/shop" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
              View All Products
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {loading ? (
              <p className="col-span-full text-center py-10 text-gray-500">Loading products...</p>
            ) : topRatedProducts.length > 0 ? (
              topRatedProducts.map(p => <ProductCard key={p.id} product={p} />)
            ) : (
              <div className="col-span-full text-center text-gray-400 py-10 bg-white rounded-lg border border-dashed border-gray-300">
                Check back later for top products.
              </div>
            )}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}