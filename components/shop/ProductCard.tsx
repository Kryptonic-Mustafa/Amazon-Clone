"use client";

import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import Link from 'next/link';

interface ProductProps {
  product: any;
}

export default function ProductCard({ product }: ProductProps) {
  // Logic to calculate final price
  const originalPrice = Number(product.price);
  const isOnSale = product.sale_flag === 1 && product.discount_percent > 0;
  
  const discountAmount = isOnSale ? (originalPrice * (product.discount_percent / 100)) : 0;
  const finalPrice = originalPrice - discountAmount;

  // Image handling
  const imageUrl = product.image_urls ? product.image_urls.split(',')[0] : (product.image || '/placeholder.png');

  return (
    <Link href={`/shop/${product.id}`} className="block h-full">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full relative cursor-pointer">
        
        {/* Image Container with SLANT FLICKER Animation */}
        <div className="relative h-56 w-full bg-gray-50 overflow-hidden">
          
          {/* SALE Badge */}
          {isOnSale && (
            <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
              -{product.discount_percent}%
            </span>
          )}
          
          {/* Product Image */}
          <Image 
            src={imageUrl} 
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />

          {/* THE FLICKER ANIMATION OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:animate-shine z-20 skew-x-12" />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-gray-800 font-medium line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors" title={product.name}>
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center space-x-1 text-yellow-400 text-sm mb-2">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < Math.floor(product.rating || 0) ? "text-yellow-400" : "text-gray-300"} />
            ))}
            <span className="text-blue-600 hover:underline text-xs ml-1 cursor-pointer">
              {Math.floor(Math.random() * 500) + 50}
            </span>
          </div>
          
          <div className="flex-grow"></div>

          {/* Price Row (No Buttons) */}
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-medium text-gray-900">
                <span className="text-xs align-top font-normal">$</span>
                {Math.floor(finalPrice)}
                <span className="text-xs align-top font-normal">{(finalPrice % 1).toFixed(2).substring(2)}</span>
              </span>

              {isOnSale && (
                <span className="text-sm text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {/* Prime-like label */}
            <div className="text-xs text-gray-500 mt-1">
              <span className="text-blue-600 font-bold">prime</span> <span className="text-gray-500">Two-Day</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}