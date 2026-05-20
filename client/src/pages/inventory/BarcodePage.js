import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import JsBarcode from 'jsbarcode';
import { BrowserQRCodeSvgWriter } from '@zxing/browser';
import BarcodePrintModal from '../../components/BarcodePrintModal';
import { useAuth } from '../../context/AuthContext';

function BarcodeCard({ item, onPrint, hasPermission }) {
  const svgRef = useRef();
  const canPrint = hasPermission('print_barcodes');
  const [hwFormat, setHwFormat] = useState(localStorage.getItem('hw_format') || 'code128');

  useEffect(() => {
    const handlePref = () => setHwFormat(localStorage.getItem('hw_format') || 'code128');
    window.addEventListener('prefs-changed', handlePref);
    return () => window.removeEventListener('prefs-changed', handlePref);
  }, []);

  useEffect(() => {
    if (svgRef.current && (item.barcode || item.sku)) {
      try {
        svgRef.current.innerHTML = '';
        if (hwFormat === 'qr') {
          const codeWriter = new BrowserQRCodeSvgWriter();
          const svgElement = codeWriter.write(item.barcode || item.sku, 120, 120);
          svgRef.current.appendChild(svgElement);
        } else {
          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.classList.add("max-w-full");
          svgRef.current.appendChild(svg);
          JsBarcode(svg, item.barcode || item.sku, {
            format: 'CODE128',
            width: 1.8,
            height: 48,
            displayValue: true,
            fontSize: 10,
            margin: 6,
            background: 'transparent',
            lineColor: '#ffffff',
          });
        }
      } catch (e) {
        console.error('Barcode render error:', e);
      }
    }
  }, [item, hwFormat]);

  const isLowStock = item.quantity <= item.lowStockThreshold;

  return (
    <div className="glass-liquid rounded-[2rem] border border-slate-200 dark:border-white/10 hover:border-white/25 transition-all duration-300 overflow-hidden group">
      {/* Top accent stripe */}
      <div className={`h-0.5 w-full ${isLowStock ? 'bg-gradient-to-r from-red-500 to-orange-400' : 'bg-gradient-to-r from-white/10 to-white/5'}`} />

      <div className="p-6 space-y-5">
        {/* Item info */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-slate-800 dark:text-white text-base tracking-tight leading-tight truncate group-hover:text-slate-800 dark:text-white transition-colors">
              {item.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-widest">{item.category}</span>
              {item.location && (
                <>
                  <span className="text-white/15">•</span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-widest">📍 {item.location}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 text-right">
            <p className={`text-xl font-black ${isLowStock ? 'text-red-400' : 'text-slate-800 dark:text-white'}`}>{item.quantity}</p>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">units</p>
            {isLowStock && (
              <span className="mt-1 inline-block text-[8px] font-black text-red-400 uppercase tracking-widest bg-red-400/10 border border-red-400/20 px-1.5 py-0.5 rounded-full">
                Low
              </span>
            )}
          </div>
        </div>

        {/* Barcode display */}
        <div className={`rounded-2xl px-4 py-4 flex items-center justify-center border transition-colors ${hwFormat === 'qr' ? 'bg-white border-white/5' : 'bg-slate-100/50 dark:bg-black/20 border-white/5 group-hover:border-slate-200 dark:border-white/10'}`}>
          <div ref={svgRef} className="max-w-full flex justify-center" />
        </div>

        {/* SKU + Action */}
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] text-white/25 truncate">{item.sku}</span>
          {canPrint && (
            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/5 hover:bg-white hover:text-slate-900 text-slate-800 dark:text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 border border-slate-200 dark:border-white/10 flex-shrink-0"
            >
              <span>🖨️</span> Print
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BarcodePage() {
  const { hasPermission } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [printItems, setPrintItems] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const [itemsRes, catRes] = await Promise.all([
          api.get('/inventory/items'),
          api.get('/inventory/categories'),
        ]);
        const fixedCategories = [
          { _id: 'fixed-1', name: 'CFFA M&B - Audio' },
          { _id: 'fixed-2', name: 'CFFA M&B - Live Production' },
          { _id: 'fixed-3', name: 'CFFA M&B - Videography' },
          { _id: 'fixed-4', name: 'CFFA M&B - Presentation' }
        ];
        const existingNames = new Set(catRes.data.map(c => c.name));
        const newCategories = fixedCategories.filter(c => !existingNames.has(c.name));
        setItems(itemsRes.data);
        setCategories([...catRes.data, ...newCategories]);
      } catch (err) {
        toast.error('Failed to load assets');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = items.filter(i => {
    const matchesText =
      i.name.toLowerCase().includes(filter.toLowerCase()) ||
      i.sku.toLowerCase().includes(filter.toLowerCase());
    const matchesCat = !categoryFilter || i.category === categoryFilter;
    return matchesText && matchesCat;
  });

  return (
    <div className="pb-20 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Barcodes</h2>
          <p className="text-slate-500 dark:text-gray-400 text-sm font-medium mt-1">
            {loading ? 'Loading assets…' : `${filteredItems.length} of ${items.length} assets`}
          </p>
        </div>

        {hasPermission('print_barcodes') && (
          <button
            onClick={() => setPrintItems(filteredItems)}
            disabled={filteredItems.length === 0}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl glass-liquid text-slate-800 dark:text-white text-sm font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none border border-slate-200 dark:border-white/10"
          >
            🖨️ Print All ({filteredItems.length})
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="glass-liquid p-4 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-white/30 text-sm pointer-events-none">🔍</span>
            <input
              type="text"
              placeholder="Search by name or SKU…"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-full bg-white/60 dark:bg-white/5 border border-white/5 focus:border-amber-500/50 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 dark:text-white text-sm outline-none transition-all placeholder-slate-400 dark:placeholder-white/20"
            />
          </div>
          {filter && (
            <button
              onClick={() => setFilter('')}
              className="px-4 py-2.5 rounded-xl bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:bg-white/10 text-white/50 hover:text-slate-800 dark:text-white text-xs font-black uppercase tracking-widest transition-all border border-white/5"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Modern Category Pills */}
        <section className="flex items-center gap-3 overflow-x-auto inventory-scrollbar pb-2 pt-1">
          <button
            onClick={() => setCategoryFilter('')}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 ${
              categoryFilter === '' 
                ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105'
                : 'bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-white hover:text-slate-900 dark:hover:bg-white/20'
            }`}
          >
            All Categories
          </button>
          {categories.map(c => (
            <button
              key={c._id}
              onClick={() => setCategoryFilter(c.name)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 ${
                categoryFilter === c.name
                  ? 'bg-amber-500 text-white shadow-[0_4px_20px_rgba(245,158,11,0.4)] scale-105 border-transparent'
                  : 'bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-white hover:text-slate-900 dark:hover:bg-white/20'
              }`}
            >
              {c.name}
            </button>
          ))}
        </section>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-56 rounded-[2rem] bg-white/60 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-liquid rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 p-20 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-white/60 dark:bg-white/5 flex items-center justify-center text-4xl opacity-40">🏷️</div>
          <h3 className="text-lg font-bold text-slate-500 dark:text-white/40">No assets match your filters</h3>
          <p className="text-white/20 text-xs">Try adjusting your search or category filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredItems.map(item => (
            <BarcodeCard
              key={item._id}
              item={item}
              onPrint={() => setPrintItems([item])}
              hasPermission={hasPermission}
            />
          ))}
        </div>
      )}

      {/* Print Modal */}
      {printItems.length > 0 && (
        <BarcodePrintModal items={printItems} onClose={() => setPrintItems([])} />
      )}
    </div>
  );
}
