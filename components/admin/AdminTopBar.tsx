"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, AlertTriangle, Info, CheckCircle, Circle, Globe } from 'lucide-react';
import { apiCall } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import { useAdminLocale } from '@/context/AdminLocaleContext';

export default function AdminTopBar() {
  // --- NOTIFICATION STATE ---
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // --- LOCALE STATE ---
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { locale, setLocale, setCurrency, isRTL } = useAdminLocale();

  const { user } = useAuth();

  // Fetch Notifications
  useEffect(() => {
    const saved = localStorage.getItem('admin_read_notifications');
    if (saved) setReadIds(JSON.parse(saved));

    const fetchNotifs = async () => {
      const data = await apiCall('/api/admin/notifications');
      if (data) setNotifications(data);
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, []);

  // Combined Click-Outside Listener for BOTH Dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notification Handlers
  const toggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let newReadIds;
    if (readIds.includes(id)) {
      newReadIds = readIds.filter(rid => rid !== id); 
    } else {
      newReadIds = [...readIds, id]; 
    }
    setReadIds(newReadIds);
    localStorage.setItem('admin_read_notifications', JSON.stringify(newReadIds));
  };

  const handleNotificationClick = (id: string, link?: string) => {
    // Auto mark as read when clicked
    if (!readIds.includes(id)) {
      const newReadIds = [...readIds, id];
      setReadIds(newReadIds);
      localStorage.setItem('admin_read_notifications', JSON.stringify(newReadIds));
    }

    if (link) {
      setIsOpen(false);
      router.push(link);
    }
  };

  const handleRegionChange = (newLocale: string, newCurrency: string) => {
    setLocale(newLocale);
    setCurrency(newCurrency);
    setIsLangOpen(false);
  };

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  return (
    <div className="h-20 bg-white border-b border-slate-200 shadow-sm flex items-center justify-end px-8 sticky top-0 z-40 print:hidden">
      
      <div className="flex items-center gap-6">
        
        {/* 1. REGION / CURRENCY SHORTCUT */}
        <div className="relative" ref={langRef}>
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)} 
            className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-blue-700 rounded-full font-bold text-sm shadow-sm transition-all"
          >
            <Globe size={18} className="text-blue-600" />
            <span className="hidden md:inline">{locale === 'ar-KW' ? 'الكويت (KWD)' : locale === 'en-US' ? 'United States (USD)' : 'India (INR)'}</span>
          </button>
          
          {isLangOpen && (
            <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-top-2`}>
              {/* FIX: Added text-slate-800 to ensure visibility */}
              <button onClick={() => handleRegionChange('en-IN', 'INR')} className="w-full text-slate-800 text-left px-4 py-3 hover:bg-blue-50 hover:text-blue-700 font-medium border-b border-slate-100 flex justify-between transition-colors">
                English (IN) <span className="font-bold">₹ INR</span>
              </button>
              <button onClick={() => handleRegionChange('ar-KW', 'KWD')} className="w-full text-slate-800 text-left px-4 py-3 hover:bg-blue-50 hover:text-blue-700 font-medium flex justify-between font-arabic transition-colors border-b border-slate-100">
                العربية (KW) <span className="font-bold">د.ك KWD</span>
              </button>
              <button onClick={() => handleRegionChange('en-US', 'USD')} className="w-full text-slate-800 text-left px-4 py-3 hover:bg-blue-50 hover:text-blue-700 font-medium flex justify-between transition-colors">
                English (US) <span className="font-bold">$ USD</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. NOTIFICATION BELL (RESTORED) */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2.5 bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-all rounded-full shadow-sm animate-bell"
          >
            <Bell size={20} className={unreadCount > 0 ? "fill-blue-100 text-blue-600" : ""} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-top-2">
              <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold">Notifications</h3>
                <span className="bg-blue-600 text-xs px-2 py-1 rounded-full font-bold">{unreadCount} New</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm font-medium">All caught up!</div>
                ) : (
                  notifications.map((n, idx) => {
                    const isRead = readIds.includes(n.id);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => handleNotificationClick(n.id, n.link)}
                        className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-4 cursor-pointer ${isRead ? 'opacity-60' : 'bg-white'}`}
                      >
                        <div className="mt-1 flex-shrink-0">
                          {n.type === 'danger' && <AlertTriangle size={20} className="text-red-500" />}
                          {n.type === 'warning' && <AlertTriangle size={20} className="text-yellow-500" />}
                          {n.type === 'info' && <Info size={20} className="text-blue-500" />}
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-sm font-bold ${n.type === 'danger' ? 'text-red-600' : n.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`}>{n.title}</h4>
                          <p className="text-sm text-slate-700 mt-0.5 leading-snug">{n.message}</p>
                          <p className="text-xs text-slate-400 mt-2 font-medium">{new Date(n.time).toLocaleString()}</p>
                        </div>
                        <button onClick={(e) => toggleRead(n.id, e)} className="text-slate-400 hover:text-blue-600" title={isRead ? "Mark as unread" : "Mark as read"}>
                          {isRead ? <CheckCircle size={18} className="text-green-500"/> : <Circle size={18} />}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. DIVIDER */}
        <div className="h-8 w-px bg-slate-200"></div>

        {/* 4. LOGGED IN USER PROFILE */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black shadow-sm border-2 border-white outline outline-1 outline-slate-200 uppercase">
            {(user?.name || user?.email || 'A').charAt(0)}
          </div>
          <div className={`hidden md:block ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="text-sm font-black text-slate-900 leading-tight">
              Hi, {user?.name || 'Admin'}
            </p>
            <p className="text-xs text-slate-500 font-bold leading-tight">
              {user?.email || 'admin@example.com'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
