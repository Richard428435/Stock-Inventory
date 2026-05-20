import React, { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const REASONS = ['Purchase', 'Usage', 'Damage', 'Transfer', 'Adjustment'];

export default function AdjustModal({ item, onClose, onDone }) {
  const [form, setForm] = useState({ action: 'Increase', quantity: 1, reason: 'Purchase', notes: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/inventory/items/${item._id}/adjust`, form);
      toast.success('Stock updated');
      onDone();
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0a0a0a]/95 backdrop-blur-3xl p-8 max-w-md w-full mx-4 rounded-3xl border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Adjust Stock</h3>
        <p className="text-slate-500 dark:text-gray-400 text-sm mb-6 flex items-center justify-between">
          <span>{item.name}</span>
          <span className="bg-white/60 dark:bg-white/5 px-3 py-1 rounded-full text-slate-800 dark:text-white font-mono">Qty: {item.quantity}</span>
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-3">
            {['Increase', 'Decrease'].map(a => (
              <button key={a} type="button" onClick={() => setForm(f => ({ ...f, action: a }))}
                className={`flex-1 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border ${form.action === a ? (a === 'Increase' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-red-500/20 border-red-500/50 text-red-400') : 'bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 text-gray-500'}`}>
                {a === 'Increase' ? '▲' : '▼'} {a}
              </button>
            ))}
          </div>

          <div>
             <label className="label">Adjustment Amount</label>
             <input type="number" className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-14 rounded-2xl text-center text-xl font-bold" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Math.max(1, parseInt(e.target.value) || 0) }))} min="1" required />
          </div>

          <div>
            <label className="label">Reason</label>
            <select className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}>
              {REASONS.map(r => <option key={r} className="bg-[#1a0840]">{r}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Notes</label>
            <input className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." />
          </div>

          <div className="flex gap-4 pt-2">
            <button type="submit" disabled={saving} className={`flex-1 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 ${form.action === 'Increase' ? 'bg-gradient-to-r from-green-600 to-green-400 text-slate-800 dark:text-white shadow-green-500/20' : 'bg-gradient-to-r from-red-600 to-red-400 text-slate-800 dark:text-white shadow-red-500/20'}`}>
              {saving ? 'Saving...' : `Confirm ${form.action}`}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-4 rounded-2xl bg-white/60 dark:bg-white/5 hover:bg-white hover:text-slate-900 text-slate-600 dark:text-gray-300 font-bold uppercase tracking-widest transition-all">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
