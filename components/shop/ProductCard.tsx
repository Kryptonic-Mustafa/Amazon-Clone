"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const currentPrice = Number(product.price || 0);
  const discount = Number(product.discount_percent || 0);
  
  // STRICT SALE LOGIC: Must explicitly have sale_flag=1 AND a discount > 0
  const isSale = Number(product.sale_flag) === 1 && discount > 0;
  
  // Real Math: If current price is 180 and discount is 28%, old price is 250.
  const oldPrice = isSale ? (currentPrice / (1 - (discount / 100))) : currentPrice;

  const isLiked = isInWishlist(product.id);
  const imageSrc = product.image_urls ? product.image_urls.split(',')[0] : '/placeholder.png';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); 
    addToCart({ ...product, quantity: 1, image_urls: imageSrc });
    toast.success(`${product.name} added to cart!`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      
      {isSale && (
        <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
          -{discount}%
        </div>
      )}
      
      <button onClick={handleLike} className="absolute top-3 right-3 z-20 bg-white/80 backdrop-blur border border-slate-200 p-2 rounded-full shadow-sm hover:bg-white transition-all active:scale-95">
        <Heart size={18} className={`transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
      </button>

      <Link href={`/shop/${product.id}`} className="block relative h-64 w-full bg-slate-50 p-6 overflow-hidden">
        <Image src={imageSrc} alt={product.name} fill className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
      </Link>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">{product.category_name || product.category || product.brand || 'General'}</div>
        <Link href={`/shop/${product.id}`}><h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">{product.name}</h3></Link>
        
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < Math.round(Number(product.rating || 0)) ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200"} />)}
          <span className="text-xs text-slate-500 ml-1 font-bold">({Number(product.rating || 0).toFixed(1)})</span>
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div>
            {isSale && <div className="text-xs text-slate-400 line-through mb-0.5">${oldPrice.toFixed(2)}</div>}
            <div className="text-xl font-black text-slate-900">${currentPrice.toFixed(2)}</div>
          </div>
          <button onClick={handleAdd} className="bg-slate-900 text-white p-3 rounded-xl hover:bg-blue-600 hover:shadow-lg transition-all active:scale-95" title="Add to Cart">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
