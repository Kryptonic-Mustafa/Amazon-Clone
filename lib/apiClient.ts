"use client";

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
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: successMessage,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }

    return data;
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: error.message || 'Network error occurred',
      confirmButtonColor: '#2563eb'
    });
    return null;
  }
};
