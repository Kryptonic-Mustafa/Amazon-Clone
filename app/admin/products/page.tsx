"use client";

import React, { useEffect, useState } from 'react';
import { 
  Plus, Edit, Trash2, Search, Package, X, 
  Image as ImageIcon, Upload, Link as LinkIcon, List, Tag 
} from 'lucide-react';
import toast from 'react-hot-toast';
import CategoryMultiSelect from '@/components/admin/CategoryMultiSelect';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  discount_percent: number;
  sale_flag: number;
  stock_qty: number;
  brand: string;
  image_urls: string;
  category_ids: string | number | null;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- MODALS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false); 
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false); // NEW
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // --- DATA LISTS ---
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allBrands, setAllBrands] = useState<any[]>([]); // NEW
  
  // --- INPUT STATES ---
  const [newCatName, setNewCatName] = useState("");
  const [newBrandName, setNewBrandName] = useState(""); // NEW
  
  // --- FORM STATE ---
  const initialFormState = {
    name: '', description: '', price: '', 
    discount_percent: 0, sale_flag: 0, stock_qty: 0, 
    brand: '', imageUrl: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const [selectedCatIds, setSelectedCatIds] = useState<number[]>([]);
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands(); // Load Brands on mount
  }, []);

  // --- API FETCHERS ---
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (error) { toast.error("Failed to load products"); } 
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/categories');
    const data = await res.json();
    setAllCategories(Array.isArray(data) ? data : []);
  };

  const fetchBrands = async () => {
    const res = await fetch('/api/admin/brands');
    const data = await res.json();
    setAllBrands(Array.isArray(data) ? data : []);
  };

  // --- CATEGORY HANDLERS ---
  const handleAddCategory = async () => {
    if(!newCatName) return;
    try {
      await fetch('/api/admin/categories', { method: 'POST', body: JSON.stringify({ name: newCatName }) });
      setNewCatName(""); toast.success("Category added"); fetchCategories();
    } catch(e) { toast.error("Failed"); }
  };
  const handleDeleteCategory = async (id: number) => {
    if(!confirm("Delete?")) return;
    try {
      await fetch('/api/admin/categories', { method: 'DELETE', body: JSON.stringify({ id }) });
      fetchCategories(); toast.success("Deleted");
    } catch(e) { toast.error("Failed"); }
  };

  // --- BRAND HANDLERS (NEW) ---
  const handleAddBrand = async () => {
    if(!newBrandName) return;
    try {
      await fetch('/api/admin/brands', { method: 'POST', body: JSON.stringify({ name: newBrandName }) });
      setNewBrandName(""); toast.success("Brand added"); fetchBrands();
    } catch(e) { toast.error("Failed to add brand"); }
  };
  const handleDeleteBrand = async (id: number) => {
    if(!confirm("Delete this brand?")) return;
    try {
      await fetch('/api/admin/brands', { method: 'DELETE', body: JSON.stringify({ id }) });
      fetchBrands(); toast.success("Brand deleted");
    } catch(e) { toast.error("Failed"); }
  };

  // --- PRODUCT FORM HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price.toString());
    data.append('description', formData.description);
    data.append('stock_qty', formData.stock_qty.toString());
    data.append('discount_percent', formData.discount_percent.toString());
    data.append('brand', formData.brand); // Sends selected brand name
    data.append('sale_flag', formData.sale_flag.toString());
    
    const catString = selectedCatIds.length > 0 ? selectedCatIds.join(',') : '';
    data.append('category_ids', catString);
    
    if (imageTab === 'upload' && file) {
      data.append('imageFile', file);
    } else {
      data.append('imageUrl', formData.imageUrl);
    }

    try {
      const res = await fetch(url, { method, body: data });
      if (!res.ok) throw new Error('Failed');
      
      fetchProducts();
      closeModal();
      toast.success("Product saved successfully");
    } catch (error) {
      toast.error("Error saving product");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success("Product deleted");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name, description: p.description, 
      price: p.price.toString(), discount_percent: p.discount_percent, 
      sale_flag: p.sale_flag, stock_qty: p.stock_qty, 
      brand: p.brand, imageUrl: p.image_urls
    });
    
    let ids: number[] = [];
    if (p.category_ids) {
      const val = String(p.category_ids);
      if (val.includes(',')) {
        ids = val.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      } else {
        const singleId = parseInt(val);
        if (!isNaN(singleId)) ids = [singleId];
      }
    }
    setSelectedCatIds(ids);
    setImageTab(p.image_urls && p.image_urls.startsWith('http') ? 'url' : 'upload');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData(initialFormState);
    setSelectedCatIds([]);
    setFile(null);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Package className="text-blue-600" /> Products
        </h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setIsCatModalOpen(true)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm text-sm">
            <List size={16} /> Manage Categories
          </button>
          <button onClick={() => setIsBrandModalOpen(true)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm text-sm">
            <Tag size={16} /> Manage Brands
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg text-sm">
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input type="text" placeholder="Search products..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* --- PRODUCT TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600">Product</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Price</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Stock</th>
              <th className="px-6 py-4 text-right font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan={4} className="p-8 text-center text-slate-500">Loading...</td></tr> : filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="h-12 w-12 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0">
                    {p.image_urls ? <img src={p.image_urls} className="h-full w-full object-cover" /> : <ImageIcon className="p-2 text-slate-400 w-full h-full" />}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500 bg-gray-100 px-2 py-0.5 rounded-full w-fit mt-1">{p.brand || 'No Brand'}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-900 font-medium">${Number(p.price).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.stock_qty > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.stock_qty} left
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openEditModal(p)} className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- PRODUCT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto no-scrollbar">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">Product Name</label>
                    <input type="text" required className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  
                  {/* --- BRAND DROPDOWN --- */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">Brand</label>
                    <select 
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    >
                      <option value="">Select a Brand</option>
                      {allBrands.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <CategoryMultiSelect selectedIds={selectedCatIds} onChange={setSelectedCatIds} />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">Price ($)</label>
                    <input type="number" required className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">Discount (%)</label>
                    <input type="number" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.discount_percent} onChange={(e) => setFormData({...formData, discount_percent: parseInt(e.target.value) || 0})} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">Stock Qty</label>
                    <input type="number" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.stock_qty} onChange={(e) => setFormData({...formData, stock_qty: parseInt(e.target.value) || 0})} />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Description</label>
                  <textarea rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>

                {/* Image Logic (Same as before) */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Product Image</label>
                  <div className="flex gap-3 mb-4">
                    <button type="button" onClick={() => setImageTab('upload')} className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${imageTab === 'upload' ? 'bg-white shadow text-blue-600 border border-blue-100' : 'text-slate-500 hover:bg-slate-100'}`}>
                      <Upload size={16} /> Upload File
                    </button>
                    <button type="button" onClick={() => setImageTab('url')} className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${imageTab === 'url' ? 'bg-white shadow text-blue-600 border border-blue-100' : 'text-slate-500 hover:bg-slate-100'}`}>
                      <LinkIcon size={16} /> Image URL
                    </button>
                  </div>
                  {imageTab === 'upload' ? (
                    <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-blue-50 hover:border-blue-300 group cursor-pointer">
                      <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                      <div className="flex flex-col items-center">
                        <Upload className="text-blue-500 mb-2" size={24} />
                        <p className="text-sm text-slate-700">{file ? file.name : "Click to browse"}</p>
                      </div>
                    </div>
                  ) : (
                    <input type="text" placeholder="https://example.com/image.jpg" className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} />
                  )}
                </div>

                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50" onClick={() => setFormData({...formData, sale_flag: formData.sale_flag === 1 ? 0 : 1})}>
                   <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.sale_flag === 1 ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                      {formData.sale_flag === 1 && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                   </div>
                   <label className="text-sm font-medium text-slate-700 cursor-pointer select-none">Mark product as On Sale</label>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3 z-10">
              <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-white">Cancel</button>
              <button type="submit" form="productForm" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-md">Save Product</button>
            </div>
          </div>
        </div>
      )}

      {/* --- CATEGORY MANAGER MODAL --- */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Manage Categories</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="flex gap-2 mb-4">
              <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="New Category Name" className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              <button onClick={handleAddCategory} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
            </div>
            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 custom-scrollbar">
              {allCategories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center px-4 py-3 hover:bg-slate-50">
                  <span className="text-sm text-slate-700">{cat.name}</span>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- BRAND MANAGER MODAL (NEW) --- */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Manage Brands</h3>
              <button onClick={() => setIsBrandModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="flex gap-2 mb-4">
              <input type="text" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} placeholder="New Brand Name" className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              <button onClick={handleAddBrand} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
            </div>
            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 custom-scrollbar">
              {allBrands.length === 0 ? <p className="text-center p-4 text-sm text-gray-400">No brands found</p> : allBrands.map(b => (
                <div key={b.id} className="flex justify-between items-center px-4 py-3 hover:bg-slate-50">
                  <span className="text-sm text-slate-700">{b.name}</span>
                  <button onClick={() => handleDeleteBrand(b.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}