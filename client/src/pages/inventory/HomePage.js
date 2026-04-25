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
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    setNoResults(false);
    try {
      const params = { search: searchTerm.trim() };
      const res = await api.get('/inventory/items', { params });
      setSearchResults(res.data);
      setNoResults(res.data.length === 0);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
      setNoResults(true);
    } finally {
      setSearchLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-transparent">


      {/* Header with Search - container box removed */}
      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-6">
            <div className="flex-1 mb-6 lg:mb-0">
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-2">Inventory Overview</h1>
              <p className="text-lg text-slate-600 dark:text-gray-300">Quick access to church resources</p>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2 w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 max-w-md px-4 py-3 glass-liquid !bg-white/10 border-white/10 !text-slate-800 dark:!text-white rounded-xl focus:!border-white/50 transition-all outline-none"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold uppercase tracking-widest hover:bg-white/80 dark:bg-white/10 hover:text-slate-500 dark:text-gray-400 rounded-xl transition-all whitespace-nowrap shadow-lg active:scale-95"
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

          <div className="glass-liquid p-6 mb-8 rounded-2xl shadow-sm backdrop-blur-sm border border-slate-300 dark:border-white/20">

            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => { setSearchTerm(''); setSearchResults([]); setNoResults(false); }} className="text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:text-white -ml-2">
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex-1">Search Results</h2>
            </div>
            {noResults ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 text-slate-500 dark:text-gray-400">🔍</div>
                <h3 className="text-xl font-bold text-slate-600 dark:text-gray-300 mb-2">No items found</h3>
                <p className="text-gray-500 mb-6">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map(item => (
                  <div key={item._id} className="glass-liquid p-6 rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all group">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover rounded-xl mb-4 group-hover:scale-[1.02] transition-transform" />}
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">{item.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-gray-300 mb-2">{item.category} • {item.location || 'No location'}</p>
                    <div className="font-bold text-slate-800 dark:text-white mb-3">{item.quantity} units</div>
                    {item.quantity <= item.lowStockThreshold && <span className="badge bg-red-900/50 text-red-300 mb-4">Low Stock</span>}
                    <Link to={`/inventory/items/${item._id}`} className="btn-primary w-full block text-center">View Details</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Stats Cards */}

      {/* Stats Cards */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">At a Glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="p-5 md:p-8 glass-liquid rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex md:block items-center gap-4 md:gap-0">
              <div className="text-3xl md:text-4xl md:mb-4 text-slate-600">📦</div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-0.5">{quickStats.totalItems}</div>
                <div className="text-[10px] md:text-sm text-slate-600 dark:text-gray-300 uppercase tracking-widest font-bold">Total Items</div>
              </div>
            </div>
            <div className="p-5 md:p-8 glass-liquid rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex md:block items-center gap-4 md:gap-0">
              <div className="text-3xl md:text-4xl md:mb-4 text-amber-500">⚠️</div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-0.5">{quickStats.lowStock}</div>
                <div className="text-[10px] md:text-sm text-slate-600 dark:text-gray-300 uppercase tracking-widest font-bold">Low Stock</div>
              </div>
            </div>
            <div className="p-5 md:p-8 glass-liquid rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex md:block items-center gap-4 md:gap-0">
              <div className="text-3xl md:text-4xl md:mb-4 text-blue-600">🔧</div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-0.5">{quickStats.openMaintenance}</div>
                <div className="text-[10px] md:text-sm text-slate-600 dark:text-gray-300 uppercase tracking-widest font-bold">Maintenance</div>
              </div>
            </div>
            <div className="p-5 md:p-8 glass-liquid rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex md:block items-center gap-4 md:gap-0">
              <div className="text-3xl md:text-4xl md:mb-4 text-emerald-600">📊</div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-0.5">{quickStats.thisMonthUsage}</div>
                <div className="text-[10px] md:text-sm text-slate-600 dark:text-gray-300 uppercase tracking-widest font-bold">This Month</div>
              </div>
            </div>
          </div>
        </section>

        {/* Priority Items */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-8">Priority Items</h2>
          <div className="space-y-4">
            {priorityItems.length > 0 ? (
              priorityItems.map((item, index) => (
                <Link
                  to="/inventory/items"
                  key={item.name}
                  className="group flex items-center gap-4 p-6 glass-liquid rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-sm group-hover:scale-[1.05] transition-transform">
                    <span className={`text-2xl font-bold ${item.priority === 'High' ? 'text-rose-600' :
                        item.priority === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-slate-800 dark:text-white">{item.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-gray-300 capitalize">{item.status}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${item.priority === 'High' ? 'bg-rose-100 text-rose-800' :
                      item.priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                    {item.priority}
                  </div>
                  <div className="w-6 h-6 text-slate-400 group-hover:translate-x-1 transition-transform">→</div>
                </Link>
              ))
            ) : (
              <div className="p-8 glass-liquid rounded-2xl text-center py-12">
                <div className="text-6xl mb-4 text-slate-500 dark:text-gray-400">✅</div>
                <h3 className="text-xl font-bold text-slate-600 dark:text-gray-300 mb-2">All Good!</h3>
                <p className="text-gray-500 mb-6">No priority items. Everything is stocked and maintained.</p>
                <Link to="/inventory/items" className="inline-flex items-center gap-2 px-6 py-3 glass-liquid text-slate-800 dark:text-white rounded-xl font-semibold hover:shadow-md transition-all backdrop-blur-sm border border-slate-300 dark:border-white/20">
                  <span>View All Items</span>
                  <span>→</span>
                </Link>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}



