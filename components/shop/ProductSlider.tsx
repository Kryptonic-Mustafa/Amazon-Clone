"use client";
import React, { useRef } from 'react';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductSliderProps {
  title: string;
  products: any[];
  loading?: boolean;
}

export default function ProductSlider({ title, products, loading = false }: ProductSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.8;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group overflow-hidden">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>

      <button 
        onClick={() => scroll('left')}
        className="absolute left-2 top-[55%] -translate-y-1/2 z-10 bg-white shadow-[0_0_10px_rgba(0,0,0,0.1)] border border-gray-100 p-4 rounded-xl hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
      >
        <ChevronLeft size={24} className="text-gray-700" />
      </button>

      <div 
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="min-w-[280px] w-[280px] snap-start flex-shrink-0">
              <ProductSkeleton />
            </div>
          ))
        ) : products.length > 0 ? (
          products.map(p => (
            <div key={p.id} className="min-w-[280px] w-[280px] snap-start flex-shrink-0">
              <ProductCard product={p} />
            </div>
          ))
        ) : (
          <div className="w-full text-center text-gray-500 py-10">
            No products available at the moment.
          </div>
        )}
      </div>

      <button 
        onClick={() => scroll('right')}
        className="absolute right-2 top-[55%] -translate-y-1/2 z-10 bg-white shadow-[0_0_10px_rgba(0,0,0,0.1)] border border-gray-100 p-4 rounded-xl hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
      >
        <ChevronRight size={24} className="text-gray-700" />
      </button>
    </section>
  );
}
