"use client";

import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor
} from '@dnd-kit/core';

import { 
  SortableContext, 
  verticalListSortingStrategy, 
  arrayMove, 
  useSortable,
  sortableKeyboardCoordinates 
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical, Save, Type, Image as ImageIcon, Layout, List, MousePointer2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import BlockRenderer, { Block, BlockType } from '@/components/builder/BlockRenderer';

// --- THE "BUBBLE" COMPONENT (Sortable Item) ---
function SortableItem({ block, isSelected, onClick, onDelete }: any) {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({ id: block.id });
  
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition,
    zIndex: isDragging ? 999 : 1, // Bring to front when dragging
    opacity: isDragging ? 0.8 : 1,
    scale: isDragging ? '1.02' : '1', // Slight pop effect
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="text-black relative mb-4 group"
    >
      {/* The Bubble Card */}
      <div 
        onClick={() => onClick(block.id)}
        className={`
          flex items-stretch bg-white rounded-xl overflow-hidden border-2 transition-all shadow-sm
          ${isSelected ? 'border-blue-600 ring-4 ring-blue-50/50' : 'border-slate-200 hover:border-blue-300'}
        `}
      >
        {/* DRAG HANDLE (The "Grip" Zone) */}
        <div 
          {...attributes} 
          {...listeners}
          className="text-black w-10 bg-slate-50 border-r border-slate-100 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors"
        >
          <GripVertical size={20} className="text-black text-slate-400" />
        </div>

        {/* PREVIEW CONTENT ZONE */}
        <div className="text-black flex-1 p-4 cursor-pointer min-h-[100px] flex flex-col justify-center pointer-events-none">
           {/* Block Type Label */}
           <div className="text-black mb-2">
             <span className="text-black text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
               {block.type} Section
             </span>
           </div>
           
           {/* Actual Component Preview (Scaled Down) */}
           <div className="text-black opacity-80 scale-95 origin-left">
              <BlockRenderer block={block} />
           </div>
        </div>

        {/* DELETE BUTTON (Top Right) */}
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(block.id); }} 
          className="text-black absolute top-2 right-2 p-2 bg-white/90 backdrop-blur rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all opacity-0 group-hover:opacity-100 shadow-sm z-10"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default function PageBuilder() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // --- SENSORS ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Move 5px to start drag
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 1. Load Data
  useEffect(() => {
    fetch('/api/content/home_page_builder')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setBlocks(data); });
  }, []);

  // 2. Add New Block
  const addBlock = (type: BlockType) => {
    const newBlock: Block = { id: uuidv4(), type, content: getDefaultContent(type) };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
    
    // Auto-scroll to bottom
    setTimeout(() => {
        const container = document.getElementById('canvas-container');
        if(container) container.scrollTop = container.scrollHeight;
    }, 100);
  };

  const getDefaultContent = (type: BlockType) => {
    switch (type) {
      case 'hero': return { title: "Hero Title", subtitle: "Subtitle here", btnText: "Shop Now", bgImage: "" };
      case 'text': return { html: "<h2 class='text-2xl font-bold'>Rich Text Block</h2><p>Click to edit this content.</p>" };
      case 'image': return { url: "" };
      case 'features': return { items: [{ title: "Feature 1", desc: "Detail" }, { title: "Feature 2", desc: "Detail" }] };
      default: return {};
    }
  };

  // 3. Handle Drag End
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 4. Update Block Content
  const updateBlockContent = (field: string, value: any) => {
    setBlocks(blocks.map(b => b.id === selectedId ? { ...b, content: { ...b.content, [field]: value } } : b));
  };

  // 5. Save
  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/content-blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_name: 'home_page_builder', content: blocks })
      });
      toast.success("Layout Saved!");
    } catch (e) { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const selectedBlock = blocks.find(b => b.id === selectedId);

  return (
    <div className="text-black flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-900">
      
      {/* --- LEFT SIDEBAR: TOOLBOX --- */}
      <div className="text-black w-72 bg-white border-r border-slate-200 flex flex-col shadow-xl z-20">
        <div className="text-black p-5 border-b border-slate-100">
            <h2 className="text-black font-bold text-lg text-slate-800 flex items-center gap-2">
                <Layout className="text-black text-blue-600" /> Toolbox
            </h2>
            <p className="text-black text-xs text-slate-400 mt-1">Click to add sections</p>
        </div>
        
        <div className="text-black p-4 space-y-3 overflow-y-auto flex-1">
          <button onClick={() => addBlock('hero')} className="text-black w-full flex items-center gap-3 p-4 bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md hover:text-blue-600 rounded-xl transition-all group text-left">
            <div className="text-black p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"><Layout size={20} /></div>
            <div><div className="text-black font-semibold text-sm">Hero Banner</div><div className="text-black text-xs text-slate-400">Large top section</div></div>
          </button>

          <button onClick={() => addBlock('text')} className="text-black w-full flex items-center gap-3 p-4 bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md hover:text-blue-600 rounded-xl transition-all group text-left">
            <div className="text-black p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors"><Type size={20} /></div>
            <div><div className="text-black font-semibold text-sm">Text Block</div><div className="text-black text-xs text-slate-400">HTML / Paragraphs</div></div>
          </button>

          <button onClick={() => addBlock('image')} className="text-black w-full flex items-center gap-3 p-4 bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md hover:text-blue-600 rounded-xl transition-all group text-left">
            <div className="text-black p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors"><ImageIcon size={20} /></div>
            <div><div className="text-black font-semibold text-sm">Full Image</div><div className="text-black text-xs text-slate-400">Banner / Photo</div></div>
          </button>

          <button onClick={() => addBlock('features')} className="text-black w-full flex items-center gap-3 p-4 bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md hover:text-blue-600 rounded-xl transition-all group text-left">
            <div className="text-black p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors"><List size={20} /></div>
            <div><div className="text-black font-semibold text-sm">Features Grid</div><div className="text-black text-xs text-slate-400">3 Column List</div></div>
          </button>
        </div>

        <div className="text-black p-4 border-t bg-slate-50">
            <button onClick={handleSave} className="text-black w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 flex justify-center items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95">
                {saving ? 'Saving...' : <><Save size={18}/> Save Page Layout</>}
            </button>
        </div>
      </div>

      {/* --- CENTER: CANVAS ZONE --- */}
      <div id="canvas-container" className="text-black flex-1 overflow-y-auto bg-slate-100/50 p-8 scroll-smooth">
        <div className="text-black max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="text-black mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-black text-2xl font-bold text-slate-800">Page Canvas</h1>
                    <p className="text-black text-sm text-slate-500">Drag items to reorder • Click to edit properties</p>
                </div>
                <div className="text-black bg-white px-3 py-1 rounded-full border text-xs font-medium text-slate-500 shadow-sm">
                    {blocks.length} Sections
                </div>
            </div>

            {/* THE DROP ZONE */}
            <div className="text-black min-h-[600px] border-2 border-dashed border-slate-300 rounded-2xl p-6 transition-colors hover:border-blue-300 bg-slate-50/50">
                {blocks.length === 0 ? (
                    <div className="text-black h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-60">
                        <MousePointer2 size={48} />
                        <p className="text-black font-medium">Canvas is empty</p>
                        <p className="text-black text-sm">Click a tool on the left to start building.</p>
                    </div>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
                            {blocks.map((block) => (
                                <SortableItem 
                                    key={block.id} 
                                    block={block} 
                                    isSelected={block.id === selectedId}
                                    onClick={setSelectedId}
                                    onDelete={(id: string) => {
                                        setBlocks(blocks.filter(b => b.id !== id));
                                        if(selectedId === id) setSelectedId(null);
                                    }}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
      </div>

      {/* --- RIGHT SIDEBAR: PROPERTIES PANEL --- */}
      <div className="text-black w-80 bg-white border-l border-slate-200 flex flex-col shadow-xl z-20">
        <div className="text-black p-5 border-b border-slate-100 bg-white">
            <h2 className="text-black font-bold text-lg text-slate-800">Properties</h2>
        </div>
        
        <div className="text-black p-5 flex-1 overflow-y-auto">
            {selectedBlock ? (
                <div className="text-black space-y-5 animate-in slide-in-from-right-4 duration-300">
                    <div className="text-black flex items-center gap-2 mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-100">
                        <span className="text-black w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        Editing {selectedBlock.type}
                    </div>

                    {/* DYNAMIC FORM FIELDS */}
                    {selectedBlock.type === 'hero' && (
                        <>
                            <div>
                                <label className="text-black font-bold block mb-2 block text-xs font-bold text-slate-500 uppercase mb-1.5">Title</label>
                                <input className="text-black w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" value={selectedBlock.content.title} onChange={e => updateBlockContent('title', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-black font-bold block mb-2 block text-xs font-bold text-slate-500 uppercase mb-1.5">Subtitle</label>
                                <textarea className="text-black w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none" rows={3} value={selectedBlock.content.subtitle} onChange={e => updateBlockContent('subtitle', e.target.value)} />
                            </div>
                            <div className="text-black grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-black font-bold block mb-2 block text-xs font-bold text-slate-500 uppercase mb-1.5">Button Text</label>
                                    <input className="text-black w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={selectedBlock.content.btnText} onChange={e => updateBlockContent('btnText', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-black font-bold block mb-2 block text-xs font-bold text-slate-500 uppercase mb-1.5">Image URL</label>
                                    <input className="text-black w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="https://..." value={selectedBlock.content.bgImage} onChange={e => updateBlockContent('bgImage', e.target.value)} />
                                </div>
                            </div>
                        </>
                    )}

                    {selectedBlock.type === 'text' && (
                        <div>
                            <label className="text-black font-bold block mb-2 block text-xs font-bold text-slate-500 uppercase mb-1.5">HTML Content</label>
                            <textarea className="text-black w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono text-slate-600 h-64" value={selectedBlock.content.html} onChange={e => updateBlockContent('html', e.target.value)} />
                            <p className="text-black text-[10px] text-slate-400 mt-2">Use Tailwind classes for styling (e.g., class="text-red-500")</p>
                        </div>
                    )}

                    {selectedBlock.type === 'image' && (
                        <div>
                            <label className="text-black font-bold block mb-2 block text-xs font-bold text-slate-500 uppercase mb-1.5">Image Source URL</label>
                            <input className="text-black w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={selectedBlock.content.url} onChange={e => updateBlockContent('url', e.target.value)} />
                            {selectedBlock.content.url && (
                                <div className="text-black mt-3 rounded-lg overflow-hidden border border-slate-200">
                                    <img src={selectedBlock.content.url} className="text-black w-full h-32 object-cover" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-black h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <div className="text-black w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <MousePointer2 size={24} className="text-black opacity-50" />
                    </div>
                    <p className="text-black font-medium text-slate-600">No Block Selected</p>
                    <p className="text-black text-sm mt-1">Click on a block in the canvas to edit its details here.</p>
                </div>
            )}
        </div>
      </div>

    </div>
  );
}