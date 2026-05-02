"use client";

import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  showSuccessToast?: boolean;
  successMessage?: string;
}

export const apiCall = async (url: string, options: ApiOptions = {}) => {
  const { method = 'GET', body, showSuccessToast = false, successMessage = 'Success!' } = options;

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    if (showSuccessToast) {
      toast.success(successMessage, {
        duration: 3000,
        style: {
          background: '#0f172a',
          color: '#fff',
          fontWeight: 700,
          borderRadius: '12px',
          padding: '14px 20px',
          fontSize: '14px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        },
        iconTheme: { primary: '#22c55e', secondary: '#fff' },
      });
    }

    return data;
  } catch (error: any) {
    toast.error(error.message || 'Network error occurred', {
      duration: 4000,
      style: {
        background: '#0f172a',
        color: '#fff',
        fontWeight: 700,
        borderRadius: '12px',
        padding: '14px 20px',
        fontSize: '14px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      },
      iconTheme: { primary: '#ef4444', secondary: '#fff' },
    });
    return null;
  }
};

// Keep Swal for confirmation dialogs only
export const confirmAction = async (title: string, text: string) => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Yes, Confirm',
    cancelButtonText: 'Cancel',
    customClass: {
      popup: 'rounded-2xl',
      title: 'text-slate-900 font-bold',
      confirmButton: 'rounded-xl font-bold',
      cancelButton: 'rounded-xl font-bold',
    },
  });
  return result.isConfirmed;
};
