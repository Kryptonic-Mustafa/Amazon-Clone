"use client";

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
