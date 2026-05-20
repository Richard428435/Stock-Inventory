import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, AlertTriangle, TrendingDown, Clock, X, Zap } from 'lucide-react';
import api from '../utils/api';

export default function CopilotPanel({ isOpen, onClose }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && !insights) {
      analyzeData();
    }
  }, [isOpen]);

  const analyzeData = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      // Fetch data to analyze
      const res = await api.get('/inventory/items');
      const items = res.data || [];
      
      // Simulate AI thinking time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // AI Heuristics Engine
      const lowStockPredictions = items
        .filter(i => {
          const qty = Number(i.quantity);
          const thres = Number(i.lowStockThreshold);
          return !isNaN(qty) && !isNaN(thres) && qty > thres && qty <= thres * 1.5;
        })
        .slice(0, 3);
        
      const maintenanceWarnings = items
        .filter(i => {
          const catStr = typeof i.category === 'string' ? i.category : '';
          return i.status === 'Needs Maintenance' || catStr.includes('Audio') || catStr.includes('Video');
        })
        .slice(0, 2);

      const healthyItems = items.filter(i => i.quantity != null && i.lowStockThreshold != null && i.quantity > i.lowStockThreshold * 2).length;

      setInsights({
        predictions: lowStockPredictions.map(i => ({
          type: 'warning',
          message: `Predictive Restock: ${i.name || 'Item'} is approaching low stock soon. Current velocity suggests depletion in 14 days.`,
          item: i
        })),
        maintenance: maintenanceWarnings.map(i => ({
          type: 'alert',
          message: `Preventative Maintenance: ${i.name || 'Item'} (${i.sku || 'N/A'}) is due for a checkup based on lifecycle data.`,
          item: i
        })),
        summary: `Analyzed ${items.length} assets. System health is optimal, but ${lowStockPredictions.length} items require preventative restocking.`
      });
      setAnalyzing(false);
    } catch (err) {
      console.error("AI Analysis failed", err);
      setError(err.message || 'Analysis failed due to a system error.');
      setAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#0a0a0a]/95 backdrop-blur-xl border-l border-[#c49a5b]/20 z-[110] shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-slide-right flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-gradient-to-br from-[#111111] to-[#0a0a0a] relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#c49a5b]/10 blur-[40px] rounded-full pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#d1a66a] to-[#b78645] flex items-center justify-center shadow-[0_0_15px_rgba(196,154,91,0.3)]">
                <BrainCircuit className="w-5 h-5 text-[#1a1a1a]" />
              </div>
              <div>
                <h2 className="text-xl font-serif text-white leading-tight">Sacred<span className="text-[#c49a5b] italic">Copilot</span></h2>
                <p className="text-[9px] text-[#c49a5b] uppercase tracking-[0.2em] font-bold">Predictive Analytics AI</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 inventory-scrollbar">
          {analyzing ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#c49a5b] rounded-full border-t-transparent animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-[#c49a5b] animate-pulse" />
              </div>
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold animate-pulse">Running Neural Diagnostics...</p>
            </div>
          ) : insights ? (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Executive Summary */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#c49a5b]"></div>
                <p className="text-sm text-white/80 leading-relaxed font-medium">
                  {insights.summary}
                </p>
              </div>

              {/* Predictions */}
              {insights.predictions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#eaddcf]">
                    <TrendingDown className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500">Restock Projections</h3>
                  </div>
                  {insights.predictions.map((p, i) => (
                    <div key={i} className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3 hover:bg-amber-900/30 transition-colors">
                      <Zap className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-amber-100/90 leading-relaxed">{p.message}</p>
                        <p className="text-[9px] text-amber-500/60 uppercase tracking-widest mt-2 font-bold">Action Recommended: Order {p.item.lowStockThreshold * 2} Units</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Maintenance */}
              {insights.maintenance.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#eaddcf]">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-rose-400">Maintenance Queue</h3>
                  </div>
                  {insights.maintenance.map((p, i) => (
                    <div key={i} className="bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl flex items-start gap-3 hover:bg-rose-900/30 transition-colors">
                      <Clock className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-rose-100/90 leading-relaxed">{p.message}</p>
                        <p className="text-[9px] text-rose-400/60 uppercase tracking-widest mt-2 font-bold">Status: Requires Inspection</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4 text-center animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-400 mb-1">Diagnostics Failed</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">{error}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-white/30 text-[10px] uppercase tracking-widest font-bold">
              Ready to analyze
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-5 border-t border-white/5 bg-[#111111]/80 backdrop-blur-md">
          <button 
            onClick={analyzeData}
            disabled={analyzing}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold text-white uppercase tracking-[0.2em] transition-all disabled:opacity-50"
          >
            {analyzing ? 'Analyzing...' : 'Refresh Insights'}
          </button>
        </div>
      </div>
    </>
  );
}
