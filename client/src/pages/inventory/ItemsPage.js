import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import JsBarcode from 'jsbarcode';
import BarcodePrintModal from '../../components/BarcodePrintModal';
import CategoryManagerModal from './CategoryManagerModal';
import ItemModal from '../../components/inventory/ItemModal';
import AdjustModal from '../../components/inventory/AdjustModal';




// --- Components ---


function ItemCard({ item, onEdit, onDelete, onAdjust, onPrint, onView, hasPermission }) {
  const [localShowDelete, setLocalShowDelete] = useState(false);
  const isLowStock = item.quantity <= item.lowStockThreshold;
  const stockPercentage = Math.min((item.quantity / (item.lowStockThreshold * 2)) * 100, 100);

  const canEdit = hasPermission('edit_item');
  const canDelete = hasPermission('delete_item');
  const canAdjust = hasPermission('adjust_stock');

  return (
    <div className="glass-liquid group flex flex-col h-full rounded-[2rem] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:border-white/20 transition-all duration-500 overflow-hidden shadow-2xl relative">
      {/* Visual Header / Image */}
      <div className="relative h-56 bg-[#0c0818] overflow-hidden cursor-pointer" onClick={onView}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
          <div className="flex justify-end">
            {isLowStock && (
              <span className="px-3 py-1 rounded-full bg-red-500 text-slate-800 dark:text-white text-[10px] font-bold uppercase tracking-widest shadow-lg animate-pulse">
                Low Stock
              </span>
            )}
          </div>
          <div className="flex justify-between items-end">
            <span className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-md text-slate-800 dark:text-white text-[10px] font-bold uppercase tracking-widest border border-slate-200 dark:border-white/10">
              {item.category}
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-white/40 bg-slate-100/50 dark:bg-black/20 px-2 py-0.5 rounded-lg backdrop-blur-sm">
              {item.sku}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col relative">
        <div className="mb-4">
          <h4 className="text-xl font-bold text-slate-800 dark:text-white leading-tight mb-2 hover:text-slate-600 dark:text-gray-300 transition-colors cursor-pointer" onClick={onView}>
            {item.name}
          </h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white/50 text-[11px] font-medium uppercase tracking-wider">
              <span>📍</span> {item.location || 'Unassigned'}
            </div>
            {item.purchasedFrom && (
              <div className="flex items-center gap-2 text-slate-500 dark:text-white/40 text-[10px] font-medium uppercase tracking-tight line-clamp-1">
                <span>🛒</span> {item.purchasedFrom}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Stock Indicator */}
        <div className="mt-auto space-y-3">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black ${isLowStock ? 'text-red-400' : 'text-slate-800 dark:text-white'}`}>{item.quantity}</span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-white/30 uppercase">Units</span>
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-white/60 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${isLowStock ? 'bg-red-500' : 'bg-white'}`}
              style={{ width: `${stockPercentage}%` }}
            />
          </div>
        </div>

        {/* Action Reveal */}
        <div className="mt-6">
          {!localShowDelete ? (
            <div className={`grid ${canDelete ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
              {canAdjust && (
                <button onClick={onAdjust} className="flex-1 py-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/5 hover:bg-white hover:text-slate-900 text-slate-800 dark:text-white text-[10px] font-bold uppercase tracking-[0.15em] transition-all active:scale-95 shadow-lg">
                  Adjust
                </button>
              )}
              {canDelete && (
                <button onClick={() => setLocalShowDelete(true)} className="flex-1 py-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/5 hover:bg-red-500 hover:text-slate-800 dark:text-white text-red-400 text-[10px] font-bold uppercase tracking-[0.15em] transition-all active:scale-95 shadow-lg">
                  Delete
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 animate-fadeIn">
              <button onClick={onDelete} className="flex-1 py-3 rounded-2xl bg-red-500 text-slate-800 dark:text-white text-[10px] font-bold uppercase tracking-[0.15em] transition-all active:scale-95 shadow-lg">
                Confirm
              </button>
              <button onClick={() => setLocalShowDelete(false)} className="flex-1 py-3 rounded-2xl bg-white/80 dark:bg-white/10 text-slate-800 dark:text-white text-[10px] font-bold uppercase tracking-[0.15em] transition-all active:scale-95 shadow-lg">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemListRow({ item, onEdit, onDelete, onAdjust, onPrint, onView, hasPermission }) {
  const [localShowDelete, setLocalShowDelete] = useState(false);
  const isLowStock = item.quantity <= item.lowStockThreshold;

  return (
    <div className="glass-liquid group flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-6 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 mb-4 shadow-xl relative cursor-pointer" onClick={onView}>
      
      <div className="flex items-center gap-6 w-full md:w-auto">
        {/* Visual Header / Image (Landscape Optimized) */}
        <div className="w-32 h-20 rounded-xl overflow-hidden bg-[#0c0818]/60 shadow-lg flex-shrink-0 border border-slate-200 dark:border-white/10 group-hover:scale-105 transition-transform duration-500">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/10 bg-gradient-to-br from-white/5 to-transparent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h4 className="text-xl font-bold text-slate-800 dark:text-white leading-tight mb-1 group-hover:text-amber-500 transition-colors">
            {item.name}
          </h4>
          <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
             <span className="px-2 py-0.5 rounded-lg bg-white/60 dark:bg-white/10 border border-slate-200 dark:border-white/5 text-slate-800 dark:text-white">
                {item.category}
             </span>
             <span>{item.sku}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between w-full md:w-auto mt-4 md:mt-0 gap-6 md:gap-12">
        {/* Dynamic Stock Indicator */}
        <div className="text-right">
          <div className="flex items-baseline gap-1 justify-end">
            <span className={`text-2xl font-black ${isLowStock ? 'text-red-400 animate-pulse' : 'text-slate-800 dark:text-white'}`}>{item.quantity}</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-white/30 uppercase">Units</span>
          </div>
          {isLowStock && <div className="text-[10px] text-red-500 uppercase font-bold tracking-widest mt-1">Low Stock</div>}
        </div>

        {/* Actions Options */}
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
           {hasPermission('adjust_stock') && (
             <button onClick={(e) => { e.stopPropagation(); onAdjust(); }} className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-white dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white transition-all shadow-md active:scale-95 text-[10px] font-bold uppercase tracking-widest">
               Adjust
             </button>
           )}
           {hasPermission('delete_item') && (
             !localShowDelete ? (
               <button onClick={(e) => { e.stopPropagation(); setLocalShowDelete(true); }} className="px-4 py-2 bg-red-100 dark:bg-red-500/10 rounded-xl hover:bg-red-200 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 transition-all shadow-md active:scale-95 text-[10px] font-bold uppercase tracking-widest">
                 Delete
               </button>
             ) : (
               <div className="flex items-center gap-2 animate-fadeIn">
                 <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 border border-red-600 transition-all shadow-md active:scale-95 text-[10px] font-bold uppercase tracking-widest">
                   Confirm
                 </button>
                 <button onClick={(e) => { e.stopPropagation(); setLocalShowDelete(false); }} className="px-4 py-2 bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white rounded-xl hover:bg-slate-300 dark:hover:bg-white/20 transition-all shadow-md active:scale-95 text-[10px] font-bold uppercase tracking-widest">
                   Cancel
                 </button>
               </div>
             )
           )}
        </div>
      </div>
    </div>
  );
}


// --- Main Page ---

export default function ItemsPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [adjustItem, setAdjustItem] = useState(null);
  const [barcodePrintItems, setBarcodePrintItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [viewMode, setViewMode] = useState(localStorage.getItem('ui_viewMode') || 'grid');

  const loadCategories = async () => {
    try {
      const res = await api.get('/inventory/categories');
      setCategories(res.data);
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  useEffect(() => {
    loadCategories();
    
    const handleStorage = () => {
      setViewMode(localStorage.getItem('ui_viewMode') || 'grid');
    };
    window.addEventListener('prefs-changed', handleStorage);
    window.addEventListener('storage', handleStorage);
    return () => {
       window.removeEventListener('prefs-changed', handleStorage);
       window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      const r = await api.get('/inventory/items', { params });
      setItems(r.data);
    } catch (err) { toast.error('Failed to load items'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, category]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/inventory/items/${id}`);
      toast.success('Item deleted');
      load();
    } catch (err) { toast.error('Error deleting item'); }
  };


  return (
    <div className="space-y-10 pb-20 fade-in">
      {/* Header & Stats */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Items</h2>
            <p className="text-slate-500 dark:text-gray-400 text-sm font-medium mt-1">Manage and track your church physical assets.</p>
          </div>
          <div className="flex items-center gap-3">
            {hasPermission('manage_categories') && (
              <button onClick={() => setShowCategoryManager(true)} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/60 dark:bg-white/5 text-slate-600 dark:text-gray-300 font-bold uppercase tracking-widest hover:bg-white hover:text-slate-900 active:scale-95 transition-all text-sm border border-slate-200 dark:border-white/10">
                📁 Categories
              </button>
            )}

            {hasPermission('add_item') && (
              <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-6 py-3 rounded-2xl glass-liquid text-slate-800 dark:text-white font-bold uppercase tracking-widest hover:bg-white hover:text-slate-900 active:scale-95 transition-all text-sm group">
                <span className="text-xl group-hover:rotate-90 transition-transform duration-300">＋</span>
                Add New Item
              </button>
            )}
          </div>
        </div>

      </section>

      {/* Control Bar */}
      <section className="glass-liquid p-4 rounded-3xl flex flex-wrap items-center gap-4 border border-slate-200 dark:border-white/10">
        <div className="flex-1 min-w-[300px] relative group">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-slate-800 dark:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full bg-white/60 dark:bg-white/5 border border-white/5 hover:border-slate-200 dark:border-white/10 focus:border-white/50 focus:bg-white/80 dark:bg-white/10 rounded-2xl pl-12 pr-4 py-3 text-slate-800 dark:text-white transition-all outline-none placeholder-gray-500"
            placeholder="Search by name, SKU or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            className="bg-white/60 dark:bg-white/5 border border-white/5 hover:border-slate-200 dark:border-white/10 focus:border-white/50 rounded-2xl px-4 py-3 text-slate-800 dark:text-white transition-all outline-none cursor-pointer"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="" className="bg-[#1a0840]">All Categories</option>
            {categories.map(c => <option key={c._id} value={c.name} className="bg-[#1a0840]">{c.name}</option>)}
          </select>
          {(search || category) && (
            <button onClick={() => { setSearch(''); setCategory(''); }} className="px-5 py-3 rounded-2xl bg-white/60 dark:bg-white/5 hover:bg-white hover:text-slate-900 text-slate-500 dark:text-gray-400 transition-all text-sm font-bold uppercase tracking-widest">
              Clear
            </button>
          )}
        </div>
      </section>

      {/* Main Grid or List */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="glass-card h-[400px] animate-pulse bg-white/60 dark:bg-white/5" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="glass-card p-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-white/60 dark:bg-white/5 flex items-center justify-center text-4xl mb-4 opacity-50">🔍</div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">No items found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters or add a new item to get started.</p>
            <button onClick={() => { setSearch(''); setCategory(''); }} className="mt-6 text-slate-800 dark:text-white hover:underline font-bold uppercase tracking-widest text-xs">Reset Filters</button>
          </div>
        ) : viewMode === 'list' ? (
          <div className="flex flex-col space-y-2 animate-fadeIn">
            {items.map(item => (
              <ItemListRow
                key={item._id}
                item={item}
                onEdit={() => setEditItem(item)}
                onDelete={() => handleDelete(item._id)}
                onAdjust={() => setAdjustItem(item)}
                onPrint={() => setBarcodePrintItems([item])}
                onView={() => navigate(`/inventory/items/${item._id}`)}
                hasPermission={hasPermission}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
            {items.map(item => (
              <ItemCard
                key={item._id}
                item={item}
                onEdit={() => setEditItem(item)}
                onDelete={() => handleDelete(item._id)}
                onAdjust={() => setAdjustItem(item)}
                onPrint={() => setBarcodePrintItems([item])}
                onView={() => navigate(`/inventory/items/${item._id}`)}
                hasPermission={hasPermission}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modals & Popups */}
      {(showAdd || editItem) && (
        <ItemModal item={editItem} onClose={() => { setShowAdd(false); setEditItem(null); }} onSave={load} categories={categories} />
      )}
      {adjustItem && <AdjustModal item={adjustItem} onClose={() => setAdjustItem(null)} onDone={load} />}
      {barcodePrintItems.length > 0 && <BarcodePrintModal items={barcodePrintItems} onClose={() => setBarcodePrintItems([])} />}
      {showCategoryManager && <CategoryManagerModal onClose={() => setShowCategoryManager(false)} onUpdate={loadCategories} />}
    </div>
  );
}
