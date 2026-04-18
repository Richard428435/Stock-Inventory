import React, { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ItemModal({ item, onClose, onSave, categories }) {
  const [form, setForm] = useState(item || { name: '', model: '', sku: '', category: categories[0]?.name || '', location: '', quantity: 0, lowStockThreshold: 5, warrantyAvailable: false, warrantyExpiry: '', warrantyCardImage: '', description: '', imageUrl: '', purchasedFrom: '', shopAddress: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (item) await api.put(`/inventory/items/${item._id}`, form);
      else await api.post('/inventory/items', form);
      toast.success(item ? 'Item updated' : 'Item created');
      onSave();
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving item'); }
    finally { setSaving(false); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-liquid p-8 max-w-2xl w-full mx-4 rounded-3xl border border-slate-300 dark:border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto inventory-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{item ? 'Edit Item' : 'Add New Item'}</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 dark:bg-white/5 hover:bg-transparent text-slate-500 dark:text-gray-400 hover:text-red-400 transition-all">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="label !text-slate-800 dark:!text-white">Item Name *</label>
               <input className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl focus:!border-white" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div>
              <label className="label !text-slate-800 dark:!text-white">Model</label>
              <input className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl" value={form.model} onChange={e => set('model', e.target.value)} />
            </div>
            <div>
              <label className="label !text-slate-800 dark:!text-white">SKU / Serial Number</label>
              <input className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl" value={form.sku} onChange={e => set('sku', e.target.value)} />
            </div>
            <div>
              <label className="label !text-slate-800 dark:!text-white">Category *</label>
              <select className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl" value={form.category} onChange={e => set('category', e.target.value)}>
                {categories.map(c => <option key={c._id} value={c.name} className="bg-[#1a0840] text-slate-800 dark:text-white">{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label !text-slate-800 dark:!text-white">Location / Room</label>
              <input className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label className="label !text-slate-800 dark:!text-white">Quantity</label>
              <input type="number" className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl" value={form.quantity} onChange={e => set('quantity', e.target.value)} min="0" />
            </div>
            <div>
              <label className="label !text-slate-800 dark:!text-white">Low Stock Threshold</label>
              <input type="number" className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl" value={form.lowStockThreshold} onChange={e => set('lowStockThreshold', e.target.value)} min="0" />
            </div>
            <div className="md:col-span-2">
              <label className="label !text-slate-800 dark:!text-white">Purchased From</label>
              <input className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl" value={form.purchasedFrom} onChange={e => set('purchasedFrom', e.target.value)} placeholder="Vendor or Store name" />
            </div>
            <div className="md:col-span-2">
              <label className="label !text-slate-800 dark:!text-white">Shop Address</label>
              <input className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl" value={form.shopAddress} onChange={e => set('shopAddress', e.target.value)} placeholder="Physical or web address" />
            </div>
            
            <div className="col-span-full space-y-4">
              <div className="flex items-center gap-3">
                 <input type="checkbox" id="warranty" checked={form.warrantyAvailable} onChange={e => set('warrantyAvailable', e.target.checked)} className="w-5 h-5 accent-white rounded" />
                <label htmlFor="warranty" className="text-sm text-slate-800 dark:text-white font-semibold uppercase tracking-wider">Has Warranty</label>
              </div>
              
              {form.warrantyAvailable && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  <div>
                    <label className="label !text-slate-800 dark:!text-white">Warranty Expiry Date</label>
                    <input type="date" className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl" value={form.warrantyExpiry ? form.warrantyExpiry.split('T')[0] : ''} onChange={e => set('warrantyExpiry', e.target.value)} />
                  </div>
                  <div>
                    <label className="label !text-slate-800 dark:!text-white">Warranty Info / Note</label>
                    <input className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white h-12 rounded-xl" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Card number, provider, etc." />
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-full">
              <label className="label !text-slate-800 dark:!text-white">General Description</label>
              <textarea className="input !bg-white/60 dark:!bg-white/5 !border-slate-200 dark:!border-white/10 !text-slate-800 dark:!text-white rounded-xl min-h-[100px] py-3" value={form.description} onChange={e => set('description', e.target.value)} />
            </div>

            <div className="col-span-full">
              <label className="label">Product Image</label>
              <div className="mt-2 flex items-center gap-6 p-4 glass-card border-dashed">
                {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded-2xl shadow-lg border border-slate-200 dark:border-white/10" />}
                <div className="flex-1">
                  <input type="file" accept="image/*" onChange={(e) => {
                     const file = e.target.files[0];
                     if (file) {
                       const reader = new FileReader();
                       reader.onloadend = () => set('imageUrl', reader.result);
                       reader.readAsDataURL(file);
                     }
                  }} className="hidden" id="image-upload" />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:text-white transition-colors py-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-widest">{form.imageUrl ? 'Change Image' : 'Upload Image'}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={saving} className="flex-1 py-4 rounded-2xl glass-liquid text-slate-800 dark:text-white font-bold uppercase tracking-widest active:scale-95 transition-all text-sm">
              {saving ? 'Processing...' : (item ? 'Update Item' : 'Create Item')}
            </button>
            <button type="button" onClick={onClose} className="px-8 py-4 rounded-2xl bg-white/60 dark:bg-white/5 hover:bg-white hover:text-slate-900 text-slate-600 dark:text-gray-300 font-bold uppercase tracking-widest transition-all text-sm">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
