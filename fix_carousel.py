import os

FILES_TO_UPDATE = {
    # ==========================================
    # 1. PRODUCT CARD (Forces Clicks & Matches Your UI)
    # ==========================================
    "components/shop/ProductCard.tsx": r""""use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product }: { product: any }) {
  const router = useRouter();
  
  const isSale = Number(product.sale_flag) === 1;
  const originalPrice = Number(product.compare_at_price || product.original_price || 0);
  const currentPrice = Number(product.price || 0);
  
  let discount = Number(product.discount_percent || product.discount || 0);
  if (discount === 0 && originalPrice > currentPrice) {
      discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }
  
  const imageSrc = product.image_urls ? product.image_urls.split(',')[0] : '/placeholder.png';

  const handleViewClick = (e: React.MouseEvent | React.PointerEvent | React.TouchEvent) => {
    // THIS IS THE MAGIC FIX: Stops the carousel from stealing the click!
    e.preventDefault(); 
    e.stopPropagation(); 
    router.push(`/shop/${product.id}`);
  };

  return (
    <div className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full w-full">
      
      {isSale && discount > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
          -{discount}%
        </div>
      )}

      {isSale && (
        <div className="absolute top-3 right-3 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-sm tracking-wider uppercase shadow-sm">
          SALE
        </div>
      )}
      
      <div 
        onClick={handleViewClick}
        className="block relative h-64 w-full bg-slate-50 p-6 overflow-hidden cursor-pointer"
      >
        <Image 
          src={imageSrc} 
          alt={product.name} 
          fill 
          className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
        />
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1">
          {product.brand || product.category_name || 'General'}
        </div>
        <div 
          onClick={handleViewClick}
          className="font-medium text-slate-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer"
        >
          {product.name}
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            {isSale && (
              <div className="text-xs text-slate-400 line-through mb-0.5">
                ${originalPrice > 0 ? originalPrice.toFixed(2) : (currentPrice * (1 + (discount/100))).toFixed(2)}
              </div>
            )}
            <div className="text-xl font-black text-slate-900 tracking-tight">
              ${currentPrice.toFixed(2)}
            </div>
          </div>
          
          {/* THE BUTTON FIX: Forced cursor-pointer, high z-index, event stoppers */}
          <button 
            onClick={handleViewClick}
            onPointerDown={handleViewClick}
            className="relative z-50 cursor-pointer bg-[#0f172a] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 hover:shadow-lg transition-all active:scale-95 pointer-events-auto"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}
""",

    # ==========================================
    # 2. LANDING PAGE (Smooth Native Carousel)
    # ==========================================
    "app/page.tsx": r""""use client";

import { useEffect, useState } from 'react';
import HeroSection from '@/components/shop/HeroSection';
import Footer from '@/components/shop/Footer';
import ProductCard from '@/components/shop/ProductCard';
import Link from 'next/link';

export default function LandingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/shop/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const productList = Array.isArray(products) ? products : [];
  
  const saleProducts = productList.filter(p => Number(p.sale_flag) === 1).slice(0, 8);
  const topRatedProducts = productList.filter(p => Number(p.rating) >= 4.0).slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <HeroSection />

      <main className="flex-grow container mx-auto px-4 py-12 space-y-16 max-w-7xl">
        
        {/* Section 1: Flash Sales */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-3xl font-bold text-slate-800 border-l-4 border-yellow-400 pl-4">
              Flash Sales
            </h2>
            <Link href="/shop" className="text-blue-600 hover:text-blue-800 font-bold hover:underline text-sm uppercase tracking-wider">
              View All Deals
            </Link>
          </div>
          
          {/* NATIVE SCROLL CAROUSEL: No javascript dragging needed, native touch support, pauses on hover */}
          <div className="flex overflow-x-auto gap-6 pb-8 pt-2 snap-x snap-mandatory scroll-smooth group hover:[animation-play-state:paused] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {loading ? (
              <p className="w-full text-center py-10 text-slate-500">Loading deals...</p>
            ) : saleProducts.length > 0 ? (
              saleProducts.map(p => (
                <div key={p.id} className="min-w-[280px] sm:min-w-[320px] snap-start shrink-0">
                    <ProductCard product={p} />
                </div>
              ))
            ) : (
              <div className="w-full text-center text-slate-400 py-10 bg-white rounded-xl border border-dashed border-slate-300">
                No active sales right now. Check back later!
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Banner Strip */}
        <section className="bg-gradient-to-r from-slate-900 to-[#0f172a] text-white p-10 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 className="text-3xl font-black mb-2 tracking-tight">Join AmazonClone Prime</h3>
            <p className="text-slate-300 text-lg font-medium">Get free fast delivery on all orders over $50.</p>
          </div>
          <button className="mt-6 md:mt-0 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95">
            Start Free Trial
          </button>
        </section>

        {/* Section 3: Top Rated */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-3xl font-bold text-slate-800 border-l-4 border-green-500 pl-4">
              Top Rated
            </h2>
            <Link href="/shop" className="text-blue-600 hover:text-blue-800 font-bold hover:underline text-sm uppercase tracking-wider">
              Explore Collection
            </Link>
          </div>
          
          {/* NATIVE SCROLL CAROUSEL */}
          <div className="flex overflow-x-auto gap-6 pb-8 pt-2 snap-x snap-mandatory scroll-smooth group hover:[animation-play-state:paused] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {loading ? (
              <p className="w-full text-center py-10 text-slate-500">Loading products...</p>
            ) : topRatedProducts.length > 0 ? (
              topRatedProducts.map(p => (
                <div key={p.id} className="min-w-[280px] sm:min-w-[320px] snap-start shrink-0">
                    <ProductCard product={p} />
                </div>
              ))
            ) : (
              <div className="w-full text-center text-slate-400 py-10 bg-white rounded-xl border border-dashed border-slate-300">
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
"""
}

def apply_carousel_fixes():
    print("Fixing Carousel Clicks & View Buttons...")
    for file_path, content in FILES_TO_UPDATE.items():
        # Ensure directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        # Write the file
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"✅ Repaired: {file_path}")
        
    print("\n🎉 DONE! The 'View' button is now highly clickable, ignores drag events, and the Landing Page uses a sleek horizontal native touch-carousel.")

if __name__ == "__main__":
    apply_carousel_fixes()