import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setNoResults(false);
      return;
    }
    setSearchLoading(true);
    setNoResults(false);
    try {
      const params = { search: searchTerm.trim() };
      const res = await api.get('/inventory/items', { params });
      const items = res.data.items || res.data;
      setSearchResults(items);
      setNoResults(items.length === 0);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
      setNoResults(true);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
        setNoResults(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const [quickStats, setQuickStats] = useState({
    totalItems: 0,
    lowStock: 0,
    openMaintenance: 0,
    thisMonthUsage: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        console.log('Fetching stats...');
        const res = await api.get('/inventory/items/stats');
        console.log('Stats response:', res.data);
        setQuickStats(res.data);
        setPriorityItems(res.data.priorityItems || []);
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    };
    loadStats();
  }, []);

  const [priorityItems, setPriorityItems] = useState([]);

  // Mock Real-Time Activity Feed for Dashboard
  const [activities, setActivities] = useState([
    { id: 1, user: 'CFFA Systems', action: 'Automated Backup Completed', time: 'Just now', icon: 'server' },
    { id: 2, user: 'CFFA Volunteer', action: 'Scanned in 5x Communion Trays', time: '2m ago', icon: 'scan' },
    { id: 3, user: 'CFFA Media Team', action: 'Flagged Projector A for Maintenance', time: '15m ago', icon: 'alert' }
  ]);

  useEffect(() => {
    const mockEvents = [
      { user: 'CFFA Admin', action: 'Updated stock thresholds', icon: 'settings' },
      { user: 'CFFA Production', action: 'Checked out Sony A7S III', icon: 'camera' },
      { user: 'CFFA Coordinator', action: 'Completed Sanctuary Audit', icon: 'check' },
      { user: 'Sacred Copilot', action: 'Generated predictive restock report', icon: 'sparkles' },
    ];
    let counter = 4;
    const interval = setInterval(() => {
      const event = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      setActivities(prev => [{ id: counter++, user: event.user, action: event.action, time: 'Just now', icon: event.icon }, ...prev.slice(0, 4)]);
    }, 12000); // Trigger a new event every 12 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-transparent">


      {/* Header with Search */}
      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-6">
            <div className="flex-1 mb-6 lg:mb-0 animate-slide-right">
              <h1 className="text-[32px] lg:text-[40px] font-serif text-white mb-2 tracking-tight">
                Inventory <span className="text-[#c49a5b] italic font-medium">Overview</span>
              </h1>
              <p className="text-[10px] text-white/50 uppercase tracking-[0.3em] font-bold">Quick access to church resources</p>
            </div>
            <form onSubmit={handleSearch} className="flex gap-3 w-full lg:w-auto animate-scale-in delay-200">
              <div className="relative flex-1 max-w-md group">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-[#c49a5b]/30 to-transparent rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="relative w-full px-5 py-4 bg-[#111111]/80 backdrop-blur-xl border border-white/10 text-white placeholder-white/30 rounded-2xl focus:border-[#c49a5b]/60 transition-all outline-none font-medium text-[13px]"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-b from-[#d1a66a] to-[#b78645] hover:from-[#e8bd7f] hover:to-[#c49652] text-[#1a1a1a] font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all shadow-[0_4px_15px_rgba(0,0,0,0.5)] active:scale-95"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>


      {searchLoading && <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center py-12">
          <div className="animate-spin-slow w-16 h-16 border-4 border-primary-200 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-800 dark:text-white text-lg">Searching items...</p>
        </div>
      </div>}

      {(!searchLoading && (searchResults.length > 0 || noResults)) && (
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <div className="bg-[#0a0a0a]/80 backdrop-blur-md p-8 mb-8 rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] border border-white/5">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => { setSearchTerm(''); setSearchResults([]); setNoResults(false); }} className="text-white/40 hover:text-[#c49a5b] transition-colors -ml-2 text-sm font-bold uppercase tracking-widest">
                ← Back
              </button>
              <h2 className="text-2xl font-serif text-white flex-1">Search <span className="text-[#c49a5b] italic">Results</span></h2>
            </div>
            {noResults ? (
              <div className="text-center py-16">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-serif text-[#eaddcf] mb-2">No items found</h3>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((item, idx) => (
                  <div key={item._id} className="bg-[#111111]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/5 hover:border-[#c49a5b]/40 hover:shadow-[0_10px_30px_rgba(196,154,91,0.1)] group transition-all duration-500 animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover rounded-2xl mb-5 group-hover:scale-[1.02] transition-transform duration-700 opacity-80 group-hover:opacity-100" />}
                    <h3 className="font-bold text-lg text-[#eaddcf] mb-2 font-serif">{item.name}</h3>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-4">{item.category} • {item.location || 'No location'}</p>
                    <div className="flex justify-between items-center mb-5">
                      <div className="font-serif text-2xl text-[#c49a5b]">{item.quantity} <span className="text-[10px] text-white/30 uppercase tracking-widest font-sans">Units</span></div>
                      {item.quantity <= item.lowStockThreshold && <span className="px-3 py-1 rounded-full bg-red-900/30 text-red-400 text-[9px] font-bold uppercase tracking-widest border border-red-500/20">Low Stock</span>}
                    </div>
                    <Link to={`/inventory/items/${item._id}`} className="block w-full py-3 bg-white/5 hover:bg-[#c49a5b]/20 text-white hover:text-[#c49a5b] text-center rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all border border-transparent hover:border-[#c49a5b]/30">View Details</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-10">
        
        {/* Command Launchpad */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
          <Link to="/inventory/audit" className="glass-liquid p-6 rounded-3xl flex flex-col items-center justify-center gap-3 hover-lux group border border-white/5 hover:border-emerald-500/30">
             <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
             <span className="text-[10px] font-bold text-white uppercase tracking-widest">Rapid Audit</span>
          </Link>
          <Link to="/inventory/barcodes" className="glass-liquid p-6 rounded-3xl flex flex-col items-center justify-center gap-3 hover-lux group border border-white/5 hover:border-blue-500/30">
             <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg></div>
             <span className="text-[10px] font-bold text-white uppercase tracking-widest">Print Matrices</span>
          </Link>
          <Link to="/inventory/map" className="glass-liquid p-6 rounded-3xl flex flex-col items-center justify-center gap-3 hover-lux group border border-white/5 hover:border-purple-500/30">
             <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg></div>
             <span className="text-[10px] font-bold text-white uppercase tracking-widest">Spatial Map</span>
          </Link>
          <button onClick={() => document.getElementById('copilot-trigger')?.click()} className="glass-liquid p-6 rounded-3xl flex flex-col items-center justify-center gap-3 hover-lux group border border-white/5 hover:border-[#c49a5b]/30">
             <div className="w-12 h-12 rounded-full bg-[#c49a5b]/10 flex items-center justify-center text-[#c49a5b] group-hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
             <span className="text-[10px] font-bold text-white uppercase tracking-widest">AI Diagnostics</span>
          </button>
        </section>

        {/* Fleet Health & Stats Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up delay-100">
           {/* Fleet Health Radar */}
           <div className="lg:col-span-4 bg-[#0a0a0a]/80 backdrop-blur-md rounded-[3rem] p-8 border border-white/5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
              <div className="absolute top-0 right-0 p-6"><span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span></div>
              <h3 className="absolute top-8 left-8 text-[10px] uppercase font-bold tracking-[0.2em] text-white/50">Fleet Health</h3>
              
              <div className="relative w-48 h-48 flex items-center justify-center mt-4">
                 <div className="absolute inset-0 rounded-full border border-white/5 animate-spin-slow pointer-events-none"></div>
                 <div className="absolute inset-4 rounded-full border border-white/10 border-t-[#c49a5b] animate-spin pointer-events-none" style={{ animationDuration: '3s' }}></div>
                 <div className="absolute inset-8 rounded-full border border-white/5 border-b-emerald-500 animate-spin pointer-events-none" style={{ animationDuration: '4s', animationDirection: 'reverse' }}></div>
                 <div className="absolute inset-12 rounded-full bg-[#111] shadow-inner flex flex-col items-center justify-center z-10 border border-white/10">
                    <span className="text-5xl font-serif text-white tracking-tighter">98<span className="text-xl text-[#c49a5b]">%</span></span>
                 </div>
              </div>
              <p className="mt-8 text-[9px] uppercase tracking-widest font-bold text-emerald-500/70">Optimal Performance Parameters</p>
           </div>

           {/* Stats Cards */}
           <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/inventory/items" className="p-8 bg-[#0a0a0a]/80 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] hover:border-[#c49a5b]/30 group transition-all duration-500 flex items-center gap-6 relative overflow-hidden hover-lux">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c49a5b]/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#c49a5b]/10 transition-colors duration-500"></div>
              <div className="text-[#c49a5b] animate-float-lux">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <div>
                <div className="text-4xl font-serif text-white mb-1 leading-none group-hover:scale-[1.02] transition-transform">{quickStats.totalItems}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Total Fleet Assets</div>
              </div>
            </Link>
            
            <Link to="/inventory/items?filter=low_stock" className="p-8 bg-[#0a0a0a]/80 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] hover:border-amber-500/30 group transition-all duration-500 flex items-center gap-6 relative overflow-hidden hover-lux">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-500"></div>
              <div className="text-amber-500 animate-float-lux" style={{ animationDelay: '0.5s' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <div className="text-4xl font-serif text-white mb-1 leading-none group-hover:scale-[1.02] transition-transform">{quickStats.lowStock}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Low Stock Alerts</div>
              </div>
            </Link>

            <Link to="/inventory/maintenance" className="p-8 bg-[#0a0a0a]/80 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] hover:border-blue-400/30 group transition-all duration-500 flex items-center gap-6 relative overflow-hidden hover-lux">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-400/10 transition-colors duration-500"></div>
              <div className="text-blue-400 animate-float-lux" style={{ animationDelay: '1s' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <div className="text-4xl font-serif text-white mb-1 leading-none group-hover:scale-[1.02] transition-transform">{quickStats.openMaintenance}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Active Maintenance</div>
              </div>
            </Link>

            <Link to="/inventory/stock-logs" className="p-8 bg-[#0a0a0a]/80 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] hover:border-emerald-500/30 group transition-all duration-500 flex items-center gap-6 relative overflow-hidden hover-lux">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
              <div className="text-emerald-500 animate-float-lux" style={{ animationDelay: '1.5s' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div>
                <div className="text-4xl font-serif text-white mb-1 leading-none group-hover:scale-[1.02] transition-transform">{quickStats.thisMonthUsage}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Monthly Velocity</div>
              </div>
            </Link>
           </div>
        </section>

        {/* Two Column Layout for Priorities & Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up delay-200">
           
           {/* Left Column: Priority & Server Load */}
           <div className="lg:col-span-7 space-y-8">
              <div className="bg-[#0a0a0a]/80 backdrop-blur-md p-8 rounded-[3rem] border border-white/5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                  <h2 className="text-xl font-serif text-white">Priority <span className="text-[#c49a5b] italic">Queue</span></h2>
                </div>
                <div className="space-y-3">
                  {priorityItems.length > 0 ? (
                    priorityItems.map((item, index) => (
                      <Link to="/inventory/items" key={item.name} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-transparent hover:border-white/10 transition-colors group">
                        <div className="flex items-center gap-4">
                          <span className={`font-serif text-lg ${item.priority === 'High' ? 'text-rose-400' : 'text-amber-400'}`}>0{index + 1}</span>
                          <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-[#c49a5b] transition-colors">{item.name}</h4>
                            <p className="text-[9px] uppercase tracking-widest text-white/40">{item.status}</p>
                          </div>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white/5 text-[8px] font-bold uppercase tracking-widest text-white/60">{item.priority}</div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-10 text-white/30 text-[10px] uppercase font-bold tracking-widest">Queue Clear</div>
                  )}
                </div>
              </div>

              {/* Server Load Simulation */}
              <div className="bg-[#0a0a0a]/80 backdrop-blur-md p-8 rounded-[3rem] border border-white/5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)]">
                 <div className="flex justify-between items-end mb-6">
                   <div>
                     <h2 className="text-xl font-serif text-white mb-1">System <span className="text-[#c49a5b] italic">Velocity</span></h2>
                     <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Weekly Checkouts & Activity</p>
                   </div>
                   <div className="text-right">
                     <span className="text-2xl font-serif text-white">1,204</span>
                     <p className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold">+14% vs Last Week</p>
                   </div>
                 </div>
                 
                 <div className="h-32 flex items-end justify-between gap-2 pt-4">
                    {[40, 70, 45, 90, 65, 80, 50].map((height, i) => (
                      <div key={i} className="w-full bg-white/5 rounded-t-xl relative group hover:bg-white/10 transition-colors flex items-end">
                        <div className="w-full bg-gradient-to-t from-[#c49a5b]/20 to-[#c49a5b] rounded-t-xl transition-all duration-1000 delay-300" style={{ height: `${height}%` }}></div>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-bold text-white bg-black/80 px-2 py-1 rounded shadow-lg">{height}</div>
                      </div>
                    ))}
                 </div>
                 <div className="flex justify-between mt-3 text-[8px] uppercase tracking-widest text-white/30 font-bold">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                 </div>
              </div>
           </div>

           {/* Right Column: Live Activity */}
           <div className="lg:col-span-5">
              <div className="bg-[#0a0a0a]/80 backdrop-blur-md rounded-[3rem] border border-white/5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] p-8 h-full">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-serif text-white">Live <span className="text-[#c49a5b] italic">Activity</span></h2>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-400">Syncing</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-4 p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-500 animate-slide-up group">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-white/10 flex items-center justify-center text-white/40 shadow-inner group-hover:text-[#c49a5b] transition-colors mt-1">
                        {activity.icon === 'server' && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>}
                        {activity.icon === 'scan' && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>}
                        {activity.icon === 'alert' && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                        {activity.icon === 'settings' && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>}
                        {activity.icon === 'camera' && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>}
                        {activity.icon === 'check' && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                        {activity.icon === 'sparkles' && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#c49a5b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/90 truncate">{activity.action}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[9px] text-[#c49a5b] uppercase tracking-widest font-bold truncate">By {activity.user}</p>
                          <span className="text-[8px] text-white/30 font-bold tracking-widest uppercase shrink-0 whitespace-nowrap">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
           </div>

        </section>

      </div>
    </div>
  );
}



