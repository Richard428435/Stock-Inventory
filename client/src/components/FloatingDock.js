import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, QrCode, AlertOctagon, BarChart3, BrainCircuit, ShieldAlert } from 'lucide-react';

export default function FloatingDock({ onCopilotClick }) {
  const navigate = useNavigate();
  const [emergencyActive, setEmergencyActive] = useState(false);

  const toggleEmergency = () => {
    setEmergencyActive(!emergencyActive);
    if (!emergencyActive) {
      document.body.classList.add('emergency-override');
    } else {
      document.body.classList.remove('emergency-override');
    }
  };

  return (
    <>
      {/* Emergency Overlay CSS injected dynamically */}
      <style dangerouslySetInnerHTML={{__html: `
        body.emergency-override::after {
          content: "";
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at center, transparent 0%, rgba(225, 29, 72, 0.15) 100%);
          pointer-events: none;
          z-index: 9999;
          animation: pulse-red 2s infinite;
        }
        @keyframes pulse-red {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}} />

      {emergencyActive && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[150] bg-rose-600/90 backdrop-blur-xl text-white px-8 py-4 rounded-3xl border border-rose-400 shadow-[0_0_50px_rgba(225,29,72,0.5)] flex items-center gap-4 animate-slide-up">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
          <div>
            <h3 className="font-bold uppercase tracking-widest text-sm">Emergency Protocol Active</h3>
            <p className="text-[10px] text-rose-200">Backup inventory unlocked. Stream rerouted.</p>
          </div>
          <button onClick={toggleEmergency} className="ml-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">
            Stand Down
          </button>
        </div>
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] hidden lg:flex items-center gap-2 p-2 bg-[#111111]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_30px_60px_-10px_rgba(0,0,0,0.8)] animate-slide-up">
        
        <button 
          onClick={() => navigate('/inventory/scanner')}
          className="group relative w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
        >
          <QrCode className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
          <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-[#0a0a0a] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10">Scan</span>
        </button>

        <button 
          onClick={() => navigate('/inventory/items?action=add')}
          className="group relative w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
        >
          <Plus className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
          <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-[#0a0a0a] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10 whitespace-nowrap">Add Asset</span>
        </button>

        <div className="w-[1px] h-8 bg-white/10 mx-1"></div>

        <button 
          onClick={toggleEmergency}
          className={`group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(225,29,72,0.5)] ${emergencyActive ? 'bg-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.6)]' : 'bg-rose-500/10 hover:bg-rose-500/20'}`}
        >
          <AlertOctagon className={`w-5 h-5 ${emergencyActive ? 'text-white' : 'text-rose-400 group-hover:text-rose-300'} transition-colors`} />
          <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-rose-950 text-rose-400 border-rose-500/30 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border whitespace-nowrap">Emergency</span>
        </button>

        <div className="w-[1px] h-8 bg-white/10 mx-1"></div>

        <button 
          id="copilot-trigger"
          onClick={onCopilotClick}
          className="group relative w-12 h-12 rounded-xl bg-gradient-to-tr from-[#d1a66a] to-[#b78645] flex items-center justify-center transition-all hover:-translate-y-2 shadow-[0_0_15px_rgba(196,154,91,0.3)] hover:shadow-[0_10px_30px_rgba(196,154,91,0.6)]"
        >
          <BrainCircuit className="w-5 h-5 text-[#1a1a1a]" />
          <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-[#c49a5b] text-[#1a1a1a] text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">Copilot</span>
        </button>

      </div>
    </>
  );
}
