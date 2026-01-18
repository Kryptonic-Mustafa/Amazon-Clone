"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Printer, FileText, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Unwrap params
  useEffect(() => {
    params.then(p => {
        setOrderId(p.id);
        fetchData(p.id);
    });
  }, []);

  const fetchData = async (id: string) => {
    try {
        // 1. Fetch Order Details
        // Note: Ensure this API exists. If not, use your existing order fetch method.
        const orderRes = await fetch(`/api/admin/orders/${id}`); 
        if(orderRes.ok) {
            const orderData = await orderRes.json();
            setOrder(orderData);
        }

        // 2. Check for Existing Invoice
        const invRes = await fetch(`/api/admin/invoices/${id}`);
        if(invRes.ok) {
            const invData = await invRes.json();
            setInvoice(invData); // If null, no invoice exists
        }
    } catch (e) {
        console.error("Error fetching data:", e);
    } finally {
        setLoading(false);
    }
  };

  const generateInvoice = async () => {
    if (!order) return;
    setGenerating(true);
    try {
        const res = await fetch('/api/admin/invoices/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: order.id,
                customerName: order.customer_name || "Valued Customer",
                address: order.shipping_address || "Address not provided",
                amount: order.total_amount
            })
        });
        
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        toast.success("Invoice Created & Ledger Updated!");
        fetchData(order.id); // Refresh to see the new invoice
        setShowInvoiceModal(true); // Open the slip

    } catch (e: any) {
        toast.error(e.message || "Failed to generate invoice");
    } finally {
        setGenerating(false);
    }
  };

  const printInvoice = () => {
    const content = document.getElementById('invoice-slip');
    if (content) {
        const original = document.body.innerHTML;
        document.body.innerHTML = content.innerHTML;
        window.print();
        document.body.innerHTML = original;
        window.location.reload(); // Reload to restore event listeners
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600"/></div>;
  if (!order) return <div className="p-20 text-center text-red-500">Order not found via API. Check your order ID.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/admin/orders" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium">
            <ArrowLeft size={20}/> Back to Orders
        </Link>
        
        {/* ACTION BUTTONS */}
        <div className="flex gap-3">
            {invoice ? (
                <button 
                    onClick={() => setShowInvoiceModal(true)}
                    className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 font-bold shadow-sm transition-all"
                >
                    <Printer size={18}/> View Invoice #{invoice.invoice_number}
                </button>
            ) : (
                <button 
                    onClick={generateInvoice} 
                    disabled={generating}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-bold shadow-sm transition-all disabled:opacity-50"
                >
                    {generating ? <Loader2 className="animate-spin" size={18}/> : <FileText size={18}/>} 
                    Generate Invoice
                </button>
            )}
        </div>
      </div>

      {/* Order Info Card */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Order #{order.id}</h1>
                <p className="text-slate-500 mt-1">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {order.status}
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pt-6 border-t border-slate-100">
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Customer</h3>
                <p className="font-medium text-slate-900">{order.customer_name}</p>
                <p className="text-slate-500 text-sm">{order.customer_email}</p>
            </div>
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Shipping To</h3>
                <p className="font-medium text-slate-900">{order.shipping_address || "N/A"}</p>
            </div>
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Total Amount</h3>
                <p className="text-2xl font-bold text-slate-900">${Number(order.total_amount).toFixed(2)}</p>
            </div>
        </div>
      </div>

      {/* --- INVOICE MODAL (Hidden until clicked) --- */}
      {showInvoiceModal && invoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">Invoice Preview</h3>
                    <div className="flex gap-3">
                        <button onClick={printInvoice} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800">
                            <Printer size={16}/> Print Slip
                        </button>
                        <button onClick={() => setShowInvoiceModal(false)} className="text-slate-500 hover:text-red-600 px-3 font-medium">Close</button>
                    </div>
                </div>
                
                {/* PRINTABLE SLIP CONTENT */}
                <div className="overflow-y-auto p-8 bg-white" id="invoice-slip">
                    <div className="border-2 border-slate-900 p-8">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">INVOICE</h1>
                                <p className="text-slate-500 mt-2 font-mono">{invoice.invoice_number}</p>
                            </div>
                            <div className="text-right">
                                <h2 className="font-bold text-xl text-slate-900">AMAZON CLONE</h2>
                                <p className="text-sm text-slate-500">123 Tech Park, Silicon Valley</p>
                                <p className="text-sm text-slate-500">support@amazonclone.com</p>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div className="flex justify-between mb-12">
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Billed To</h4>
                                <p className="font-bold text-lg text-slate-900">{invoice.customer_name}</p>
                                <p className="text-slate-600 max-w-xs">{invoice.customer_address}</p>
                            </div>
                            <div className="text-right">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Date Issued</h4>
                                <p className="font-bold text-lg text-slate-900">{new Date(invoice.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Line Items */}
                        <table className="w-full mb-12">
                            <thead className="border-b-2 border-slate-900">
                                <tr>
                                    <th className="text-left py-3 font-bold text-slate-900">Description</th>
                                    <th className="text-right py-3 font-bold text-slate-900">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="py-4 border-b border-slate-200">Order #{invoice.order_id} - Full Payment</td>
                                    <td className="py-4 border-b border-slate-200 text-right font-mono">${Number(invoice.total_amount).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span>${(Number(invoice.total_amount) - Number(invoice.tax_amount)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Tax (18%)</span>
                                    <span>${Number(invoice.tax_amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-slate-900 border-t-2 border-slate-900 pt-3">
                                    <span>Total Due</span>
                                    <span>${Number(invoice.total_amount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-16 pt-8 border-t border-slate-200 text-center text-sm text-slate-400">
                            <p>Thank you for your business.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}