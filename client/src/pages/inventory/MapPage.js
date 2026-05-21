import React, { useState, useEffect } from 'react';
import { Map, MapPin, Box, Activity } from 'lucide-react';
import api from '../../utils/api';

const ZONES = [
  { id: 'media_cabin', name: 'CFFA Media Cabin', color: '#3b82f6', x: 25, y: 35, radius: 150 },
  { id: 'stage', name: 'Stage', color: '#a855f7', x: 75, y: 35, radius: 150 },
  { id: 'underground', name: 'Underground', color: '#10b981', x: 25, y: 75, radius: 150 },
  { id: 'kids', name: 'Kids Koinonia', color: '#f43f5e', x: 75, y: 75, radius: 150 }
];

export default function MapPage() {
  const [items, setItems] = useState([]);
  const [activeZone, setActiveZone] = useState('media_cabin');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get('/inventory/items/all-light');
        setItems(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getItemsInZone = (zoneId) => {
    return items.map(item => {
      // Check allocations first
      if (item.allocations && item.allocations.length > 0) {
        const alloc = item.allocations.find(a => {
          const l = (a.location || '').toLowerCase();
          if (zoneId === 'media_cabin') return !l.includes('underground') && !l.includes('storage') && !l.includes('kids') && !l.includes('koinonia') && !l.includes('stage');
          if (zoneId === 'stage') return l.includes('stage');
          if (zoneId === 'underground') return l.includes('underground') || l.includes('storage') || l.includes('cabin/under');
          if (zoneId === 'kids') return l.includes('kids') || l.includes('koinonia');
          return false;
        });
        
        if (alloc) return { ...item, displayQuantity: alloc.quantity, displayLocation: alloc.location };
        return null; // Not in this zone
      } else {
        // Fallback to primary location
        const l = (item.location || '').toLowerCase();
        let matches = false;
        if (zoneId === 'media_cabin') {
          matches = !l.includes('underground') && !l.includes('storage') && !l.includes('kids') && !l.includes('koinonia') && !l.includes('stage');
        } else if (zoneId === 'stage') {
          matches = l.includes('stage');
        } else if (zoneId === 'underground') {
          matches = l.includes('underground') || l.includes('storage') || l.includes('cabin/under');
        } else if (zoneId === 'kids') {
          matches = l.includes('kids') || l.includes('koinonia');
        }
        
        if (matches) return { ...item, displayQuantity: item.quantity, displayLocation: item.location };
        return null;
      }
    }).filter(i => i !== null);
  };

  const activeItems = getItemsInZone(activeZone);

  return (
    <div className="space-y-8 pb-20 fade-in h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-6 shrink-0">
        <div className="animate-slide-right">
          <h2 className="text-[40px] font-serif text-white tracking-tight leading-none mb-2 flex items-center gap-4">
            Spatial <span className="text-[#c49a5b] italic">Map</span>
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">Interactive 2D Asset Tracking</p>
        </div>
        <div className="flex items-center gap-2 animate-slide-left">
           <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
             <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Sensors Active</span>
           </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        
        {/* Spatial Floorplan Viewer */}
        <div className="lg:col-span-8 bg-[#0a0a0a]/80 backdrop-blur-xl rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col animate-slide-up hover-lux group">
           {/* Grid Background */}
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           
           <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0 relative z-10">
             <div className="flex gap-2">
                {ZONES.map(z => (
                  <button key={z.id} onClick={() => setActiveZone(z.id)} className={`px-6 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${activeZone === z.id ? 'bg-white text-[#111]' : 'bg-black/50 text-white/50 hover:bg-white/10'}`}>
                    {z.name}
                  </button>
                ))}
             </div>
             <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 cursor-pointer hover:bg-white/10 transition-colors"><Map className="w-4 h-4" /></div>
             </div>
           </div>

           <div className="flex-1 relative z-10 w-full h-full flex items-center justify-center p-10">
              {/* Radar Sweep Effect */}
              <div className="absolute w-[200%] h-[200%] rounded-full border border-white/5 animate-spin-slow pointer-events-none opacity-20" style={{ backgroundImage: 'conic-gradient(from 0deg, transparent 70%, rgba(196,154,91,0.5) 100%)' }}></div>

              {/* Render Zones */}
              <div className="relative w-full h-full max-w-2xl max-h-[500px]">
                 {ZONES.map(zone => {
                    const isActive = activeZone === zone.id;
                    const itemsInThisZone = getItemsInZone(zone.id);
                    return (
                      <div 
                        key={zone.id}
                        onClick={() => setActiveZone(zone.id)}
                        className={`absolute rounded-[3rem] border border-white/10 flex flex-col items-center justify-center cursor-pointer transition-all duration-700 backdrop-blur-md overflow-hidden ${isActive ? 'bg-white/5 shadow-[0_0_50px_rgba(255,255,255,0.05)]' : 'bg-black/80 opacity-50 scale-95'}`}
                        style={{
                          left: `${zone.x}%`,
                          top: `${zone.y}%`,
                          width: `${zone.radius}px`,
                          height: `${zone.radius}px`,
                          transform: 'translate(-50%, -50%)',
                          boxShadow: isActive ? `0 0 40px ${zone.color}20` : 'none',
                          borderColor: isActive ? `${zone.color}50` : 'rgba(255,255,255,0.1)'
                        }}
                      >
                        <div className="absolute top-0 right-0 p-2"><MapPin className="w-4 h-4 opacity-50" style={{ color: zone.color }} /></div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 mb-1 text-center px-4 leading-relaxed">{zone.name}</span>
                        <span className="text-3xl font-serif text-white">{itemsInThisZone.length}</span>
                        <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-1">Assets Detected</span>
                      </div>
                    )
                 })}
              </div>
           </div>
        </div>

        {/* Live Asset Telemetry Sidebar */}
        <div className="lg:col-span-4 bg-[#111111]/90 backdrop-blur-xl rounded-[3rem] border border-white/5 shadow-xl flex flex-col animate-slide-up delay-200">
           <div className="p-8 border-b border-white/5 shrink-0">
             <h3 className="text-xl font-serif text-white mb-2">Live Telemetry</h3>
             <p className="text-[9px] uppercase tracking-[0.2em] text-[#c49a5b] font-bold">{ZONES.find(z => z.id === activeZone)?.name || 'Zone'}</p>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-3 inventory-scrollbar">
              {loading ? (
                 <div className="flex items-center justify-center h-40">
                   <Activity className="w-8 h-8 text-[#c49a5b] animate-spin" />
                 </div>
              ) : activeItems.length === 0 ? (
                 <div className="text-center p-10 text-white/30 text-[10px] uppercase font-bold tracking-widest">No assets detected in this zone.</div>
              ) : (
                  activeItems.slice(0, 15).map((item, idx) => (
                   <div key={item._id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 transition-colors animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                      <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0 border border-white/10 shadow-inner text-[#c49a5b]">
                         <Box className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                         <p className="text-[9px] text-white/40 uppercase tracking-widest truncate">{item.sku} • {item.displayQuantity} Units</p>
                      </div>
                      <div className="shrink-0 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
                   </div>
                 ))
              )}
           </div>
           <div className="p-4 border-t border-white/5 text-center shrink-0">
             <span className="text-[8px] text-white/20 uppercase tracking-widest font-bold">Showing {Math.min(activeItems.length, 15)} of {activeItems.length} assets</span>
           </div>
        </div>

      </div>
    </div>
  );
}
