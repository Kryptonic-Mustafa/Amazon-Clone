"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { Star, MapPin, ShieldCheck, Truck, RotateCcw, ArrowLeft, ShoppingCart, Zap, CheckCircle2, ChevronDown, ChevronUp, Heart, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductCard from '@/components/shop/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, setBuyNowItem } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [specs, setSpecs] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [qty, setQty] = useState(1);

  // Review State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [openSpecs, setOpenSpecs] = useState<string[]>(['Material & Build']);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/shop/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.product) {
          setProduct(data.product);
          setReviews(data.reviews || []);
          
          // MOCK DATA FALLBACK FOR SPECS
          const loadedSpecs = data.product.specifications && Object.keys(data.product.specifications).length > 0 
            ? data.product.specifications 
            : {
                "Material & Build": "Premium quality blend crafted for maximum durability and comfort.",
                "Care Instructions": "Machine wash cold with like colors. Tumble dry low.",
                "Origin": "Imported with global materials.",
                "Dimensions / Fit": "True to size. Refer to standard sizing guides."
              };
          setSpecs(loadedSpecs);
          setSelectedImage(data.product.image_urls ? data.product.image_urls.split(',')[0] : '/placeholder.png');
          
          // Fetch related products
          fetch('/api/shop/products').then(r=>r.json()).then(allData => {
            if (Array.isArray(allData)) {
              const otherProducts = allData.filter(p => String(p.id) !== String(id));
              setRelatedProducts([...otherProducts.slice(0, 8), ...otherProducts.slice(0,4)]); // Pad for carousel
            }
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleSpec = (key: string) => setOpenSpecs(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  const isLiked = product ? isInWishlist(product.id) : false;

  const scrollCarousel = (direction: 'left'|'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      carouselRef.current.scrollTo({ left: direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth, behavior: 'smooth' });
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && (!guestName || !guestEmail)) return toast.error("Please provide your name and email.");
    setSubmittingReview(true);

    try {
      const payload = {
        user_id: user ? user.id : 0, user_name: user ? user.name : guestName, user_email: user ? user.email : guestEmail,
        rating: reviewRating, comment: reviewText
      };

      const res = await fetch(`/api/shop/products/${id}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed to submit");
      
      const data = await res.json();
      setReviews([data.review, ...reviews]);
      setProduct({ ...product, rating: data.newAverage });
      setShowReviewForm(false); setReviewText('');
      toast.success("Review published!");
    } catch (err) { toast.error("Could not post review."); } 
    finally { setSubmittingReview(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold">Loading Product...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-800">Product not found</div>;

  // --- PRICING MATH ---
  const currentPrice = Number(product.price || 0);
  const discount = Number(product.discount_percent || 0);
  const isSale = Number(product.sale_flag) === 1 && discount > 0;
  const oldPrice = isSale ? (currentPrice / (1 - (discount / 100))) : currentPrice;
  const avgRating = product.rating || '0.0';
  const images = product.image_urls ? product.image_urls.split(',') : ['/placeholder.png'];

  // --- MOCK DATA FALLBACK FOR REVIEWS ---
  const displayReviews = reviews.length > 0 ? reviews : [
    { id: 'mock1', user_name: 'Alex D.', rating: 5, comment: 'Absolutely fantastic quality. Exceeded my expectations entirely!', created_at: new Date().toISOString() },
    { id: 'mock2', user_name: 'Sam G. (Guest)', rating: 4, comment: 'Great product, matches the description perfectly. Shipping was a bit slow.', created_at: new Date(Date.now() - 86400000).toISOString() }
  ];

  return (
    <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl text-slate-900">
      
      {/* 1. TOP NAV */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={() => toggleWishlist(product)} className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-full transition-all border-2 ${isLiked ? 'border-red-100 bg-red-50 text-red-600' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
          <Heart size={20} className={isLiked ? 'fill-current' : ''} /> {isLiked ? 'Saved to Favorites' : 'Add to Favorites'}
        </button>
      </div>
      
      {/* 2. MAIN PRODUCT BLOCK */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          <div className="lg:col-span-6 p-6 md:p-8 flex gap-4 md:gap-6 border-r border-slate-100 bg-white">
            <div className="flex flex-col gap-3 w-16 md:w-20 flex-shrink-0">
              {images.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setSelectedImage(img)} className={`relative h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-100'}`}>
                  <Image src={img} alt="" fill className="object-contain p-2" />
                </button>
              ))}
            </div>
            <div className="relative flex-grow h-[400px] md:h-[500px] bg-slate-50 rounded-2xl flex items-center justify-center group">
              <Image src={selectedImage} alt={product.name} fill className="object-contain p-8 group-hover:scale-105 transition-transform duration-500" />
              {isSale && <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-1.5 rounded-full font-black text-sm shadow-lg">SALE -{discount}%</div>}
            </div>
          </div>

          <div className="lg:col-span-6 p-6 md:p-10 flex flex-col">
            <div className="mb-2 text-sm font-bold text-blue-600 uppercase tracking-widest">{product.category_name || product.brand || 'Premium'}</div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={18} className={i < Math.round(Number(avgRating)) ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200"} />)}
                <span className="ml-2 font-black text-slate-800 text-lg">{avgRating}</span>
                <span className="ml-2 font-bold text-blue-600 text-sm hover:underline cursor-pointer" onClick={() => document.getElementById('reviews')?.scrollIntoView({behavior: 'smooth'})}>
                  ({displayReviews.length} reviews)
                </span>
              </div>
            </div>

            <div className="flex items-end gap-3 mb-8">
              <div className="text-4xl md:text-5xl font-black text-slate-900">${currentPrice.toFixed(2)}</div>
              {isSale && <div className="text-xl text-slate-400 line-through mb-1 font-medium">${oldPrice.toFixed(2)}</div>}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3 border border-slate-100"><Truck className="text-blue-600 mt-1 flex-shrink-0" size={20}/><div><h4 className="font-bold text-slate-900 text-sm">Free Delivery</h4></div></div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3 border border-slate-100"><ShieldCheck className="text-green-600 mt-1 flex-shrink-0" size={20}/><div><h4 className="font-bold text-slate-900 text-sm">Secure Payment</h4></div></div>
            </div>

            <div className="mt-auto flex flex-col sm:flex-row gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center border-2 border-slate-200 rounded-xl bg-white w-full sm:w-auto">
                  <span className="pl-4 pr-2 text-slate-500 font-medium">Qty</span>
                  <select value={qty} onChange={(e) => setQty(Number(e.target.value))} className="py-3 pr-4 pl-1 bg-transparent font-bold text-slate-900 outline-none cursor-pointer">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
              </div>
              <div className="flex flex-1 gap-2">
                  <button onClick={() => {addToCart({ ...product, quantity: qty, image_urls: selectedImage }); toast.success('Added to cart!');}} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-lg"><ShoppingCart size={20} /> Add to Cart</button>
                  <button onClick={() => {setBuyNowItem({ ...product, quantity: qty, image_urls: selectedImage }); router.push('/checkout');}} className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-lg shadow-sm"><Zap size={20} fill="currentColor" /> Buy Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RELATED PRODUCTS CAROUSEL (Moved directly below product) */}
      {relatedProducts.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight border-l-4 border-blue-600 pl-3">You Might Also Like</h2>
            <div className="flex gap-2">
              <button onClick={() => scrollCarousel('left')} className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 bg-white shadow-sm"><ChevronLeft size={20}/></button>
              <button onClick={() => scrollCarousel('right')} className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 bg-white shadow-sm"><ChevronRight size={20}/></button>
            </div>
          </div>
          <div ref={carouselRef} className="flex overflow-x-auto gap-6 pb-8 pt-2 snap-x snap-mandatory scroll-smooth group hover:[animation-play-state:paused] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {relatedProducts.map((rp, idx) => (
              <div key={`${rp.id}-${idx}`} className="min-w-[280px] sm:min-w-[320px] snap-start shrink-0">
                <ProductCard product={rp} />
              </div>
            ))}
          </div>
        </div>
      )}

      <hr className="border-slate-200 mb-12" />

      {/* 4. DESCRIPTION & SPECS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-blue-600 pl-3">Product Specifications</h2>
          <div className="border-t border-slate-200">
            {Object.entries(specs).map(([key, value]) => (
              <div key={key} className="border-b border-slate-200">
                <button onClick={() => toggleSpec(key)} className="w-full py-5 flex justify-between items-center text-left hover:bg-slate-50 transition-colors px-2">
                  <span className="font-bold text-lg">{key}</span>
                  {openSpecs.includes(key) ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                </button>
                {openSpecs.includes(key) && <div className="pb-6 px-2 text-slate-600 leading-relaxed">{String(value)}</div>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-yellow-400 pl-3">Description</h2>
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed bg-white p-8 rounded-3xl border border-slate-100 shadow-sm" dangerouslySetInnerHTML={{
             __html: product.description || "Discover the perfect blend of comfort and style. Crafted with premium materials, this item is designed to exceed your expectations and become a staple in your daily life."
          }}></div>
        </div>
      </div>

      {/* 5. REVIEWS */}
      <div id="reviews" className="mb-16 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-3xl font-black mb-2">Customer Reviews</h2>
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} size={24} className={i < Math.round(Number(avgRating)) ? "fill-current" : "text-slate-200 fill-slate-200"} />)}</div>
              <span className="font-black text-2xl ml-2">{avgRating} <span className="text-slate-400 text-lg font-medium">/ 5</span></span>
            </div>
          </div>
          <button onClick={() => setShowReviewForm(!showReviewForm)} className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold hover:bg-blue-600 transition-colors shadow-lg active:scale-95">
            Write a Review
          </button>
        </div>

        {showReviewForm && (
          <form onSubmit={submitReview} className="bg-slate-50 p-8 rounded-2xl border border-slate-200 mb-10 max-w-3xl">
            <h3 className="font-black text-xl mb-6">Create Review</h3>
            {!user && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Your Name *</label>
                  <input required type="text" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Your Email *</label>
                  <input required type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
                </div>
              </div>
            )}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Overall rating</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(num => (
                  <Star key={num} size={32} onClick={() => setReviewRating(num)} className={`cursor-pointer transition-colors ${num <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Written review</label>
              <textarea required rows={4} value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="What did you like or dislike?" className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowReviewForm(false)} className="px-5 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
              <button type="submit" disabled={submittingReview} className="bg-yellow-400 text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-yellow-500 shadow-md transition-all active:scale-95">Publish Review</button>
            </div>
          </form>
        )}

        <div className="space-y-8 max-w-4xl">
          {displayReviews.map((review) => (
            <div key={review.id} className="border-b border-slate-100 pb-8 last:border-0 last:pb-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm">
                  {review.user_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">{review.user_name.split(' (Guest')[0]}</span>
                  <span className="text-xs text-slate-400 font-medium">{new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < review.rating ? "fill-current" : "text-slate-200 fill-slate-200"} />)}
              </div>
              <p className="text-slate-700 leading-relaxed font-medium">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
