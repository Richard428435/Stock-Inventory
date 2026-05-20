import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Activity, Check, X } from 'lucide-react';

export default function AuditPage() {
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [auditStats, setAuditStats] = useState({ present: 0, missing: 0 });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get('/inventory/items');
        // Shuffle items for random audit or sort by location
        setItems(res.data.sort(() => Math.random() - 0.5));
      } catch (err) {
        toast.error('Failed to load items for audit');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleAction = async (status) => {
    const currentItem = items[currentIndex];
    
    // In a real app, you would hit an endpoint like /inventory/items/:id/audit
    // to record the audit log. For now, we simulate and update local state.
    if (status === 'present') {
      setAuditStats(prev => ({ ...prev, present: prev.present + 1 }));
      toast.success(`${currentItem.name} marked as present.`, { icon: '✅' });
    } else {
      setAuditStats(prev => ({ ...prev, missing: prev.missing + 1 }));
      toast.error(`${currentItem.name} marked as missing/damaged.`, { icon: '⚠️' });
    }

    if (currentIndex + 1 < items.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#c49a5b] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isComplete || items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center animate-slide-up">
        <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
          <Check className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-serif text-white mb-2">Audit <span className="text-[#c49a5b] italic">Complete</span></h2>
        <p className="text-white/40 uppercase tracking-widest text-xs font-bold mb-8">System verified successfully</p>
        
        <div className="flex gap-8 bg-[#111111]/80 backdrop-blur-md border border-white/5 p-8 rounded-3xl shadow-2xl">
          <div className="text-center">
            <div className="text-4xl font-black text-emerald-400">{auditStats.present}</div>
            <div className="text-[9px] uppercase tracking-widest text-white/40 mt-1 font-bold">Verified Present</div>
          </div>
          <div className="w-[1px] bg-white/10"></div>
          <div className="text-center">
            <div className="text-4xl font-black text-rose-400">{auditStats.missing}</div>
            <div className="text-[9px] uppercase tracking-widest text-white/40 mt-1 font-bold">Flagged Missing</div>
          </div>
        </div>
      </div>
    );
  }

  const item = items[currentIndex];

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      
      {/* Header */}
      <div className="text-center mb-10 animate-slide-up">
        <h2 className="text-[32px] font-serif text-white tracking-tight">Rapid <span className="text-[#c49a5b] italic">Audit</span> Mode</h2>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">Item {currentIndex + 1} of {items.length}</p>
        <div className="w-full bg-white/5 h-1.5 mt-6 rounded-full overflow-hidden">
          <div className="bg-[#c49a5b] h-full transition-all duration-500" style={{ width: `${((currentIndex) / items.length) * 100}%` }}></div>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-xl rounded-[3rem] border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden relative group animate-scale-in">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c49a5b]/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="h-64 bg-[#111] relative overflow-hidden flex items-center justify-center">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover opacity-80" />
          ) : (
            <Activity className="w-20 h-20 text-white/5" />
          )}
          <div className="absolute bottom-4 left-4">
            <span className="px-4 py-1.5 rounded-full bg-[#0a0a0a]/80 backdrop-blur-md text-[#eaddcf] text-[9px] font-bold uppercase tracking-[0.2em] border border-white/10">
              {item.category}
            </span>
          </div>
          <div className="absolute bottom-4 right-4">
            <span className="px-4 py-1.5 rounded-full bg-[#c49a5b]/20 backdrop-blur-md text-[#c49a5b] text-[9px] font-bold uppercase tracking-[0.2em] border border-[#c49a5b]/30">
              {item.sku}
            </span>
          </div>
        </div>

        <div className="p-8 text-center">
          <h3 className="text-3xl font-serif text-white mb-2">{item.name}</h3>
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-6">{item.location || 'Unknown Location'}</p>
          
          <div className="inline-block bg-white/5 border border-white/10 px-8 py-4 rounded-2xl mb-8">
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Expected Quantity</div>
            <div className="text-4xl font-black text-white">{item.quantity}</div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => handleAction('missing')}
              className="flex-1 py-5 bg-rose-950/40 hover:bg-rose-900 border border-rose-500/30 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 text-rose-400 group"
            >
              <X className="w-6 h-6 group-hover:scale-125 transition-transform" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Missing / Damaged</span>
            </button>
            <button 
              onClick={() => handleAction('present')}
              className="flex-1 py-5 bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-500/30 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 text-emerald-400 group"
            >
              <Check className="w-6 h-6 group-hover:scale-125 transition-transform" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Verify Present</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
