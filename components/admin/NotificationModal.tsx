"use client";

import { useAdminNotifications } from "@/context/AdminNotificationContext";
import { X, Check, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationModal() {
  // 1. Destructure markOneAsRead from the hook
  const { showModal, setShowModal, unreadOrders, markAsRead, markOneAsRead } = useAdminNotifications();
  const router = useRouter();

  if (!showModal) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-md overflow-hidden">
        
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-slate-500 text-lg">Order Alerts ({unreadOrders.length})</h3>
          <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-red-500"><X size={20}/></button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {unreadOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No new notifications.</div>
          ) : (
            unreadOrders.map(order => (
              <div key={order.id} className="p-4 border-b hover:bg-blue-50 transition-colors rounded-lg group">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-gray-800">Order #{order.id}</span>
                  <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                     <p>{order.customer_name}</p>
                     <p className="font-bold text-green-600">${Number(order.total_amount).toFixed(2)}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* --- NEW BUTTON: Mark Single Read --- */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering parent clicks
                        markOneAsRead(order.id);
                      }}
                      title="Mark as Read"
                      className="bg-white border border-gray-200 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-green-600 hover:text-white transition-all flex items-center gap-1"
                    >
                      <Check size={14} />
                    </button>
                    {/* ----------------------------------- */}

                    <button 
                      onClick={() => {
                         setShowModal(false);
                         router.push(`/admin/orders/${order.id}`);
                      }}
                      className="bg-white border border-gray-200 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1"
                    >
                      <Eye size={14} /> View
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {unreadOrders.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <button 
              onClick={markAsRead}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-blue-600 font-medium py-2"
            >
              <Check size={16} /> Mark all as read
            </button>
          </div>
        )}
      </div>
    </>
  );
}