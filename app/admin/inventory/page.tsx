"use client";

import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/apiClient';
import { ClipboardList, Eye, Edit, Trash2, X, Check } from 'lucide-react';
import { useAdminLocale } from '@/context/AdminLocaleContext';
import Swal from 'sweetalert2';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, formatCurrency, formatNumber } = useAdminLocale();

  const [viewProduct, setViewProduct] = useState<any>(null);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [editData, setEditData] = useState({ price: '', stock_qty: '' });

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await apiCall('/api/admin/products');
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const getStockBadge = (qty: number) => {
    if (qty <= 5) return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">{t('Critical')} ({formatNumber(qty)})</span>;
    if (qty <= 20) return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">{t('Low')} ({formatNumber(qty)})</span>;
    return <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">{t('In Stock')} ({formatNumber(qty)})</span>;
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiCall('/api/admin/inventory', { method: 'PUT', body: { id: editProduct.id, price: editData.price, stock_qty: editData.stock_qty }, showSuccessToast: true });
    if (res) { setEditProduct(null); const data = await apiCall('/api/admin/products'); if(data) setProducts(data); }
  };

  if (loading) return <div className="p-8 text-center font-bold text-slate-500">Loading Inventory Data...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-yellow-400 p-3 rounded-xl shadow-sm text-slate-900"><ClipboardList size={24} /></div>
        <h1 className="text-3xl font-black tracking-tight">{t('Inventory')}</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Product')}</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Brand')}</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Price')}</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Stock Level')}</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">{t('Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-3 flex items-center gap-3">
                  <img src={p.image_urls ? p.image_urls.split(',')[0] : '/placeholder.png'} className="w-10 h-10 object-contain bg-white border border-slate-200 rounded p-1" />
                  <span className="text-sm font-bold line-clamp-1 max-w-[250px]">{p.name}</span>
                </td>
                <td className="px-6 py-3 text-sm text-slate-500">{p.brand || '-'}</td>
                <td className="px-6 py-3 font-bold">{formatCurrency(p.price)}</td>
                <td className="px-6 py-3">{getStockBadge(Number(p.stock_qty))}</td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => setViewProduct(p)} className="p-2 text-slate-400 hover:text-green-600 rounded-lg"><Eye size={18}/></button>
                  <button onClick={() => {setEditProduct(p); setEditData({price: p.price, stock_qty: p.stock_qty?.toString()});}} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg mx-1"><Edit size={18}/></button>
                  <button className="p-2 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
