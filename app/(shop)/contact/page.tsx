"use client";
import React from 'react';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import Header from '@/components/shop/Header';
import Footer from '@/components/shop/Footer';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message Sent! We will get back to you shortly.");
  };

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Page Header */}
      <div className="bg-slate-900 py-20 px-6 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 uppercase tracking-tighter">Contact Our Team</h1>
        <p className="text-slate-400 max-w-xl mx-auto text-lg font-medium">We're available 24/7 to assist you with your orders and inquiries.</p>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-20">
          
          {/* Info Side */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-black text-black mb-8 border-b-4 border-yellow-400 inline-block">Contact Info</h2>
              <div className="space-y-8">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 shadow-sm"><Phone size={28}/></div>
                  <div><p className="font-black text-lg">Call Us</p><p className="text-slate-600 font-bold">+965 1234 5678</p></div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-green-50 rounded-2xl text-green-600 shadow-sm"><Mail size={28}/></div>
                  <div><p className="font-black text-lg">Email Us</p><p className="text-slate-600 font-bold">support@amazonclone.com</p></div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-red-50 rounded-2xl text-red-600 shadow-sm"><MapPin size={28}/></div>
                  <div><p className="font-black text-lg">Visit Us</p><p className="text-slate-600 font-bold">Kuwait City, Al-Tijaria Tower, Floor 15</p></div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="rounded-3xl overflow-hidden h-[350px] shadow-2xl border-4 border-slate-50">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d111246.33615467657!2d47.8916323429381!3d29.310151125211516!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3fcf9c83ce455983%3A0xc314841a43945a07!2sKuwait%20City!5e0!3m2!1sen!2skw!4v1714131556000!5m2!1sen!2skw" 
                width="100%" height="100%" style={{border:0}} allowFullScreen loading="lazy"
              ></iframe>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-slate-50 p-10 rounded-[40px] shadow-sm border border-slate-100">
            <h2 className="text-3xl font-black text-black mb-8">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-bold text-black text-xs uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" required className="w-full p-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 bg-white transition-all font-medium" placeholder="Name" />
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-black text-xs uppercase tracking-widest ml-1">Email Address</label>
                  <input type="email" required className="w-full p-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 bg-white transition-all font-medium" placeholder="Email" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-bold text-black text-xs uppercase tracking-widest ml-1">Subject</label>
                <input type="text" required className="w-full p-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 bg-white transition-all font-medium" placeholder="Subject" />
              </div>
              <div className="space-y-2">
                <label className="font-bold text-black text-xs uppercase tracking-widest ml-1">Your Message</label>
                <textarea rows={6} required className="w-full p-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 bg-white transition-all font-medium" placeholder="How can we help?"></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 text-lg uppercase tracking-widest">
                <Send size={22} /> Send Message
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
