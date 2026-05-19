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
      setCategories(res.data);
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
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-liquid p-8 max-w-md w-full mx-4 rounded-3xl border border-slate-300 dark:border-white/20 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Manage Categories</h3>
          <button onClick={onClose} className="text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:text-white transition-colors">✕</button>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2 mb-8">
          <input 
            className="flex-1 bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-slate-800 dark:text-white outline-none focus:border-blue-500 transition-all text-sm"
            placeholder="New category name..."
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            disabled={processing}
          />
          <button 
            type="submit" 
            disabled={processing || !newCategory.trim()}
            className="px-4 py-2 glass-liquid text-slate-800 dark:text-white rounded-xl text-xs font-bold uppercase tracking-widest active:scale-95 disabled:opacity-50 hover:bg-white hover:text-slate-900 transition-all"
          >
            Add
          </button>
        </form>

        <div className="space-y-3 max-h-64 overflow-y-auto inventory-scrollbar pr-2">
          {loading ? (
            <div className="text-center py-4 text-gray-500 text-sm">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm italic">No categories created yet</div>
          ) : (
            categories.map(cat => (
              <div key={cat._id} className="flex items-center justify-between p-3 glass-card bg-white/60 dark:bg-white/5 border-white/5 group transition-all">
                <span className="text-sm text-gray-200">{cat.name}</span>
                <div className="flex items-center gap-2">
                  {confirmDelete === cat._id ? (
                    <>
                      <button 
                        onClick={() => handleDelete(cat._id)}
                        disabled={processing}
                        className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-slate-800 dark:text-white transition-all"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => setConfirmDelete(null)}
                        className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-white/80 dark:bg-white/10 text-slate-500 dark:text-gray-400 rounded-lg hover:bg-white hover:text-slate-900 transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setConfirmDelete(cat._id)}
                      disabled={processing}
                      className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-slate-800 dark:text-white transition-all"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-8">
          <button 
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-white/60 dark:bg-white/5 text-slate-600 dark:text-gray-300 font-bold uppercase tracking-widest transition-all text-xs border border-slate-200 dark:border-white/10 hover:bg-white hover:text-slate-900"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
