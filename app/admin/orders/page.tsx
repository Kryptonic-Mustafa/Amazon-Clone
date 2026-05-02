"use client";

import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/apiClient';
import { ShoppingCart, Eye, Search, RotateCcw } from 'lucide-react';
import { useAdminLocale } from '@/context/AdminLocaleContext';
import Link from 'next/link';
import AdminLoader from '@/components/admin/AdminLoader';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, formatCurrency, formatNumber, locale } = useAdminLocale();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    const data = await apiCall('/api/admin/orders');
    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toString().includes(searchTerm) || 
                         (o.customer_name && o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (o.customer_email && o.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-xl shadow-sm text-blue-600"><ShoppingCart size={24} /></div>
          <h1 className="text-3xl font-black tracking-tight">{t('Order Management')}</h1>
        </div>
        <button onClick={fetchOrders} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95">
          <RotateCcw size={18} className={loading ? 'animate-spin' : ''} /> {t('Sync Data')}
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <input 
            type="text" 
            placeholder={t('Search by Order ID, Customer Name or Email...')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
             <Search size={18} />
          </span>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm min-w-[160px]"
          >
            <option value="all">{t('All Statuses')}</option>
            <option value="Pending">{t('Pending')}</option>
            <option value="Processing">{t('Processing')}</option>
            <option value="Shipped">{t('Shipped')}</option>
            <option value="Completed">{t('Completed')}</option>
            <option value="Cancelled">{t('Cancelled')}</option>
          </select>
        </div>
      </div>

      {loading && orders.length === 0 ? <AdminLoader text="Loading Orders..." /> : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Order ID')}</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Customer')}</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Amount')}</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Date')}</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Status')}</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">{t('Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">#{formatNumber(order.id)}</td>
                  <td className="px-6 py-4 font-bold">
                    {order.customer_name} 
                    <span className="block text-xs font-normal text-slate-400">{order.customer_email || order.email}</span>
                  </td>
                  <td className="px-6 py-4 font-black text-blue-600">{formatCurrency(order.total_amount)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString(locale)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {t(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="inline-block p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-lg"><Eye size={18}/></Link>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-bold italic">No orders found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
