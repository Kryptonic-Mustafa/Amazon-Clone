import os

FILES_TO_UPDATE = {
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
import ProductCard from '@/components/shop/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, setBuyNowItem } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        // 1. Fetch the main product
        const res = await fetch(`/api/shop/products/${id}`);
        const data = await res.json();
        const currentProduct = data.product || data;
        
        if (currentProduct) {
          setProduct(currentProduct);
          setSelectedImage(currentProduct.image_urls ? currentProduct.image_urls.split(',')[0] : '/placeholder.png');
          
          // 2. Fetch all products to find related ones
          const allRes = await fetch('/api/shop/products');
          const allData = await allRes.json();
          
          if (Array.isArray(allData)) {
            // Remove the current product from the list
            const otherProducts = allData.filter(p => String(p.id) !== String(id));
            
            // Find products in the SAME category
            const sameCategory = otherProducts.filter(p => p.category_ids === currentProduct.category_ids);
            
            // Find products in DIFFERENT categories (to fill the grid if needed)
            const differentCategory = otherProducts.filter(p => p.category_ids !== currentProduct.category_ids);
            
            // Combine them: Same category first, then others, and slice top 4
            const combinedRelated = [...sameCategory, ...differentCategory].slice(0, 4);
            setRelatedProducts(combinedRelated);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductData();
  }, [id]);

  const handleAddToCart = () => {
    addToCart({ ...product, quantity: qty, image_urls: product.image_urls ? product.image_urls.split(',')[0] : '/placeholder.png' });
    toast.success(`${qty}x ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    setBuyNowItem({ ...product, quantity: qty, image_urls: product.image_urls ? product.image_urls.split(',')[0] : '/placeholder.png' });
    router.push('/checkout');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold tracking-widest">Loading Product...</div>;
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
        
        {/* MAIN PRODUCT BLOCK */}
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
              
              <div className="mb-2 text-sm font-bold text-blue-600 uppercase tracking-widest">{product.category_name || product.category || 'Premium Collection'}</div>
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
                          <p className="text-xs text-slate-500 mt-0.5">Dispatched in 24h</p>
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

        {/* --- NEW: RELATED PRODUCTS SECTION --- */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 mb-8">
            <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">You Might Also Like</h2>
              <button 
                onClick={() => router.push('/shop')} 
                className="text-blue-600 font-bold text-sm hover:underline hover:text-blue-800"
              >
                View More
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(rp => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
"""
}

def apply_related_products():
    print("Injecting Related Products Logic...")
    for file_path, content in FILES_TO_UPDATE.items():
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"✅ Enhanced: {file_path}")
        
    print("\n🎉 DONE! The Product Details page now dynamically shows a beautiful grid of Related Products at the bottom.")

if __name__ == "__main__":
    apply_related_products()