"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Bell, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Order = {
  id: number;
  customer_name: string;
  total_amount: number;
  created_at: string;
};

type NotificationContextType = {
  unreadOrders: Order[];
  markAsRead: () => void;
  markOneAsRead: (id: number) => void;
  showModal: boolean;
  setShowModal: (v: boolean) => void;
};

const AdminNotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const AdminNotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadOrders, setUnreadOrders] = useState<Order[]>([]);
  const [showModal, setShowModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevNotifIdsRef = useRef<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification.mp3');
    }

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/admin/notifications');
        if (!res.ok) return;
        const allNotifications: any[] = await res.json();
        
        if (Array.isArray(allNotifications)) {
          const currentIds = new Set(allNotifications.map(n => n.id));
          const previousIds = prevNotifIdsRef.current;
          
          // Find new notifications that weren't in the previous poll
          const newNotifications = allNotifications.filter(n => !previousIds.has(n.id));

          if (newNotifications.length > 0 && previousIds.size > 0) {
             const latest = newNotifications[0];
             if (audioRef.current) audioRef.current.play().catch(() => {});

              toast((t) => (
                <div 
                  className="cursor-pointer flex items-center gap-4 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 animate-in slide-in-from-right-5 w-80 hover:bg-slate-800 transition-colors"
                  onClick={() => { 
                    toast.dismiss(t.id);
                    if (latest.category === 'order') {
                      router.push(`/admin/orders/${latest.orderData.id}`);
                    } else if (latest.category === 'inventory') {
                      // Extract ID from stock_123 format
                      const productId = latest.id.split('_')[1];
                      router.push(`/admin/inventory?view=${productId}`);
                    } else {
                      router.push(latest.link || '#');
                    }
                  }}
                >
                  <div className={`p-3 rounded-xl text-white shadow-lg flex-shrink-0 ${latest.type === 'danger' ? 'bg-red-600 shadow-red-900/20' : latest.type === 'warning' ? 'bg-amber-600 shadow-amber-900/20' : 'bg-blue-600 shadow-blue-900/20'}`}>
                    {latest.category === 'inventory' ? <AlertTriangle size={24} className="animate-pulse" /> : <Bell size={24} className="animate-bounce" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-xs uppercase tracking-wider line-clamp-1">{latest.title}</p>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      {latest.message}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1.5 font-bold uppercase tracking-widest">Click to open details</p>
                  </div>
                </div>
              ), { duration: 6000, position: 'top-right', style: { background: 'transparent', boxShadow: 'none', padding: 0 } });
          }

          const orders = allNotifications
            .filter(n => n.category === 'order')
            .map(n => n.orderData);

          prevNotifIdsRef.current = currentIds;
          setUnreadOrders(orders);
        }
      } catch (error) {
        console.error("Poll Error", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); 
    return () => clearInterval(interval);
  }, [router]);

  const markAsRead = async () => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: 'all' })
      });
      setUnreadOrders([]);
      // We don't reset prevNotifIdsRef here because we only want toasts for TRULY new things that arrive while the tab is open
      setShowModal(false);
    } catch (error) {
      console.error("Failed to mark read");
    }
  };

  const markOneAsRead = async (id: number) => {
    try {
      setUnreadOrders(prev => prev.filter(order => order.id !== id));
      await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: [id] })
      });
    } catch (error) {
      console.error("Failed to mark one read");
    }
  };

  return (
    <AdminNotificationContext.Provider value={{ unreadOrders, markAsRead, markOneAsRead, showModal, setShowModal }}>
      {children}
    </AdminNotificationContext.Provider>
  );
};

export const useAdminNotifications = () => {
  const context = useContext(AdminNotificationContext);
  if (!context) throw new Error("Must be used within AdminNotificationProvider");
  return context;
};