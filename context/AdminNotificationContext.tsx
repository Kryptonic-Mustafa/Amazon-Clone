"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';

type Order = {
  id: number;
  customer_name: string;
  total_amount: number;
  created_at: string;
};

type NotificationContextType = {
  unreadOrders: Order[];
  markAsRead: () => void;
  markOneAsRead: (id: number) => void; // <--- NEW FUNCTION
  showModal: boolean;
  setShowModal: (v: boolean) => void;
};

const AdminNotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const AdminNotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadOrders, setUnreadOrders] = useState<Order[]>([]);
  const [showModal, setShowModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevOrderIdsRef = useRef<Set<number>>(new Set());

  // ... (useEffect for polling remains the same) ...
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification.mp3');
    }

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/admin/notifications');
        if (!res.ok) return;
        const data: Order[] = await res.json();
        
        if (Array.isArray(data)) {
          const currentIds = new Set(data.map(o => o.id));
          const previousIds = prevOrderIdsRef.current;
          
          const hasNewOrder = data.some(order => !previousIds.has(order.id));

          if (hasNewOrder && previousIds.size > 0) {
             const latestOrder = data[0];
             if (audioRef.current) audioRef.current.play().catch(() => {});

              toast((t) => (
                <div 
                  className="cursor-pointer flex items-center gap-4 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 animate-in slide-in-from-right-5 w-80"
                  onClick={() => { setShowModal(true); toast.dismiss(t.id); }}
                >
                  <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg shadow-blue-900/20 flex-shrink-0">
                    <Bell size={24} className="animate-bounce" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-sm uppercase tracking-wider">New Order!</p>
                    <p className="text-sm text-slate-400 mt-1 truncate">
                      From <span className="text-blue-400 font-bold">{latestOrder.customer_name}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 font-bold">Click to view details</p>
                  </div>
                </div>
              ), { duration: 6000, position: 'top-right', style: { background: 'transparent', boxShadow: 'none', padding: 0 } });
          }
          prevOrderIdsRef.current = currentIds;
          setUnreadOrders(data);
        }
      } catch (error) {
        console.error("Poll Error", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); 
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async () => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: 'all' })
      });
      setUnreadOrders([]);
      prevOrderIdsRef.current = new Set(); 
      setShowModal(false);
    } catch (error) {
      console.error("Failed to mark read");
    }
  };

  // NEW: Mark single item as read
  const markOneAsRead = async (id: number) => {
    try {
      // Optimistic Update: Remove from UI immediately
      setUnreadOrders(prev => prev.filter(order => order.id !== id));
      
      await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: [id] }) // Send as array of 1 ID
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