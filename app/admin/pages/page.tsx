"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Save, LayoutTemplate, Loader2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

// --- TYPE DEFINITIONS ---
type HeroContent = { title: string; subtitle: string; buttonText: string; buttonLink: string; backgroundImageUrl: string; };
type AboutContent = { smallTitle: string; mainTitle: string; description: string; imageUrl: string; points: string[]; };
type ContactContent = { title: string; description: string; address: string; phone: string; email: string; };
type ReviewItem = { name: string; role: string; text: string; };
type TestimonialsContent = { title: string; reviews: ReviewItem[]; };
type SimpleHeaderContent = { title: string; description: string; };
type SimpleInfoContent = { title: string; content: string; };

// Union type
type AnyContentState = HeroContent | AboutContent | ContactContent | TestimonialsContent | SimpleHeaderContent | SimpleInfoContent | null;

type BlockMeta = { section_name: string; last_updated: string; };

export default function PageManager() {
  const [blocksMeta, setBlocksMeta] = useState<BlockMeta[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AnyContentState>(null);

  // 1. Fetch List
  useEffect(() => {
    fetch('/api/admin/content-blocks')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            setBlocksMeta(data);
            if (data.length > 0) setSelectedSection(data[0].section_name);
        }
      })
      .finally(() => setLoadingList(false));
  }, []);

  // 2. Fetch Content
  useEffect(() => {
    if (!selectedSection) return;
    if (selectedSection === 'home_page_builder') { setFormData(null); return; }

    setLoadingContent(true);
    fetch(`/api/content/${selectedSection}`)
      .then(res => res.json())
      .then(data => setFormData(data))
      .catch(() => toast.error("Failed to load content"))
      .finally(() => setLoadingContent(false));
  }, [selectedSection]);

  // 3. Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection || !formData) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content-blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_name: selectedSection, content: formData }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Saved successfully!");
      // Refresh list to update timestamp
      const listRes = await fetch('/api/admin/content-blocks');
      const listData = await listRes.json();
      if(Array.isArray(listData)) setBlocksMeta(listData);
    } catch (error) { toast.error("Failed to save."); } 
    finally { setSaving(false); }
  };

  const updateForm = (field: string, value: any) => {
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  // --- EDITOR RENDERERS ---

  const renderHeroEditor = () => {
    const data = formData as HeroContent;
    if (!data) return <div className="text-black text-gray-400">No data found for Hero.</div>;
    return (
      <div className="text-black space-y-4">
        <h3 className="text-black font-bold text-lg mb-4">Edit Hero Section</h3>
        <div><label className="text-black font-bold block mb-2 block text-sm font-semibold">Title</label><input className="w-full border p-2 rounded" value={data.title||''} onChange={e=>updateForm('title',e.target.value)}/></div>
        <div><label className="text-black font-bold block mb-2 block text-sm font-semibold">Subtitle</label><textarea className="w-full border p-2 rounded" rows={2} value={data.subtitle||''} onChange={e=>updateForm('subtitle',e.target.value)}/></div>
        <div className="text-black grid grid-cols-2 gap-4">
            <div><label className="text-black font-bold block mb-2 block text-sm font-semibold">Btn Text</label><input className="w-full border p-2 rounded" value={data.buttonText||''} onChange={e=>updateForm('buttonText',e.target.value)}/></div>
            <div><label className="text-black font-bold block mb-2 block text-sm font-semibold">Btn Link</label><input className="w-full border p-2 rounded" value={data.buttonLink||''} onChange={e=>updateForm('buttonLink',e.target.value)}/></div>
        </div>
        <div><label className="text-black font-bold block mb-2 block text-sm font-semibold">Background Image URL</label><input className="w-full border p-2 rounded" value={data.backgroundImageUrl||''} onChange={e=>updateForm('backgroundImageUrl',e.target.value)}/></div>
      </div>
    );
  };

  const renderAboutEditor = () => {
    const data = formData as AboutContent;
    if (!data) return <div className="text-black text-gray-400">No data found for About.</div>;
    return (
      <div className="text-black space-y-4">
        <h3 className="text-black font-bold text-lg mb-4">Edit About Section</h3>
        <div><label className="text-black font-bold block mb-2 block text-sm font-semibold">Small Title (Blue)</label><input className="w-full border p-2 rounded" value={data.smallTitle||''} onChange={e=>updateForm('smallTitle',e.target.value)}/></div>
        <div><label className="text-black font-bold block mb-2 block text-sm font-semibold">Main Title</label><input className="w-full border p-2 rounded" value={data.mainTitle||''} onChange={e=>updateForm('mainTitle',e.target.value)}/></div>
        <div><label className="text-black font-bold block mb-2 block text-sm font-semibold">Description</label><textarea className="w-full border p-2 rounded" rows={4} value={data.description||''} onChange={e=>updateForm('description',e.target.value)}/></div>
        <div><label className="text-black font-bold block mb-2 block text-sm font-semibold">Image URL</label><input className="w-full border p-2 rounded" value={data.imageUrl||''} onChange={e=>updateForm('imageUrl',e.target.value)}/></div>
        <div>
            <label className="text-black font-bold block mb-2 block text-sm font-semibold">Points (Comma separated)</label>
            <input className="text-black w-full border p-2 rounded" value={data.points?.join(', ') || ''} onChange={e => updateForm('points', e.target.value.split(',').map(s=>s.trim()))} />
        </div>
      </div>
    );
  };

  const renderContactEditor = () => {
    const data = formData as ContactContent;
    if (!data) return <div className="text-black text-gray-400">No data found for Contact.</div>;
    return (
      <div className="text-black space-y-4">
        <h3 className="text-black font-bold text-lg mb-4">Edit Contact Info</h3>
        <div><label className="text-black font-bold block mb-2 block text-sm font-semibold">Title</label><input className="w-full border p-2 rounded" value={data.title||''} onChange={e=>updateForm('title',e.target.value)}/></div>
        <div><label className="text-black font-bold block mb-2 block text-sm font-semibold">Desc</label><textarea className="w-full border p-2 rounded" rows={2} value={data.description||''} onChange={e=>updateForm('description',e.target.value)}/></div>
        <div className="text-black grid grid-cols-2 gap-4">
            <div><label className="text-black font-bold block mb-2 block text-sm font-semibold">Phone</label><input className="w-full border p-2 rounded" value={data.phone||''} onChange={e=>updateForm('phone',e.target.value)}/></div>
            <div><label className="text-black font-bold block mb-2 block text-sm font-semibold">Email</label><input className="w-full border p-2 rounded" value={data.email||''} onChange={e=>updateForm('email',e.target.value)}/></div>
        </div>
        <div><label className="text-black font-bold block mb-2 block text-sm font-semibold">Address</label><input className="w-full border p-2 rounded" value={data.address||''} onChange={e=>updateForm('address',e.target.value)}/></div>
      </div>
    );
  };

  const renderTestimonialsEditor = () => {
    const data = formData as TestimonialsContent;
    if (!data) return <div className="text-black text-gray-400">No data found for Testimonials.</div>;
    
    const updateReview = (idx: number, f: keyof ReviewItem, v: string) => {
        const newReviews = [...(data.reviews || [])];
        if(!newReviews[idx]) newReviews[idx] = { name:'', role:'', text:'' };
        newReviews[idx] = { ...newReviews[idx], [f]: v };
        updateForm('reviews', newReviews);
    };

    return (
      <div className="text-black space-y-6">
        <h3 className="text-black font-bold text-lg">Edit Testimonials</h3>
        <div><label className="text-black font-bold block mb-2 block text-sm font-semibold">Title</label><input className="w-full border p-2 rounded" value={data.title||''} onChange={e=>updateForm('title',e.target.value)}/></div>
        {[0, 1, 2].map((i: any) => (
            <div key={i} className="text-black p-4 border rounded bg-slate-50 space-y-2">
                <div className="text-black font-bold text-xs text-blue-600">Customer {i+1}</div>
                <div className="text-black grid grid-cols-2 gap-2">
                    <input placeholder="Name" className="text-black border p-2 rounded" value={data.reviews?.[i]?.name||''} onChange={e=>updateReview(i,'name',e.target.value)}/>
                    <input placeholder="Role" className="text-black border p-2 rounded" value={data.reviews?.[i]?.role||''} onChange={e=>updateReview(i,'role',e.target.value)}/>
                </div>
                <textarea placeholder="Review" className="text-black w-full border p-2 rounded" rows={2} value={data.reviews?.[i]?.text||''} onChange={e=>updateReview(i,'text',e.target.value)}/>
            </div>
        ))}
      </div>
    );
  };

  const renderSimpleHeaderEditor = (label: string) => {
      const data = formData as SimpleHeaderContent;
      if (!data) return null;
      return (
        <div className="text-black space-y-4">
            <h3 className="text-black font-bold text-lg mb-4">{label}</h3>
            <div><label className="text-black font-bold block mb-2 block text-sm font-semibold">Title</label><input className="w-full border p-2 rounded" value={data.title||''} onChange={e=>updateForm('title',e.target.value)}/></div>
            <div><label className="text-black font-bold block mb-2 block text-sm font-semibold">Description</label><textarea className="w-full border p-2 rounded" rows={3} value={data.description||''} onChange={e=>updateForm('description',e.target.value)}/></div>
        </div>
      );
  };

  const renderSimpleInfoEditor = (label: string) => {
      const data = formData as SimpleInfoContent;
      if (!data) return null;
      return (
        <div className="text-black space-y-4">
            <h3 className="text-black font-bold text-lg mb-4">{label}</h3>
            <div><label className="text-black font-bold block mb-2 block text-sm font-semibold">Title</label><input className="w-full border p-2 rounded" value={data.title||''} onChange={e=>updateForm('title',e.target.value)}/></div>
            <div><label className="text-black font-bold block mb-2 block text-sm font-semibold">Content</label><textarea className="w-full border p-2 rounded" rows={3} value={data.content||''} onChange={e=>updateForm('content',e.target.value)}/></div>
        </div>
      );
  };

  return (
    <div className="text-black flex h-[calc(100vh-100px)] gap-6">
      {/* Sidebar */}
      <div className="text-black w-1/4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="text-black p-4 border-b bg-slate-50"><h2 className="text-black font-bold flex items-center gap-2"><LayoutTemplate size={18}/> Sections</h2></div>
        <div className="text-black overflow-y-auto flex-1 p-2 space-y-1">
            {loadingList ? <p className="text-black p-4 text-center">Loading...</p> : blocksMeta.map((block: any) => (
                <button key={block.section_name} onClick={() => setSelectedSection(block.section_name)} className={`w-full text-left px-4 py-3 rounded-lg transition-colors capitalize ${selectedSection === block.section_name ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-slate-50 text-slate-700'}`}>
                    {block.section_name.replace(/_/g, ' ')}
                </button>
            ))}
        </div>
      </div>

      {/* Editor */}
      <div className="text-black flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        {selectedSection ? (
            <>
                <div className="text-black p-4 border-b bg-slate-50 flex justify-between items-center">
                    <h2 className="text-black font-bold capitalize">{selectedSection.replace(/_/g, ' ')} Editor</h2>
                    {selectedSection !== 'home_page_builder' && (
                        <button onClick={handleSave} disabled={saving} className="text-black bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                            {saving ? <Loader2 className="text-black animate-spin" size={18}/> : <Save size={18} />} Save
                        </button>
                    )}
                </div>
                
                <div className="text-black p-6 flex-1 overflow-y-auto">
                    {selectedSection === 'home_page_builder' ? (
                        <div className="text-black h-full flex flex-col items-center justify-center text-center space-y-6">
                            <div className="text-black bg-blue-50 p-6 rounded-full"><LayoutTemplate size={48} className="text-black text-blue-600" /></div>
                            <h3 className="text-black text-xl font-bold">Use the Visual Builder</h3>
                            <Link href="/admin/builder" className="text-black bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg">
                                Launch Visual Editor <ExternalLink size={20} />
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSave}>
                            {/* --- EXPLICIT RENDER LOGIC --- */}
                            {selectedSection === 'home_hero' && renderHeroEditor()}
                            {selectedSection === 'home_about' && renderAboutEditor()}
                            {selectedSection === 'home_contact' && renderContactEditor()}
                            {selectedSection === 'home_testimonials' && renderTestimonialsEditor()}
                            {selectedSection === 'shop_header' && renderSimpleHeaderEditor('Shop Header')}
                            {selectedSection === 'product_details_info' && renderSimpleInfoEditor('Product Info')}
                            
                            {loadingContent && <div className="text-black text-center p-10"><Loader2 className="text-black animate-spin inline"/> Loading...</div>}
                        </form>
                    )}
                </div>
            </>
        ) : (
            <div className="text-black flex-1 flex items-center justify-center text-slate-700">Select a section to edit.</div>
        )}
      </div>
    </div>
  );
}