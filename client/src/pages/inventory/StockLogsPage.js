import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function StockLogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    api.get('/inventory/stock-logs', { params: { page, limit } })
      .then(r => { 
        setLogs(r.data.logs); 
        setTotal(r.data.total); 
      })
      .catch(() => toast.error('Failed to load activity logs'))
      .finally(() => setLoading(false));
  }, [page]);

  // Monochrome Badge Logic
  const getActionStyle = a => a === 'Increase' 
    ? 'bg-white text-slate-900 shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
    : 'bg-white/80 dark:bg-white/10 text-slate-800 dark:text-white border border-slate-300 dark:border-white/20';

  const getReasonStyle = () => 'text-slate-500 dark:text-white/40 border border-white/5 bg-white/60 dark:bg-white/5';

  return (
    <div className="space-y-8 pb-20 fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Stock Logs</h2>
          <p className="text-[11px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-[0.3em]">Tracking {total} physical movements</p>
        </div>
        
        {/* Quick Stats Grid can be added here if needed in future */}
        <div className="flex items-center gap-3">
           <button onClick={() => window.location.reload()} className="p-3 rounded-2xl bg-white/60 dark:bg-white/5 text-slate-500 dark:text-white/40 hover:text-slate-800 dark:text-white transition-all border border-slate-200 dark:border-white/10">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
           </button>
        </div>
      </div>

      {/* Main Journal Table */}
      <div className="glass-liquid rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5">
                <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-white/30 uppercase tracking-wider">Item Details</th>
                <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-white/30 uppercase tracking-wider">Action</th>
                <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-white/30 uppercase tracking-wider text-center">Qty</th>
                <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-white/30 uppercase tracking-wider">Flow</th>
                <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-white/30 uppercase tracking-wider">Source / Reason</th>
                <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-white/30 uppercase tracking-wider">Recorded By</th>
                <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-white/30 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-20"><div className="animate-pulse text-white/20 font-bold uppercase tracking-widest">Accessing Logs...</div></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-20 text-white/20 font-medium">No activity records found in the current period.</td></tr>
              ) : logs.map(log => (
                <tr key={log._id} className="hover:bg-white/60 dark:bg-white/5 transition-colors group">
                  <td className="px-8 py-6 font-bold text-slate-800 dark:text-white text-sm tracking-tight">{log.itemName}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getActionStyle(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`text-lg font-black ${log.action === 'Increase' ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-white/40'}`}>
                      {log.action === 'Increase' ? '+' : '-'}{log.quantity}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-white/30 font-mono text-xs">
                       <span>{log.previousQty}</span>
                       <span className="text-white/10">→</span>
                       <span className="text-slate-800 dark:text-white font-bold">{log.newQty}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${getReasonStyle()}`}>
                      {log.reason}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-white/60 font-medium">{log.userName}</td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-slate-800 dark:text-white text-xs font-bold">{log.createdAt ? format(new Date(log.createdAt), 'dd MMM yyyy') : '—'}</span>
                      <span className="text-white/20 text-[10px] font-medium">{log.createdAt ? format(new Date(log.createdAt), 'HH:mm:ss') : ''}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Premium Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between px-10 py-8 border-t border-slate-200 dark:border-white/10 bg-white/[0.02]">
            <div className="flex flex-col">
              <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Log Page</span>
              <span className="text-slate-800 dark:text-white font-black text-lg">{page} <span className="text-white/10">/</span> {Math.ceil(total / limit)}</span>
            </div>
            
            <div className="flex gap-4">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)} 
                className="px-6 py-3 rounded-2xl bg-white/60 dark:bg-white/5 text-white/50 font-bold uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all disabled:opacity-20 disabled:pointer-events-none text-[10px]"
              >
                Previous
              </button>
              <button 
                disabled={page >= Math.ceil(total / limit)} 
                onClick={() => setPage(p => p + 1)} 
                className="px-6 py-3 rounded-2xl bg-white/60 dark:bg-white/5 text-white/50 font-bold uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all disabled:opacity-20 disabled:pointer-events-none text-[10px]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Aesthetic watermark */}
      <div className="text-center pt-10 opacity-5 select-none pointer-events-none font-black text-8xl text-slate-800 dark:text-white">
        ACTIVITY LOG
      </div>
    </div>
  );
}

