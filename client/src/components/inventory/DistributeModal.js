import React, { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const LOCATIONS = [
  'CFFA Media Cabin',
  'Stage',
  'Underground',
  'Kids Koinonia'
];

export default function DistributeModal({ item, onClose, onDone }) {
  // If item has allocations, initialize with them. Otherwise, initialize with the single location.
  const initialAllocations = item.allocations && item.allocations.length > 0
    ? [...item.allocations]
    : [{ location: item.location || 'CFFA Media Cabin', quantity: item.quantity }];

  const [allocations, setAllocations] = useState(initialAllocations);
  const [processing, setProcessing] = useState(false);

  const totalAllocated = allocations.reduce((sum, a) => sum + Number(a.quantity || 0), 0);
  const remaining = item.quantity - totalAllocated;

  const handleSave = async () => {
    if (totalAllocated > item.quantity) {
      return toast.error(`You have allocated ${totalAllocated} units, but only have ${item.quantity}.`);
    }
    // Filter out 0 quantities and empty locations
    const validAllocations = allocations.filter(a => a.location && Number(a.quantity) > 0);
    
    setProcessing(true);
    try {
      await api.post(`/inventory/items/${item._id}/allocate`, { allocations: validAllocations });
      toast.success('Asset distribution updated');
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating distribution');
    } finally {
      setProcessing(false);
    }
  };

  const updateAllocation = (index, field, value) => {
    const newAlloc = [...allocations];
    newAlloc[index][field] = value;
    setAllocations(newAlloc);
  };

  const addAllocation = () => {
    setAllocations([...allocations, { location: '', quantity: 0 }]);
  };

  const removeAllocation = (index) => {
    const newAlloc = [...allocations];
    newAlloc.splice(index, 1);
    setAllocations(newAlloc);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] animate-slide-up relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
          ✕
        </button>
        
        <h3 className="text-3xl font-serif text-white mb-2">Distribute Asset</h3>
        <p className="text-[#c49a5b] text-[10px] uppercase tracking-[0.2em] font-bold mb-6">Allocate {item.name} to spatial zones</p>

        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 mb-6 text-center shadow-inner">
          <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Total Available Units</div>
          <div className="text-4xl font-black text-white">{item.quantity}</div>
          <div className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${remaining < 0 ? 'text-red-400' : remaining === 0 ? 'text-emerald-400' : 'text-[#c49a5b]'}`}>
            {remaining} Units Remaining to Assign
          </div>
        </div>

        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto inventory-scrollbar pr-2">
          {allocations.map((alloc, idx) => (
            <div key={idx} className="flex gap-2 items-center bg-white/5 p-2 rounded-xl border border-white/5">
              <select 
                className="flex-1 bg-transparent text-white/80 text-sm font-bold border-none focus:ring-0 outline-none px-2"
                value={alloc.location}
                onChange={e => updateAllocation(idx, 'location', e.target.value)}
              >
                <option value="" className="bg-[#1a1a1a]">Select Location</option>
                {LOCATIONS.map(loc => <option key={loc} value={loc} className="bg-[#1a1a1a]">{loc}</option>)}
              </select>
              <div className="w-[1px] h-6 bg-white/10"></div>
              <input 
                type="number" 
                className="w-16 bg-transparent text-center text-white text-lg font-black border-none focus:ring-0 outline-none"
                value={alloc.quantity}
                min="0"
                onChange={e => updateAllocation(idx, 'quantity', e.target.value)}
              />
              <button onClick={() => removeAllocation(idx)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                ✕
              </button>
            </div>
          ))}
        </div>

        <button onClick={addAllocation} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-white/40 hover:text-white hover:border-white/40 text-[9px] font-bold uppercase tracking-widest transition-colors mb-8 flex items-center justify-center gap-2">
          <span>＋</span> Add Another Zone
        </button>

        <div className="flex gap-4">
          <button 
            onClick={handleSave}
            disabled={processing || remaining < 0}
            className="flex-1 py-4 bg-gradient-to-r from-[#d1a66a] to-[#b78645] text-[#1a1a1a] font-bold uppercase tracking-widest text-xs rounded-xl shadow-[0_10px_20px_rgba(196,154,91,0.3)] hover:shadow-[0_15px_30px_rgba(196,154,91,0.5)] active:scale-95 disabled:opacity-50 transition-all"
          >
            {processing ? 'Saving...' : 'Deploy Assets'}
          </button>
        </div>
      </div>
    </div>
  );
}
