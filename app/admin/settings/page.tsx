"use client";

import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/apiClient';
import { FaSave, FaCog, FaGlobe, FaImage } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Fully restored state, initialized with empty strings to prevent the '0' typing bug
  const [settings, setSettings] = useState({
    website_name: '',
    logo_url: '',
    favicon_url: '',
    tax_rate: '',
    country: 'IN', // Defaulted to India
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await apiCall('/api/admin/settings');
      if (data) {
        setSettings({
          website_name: data.website_name || '',
          logo_url: data.logo_url || '',
          favicon_url: data.favicon_url || '',
          tax_rate: data.tax_rate?.toString() || '',
          country: data.country || 'IN',
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await apiCall('/api/admin/settings', {
      method: 'PUT',
      body: { ...settings, tax_rate: Number(settings.tax_rate) || 0 },
      showSuccessToast: true,
      successMessage: 'Store settings updated successfully!'
    });
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-8 py-6 text-white flex items-center gap-3">
          <FaCog className="text-yellow-400 text-2xl" />
          <h1 className="text-2xl font-bold tracking-tight">Store Settings</h1>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-8">
          
          <div className="space-y-6">
            <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2"><FaGlobe/> General Brand</h3>
            <div>
              <label className="text-slate-900 font-bold block mb-2">Website Name</label>
              <input type="text" value={settings.website_name} onChange={(e) => setSettings({...settings, website_name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none font-medium" placeholder="e.g. AmazonClone" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-slate-900 font-bold block mb-2 flex items-center gap-2"><FaImage className="text-slate-400"/> Logo URL</label>
                <input type="text" value={settings.logo_url} onChange={(e) => setSettings({...settings, logo_url: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none font-medium" placeholder="/logo.png" />
              </div>
              <div>
                <label className="text-slate-900 font-bold block mb-2 flex items-center gap-2"><FaImage className="text-slate-400"/> Favicon URL</label>
                <input type="text" value={settings.favicon_url} onChange={(e) => setSettings({...settings, favicon_url: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none font-medium" placeholder="/favicon.ico" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest border-b border-slate-100 pb-2">Financial Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-slate-900 font-bold block mb-2">Global Tax Rate (%)</label>
                <input type="number" step="0.01" value={settings.tax_rate} onChange={(e) => setSettings({...settings, tax_rate: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none font-medium" required />
              </div>
              <div>
                <label className="text-slate-900 font-bold block mb-2">Base Country / Region</label>
                <select value={settings.country} onChange={(e) => setSettings({...settings, country: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium">
                  <option value="IN">India (IN)</option>
                  <option value="KW">Kuwait (KW)</option>
                  <option value="US">United States (US)</option>
                  <option value="AE">United Arab Emirates (AE)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-lg">
              <FaSave /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
