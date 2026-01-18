"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Footer from '@/components/shop/Footer'; // Header is removed (handled by Layout)
import ProductCard from '@/components/shop/ProductCard';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext'; // Import Auth to get User name
import { FaStar, FaMapMarkerAlt, FaLock, FaShieldAlt } from 'react-icons/fa';
import Image from 'next/image';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const { addToCart, setBuyNowItem } = useCart();
  const { user } = useAuth(); // Get logged in user
  
  const [product, setProduct] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedImage, setSelectedImage] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/shop/products/${id}`);
      const data = await res.json();
      if (data.product) {
        setProduct(data.product);
        setSuggestions(data.suggestions);
        const imgs = data.product.image_urls 
          ? data.product.image_urls.split(',') 
          : [data.product.image || '/placeholder.png'];
        setSelectedImage(imgs[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Standard Add to Cart
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_urls: product.image_urls,
      quantity: qty
    });
  };

  // 2. Buy Now Logic
  const handleBuyNow = () => {
    setBuyNowItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_urls: product.image_urls,
      image: product.image_urls ? product.image_urls.split(',')[0] : '/placeholder.png',
      quantity: qty
    });
    router.push('/checkout');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product Not Found</div>;

  const images = product.image_urls 
    ? product.image_urls.split(',') 
    : [product.image || '/placeholder.png'];

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header is removed here because it's in the Layout */}

      <main className="flex-grow container mx-auto px-4 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* 1. IMAGE GALLERY */}
          <div className="lg:col-span-5 flex gap-4 sticky top-24 h-fit">
            <div className="flex flex-col gap-3">
              {images.map((img: string, idx: number) => (
                <div 
                  key={idx}
                  onMouseEnter={() => setSelectedImage(img)}
                  className={`w-12 h-12 border rounded cursor-pointer overflow-hidden relative ${selectedImage === img ? 'border-blue-600 shadow-md ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-400'}`}
                >
                  <Image src={img} alt="" fill className="object-contain" />
                </div>
              ))}
            </div>
            
            <div className="flex-1 relative h-[500px] border border-gray-100 rounded-lg bg-white flex items-center justify-center">
              <Image src={selectedImage} alt={product.name} fill className="object-contain p-4" />
            </div>
          </div>

          {/* 2. PRODUCT DETAILS */}
          <div className="lg:col-span-4 space-y-4">
            <h1 className="text-2xl font-medium text-gray-900 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center text-sm">
              <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_,i) => <FaStar key={i} />)}
              </div>
              <span className="text-blue-600 hover:underline cursor-pointer">
                {product.rating || '4.5'} ratings
              </span>
            </div>
            
            <div className="border-t border-b border-gray-100 py-3 my-2">
              <div className="flex items-start gap-2">
                 <span className="text-sm mt-1.5">$</span>
                 <span className="text-3xl font-medium text-gray-900">{Math.floor(product.price)}</span>
                 <span className="text-sm mt-1.5">{(Number(product.price) % 1).toFixed(2).substring(2)}</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                <span className="text-blue-600 font-bold">prime</span> Two-Day
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Brand:</strong> Generic</p>
              <p><strong>Category:</strong> {product.category || 'General'}</p>
              <p className="mt-4 leading-relaxed">{product.description || "No description available."}</p>
            </div>
          </div>

          {/* 3. BUY BOX */}
          <div className="lg:col-span-3">
            <div className="border border-gray-300 rounded-lg p-5 shadow-sm bg-white sticky top-24">
              <div className="flex items-start gap-1 mb-2">
                 <span className="text-xs mt-1">$</span>
                 <span className="text-2xl font-medium text-gray-900">{Math.floor(product.price)}</span>
                 <span className="text-xs mt-1">{(Number(product.price) % 1).toFixed(2).substring(2)}</span>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                <span className="text-blue-600">FREE delivery</span> 
                <span className="font-bold text-gray-900 ml-1">Thursday, Dec 21</span>
              </div>
              
              {/* Dynamic Deliver To User */}
              <div className="flex items-center gap-2 text-sm text-blue-600 mb-4 cursor-pointer hover:underline">
                 <FaMapMarkerAlt /> Deliver to {user ? user.name : 'New York 10001'}
              </div>

              <div className="text-lg text-green-700 font-medium mb-4">
                In Stock
              </div>

              <div className="mb-4">
                <select 
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-auto p-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm outline-none cursor-pointer"
                >
                  <option value={1}>Qty: 1</option>
                  <option value={2}>Qty: 2</option>
                  <option value={3}>Qty: 3</option>
                  <option value={4}>Qty: 4</option>
                  <option value={5}>Qty: 5</option>
                </select>
              </div>

              <div className="space-y-2.5">
                <button 
                  onClick={handleAddToCart}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-2 rounded-full text-sm font-medium shadow-sm transition-colors"
                >
                  Add to Cart
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-full text-sm font-medium shadow-sm transition-colors"
                >
                  Buy Now
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500 space-y-1">
                <div className="flex gap-2">
                  <span className="w-20 text-gray-400">Ships from</span> <span>AmazonClone</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-20 text-gray-400">Sold by</span> <span>AmazonClone</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-blue-600 text-xs text-center">
                 <div className="flex flex-col items-center gap-1 cursor-pointer hover:underline">
                    <FaLock size={14} className="text-gray-400"/>
                    Secure transaction
                 </div>
                 <div className="flex flex-col items-center gap-1 cursor-pointer hover:underline">
                    <FaShieldAlt size={14} className="text-gray-400"/>
                    Return Policy
                 </div>
              </div>
            </div>
          </div>

        </div>

        {/* --- Section: Suggestions --- */}
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {suggestions.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}