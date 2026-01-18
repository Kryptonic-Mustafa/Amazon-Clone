"use client";
import { useEffect, useState } from 'react';
import { PieChart, Loader2, Calendar } from 'lucide-react';

export default function TaxPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/accounts/tax')
        .then(r => r.json())
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-[400px] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <PieChart className="text-blue-600"/> Tax Management
      </h1>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
            <div className="text-blue-100 font-medium mb-1">Total Tax Collected (All Time)</div>
            <div className="text-4xl font-bold tracking-tight">${Number(data?.totalTaxCollected || 0).toFixed(2)}</div>
            <div className="mt-4 flex gap-2 items-center text-sm text-blue-100 opacity-90">
                <Calendar size={16} /> 
                <span>Based on {data?.orderCount || 0} confirmed orders</span>
            </div>
        </div>
        {/* Decorative Circle */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-lg mb-4 text-slate-800">Active Tax Rates</h3>
        <div className="space-y-3">
            {data?.settings && Array.isArray(data.settings) && data.settings.length > 0 ? (
                data.settings.map((tax: any) => (
                    <div key={tax.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                        <span className="font-medium text-slate-700">{tax.tax_name}</span>
                        <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded border border-slate-200">{Number(tax.rate_percent).toFixed(2)}%</span>
                    </div>
                ))
            ) : (
                <p className="text-gray-500 text-sm">No tax rates configured.</p>
            )}
        </div>
      </div>
    </div>
  );
}