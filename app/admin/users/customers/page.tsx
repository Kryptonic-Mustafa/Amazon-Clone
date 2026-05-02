"use client";

import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/apiClient';
import { Users, Edit, Trash2, X, Plus } from 'lucide-react';
import { useAdminLocale } from '@/context/AdminLocaleContext';
import Swal from 'sweetalert2';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import AdminLoader from '@/components/admin/AdminLoader';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { t, isRTL, locale } = useAdminLocale();

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  const fetchCustomers = async () => {
    setLoading(true);
    const data = await apiCall('/api/admin/users/customers');
    if (data) setCustomers(data);
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const openModal = (customer: any = null) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({ name: customer.name, email: customer.email, phone: customer.phone || '', address: customer.address || '' });
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', phone: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/admin/users/customers?id=${editingId}` : '/api/admin/users/customers';
    const method = editingId ? 'PUT' : 'POST';
    const res = await apiCall(url, { method, body: formData, showSuccessToast: true, successMessage: editingId ? 'Customer Updated!' : 'Customer Saved!' });
    if (res) { setIsModalOpen(false); fetchCustomers(); }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: "This will archive the customer.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (result.isConfirmed) {
      await apiCall(`/api/admin/users/customers?id=${id}`, { method: 'DELETE', showSuccessToast: true, successMessage: 'Customer Archived!' });
      fetchCustomers();
    }
  };

  if (loading) return <AdminLoader text="Loading Customers..." />;

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-xl shadow-sm text-purple-600"><Users size={24} /></div>
            <h1 className="text-3xl font-black tracking-tight">{t('Customer Management')}</h1>
        </div>
        <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95">
          <Plus size={20} /> {t('Add New Customer')}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Customer Name')}</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Email')}</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Phone')}</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">{t('Joined')}</th>
              <th className={`px-6 py-4 font-bold uppercase tracking-widest text-xs ${isRTL ? 'text-left' : 'text-right'}`}>{t('Action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {customers.map((c: any) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">{c.name}</td>
                <td className="px-6 py-4 text-slate-600">{c.email}</td>
                <td className="px-6 py-4 text-slate-600" dir="ltr">{c.phone || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(c.created_at).toLocaleDateString(locale)}</td>
                <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                  {/* FIXED WIRED BUTTONS */}
                  <button onClick={() => openModal(c)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"><Edit size={18}/></button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold">{editingId ? 'Edit Customer' : t('Add New Customer')}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-bold mb-2 text-slate-700">Full Name</label>
                    <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-2 text-slate-700">Phone Number</label>
                    <div className="phone-input-wrapper" dir="ltr">
                      <PhoneInput defaultCountry={locale === 'ar-KW' ? 'kw' : 'in'} value={formData.phone} onChange={(phone) => setFormData({...formData, phone})} inputClassName="w-full !border-slate-300 !rounded-r-xl !px-4 !py-2.5 !outline-none focus:!ring-2 focus:!ring-blue-500 !font-medium !text-slate-900" countrySelectorStyleProps={{ buttonClassName: "!border-slate-300 !rounded-l-xl !px-3 !bg-slate-50" }} />
                    </div>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2 text-slate-700">Email Address</label>
                <input required type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
              </div>
              <div className="mb-8">
                <label className="block text-sm font-bold mb-2 text-slate-700">Home Address</label>
                <textarea rows={3} value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
              </div>
              
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
                  <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors">{editingId ? 'Update Customer' : 'Save Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
