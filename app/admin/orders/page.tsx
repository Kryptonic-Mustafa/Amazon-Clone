"use client";

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Eye, Clock, CheckCircle, Truck, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type Order = {
  id: number;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  // We only show "Loading..." on the very first fetch
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();

  // UPDATED: Fetch logic + Polling
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/admin/orders');
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (Array.isArray(data)) setOrders(data);
      } catch (error) {
        console.error("Failed to load orders");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchOrders(); // 1. Initial Call
    
    // 2. Poll every 5 seconds
    const interval = setInterval(fetchOrders, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    const baseClass = "px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit";
    switch(status) {
      case 'Pending': 
        return <span className={`bg-yellow-100 text-yellow-700 ${baseClass}`}><Clock size={12}/> Pending</span>;
      case 'Processing': 
        return <span className={`bg-orange-100 text-orange-700 ${baseClass}`}><Loader2 size={12} className="animate-spin"/> Processing</span>;
      case 'Shipped': 
        return <span className={`bg-blue-100 text-blue-700 ${baseClass}`}><Truck size={12}/> Shipped</span>;
      case 'Delivered': 
        return <span className={`bg-green-100 text-green-700 ${baseClass}`}><CheckCircle size={12}/> Delivered</span>;
      case 'Cancelled': 
        return <span className={`bg-red-100 text-red-700 ${baseClass}`}><XCircle size={12}/> Cancelled</span>;
      default: 
        return <span className={`bg-gray-100 text-gray-700 ${baseClass}`}>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ShoppingBag className="text-blue-600" /> Order Management
          {/* Live Indicator */}
          <span className="relative flex h-2 w-2 ml-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600">Order ID</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Customer</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Amount</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {initialLoading ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">No orders found.</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">#{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900 font-medium">{order.customer_name}</div>
                    <div className="text-xs text-slate-500">{order.customer_email}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    ${Number(order.total_amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}