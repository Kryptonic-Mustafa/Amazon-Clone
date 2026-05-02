"use client";

import { useAdminNotifications } from "@/context/AdminNotificationContext";
import { X, Check, Eye, ShoppingCart, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationModal() {
  const { showModal, setShowModal, unreadOrders, markAsRead, markOneAsRead } = useAdminNotifications();
  const router = useRouter();

  if (!showModal) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]" onClick={() => setShowModal(false)} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-[101] w-full max-w-md overflow-hidden animate-in zoom-in-95">
        
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-blue-400" />
            <h3 className="font-bold text-lg">Order Alerts</h3>
          </div>
          <div className="flex items-center gap-3">
             <span className="bg-blue-600 text-xs px-2 py-1 rounded-full font-black">{unreadOrders.length}</span>
             <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors"><X size={22}/></button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {unreadOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <div className="bg-slate-50 p-4 rounded-full">
                <Bell size={32} className="text-slate-200" />
              </div>
              <p className="font-medium">No new notifications.</p>
            </div>
          ) : (
            unreadOrders.map((order: any) => (
              <div key={order.id} className="p-4 border border-slate-100 bg-white hover:bg-slate-50 transition-all rounded-2xl group shadow-sm">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                    <ShoppingCart size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-black text-slate-900 text-sm">Order #{order.id}</span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-600 line-clamp-1">{order.customer_name}</p>
                    <p className="font-black text-blue-600 text-sm mt-0.5">${Number(order.total_amount).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-50">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      markOneAsRead(order.id);
                    }}
                    className="flex-1 bg-white border border-slate-200 text-slate-600 py-2 rounded-xl text-xs font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} /> Mark Read
                  </button>
                  <button 
                    onClick={() => {
                       setShowModal(false);
                       router.push(`/admin/orders/${order.id}`);
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Eye size={14} /> View Order
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {unreadOrders.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <button 
              onClick={markAsRead}
              className="w-full flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-blue-600 font-black py-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-200 transition-all shadow-sm"
            >
              <Check size={18} /> Mark all as read
            </button>
          </div>
        )}
      </div>
    </>
  );
}