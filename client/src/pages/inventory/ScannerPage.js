import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ScannerPage() {
  const [manualCode, setManualCode] = useState('');
  const [foundItem, setFoundItem] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [mode, setMode] = useState('camera'); // 'camera' | 'manual'
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const readerRef = useRef(null);

  const searchByBarcode = async (code) => {
    setSearchLoading(true);
    try {
      const r = await api.get(`/inventory/items/barcode/${encodeURIComponent(code.trim())}`);
      setFoundItem(r.data);
      toast.success('Item identified!');
    } catch {
      toast.error('No item found for this barcode.');
      setFoundItem(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (manualCode.trim()) searchByBarcode(manualCode.trim());
  };

  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'

  const stopCamera = useCallback(() => {
    if (readerRef.current) {
      try { readerRef.current.reset(); } catch (_) {}
      readerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async (customFacing) => {
    const fMode = customFacing || facingMode;
    setCameraError('');
    setFoundItem(null);
    setCameraActive(true);
    try {
      const constraints = {
        video: { 
          facingMode: { ideal: fMode },
          width: { min: 640, ideal: 1280 },
          height: { min: 480, ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.error("Video play failed:", e));
          setScanning(true);
        };
      }

      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        reader.decodeFromVideoElement(videoRef.current, (result, err) => {
          if (result && videoRef.current) {
            const text = result.getText();
            stopCamera();
            searchByBarcode(text);
          }
        });
      } catch (zxErr) {
        console.warn('Barcode engine init failed:', zxErr);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera or this camera mode is not supported.');
      setScanning(false);
      setCameraActive(false);
    }
  }, [stopCamera, facingMode]);

  const toggleCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    if (cameraActive) {
      stopCamera();
      // Small delay to ensure clean hardware release
      setTimeout(() => startCamera(newMode), 300);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const lowStock = foundItem && foundItem.quantity <= foundItem.lowStockThreshold;

  return (
    <div className="min-h-screen space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Scanner</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div className="space-y-8">
          <div className="glass-liquid rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl min-h-[400px] flex flex-col">
            <div className="flex p-2 gap-2 bg-slate-100/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
              {['camera', 'manual'].map(m => (
                <button
                  key={m}
                  onClick={() => { stopCamera(); setMode(m); setFoundItem(null); }}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    mode === m 
                      ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xl' 
                      : 'text-slate-500 dark:text-white/30 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex-1 relative flex flex-col justify-center items-center">
              {mode === 'camera' ? (
                <>
                  {!cameraActive && (
                    <div className="p-12 text-center space-y-6 fade-in">
                      <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-white/5 mx-auto flex items-center justify-center text-4xl shadow-inner mb-4">📷</div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-black text-slate-800 dark:text-white">Scanner Standby</h4>
                        <p className="text-slate-500 dark:text-white/30 text-xs font-medium max-w-[240px] mx-auto leading-relaxed">
                          For your privacy, we ask for camera permission every time you initiate a scan.
                        </p>
                      </div>
                      <button 
                         onClick={startCamera}
                         className="px-10 py-5 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-2xl"
                      >
                        Grant Permission & Start
                      </button>
                    </div>
                  )}

                  {cameraError && (
                    <div className="p-12 text-center space-y-4 fade-in">
                      <div className="w-16 h-16 rounded-full bg-red-400/10 border border-red-400/20 mx-auto flex items-center justify-center text-2xl">⚠️</div>
                      <p className="text-red-400 text-sm font-bold">{cameraError}</p>
                      <button onClick={startCamera} className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest hover:text-slate-800 dark:hover:text-white transition-colors">Retry Request</button>
                    </div>
                  )}

                  {cameraActive && !cameraError && (
                    <div className="relative w-full h-full min-h-[400px] bg-black group overflow-hidden">
                      <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                      
                      {/* Rotate Camera Button */}
                      <button 
                        onClick={toggleCamera}
                        className="absolute top-4 right-4 z-10 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all active:scale-90 shadow-2xl"
                        title="Switch Camera"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                      </button>

                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="relative w-56 h-40">
                          <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg" />
                          <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg" />
                          <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg" />
                          <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg" />
                          <div className="absolute left-2 right-2 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80 animate-[scanline_2s_ease-in-out_infinite]" />
                        </div>
                      </div>

                      {scanning && (
                        <div className="absolute bottom-4 inset-x-0 flex justify-center">
                          <div className="px-5 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                            </span>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Scanning Active</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {scanning && (
                    <div className="p-4 border-t border-white/5 w-full">
                      <button
                        onClick={stopCamera}
                        className="w-full py-3 rounded-xl bg-red-500/20 hover:bg-red-500 transition-all text-white text-[10px] font-black uppercase tracking-widest"
                      >
                        Stop Camera
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-10 w-full animate-fadeIn">
                  <p className="text-[10px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-6 text-center">Manual SKU Identification</p>
                  <form onSubmit={handleManualSearch} className="space-y-4">
                    <input
                      autoFocus
                      className="w-full bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-slate-400 dark:border-white/30 rounded-2xl px-6 py-5 text-slate-800 dark:text-white text-base outline-none transition-all placeholder-slate-400 dark:placeholder-white/20 tracking-widest font-mono"
                      placeholder="e.g. SKU-123456789"
                      value={manualCode}
                      onChange={e => setManualCode(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!manualCode.trim() || searchLoading}
                      className="w-full py-5 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 shadow-2xl"
                    >
                      {searchLoading ? 'Scanning Database...' : 'Identify Asset'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          {!foundItem && !searchLoading && (
            <div className="glass-liquid rounded-[2.5rem] border border-slate-200 dark:border-white/10 border-dashed p-16 flex flex-col items-center justify-center text-center gap-6 opacity-60">
              <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-5xl grayscale opacity-30">🏷️</div>
              <div className="space-y-2">
                <p className="text-slate-800 dark:text-white text-sm font-black uppercase tracking-widest">No Asset Identified</p>
                <p className="text-slate-500 dark:text-white/20 text-[10px] uppercase font-bold tracking-widest">Scan or enter a manual code to pull details</p>
              </div>
            </div>
          )}

          {searchLoading && (
            <div className="glass-liquid rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-16 flex flex-col items-center justify-center gap-6">
              <div className="w-16 h-16 border-4 border-slate-200 dark:border-white/10 border-t-slate-800 dark:border-t-white rounded-full animate-spin" />
              <p className="text-slate-500 dark:text-white/30 text-[10px] font-black uppercase tracking-widest animate-pulse">Syncing with Registry...</p>
            </div>
          )}

          {foundItem && !searchLoading && (
            <div className="glass-liquid rounded-[2.5rem] border border-slate-300 dark:border-white/20 shadow-2xl overflow-hidden animate-fadeIn">
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
              <div className="p-10 space-y-10">
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em]">Verified Asset</span>
                    <h3 className="text-4xl font-black text-slate-800 dark:text-white leading-none tracking-tight">{foundItem.name}</h3>
                    <p className="font-mono text-xs text-slate-500 dark:text-white/30 truncate">{foundItem.sku}</p>
                  </div>
                  {foundItem.imageUrl && (
                    <img src={foundItem.imageUrl} alt={foundItem.name} className="w-28 h-28 rounded-3xl object-cover border border-slate-200 dark:border-white/10 shadow-2xl skew-y-1" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/5">
                    <p className="text-[9px] font-black text-slate-500 dark:text-white/20 uppercase tracking-widest mb-3">Inventory Level</p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-black ${lowStock ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>{foundItem.quantity}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Units</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/5">
                    <p className="text-[9px] font-black text-slate-500 dark:text-white/20 uppercase tracking-widest mb-3">Asset Group</p>
                    <p className="text-xl font-black text-slate-800 dark:text-white truncate">{foundItem.category}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link to={`/inventory/items/${foundItem._id}`} className="flex-1 py-5 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-widest text-center hover:scale-[1.02] transition-all shadow-xl">
                    Full Registry Details →
                  </Link>
                  <button onClick={() => { setFoundItem(null); setManualCode(''); }} className="px-8 py-5 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/30 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scanline {
          0% { top: 4px; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: calc(100% - 4px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
