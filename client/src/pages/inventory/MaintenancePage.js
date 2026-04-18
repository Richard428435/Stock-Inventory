import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import MaintenanceModal from '../../components/inventory/MaintenanceModal';

// --- Components ---

function MaintenanceCard({ log, onEdit, onDelete }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  const statusColors = { 
    Pending: 'bg-white/80 dark:bg-white/10 text-slate-800 dark:text-white border-slate-300 dark:border-white/20', 
    'In Progress': 'bg-white text-slate-900', 
    Completed: 'bg-white/60 dark:bg-white/5 text-slate-500 dark:text-white/40 border-white/5' 
  };

  const typeIcons = {
    Repair: '🔧',
    Service: '⚙️',
    Inspection: '🔍',
    Replacement: '♻️'
  };

  return (
    <div className="glass-liquid rounded-[2rem] border border-slate-200 dark:border-white/10 p-6 flex flex-col h-full hover:border-slate-300 dark:border-white/20 transition-all duration-500 group">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{log.type}</span>
          <h4 className="text-xl font-black text-slate-800 dark:text-white leading-tight">{log.itemName || log.item?.name || 'Unknown Asset'}</h4>
        </div>
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[log.status] || ''}`}>
          {log.status}
        </span>
      </div>

      <div className="flex-1 space-y-4">
        <p className="text-white/60 text-sm line-clamp-2 italic leading-relaxed">
          "{log.description || 'No detailed problem description provided for this ticket.'}"
        </p>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <span className="block text-[9px] font-bold text-white/20 uppercase tracking-widest">Technician</span>
            <span className="block text-slate-800 dark:text-white text-sm font-bold">{log.technician || 'Awaiting Assignee'}</span>
          </div>
          <div className="space-y-1">
            <span className="block text-[9px] font-bold text-white/20 uppercase tracking-widest">Est. Cost</span>
            <span className="block text-slate-800 dark:text-white text-sm font-mono font-black">₹{log.cost || '0.00'}</span>
          </div>
          <div className="space-y-1">
            <span className="block text-[9px] font-bold text-white/20 uppercase tracking-widest">Scheduled</span>
            <span className="block text-slate-500 dark:text-white/40 text-[11px] font-bold tracking-tight">
              {log.scheduledDate ? format(new Date(log.scheduledDate), 'dd MMM yyyy') : 'Date not set'}
            </span>
          </div>
          <div className="space-y-1">
            <span className="block text-[9px] font-bold text-white/20 uppercase tracking-widest">Ref ID</span>
            <span className="block text-white/20 font-mono text-[10px] truncate">#{log._id.slice(-8)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5">
        {!showConfirmDelete ? (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onEdit(log)} className="flex-1 py-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/5 hover:bg-white hover:text-slate-900 text-slate-800 dark:text-white text-[10px] font-bold uppercase tracking-[0.15em] transition-all active:scale-95 shadow-lg">
              Manage
            </button>
            <button onClick={() => setShowConfirmDelete(true)} className="flex-1 py-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/5 hover:bg-red-500 hover:text-slate-800 dark:text-white text-red-400 text-[10px] font-bold uppercase tracking-[0.15em] transition-all active:scale-95 shadow-lg">
              Remove
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 animate-fadeIn">
            <button onClick={() => onDelete(log._id)} className="flex-1 py-3 rounded-2xl bg-red-500 text-slate-800 dark:text-white text-[10px] font-bold uppercase tracking-[0.15em] transition-all active:scale-95 shadow-lg">
              Confirm
            </button>
            <button onClick={() => setShowConfirmDelete(false)} className="flex-1 py-3 rounded-2xl bg-white/80 dark:bg-white/10 text-slate-800 dark:text-white text-[10px] font-bold uppercase tracking-[0.15em] transition-all active:scale-95 shadow-lg">
              Keep
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Page ---

export default function MaintenancePage() {
  const [logs, setLogs] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [editLog, setEditLog] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [logsRes, itemsRes] = await Promise.all([
        api.get('/inventory/maintenance', { params: statusFilter ? { status: statusFilter } : {} }),
        api.get('/inventory/items')
      ]);
      setLogs(logsRes.data);
      setItems(itemsRes.data);
    } catch (err) {
      toast.error('Failed to synchronize registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/inventory/maintenance/${id}`);
      toast.success('Record Removed');
      load();
    } catch (err) { toast.error('Error removing record'); }
  };

  return (
    <div className="space-y-10 pb-20 fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header & Controls */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight italic">Maintenance <span className="not-italic text-gradient">Registry</span></h2>
            <p className="text-slate-500 dark:text-gray-400 text-sm font-medium tracking-wide">Orchestrating asset longevity and operational integrity.</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-8 py-4 rounded-2xl glass-liquid text-slate-800 dark:text-white font-black uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 active:scale-95 transition-all text-xs group shadow-2xl">
            <span className="text-xl group-hover:rotate-12 transition-transform">➕</span> New Ticket
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {['', 'Pending', 'In Progress', 'Completed'].map(s => (
            <button 
              key={s} 
              onClick={() => setStatusFilter(s)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${statusFilter === s ? 'bg-white text-slate-900 border-white' : 'bg-white/60 dark:bg-white/5 text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/10 hover:border-slate-400 dark:border-white/30'}`}
            >
              {s || 'All Activity'}
            </button>
          ))}
        </div>
      </section>

      {/* Main Registry Grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => <div key={n} className="glass-card h-80 animate-pulse bg-white/60 dark:bg-white/5 rounded-[2rem]" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="glass-card p-20 flex flex-col items-center justify-center text-center rounded-[3rem] border-dashed border-white/5">
             <div className="w-20 h-20 rounded-full bg-white/60 dark:bg-white/5 flex items-center justify-center text-4xl mb-4 opacity-50 shadow-inner">📔</div>
             <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest">Register Empty</h3>
             <p className="text-gray-500 mt-2 max-w-xs mx-auto text-sm leading-relaxed tracking-tight">All assets are currently operational or no tickets have been filed in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {logs.map(log => (
              <MaintenanceCard 
                key={log._id} 
                log={log} 
                onEdit={setEditLog} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      {(showAdd || editLog) && (
        <MaintenanceModal 
          log={editLog} 
          items={items} 
          onClose={() => { setShowAdd(false); setEditLog(null); }} 
          onSave={load} 
        />
      )}

      {/* Background Aesthetic */}
      <div className="fixed bottom-10 right-10 opacity-[0.03] select-none pointer-events-none font-black text-[12rem] text-slate-800 dark:text-white tracking-tighter -rotate-90 origin-bottom-right">
        SERVICE
      </div>
    </div>
  );
}

