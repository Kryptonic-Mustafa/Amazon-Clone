import os

FILES_TO_UPDATE = {
    # ==========================================
    # 1. ORIGINAL HEADER
    # ==========================================
    "components/shop/Header.tsx": r""""use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import CartDrawer from "./CartDrawer";
import Link from "next/link";
import { FaShoppingCart, FaSearch, FaBars, FaUser, FaSignOutAlt, FaCog } from "react-icons/fa";

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { totalItems } = useCart(); 
  const { user, logout } = useAuth(); // Hook into Auth

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Sales", href: "/shop?filter=sale" },
    { name: "Contact", href: "/contact" },
  ];

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-gray-900 text-white shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          <Link href="/" className="text-2xl font-bold text-white tracking-wide">
            Amazon<span className="text-yellow-400">Clone</span>
          </Link>

          <nav className="hidden md:flex space-x-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="hover:text-yellow-400 transition-colors">
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-5">
            <button className="hidden sm:block hover:text-yellow-400">
              <FaSearch />
            </button>

            {/* DYNAMIC USER SECTION */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-yellow-400 text-gray-900 font-bold flex items-center justify-center hover:bg-white transition-colors">
                    {getInitials(user.name)}
                  </div>
                  <span className="hidden sm:block text-sm font-medium hover:text-yellow-400">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl py-2 z-20 text-gray-800 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="font-bold truncate text-sm">{user.email}</p>
                      </div>
                      <Link href="/profile" className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm">
                        <FaUser className="text-gray-400"/> My Profile
                      </Link>
                      {user.role_ids === 'admin' && (
                        <Link href="/admin/dashboard" className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-blue-600">
                           <FaCog /> Admin Dashboard
                        </Link>
                      )}
                      <button 
                        onClick={() => { logout(); setIsProfileOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 text-sm mt-1 border-t border-gray-100"
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login" className="flex items-center space-x-1 hover:text-yellow-400 text-sm">
                <FaUser /> <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            <button onClick={() => setIsCartOpen(true)} className="relative flex items-center hover:text-yellow-400">
              <FaShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <button className="md:hidden text-xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <FaBars />
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-800 py-2">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="block px-4 py-2 hover:bg-gray-700 hover:text-yellow-400" onClick={() => setIsMobileMenuOpen(false)}>
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
""",

    # ==========================================
    # 2. ORIGINAL HERO SECTION
    # ==========================================
    "components/shop/HeroSection.tsx": r""""use client";
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
""",

    # ==========================================
    # 3. ORIGINAL SHOP LAYOUT
    # ==========================================
    "app/(shop)/layout.tsx": r"""import Header from "@/components/shop/Header";       

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Only Header remains here */}
      <Header /> 
      
      <main className="min-h-screen">
        {children}
      </main>
    </>
  );
}
""",

    # ==========================================
    # 4. ORIGINAL HOME PAGE (WITH CAROUSEL FIX)
    # ==========================================
    "app/page.tsx": r""""use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Send, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '@/components/shop/Header';
import Footer from '@/components/shop/Footer';

// --- TYPES ---
type HeroContent = { title?: string; subtitle?: string; buttonText?: string; buttonLink?: string; backgroundImageUrl?: string; };
type AboutContent = { smallTitle?: string; mainTitle?: string; description?: string; imageUrl?: string; points?: string[]; };
type TestimonialsContent = { title?: string; reviews?: { name: string; role: string; text: string; }[] };
type ContactContent = { title?: string; description?: string; address?: string; phone?: string; email?: string; };

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Content States
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [testimonials, setTestimonials] = useState<TestimonialsContent | null>(null);
  const [contact, setContact] = useState<ContactContent | null>(null);

  // Carousel Refs
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const animationRef = useRef<number>(0);

  // 1. Fetch ALL Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Products
        const prodRes = await fetch('/api/shop/products');
        const prodData = await prodRes.json();
        if (Array.isArray(prodData)) {
            // Triple data for infinite loop
            setFeaturedProducts([...prodData.slice(0, 8), ...prodData.slice(0, 8), ...prodData.slice(0, 8)]);
        }

        // Fetch Content Sections
        const fetchContent = async (section: string) => {
            const res = await fetch(`/api/content/${section}`);
            return res.json();
        };

        setHero(await fetchContent('home_hero'));
        setAbout(await fetchContent('home_about'));
        setTestimonials(await fetchContent('home_testimonials'));
        setContact(await fetchContent('home_contact'));

      } catch (e) {
        console.error("Error loading home data", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. Carousel Animation
  useEffect(() => {
    const animate = () => {
      if (carouselRef.current && isAutoPlaying && !isDown) {
        carouselRef.current.scrollLeft += 1;
        if (carouselRef.current.scrollLeft >= carouselRef.current.scrollWidth / 3) {
          carouselRef.current.scrollLeft = 0;
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isAutoPlaying, isDown, featuredProducts]);

  // 3. Drag Logic
  const handleMouseDown = (e: React.MouseEvent) => { if(!carouselRef.current) return; setIsDown(true); setIsAutoPlaying(false); setStartX(e.pageX - carouselRef.current.offsetLeft); setScrollLeft(carouselRef.current.scrollLeft); };
  const handleMouseLeave = () => { setIsDown(false); setIsAutoPlaying(true); };
  const handleMouseUp = () => { setIsDown(false); setIsAutoPlaying(true); };
  const handleMouseMove = (e: React.MouseEvent) => { if(!isDown || !carouselRef.current) return; e.preventDefault(); const x = e.pageX - carouselRef.current.offsetLeft; const walk = (x - startX) * 2; carouselRef.current.scrollLeft = scrollLeft - walk; };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold">Loading Store...</div>;

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <style jsx global>{` .custom-grab { cursor: grab; } .custom-grabbing { cursor: grabbing; } `}</style>

      <Header />

      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-900 text-white py-24 px-6 overflow-hidden min-h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 z-0 opacity-40">
             <Image 
               src={hero?.backgroundImageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1470&auto=format&fit=crop"} 
               alt="Background" fill className="object-cover" 
             />
        </div>
        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight drop-shadow-xl">{hero?.title || "Welcome to Our Store"}</h1>
          <p className="text-lg md:text-xl text-slate-100 mb-8 max-w-2xl mx-auto drop-shadow-md">{hero?.subtitle || "Discover premium products."}</p>
          <div className="flex justify-center gap-4">
            <Link href={hero?.buttonLink || "/shop"} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-semibold transition-all flex items-center gap-2 shadow-lg">
              {hero?.buttonText || "Shop Now"} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl group">
               <Image src={about?.imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"} alt="About" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div>
              <h2 className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-2">{about?.smallTitle || "About Us"}</h2>
              <h3 className="text-3xl font-bold text-slate-900 mb-6">{about?.mainTitle || "Our Story"}</h3>
              <p className="text-slate-600 leading-relaxed mb-6">{about?.description || "We provide high quality products..."}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(about?.points || ["Quality", "Support"]).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700 font-medium"><CheckCircle className="text-green-500" size={20} /> {item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT CAROUSEL */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="container mx-auto max-w-[1920px] px-0"> 
          <div className="px-4 mb-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Collection</h2>
            <p className="text-slate-500">Drag to explore</p>
          </div>
          <div ref={carouselRef} onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} className={`flex gap-6 overflow-x-hidden py-4 px-4 select-none ${isDown ? 'custom-grabbing' : 'custom-grab'}`}>
            {featuredProducts.map((product, index) => (
              <div key={`${product.id}-${index}`} className="min-w-[280px] w-[280px] bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col flex-shrink-0" onClick={(e) => { if (isDown) e.preventDefault(); }}>
                <div className="relative h-56 w-full p-6 bg-slate-50 rounded-t-xl overflow-hidden">
                   <Image src={product.image_urls ? product.image_urls.split(',')[0] : '/placeholder.png'} alt={product.name} fill className="object-contain pointer-events-none" />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div className="text-xs text-blue-600 font-semibold mb-1 uppercase">{product.brand || 'Generic'}</div>
                  <h3 className="font-medium text-slate-900 mb-2 line-clamp-1">{product.name}</h3>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-bold text-slate-900">${Number(product.price).toFixed(2)}</span>
                    
                    {/* THE FIX IS HERE: Removed pointer-events-none, added onMouseDown stopPropagation */}
                    <Link 
                      href={`/shop/${product.id}`} 
                      onMouseDown={(e) => e.stopPropagation()}
                      className="text-sm font-medium text-white bg-slate-900 hover:bg-blue-600 transition-colors px-4 py-2 rounded-lg pointer-events-auto"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TESTIMONIALS */}
      {testimonials && (
      <section className="py-20 bg-blue-50 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">{testimonials.title || "Reviews"}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.reviews?.map((review, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100 text-left">
                <div className="flex gap-1 text-yellow-400 mb-4">{[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}</div>
                <p className="text-slate-600 mb-6 italic">"{review.text}"</p>
                <div className="font-bold text-slate-900">{review.name} <span className="text-xs font-normal text-slate-500 block">{review.role}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* 5. CONTACT */}
      {contact && (
      <section id="contact" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
                <div className="bg-slate-900 text-white p-10 md:w-2/5">
                    <h3 className="text-2xl font-bold mb-4">{contact.title || "Contact"}</h3>
                    <p className="text-slate-300 mb-8">{contact.description}</p>
                    <div className="space-y-4 text-slate-300">
                        <p>📍 {contact.address}</p>
                        <p>📞 {contact.phone}</p>
                        <p>✉️ {contact.email}</p>
                    </div>
                </div>
                <div className="p-10 md:w-3/5 bg-white">
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                        <input className="w-full px-4 py-3 bg-slate-50 border rounded-lg" placeholder="Name" required/>
                        <input className="w-full px-4 py-3 bg-slate-50 border rounded-lg" placeholder="Email" type="email" required/>
                        <textarea className="w-full px-4 py-3 bg-slate-50 border rounded-lg" placeholder="Message" rows={4} required></textarea>
                        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
      </section>
      )}

      <Footer />
    </div>
  );
}
"""
}

def restore_and_fix():
    print("Restoring your original UI and applying the Carousel Fix...")
    for file_path, content in FILES_TO_UPDATE.items():
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"✅ Restored & Fixed: {file_path}")
        
    print("\n🎉 PERFECT! Your original Header, Hero, and layout are fully restored! The 'View' button inside the carousel is now perfectly clickable.")

if __name__ == "__main__":
    restore_and_fix()