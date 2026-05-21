import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import JsBarcode from 'jsbarcode';
import BarcodePrintModal from '../../components/BarcodePrintModal';
import CategoryManagerModal from './CategoryManagerModal';
import ItemModal from '../../components/inventory/ItemModal';
import AdjustModal from '../../components/inventory/AdjustModal';
import DistributeModal from '../../components/inventory/DistributeModal';




// --- Components ---


const ItemCard = React.memo(({ item, onEdit, onDelete, onAdjust, onPrint, onView, onDistribute, hasPermission }) => {
  const [localShowDelete, setLocalShowDelete] = useState(false);
  const isLowStock = item.quantity <= item.lowStockThreshold;
  const stockPercentage = Math.min((item.quantity / (item.lowStockThreshold * 2)) * 100, 100);

  const canEdit = hasPermission('edit_item');
  const canDelete = hasPermission('delete_item');
  const canAdjust = hasPermission('adjust_stock');

  return (
    <div className="bg-[#0a0a0a]/80 backdrop-blur-md group flex flex-col h-full rounded-[2.5rem] border border-white/5 transition-all duration-500 overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] relative hover:border-[#c49a5b]/40 hover:shadow-[0_20px_50px_-10px_rgba(196,154,91,0.15)] hover-lux">
      {/* Visual Header / Image */}
      <div className="relative h-64 bg-[#111111] overflow-hidden cursor-pointer" onClick={onView}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/5 group-hover:text-[#c49a5b]/30 transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute inset-0 p-5 flex flex-col justify-between pointer-events-none">
          <div className="flex justify-end">
            {isLowStock && (
              <span className="px-4 py-1.5 rounded-full bg-red-900/80 backdrop-blur-md text-red-300 border border-red-500/30 text-[9px] font-bold uppercase tracking-[0.2em] shadow-lg animate-pulse">
                Low Stock
              </span>
            )}
          </div>
          <div className="flex justify-between items-end">
            <span className="px-4 py-1.5 rounded-xl bg-[#0a0a0a]/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-[0.2em] border border-white/10 shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
              {item.category}
            </span>
            <span className="text-[9px] font-mono font-bold text-[#111111] bg-gradient-to-r from-[#d1a66a] to-[#b78645] border border-[#d1a66a] px-3 py-1.5 rounded-xl shadow-[0_4px_15px_rgba(196,154,91,0.5)] tracking-wider">
              {item.sku}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 flex-1 flex flex-col relative">
        <div className="mb-6">
          <h4 className="text-2xl font-serif font-medium text-[#eaddcf] leading-tight mb-3 hover:text-white transition-colors cursor-pointer" onClick={onView}>
            {item.name}
          </h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white/50 text-[11px] font-medium uppercase tracking-wider">
              <span>📍</span> 
              {item.allocations?.length > 0 
                ? (item.allocations.length === 1 
                    ? item.allocations[0].location 
                    : `${item.allocations.length} Locations`)
                : (item.location || 'Unassigned')}
            </div>
            {item.purchasedFrom && (
              <div className="flex items-center gap-2 text-slate-500 dark:text-white/40 text-[10px] font-medium uppercase tracking-tight line-clamp-1">
                <span>🛒</span> {item.purchasedFrom}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Stock Indicator */}
        <div className="mt-auto space-y-4">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className={`text-[32px] font-serif leading-none ${isLowStock ? 'text-red-400' : 'text-[#c49a5b]'}`}>{item.quantity}</span>
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Units</span>
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${isLowStock ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-[#c49a5b] shadow-[0_0_10px_rgba(196,154,91,0.5)]'}`}
              style={{ width: `${stockPercentage}%` }}
            />
          </div>
        </div>

        {/* Action Reveal */}
        <div className="mt-8">
          {!localShowDelete ? (
            <div className={`grid ${canDelete ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
              {canAdjust && (
                <button onClick={onAdjust} className="flex-1 py-3.5 rounded-2xl bg-[#111]/80 hover:bg-[#c49a5b]/10 border border-white/5 hover:border-[#c49a5b]/40 hover:text-[#c49a5b] text-white/70 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 active:scale-95">
                  Adjust
                </button>
              )}
              {canDelete && (
                <button onClick={() => setLocalShowDelete(true)} className="flex-1 py-3.5 rounded-2xl bg-[#111]/80 hover:bg-red-900/20 border border-white/5 hover:border-red-500/40 hover:text-red-400 text-white/50 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 active:scale-95">
                  Delete
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 animate-fadeIn">
              <button onClick={onDelete} className="flex-1 py-3.5 rounded-2xl bg-red-900/80 hover:bg-red-500 border border-red-500/50 text-white text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                Confirm
              </button>
              <button onClick={() => setLocalShowDelete(false)} className="flex-1 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 active:scale-95">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const ItemListRow = React.memo(({ item, onEdit, onDelete, onAdjust, onPrint, onView, onDistribute, hasPermission }) => {
  const [localShowDelete, setLocalShowDelete] = useState(false);
  const isLowStock = item.quantity <= item.lowStockThreshold;

  return (
    <div className="bg-[#0a0a0a]/80 backdrop-blur-md group flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 rounded-[2rem] border border-white/5 transition-all duration-500 mb-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] relative cursor-pointer hover-lux hover:border-[#c49a5b]/40 hover:shadow-[0_15px_40px_-10px_rgba(196,154,91,0.15)]" onClick={onView}>
      
      <div className="flex items-center gap-8 w-full md:w-auto">
        {/* Visual Header / Image (Landscape Optimized) */}
        <div className="w-32 h-20 rounded-2xl overflow-hidden bg-[#111] shadow-lg flex-shrink-0 border border-white/5 group-hover:scale-105 transition-transform duration-500">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 opacity-80 group-hover:opacity-100" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/5 bg-gradient-to-br from-white/5 to-transparent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 group-hover:text-[#c49a5b]/30 transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h4 className="text-2xl font-serif font-medium text-[#eaddcf] leading-tight mb-2 group-hover:text-white transition-colors">
            {item.name}
          </h4>
          <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mt-3">
             <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/5 text-white/70">
                {item.category}
             </span>
             <span className="text-[#c49a5b]">{item.sku}</span>
             <span className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-4">
                <span>📍</span> 
                {item.allocations?.length > 0 
                  ? (item.allocations.length === 1 
                      ? item.allocations[0].location 
                      : `${item.allocations.length} Locations`)
                  : (item.location || 'Unassigned')}
             </span>
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
           
          <button 
            onClick={(e) => { e.stopPropagation(); onDistribute(); }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0a0a0a] hover:bg-[#c49a5b] text-white/50 hover:text-black transition-all group"
            title="Distribute Locations"
          >
            <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Deploy</span>
          </button>

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
});


// --- Main Page ---

export default function ItemsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [adjustItem, setAdjustItem] = useState(null);
  const [distributeItem, setDistributeItem] = useState(null);
  const [barcodePrintItems, setBarcodePrintItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [viewMode, setViewMode] = useState(localStorage.getItem('ui_viewMode') || 'grid');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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

  const load = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const currentPage = isLoadMore ? page + 1 : 1;
      const params = { page: currentPage, limit: 24 };
      if (search) params.search = search;
      if (category) params.category = category;
      const r = await api.get('/inventory/items', { params });
      
      let loadedItems = r.data.items || r.data;
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get('filter') === 'low_stock') {
        loadedItems = loadedItems.filter(item => item.quantity <= item.lowStockThreshold);
      }
      
      if (isLoadMore) {
        setItems(prev => [...prev, ...loadedItems]);
        setPage(currentPage);
      } else {
        setItems(loadedItems);
        setPage(1);
      }
      
      // Determine if there are more items to load
      if (r.data.pages) {
        setHasMore(currentPage < r.data.pages);
      } else {
        setHasMore(loadedItems.length === 24);
      }
      
    } catch (err) { 
      toast.error('Failed to load items'); 
    } finally { 
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      load();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, category, location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'add') {
      setShowAdd(true);
      navigate('/inventory/items', { replace: true });
    }
  }, [location.search, navigate]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/inventory/items/${id}`);
      toast.success('Item deleted');
      load();
    } catch (err) { toast.error('Error deleting item'); }
  };


  return (
    <>
      <div className="space-y-10 pb-20 fade-in text-white">
      {/* Header & Stats */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-[40px] font-serif text-white tracking-tight leading-none mb-2">Inventory <span className="text-[#c49a5b] italic">Management</span></h2>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">Track, update, and deploy physical assets.</p>
          </div>
          <div className="flex items-center gap-4">
            {hasPermission('manage_categories') && (
              <button onClick={() => setShowCategoryManager(true)} className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 text-[#c49a5b] font-bold uppercase tracking-[0.2em] active:scale-95 transition-all text-[9px] border border-white/5 hover:border-[#c49a5b]/40 hover:bg-[#c49a5b]/10 hover-lux shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                Categories
              </button>
            )}

            {hasPermission('add_item') && (
              <button onClick={() => setShowAdd(true)} className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-b from-[#d1a66a] to-[#b78645] text-[#1a1a1a] font-bold uppercase tracking-[0.2em] active:scale-95 transition-all text-[10px] group shadow-[0_10px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_30px_rgba(196,154,91,0.3)]">
                <span className="text-xl group-hover:rotate-90 transition-transform duration-300 leading-none">＋</span>
                Add New Item
              </button>
            )}
          </div>
        </div>

      </section>

      {/* Control Bar & Categories */}
      <div className="space-y-6">
        <section className="bg-[#0a0a0a]/80 backdrop-blur-md p-5 rounded-[2rem] flex flex-wrap items-center gap-4 border border-white/5 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)]">
          <div className="flex-1 min-w-[300px] relative group">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-[#c49a5b] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full bg-[#111] border border-white/5 hover:border-white/10 focus:border-[#c49a5b]/50 focus:bg-[#161616] rounded-2xl pl-14 pr-5 py-4 text-white transition-all outline-none placeholder-white/30 text-sm"
              placeholder="Search by name, SKU or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {search && (
            <button onClick={() => setSearch('')} className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:text-white text-white/50 transition-all text-[9px] font-bold uppercase tracking-[0.2em]">
              Clear
            </button>
          )}
        </section>

        {/* Ultra-Luxurious Category Navigation */}
        <section className="relative group w-full mb-8 z-20">
          <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <div className="relative bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-[2rem] p-3 shadow-[0_20px_40px_rgba(0,0,0,0.8)] overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex items-center gap-2 w-max">
              <button
                onClick={() => setCategory('')}
                className={`relative whitespace-nowrap px-8 py-3.5 rounded-2xl font-bold text-[9px] uppercase tracking-[0.25em] transition-all duration-500 flex-shrink-0 group ${
                  category === '' || category === 'Media & Broadcasting'
                    ? 'text-[#1a1a1a] bg-gradient-to-r from-[#d1a66a] to-[#b78645] shadow-[0_5px_20px_rgba(196,154,91,0.3)]'
                    : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className="relative z-20 flex items-center gap-2">
                  {(category === '' || category === 'Media & Broadcasting') && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] animate-pulse"></span>
                  )}
                  All Assets
                </span>
              </button>
              
              <div className="w-[1px] h-8 bg-white/10 mx-2 flex-shrink-0"></div>

              {categories.filter(c => c.name !== 'Media & Broadcasting').map(c => {
                 const isActive = category === c.name;
                 return (
                    <button
                      key={c._id}
                      onClick={() => setCategory(c.name)}
                      className={`relative whitespace-nowrap px-8 py-3.5 rounded-2xl font-bold text-[9px] uppercase tracking-[0.2em] transition-all duration-500 flex-shrink-0 group ${
                        isActive
                          ? 'text-[#c49a5b] bg-[#c49a5b]/10 shadow-[inset_0_0_20px_rgba(196,154,91,0.1)] border border-[#c49a5b]/30'
                          : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className="relative z-20 flex items-center gap-2">
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#c49a5b] shadow-[0_0_10px_rgba(196,154,91,0.8)] animate-pulse"></span>}
                        {c.name.replace('CFFA M&B - ', '')}
                      </span>
                    </button>
                 )
              })}
            </div>
          </div>
        </section>
      </div>

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
          <div className="flex flex-col space-y-2 animate-slide-up delay-100">
            {items.map((item, index) => (
              <div key={item._id} className="animate-slide-up" style={{ animationDelay: `${(index % 12) * 50 + 100}ms` }}>
                <ItemListRow
                  item={item}
                  onEdit={() => setEditItem(item)}
                  onDelete={() => handleDelete(item._id)}
                  onAdjust={() => setAdjustItem(item)}
                  onPrint={() => setBarcodePrintItems([item])}
                  onView={() => navigate(`/inventory/items/${item._id}`)}
                  onDistribute={() => setDistributeItem(item)}
                  hasPermission={hasPermission}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up delay-100">
            {items.map((item, index) => (
              <div key={item._id} className="animate-slide-up h-full" style={{ animationDelay: `${(index % 12) * 50 + 100}ms` }}>
                <ItemCard
                  item={item}
                  onEdit={() => setEditItem(item)}
                  onDelete={() => handleDelete(item._id)}
                  onAdjust={() => setAdjustItem(item)}
                  onPrint={() => setBarcodePrintItems([item])}
                  onView={() => navigate(`/inventory/items/${item._id}`)}
                  onDistribute={() => setDistributeItem(item)}
                  hasPermission={hasPermission}
                />
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination Load More */}
        {items.length > 0 && hasMore && !loading && (
          <div className="mt-12 flex justify-center pb-8">
            <button 
              onClick={() => load(true)} 
              disabled={loadingMore}
              className="px-10 py-4 bg-[#111111] hover:bg-white/5 border border-white/10 hover:border-[#c49a5b]/40 text-[#c49a5b] font-bold uppercase tracking-[0.2em] rounded-full transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.5)] active:scale-95 disabled:opacity-50 text-[10px]"
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </section>

      </div>

      {/* Modals & Popups - Rendered OUTSIDE the transformed container to fix position: fixed scrolling bugs */}
      {(showAdd || editItem) && (
        <ItemModal item={editItem} onClose={() => { setShowAdd(false); setEditItem(null); }} onSave={load} categories={categories} />
      )}
      {adjustItem && <AdjustModal item={adjustItem} onClose={() => setAdjustItem(null)} onDone={load} />}
      {distributeItem && <DistributeModal item={distributeItem} onClose={() => setDistributeItem(null)} onDone={load} />}
      {barcodePrintItems.length > 0 && <BarcodePrintModal items={barcodePrintItems} onClose={() => setBarcodePrintItems([])} />}
      {showCategoryManager && <CategoryManagerModal onClose={() => setShowCategoryManager(false)} onUpdate={loadCategories} />}
    </>
  );
}
