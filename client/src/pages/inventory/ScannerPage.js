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
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError('');
    setFoundItem(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;

      // Attach stream directly to video element — avoids the golden ZXing flash
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);

      // Start ZXing decoding against the already-playing video
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        // Decode continuously using the video element (already has our stream)
        reader.decodeFromVideoElement(videoRef.current, (result, err) => {
          if (result) {
            const text = result.getText();
            stopCamera();
            searchByBarcode(text);
          }
        });
      } catch (zxErr) {
        console.warn('ZXing not available, manual entry only:', zxErr);
      }
    } catch (err) {
      setCameraError('Camera access was denied or is unavailable.');
      setScanning(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    if (mode === 'camera') startCamera();
    return () => stopCamera();
  }, [mode]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const lowStock = foundItem && foundItem.quantity <= foundItem.lowStockThreshold;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Barcode <span className="text-gradient">Scanner</span>
        </h2>
        <p className="text-slate-500 dark:text-gray-400 text-sm font-medium mt-1">
          Point the camera at a barcode or enter it manually to identify assets
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Camera / Manual input */}
        <div className="space-y-6">
          {/* Mode toggle */}
          <div className="glass-liquid p-1.5 rounded-2xl flex gap-1 border border-slate-200 dark:border-white/10">
            {['camera', 'manual'].map(m => (
              <button
                key={m}
                onClick={() => { stopCamera(); setMode(m); setFoundItem(null); }}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  mode === m
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-slate-500 dark:text-white/40 hover:text-slate-800 dark:text-white'
                }`}
              >
                {m === 'camera' ? '📷 Camera' : '⌨️ Manual'}
              </button>
            ))}
          </div>

          {/* Camera View */}
          {mode === 'camera' && (
            <div className="glass-liquid rounded-[2rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl">
              {cameraError ? (
                <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl">🚫</div>
                  <p className="text-red-400 text-sm font-bold">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="px-6 py-3 rounded-xl bg-white/80 dark:bg-white/10 hover:bg-white hover:text-slate-900 text-slate-800 dark:text-white text-xs font-black uppercase tracking-widest transition-all border border-slate-200 dark:border-white/10"
                  >
                    Retry Camera
                  </button>
                </div>
              ) : (
                <div className="relative aspect-[4/3] bg-black">
                  {/* Video element */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Corner bracket overlay — purely decorative, no flash */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="relative w-56 h-40">
                      {/* Top-left */}
                      <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg" />
                      {/* Top-right */}
                      <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg" />
                      {/* Bottom-left */}
                      <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg" />
                      {/* Bottom-right */}
                      <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg" />

                      {/* Animated scan line */}
                      <div className="absolute left-2 right-2 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80 animate-[scanline_2s_ease-in-out_infinite]" />
                    </div>
                  </div>

                  {/* Status bar */}
                  {scanning && (
                    <div className="absolute bottom-4 inset-x-0 flex justify-center">
                      <div className="px-5 py-2 rounded-full bg-black/50 backdrop-blur-md border border-slate-200 dark:border-white/10 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                        </span>
                        <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Scanning Active</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {scanning && (
                <div className="p-4 border-t border-white/5">
                  <button
                    onClick={stopCamera}
                    className="w-full py-3 rounded-xl bg-red-500/20 hover:bg-red-500 text-slate-800 dark:text-white text-xs font-black uppercase tracking-widest transition-all border border-red-500/20"
                  >
                    Stop Camera
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Manual Input */}
          {mode === 'manual' && (
            <div className="glass-liquid p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-2xl">
              <p className="text-xs font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-6">Enter Barcode or SKU</p>
              <form onSubmit={handleManualSearch} className="space-y-4">
                <input
                  autoFocus
                  className="w-full bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-slate-400 dark:border-white/30 rounded-2xl px-6 py-5 text-slate-800 dark:text-white text-base outline-none transition-all placeholder-slate-400 dark:placeholder-white/20 tracking-widest font-mono"
                  placeholder="e.g. SKU-1234567890AB"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!manualCode.trim() || searchLoading}
                  className="w-full py-4 rounded-2xl bg-white text-slate-900 font-black text-sm uppercase tracking-widest hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-lg"
                >
                  {searchLoading ? 'Searching...' : 'Identify Asset'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right: Result Panel */}
        <div>
          {!foundItem && !searchLoading && (
            <div className="glass-liquid rounded-[2rem] border border-slate-200 dark:border-white/10 border-dashed p-16 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/60 dark:bg-white/5 flex items-center justify-center text-4xl opacity-30">🏷️</div>
              <p className="text-slate-500 dark:text-white/30 text-sm font-bold uppercase tracking-widest">No Asset Identified Yet</p>
              <p className="text-white/15 text-xs">Scan a barcode or enter a code manually</p>
            </div>
          )}

          {searchLoading && (
            <div className="glass-liquid rounded-[2rem] border border-slate-200 dark:border-white/10 p-16 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-slate-200 dark:border-white/10 border-t-white/60 rounded-full animate-spin" />
              <p className="text-slate-500 dark:text-white/40 text-xs font-black uppercase tracking-widest">Querying Database...</p>
            </div>
          )}

          {foundItem && !searchLoading && (
            <div className="glass-liquid rounded-[2rem] border border-slate-300 dark:border-white/20 shadow-2xl overflow-hidden">
              {/* Top accent */}
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-blue-500 to-emerald-500" />

              <div className="p-8 space-y-8">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black text-slate-500 dark:text-white/30 uppercase tracking-[0.2em]">Identified Asset</span>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1 tracking-tight leading-tight">{foundItem.name}</h3>
                    <p className="font-mono text-xs text-slate-500 dark:text-white/30 mt-1">{foundItem.sku}</p>
                  </div>
                  {foundItem.imageUrl && (
                    <img
                      src={foundItem.imageUrl}
                      alt={foundItem.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-white/10 shadow-lg flex-shrink-0"
                    />
                  )}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/60 dark:bg-white/5 rounded-2xl p-5 border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-2">Stock Level</p>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-black ${lowStock ? 'text-red-400' : 'text-green-400'}`}>
                        {foundItem.quantity}
                      </span>
                      <span className="text-[10px] text-white/20 font-bold uppercase">units</span>
                    </div>
                    {lowStock && (
                      <span className="mt-2 inline-block text-[9px] font-black text-red-400 uppercase tracking-widest bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">
                        Low Stock
                      </span>
                    )}
                  </div>

                  <div className="bg-white/60 dark:bg-white/5 rounded-2xl p-5 border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-2">Category</p>
                    <p className="text-lg font-black text-slate-800 dark:text-white">{foundItem.category}</p>
                  </div>

                  <div className="bg-white/60 dark:bg-white/5 rounded-2xl p-5 border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-2">Location</p>
                    <p className="text-base font-bold text-slate-800 dark:text-white">{foundItem.location || '—'}</p>
                  </div>

                  <div className="bg-white/60 dark:bg-white/5 rounded-2xl p-5 border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-2">Warranty</p>
                    <p className={`text-sm font-bold ${foundItem.warrantyAvailable ? 'text-green-400' : 'text-slate-500 dark:text-white/40'}`}>
                      {foundItem.warrantyAvailable ? 'Active' : 'None'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    to={`/inventory/items/${foundItem._id}`}
                    className="flex-1 py-4 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-widest text-center hover:bg-gray-100 active:scale-95 transition-all shadow-lg"
                  >
                    View Full Details →
                  </Link>
                  <button
                    onClick={() => { setFoundItem(null); setManualCode(''); if (mode === 'camera') startCamera(); }}
                    className="px-6 py-4 rounded-2xl bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:bg-white/10 text-slate-800 dark:text-white text-xs font-black uppercase tracking-widest transition-all border border-slate-200 dark:border-white/10"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scan line keyframe — injected inline via style tag */}
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
