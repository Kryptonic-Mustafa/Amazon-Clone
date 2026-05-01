"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useShopFilter } from '@/context/ShopFilterContext';

const BANNERS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    title: 'Summer Sale is Live!',
    subtitle: 'Get up to 50% off on top electronics and fashion brands.',
    cta: 'Shop Now',
    link: '/shop',
    category: 'All Products',
    color: 'text-yellow-400'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    title: 'Tech Gadgets',
    subtitle: 'Upgrade your workspace with the latest technology.',
    cta: 'Explore Tech',
    link: '/shop',
    category: 'Electronics',
    color: 'text-blue-400'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80',
    title: 'New Arrivals in Fashion',
    subtitle: 'Discover the trending styles for this season.',
    cta: 'View Collection',
    link: '/shop',
    category: 'Fashion',
    color: 'text-pink-400'
  }
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setSelectedCategory, clearFilters } = useShopFilter();
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);

  const handleCTAClick = (e: React.MouseEvent, banner: any) => {
    e.preventDefault();
    if (banner.category === 'All Products') {
      clearFilters();
    } else {
      setSelectedCategory(banner.category);
    }
    router.push('/shop');
  };

  return (
    <div className="relative bg-gray-900 h-[400px] md:h-[500px] lg:h-[600px] w-full overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[10000ms] scale-105 group-hover:scale-100"
            style={{ backgroundImage: `url(${BANNERS[currentIndex].image})` }}
          />
          {/* Gradient Overlay for better text readability */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
          
          {/* Content */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10 flex flex-col justify-center">
            <div className="max-w-2xl md:pl-12">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 leading-tight"
              >
                {BANNERS[currentIndex].title.split(' ').map((word, i, arr) => (
                  i === arr.length - 1 ? <span key={i} className={BANNERS[currentIndex].color}> {word}</span> : <span key={i}>{word} </span>
                ))}
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-2xl text-gray-200 mb-10"
              >
                {BANNERS[currentIndex].subtitle}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Link 
                  href="/shop"
                  onClick={(e) => handleCTAClick(e, BANNERS[currentIndex])}
                  className="bg-white text-gray-900 font-bold text-lg py-4 px-10 rounded-full hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] inline-block"
                >
                  {BANNERS[currentIndex].cta}
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft size={32} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight size={32} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-16 lg:bottom-24 left-1/2 -translate-y-1/2 z-20 flex gap-3">
        {BANNERS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
