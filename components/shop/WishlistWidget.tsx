"use client";

import { useState } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { Heart, X, ShoppingCart, ExternalLink } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function WishlistWidget() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  if (wishlist.length === 0 && !isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* The Popover Panel */}
      {isOpen && (
        <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-80 md:w-96 mb-4 overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2"><Heart size={18} className="fill-red-500 text-red-500"/> My Favorites ({wishlist.length})</h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white"><X size={20}/></button>
          </div>
          
          <div className="max-h-96 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {wishlist.length === 0 ? (
              <p className="text-center text-slate-500 py-8 text-sm">Your wishlist is empty.</p>
            ) : (
              wishlist.map((item: any) => (
                <div key={item.id} className="flex gap-3 items-center group border-b border-slate-50 pb-3 last:border-0">
                  <img src={item.image_urls ? item.image_urls.split(',')[0] : '/placeholder.png'} alt={item.name} className="w-12 h-12 object-contain bg-slate-50 rounded-lg p-1" />
                  <div className="flex-1 overflow-hidden">
                    <Link href={`/shop/${item.id}`} className="text-sm font-bold text-slate-900 truncate block hover:text-blue-600">{item.name}</Link>
                    <p className="text-xs text-slate-500 font-medium">${Number(item.price).toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => addToCart({...item, quantity: 1})} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors" title="Add to Cart">
                      <ShoppingCart size={14} />
                    </button>
                    <button onClick={() => toggleWishlist(item)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors" title="Remove">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* The Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95 relative border-2 border-slate-700"
      >
        <Heart size={24} className={wishlist.length > 0 ? "fill-red-500 text-red-500" : ""} />
        {wishlist.length > 0 && (
          <span className="absolute -top-2 -left-2 bg-red-600 text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-slate-900 shadow-sm">
            {wishlist.length}
          </span>
        )}
      </button>
    </div>
  );
}
