"use client";

import React, { useEffect, useState } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/shop/ProductCard';
import Link from 'next/link';
import { HeartCrack, ShoppingBag } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50"></div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-12 max-w-7xl">
        <h1 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
          Your Wishlist
          <span className="text-xl font-normal text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
            {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
          </span>
        </h1>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center shadow-sm flex flex-col items-center">
            <div className="bg-red-50 text-red-500 p-6 rounded-full mb-6">
              <HeartCrack size={48} />
            </div>
            <p className="text-2xl font-bold text-slate-800 mb-2">Your wishlist is empty</p>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              You haven't saved any items yet. Browse our collection and click the heart icon to save items for later!
            </p>
            <Link 
              href="/shop"
              className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <ShoppingBag size={20} /> Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((item: any) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
