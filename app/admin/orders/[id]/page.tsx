"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiCall } from '@/lib/apiClient';
import { useAdminLocale } from '@/context/AdminLocaleContext';
import { ArrowLeft, Printer, FileText, BookOpen, MapPin, Phone, Mail, Globe, Hash } from 'lucide-react';
import Link from 'next/link';
import AdminLoader from '@/components/admin/AdminLoader';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, formatCurrency, formatNumber, locale, isRTL } = useAdminLocale();
  
  const [order, setOrder] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      const data = await apiCall(`/api/admin/orders/${id}`);
      if (data) {
        setOrder(data);
        setInvoice(data.invoice || null);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('print') === 'true' && order) {
      setTimeout(() => {
        window.print();
        router.replace(`/admin/orders/${id}`);
      }, 500);
    }
  }, [order, id, router]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    const res = await apiCall(`/api/admin/orders/${id}`, {
      method: 'PUT',
      body: { status: newStatus },
      showSuccessToast: true,
      successMessage: 'Order status updated!'
    });
    if (res) setOrder({ ...order, status: newStatus });
    setUpdating(false);
  };

  const handleGenerateInvoice = async () => {
    setGenerating(true);
    const res = await apiCall(`/api/admin/orders/${id}/invoice`, {
      method: 'POST',
      showSuccessToast: true,
      successMessage: 'Invoice successfully generated!'
    });
    if (res) setInvoice(res);
    setGenerating(false);
  };

  const handleLedger = () => {
    router.push(`/admin/accounts/ledger?orderId=${id}&userId=${order.user_id || 'all'}`);
  };

  if (loading) return <AdminLoader text="Loading Order Details..." />;
  if (!order) return <div className="p-8 text-center font-bold text-red-500 min-h-screen flex items-center justify-center">Not Found</div>;

  const subtotal = Number(order.total_amount) - (invoice ? Number(invoice.tax_amount) : 0);
  const tax = invoice ? Number(invoice.tax_amount) : 0;
  const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${invoice?.invoice_number || 'ORDER-'+order.id}&scale=2&rotate=N&includetext=true`;

  return (
    <div className="p-4 md:p-8 bg-slate-100 min-h-screen text-slate-900 print:bg-white print:p-0">
      
      {/* PROFESSIONAL PRINT OVERRIDES - MIRRORS VIEWPOINT EXACTLY */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: #f1f5f9 !important; /* Mimics bg-slate-100 */
            padding: 10mm !important;
          }
          @page {
            margin: 0;
            size: auto;
          }
          .invoice-card {
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 1.5rem !important;
            background-color: white !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .print-compact-p {
            padding: 1.5rem !important;
          }
        }
      `}</style>
      
      {/* Action Bar */}
      <div className="print:hidden max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <Link href="/admin/orders" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors">
          <ArrowLeft size={20} className={isRTL ? "rotate-180" : ""} /> {t('Back to Orders')}
        </Link>
        
        <div className="flex flex-wrap gap-3">
          <select 
            disabled={updating}
            value={order.status} 
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-4 py-2 rounded-xl font-bold border border-slate-200 shadow-sm bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value="Pending">{t('Pending')}</option>
            <option value="Shipped">{t('Shipped')}</option>
            <option value="Completed">{t('Completed')}</option>
            <option value="Cancelled">{t('Cancelled')}</option>
          </select>

          <button onClick={handleLedger} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95">
            <BookOpen size={18}/> {t('Ledger')}
          </button>
          
          {!invoice ? (
            <button onClick={handleGenerateInvoice} disabled={generating} className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95">
              <FileText size={18}/> {generating ? t('Generating...') : t('Generate Invoice')}
            </button>
          ) : (
            <button onClick={() => window.print()} className="bg-slate-900 text-white hover:bg-slate-800 px-5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95">
              <Printer size={18}/> {t('Print Invoice')}
            </button>
          )}
        </div>
      </div>

      {/* RETAIL STYLE INVOICE TEMPLATE */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-300 max-w-5xl mx-auto overflow-hidden invoice-card">
        
        {/* Store Header */}
        <div className="p-8 md:p-10 print:p-6 border-b-2 border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 text-white p-2 rounded font-black text-2xl">AP</div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">AdminPanel <span className="text-blue-600">Store</span></h2>
            </div>
            <div className="text-sm font-medium text-slate-600 space-y-1">
              <p className="flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> 123 Enterprise Way, Business District, KW 12001</p>
              <p className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> +965 1234 5678, +965 8765 4321</p>
              <p className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> support@adminpanel.com</p>
              <p className="flex items-center gap-2"><Globe size={14} className="text-slate-400" /> www.adminpanel.com</p>
            </div>
          </div>
          <div className={`flex flex-col items-end ${isRTL ? 'items-start' : 'items-end'}`}>
             <div className="text-right rtl:text-left space-y-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('GSTIN')}: <span className="text-slate-900">12ABCDE1234F1Z5</span></p>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('PAN')}: <span className="text-slate-900">ABCDE1234F</span></p>
                <div className="mt-4 pt-4 border-t border-slate-100">
                   <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t('Tax Invoice')}</h1>
                   {invoice && <p className="text-lg font-bold text-blue-600 tracking-wider">#{invoice.invoice_number}</p>}
                </div>
             </div>
          </div>
        </div>

        {/* Invoice Meta Data */}
        <div className="bg-slate-50 border-b border-slate-200 px-10 py-6 print:px-6 print:py-3 grid grid-cols-2 md:grid-cols-4 gap-6 print:gap-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Invoice Date')}</p>
            <p className="font-bold text-slate-900">{new Date(invoice?.created_at || order.created_at).toLocaleDateString(locale)}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Order Reference')}</p>
            <p className="font-bold text-slate-900">#{formatNumber(order.id)}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Payment Mode')}</p>
            <p className="font-bold text-slate-900">{t('Cash/Online')}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Cashier')}</p>
            <p className="font-bold text-slate-900">Admin</p>
          </div>
        </div>

        {/* Customer Details */}
        <div className="p-10 print:p-6 grid grid-cols-1 md:grid-cols-2 gap-10 print:gap-6 border-b border-slate-200">
           <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Hash size={14}/> {t('Customer Details')}</p>
              <h3 className="text-xl font-black text-slate-900">{order.customer_name}</h3>
              <p className="text-slate-600 font-medium mt-1">{order.customer_email || order.email}</p>
              <p className="text-slate-600 font-medium mt-1">{order.customer_phone || '+965 000 0000'}</p>
           </div>
           <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin size={14}/> {t('Shipping Address')}</p>
              <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{order.shipping_address || 'Address Not Provided'}</p>
           </div>
        </div>

        {/* Line Items Table */}
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-900 text-white print:bg-slate-100 print:text-black border-b border-slate-900">
                <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest w-[80px]">S.No</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">{t('Item Description')}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center w-[100px]">{t('Qty')}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right w-[150px]">{t('Rate')}</th>
                <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-right w-[150px]">{t('Amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items?.map((item: any, idx: number) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-10 py-5 print:py-2 text-sm font-bold text-slate-400">{idx + 1}</td>
                  <td className="px-6 py-5 print:py-2">
                    <p className="font-black text-slate-900">{item.product_name}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">HSN: 84713010 | SKU: PROD-{item.product_id}</p>
                  </td>
                  <td className="px-6 py-5 print:py-2 text-center font-black text-slate-700">{formatNumber(item.quantity)}</td>
                  <td className="px-6 py-5 print:py-2 text-right font-bold text-slate-700">{formatCurrency(item.price)}</td>
                  <td className="px-10 py-5 print:py-2 text-right font-black text-slate-900">{formatCurrency(Number(item.price) * item.quantity)}</td>
                </tr>
              ))}
              {(!order.items || order.items.length === 0) && (
                <tr><td colSpan={5} className="px-10 py-10 text-center text-slate-400 font-bold italic">{t('No items available for this draft.')}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals & Tax Calculation */}
        <div className="p-10 print:p-6 bg-slate-900 text-white print:bg-white print:text-black border-t-2 border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-10 print:gap-6">
          <div className="space-y-6">
            <div className="space-y-1">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Amount in Words')}</p>
               <p className="text-sm font-bold capitalize">{t('Total payable amount in currency units.')}</p>
            </div>
            {/* Barcode Section */}
            <div className="pt-4">
              <div className="bg-white p-2 rounded inline-block">
                <img src={barcodeUrl} alt="Barcode" className="h-16 w-auto mix-blend-multiply" />
              </div>
              <p className="text-[10px] font-bold mt-2 text-slate-400 tracking-[0.5em]">{invoice?.invoice_number || 'ORDER-'+order.id}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-bold border-b border-slate-700 print:border-slate-200 pb-2">
               <span className="text-slate-400 uppercase tracking-widest">{t('Sub Total')}</span>
               <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold border-b border-slate-700 print:border-slate-200 pb-2">
               <span className="text-slate-400 uppercase tracking-widest">{t('GST')} (CGST 9% + SGST 9%)</span>
               <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
               <span className="text-2xl font-black uppercase tracking-tighter">{t('Grand Total')}</span>
               <span className="text-4xl font-black text-blue-400 print:text-blue-600">{formatCurrency(order.total_amount)}</span>
            </div>
            <p className="text-[10px] text-right font-bold text-slate-400 italic">*{t('Prices are inclusive of all taxes')}</p>
          </div>
        </div>

        {/* Footer Terms */}
        <div className="p-10 print:p-6 border-t border-slate-100 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-10 print:gap-6 items-end">
           <div className="text-[10px] print:text-[8px] text-slate-500 space-y-2 max-w-sm">
              <p className="font-black text-slate-900 uppercase tracking-widest mb-2">{t('Terms & Conditions')}</p>
              <ul className="list-disc list-inside space-y-1 leading-relaxed">
                 <li>{t('Goods once sold will not be taken back or exchanged.')}</li>
                 <li>{t('Warranty as per manufacturer terms and conditions.')}</li>
                 <li>{t('Subject to local jurisdiction of the store city.')}</li>
                 <li>{t('This is a computer generated invoice.')}</li>
              </ul>
           </div>
           <div className={`text-right ${isRTL ? 'text-left' : 'text-right'} space-y-4 relative min-h-[100px] flex flex-col justify-end`}>
              {invoice && (
                <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} transform -rotate-12 border-4 border-blue-600/30 rounded-xl px-6 py-2 select-none pointer-events-none flex flex-col items-center justify-center bg-white/50 backdrop-blur-[1px]`}>
                   <p className="text-blue-600/40 text-[8px] font-black uppercase tracking-[0.2em] leading-none mb-1">Official Stamp</p>
                   <p className="text-blue-600/80 text-3xl font-black italic tracking-tighter leading-none" style={{ fontFamily: 'serif' }}>Babji Store</p>
                   <p className="text-blue-600/40 text-[8px] font-bold uppercase mt-2 tracking-widest">{new Date(invoice.created_at).toLocaleDateString()}</p>
                </div>
              )}
              <div className="inline-block border-b-2 border-slate-300 w-48 h-12 self-end"></div>
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{t('Authorized Signatory')}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Powered by AdminPanel Enterprise v1.0</p>
           </div>
        </div>

      </div>
      
      <div className="h-20 print:hidden"></div>
    </div>
  );
}
