"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext'; // Import Auth
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCurrency } from '@/context/CurrencyContext';
import { ArrowLeft, CheckCircle, Loader2, ShoppingBag } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart, buyNowItem, setBuyNowItem } = useCart();
  const { user } = useAuth(); // Get logged in user
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(false);
  
  const checkoutItems = buyNowItem ? [buyNowItem] : cart;
  const checkoutTotal = buyNowItem ? Number(buyNowItem.price) * buyNowItem.quantity : totalPrice;

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: ''
  });
  
  // AUTO-FILL EFFECT: Fills form when User loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  // Clean up buyNow state on unmount if desired
  useEffect(() => {
    return () => {};
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutItems.length === 0) return toast.error("Your cart is empty");
    setLoading(true);

    try {
      const res = await fetch('/api/shop/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData,
          items: checkoutItems,
          total: checkoutTotal
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order failed');

      toast.success("Order Placed Successfully!");
      
      if (buyNowItem) {
        setBuyNowItem(null); 
      } else {
        clearCart(); 
      }
      
      router.push('/shop');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (buyNowItem) setBuyNowItem(null);
    router.back();
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="text-blue-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No items to checkout</h2>
          <button onClick={handleGoBack} className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors w-full">
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto mb-6">
        <button onClick={handleGoBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors">
          <ArrowLeft size={20} /> Back
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Form */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <div className="bg-green-100 p-2 rounded-lg text-green-700">
              <CheckCircle size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Checkout Details</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input required type="text" placeholder="John Doe" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input required type="email" placeholder="john@example.com" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                <input required type="tel" placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Shipping Address</label>
              <textarea required rows={3} placeholder="123 Main St, Apt 4B, New York, NY" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg mt-2">
              {loading ? <><Loader2 className="animate-spin" /> Processing...</> : "Confirm Order"}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="h-fit space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <h3 className="text-lg font-bold text-gray-800">Order Summary</h3>
              {buyNowItem && <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">Buy Now Mode</span>}
            </div>
            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {checkoutItems.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="bg-gray-100 w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                         {item.image_urls || item.image ? <img src={item.image || item.image_urls?.split(',')[0]} alt={item.name} className="w-full h-full object-cover" /> : <ShoppingBag className="text-gray-400" size={20} />}
                      </div>
                      <span className="absolute -top-2 -right-2 bg-slate-800 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">{item.quantity}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-gray-500 text-sm">{formatPrice(Number(item.price))} each</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">{formatPrice(Number(item.price) * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-gray-200 pt-6 space-y-3">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="font-medium">{formatPrice(checkoutTotal)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="font-medium text-green-600">Free</span></div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-2"><span className="text-lg font-bold text-gray-900">Total to Pay</span><span className="text-2xl font-bold text-blue-600">{formatPrice(checkoutTotal)}</span></div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center text-sm text-slate-500"><p>🔒 Secure Checkout · SSL Encrypted</p></div>
        </div>
      </div>
    </div>
  );
}