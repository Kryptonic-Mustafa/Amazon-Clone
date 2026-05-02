"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Package, Clock, ShoppingBag, ArrowRight, RotateCcw, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { clearCart, addToCart } = useCart();

  // Return Logic State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnQty, setReturnQty] = useState(1);
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    fetch('/api/shop/orders/mine')
      .then(res => res.json())
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleReturnRequest = (order: any, item: any) => {
    setSelectedOrder(order);
    setSelectedItem(item);
    setReturnQty(item.quantity);
    setShowReturnModal(true);
  };

  const submitReturn = async () => {
    if (!returnReason.trim()) return toast.error("Please provide a reason for return");
    setSubmittingReturn(true);
    try {
      const res = await fetch('/api/shop/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          product_id: selectedItem.product_id,
          product_name: selectedItem.product_name,
          quantity: returnQty,
          return_reason: returnReason
        })
      });

      if (res.ok) {
        toast.success("Return request submitted successfully!");
        setShowReturnModal(false);
        setReturnReason('');
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit return request");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSubmittingReturn(false);
    }
  };


  // --- LOGIC: ORDER AGAIN ---
  const handleOrderAgain = (orderItems: any[]) => {
    // 1. Clear current cart to start fresh
    clearCart();

    // 2. Add all items from previous order
    let addedCount = 0;
    orderItems.forEach(item => {
      addToCart({
        id: item.product_id,
        name: item.product_name,
        price: item.price,
        image: '/placeholder.png', // Or fetch real image if you store it
        quantity: item.quantity
      });
      addedCount++;
    });

    if (addedCount > 0) {
      toast.success("Cart updated! Redirecting to checkout...");
      // 3. Redirect to checkout
      setTimeout(() => router.push('/checkout'), 500);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Order History</h2>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
          <ShoppingBag className="mx-auto mb-4 opacity-20" size={48} />
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        orders.map((order: any) => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100">
              <div className="flex gap-6 text-sm text-gray-600">
                <div>
                  <p className="font-bold text-gray-900">Order Placed</p>
                  <p>{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Total</p>
                  <p>${Number(order.total_amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Order #</p>
                  <p>{order.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                   order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                   order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                 }`}>
                   {order.status}
                 </span>
              </div>
            </div>

            {/* Items */}
            <div className="p-6">
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-100 w-16 h-16 rounded-md flex items-center justify-center text-gray-400">
                        <Package size={24} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <p className="font-medium text-gray-900">${Number(item.price).toFixed(2)}</p>
                       {order.status === 'Completed' && (
                         <button 
                           onClick={() => handleReturnRequest(order, item)}
                           className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                         >
                           <RotateCcw size={12} /> Return
                         </button>
                       )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => handleOrderAgain(order.items)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Buy Again <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* RETURN MODAL */}
      {showReturnModal && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowReturnModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <RotateCcw size={20} className="text-yellow-400" />
                Return Request
              </h3>
              <button onClick={() => setShowReturnModal(false)}><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Product</p>
                <p className="font-bold text-slate-900">{selectedItem?.product_name}</p>
                <p className="text-xs text-slate-500 mt-1">From Order #{selectedOrder?.id}</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Return Quantity</label>
                <input 
                  type="number" 
                  min="1" 
                  max={selectedItem?.quantity}
                  value={returnQty}
                  onChange={(e) => setReturnQty(parseInt(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Reason for Return</label>
                <textarea 
                  rows={3}
                  placeholder="Tell us why you want to return this product..."
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none"
                />
              </div>

              <div className="pt-2">
                <button 
                  disabled={submittingReturn}
                  onClick={submitReturn}
                  className="w-full bg-slate-900 text-white font-black py-3.5 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingReturn ? "Submitting..." : "Submit Return Request"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}