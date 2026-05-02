"use client";

import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/apiClient';
import { BookOpen, Printer, Download, Filter, Hash } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useAdminLocale } from '@/context/AdminLocaleContext';

function LedgerPageContent() {
  const searchParams = useSearchParams();
  const urlUserId = searchParams.get('userId') || 'all';
  const urlOrderId = searchParams.get('orderId') || 'all';

  const [entries, setEntries] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [userId, setUserId] = useState(urlUserId);
  const [orderId, setOrderId] = useState(urlOrderId);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { t, formatCurrency, formatNumber, locale } = useAdminLocale();

  const fetchLedger = async () => {
    setLoading(true);
    let url = `/api/admin/accounts/ledger?userId=${userId}&orderId=${orderId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    
    const data = await apiCall(url);
    if (data) {
      setEntries(data.entries || []);
      setUsers(data.users || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLedger(); }, [userId, orderId, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    const headers = ['Date', 'Particulars', 'Vch Type', 'Vch No.', 'Debit', 'Credit', 'Balance'];
    const rows = entries.map((e: any) => [
      new Date(e.transaction_date).toLocaleDateString(),
      `"${e.description}"`,
      e.type,
      e.reference_id,
      e.debit,
      e.credit,
      e.balance
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((e: any) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Ledger_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalDebit = entries.reduce((sum, e) => sum + Number(e.debit || 0), 0);
  const totalCredit = entries.reduce((sum, e) => sum + Number(e.credit || 0), 0);

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-900 print:bg-white print:p-0">
      
      {/* HEADER & CONTROLS (Hidden on Print) */}
      <div className="print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-lg text-white shadow-sm"><BookOpen size={24} /></div>
            <div>
                <h1 className="text-2xl font-black tracking-tight leading-none">General Ledger</h1>
                <p className="text-sm text-slate-500 font-medium">Statement of Accounts</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors text-sm">
              <Download size={16}/> Export CSV
            </button>
            <button onClick={handlePrint} className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors text-sm">
              <Printer size={16}/> Print Report
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Filter size={12}/> {t('Account / User')}</label>
            <select value={userId} onChange={e=>setUserId(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white">
              <option value="all">{t('All Accounts (General)')}</option>
              {users.map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <div className="w-[150px]">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Hash size={12}/> {t('Order ID')}</label>
            <input 
              type="text" 
              placeholder={t('All')} 
              value={orderId === 'all' ? '' : orderId} 
              onChange={e => setOrderId(e.target.value || 'all')} 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{t('Period From')}</label>
            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{t('Period To')}</label>
            <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" />
          </div>
          <button onClick={() => {setUserId('all'); setOrderId('all'); setStartDate(''); setEndDate('');}} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">{t('Clear')}</button>
        </div>
      </div>

      {/* PRINTABLE LEDGER TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-300 overflow-hidden print:shadow-none print:border-none">
        
        {/* Print Header */}
        <div className="hidden print:block text-center mb-6 border-b-2 border-slate-900 pb-4">
            <h1 className="text-2xl font-black uppercase tracking-widest">General Ledger Statement</h1>
            <p className="text-sm font-medium mt-1">Period: {startDate ? new Date(startDate).toLocaleDateString() : 'Beginning'} to {endDate ? new Date(endDate).toLocaleDateString() : 'Present'}</p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Fetching records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-medium text-slate-800">
              <thead className="bg-slate-100 border-b-2 border-slate-300">
                <tr>
                  <th className="px-4 py-3 font-bold text-left border-r border-slate-200 w-[120px]">Date</th>
                  <th className="px-4 py-3 font-bold text-left border-r border-slate-200">Particulars</th>
                  <th className="px-4 py-3 font-bold text-left border-r border-slate-200 w-[100px]">Vch Type</th>
                  <th className="px-4 py-3 font-bold text-left border-r border-slate-200 w-[100px]">Vch No.</th>
                  <th className="px-4 py-3 font-bold text-right border-r border-slate-200 w-[120px]">Debit</th>
                  <th className="px-4 py-3 font-bold text-right border-r border-slate-200 w-[120px]">Credit</th>
                  <th className="px-4 py-3 font-bold text-right w-[120px]">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {entries.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-500 font-sans">No transactions found for the selected criteria.</td></tr>
                ) : (
                  entries.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 border-r border-slate-200 text-slate-500">{new Date(entry.transaction_date).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-2.5 border-r border-slate-200 font-sans text-sm font-semibold">{entry.description}</td>
                      <td className="px-4 py-2.5 border-r border-slate-200 text-slate-500">{entry.type}</td>
                      <td className="px-4 py-2.5 border-r border-slate-200 text-blue-600 font-bold">{entry.reference_id || '-'}</td>
                      <td className="px-4 py-2.5 border-r border-slate-200 text-right">{Number(entry.debit) > 0 ? Number(entry.debit).toFixed(2) : ''}</td>
                      <td className="px-4 py-2.5 border-r border-slate-200 text-right">{Number(entry.credit) > 0 ? Number(entry.credit).toFixed(2) : ''}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900">{Number(entry.balance).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-400 font-mono text-xs">
                <tr>
                    <td colSpan={4} className="px-4 py-3 font-black text-right border-r border-slate-200 uppercase font-sans text-sm">Closing Totals</td>
                    <td className="px-4 py-3 font-black text-right border-r border-slate-200">{totalDebit.toFixed(2)}</td>
                    <td className="px-4 py-3 font-black text-right border-r border-slate-200">{totalCredit.toFixed(2)}</td>
                    <td className="px-4 py-3 font-black text-right text-blue-600 bg-blue-50">{(totalDebit - totalCredit).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


import React, { Suspense } from 'react';
export default function LedgerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-blue-600 font-bold">Loading...</div>}>
      <LedgerPageContent />
    </Suspense>
  );
}
