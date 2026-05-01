"use client";

import { useEffect, useState } from 'react';
import HeroCarousel from '@/components/shop/HeroCarousel';
import DynamicCategories from '@/components/shop/DynamicCategories';
import TrustBadges from '@/components/shop/TrustBadges';
import RecentlyViewed from '@/components/shop/RecentlyViewed';
import ProductSlider from '@/components/shop/ProductSlider';
import { Sparkles } from 'lucide-react';

export default function LandingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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
    .filter((p: any) => p.sale_flag === 1 && p.discount_percent > 0)
    .slice(0, 10);

  // 2. Top Rated: Rating >= 4.0
  const topRatedProducts = productList
    .filter((p: any) => Number(p.rating) >= 4.0)
    .slice(0, 10);

  // 3. New Arrivals: Sort by newest
  const newArrivalProducts = [...productList]
    .sort((a, b) => {
      if (a.created_at && b.created_at) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return b.id - a.id;
    })
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pb-16">
      <HeroCarousel />
      <DynamicCategories />
      <TrustBadges />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 space-y-12">
        
        {/* Section 1: Flash Sales */}
        <ProductSlider 
          title="Flash Sales" 
          products={saleProducts} 
          loading={loading} 
        />

        {/* Section 2: Banner Strip */}
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 md:p-12 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between border border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6 md:mb-0">
            <div className="bg-blue-600 p-4 rounded-full shadow-lg shadow-blue-500/30 flex-shrink-0">
              <Sparkles size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-2">Join AmazonClone Prime</h3>
              <p className="text-gray-300 text-lg">Get free fast delivery on all orders over $50.</p>
            </div>
          </div>
          <button className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-yellow-300 hover:shadow-lg transition-all shadow-md whitespace-nowrap">
            Start Free Trial
          </button>
        </section>

        {/* Section 3: New Arrivals */}
        <ProductSlider 
          title="New Arrivals" 
          products={newArrivalProducts} 
          loading={loading} 
        />

        {/* Section 4: Top Rated */}
        <ProductSlider 
          title="Top Rated" 
          products={topRatedProducts} 
          loading={loading} 
        />

        {/* Section 5: Recently Viewed */}
        <RecentlyViewed />

      </main>
    </div>
  );
}