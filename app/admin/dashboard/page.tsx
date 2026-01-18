"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Bell, Package, DollarSign, Users, TrendingUp } from 'lucide-react';
import { useAdminNotifications } from "@/context/AdminNotificationContext"; 
import NotificationModal from "@/components/admin/NotificationModal"; 
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    recentOrders: [],
    salesChart: [] 
  });

  const { unreadOrders, setShowModal } = useAdminNotifications();
  const isJingling = unreadOrders.length > 0;

  // UPDATED: Fetch logic inside a function + Polling
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/admin/dashboard');
        const data = await res.json();
        
        // Handle empty chart data fallback
        if (!data.salesChart || data.salesChart.length === 0) {
           data.salesChart = [
             { name: 'Mon', sales: 0 }, { name: 'Tue', sales: 0 }, 
             { name: 'Wed', sales: 0 }, { name: 'Thu', sales: 0 }, 
             { name: 'Fri', sales: 0 }, { name: 'Sat', sales: 0 }, 
             { name: 'Sun', sales: 0 }
           ];
        }
        setStats(data);
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      }
    };

    // 1. Initial Call
    fetchDashboardData();

    // 2. Poll every 5 seconds (Auto Refresh)
    const interval = setInterval(fetchDashboardData, 5000);

    // 3. Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <NotificationModal />
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            System Live & Updating
          </p>
        </div>
        
        {/* BELL ICON */}
        <button 
          onClick={() => setShowModal(true)}
          className={`relative p-3 rounded-full shadow-sm border transition-all duration-300 ${
            isJingling ? 'bg-red-50 border-red-200 hover:bg-red-100' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <Bell 
            size={24} 
            className={`text-slate-600 ${isJingling ? 'animate-bell text-red-600' : ''}`} 
            fill={isJingling ? "currentColor" : "none"} 
          />
          {unreadOrders.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 border-2 border-white rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
              {unreadOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* Dynamic Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all duration-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                ${Number(stats.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600 font-medium bg-green-50 w-fit px-2 py-1 rounded">
             <TrendingUp size={14} className="mr-1" /> Lifetime Earnings
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all duration-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Orders</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.totalOrders}</h3>
            </div>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Package size={24} />
            </div>
          </div>
           <div className="mt-4 flex items-center text-xs text-blue-600 font-medium bg-blue-50 w-fit px-2 py-1 rounded">
             <TrendingUp size={14} className="mr-1" /> All Time
          </div>
        </div>

        {/* Customers Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all duration-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Unique Customers</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.totalCustomers}</h3>
            </div>
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Users size={24} />
            </div>
          </div>
           <div className="mt-4 flex items-center text-xs text-purple-600 font-medium bg-purple-50 w-fit px-2 py-1 rounded">
             <TrendingUp size={14} className="mr-1" /> Active Emails
          </div>
        </div>
      </div>

      {/* Charts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: DYNAMIC Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Last 7 Days Revenue</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.salesChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => `$${value}`} 
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Recent Orders Feed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Orders</h3>
          <div className="space-y-4 flex-grow">
            {stats.recentOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm py-10">
                 <Package className="mb-2 opacity-20" size={32} />
                 <p>No orders found.</p>
              </div>
            ) : (
              stats.recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className={`mt-1 h-2 w-2 rounded-full ${order.status === 'Pending' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                  <div className="flex-1">
                    <div className="flex justify-between">
                       <p className="text-sm font-semibold text-slate-800">Order #{order.id}</p>
                       <p className="text-xs font-bold text-slate-900">${Number(order.total_amount).toFixed(2)}</p>
                    </div>
                    <p className="text-xs text-slate-500">{order.customer_name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link 
            href="/admin/orders" 
            className="block w-full text-center mt-4 text-sm bg-slate-50 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}