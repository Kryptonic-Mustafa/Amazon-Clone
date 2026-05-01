"use client";

import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/apiClient';
import { DollarSign, Package, Users, AlertTriangle, FileSpreadsheet, Truck, Star, TrendingUp, ShoppingCart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAdminLocale } from '@/context/AdminLocaleContext'; // NEW: Imported Locale Engine

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t, formatCurrency, formatNumber, locale } = useAdminLocale(); // Extracted formatters

  useEffect(() => {
    const fetchDashboard = async () => {
      const result = await apiCall('/api/admin/dashboard');
      if (result) setData(result);
      setLoading(false);
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-8 flex items-center justify-center min-h-[80vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  const { stats, chartData, recentOrders } = data;

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('Platform Overview')}</h1>
        <p className="text-slate-500 font-medium mt-1">{t('Real-time metrics for your enterprise modules.')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div><p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t('Total Revenue')}</p></div>
            <div className="p-3 bg-green-100 text-green-600 rounded-xl"><DollarSign size={20}/></div>
          </div>
          {/* APPLIED NATIVE CURRENCY FORMATTER */}
          <h2 className="text-3xl font-black text-slate-900">{formatCurrency(stats.revenue)}</h2>
          <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1"><TrendingUp size={12}/> {t('All time')}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div><p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t('Total Orders')}</p></div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Package size={20}/></div>
          </div>
          <h2 className="text-3xl font-black text-slate-900">{formatNumber(stats.orders)}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div><p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t('Customers')}</p></div>
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><Users size={20}/></div>
          </div>
          <h2 className="text-3xl font-black text-slate-900">{formatNumber(stats.customers)}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div><p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t('Avg Rating')}</p></div>
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl"><Star size={20} className="fill-current"/></div>
          </div>
          <h2 className="text-3xl font-black text-slate-900">{formatNumber(stats.avgRating, 1)} <span className="text-lg text-slate-400 font-medium">/ {formatNumber(5)}</span></h2>
          <p className="text-xs text-slate-500 font-bold mt-2">{t('Based on')} {formatNumber(stats.totalReviews)} {t('reviews')}</p>
        </div>
      </div>

      <h3 className="text-lg font-black text-slate-900 tracking-tight mb-4 border-l-4 border-blue-600 pl-3 rtl:border-l-0 rtl:border-r-4 rtl:pr-3">{t('Module Activity')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`p-6 rounded-2xl shadow-sm border ${stats.lowStock > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-full ${stats.lowStock > 0 ? 'bg-red-200 text-red-700' : 'bg-slate-100 text-slate-500'}`}><AlertTriangle size={24}/></div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t('Low Stock Items')}</p>
              <h2 className={`text-2xl font-black ${stats.lowStock > 0 ? 'text-red-700' : 'text-slate-900'}`}>{formatNumber(stats.lowStock)} {t('Items')}</h2>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 rounded-full bg-blue-100 text-blue-700"><FileSpreadsheet size={24}/></div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t('Total Quotations')}</p>
            <h2 className="text-2xl font-black text-slate-900">{formatNumber(stats.quotes)} {t('Issued')}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 rounded-full bg-orange-100 text-orange-700"><Truck size={24}/></div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t('Purchase Orders')}</p>
            <h2 className="text-2xl font-black text-slate-900">{formatNumber(stats.pos)} {t('Created')}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-black text-slate-900 mb-6 tracking-tight">{t('Revenue (Last 7 Days)')}</h3>
          <div className="h-[300px] w-full" dir="ltr"> {/* Charts usually need LTR wrapper */}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(value) => formatNumber(value)} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [formatCurrency(value), t('Amount')]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('Recent Orders')}</h3>
          </div>
          <div className="space-y-6">
            {recentOrders.length === 0 ? (
              <p className="text-slate-500 text-sm">No recent orders found.</p>
            ) : (
              recentOrders.map((order: any) => (
                <div key={order.id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      <ShoppingCart size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{t('Order ID')} #{formatNumber(order.id)}</p>
                      <p className="text-xs text-slate-500 font-medium">{order.customer_name}</p>
                    </div>
                  </div>
                  <div className={`text-right ${locale.startsWith('ar') ? 'text-left' : ''}`}>
                    <p className="font-black text-slate-900">{formatCurrency(order.total_amount)}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {t(order.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
