"use client";
import { useEffect, useState } from 'react';
import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderAccountsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/accounts/orders')
      .then((res) => res.json())
      .then((data) => {
        // FIX: Look for data.orders inside the response object
        if (data.orders && Array.isArray(data.orders)) {
            setOrders(data.orders);
        } else {
            console.error("Unexpected API Response:", data);
            setOrders([]); // Fallback
        }
        
        if (data.error) {
            console.error("Server Error:", data.error);
            setErrorMsg(data.error);
        }
      })
      .catch((err) => {
          console.error("Fetch Error:", err);
          setErrorMsg("Failed to connect to server");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <FileText className="text-blue-600" /> Order Accounts Report
      </h1>

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 border border-red-100">
            <AlertTriangle size={20} />
            <span>Error loading data: {errorMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4 font-semibold text-slate-600">Order ID</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Payment</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-right">Amount</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading orders...</td></tr>
                ) : orders.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No orders found.</td></tr>
                ) : (
                    orders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900">#{order.id}</td>
                            <td className="px-6 py-4 text-slate-500 text-sm">
                                {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold capitalize flex items-center gap-1 w-fit
                                    ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {order.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {order.payment_status === 'paid' ? 
                                    <span className="flex items-center gap-1 text-green-600 font-medium text-sm"><CheckCircle size={14}/> Paid</span> : 
                                    <span className="flex items-center gap-1 text-orange-500 font-medium text-sm"><Clock size={14}/> Pending</span>
                                }
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-slate-800">
                                ${Number(order.total_amount || 0).toFixed(2)}
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