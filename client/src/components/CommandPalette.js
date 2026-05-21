import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mic, Command, X, Box, Activity, Map, MicOff, Settings } from 'lucide-react';
import api from '../utils/api';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
      // Layout handles cmd+k
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      try {
        const res = await api.get('/inventory/items', { params: { search: query } });
        const items = res.data.items || res.data;
        setResults(items.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }
    
    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      
      // Voice Commands Logic
      const lower = transcript.toLowerCase();
      if (lower.includes('map') || lower.includes('spatial')) {
        navigate('/inventory/map');
        onClose();
      } else if (lower.includes('audit')) {
        navigate('/inventory/audit');
        onClose();
      } else if (lower.includes('copilot') || lower.includes('diagnostics') || lower.includes('ai')) {
        onClose();
        document.getElementById('copilot-trigger')?.click();
      }
    };
    
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] animate-fadeIn" onClick={onClose} />
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-[#111111]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_30px_60px_-10px_rgba(0,0,0,0.8)] z-[210] overflow-hidden animate-scale-in">
        
        {/* Search Input Area */}
        <div className="relative flex items-center p-4 border-b border-white/10">
          <Search className="w-6 h-6 text-white/40 ml-2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search assets..."
            className="w-full bg-transparent border-none text-xl text-white placeholder-white/30 px-4 focus:outline-none font-serif"
          />
          <button 
            onClick={toggleVoice} 
            className={`p-3 rounded-full transition-all ${isListening ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'}`}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <div className="ml-4 px-2 py-1 bg-white/5 rounded text-[10px] text-white/30 font-bold tracking-widest uppercase flex items-center gap-1 border border-white/5">
            <Command className="w-3 h-3" /> ESC
          </div>
        </div>

        {/* Dynamic Results & Suggestions */}
        <div className="p-4 max-h-[60vh] overflow-y-auto inventory-scrollbar">
          
          {!query && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-3 px-2">Voice Commands Available</h3>
                <div className="flex gap-2 flex-wrap">
                  <div className="px-3 py-2 bg-white/5 rounded-xl border border-white/5 text-[11px] text-white/50 flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer" onClick={toggleVoice}>
                    <Mic className="w-3 h-3 text-[#c49a5b]" /> "Open Spatial Map"
                  </div>
                  <div className="px-3 py-2 bg-white/5 rounded-xl border border-white/5 text-[11px] text-white/50 flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer" onClick={toggleVoice}>
                    <Mic className="w-3 h-3 text-[#c49a5b]" /> "Run AI Diagnostics"
                  </div>
                  <div className="px-3 py-2 bg-white/5 rounded-xl border border-white/5 text-[11px] text-white/50 flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer" onClick={toggleVoice}>
                    <Mic className="w-3 h-3 text-[#c49a5b]" /> "Start Audit"
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-3 px-2">Quick Navigation</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { navigate('/inventory/map'); onClose(); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-left transition-colors border border-transparent hover:border-white/10 group">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform"><Map className="w-4 h-4" /></div>
                    <div>
                      <div className="text-sm font-medium text-white/90">Spatial Map</div>
                      <div className="text-[9px] uppercase tracking-widest text-white/40">View facility floorplan</div>
                    </div>
                  </button>
                  <button onClick={() => { navigate('/inventory/audit'); onClose(); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-left transition-colors border border-transparent hover:border-white/10 group">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform"><Activity className="w-4 h-4" /></div>
                    <div>
                      <div className="text-sm font-medium text-white/90">Rapid Audit</div>
                      <div className="text-[9px] uppercase tracking-widest text-white/40">Reconcile inventory</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {query && results.length > 0 && (
            <div className="space-y-2 animate-fadeIn">
              <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-3 px-2">Assets Match ({results.length})</h3>
              {results.map((item) => (
                <button 
                  key={item._id} 
                  onClick={() => { navigate(`/inventory/items/${item._id}`); onClose(); }}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#c49a5b] group-hover:scale-110 transition-transform">
                    <Box className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white/90 truncate font-serif">{item.name}</div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40 truncate">{item.category} • {item.location || 'No Location'}</div>
                  </div>
                  <div className="text-[#c49a5b] font-serif pr-2 text-lg">{item.quantity} <span className="text-[10px] text-white/30 tracking-widest uppercase font-sans">units</span></div>
                </button>
              ))}
            </div>
          )}

          {query && results.length === 0 && (
            <div className="text-center py-12 animate-fadeIn">
              <Search className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-white/60 font-serif">No assets or commands found for "{query}"</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
