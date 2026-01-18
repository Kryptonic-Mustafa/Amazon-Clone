"use client";

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'; // Added Plus/Minus

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  // FIX: Added updateQuantity here
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart(); 
  const router = useRouter();

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  const getImageUrl = (item: any) => {
    if (item.image_urls) return item.image_urls.split(',')[0];
    if (item.image) return item.image;
    return '/placeholder.png';
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" 
          onClick={onClose} 
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <ShoppingBag className="text-blue-600" />
            Your Cart <span className="text-sm font-normal text-gray-500">({cart.length})</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <ShoppingBag size={48} className="opacity-20" />
              <p>Your cart is currently empty.</p>
              <button onClick={onClose} className="text-blue-600 font-medium hover:underline">
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                {/* Image */}
                <div className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                  <Image 
                    src={getImageUrl(item)} 
                    alt={item.name} 
                    fill 
                    className="object-cover" 
                  />
                </div>
                
                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 line-clamp-2 leading-tight mb-1">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      ${Number(item.price).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    
                    {/* QUANTITY CONTROLS */}
                    <div className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1 bg-gray-50">
                        <button 
                           onClick={() => updateQuantity(item.id, item.quantity - 1)}
                           className="text-gray-500 hover:text-black disabled:opacity-30"
                           disabled={item.quantity <= 1}
                        >
                            <Minus size={14} />
                        </button>
                        <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                        <button 
                           onClick={() => updateQuantity(item.id, item.quantity + 1)}
                           className="text-gray-500 hover:text-black"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between mb-4 items-end">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="text-2xl font-bold text-gray-900">${(totalPrice || 0).toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Proceed to Checkout
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Shipping & taxes calculated at checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
}