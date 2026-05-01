"use client";
import React, { useState } from 'react';
import Image from 'next/image';

export default function ImageMagnifier({ src, alt }: { src: string, alt: string }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    // Calculate percentage position
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  return (
    <div 
      className="relative w-full h-full cursor-crosshair overflow-hidden rounded-2xl bg-white"
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Base Image */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${showMagnifier ? 'opacity-0' : 'opacity-100'}`}>
        <Image src={src} alt={alt} fill className="object-contain p-8" />
      </div>

      {/* Magnified Image (Inline) */}
      <div 
        className={`absolute inset-0 z-50 bg-white transition-opacity duration-300 ${showMagnifier ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{
          backgroundImage: `url(${src})`,
          backgroundPosition: `${position.x}% ${position.y}%`,
          backgroundSize: '250%',
          backgroundRepeat: 'no-repeat'
        }}
      />
    </div>
  );
}
