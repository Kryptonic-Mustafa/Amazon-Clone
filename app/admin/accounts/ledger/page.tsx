"use client";

import { useEffect, useState } from 'react';
import { DollarSign, ArrowDownLeft, ArrowUpRight, Loader2, Info, FileText } from 'lucide-react';

export default function LedgerPage() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [totals, setTotals] = useState({ debit: 0, credit: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/accounts/ledger')
      .then(r => r.json())
      .then(data => {
         if(data.transactions) setLedger(data.transactions);
         if(data.totals) setTotals(data.totals);
      })
      .catch(err => console.error("Ledger fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <DollarSign size={24} />
        </div>
        Financial Ledger
      </h1>
      
      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Debit Card (Red) */}
        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
                <div className="text-sm font-semibold text-slate-500 mb-1">Total Invoiced (Debit)</div>
                <div className="text-3xl font-bold text-red-600 flex items-center gap-2">
                    ${totals.debit.toFixed(2)}
                </div>
            </div>
            <div className="absolute right-4 top-4 p-2 bg-red-50 rounded-full text-red-500">
                <ArrowDownLeft size={20} />
            </div>
        </div>

        {/* Credit Card (Green) */}
        <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
                <div className="text-sm font-semibold text-slate-500 mb-1">Total Received (Credit)</div>
                <div className="text-3xl font-bold text-green-600 flex items-center gap-2">
                    ${totals.credit.toFixed(2)}
                </div>
            </div>
            <div className="absolute right-4 top-4 p-2 bg-green-50 rounded-full text-green-500">
                <ArrowUpRight size={20} />
            </div>
        </div>

        {/* Balance Card (Blue) */}
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
                <div className="text-sm font-semibold text-slate-500 mb-1">Balance Due</div>
                <div className="text-3xl font-bold text-blue-600 flex items-center gap-2">
                    ${(totals.debit - totals.credit).toFixed(2)}
                </div>
            </div>
            <div className="absolute right-4 top-4 p-2 bg-blue-50 rounded-full text-blue-500">
                <FileText size={20} />
            </div>
        </div>
      </div>

      {/* --- LEDGER TABLE --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Description</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Debit</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Credit</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Balance</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {loading ? (
                    <tr>
                        <td colSpan={5} className="p-20 text-center">
                            <Loader2 className="animate-spin mx-auto text-blue-600" size={32}/>
                            <p className="text-slate-400 mt-2 text-sm">Loading transactions...</p>
                        </td>
                    </tr>
                ) : ledger.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="p-20 text-center text-slate-400 flex flex-col items-center gap-3">
                            <div className="p-4 bg-slate-50 rounded-full">
                                <Info size={32} className="text-slate-300"/>
                            </div>
                            <p>No transactions found.</p>
                            <p className="text-xs">Generate an invoice from Orders to start seeing data here.</p>
                        </td>
                    </tr>
                ) : (
                    ledger.map(entry => (
                        <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                {new Date(entry.transaction_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-800">
                                <div className="font-medium">{entry.description}</div>
                                <div className="text-xs text-slate-400 mt-0.5 uppercase tracking-wide">{entry.type}</div>
                            </td>
                            <td className="px-6 py-4 text-right font-mono font-medium text-red-600">
                                {Number(entry.debit) > 0 ? `$${Number(entry.debit).toFixed(2)}` : <span className="text-slate-300">-</span>}
                            </td>
                            <td className="px-6 py-4 text-right font-mono font-medium text-green-600">
                                {Number(entry.credit) > 0 ? `$${Number(entry.credit).toFixed(2)}` : <span className="text-slate-300">-</span>}
                            </td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-slate-700 bg-slate-50/50">
                                ${Number(entry.balance).toFixed(2)}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}