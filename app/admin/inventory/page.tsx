"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiCall } from '@/lib/apiClient';
import { ClipboardList, Eye, Edit, Trash2, X, Check, Search, RotateCcw } from 'lucide-react';
import { useAdminLocale } from '@/context/AdminLocaleContext';
import Swal from 'sweetalert2';
import AdminLoader from '@/components/admin/AdminLoader';

export default function InventoryPage() {
  return (
    <Suspense fallback={<AdminLoader text="Loading Inventory..." />}>
      <InventoryContent />
    </Suspense>
  );
}

function InventoryContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, formatCurrency, formatNumber } = useAdminLocale();

  const [viewProduct, setViewProduct] = useState<any>(null);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [editData, setEditData] = useState({ price: '', stock_qty: '' });

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  const fetchProducts = async () => {
    setLoading(true);
    const data = await apiCall('/api/admin/products');
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStock = true;
    if (stockFilter === 'critical') matchesStock = Number(p.stock_qty) <= 5;
    else if (stockFilter === 'low') matchesStock = Number(p.stock_qty) > 5 && Number(p.stock_qty) <= 20;
    else if (stockFilter === 'in_stock') matchesStock = Number(p.stock_qty) > 20;

    return matchesSearch && matchesStock;
  });

  // Handle auto-view from query param
  const searchParams = useSearchParams();
  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId && products.length > 0) {
      const product = products.find(p => String(p.id) === viewId);
      if (product) setViewProduct(product);
    }
  }, [searchParams, products]);

  const getStockBadge = (qty: number) => {
    if (qty <= 5) return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">{t('Critical')} ({formatNumber(qty)})</span>;
    if (qty <= 20) return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">{t('Low')} ({formatNumber(qty)})</span>;
    return <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">{t('In Stock')} ({formatNumber(qty)})</span>;
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiCall('/api/admin/inventory', { method: 'PUT', body: { id: editProduct.id, price: editData.price, stock_qty: editData.stock_qty }, showSuccessToast: true, successMessage: 'Inventory updated!' });
    if (res) { setEditProduct(null); await fetchProducts(); }
  };

  const handleDelete = async (product: any) => {
    const result = await Swal.fire({
      title: 'Delete Product?',
      text: `Are you sure you want to delete "${product.name}"? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      const res = await apiCall(`/api/admin/products/${product.id}`, { method: 'DELETE', showSuccessToast: true, successMessage: 'Product deleted!' });
      if (res) await fetchProducts();
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-400 p-3 rounded-xl shadow-sm text-slate-900"><ClipboardList size={24} /></div>
          <h1 className="text-3xl font-black tracking-tight">{t('Inventory')}</h1>
        </div>
        <button onClick={fetchProducts} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95">
          <RotateCcw size={18} className={loading ? 'animate-spin' : ''} /> {t('Sync Data')}
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <input 
            type="text" 
            placeholder={t('Search inventory...')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 outline-none focus:ring-2 focus:ring-yellow-500 font-medium"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
             <Search size={18} />
          </span>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-yellow-500 font-bold text-sm min-w-[160px]"
          >
            <option value="all">{t('All Stock Levels')}</option>
            <option value="critical">{t('Critical Stock')}</option>
            <option value="low">{t('Low Stock')}</option>
            <option value="in_stock">{t('Healthy Stock')}</option>
          </select>
        </div>
      </div>

      {loading && products.length === 0 ? <AdminLoader text="Loading Inventory..." /> : (
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
              {filteredProducts.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-3 flex items-center gap-3">
                    <img src={p.image_urls ? p.image_urls.split(',')[0] : '/placeholder.png'} className="w-10 h-10 object-contain bg-white border border-slate-200 rounded p-1" />
                    <span className="text-sm font-bold line-clamp-1 max-w-[250px]">{p.name}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">{p.brand || '-'}</td>
                  <td className="px-6 py-3 font-bold">{formatCurrency(p.price)}</td>
                  <td className="px-6 py-3">{getStockBadge(Number(p.stock_qty))}</td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => setViewProduct(p)} className="p-2 text-slate-400 hover:text-green-600 rounded-lg transition-colors" title="View"><Eye size={18}/></button>
                    <button onClick={() => {setEditProduct(p); setEditData({price: p.price, stock_qty: p.stock_qty?.toString()});}} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg mx-1 transition-colors" title="Edit"><Edit size={18}/></button>
                    <button onClick={() => handleDelete(p)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors" title="Delete"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold italic">No inventory records found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== VIEW MODAL ===== */}
      {viewProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewProduct(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="font-bold text-lg">Product Details</h2>
              <button onClick={() => setViewProduct(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <img src={viewProduct.image_urls ? viewProduct.image_urls.split(',')[0] : '/placeholder.png'} className="w-20 h-20 object-contain bg-slate-50 border border-slate-200 rounded-xl p-2" />
                <div>
                  <h3 className="text-lg font-black text-slate-900">{viewProduct.name}</h3>
                  <p className="text-sm text-slate-500">{viewProduct.brand || 'No Brand'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Price</p>
                  <p className="text-xl font-black text-slate-900">{formatCurrency(viewProduct.price)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Stock</p>
                  <p className="text-xl font-black">{getStockBadge(Number(viewProduct.stock_qty))}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Discount</p>
                  <p className="text-lg font-bold text-slate-900">{viewProduct.discount_percent || 0}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Rating</p>
                  <p className="text-lg font-bold text-yellow-600">⭐ {viewProduct.rating || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT MODAL ===== */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditProduct(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="font-bold text-lg">Edit Inventory</h2>
              <button onClick={() => setEditProduct(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSave} className="p-6 space-y-5">
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
                <img src={editProduct.image_urls ? editProduct.image_urls.split(',')[0] : '/placeholder.png'} className="w-10 h-10 object-contain rounded" />
                <span className="font-bold text-sm text-slate-900">{editProduct.name}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={editData.price}
                  onChange={(e) => setEditData({...editData, price: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={editData.stock_qty}
                  onChange={(e) => setEditData({...editData, stock_qty: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditProduct(null)} className="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg">
                  <Check size={18} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
