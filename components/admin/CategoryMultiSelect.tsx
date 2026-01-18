"use client";
import { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

type Category = { id: number; name: string };

interface Props {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export default function CategoryMultiSelect({ selectedIds, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setCategories(data);
      });

    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCategory = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(cid => cid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const filteredCats = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-sm font-semibold text-slate-700 mb-2 block">Categories</label>
      
      {/* 1. BADGES SECTION (Top) */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.filter(c => selectedIds.includes(c.id)).map(c => (
            <span 
              key={c.id} 
              className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-blue-200"
            >
              {c.name}
              <button 
                type="button" 
                onClick={() => toggleCategory(c.id)} 
                className="hover:text-blue-900 rounded-full p-0.5 hover:bg-blue-200 transition-colors"
              >
                <X size={12}/>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 2. TRIGGER BUTTON */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-slate-300 rounded-xl text-left bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all flex justify-between items-center"
      >
        <span className={selectedIds.length === 0 ? "text-slate-400" : "text-slate-700"}>
          {selectedIds.length === 0 ? "Select Categories..." : "Add more..."}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 3. DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border-none rounded-lg focus:ring-0 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          
          <div className="max-h-56 overflow-y-auto p-1 custom-scrollbar">
            {filteredCats.length === 0 ? (
              <p className="text-xs text-slate-400 p-3 text-center">No categories found.</p>
            ) : (
              filteredCats.map(cat => {
                const isSelected = selectedIds.includes(cat.id);
                return (
                  <div 
                    key={cat.id} 
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors mb-0.5 ${
                      isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check size={10} className="text-white" />}
                    </div>
                    {cat.name}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}