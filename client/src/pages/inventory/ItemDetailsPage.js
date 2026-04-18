import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import BarcodePrintModal from '../../components/BarcodePrintModal';
import ItemModal from '../../components/inventory/ItemModal';

export default function ItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showBarcodePrint, setShowBarcodePrint] = useState(false);

  const loadItem = async () => {
    try {
      const res = await api.get(`/inventory/items/${id}`);
      setItem(res.data);
    } catch (err) {
      setError('Failed to load item details.');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get('/inventory/categories');
      setCategories(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    loadItem();
    loadCategories();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/inventory/items/${id}`);
      toast.success('Item deleted');
      navigate('/inventory/items');
    } catch (err) {
      toast.error('Error deleting item');
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-white/50 font-bold uppercase tracking-widest animate-pulse">Loading Pearl Assets...</div>;
  if (error || !item) return <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-red-400 font-bold uppercase tracking-widest"><span>⚠️ {error || 'Item not found'}</span><button onClick={() => navigate('/inventory/items')} className="text-slate-800 dark:text-white text-xs underline">Back to Catalog</button></div>;

  const isLowStock = item.quantity <= item.lowStockThreshold;

  return (
    <div className="space-y-8 pb-20 fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <button 
            onClick={() => navigate('/inventory/items')} 
            className="flex items-center gap-2 text-slate-500 dark:text-white/40 hover:text-slate-800 dark:text-white transition-colors text-[10px] font-bold uppercase tracking-[0.2em] mb-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Catalog
          </button>
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{item.name}</h2>
            {isLowStock && (
              <span className="px-3 py-1 rounded-full bg-red-500 text-slate-800 dark:text-white text-[10px] font-bold uppercase tracking-widest shadow-lg animate-pulse">Low Stock</span>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3">
          <button onClick={() => setShowEdit(true)} className="px-6 py-3 rounded-2xl bg-white/60 dark:bg-white/5 text-slate-800 dark:text-white font-bold uppercase tracking-widest hover:bg-white hover:text-slate-900 active:scale-95 transition-all text-xs border border-slate-200 dark:border-white/10 shadow-lg">
            ✏️ Edit Details
          </button>
          <button onClick={() => setShowBarcodePrint(true)} className="px-6 py-3 rounded-2xl bg-white/60 dark:bg-white/5 text-slate-800 dark:text-white font-bold uppercase tracking-widest hover:bg-white hover:text-slate-900 active:scale-95 transition-all text-xs border border-slate-200 dark:border-white/10 shadow-lg">
            🔲 Print Barcode
          </button>
          <button onClick={handleDelete} className="px-6 py-3 rounded-2xl bg-red-500/10 text-red-400 font-bold uppercase tracking-widest hover:bg-red-500 hover:text-slate-800 dark:text-white active:scale-95 transition-all text-xs border border-red-500/20 shadow-lg">
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Media & Visuals (4 columns) */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
          <div className="glass-liquid rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl group p-6">
            <div className="relative aspect-square rounded-[2rem] bg-[#0c0818] overflow-hidden border border-white/5 flex items-center justify-center p-4">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-white/5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
          </div>

          {/* Identification Section */}
          <div className="glass-liquid rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10 space-y-6">
            <h3 className="text-slate-500 dark:text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">Identification</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-white/20 uppercase tracking-widest">SKU / Barcode</span>
                <span className="block font-mono text-lg text-slate-800 dark:text-white font-black">{item.sku}</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-white/20 uppercase tracking-widest">Model</span>
                <span className="block text-lg text-slate-800 dark:text-white font-black">{item.model || 'N/A'}</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-white/20 uppercase tracking-widest">Category</span>
                <span className="block text-lg text-slate-800 dark:text-white font-black">{item.category}</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-white/20 uppercase tracking-widest">Location</span>
                <span className="block text-lg text-slate-800 dark:text-white font-black">{item.location || 'Unassigned'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Technical & History (8 columns) */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-8">
          {/* Inventory Overview */}
          <div className="glass-liquid rounded-[2.5rem] p-10 border border-slate-200 dark:border-white/10 relative overflow-hidden">
             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
               <div className="flex flex-col">
                 <span className="text-slate-500 dark:text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Stock Overview</span>
                 <div className="flex items-baseline gap-2">
                   <span className={`text-7xl font-black ${isLowStock ? 'text-red-400' : 'text-slate-800 dark:text-white'}`}>{item.quantity}</span>
                   <span className="text-xl font-bold text-slate-500 dark:text-white/30 uppercase">Units Available</span>
                 </div>
               </div>
               
               <div className="flex flex-col gap-2 md:text-right">
                 <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Low Stock Alert</span>
                 <span className="text-2xl font-black text-white/70">{item.lowStockThreshold} <span className="text-sm font-bold text-white/20">Threshold</span></span>
               </div>
             </div>
             
             {/* Large background text for aesthetic */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[3] opacity-[0.02] text-slate-800 dark:text-white font-black pointer-events-none select-none uppercase">
               INVENTORY
             </div>
          </div>

          {/* Details & Procurement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-liquid rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10 space-y-6">
              <h3 className="text-slate-500 dark:text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">Description</h3>
              <p className="text-white/70 leading-relaxed text-sm">
                {item.description || "No technical description provided for this asset. Update details to provide more context for warehouse staff."}
              </p>
            </div>

            <div className="glass-liquid rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10 space-y-6">
              <h3 className="text-slate-500 dark:text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">Procurement</h3>
              <div className="space-y-4">
                <div>
                  <span className="block text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Purchased From</span>
                  <span className="block text-slate-800 dark:text-white font-bold">{item.purchasedFrom || 'Unknown Provider'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Shop Address</span>
                  <span className="block text-white/70 text-sm leading-tight italic">{item.shopAddress || 'No physical/web address records found.'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Warranty & Maintenance */}
          <div className="glass-liquid rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-slate-500 dark:text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Warranty Status</h3>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.warrantyAvailable ? 'bg-white/80 dark:bg-white/10 text-slate-800 dark:text-white' : 'bg-red-500/10 text-red-400'}`}>
                    {item.warrantyAvailable ? '🛡️' : '⚠️'}
                  </div>
                  <div>
                    <span className="block text-lg font-black text-slate-800 dark:text-white">{item.warrantyAvailable ? 'Active Coverage' : 'No Active Coverage'}</span>
                    {item.warrantyAvailable && (
                      <span className="text-slate-500 dark:text-white/40 text-[10px] font-bold uppercase tracking-widest">
                        Expires: {item.warrantyExpiry ? new Date(item.warrantyExpiry).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date not set'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {item.warrantyAvailable && item.warrantyCardImage && (
                <div className="group relative">
                   <img src={item.warrantyCardImage} alt="Warranty" className="h-20 w-32 object-cover rounded-xl border border-slate-200 dark:border-white/10 shadow-lg transition-all duration-500 group-hover:scale-110" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl cursor-zoom-in">
                     <span className="text-[10px] text-slate-800 dark:text-white font-bold uppercase">View Card</span>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEdit && (
        <ItemModal 
          item={item} 
          categories={categories} 
          onClose={() => setShowEdit(false)} 
          onSave={() => { loadItem(); setShowEdit(false); }} 
        />
      )}

      {showBarcodePrint && (
        <BarcodePrintModal 
          items={[item]} 
          onClose={() => setShowBarcodePrint(false)} 
        />
      )}
    </div>
  );
}

