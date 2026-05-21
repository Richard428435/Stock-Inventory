import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Activity, Check, X, MapPin } from 'lucide-react';

export default function AuditPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [auditStats, setAuditStats] = useState({ present: 0, missing: 0 });
  const [auditedItems, setAuditedItems] = useState(new Set());

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get('/inventory/items/all-light');
        setItems(res.data);
      } catch (err) {
        toast.error('Failed to load items for audit');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleAction = (item, status) => {
    if (auditedItems.has(item._id)) return;

    if (status === 'present') {
      setAuditStats(prev => ({ ...prev, present: prev.present + 1 }));
      toast.success(`${item.name} marked as present.`, { icon: '✅' });
    } else {
      setAuditStats(prev => ({ ...prev, missing: prev.missing + 1 }));
      toast.error(`${item.name} marked as missing/damaged.`, { icon: '⚠️' });
    }

    setAuditedItems(prev => new Set(prev).add(item._id));
  };

  const normalizeLocation = (loc) => {
    if (!loc) return '';
    let l = loc.trim().toUpperCase();
    if (l === 'CABIN' || l === 'CFFA MEDIA CABIN') return 'CFFA MEDIA CABIN';
    if (l === 'UNDER GROUND' || l === 'UNDERGROUND') return 'UNDERGROUND';
    if (l === 'CABIN/UNDER GROUND' || l === 'CABIN / UNDERGROUND' || l === 'CABIN/UNDERGROUND' || l.replace(/\s+/g, '') === 'CABIN/UNDERGROUND') return 'CABIN & UNDERGROUND';
    if (l === 'STAGE') return 'STAGE';
    if (l === 'KIDS KOINONIA') return 'KIDS KOINONIA';
    return l;
  };

  // Extract all unique locations from items (both primary and allocations)
  const locations = React.useMemo(() => {
    const locs = new Set();
    items.forEach(item => {
      if (item.allocations && item.allocations.length > 0) {
        item.allocations.forEach(a => { if (a.location) locs.add(normalizeLocation(a.location)); });
      } else if (item.location) {
        locs.add(normalizeLocation(item.location));
      }
    });
    return Array.from(locs).filter(Boolean).sort();
  }, [items]);

  // Filter items for the selected location
  const locationItems = React.useMemo(() => {
    if (!selectedLocation) return [];
    return items.map(item => {
      if (item.allocations && item.allocations.length > 0) {
        // Sum quantities for all allocations that map to the selected canonical location
        const matchingAllocs = item.allocations.filter(a => normalizeLocation(a.location) === selectedLocation);
        if (matchingAllocs.length > 0) {
          const totalQty = matchingAllocs.reduce((sum, a) => sum + (Number(a.quantity) || 0), 0);
          return { ...item, displayQuantity: totalQty };
        }
        return null;
      } else {
        if (normalizeLocation(item.location) === selectedLocation) return { ...item, displayQuantity: item.quantity };
        return null;
      }
    }).filter(i => i !== null);
  }, [items, selectedLocation]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#c49a5b] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col max-w-4xl mx-auto pb-20 fade-in">
      
      {/* Header */}
      <div className="mb-10 animate-slide-right flex items-center justify-between">
        <div>
          <h2 className="text-[40px] font-serif text-white tracking-tight leading-none mb-2">
            Yearly <span className="text-[#c49a5b] italic">Location Audit</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">Comprehensive Zone Verification</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-[#111] border border-white/5 px-6 py-3 rounded-2xl text-center">
            <div className="text-2xl font-black text-emerald-400">{auditStats.present}</div>
            <div className="text-[8px] uppercase tracking-widest text-white/40 font-bold mt-1">Verified</div>
          </div>
          <div className="bg-[#111] border border-white/5 px-6 py-3 rounded-2xl text-center">
            <div className="text-2xl font-black text-rose-400">{auditStats.missing}</div>
            <div className="text-[8px] uppercase tracking-widest text-white/40 font-bold mt-1">Missing</div>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 mb-8">
        <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-3 block">Select Zone to Audit</label>
        <div className="flex flex-wrap gap-3">
          {locations.map(loc => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                selectedLocation === loc 
                  ? 'bg-[#c49a5b] text-[#111] border-[#c49a5b] shadow-[0_0_20px_rgba(196,154,91,0.3)]' 
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              <MapPin className="w-3 h-3 inline-block mr-2" />
              {loc}
            </button>
          ))}
          {locations.length === 0 && <span className="text-white/40 text-sm">No locations configured in assets.</span>}
        </div>
      </div>

      {selectedLocation && (
        <div className="bg-[#111111]/90 backdrop-blur-xl rounded-[3rem] border border-white/5 shadow-xl overflow-hidden animate-slide-up">
          <div className="p-8 border-b border-white/5 bg-white/5">
            <h3 className="text-xl font-serif text-white">{selectedLocation} Assets</h3>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold mt-1">Found {locationItems.length} items registered to this zone</p>
          </div>
          
          <div className="divide-y divide-white/5">
            {locationItems.length === 0 ? (
              <div className="p-12 text-center text-white/40 text-sm">No items found in this zone.</div>
            ) : (
              locationItems.map(item => {
                const isAudited = auditedItems.has(item._id);
                return (
                  <div key={item._id} className={`p-6 flex items-center justify-between transition-all ${isAudited ? 'opacity-50 grayscale bg-black/40' : 'hover:bg-white/5'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black rounded-xl border border-white/10 flex items-center justify-center text-[#c49a5b]">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{item.name}</h4>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                          SKU: {item.sku} <span className="mx-2">•</span> Expected: {item.displayQuantity} Units
                        </div>
                      </div>
                    </div>
                    
                    {!isAudited ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAction(item, 'missing')}
                          className="px-6 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl transition-all text-[9px] font-bold uppercase tracking-widest"
                        >
                          Missing
                        </button>
                        <button 
                          onClick={() => handleAction(item, 'present')}
                          className="px-6 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-xl transition-all text-[9px] font-bold uppercase tracking-widest"
                        >
                          Present
                        </button>
                      </div>
                    ) : (
                      <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-widest text-white/40">
                        Audited
                      </div>
                    )}
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
