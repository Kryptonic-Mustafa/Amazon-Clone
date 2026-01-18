"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Printer, FileText, CreditCard, 
  ExternalLink, User, MapPin, Calendar, Mail, Phone, Loader2, X 
} from 'lucide-react';
import toast from 'react-hot-toast';

type OrderItem = {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  image_urls?: string;
};

type Order = {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  status: string;
  created_at: string;
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [invoice, setInvoice] = useState<any>(null); // State for Invoice
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [generating, setGenerating] = useState(false); // Loading for Generate button
  const [showInvoiceModal, setShowInvoiceModal] = useState(false); // Modal visibility

  useEffect(() => {
    if(id) {
        fetchOrderDetails();
        checkInvoiceStatus();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOrder(data.order); // Adjust based on your API response structure (data.order or just data)
      setItems(data.items || []);
    } catch (error) {
      console.error(error);
      toast.error("Error loading order");
    } finally {
      setLoading(false);
    }
  };

  // Check if invoice already exists
  const checkInvoiceStatus = async () => {
    try {
        const res = await fetch(`/api/admin/invoices/${id}`);
        if(res.ok) {
            const data = await res.json();
            setInvoice(data); // Will be null if 404/not found
        }
    } catch (e) {
        console.error("Invoice check failed", e);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        toast.success("Status updated");
        setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  // --- NEW: Generate Invoice Logic ---
  const handleGenerateInvoice = async () => {
    if (!order) return;
    setGenerating(true);
    try {
        const res = await fetch('/api/admin/invoices/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: order.id,
                customerName: order.customer_name,
                address: order.shipping_address,
                amount: order.total_amount
            })
        });
        
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        toast.success("Invoice Generated Successfully!");
        checkInvoiceStatus(); // Refresh to get the new invoice data
        setShowInvoiceModal(true); // Open the slip

    } catch (e: any) {
        toast.error(e.message || "Failed to generate");
    } finally {
        setGenerating(false);
    }
  };

  const printInvoice = () => {
    const printContent = document.getElementById('printable-invoice');
    if (printContent) {
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload(); 
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-500">Loading Order Details...</div>;
  if (!order) return <div className="p-20 text-center text-red-500">Order not found</div>;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push('/admin/orders')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={16} /> Back to Orders
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Order #{order.id}</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
          order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
          order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT SIDE: Order Details (Invoice View) - Spans 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Header Section */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-blue-600 mb-1">e-Commerce Store</h2>
                <p className="text-sm text-slate-500">Order Slip #{order.id}</p>
              </div>
              <div className="text-right text-sm text-slate-600 space-y-1">
                <div className="flex items-center justify-end gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <span>Placed: <span className="font-medium text-slate-900">{new Date(order.created_at).toLocaleDateString()}</span></span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <MapPin size={14} className="text-slate-400" />
                  <span>Shipping: Standard Delivery</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="p-6">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 font-semibold w-16">#</th>
                    <th className="pb-3 font-semibold">Item Details</th>
                    <th className="pb-3 font-semibold text-right">Price</th>
                    <th className="pb-3 font-semibold text-center">Qty</th>
                    <th className="pb-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={item.id} className="group">
                      <td className="py-4 text-slate-400">{index + 1}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-slate-100 rounded border border-slate-200 overflow-hidden flex-shrink-0">
                            {item.image_urls ? (
                              <img src={item.image_urls.split(',')[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">IMG</div>
                            )}
                          </div>
                          <span className="font-medium text-slate-900">{item.product_name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-right text-slate-600">${Number(item.price).toFixed(2)}</td>
                      <td className="py-4 text-center text-slate-600">{item.quantity}</td>
                      <td className="py-4 text-right font-semibold text-slate-900">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Section: Address & Totals */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Invoice To */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Invoice To</h3>
                <div className="space-y-1 text-sm text-slate-700">
                  <p className="font-bold text-slate-900 flex items-center gap-2">
                    <User size={14} className="text-blue-500" /> {order.customer_name}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" /> {order.customer_email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" /> {order.customer_phone}
                  </p>
                  <p className="flex items-start gap-2 mt-2">
                    <MapPin size={14} className="text-slate-400 mt-1 flex-shrink-0" /> 
                    <span className="leading-tight">{order.shipping_address}</span>
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>${Number(order.total_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (0%)</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t border-slate-200 my-2 pt-2 flex justify-between font-bold text-slate-900 text-lg">
                    <span>Total Amount</span>
                    <span>${Number(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Actions Panel - Spans 1 column */}
        <div className="space-y-4">
          
          {/* Action Card */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
            
            
            {/* --- INVOICE BUTTON LOGIC --- */}
            {invoice ? (
                <button 
                    onClick={() => setShowInvoiceModal(true)}
                    className="w-full py-2.5 px-4 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium flex items-center justify-center gap-2 shadow-sm"
                >
                    <FileText size={18} /> View Invoice #{invoice.invoice_number}
                </button>
            ) : (
                <button 
                    onClick={handleGenerateInvoice}
                    disabled={generating}
                    className="w-full py-2.5 px-4 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                    {generating ? <Loader2 className="animate-spin" size={18}/> : <FileText size={18} />} 
                    Generate Invoice
                </button>
            )}
            
            <button 
                onClick={() => router.push('/admin/accounts/ledger')}
                className="w-full py-2.5 px-4 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2 shadow-sm"
            >
              <ExternalLink size={18} /> View Ledger
            </button>
          </div>

          {/* Status Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-3">Update Status</h3>
            <div className="relative">
              <select 
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Changing status will update the order tracking for the customer immediately.
            </p>
          </div>
        </div>

      </div>

      {/* --- INVOICE MODAL (Hidden until clicked) --- */}
      {showInvoiceModal && invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
                {/* Modal Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">Invoice Preview</h3>
                    <div className="flex gap-2">
                        <button onClick={printInvoice} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm">
                            <Printer size={16}/> Print Slip
                        </button>
                        <button onClick={() => setShowInvoiceModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full hover:text-slate-600">
                            <X size={20}/>
                        </button>
                    </div>
                </div>

                {/* Printable Content */}
                <div id="printable-invoice" className="overflow-y-auto p-10 bg-white text-slate-900">
                    <div className="border-2 border-slate-800 p-8 min-h-[600px] flex flex-col justify-between">
                        <div>
                            {/* Invoice Header */}
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">INVOICE</h1>
                                    <p className="text-slate-500 mt-2 font-mono font-bold tracking-widest">{invoice.invoice_number}</p>
                                </div>
                                <div className="text-right">
                                    <h2 className="font-bold text-xl text-slate-900">E-COMMERCE STORE</h2>
                                    <p className="text-sm text-slate-500">123 Tech Park</p>
                                    <p className="text-sm text-slate-500">Silicon Valley, CA</p>
                                </div>
                            </div>

                            {/* Addresses */}
                            <div className="flex justify-between mb-12">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Billed To</h4>
                                    <p className="font-bold text-lg text-slate-900">{invoice.customer_name}</p>
                                    <p className="text-slate-600 max-w-xs text-sm">{invoice.customer_address}</p>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Date Issued</h4>
                                    <p className="font-bold text-lg text-slate-900">{new Date(invoice.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Line Items */}
                            <table className="w-full mb-12 border-collapse">
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