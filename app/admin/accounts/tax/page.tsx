"use client";

import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/apiClient';
import { Calculator, Printer, Download, Filter } from 'lucide-react';

export default function TaxReportPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [userId, setUserId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchTaxData = async () => {
    setLoading(true);
    let url = `/api/admin/accounts/tax?userId=${userId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    
    const data = await apiCall(url);
    if (data) {
      setEntries(data.entries || []);
      setUsers(data.users || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTaxData(); }, [userId, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    const headers = ['Date', 'Invoice No', 'Customer Name', 'Total Amount', 'Tax Amount'];
    const rows = entries.map((e: any) => [
      new Date(e.created_at).toLocaleDateString(),
      e.invoice_number,
      `"${e.customer_name}"`,
      e.total_amount,
      e.tax_amount
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((e: any) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Tax_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSales = entries.reduce((sum, e) => sum + Number(e.total_amount || 0), 0);
  const totalTax = entries.reduce((sum, e) => sum + Number(e.tax_amount || 0), 0);

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-900 print:bg-white print:p-0">
      
      {/* HEADER & CONTROLS (Hidden on Print) */}
      <div className="print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2.5 rounded-lg text-white shadow-sm"><Calculator size={24} /></div>
            <div>
                <h1 className="text-2xl font-black tracking-tight leading-none">Taxation Report</h1>
                <p className="text-sm text-slate-500 font-medium">Sales & Tax Collection</p>
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
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Filter size={12}/> Filter by User</label>
            <select value={userId} onChange={e=>setUserId(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white">
              <option value="all">All Invoices (Consolidated)</option>
              {users.map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Period From</label>
            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Period To</label>
            <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" />
          </div>
          <button onClick={() => {setUserId('all'); setStartDate(''); setEndDate('');}} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Clear</button>
        </div>
      </div>

      {/* PRINTABLE TAX TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-300 overflow-hidden print:shadow-none print:border-none">
        
        <div className="hidden print:block text-center mb-6 border-b-2 border-slate-900 pb-4">
            <h1 className="text-2xl font-black uppercase tracking-widest">Tax Collection Report</h1>
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
                  <th className="px-4 py-3 font-bold text-left border-r border-slate-200 w-[150px]">Invoice No.</th>
                  <th className="px-4 py-3 font-bold text-left border-r border-slate-200">Customer Name</th>
                  <th className="px-4 py-3 font-bold text-right border-r border-slate-200 w-[150px]">Gross Amount</th>
                  <th className="px-4 py-3 font-bold text-right w-[150px]">Tax Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {entries.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-sans">No tax records found for the selected criteria.</td></tr>
                ) : (
                  entries.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 border-r border-slate-200 text-slate-500">{new Date(entry.created_at).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-2.5 border-r border-slate-200 text-blue-600 font-bold">{entry.invoice_number}</td>
                      <td className="px-4 py-2.5 border-r border-slate-200 font-sans text-sm font-semibold">{entry.customer_name}</td>
                      <td className="px-4 py-2.5 border-r border-slate-200 text-right">{Number(entry.total_amount).toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-red-600">{Number(entry.tax_amount).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-400 font-mono text-xs">
                <tr>
                    <td colSpan={3} className="px-4 py-3 font-black text-right border-r border-slate-200 uppercase font-sans text-sm">Totals</td>
                    <td className="px-4 py-3 font-black text-right border-r border-slate-200">{totalSales.toFixed(2)}</td>
                    <td className="px-4 py-3 font-black text-right text-red-600 bg-red-50">{totalTax.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
