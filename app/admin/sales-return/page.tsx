"use client";

import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/apiClient';
import { RotateCcw, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAdminLocale } from '@/context/AdminLocaleContext';
import AdminLoader from '@/components/admin/AdminLoader';
import toast from 'react-hot-toast';

export default function AdminSalesReturnPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, formatCurrency, formatNumber, locale } = useAdminLocale();
  const [viewReturn, setViewReturn] = useState<any>(null);

  const fetchReturns = async () => {
    const data = await apiCall('/api/admin/returns');
    if (data) setReturns(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch('/api/admin/returns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        toast.success(`Return request ${status.toLowerCase()}`);
        fetchReturns();
        setViewReturn(null);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <AdminLoader text="Loading Returns..." />;

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-red-100 p-3 rounded-xl shadow-sm text-red-600"><RotateCcw size={24} /></div>
        <h1 className="text-3xl font-black tracking-tight">{t('Sales Returns')}</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Order ID')}</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Product')}</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Customer')}</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Qty')}</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Status')}</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">{t('Action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {returns.map((ret: any) => (
              <tr key={ret.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">#{formatNumber(ret.order_id)}</td>
                <td className="px-6 py-4 font-bold">{ret.product_name}</td>
                <td className="px-6 py-4">
                  {ret.orders?.customer_name}
                  <span className="block text-xs font-normal text-slate-400">{ret.orders?.customer_email}</span>
                </td>
                <td className="px-6 py-4">{formatNumber(ret.quantity)}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    ret.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    ret.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                    ret.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {t(ret.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setViewReturn(ret)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-lg"><Eye size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL */}
      {viewReturn && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50" onClick={() => setViewReturn(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 text-white px-8 py-6 flex justify-between items-center">
              <div>
                <h3 className="font-black text-xl">Return Details</h3>
                <p className="text-slate-400 text-sm mt-1">Request ID: #{viewReturn.id}</p>
              </div>
              <button onClick={() => setViewReturn(null)} className="text-slate-400 hover:text-white"><XCircle size={24}/></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                  <p className="font-bold text-slate-900">{viewReturn.orders?.customer_name}</p>
                  <p className="text-sm text-slate-500">{viewReturn.orders?.customer_email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    viewReturn.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    viewReturn.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                    viewReturn.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {viewReturn.status}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Return Item</p>
                <div className="flex justify-between items-center">
                  <p className="font-black text-slate-900">{viewReturn.product_name}</p>
                  <p className="font-bold text-slate-500">Qty: {viewReturn.quantity}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Reason</p>
                  <p className="text-sm text-slate-700 italic">"{viewReturn.return_reason}"</p>
                </div>
              </div>

              {viewReturn.status === 'Pending' && (
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => updateStatus(viewReturn.id, 'Rejected')}
                    className="flex-1 border-2 border-slate-200 text-slate-600 font-black py-3 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                  <button 
                    onClick={() => updateStatus(viewReturn.id, 'Approved')}
                    className="flex-1 bg-blue-600 text-white font-black py-3 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Approve
                  </button>
                </div>
              )}

              {viewReturn.status === 'Approved' && (
                <button 
                  onClick={() => updateStatus(viewReturn.id, 'Completed')}
                  className="w-full bg-green-600 text-white font-black py-4 rounded-2xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} /> Mark as Completed / Refunded
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
