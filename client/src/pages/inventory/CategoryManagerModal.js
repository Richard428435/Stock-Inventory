import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function CategoryManagerModal({ onClose, onUpdate }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get('/inventory/categories');
      const fixedCategories = [
        { _id: 'fixed-1', name: 'CFFA M&B - Audio' },
        { _id: 'fixed-2', name: 'CFFA M&B - Live Production' },
        { _id: 'fixed-3', name: 'CFFA M&B - Videography' },
        { _id: 'fixed-4', name: 'CFFA M&B - Presentation' },
        { _id: 'fixed-5', name: 'General Items' }
      ];
      const existingNames = new Set(res.data.map(c => c.name));
      const newCategories = fixedCategories.filter(c => !existingNames.has(c.name));
      setCategories([...res.data, ...newCategories]);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setProcessing(true);
    try {
      await api.post('/inventory/categories', { name: newCategory.trim() });
      toast.success('Category added');
      setNewCategory('');
      loadCategories();
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding category');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    setProcessing(true);
    try {
      await api.delete(`/inventory/categories/${id}`);
      toast.success('Category deleted');
      setConfirmDelete(null);
      loadCategories();
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting category');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] animate-slide-up relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        <h3 className="text-3xl font-serif text-white mb-2">Manage Categories</h3>
        <p className="text-[#c49a5b] text-[10px] uppercase tracking-[0.2em] font-bold mb-8">Organize inventory classification</p>

        <form onSubmit={handleAdd} className="flex gap-3 mb-8">
          <input 
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c49a5b]/50 focus:ring-1 focus:ring-[#c49a5b]/50 transition-all text-sm"
            placeholder="New category name..."
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            disabled={processing}
          />
          <button 
            type="submit" 
            disabled={processing || !newCategory.trim()}
            className="px-6 py-3 bg-gradient-to-r from-[#d1a66a] to-[#b78645] text-[#1a1a1a] rounded-xl font-bold uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(196,154,91,0.3)] hover:shadow-[0_0_30px_rgba(196,154,91,0.5)] active:scale-95 disabled:opacity-50 transition-all"
          >
            Add
          </button>
        </form>

        <div className="space-y-3 max-h-64 overflow-y-auto inventory-scrollbar pr-2">
          {loading ? (
            <div className="text-center py-4 text-white/40 text-sm font-bold uppercase tracking-widest">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-4 text-white/40 text-sm italic font-bold uppercase tracking-widest">No categories created yet</div>
          ) : (
            categories.map(cat => {
              const isFixed = cat._id.toString().startsWith('fixed-');
              return (
                <div key={cat._id} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-white/5 group transition-all">
                  <span className="text-sm font-bold text-white/80">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    {isFixed ? (
                      <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white/30 border border-white/5 rounded-lg bg-white/5">System</span>
                    ) : confirmDelete === cat._id ? (
                      <>
                        <button 
                          onClick={() => handleDelete(cat._id)}
                          disabled={processing}
                          className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => setConfirmDelete(null)}
                          className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-white/10 border border-white/20 text-white/70 rounded-lg hover:bg-white/20 hover:text-white transition-all"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => setConfirmDelete(cat._id)}
                        disabled={processing}
                        className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-red-500/5 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="mt-8 pt-4 border-t border-white/10">
          <button 
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-white/5 text-white/60 font-bold uppercase tracking-widest transition-all text-xs border border-white/10 hover:bg-white/10 hover:text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
