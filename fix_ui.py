import os

FILES_TO_UPDATE = {
    # ==========================================
    # 1. THE PRODUCT CARD (Fixes Badges & Button)
    # ==========================================
    "components/shop/ProductCard.tsx": r""""use client";

import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();
  
  // --- DISCOUNT CALCULATION ---
  // Uses discount_percent if available, otherwise calculates it
  const originalPrice = Number(product.compare_at_price || product.original_price || 0);
  const currentPrice = Number(product.price || 0);
  
  let discount = Number(product.discount_percent || product.discount || 0);
  if (discount === 0 && originalPrice > currentPrice) {
      discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }
  
  // Also check sale_flag if your DB uses that
  const hasDiscount = discount > 0 || product.sale_flag === 1;
  const imageSrc = product.image_urls ? product.image_urls.split(',')[0] : '/placeholder.png';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the product page
    addToCart({ ...product, quantity: 1, image_urls: imageSrc });
    // Single clean toast alert
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      
      {/* TOP LEFT: Discount Percentage Badge */}
      {hasDiscount && discount > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
          -{discount}%
        </div>
      )}

      {/* TOP RIGHT: SALE Badge */}
      {hasDiscount && (
        <div className="absolute top-3 right-3 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-sm tracking-wider uppercase shadow-sm">
          SALE
        </div>
      )}
      
      <Link href={`/shop/${product.id}`} className="block relative h-64 w-full bg-slate-50 p-6 overflow-hidden">
        <Image 
          src={imageSrc} 
          alt={product.name} 
          fill 
          className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
        />
      </Link>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
          {product.category || 'General'}
        </div>
        <Link href={`/shop/${product.id}`}>
          <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Ratings */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className={i < 4 ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200"} />
          ))}
          <span className="text-xs text-slate-500 ml-1">({product.rating || '4.0'})</span>
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div>
            {hasDiscount && (
              <div className="text-xs text-slate-400 line-through mb-0.5">
                ${originalPrice > 0 ? originalPrice.toFixed(2) : (currentPrice * 1.2).toFixed(2)}
              </div>
            )}
            <div className="text-xl font-black text-slate-900">
              ${currentPrice.toFixed(2)}
            </div>
          </div>
          
          {/* STATIC CART ICON BUTTON - No text changes */}
          <button 
            onClick={handleAdd}
            className="bg-slate-900 text-white p-3 rounded-xl hover:bg-blue-600 hover:shadow-lg transition-all active:scale-95"
            title="Add to Cart"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
""",

    # ==========================================
    # 2. PRODUCT DETAILS PAGE (Enhanced Layout)
    # ==========================================
    "app/shop/[id]/page.tsx": r""""use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Star, MapPin, ShieldCheck, Truck, RotateCcw, 
  ArrowLeft, ShoppingCart, Zap, CheckCircle2 
} from 'lucide-react';
import Footer from '@/components/shop/Footer';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, setBuyNowItem } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    fetch(`/api/shop/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.product) {
          setProduct(data.product);
          setSelectedImage(data.product.image_urls ? data.product.image_urls.split(',')[0] : '/placeholder.png');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addToCart({ ...product, quantity: qty, image_urls: product.image_urls ? product.image_urls.split(',')[0] : '/placeholder.png' });
    toast.success(`${qty}x ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    setBuyNowItem({ ...product, quantity: qty, image_urls: product.image_urls ? product.image_urls.split(',')[0] : '/placeholder.png' });
    router.push('/checkout');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold">Loading Product...</div>;
  if (!product) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><h1 className="text-2xl font-bold">Product not found</h1><button onClick={() => router.back()} className="text-blue-600 hover:underline">Go Back</button></div>;

  const images = product.image_urls ? product.image_urls.split(',') : ['/placeholder.png'];
  const hasDiscount = product.discount_percent > 0 || product.compare_at_price > product.price || product.sale_flag === 1;

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        
        {/* CUSTOM BACK BUTTON */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-6 transition-colors w-fit px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md"
        >
          <ArrowLeft size={18} /> Back
        </button>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* 1. IMAGE GALLERY */}
            <div className="lg:col-span-6 p-6 md:p-8 flex gap-4 md:gap-6 border-r border-slate-100 bg-white">
              {/* Thumbnails */}
              <div className="flex flex-col gap-3 w-16 md:w-20 flex-shrink-0">
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onMouseEnter={() => setSelectedImage(img)}
                    onClick={() => setSelectedImage(img)}
                    className={`relative h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-blue-600 shadow-md ring-2 ring-blue-100' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                    <Image src={img} alt="" fill className="object-contain p-2" />
                  </button>
                ))}
              </div>
              {/* Main Image */}
              <div className="relative flex-grow h-[400px] md:h-[500px] bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center group">
                <Image src={selectedImage} alt={product.name} fill className="object-contain p-8 group-hover:scale-105 transition-transform duration-500" />
                {hasDiscount && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-1.5 rounded-full font-black text-sm tracking-wide shadow-lg">
                        SALE
                    </div>
                )}
              </div>
            </div>

            {/* 2. PRODUCT DETAILS & BUY BOX */}
            <div className="lg:col-span-6 p-6 md:p-10 flex flex-col">
              
              <div className="mb-2 text-sm font-bold text-blue-600 uppercase tracking-widest">{product.category || 'Premium Collection'}</div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center text-yellow-400 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                  <Star size={16} className="fill-current" />
                  <span className="ml-1.5 font-bold text-yellow-700 text-sm">{product.rating || '4.8'}</span>
                </div>
                <span className="text-slate-400 text-sm">|</span>
                <span className="text-green-600 font-semibold text-sm flex items-center gap-1"><CheckCircle2 size={16}/> In Stock Ready to Ship</span>
              </div>

              {/* Pricing */}
              <div className="flex items-end gap-3 mb-8">
                <div className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  ${Number(product.price).toFixed(2)}
                </div>
                {hasDiscount && (
                  <div className="text-xl text-slate-400 line-through mb-1 font-medium">
                    ${Number(product.compare_at_price || product.price * 1.2).toFixed(2)}
                  </div>
                )}
              </div>

              {/* Parallel Features Layout */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3 border border-slate-100">
                      <Truck className="text-blue-600 mt-1 flex-shrink-0" size={20}/>
                      <div>
                          <h4 className="font-bold text-slate-900 text-sm">Free Delivery</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Thursday, Dec 21</p>
                      </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3 border border-slate-100">
                      <ShieldCheck className="text-green-600 mt-1 flex-shrink-0" size={20}/>
                      <div>
                          <h4 className="font-bold text-slate-900 text-sm">Secure Payment</h4>
                          <p className="text-xs text-slate-500 mt-0.5">256-bit Encryption</p>
                      </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3 border border-slate-100">
                      <RotateCcw className="text-orange-500 mt-1 flex-shrink-0" size={20}/>
                      <div>
                          <h4 className="font-bold text-slate-900 text-sm">Easy Returns</h4>
                          <p className="text-xs text-slate-500 mt-0.5">30-day return policy</p>
                      </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3 border border-slate-100">
                      <MapPin className="text-purple-600 mt-1 flex-shrink-0" size={20}/>
                      <div>
                          <h4 className="font-bold text-slate-900 text-sm">Deliver To</h4>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{user ? user.name : 'Select Address'}</p>
                      </div>
                  </div>
              </div>

              {/* Description */}
              <div className="prose prose-sm text-slate-600 mb-8 max-w-none">
                <p>{product.description || "Experience premium quality with our latest collection. Designed for durability and style, this product ensures maximum satisfaction."}</p>
              </div>

              {/* Actions Box */}
              <div className="mt-auto flex flex-col sm:flex-row gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center border-2 border-slate-200 rounded-xl bg-white w-full sm:w-auto">
                    <span className="pl-4 pr-2 text-slate-500 font-medium">Qty</span>
                    <select 
                      value={qty} 
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="py-3 pr-4 pl-1 bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                
                <div className="flex flex-1 gap-2">
                    <button 
                      onClick={handleAddToCart}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <ShoppingCart size={18} /> Add to Cart
                    </button>

                    <button 
                      onClick={handleBuyNow}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Zap size={18} fill="currentColor" /> Buy Now
                    </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
"""
}

def apply_changes():
    print("Starting UI Enhancement Process...")
    for file_path, content in FILES_TO_UPDATE.items():
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"✅ Re-wrote: {file_path}")
        
    print("\n🎉 Process Complete! Your Product Card and View Product pages have been supercharged.")
    print("👉 NOTE FOR SORTING: To fix your shop page sorting, please ensure your useEffect in `app/shop/page.tsx` includes `sortOption` in its dependency array like this: `}, [allProducts, sortOption]);`")

if __name__ == "__main__":
    apply_changes()