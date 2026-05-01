"use client";

import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/apiClient';
import { FileText, Eye, Printer, Download } from 'lucide-react';
import { useAdminLocale } from '@/context/AdminLocaleContext';
import Link from 'next/link';

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, formatCurrency, formatNumber, locale } = useAdminLocale();

  useEffect(() => {
    const fetchInvoices = async () => {
      const data = await apiCall('/api/admin/invoices');
      if (data) setInvoices(data);
      setLoading(false);
    };
    fetchInvoices();
  }, []);

  if (loading) return <div className="p-8 text-center font-bold text-slate-500">{t('Loading')}...</div>;

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-3 rounded-xl shadow-sm text-purple-600"><FileText size={24} /></div>
          <h1 className="text-3xl font-black tracking-tight">{t('Invoice Management')}</h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Invoice #')}</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Order ID')}</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Customer')}</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Amount')}</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Date')}</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">{t('Action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {invoices.map(invoice => (
              <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-blue-600">{invoice.invoice_number}</td>
                <td className="px-6 py-4 font-bold">#{formatNumber(invoice.order_id)}</td>
                <td className="px-6 py-4">{invoice.customer_name}</td>
                <td className="px-6 py-4 font-black">{formatCurrency(invoice.total_amount)}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(invoice.created_at).toLocaleDateString(locale)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/orders/${invoice.order_id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-lg" title={t('View Order')}>
                      <Eye size={18}/>
                    </Link>
                    <button 
                      className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors rounded-lg" 
                      onClick={() => window.open(`/admin/orders/${invoice.order_id}?print=true`, '_blank')} 
                      title={t('Print')}
                    >
                      <Printer size={18}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-medium">
                        {t('No invoices found.')}
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
