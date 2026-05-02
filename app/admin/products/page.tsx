"use client";

import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/apiClient';
import { Plus, Edit, Trash2, X, Check, ChevronDown, Link as LinkIcon, Upload, Tag, ListTree, Award } from 'lucide-react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { useAdminLocale } from '@/context/AdminLocaleContext';
import AdminLoader from '@/components/admin/AdminLoader';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { t, formatCurrency, formatNumber, isRTL } = useAdminLocale();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [brandInput, setBrandInput] = useState('');
  const [editingBrandId, setEditingBrandId] = useState<number | null>(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catInput, setCatInput] = useState('');
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', brand: '', price: '', discount_percent: '' as string | number,
    sale_flag: 0, stock_qty: '' as string | number, image_urls: '', description: ''
  });

  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [imageTab, setImageTab] = useState<'url' | 'upload'>('url');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [specs, setSpecs] = useState<{key: string, value: string}[]>([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [prodData, catData, brandData] = await Promise.all([apiCall('/api/admin/products'), apiCall('/api/admin/categories'), apiCall('/api/admin/brands')]);
    if (prodData) setProducts(prodData);
    if (catData) setCategories(catData);
    if (brandData) setBrands(brandData);
    setLoading(false);
  };

  // RESTORED LOGIC
  const handleSaveBrand = async () => {
    if (!brandInput.trim()) return;
    const url = editingBrandId ? `/api/admin/brands?id=${editingBrandId}` : '/api/admin/brands';
    const method = editingBrandId ? 'PUT' : 'POST';
    const res = await apiCall(url, { method, body: { name: brandInput } });
    if (res) { setBrandInput(''); setEditingBrandId(null); fetchData(); toast.success(editingBrandId ? 'Updated' : 'Added'); }
  };

  const handleSaveCategory = async () => {
    if (!catInput.trim()) return;
    const url = editingCatId ? `/api/admin/categories?id=${editingCatId}` : '/api/admin/categories';
    const method = editingCatId ? 'PUT' : 'POST';
    const res = await apiCall(url, { method, body: { name: catInput } });
    if (res) { setCatInput(''); setEditingCatId(null); fetchData(); toast.success(editingCatId ? 'Updated' : 'Added'); }
  };

  const openProductModal = (product: any = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name || '', brand: product.brand || '', price: product.price || '',
        discount_percent: product.discount_percent?.toString() || '',
        sale_flag: product.sale_flag || 0, stock_qty: product.stock_qty?.toString() || '',
        image_urls: product.image_urls || '', description: product.description || ''
      });
      setSelectedCats(product.category_ids ? String(product.category_ids).split(',').map((id: any) => id.trim()) : []);
      if (product.specifications && Object.keys(product.specifications).length > 0) {
        setSpecs(Object.entries(product.specifications).map(([k, v]) => ({ key: k, value: String(v) })));
      } else { setSpecs([]); }
    } else {
      setEditingId(null);
      setFormData({ name: '', brand: '', price: '', discount_percent: '', sale_flag: 0, stock_qty: '', image_urls: '', description: '' });
      setSelectedCats([]); setSpecs([]);
    }
    setImageTab('url'); setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingImage(true);
    const data = new FormData(); data.append('file', e.target.files[0]);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const currentUrls = formData.image_urls ? formData.image_urls.split(',').map(u=>u.trim()).filter(Boolean) : [];
      currentUrls.push(json.url);
      setFormData({ ...formData, image_urls: currentUrls.join(', ') });
      toast.success('Image uploaded!');
    } catch (err: any) { toast.error('Upload failed: ' + err.message); } 
    finally { setUploadingImage(false); }
  };

  const handleSpecChange = (index: number, field: 'key'|'value', val: string) => {
    const newSpecs = [...specs]; newSpecs[index][field] = val; setSpecs(newSpecs);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const specsObj: Record<string, string> = {};
    specs.forEach(s => { if (s.key.trim() !== '') specsObj[s.key.trim()] = s.value.trim(); });
    const payload = { 
        ...formData, 
        discount_percent: Number(formData.discount_percent) || 0,
        stock_qty: Number(formData.stock_qty) || 0,
        category_ids: selectedCats.join(','), 
        specifications: specsObj 
    };
    const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
    const res = await apiCall(url, { method: editingId ? 'PUT' : 'POST', body: payload, showSuccessToast: true, successMessage: 'Saved!' });
    if (res) { setIsModalOpen(false); fetchData(); }
  };

  const handleDeleteProduct = async (id: number) => {
    const result = await Swal.fire({ title: 'Are you sure?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      await apiCall(`/api/admin/products/${id}`, { method: 'DELETE', showSuccessToast: true, successMessage: 'Deleted!' });
      fetchData();
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-black tracking-tight">{t('Products Management')}</h1>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setIsBrandModalOpen(true)} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"><Award size={18}/> {t('Manage Brands')}</button>
          <button onClick={() => setIsCatModalOpen(true)} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"><ListTree size={18}/> {t('Manage Categories')}</button>
          <button onClick={() => openProductModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"><Plus size={20} /> {t('Add Product')}</button>
        </div>
      </div>

      {loading ? <AdminLoader text="Loading Products..." /> : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className={`px-6 py-4 font-bold uppercase tracking-widest text-xs ${isRTL ? 'text-right' : 'text-left'}`}>{t('Product')}</th>
                <th className={`px-6 py-4 font-bold uppercase tracking-widest text-xs ${isRTL ? 'text-right' : 'text-left'}`}>{t('Price')}</th>
                <th className={`px-6 py-4 font-bold uppercase tracking-widest text-xs ${isRTL ? 'text-right' : 'text-left'}`}>{t('Stock')}</th>
                <th className={`px-6 py-4 font-bold uppercase tracking-widest text-xs ${isRTL ? 'text-left' : 'text-right'}`}>{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <img src={p.image_urls ? p.image_urls.split(',')[0] : '/placeholder.png'} className="w-12 h-12 object-contain bg-white border border-slate-200 rounded-lg p-1" />
                    <div><div className="font-bold text-sm text-slate-900 line-clamp-1 max-w-[250px]">{p.name}</div><div className="text-xs text-blue-600 font-semibold">{p.brand || '-'}</div></div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(p.price)}</td>
                  <td className="px-6 py-4 font-medium">{formatNumber(p.stock_qty)}</td>
                  
                  <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                    <button onClick={() => openProductModal(p)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg mx-1 transition-colors"><Edit size={18}/></button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* RESTORED MODALS */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center"><h2 className="text-lg font-bold">Manage Brands</h2><button onClick={() => {setIsBrandModalOpen(false); setEditingBrandId(null); setBrandInput('');}} className="text-slate-400 hover:text-white"><X size={20}/></button></div>
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex gap-2">
              <input value={brandInput} onChange={e=>setBrandInput(e.target.value)} placeholder="Brand Name" className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
              {editingBrandId ? (
                <><button onClick={handleSaveBrand} className="bg-blue-600 text-white px-5 rounded-xl font-bold shadow-sm">Update</button><button onClick={() => {setEditingBrandId(null); setBrandInput('');}} className="bg-slate-200 text-slate-700 px-5 rounded-xl font-bold">Cancel</button></>
              ) : (<button onClick={handleSaveBrand} className="bg-slate-900 text-white px-6 rounded-xl font-bold shadow-sm">Add</button>)}
            </div>
            <div className="max-h-80 overflow-y-auto custom-scrollbar bg-white">
              <table className="w-full text-left"><tbody className="divide-y divide-slate-100">{brands.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-800">{b.name}</td>
                  <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}><button onClick={() => {setEditingBrandId(b.id); setBrandInput(b.name);}} className="p-2 text-slate-400 opacity-40 group-hover:opacity-100 group-hover:text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"><Edit size={16}/></button></td>
                </tr>
              ))}</tbody></table>
            </div>
          </div>
        </div>
      )}

      {isCatModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center"><h2 className="text-lg font-bold">Manage Categories</h2><button onClick={() => {setIsCatModalOpen(false); setEditingCatId(null); setCatInput('');}} className="text-slate-400 hover:text-white"><X size={20}/></button></div>
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex gap-2">
              <input value={catInput} onChange={e=>setCatInput(e.target.value)} placeholder="Category Name" className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
              {editingCatId ? (
                <><button onClick={handleSaveCategory} className="bg-blue-600 text-white px-5 rounded-xl font-bold shadow-sm">Update</button><button onClick={() => {setEditingCatId(null); setCatInput('');}} className="bg-slate-200 text-slate-700 px-5 rounded-xl font-bold">Cancel</button></>
              ) : (<button onClick={handleSaveCategory} className="bg-slate-900 text-white px-6 rounded-xl font-bold shadow-sm">Add</button>)}
            </div>
            <div className="max-h-80 overflow-y-auto custom-scrollbar bg-white">
              <table className="w-full text-left"><tbody className="divide-y divide-slate-100">{categories.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-800">{c.name}</td>
                  <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}><button onClick={() => {setEditingCatId(c.id); setCatInput(c.name);}} className="p-2 text-slate-400 opacity-40 group-hover:opacity-100 group-hover:text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"><Edit size={16}/></button></td>
                </tr>
              ))}</tbody></table>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
            <div className="bg-slate-900 text-white px-8 py-5 flex justify-between items-center"><h2 className="text-2xl font-bold">{editingId ? 'Edit Product' : 'Create New Product'}</h2><button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24}/></button></div>
            <form onSubmit={handleProductSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4 text-slate-900">
                  <h3 className="font-black text-blue-600 border-b pb-2 uppercase text-xs tracking-widest">Basic Details</h3>
                  <div><label className="block text-sm font-bold mb-1">Product Name</label><input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-bold mb-1">Brand</label><select value={formData.brand} onChange={e=>setFormData({...formData, brand: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white"><option value="">Select Brand...</option>{brands.map((b: any) => <option key={b.id} value={b.name}>{b.name}</option>)}</select></div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Categories</label>
                      <div className="relative w-full group">
                         <div onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none bg-white cursor-pointer flex justify-between items-center text-sm font-medium"><span>{selectedCats.length} Selected</span> <ChevronDown size={16} className="text-slate-400"/></div>
                         {isCatDropdownOpen && (
                           <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 shadow-xl rounded-xl z-50 max-h-48 overflow-y-auto p-2">
                              {categories.map((c: any) => (
                                 <label key={c.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 cursor-pointer rounded-lg transition-colors"><input type="checkbox" checked={selectedCats.includes(String(c.id))} onChange={(e) => { if(e.target.checked) setSelectedCats([...selectedCats, String(c.id)]); else setSelectedCats(selectedCats.filter((id: any) => id !== String(c.id))); }} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"/> <span className="text-sm font-medium">{c.name}</span></label>
                              ))}
                           </div>
                         )}
                      </div>
                      {selectedCats.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                           {selectedCats.map((id: any) => { const cat = categories.find((c: any) => String(c.id) === id); if (!cat) return null; return (<span key={id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">{cat.name} <X size={12} className="cursor-pointer hover:text-red-500" onClick={()=>setSelectedCats(selectedCats.filter(cid=>cid!==id))}/></span>); })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div><label className="block text-sm font-bold mb-1 flex justify-between">Description <span className="text-xs text-slate-400 font-normal">Summernote Supported</span></label><textarea id="summernote" rows={4} value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                </div>

                <div className="space-y-4 text-slate-900">
                  <h3 className="font-black text-blue-600 border-b pb-2 uppercase text-xs tracking-widest">Pricing & Inventory</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-bold mb-1">Current Price ($)</label><input required type="number" step="0.01" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-bold mb-1">Discount %</label><input type="number" value={formData.discount_percent} onChange={e=>setFormData({...formData, discount_percent: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-bold mb-1">Stock Qty</label><input required type="number" value={formData.stock_qty} onChange={e=>setFormData({...formData, stock_qty: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-bold mb-1">On Sale?</label><select value={formData.sale_flag} onChange={e=>setFormData({...formData, sale_flag: parseInt(e.target.value)})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white"><option value={0}>No - Standard</option><option value={1}>Yes - Active Sale</option></select></div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-6 border-b border-slate-200 mb-4 text-slate-900">
                   <h3 className="font-black text-blue-600 uppercase text-xs tracking-widest whitespace-nowrap">Product Media</h3>
                   <button type="button" onClick={() => setImageTab('url')} className={`pb-2 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${imageTab === 'url' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><LinkIcon size={16}/> URL Link</button>
                   <button type="button" onClick={() => setImageTab('upload')} className={`pb-2 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${imageTab === 'upload' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><Upload size={16}/> Upload Image</button>
                </div>
                {imageTab === 'url' ? (
                  <div><textarea rows={2} placeholder="https://image1.jpg, https://image2.jpg" value={formData.image_urls} onChange={e=>setFormData({...formData, image_urls: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" /><p className="text-xs text-slate-500 mt-2">Separate multiple image URLs with commas.</p></div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center"><input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" id="file-upload" /><label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3"><div className="bg-blue-100 text-blue-600 p-3 rounded-full"><Upload size={24}/></div><span className="font-bold text-slate-700">{uploadingImage ? 'Uploading...' : 'Click to browse files'}</span><span className="text-xs text-slate-500">Files will be uploaded and URLs automatically appended.</span></label></div>
                )}
              </div>

              <div className="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-4"><h3 className="font-black text-blue-600 uppercase text-xs tracking-widest flex items-center gap-2"><Tag size={16}/> Specifications (JSON)</h3><button type="button" onClick={() => setSpecs([...specs, {key: '', value: ''}])} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-700 shadow-sm transition-all">+ Add Row</button></div>
                {specs.length === 0 && <p className="text-sm text-slate-500 italic">No specifications added yet.</p>}
                {specs.map((spec, i) => (
                  <div key={i} className="flex gap-4 mb-3 text-slate-900">
                    <input placeholder="e.g. Dimensions" value={spec.key} onChange={e => handleSpecChange(i, 'key', e.target.value)} className="w-1/3 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold" />
                    <input placeholder="e.g. 10x15x5 inches" value={spec.value} onChange={e => handleSpecChange(i, 'value', e.target.value)} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    <button type="button" onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))} className="text-red-500 hover:bg-red-50 px-3 rounded-lg transition-colors border border-transparent hover:border-red-100"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4 border-t border-slate-100 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg flex items-center gap-2 active:scale-95"><Check size={18} /> Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
