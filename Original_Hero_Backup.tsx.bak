"use client";
import Link from 'next/link';

export default function HeroSection() {
  return (
    <div className="relative bg-gray-900 h-[500px] flex items-center overflow-hidden">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center"
      />
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
          Summer Sale is <span className="text-yellow-400">Live!</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-lg animate-fade-in-up delay-100">
          Get up to 50% off on top electronics and fashion brands. Limited time offer.
        </p>
        <Link 
          href="/shop"
          className="bg-yellow-400 text-black font-bold py-3 px-8 rounded-full hover:bg-yellow-500 transition-transform transform hover:scale-105 inline-block shadow-lg"
        >
          Shop Now
        </Link>
      </div>
    </div>
  );
}