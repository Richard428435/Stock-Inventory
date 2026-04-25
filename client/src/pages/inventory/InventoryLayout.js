import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SettingsModal from '../../components/SettingsModal';

const baseNavItems = [
  { path: '/inventory', label: 'Home', icon: '🏠' },
  { path: '/inventory/items', label: 'Items', icon: '📦' },
  { path: '/inventory/stock-logs', label: 'Logs', icon: '📜' },
  { path: '/inventory/maintenance', label: 'Service', icon: '🔧' },
  { path: '/inventory/barcodes', label: 'Labels', icon: '🏷️' },
  { path: '/inventory/scanner', label: 'Scanner', icon: '📷' }
];

export default function InventoryLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const navItems = [
    ...baseNavItems,
    ...(isAdmin ? [{ path: '/inventory/users', label: 'Users', icon: '👥' }] : [])
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen bg-transparent flex flex-col overflow-hidden">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 px-6 py-4">
        <div className="flex items-center justify-between glass-liquid rounded-2xl px-6 py-3 border border-slate-300 dark:border-white/20 shadow-2xl">
          {/* Navigation Links - left side */}
          <nav className="hidden md:flex items-center gap-2 ml-0 pl-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-semibold ${isActive(item.path)
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pr-4 border-r border-slate-200 dark:border-white/10">
              <div className="hidden lg:block text-right">
                <p className="text-slate-800 dark:text-white text-xs font-bold">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-tighter">
                  {user?.role === 'admin' ? 'Admin' : user?.role === 'manager' ? 'Manager' : 'Staff'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-800 dark:text-white shadow-lg">
                {user?.name?.charAt(0) || '👤'}
              </div>
            </div>

            {/* Three Dots Options Menu */}
            {/* Three Dots Options Menu */}
            <div 
              className="relative" 
              onMouseEnter={() => setShowOptions(true)}
              onMouseLeave={() => setShowOptions(false)}
            >
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:text-white transition-colors p-1"
                title="Options"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              {showOptions && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-48 z-50 animate-fadeIn">
                  <div className="glass-liquid border border-slate-300 dark:border-white/20 rounded-2xl p-2 shadow-2xl transition-all duration-300">
                  <button
                    onClick={() => { setShowSettings('profile'); setShowOptions(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white hover:bg-white/10 rounded-xl transition-all uppercase tracking-widest"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => { setShowSettings('preferences'); setShowOptions(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white hover:bg-white/10 rounded-xl transition-all uppercase tracking-widest"
                  >
                    Settings
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => { setShowSettings('designer'); setShowOptions(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white hover:bg-white/10 rounded-xl transition-all uppercase tracking-widest"
                      >
                        Theme Designer
                      </button>
                      <button
                        onClick={() => { setShowSettings('system'); setShowOptions(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white hover:bg-white/10 rounded-xl transition-all uppercase tracking-widest"
                      >
                        Data Export
                      </button>
                      <button
                        onClick={() => { setShowSettings('update'); setShowOptions(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white hover:bg-white/10 rounded-xl transition-all uppercase tracking-widest"
                      >
                        Software Update
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
            </div>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="text-slate-500 dark:text-gray-400 hover:text-red-400 transition-colors ml-2"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 inventory-scrollbar">
        <div className="max-w-7xl mx-auto fade-in">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden sticky bottom-0 z-50 glass-liquid border-t border-slate-200 dark:border-white/10 px-4 py-3 flex justify-around items-center">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-colors ${isActive(item.path) ? 'text-blue-400' : 'text-slate-500 dark:text-gray-400'
              }`}
          >
            {item.icon && <span className="text-xl">{item.icon}</span>}
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="glass-liquid p-8 max-w-sm w-full mx-4 rounded-3xl border border-slate-300 dark:border-white/20 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-red-500/20">
              🚪
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Sign Out</h3>
            <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">Are you sure you want to sign out?</p>

            <div className="flex gap-4">
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-400 text-slate-800 dark:text-white font-bold uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all text-xs"
              >
                Sign Out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-2xl bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:bg-white/10 text-slate-600 dark:text-gray-300 font-bold uppercase tracking-widest transition-all text-xs border border-slate-200 dark:border-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && <SettingsModal initialTab={showSettings} onClose={() => setShowSettings(false)} />}
    </div>
  );
}

