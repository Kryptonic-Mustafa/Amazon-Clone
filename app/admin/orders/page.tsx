"use client";

import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/apiClient';
import { ShoppingCart, Eye } from 'lucide-react';
import { useAdminLocale } from '@/context/AdminLocaleContext';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, formatCurrency, formatNumber, locale } = useAdminLocale();

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await apiCall('/api/admin/orders');
      if (data) setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="p-8 text-center font-bold text-slate-500">Loading orders...</div>;

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-100 p-3 rounded-xl shadow-sm text-blue-600"><ShoppingCart size={24} /></div>
        <h1 className="text-3xl font-black tracking-tight">{t('Order Management')}</h1>
      </div>

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
            {orders.map((order: any) => (
              <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">#{formatNumber(order.id)}</td>
                <td className="px-6 py-4 font-bold">{order.customer_name} <span className="block text-xs font-normal text-slate-400">{order.email}</span></td>
                <td className="px-6 py-4 font-black">{formatCurrency(order.total_amount)}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString(locale)}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {t(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {/* FIXED: Replaced modal state with actual Page Link */}
                  <Link href={`/admin/orders/${order.id}`} className="inline-block p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-lg"><Eye size={18}/></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
