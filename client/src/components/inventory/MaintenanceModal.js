import React, { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function MaintenanceModal({ log, items, onClose, onSave }) {
  const [form, setForm] = useState(log || { 
    item: '', 
    itemName: '', 
    type: 'Repair', 
    status: 'Pending', 
    description: '', 
    technician: '', 
    cost: '', 
    scheduledDate: '', 
    completedDate: '',
    notes: '' 
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (log) await api.put(`/inventory/maintenance/${log._id}`, form);
      else await api.post('/inventory/maintenance', form);
      toast.success(log ? 'Record Updated' : 'Record Created');
      onSave();
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving maintenance record'); }
    finally { setSaving(false); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleItemChange = (id) => {
    const item = items.find(i => i._id === id);
    set('item', id);
    if (item) set('itemName', item.name);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0a0a0a]/95 backdrop-blur-3xl p-8 max-w-2xl w-full mx-4 rounded-3xl border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto inventory-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-slate-800 dark:text-white">{log ? 'Update Ticket' : 'Initiate Maintenance'}</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 dark:bg-white/5 hover:bg-transparent text-slate-500 dark:text-gray-400 hover:text-red-400 transition-all text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="label !text-slate-800 dark:!text-white">Affected Asset *</label>
              <select className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl" value={form.item} onChange={e => handleItemChange(e.target.value)} required>
                <option value="" className="bg-[#1a0840]">Select an asset...</option>
                {items.map(i => <option key={i._id} value={i._id} className="bg-[#1a0840]">{i.name}</option>)}
              </select>
            </div>

            <div>
              <label className="label !text-slate-800 dark:!text-white">Service Type</label>
              <select className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl text-xs font-bold uppercase tracking-wider" value={form.type} onChange={e => set('type', e.target.value)}>
                {['Repair', 'Service', 'Inspection', 'Replacement'].map(t => <option key={t} className="bg-[#1a0840]">{t}</option>)}
              </select>
            </div>

            <div>
              <label className="label !text-slate-800 dark:!text-white">Operation Status</label>
              <select className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl text-xs font-bold uppercase tracking-wider" value={form.status} onChange={e => set('status', e.target.value)}>
                {['Pending', 'In Progress', 'Completed'].map(s => <option key={s} className="bg-[#1a0840]">{s}</option>)}
              </select>
            </div>

            <div>
              <label className="label !text-slate-800 dark:!text-white">Technician / Provider</label>
              <input className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl" value={form.technician} onChange={e => set('technician', e.target.value)} placeholder="Name or Company" />
            </div>

            <div>
              <label className="label !text-slate-800 dark:!text-white">Estimated Cost (₹)</label>
              <input type="number" className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl font-bold font-mono" value={form.cost} onChange={e => set('cost', e.target.value)} placeholder="0.00" />
            </div>

            <div>
              <label className="label !text-slate-800 dark:!text-white">Scheduled Maintenance</label>
              <input type="date" className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl" value={form.scheduledDate ? form.scheduledDate.split('T')[0] : ''} onChange={e => set('scheduledDate', e.target.value)} />
            </div>

            <div>
              <label className="label !text-slate-800 dark:!text-white">Completion Date</label>
              <input type="date" className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl" value={form.completedDate ? form.completedDate.split('T')[0] : ''} onChange={e => set('completedDate', e.target.value)} />
            </div>

            <div className="col-span-full">
              <label className="label !text-slate-800 dark:!text-white">Work Description</label>
              <textarea className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white rounded-xl min-h-[80px] py-3 text-sm" rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What needs to be addressed?" />
            </div>

            <div className="col-span-full">
              <label className="label !text-slate-800 dark:!text-white">Internal Notes</label>
              <textarea className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white rounded-xl min-h-[80px] py-3 text-sm" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Private technician notes, part numbers, etc." />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button type="submit" disabled={saving} className="flex-1 py-4 rounded-2xl glass-liquid text-slate-800 dark:text-white font-black uppercase tracking-[0.2em] active:scale-95 transition-all text-xs">
              {saving ? 'Processing Reference...' : (log ? 'Update Activity' : 'Authorize Maintenance')}
            </button>
            <button type="button" onClick={onClose} className="px-8 py-4 rounded-2xl bg-white/60 dark:bg-white/5 hover:bg-white hover:text-slate-900 text-slate-500 dark:text-gray-400 font-bold uppercase tracking-widest transition-all text-sm">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
