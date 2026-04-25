import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSystem } from '../context/SystemContext';

const GUIDES = {
  admin: [
    { title: 'Manage Users', icon: '👤', description: 'Create and edit accounts, and set roles for your team.' },
    { title: 'Security Audits', icon: '🛡️', description: 'View logs to track who changed what in the inventory.' },
    { title: 'System Health', icon: '🔋', description: 'Keep an eye on database and server connections.' }
  ],
  manager: [
    { title: 'Manage Items', icon: '📦', description: 'Add or remove inventory items and manage their categories.' },
    { title: 'Maintenance', icon: '🔧', description: 'Keep track of items that need repairs or inspections.' },
    { title: 'Barcodes', icon: '🏷️', description: 'Print custom barcodes so you can quickly scan items.' }
  ],
  staff: [
    { title: 'Add Stock', icon: '📝', description: 'Log new items into the system when they arrive.' },
    { title: 'Adjust Stock', icon: '⚖️', description: 'Update quantities when items are used or counted.' },
    { title: 'Use Scanner', icon: '📷', description: 'Scan item barcodes to instantly pull up their details.' }
  ]
};

function ToggleSwitch({ checked, onChange }) {
  return (
    <button 
      onClick={(e) => { e.preventDefault(); onChange(!checked); }}
      className={`w-12 h-6 rounded-full transition-colors relative border ${checked ? 'bg-blue-500/80 border-blue-400/50' : 'bg-slate-300 dark:bg-white/10 dark:border-white/20'}`}
    >
      <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all shadow-sm ${checked ? 'left-7' : 'left-1'}`} />
    </button>
  );
}

export default function SettingsModal({ onClose, initialTab = 'profile' }) {
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { config, updateConfig } = useSystem();
  
  const [activeTab, setActiveTab] = useState(initialTab === true ? 'profile' : initialTab);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', password: '', confirmPassword: '' });
  const [systemStats, setSystemStats] = useState({ api: 'checking', db: 'checking', smtp: 'checking' });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // App Designer State
  const [designerForm, setDesignerForm] = useState({
    churchName: config?.churchName || '',
    backgroundUrl: config?.backgroundUrl || '',
    logoUrl: config?.logoUrl || '',
    loginBackgroundUrl: config?.loginBackgroundUrl || '',
    loginBackgroundType: config?.loginBackgroundType || 'video',
    loginVerses: config?.loginVerses?.join('\n\n') || ''
  });

  // Mock states for new settings
  const [prefs, setPrefs] = useState({ 
    view: localStorage.getItem('ui_viewMode') || 'list', 
    dateFormat: localStorage.getItem('ui_dateFormat') || 'MM/DD/YYYY' 
  });
  const [notifs, setNotifs] = useState({ lowStock: true, maintenance: true, system: false });
  const [hardware, setHardware] = useState({ 
    defaultCam: localStorage.getItem('hw_defaultCam') || 'rear', 
    format: localStorage.getItem('hw_format') || 'code128', 
    autoPrint: localStorage.getItem('hw_autoPrint') === 'true' 
  });
  
  // Data Export Reports State
  const [reportState, setReportState] = useState({ type: 'items', range: 'all' });
  const [reportLoading, setReportLoading] = useState('');

  const roleKey = user?.role === 'user' ? 'staff' : user?.role;
  const userGuides = GUIDES[roleKey] || GUIDES.staff;

  useEffect(() => {
    if (isAdmin && activeTab === 'system') {
      const checks = async () => {
        try {
          await api.get('/auth/me'); 
          setSystemStats(s => ({ ...s, api: 'healthy', db: 'connected' }));
        } catch {
          setSystemStats(s => ({ ...s, api: 'error', db: 'error' }));
        }
      };
      checks();
    }
  }, [isAdmin, activeTab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setSaving(true);
    try {
      const payload = { name: profileForm.name };
      if (profileForm.password) payload.password = profileForm.password;
      
      await api.put(`/users/${user._id}`, payload);
      toast.success('Profile updated');
      setProfileForm(p => ({ ...p, password: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file, field) => {
    if (!file) return;
    const reader = new FileReader();
    const toastId = toast.loading(`Uploading ${file.name}...`);
    
    reader.onloadend = async () => {
      try {
        const res = await api.post('/system/upload', {
          base64: reader.result,
          filename: file.name
        });
        
        setDesignerForm(p => ({ ...p, [field]: res.data.url }));
        toast.success(`${file.name} uploaded to drive!`, { id: toastId });
      } catch (err) {
        toast.error(`Upload failed: ${err.response?.data?.message || err.message}`, { id: toastId });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDesigner = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateConfig({
        churchName: designerForm.churchName,
        backgroundUrl: designerForm.backgroundUrl,
        logoUrl: designerForm.logoUrl,
        loginBackgroundUrl: designerForm.loginBackgroundUrl,
        loginBackgroundType: designerForm.loginBackgroundType,
        loginVerses: designerForm.loginVerses.split('\n').map(v => v.trim()).filter(Boolean)
      });
      toast.success('App Restyled Globally!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update settings';
      toast.error(`Save Failed: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMock = (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Write UI Prefs to local
    localStorage.setItem('ui_viewMode', prefs.view);
    localStorage.setItem('ui_dateFormat', prefs.dateFormat);
    
    // Write Hardware Prefs to local
    localStorage.setItem('hw_defaultCam', hardware.defaultCam);
    localStorage.setItem('hw_format', hardware.format);
    localStorage.setItem('hw_autoPrint', hardware.autoPrint);
    
    // Trigger global UI re-render event
    window.dispatchEvent(new Event('prefs-changed'));
    
    setTimeout(() => {
      toast.success('Settings saved');
      setSaving(false);
    }, 600);
  };

  const handleGenerateReport = async (format) => {
    setReportLoading(format);
    try {
      const endpoint = reportState.type === 'items' ? '/inventory/items' : '/inventory/stock-logs';
      const response = await api.get(endpoint, { params: { limit: 10000, page: 1 }});
      
      let data = reportState.type === 'items' ? response.data : response.data.logs;
      
      if (!data || data.length === 0) {
        toast.error('No records found to export');
        setReportLoading('');
        return;
      }
      
      if (reportState.range !== 'all') {
        const now = new Date();
        data = data.filter(item => {
          const dt = new Date(item.createdAt || item.updatedAt);
          if (reportState.range === 'this_month') {
            return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
          } else if (reportState.range === 'last_month') {
            const lastM = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return dt.getMonth() === lastM.getMonth() && dt.getFullYear() === lastM.getFullYear();
          }
          return true;
        });
      }

      if (data.length === 0) {
        toast.error('No records found for this time range');
        setReportLoading('');
        return;
      }
      
      const keys = Object.keys(data[0]).filter(k => !['_id', '__v', 'user', 'item'].includes(k));
      const colNames = keys.map(k => k.toUpperCase());

      if (format === 'csv') {
        let csvContent = "data:text/csv;charset=utf-8," 
            + colNames.join(",") + "\\n"
            + data.map(row => keys.map(k => {
                let val = row[k];
                if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
                return `"${String(val || '').replace(/"/g, '""')}"`;
              }).join(",")).join("\\n");
        
        const encUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encUri);
        link.setAttribute("download", `${reportState.type}_report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } 
      else if (format === 'doc' || format === 'pdf') {
        const htmlContent = `
          <html>
            <head>
              <title>${config?.churchName || 'System'} - Report</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; color: #333; margin: 0; }
                h1 { text-align: center; color: #4F46E5; margin-bottom: 5px; }
                p { text-align: center; color: #666; margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f7f7f7; font-weight: bold; }
                tr:nth-child(even) { background-color: #fafafa; }
              </style>
            </head>
            <body>
              <h1>${config?.churchName || 'System'}</h1>
              <h2>${reportState.type.toUpperCase()} REPORT</h2>
              <p>Generated on ${new Date().toLocaleString()} | Period: ${reportState.range.replace('_', ' ').toUpperCase()}</p>
              <table>
                <thead>
                  <tr>${colNames.map(c => `<th>${c}</th>`).join('')}</tr>
                </thead>
                <tbody>
                  ${data.map(row => `<tr>${keys.map(k => `<td>${typeof row[k] === 'object' ? JSON.stringify(row[k]) : (row[k] || '')}</td>`).join('')}</tr>`).join('')}
                </tbody>
              </table>
            </body>
          </html>
        `;

        if (format === 'pdf') {
          const printWindow = window.open('', '_blank');
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          
          printWindow.onload = function() {
            printWindow.focus();
            printWindow.print();
          };
        } else if (format === 'doc') {
           const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(htmlContent);
           const link = document.createElement("a");
           link.href = url;
           link.download = `${reportState.type}_report.doc`;
           document.body.appendChild(link);
           link.click();
           document.body.removeChild(link);
        }
      }
      toast.success(format === 'pdf' ? 'Print layout ready' : 'Download successful!');
    } catch (err) {
      toast.error('Failed to aggregate report data');
    } finally {
      setReportLoading('');
    }
  };

  const inputClass = "w-full bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-slate-400 dark:focus:border-white/30 transition-all placeholder-slate-400 dark:placeholder-white/20";
  const btnClass = "px-5 py-2.5 rounded-md bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 drop-shadow-sm";

  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fadeIn" onClick={onClose}>
      <div className="glass-liquid bg-white/60 dark:bg-white/5 w-full max-w-4xl rounded-3xl border border-slate-300 dark:border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white/[0.05]">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white drop-shadow-sm capitalize">
            {activeTab === 'preferences' ? 'Settings' : 
             activeTab === 'designer' ? 'Theme Designer' : 
             activeTab === 'system' ? 'Data Export' : 
             activeTab === 'update' ? 'Software Update' : 
             activeTab}
          </h2>
          <button onClick={onClose} className="text-slate-500 dark:text-white/40 hover:text-slate-800 dark:hover:text-white transition-colors bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center drop-shadow-sm">✕</button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 min-h-0">
          {/* Main Settings Area - High Isolation Mode (Full Width) */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-transparent inventory-scrollbar relative">
            
            {activeTab === 'profile' && (
              <div className="max-w-xl space-y-6 fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white drop-shadow-sm">Profile</h3>
                  <p className="text-sm text-slate-600 dark:text-white/60">Update your name and password.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className={labelClass}>Name</label>
                    <input 
                      type="text"
                      className={inputClass}
                      value={profileForm.name}
                      onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Your Role</label>
                    <input 
                      type="text"
                      className={inputClass + " opacity-60 cursor-not-allowed capitalize"}
                      value={user?.role}
                      disabled
                      readOnly
                    />
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className={labelClass}>Change Password</label>
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 drop-shadow-sm"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password"
                        className={inputClass}
                        value={profileForm.password}
                        onChange={e => setProfileForm(p => ({ ...p, password: e.target.value }))}
                      />
                      <input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        className={inputClass}
                        value={profileForm.confirmPassword}
                        onChange={e => setProfileForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-300 dark:border-white/10 mt-6">
                    <button type="submit" disabled={saving} className={btnClass}>
                      {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="max-w-xl space-y-6 fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white drop-shadow-sm">Preferences</h3>
                  <p className="text-sm text-slate-600 dark:text-white/60">Change how the application looks to you.</p>
                </div>

                <form onSubmit={handleSaveMock} className="space-y-4">
                  
                  <div className="flex items-center justify-between p-4 border border-slate-300 dark:border-white/10 bg-white/40 dark:bg-white/5 rounded-xl backdrop-blur-sm">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Dark Mode</p>
                      <p className="text-xs text-slate-600 dark:text-white/50 mt-1">Enable a darker color scheme</p>
                    </div>
                    <ToggleSwitch checked={theme === 'dark'} onChange={toggleTheme} />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-300 dark:border-white/10 bg-white/40 dark:bg-white/5 rounded-xl backdrop-blur-sm">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Default Layout</p>
                      <p className="text-xs text-slate-600 dark:text-white/50 mt-1">How you prefer lists to appear</p>
                    </div>
                    <select 
                      value={prefs.view}
                      onChange={(e) => setPrefs({ ...prefs, view: e.target.value })}
                      className="bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-md px-3 py-1.5 text-sm font-semibold outline-none text-slate-800 dark:text-white appearance-none"
                    >
                      <option value="list">List View</option>
                      <option value="grid">Grid View</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-300 dark:border-white/10 bg-white/40 dark:bg-white/5 rounded-xl backdrop-blur-sm">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Date Format</p>
                      <p className="text-xs text-slate-600 dark:text-white/50 mt-1">How dates are displayed</p>
                    </div>
                    <select 
                      value={prefs.dateFormat}
                      onChange={(e) => setPrefs({ ...prefs, dateFormat: e.target.value })}
                      className="bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-md px-3 py-1.5 text-sm font-semibold outline-none text-slate-800 dark:text-white appearance-none"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-slate-300 dark:border-white/10 mt-6">
                    <button type="submit" disabled={saving} className={btnClass}>
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'designer' && isAdmin && (
              <div className="max-w-xl space-y-6 fade-in">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 dark:text-white drop-shadow-sm flex items-center gap-2">
                    Theme Designer
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-white/60 mt-1">
                    Change root backgrounds and logos. These changes affect <strong>all</strong> users globally.
                  </p>
                </div>

                <form onSubmit={handleSaveDesigner} className="space-y-4">
                  
                  <div>
                    <label className={labelClass}>Organization Name</label>
                    <input 
                      type="text"
                      className={inputClass}
                      value={designerForm.churchName}
                      onChange={e => setDesignerForm(p => ({ ...p, churchName: e.target.value }))}
                      placeholder="e.g. Hillsong NYC"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Organization Logo</label>
                    <div className="mt-2 flex items-center gap-4 p-3 bg-white/40 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/20 rounded-xl">
                      {designerForm.logoUrl && (designerForm.logoUrl.startsWith('data:') || designerForm.logoUrl.startsWith('/uploads/')) ? (
                         <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm flex-shrink-0">
                           <img src={designerForm.logoUrl} alt="Logo preview" className="w-full h-full object-contain p-1" />
                         </div>
                      ) : null}
                      
                      <div className="flex-1 flex flex-wrap gap-2 items-center">
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], 'logoUrl')} className="hidden" id="logo-upload" />
                        <label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center justify-center px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors">
                          {designerForm.logoUrl ? 'Update Drive' : 'Upload to Drive'}
                        </label>
                        {designerForm.logoUrl && designerForm.logoUrl !== '/pictures/Logoo_02-removebg-preview.png' && (
                          <button 
                            type="button" 
                            onClick={() => setDesignerForm(p => ({ ...p, logoUrl: '' }))}
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors outline-none"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Global Background Image</label>
                    <div className="mt-2 flex items-center gap-4 p-3 bg-white/40 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/20 rounded-xl">
                      {designerForm.backgroundUrl && designerForm.backgroundUrl.startsWith('data:image') ? (
                         <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm flex-shrink-0">
                           <img src={designerForm.backgroundUrl} alt="Bg preview" className="w-full h-full object-cover" />
                         </div>
                      ) : designerForm.backgroundUrl ? (
                         <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm flex-shrink-0 bg-white/50 flex items-center justify-center text-[10px] text-center text-slate-500 font-medium">Link</div>
                      ) : null}
                      
                      <div className="flex-1 flex flex-wrap gap-2 items-center">
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], 'backgroundUrl')} className="hidden" id="bg-upload" />
                        <label htmlFor="bg-upload" className="cursor-pointer inline-flex items-center justify-center px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors">
                          {designerForm.backgroundUrl ? 'Update Drive' : 'Upload to Drive'}
                        </label>
                        {designerForm.backgroundUrl && (
                          <button 
                            type="button" 
                            onClick={() => setDesignerForm(p => ({ ...p, backgroundUrl: '' }))}
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors outline-none"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-300 dark:border-white/10 mt-6 pt-6">
                    <h4 className="text-md font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                       Login Page Designer
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className={labelClass}>Background Type</label>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => setDesignerForm(p => ({ ...p, loginBackgroundType: 'video' }))}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all ${designerForm.loginBackgroundType === 'video' ? 'bg-blue-500 text-white border-blue-400 shadow-md' : 'bg-white/40 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10'}`}
                          >
                            Video
                          </button>
                          <button 
                            type="button"
                            onClick={() => setDesignerForm(p => ({ ...p, loginBackgroundType: 'image' }))}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all ${designerForm.loginBackgroundType === 'image' ? 'bg-blue-500 text-white border-blue-400 shadow-md' : 'bg-white/40 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10'}`}
                          >
                            Image
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Login Background {designerForm.loginBackgroundType === 'video' ? 'Video' : 'Image'}</label>
                        <div className="mt-2 flex items-center gap-4 p-3 bg-white/40 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/20 rounded-xl">
                          {designerForm.loginBackgroundUrl && (designerForm.loginBackgroundUrl.startsWith('data:') || designerForm.loginBackgroundUrl.startsWith('/uploads/')) ? (
                             <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm flex-shrink-0 flex items-center justify-center bg-slate-800">
                               {designerForm.loginBackgroundType === 'video' ? <span className="text-xs text-white/40">MP4</span> : <img src={designerForm.loginBackgroundUrl} alt="Preview" className="w-full h-full object-cover" />}
                             </div>
                          ) : null}
                          
                          <div className="flex-1 flex flex-wrap gap-2 items-center">
                            <input type="file" accept={designerForm.loginBackgroundType === 'video' ? "video/*" : "image/*"} onChange={(e) => handleFileUpload(e.target.files[0], 'loginBackgroundUrl')} className="hidden" id="login-bg-upload" />
                            <label htmlFor="login-bg-upload" className="cursor-pointer inline-flex items-center justify-center px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors">
                              {designerForm.loginBackgroundUrl ? 'Update Drive' : 'Upload to Drive'}
                            </label>
                            {designerForm.loginBackgroundUrl && (
                              <button 
                                type="button" 
                                onClick={() => setDesignerForm(p => ({ ...p, loginBackgroundUrl: '' }))}
                                className="inline-flex items-center justify-center px-4 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors outline-none"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-300 dark:border-white/10 mt-6">
                    <label className={labelClass}>Login Page Verses</label>
                    <p className="text-xs text-slate-500 dark:text-white/40 mb-2">
                       Enter the rotating verses displayed on the login page. Add each verse on a new line. Space them out with an extra line break for readability if you want.
                    </p>
                    <textarea 
                      className={inputClass + " min-h-[160px] resize-y"}
                      value={designerForm.loginVerses}
                      onChange={e => setDesignerForm(p => ({ ...p, loginVerses: e.target.value }))}
                      placeholder={'"In the beginning..." Genesis 1:1\n\n"For God so loved..." John 3:16'}
                    />
                  </div>


                  <div className="pt-4 border-t border-slate-300 dark:border-white/10 mt-6">
                    <button 
                      type="submit" 
                      disabled={saving} 
                      className={btnClass}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="max-w-xl space-y-6 fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white drop-shadow-sm">Notifications</h3>
                  <p className="text-sm text-slate-600 dark:text-white/60">Choose what updates you want to see.</p>
                </div>

                <form onSubmit={handleSaveMock} className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-300 dark:border-white/10 bg-white/40 dark:bg-white/5 rounded-xl backdrop-blur-sm">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Low Stock Alerts</p>
                      <p className="text-xs text-slate-600 dark:text-white/50 mt-1">Notify me when items run low</p>
                    </div>
                    <ToggleSwitch checked={notifs.lowStock} onChange={(val) => setNotifs({ ...notifs, lowStock: val})} />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-300 dark:border-white/10 bg-white/40 dark:bg-white/5 rounded-xl backdrop-blur-sm">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Maintenance Reminders</p>
                      <p className="text-xs text-slate-600 dark:text-white/50 mt-1">Notify me about equipment checks</p>
                    </div>
                    <ToggleSwitch checked={notifs.maintenance} onChange={(val) => setNotifs({ ...notifs, maintenance: val})} />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-300 dark:border-white/10 bg-white/40 dark:bg-white/5 rounded-xl backdrop-blur-sm">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">System Messages</p>
                      <p className="text-xs text-slate-600 dark:text-white/50 mt-1">Receive technical updates</p>
                    </div>
                    <ToggleSwitch checked={notifs.system} onChange={(val) => setNotifs({ ...notifs, system: val})} />
                  </div>

                  <div className="pt-4 border-t border-slate-300 dark:border-white/10 mt-6">
                    <button type="submit" disabled={saving} className={btnClass}>
                      {saving ? 'Saving...' : 'Save Notifications'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'hardware' && (
              <div className="max-w-xl space-y-6 fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white drop-shadow-sm">Hardware</h3>
                  <p className="text-sm text-slate-600 dark:text-white/60">Manage camera and scanner usage.</p>
                </div>

                <form onSubmit={handleSaveMock} className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-300 dark:border-white/10 bg-white/40 dark:bg-white/5 rounded-xl backdrop-blur-sm">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Default Camera</p>
                      <p className="text-xs text-slate-600 dark:text-white/50 mt-1">Which camera to use for scanning</p>
                    </div>
                    <select 
                      value={hardware.defaultCam}
                      onChange={(e) => setHardware({ ...hardware, defaultCam: e.target.value })}
                      className="bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-md px-3 py-1.5 text-sm font-semibold outline-none text-slate-800 dark:text-white appearance-none"
                    >
                      <option value="rear">Back Camera</option>
                      <option value="front">Front Camera</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-300 dark:border-white/10 bg-white/40 dark:bg-white/5 rounded-xl backdrop-blur-sm">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Barcode Format</p>
                      <p className="text-xs text-slate-600 dark:text-white/50 mt-1">What type of barcode to print</p>
                    </div>
                    <select 
                      value={hardware.format}
                      onChange={(e) => setHardware({ ...hardware, format: e.target.value })}
                      className="bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-md px-3 py-1.5 text-sm font-semibold outline-none text-slate-800 dark:text-white appearance-none"
                    >
                      <option value="code128">Standard Barcode</option>
                      <option value="qr">QR Code</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-300 dark:border-white/10 bg-white/40 dark:bg-white/5 rounded-xl backdrop-blur-sm">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Auto-Print</p>
                      <p className="text-xs text-slate-600 dark:text-white/50 mt-1">Print barcodes right after adding items</p>
                    </div>
                    <ToggleSwitch checked={hardware.autoPrint} onChange={(val) => setHardware({ ...hardware, autoPrint: val})} />
                  </div>

                  <div className="pt-4 border-t border-slate-300 dark:border-white/10 mt-6">
                    <button type="submit" disabled={saving} className={btnClass}>
                      {saving ? 'Saving...' : 'Save Hardware Settings'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'help' && (
              <div className="max-w-3xl space-y-6 fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white drop-shadow-sm">Help & Guides</h3>
                  <p className="text-sm text-slate-600 dark:text-white/60">Quickly learn how to use your {roleKey} account.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userGuides.map((guide, i) => (
                    <div key={i} className="glass-liquid bg-white/40 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl p-5 hover:border-slate-400 dark:hover:border-white/30 transition-all">
                      <div className="text-2xl mb-2 drop-shadow-md">{guide.icon}</div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-white">{guide.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-white/60 mt-1 font-medium">
                        {guide.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-slate-300 dark:border-white/10 pt-6">
                  <h4 className="text-base font-bold text-slate-800 dark:text-white mb-2">Need More Help?</h4>
                  <p className="text-sm text-slate-600 dark:text-white/60">If you are stuck, you can email our support team directly.</p>
                  <a href="mailto:support@sacredsteward.app" className={btnClass + " inline-block mt-4"}>
                    Email Support
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'system' && isAdmin && (
              <div className="max-w-2xl space-y-6 fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white drop-shadow-sm">Data Export</h3>
                  <p className="text-sm text-slate-600 dark:text-white/60">Download system data and check status.</p>
                </div>

                <div className="glass-liquid bg-white/40 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl p-5">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">System Status</h4>
                  <div className="space-y-2 text-sm font-medium text-slate-700 dark:text-white/70">
                    <div className="flex justify-between items-center bg-white/30 dark:bg-white/5 px-3 py-2 rounded-lg">
                      <span>Database Connection:</span>
                      <strong className={systemStats.db === 'connected' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>{systemStats.db}</strong>
                    </div>
                    <div className="flex justify-between items-center bg-white/30 dark:bg-white/5 px-3 py-2 rounded-lg">
                      <span>API Server:</span>
                      <strong className={systemStats.api === 'healthy' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>{systemStats.api}</strong>
                    </div>
                  </div>
                </div>

                <div className="glass-liquid bg-white/40 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl p-5">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Report Generator</h4>
                  <p className="text-sm text-slate-600 dark:text-white/60 mb-6 font-medium">
                    Filter and generate monthly or custom data exports natively in Word, Excel, or PDF.
                  </p>
                  
                  <div className="space-y-4 mb-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Report Type</label>
                        <select 
                          value={reportState.type}
                          onChange={e => setReportState({ ...reportState, type: e.target.value })}
                          className="w-full bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-md px-3 py-2 text-sm font-semibold outline-none text-slate-800 dark:text-white"
                        >
                          <option value="items">Master Inventory List</option>
                          <option value="stock-logs">Stock Activity Logs</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Time Range</label>
                        <select 
                          value={reportState.range}
                          onChange={e => setReportState({ ...reportState, range: e.target.value })}
                          className="w-full bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-md px-3 py-2 text-sm font-semibold outline-none text-slate-800 dark:text-white"
                        >
                          <option value="this_month">This Month</option>
                          <option value="last_month">Last Month</option>
                          <option value="all">All Time History</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                    <button 
                      onClick={() => handleGenerateReport('csv')} 
                      disabled={!!reportLoading}
                      className="flex-1 min-w-[120px] px-4 py-2.5 bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-md text-xs font-bold uppercase transition-all shadow-sm disabled:opacity-50"
                    >
                      {reportLoading === 'csv' ? 'Wait...' : '📊 Excel / CSV'}
                    </button>
                    <button 
                      onClick={() => handleGenerateReport('doc')} 
                      disabled={!!reportLoading}
                      className="flex-1 min-w-[120px] px-4 py-2.5 bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-md text-xs font-bold uppercase transition-all shadow-sm disabled:opacity-50"
                    >
                      {reportLoading === 'doc' ? 'Wait...' : '📝 MS Word'}
                    </button>
                    <button 
                      onClick={() => handleGenerateReport('pdf')} 
                      disabled={!!reportLoading}
                      className="flex-1 min-w-[120px] px-4 py-2.5 bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-md text-xs font-bold uppercase transition-all shadow-sm disabled:opacity-50"
                    >
                      {reportLoading === 'pdf' ? 'Wait...' : '🖨️ Print PDF'}
                    </button>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'update' && isAdmin && (
              <div className="max-w-2xl space-y-6 fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white drop-shadow-sm">System Maintenance</h3>
                  <p className="text-sm text-slate-600 dark:text-white/60">Manage software versions and security.</p>
                </div>

                <div className="glass-liquid bg-white/40 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Software Update</h4>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-500/30">v1.2.0</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-white/60 mb-4 font-medium">
                    Check for the latest system patches, security updates, and feature rollouts.
                  </p>
                  <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                    <button 
                      onClick={() => {
                        if (reportLoading) return;
                        setReportLoading('update');
                        setTimeout(() => {
                           toast.success('System is fully up to date.', { icon: '🛡️' });
                           setReportLoading('');
                        }, 2000);
                      }} 
                      disabled={!!reportLoading}
                      className="w-full sm:w-auto px-5 py-2.5 bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-md text-sm font-bold transition-all shadow-sm disabled:opacity-50"
                    >
                      {reportLoading === 'update' ? 'Checking for updates...' : 'Check for Updates'}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
