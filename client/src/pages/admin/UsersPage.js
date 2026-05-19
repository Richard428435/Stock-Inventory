import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const emptyForm = { name: '', email: '', password: '', role: 'staff' };

const ROLE_THEMES = {
  admin: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  manager: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  staff: 'text-slate-400 bg-slate-400/10 border-slate-400/20'
};

function UserModal({ modal, form, setForm, onSave, onClose, saving }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fadeIn" onClick={onClose}>
      <div className="glass-liquid w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-8 space-y-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {modal === 'add' ? 'Add New Member' : 'Edit Member Profile'}
          </h2>
          <button onClick={onClose} className="text-white/20 hover:text-slate-800 dark:text-white transition-colors">✕</button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-widest px-1">Full Name</label>
            <input 
              className="w-full bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-slate-400 dark:border-white/30 rounded-xl px-4 py-3 text-slate-800 dark:text-white text-sm outline-none transition-all"
              placeholder="Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-widest px-1">Email</label>
            <input 
              type="email"
              className="w-full bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-slate-400 dark:border-white/30 rounded-xl px-4 py-3 text-slate-800 dark:text-white text-sm outline-none transition-all"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-widest px-1">{modal === 'add' ? 'Password' : 'New Password (Optional)'}</label>
            <input 
              type="password"
              className="w-full bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-slate-400 dark:border-white/30 rounded-xl px-4 py-3 text-slate-800 dark:text-white text-sm outline-none transition-all"
              placeholder={modal === 'add' ? '••••••••' : 'Leave blank to keep'}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-widest px-1">Role Type</label>
            <select
              className="w-full bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-slate-400 dark:border-white/30 rounded-xl px-4 py-3 text-slate-800 dark:text-white text-sm outline-none transition-all appearance-none"
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            >
              <option value="admin" className="bg-[#121212]">Admin (Full Control)</option>
              <option value="manager" className="bg-[#121212]">Manager (Operational)</option>
              <option value="staff" className="bg-[#121212]">Staff (Task Level)</option>
            </select>
          </div>
        </div>

        <button
          onClick={onSave}
          disabled={saving}
          className="w-full py-4 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? 'Processing…' : modal === 'add' ? 'Register Member' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const loadData = useCallback(async () => {
    try {
      const [uRes, hRes] = await Promise.all([api.get('/users'), api.get('/users/history')]);
      setUsers(uRes.data);
      setHistory(hRes.data);
    } catch { toast.error('System sync failed'); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchesText = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const mappedRole = u.role === 'user' ? 'staff' : u.role;
      const matchesRole = roleFilter === 'all' || mappedRole === roleFilter;
      return matchesText && matchesRole;
    });
  }, [users, search, roleFilter]);

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('Incomplete data');
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (modal === 'add') await api.post('/users', payload);
      else await api.put(`/users/${selected._id}`, payload);
      toast.success('Member list updated');
      setModal(null); loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Remove ${u.name}?`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      toast.success('Member removed'); loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Deletion failed'); }
  };

  return (
    <div className="space-y-10 pb-20 fade-in max-w-7xl mx-auto">
      {/* Search & Action Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">User Management</h2>
          <p className="text-slate-500 dark:text-white/30 text-xs font-medium uppercase tracking-[0.2em] mt-1">Manage system accounts and roles</p>
        </div>
        <button 
          onClick={() => { setForm(emptyForm); setModal('add'); }}
          className="px-6 py-3 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95"
        >
          Add New User
        </button>
      </header>

      {/* Modern Filter Strip */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <input
            className="w-full bg-white/60 dark:bg-white/5 border border-white/5 focus:border-slate-300 dark:border-white/20 rounded-2xl px-5 py-3 text-slate-800 dark:text-white text-sm outline-none transition-all placeholder-slate-400 dark:placeholder-white/20"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-white/60 dark:bg-white/5 border border-white/5 hover:border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3 text-slate-800 dark:text-white text-sm outline-none transition-all cursor-pointer"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="all" className="bg-[#121212]">All Roles</option>
          <option value="admin" className="bg-[#121212]">Admins</option>
          <option value="manager" className="bg-[#121212]">Managers</option>
          <option value="staff" className="bg-[#121212]">Staff</option>
        </select>
      </div>

      {/* CLEAN GLASS TABLE */}
      <div className="glass-liquid rounded-[2rem] border border-slate-200 dark:border-white/10 overflow-hidden backdrop-blur-3xl shadow-2xl">
        <div className="overflow-x-auto inventory-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/60 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest">User</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest">Role</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(u => {
                const role = u.role === 'user' ? 'staff' : u.role;
                const isMe = u._id === me?._id;
                return (
                  <tr key={u._id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-black text-slate-800 dark:text-white shadow-lg group-hover:scale-110 transition-transform">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{u.name} {isMe && <span className="text-[10px] text-white/20 ml-2">(You)</span>}</p>
                          <p className="text-[10px] text-slate-500 dark:text-white/30 mt-1">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${ROLE_THEMES[role]}`}>
                        {role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-white dark:bg-white/20'}`} />
                        <span className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest">{u.active ? 'Online' : 'Restricted'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                        {u.email.toLowerCase() === 'cffachurchcoimbatore@gmail.com'.toLowerCase() ? (
                          <span className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/10 shadow-sm">
                             Sacred Authority
                          </span>
                        ) : !isMe && (
                          <>
                            <button 
                              onClick={() => { setSelected(u); setForm({ name: u.name, email: u.email, password: '', role: u.role === 'user' ? 'staff' : u.role }); setModal('edit'); }}
                              className="text-[10px] font-black text-white/60 hover:text-slate-800 dark:text-white uppercase tracking-widest transition-colors"
                            >
                              Details
                            </button>
                            <button onClick={() => handleDelete(u)} className="text-[10px] font-black text-red-400/60 hover:text-red-400 uppercase tracking-widest transition-colors">
                              Revoke
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPACT AUDIT LOG */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 dark:text-white/30 uppercase tracking-[0.3em] ml-2">Recent Actions</h3>
        <div className="glass-liquid rounded-[2rem] border border-white/5 p-2 overflow-hidden backdrop-blur-md">
          <div className="max-h-60 overflow-y-auto inventory-scrollbar divide-y divide-white/[0.02]">
            {history.length === 0 ? <p className="text-center py-10 text-[10px] font-black text-white/10 uppercase tracking-widest">Logs Empty</p> :
              history.map((h, i) => (
                <div key={i} className="px-6 py-3 flex items-center justify-between gap-4 grayscale hover:grayscale-0 transition-all">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-white/60 truncate">{h.userName} <span className="text-white/20 mx-2">—</span> {h.details}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[7px] font-black text-white/20 uppercase tracking-widest mb-1">Access</p>
                    <p className="text-[7px] text-white/10 mt-1">{new Date(h.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {modal && <UserModal modal={modal} form={form} setForm={setForm} onSave={handleSave} onClose={() => setModal(null)} saving={saving} />}
    </div>
  );
}
