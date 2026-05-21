import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Command } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SettingsModal from '../../components/SettingsModal';
import CopilotPanel from '../../components/CopilotPanel';
import CommandPalette from '../../components/CommandPalette';
import FloatingDock from '../../components/FloatingDock';

// Deployment Hash: 2026-04-25T08:52:10Z - Triggering Nav Label Sync
const baseNavItems = [
  { path: '/inventory', label: 'Home', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { path: '/inventory/items', label: 'Items', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
  { path: '/inventory/stock-logs', label: 'Logs', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { path: '/inventory/maintenance', label: 'Maintenance', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { path: '/inventory/barcodes', label: 'Barcodes', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg> },
  { path: '/inventory/scanner', label: 'Scanner', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { path: '/inventory/audit', label: 'Audit', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { path: '/inventory/map', label: 'Map', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg> },
  { path: '/inventory/crew', label: 'Crew', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> }
];

export default function InventoryLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [startup, setStartup] = useState(true);

  useEffect(() => {
    // Cinematic Startup Experience Sequence
    const timer = setTimeout(() => {
      setStartup(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const navItems = [
    ...baseNavItems,
    ...(isAdmin ? [{ path: '/inventory/users', label: 'Users', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> }] : [])
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Cinematic Startup Overlay */}
      {startup && (
        <div className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center transition-all duration-[1.5s] ease-in-out overflow-hidden" style={{ opacity: startup ? 1 : 0, pointerEvents: startup ? 'auto' : 'none' }}>
          {/* Subtle luxurious background effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#c49a5b]/10 via-[#050505] to-[#050505]"></div>
          
          {/* Lens Flares & Glitter Elements */}
          <div className="absolute top-[30%] left-[20%] w-1 h-1 bg-white rounded-full shadow-[0_0_20px_4px_rgba(255,255,255,0.8)] animate-pulse" style={{ animationDuration: '2s' }}></div>
          <div className="absolute top-[60%] right-[25%] w-1.5 h-1.5 bg-[#c49a5b] rounded-full shadow-[0_0_20px_4px_rgba(196,154,91,0.8)] animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
          <div className="absolute bottom-[25%] left-[30%] w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.8)] animate-ping" style={{ animationDuration: '4s' }}></div>
          <div className="absolute top-[40%] right-[40%] w-2 h-2 bg-[#e8bd7f] rounded-full blur-[2px] opacity-40 animate-pulse" style={{ animationDuration: '1.5s' }}></div>
          
          {/* Ambient Cross-Flare */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#c49a5b]/5 blur-[100px] rounded-full transform -rotate-45 pointer-events-none"></div>

          <div className="relative flex flex-col items-center justify-center h-full">
            {/* The Main Title */}
            <div className="overflow-hidden mb-2 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl animate-pulse"></div>
              <h1 className="text-4xl md:text-6xl font-serif text-white tracking-tighter relative z-10 animate-slide-up text-center drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                CFFA Media <span className="text-[#c49a5b] italic drop-shadow-[0_0_20px_rgba(196,154,91,0.4)]">& Broadcasting</span>
              </h1>
            </div>

            {/* The Subtitle / Tagline */}
            <div className="overflow-hidden mt-6 relative">
              <h2 className="text-sm md:text-lg relative z-10 animate-slide-up text-center text-white/70 uppercase tracking-[0.8em] font-bold drop-shadow-[0_0_15px_rgba(196,154,91,0.3)]" style={{ animationDelay: '400ms' }}>
                <span className="text-[#c49a5b] drop-shadow-[0_0_10px_rgba(196,154,91,0.8)]">J E S U S</span> &nbsp; R E I G N S
              </h2>
            </div>
            
            {/* Elegant thin progress bar */}
            <div className="absolute bottom-24 flex flex-col items-center animate-slide-up" style={{ animationDelay: '800ms', animationDuration: '2s' }}>
               <div className="w-64 h-[1px] bg-white/10 overflow-hidden relative shadow-[0_0_10px_rgba(196,154,91,0.5)]">
                  <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-[#c49a5b] to-transparent animate-progress" style={{ width: '100%', animationDuration: '2.5s' }}></div>
               </div>
               <p className="text-[8px] uppercase tracking-[0.5em] font-bold text-[#c49a5b] mt-6 drop-shadow-[0_0_8px_rgba(196,154,91,0.5)]">Initializing System</p>
            </div>
          </div>
        </div>
      )}

      <div className={`h-screen bg-transparent flex flex-col overflow-hidden text-white/90 transition-opacity duration-1000 ${startup ? 'opacity-0' : 'opacity-100'}`}>
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 px-6 py-4 animate-slide-up">
        <div className="flex items-center justify-between bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-2xl px-6 py-3 border border-white/5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
          {/* Navigation Links - left side */}
          <nav className="hidden lg:flex items-center gap-2 ml-0 pl-2">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-500 text-[11px] font-bold tracking-widest uppercase hover-lux animate-slide-up ${isActive(item.path)
                  ? 'bg-gradient-to-r from-[#c49a5b]/20 to-transparent text-[#c49a5b] border border-[#c49a5b]/30 shadow-[0_0_15px_rgba(196,154,91,0.1)]'
                  : 'text-white/40 hover:text-white/90'
                  }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 pr-6 border-r border-white/10">
              <div className="hidden lg:block text-right">
                <p className="text-[#eaddcf] text-sm font-bold tracking-wide">{user?.name || 'User'}</p>
                <p className="text-[9px] text-[#c49a5b] uppercase tracking-[0.2em] font-bold mt-0.5">
                  {user?.role === 'admin' ? 'Administrator' : user?.role === 'manager' ? 'Manager' : 'Staff'}
                </p>
              </div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#c49a5b]/30 flex items-center justify-center text-[#c49a5b] shadow-[0_0_15px_rgba(196,154,91,0.2)] hover:shadow-[0_0_25px_rgba(196,154,91,0.4)] transition-all cursor-pointer font-serif text-lg">
                {user?.name?.charAt(0) || <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
              </div>
            </div>

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
                <div className="absolute right-0 top-full mt-2 w-56 z-[100] animate-slide-up">
                  <div className="bg-[#111111]/95 backdrop-blur-md border border-white/10 rounded-2xl p-2 shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-all duration-300">
                  <button
                    onClick={() => { setShowSettings('profile'); setShowOptions(false); }}
                    className="w-full text-left px-4 py-3 text-[10px] font-bold text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-[0.2em]"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => { setShowSettings('preferences'); setShowOptions(false); }}
                    className="w-full text-left px-4 py-3 text-[10px] font-bold text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-[0.2em]"
                  >
                    Settings
                  </button>
                  {isAdmin && (
                    <>
                      <div className="h-[1px] bg-white/10 my-1 mx-2"></div>
                      <button
                        onClick={() => { setShowSettings('designer'); setShowOptions(false); }}
                        className="w-full text-left px-4 py-3 text-[10px] font-bold text-[#c49a5b] hover:text-[#e8bd7f] hover:bg-[#c49a5b]/10 rounded-xl transition-all uppercase tracking-[0.2em]"
                      >
                        Theme Designer
                      </button>
                      <button
                        onClick={() => { setShowSettings('system'); setShowOptions(false); }}
                        className="w-full text-left px-4 py-3 text-[10px] font-bold text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-[0.2em]"
                      >
                        Data Export
                      </button>
                      <button
                        onClick={() => { setShowSettings('update'); setShowOptions(false); }}
                        className="w-full text-left px-4 py-3 text-[10px] font-bold text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-[0.2em]"
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
      <main className="flex-1 overflow-x-hidden overflow-y-auto py-6 lg:py-8 pb-32">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-1 left-1 right-1 z-50 glass-liquid border border-slate-200 dark:border-white/10 px-2 sm:px-4 py-3 sm:py-4 rounded-2xl flex justify-around items-center shadow-2xl animate-slide-up delay-200">
        {navItems.map((item, index) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1.5 transition-all hover-lux animate-scale-in ${isActive(item.path) ? 'text-blue-400 scale-110' : 'text-slate-500 dark:text-gray-400'
              }`}
            style={{ animationDelay: `${index * 50 + 200}ms` }}
          >
            {item.icon && <span className="flex items-center justify-center mb-0.5">{item.icon}</span>}
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="glass-liquid p-8 max-w-sm w-full mx-4 rounded-3xl border border-slate-300 dark:border-white/20 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
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

      {/* Futuristic Floating Dock */}
      <FloatingDock onCopilotClick={() => setShowCopilot(true)} />

      {/* Copilot Panel */}
      <CopilotPanel isOpen={showCopilot} onClose={() => setShowCopilot(false)} />

      {/* Global Command Palette */}
      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />
    </div>
    </>
  );
}
