"use client";

import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/apiClient';
import { Truck, Plus, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [supplierName, setSupplierName] = useState('');
  const [items, setItems] = useState<{name: string, qty: string, price: string}[]>([{name: '', qty: '1', price: '0'}]);

  useEffect(() => { fetchPOs(); }, []);

  const fetchPOs = async () => {
    const data = await apiCall('/api/admin/purchase-orders');
    if (data) setPos(data);
    setLoading(false);
  };

  const handleItemChange = (index: number, field: string, val: string) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = val;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { supplier_name: supplierName, total_amount: calculateTotal(), items: items };
    const res = await apiCall('/api/admin/purchase-orders', { method: 'POST', body: payload, showSuccessToast: true, successMessage: 'PO Created!' });
    if (res) { setIsModalOpen(false); fetchPOs(); setSupplierName(''); setItems([{name: '', qty: '1', price: '0'}]); }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: 'Delete this PO?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (result.isConfirmed) {
      await apiCall(`/api/admin/purchase-orders?id=${id}`, { method: 'DELETE', showSuccessToast: true });
      fetchPOs();
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-400 p-3 rounded-xl shadow-sm"><Truck size={24} /></div>
          <h1 className="text-3xl font-black tracking-tight">Purchase Orders</h1>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:bg-slate-800 transition-colors">
          <Plus size={20} /> Create PO
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">PO Number</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Supplier</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Items</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Total Est.</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Date</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pos.map((p: any) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-orange-600">PO-{p.id}</td>
                <td className="px-6 py-4 font-bold">{p.supplier_name}</td>
                <td className="px-6 py-4 font-medium">{(p.items as any[]).length} items</td>
                <td className="px-6 py-4 font-black">${Number(p.total_amount).toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center"><h2 className="text-lg font-bold">New Purchase Order</h2><button onClick={() => setIsModalOpen(false)}><X size={20}/></button></div>
            <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="mb-6">
                <label className="block text-sm font-bold mb-1">Supplier Name</label>
                <input required value={supplierName} onChange={e=>setSupplierName(e.target.value)} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2"><label className="text-sm font-bold">Materials / Products Required</label><button type="button" onClick={()=>setItems([...items, {name:'', qty:'1', price:'0'}])} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold hover:bg-blue-200">+ Add Item</button></div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input required placeholder="Material / Product Name" value={item.name} onChange={e=>handleItemChange(i, 'name', e.target.value)} className="flex-1 border rounded-lg px-3 py-1.5 text-sm outline-none" />
                      <input required type="number" placeholder="Qty" value={item.qty} onChange={e=>handleItemChange(i, 'qty', e.target.value)} className="w-20 border rounded-lg px-3 py-1.5 text-sm outline-none" />
                      <input required type="number" step="0.01" placeholder="Est. Price" value={item.price} onChange={e=>handleItemChange(i, 'price', e.target.value)} className="w-24 border rounded-lg px-3 py-1.5 text-sm outline-none" />
                      <button type="button" onClick={()=>setItems(items.filter((_, idx)=>idx!==i))} className="text-red-500 px-2"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center border-t pt-4">
                <div className="text-lg">Est Total: <span className="font-black">${calculateTotal().toFixed(2)}</span></div>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-blue-700">Generate PO</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
