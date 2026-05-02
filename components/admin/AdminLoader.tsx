"use client";

import { Loader2 } from 'lucide-react';

export default function AdminLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute inset-0"></div>
      </div>
      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">{text}</p>
    </div>
  );
}
