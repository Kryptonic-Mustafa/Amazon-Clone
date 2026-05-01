"use client";

import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/apiClient';
import { FaSave, FaLanguage, FaHome } from 'react-icons/fa';

export default function AdminCMSPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState<'en' | 'ar'>('en');
  
  // Storing Hero Section Content
  const [heroData, setHeroData] = useState({
    en: { title: '', subtitle: '', buttonText: 'Shop Now' },
    ar: { title: '', subtitle: '', buttonText: 'تسوق الآن' }
  });

  useEffect(() => {
    const fetchAllContent = async () => {
      const data = await apiCall('/api/admin/content');
      if (data && Array.isArray(data)) {
        const hero = data.find((d: any) => d.section_key === 'home_hero');
        if (hero) {
          setHeroData({
            en: hero.content_en || heroData.en,
            ar: hero.content_ar || heroData.ar
          });
        }
      }
      setLoading(false);
    };
    fetchAllContent();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    await apiCall('/api/admin/content', {
      method: 'PUT',
      body: { 
        section_key: 'home_hero', 
        content_en: heroData.en, 
        content_ar: heroData.ar 
      },
      showSuccessToast: true,
      successMessage: 'Home Page content updated!'
    });
    
    setSaving(false);
  };

  if (loading) return <div className="text-black min-h-screen flex items-center justify-center"><div className="text-black animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="text-black min-h-screen bg-white text-slate-900 p-8">
      <div className="text-black max-w-4xl mx-auto bg-white text-slate-900 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="text-black bg-slate-900 px-8 py-6 text-white flex items-center justify-between">
          <div className="text-black flex items-center gap-3">
            <FaHome className="text-black text-yellow-400 text-2xl" />
            <h1 className="text-white text-2xl font-bold">Home Page CMS</h1>
          </div>
          
          {/* Language Toggle for Editor */}
          <div className="text-black flex bg-slate-800 rounded-lg p-1">
            <button 
              type="button"
              onClick={() => setActiveLang('en')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeLang === 'en' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              English
            </button>
            <button 
              type="button"
              onClick={() => setActiveLang('ar')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeLang === 'ar' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              العربية (Arabic)
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="text-black p-8 space-y-6">
          <div className="text-black bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6 text-sm text-blue-800 flex items-start gap-3">
             <FaLanguage className="text-black text-xl mt-0.5" />
             <p>You are currently editing the <strong>{activeLang === 'en' ? 'English' : 'Arabic'}</strong> version of the Home Page. Switch tabs above to translate.</p>
          </div>

          <div>
            <label className="text-black font-bold block mb-2 block text-sm font-semibold text-slate-900 font-semibold mb-2">Main Hero Title</label>
            <input 
              dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
              type="text" 
              value={heroData[activeLang].title}
              onChange={(e) => setHeroData({...heroData, [activeLang]: {...heroData[activeLang], title: e.target.value}})}
              className="text-black w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-lg"
              placeholder={activeLang === 'en' ? "e.g. Welcome to AmazonClone" : "مرحبًا بك في أمازون كلون"}
              required
            />
          </div>

          <div>
            <label className="text-black font-bold block mb-2 block text-sm font-semibold text-slate-900 font-semibold mb-2">Hero Subtitle</label>
            <textarea 
              dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
              rows={3}
              value={heroData[activeLang].subtitle}
              onChange={(e) => setHeroData({...heroData, [activeLang]: {...heroData[activeLang], subtitle: e.target.value}})}
              className="text-black w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={activeLang === 'en' ? "Discover premium products..." : "اكتشف منتجاتنا المميزة..."}
            />
          </div>

          <div>
            <label className="text-black font-bold block mb-2 block text-sm font-semibold text-slate-900 font-semibold mb-2">Button Text</label>
            <input 
              dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
              type="text" 
              value={heroData[activeLang].buttonText}
              onChange={(e) => setHeroData({...heroData, [activeLang]: {...heroData[activeLang], buttonText: e.target.value}})}
              className="text-black w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <hr className="text-black border-gray-100 my-8" />

          <div className="text-black flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white transition-all shadow-md ${saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'}`}
            >
              <FaSave />
              {saving ? 'Saving...' : 'Save Translations'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
