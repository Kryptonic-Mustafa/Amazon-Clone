"use client";

import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/apiClient';
import { Star, Trash2, MessageSquare } from 'lucide-react';
import Swal from 'sweetalert2';
import AdminLoader from '@/components/admin/AdminLoader';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const data = await apiCall('/api/admin/reviews');
    if (data) setReviews(data);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Delete this review?',
      text: "This will permanently remove the review and recalculate the product's average rating.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      await apiCall(`/api/admin/reviews?id=${id}`, { method: 'DELETE', showSuccessToast: true, successMessage: 'Review Deleted' });
      fetchReviews();
    }
  };

  if (loading) return <AdminLoader text="Loading Reviews..." />;

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-yellow-400 p-3 rounded-xl shadow-sm text-slate-900"><MessageSquare size={24} /></div>
        <h1 className="text-3xl font-black tracking-tight">Manage Reviews</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Product ID</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Image</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Product Name</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Customer</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Rating</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Comment</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Date</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs w-[100px] text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
            {reviews.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-slate-500">No reviews found.</td></tr>
            ) : reviews.map((r: any) => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-blue-600 font-bold">#{r.product_id}</td>
                <td className="px-6 py-4">
                    <img src={r.product_image || '/placeholder.png'} alt={r.product_name} className="w-12 h-12 object-contain bg-white border border-slate-200 rounded p-1" />
                </td>
                <td className="px-6 py-4">
                    <div className="text-sm font-bold line-clamp-2 max-w-[150px]">{r.product_name || 'Unknown Product'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold">{r.user_name.split(' (Guest')[0]}</div>
                  {r.user_id === 0 && <div className="text-xs text-slate-400">Guest</div>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < r.rating ? "fill-current" : "text-slate-200 fill-slate-200"} />)}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={r.comment}>{r.comment}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleDelete(r.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex justify-center w-full"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
