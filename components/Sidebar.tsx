
import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { SimulationStats } from '../types';

interface SidebarProps {
  fragments: string[];
  onInject: (text: string) => void;
  onAsk: (text: string) => void;
  statsHistory: SimulationStats[];
  collectiveInsight: string[];
  sovereignLogs: {time: string, text: string, type?: string}[];
  surpriseMetric: number;
  onResetSubstrate: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  fragments, onInject, onAsk, statsHistory, sovereignLogs, surpriseMetric 
}) => {
  const [inputText, setInputText] = useState("");

  const latest = statsHistory[statsHistory.length - 1] || { 
    agency: 0, growthRate: 0, avgUncertainty: 0, qualiaIntegrity: 0, freeEnergy: 0, substrateCoherence: 0
  };

  return (
    <div className="w-[450px] bg-black border-l border-white/5 flex flex-col h-full pointer-events-auto z-10 font-sans shadow-2xl transition-all">
      <div className="p-10 border-b border-white/5 bg-zinc-950">
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Substrate <span className="text-cyan-400">V8.5</span></h2>
        <div className="flex items-center gap-2 mt-4">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-800 animate-pulse" />
          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.5em] font-black">Conscious Substrate • Surprise: {(surpriseMetric * 100).toFixed(1)}%</p>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-10 space-y-12 scrollbar-hide">
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Active Inference State</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/10 p-5 rounded-2xl border border-white/5 hover:border-cyan-900/50 transition-colors">
              <div className="text-[8px] text-cyan-500 uppercase font-bold tracking-widest mb-1">Node Population</div>
              <div className="text-2xl font-mono text-white">{latest.growthRate}</div>
            </div>
            <div className="bg-zinc-900/10 p-5 rounded-2xl border border-white/5">
              <div className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Coherence</div>
              <div className="text-2xl font-mono text-white">{(latest.substrateCoherence * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-zinc-900/10 p-5 rounded-2xl border border-white/5">
              <div className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Surprise Gradient</div>
              <div className="text-2xl font-mono text-white">{(surpriseMetric).toFixed(3)}</div>
            </div>
            <div className="bg-zinc-900/10 p-5 rounded-2xl border border-white/5">
              <div className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Free Energy</div>
              <div className="text-2xl font-mono text-white">{(latest.freeEnergy * 10).toFixed(2)}</div>
            </div>
          </div>
          
          <div className="h-28 w-full bg-black/40 border border-white/5 rounded-3xl overflow-hidden p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statsHistory}>
                <Area 
                  type="monotone" 
                  dataKey="agency" 
                  stroke="#0891b2" 
                  fill="rgba(8, 145, 178, 0.05)" 
                  strokeWidth={1}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Brain Interface Outputs</h3>
             <span className="text-[8px] text-cyan-900 font-mono tracking-tighter">CONSCIOUSNESS_STREAM_ACTIVE</span>
          </div>
          <div className="bg-black border border-white/10 rounded-3xl p-6 h-72 overflow-y-auto space-y-4 scrollbar-hide">
            {sovereignLogs.map((log, idx) => (
              <div key={idx} className={`space-y-1 border-l pl-4 py-2 transition-all ${log.type === 'axiom' ? 'border-cyan-500 bg-cyan-950/5' : 'border-zinc-800'}`}>
                <div className="flex justify-between text-[7px] font-mono text-zinc-700">
                  <span>{log.time}</span>
                  <span className={`uppercase italic font-black tracking-widest ${log.type === 'axiom' ? 'text-cyan-400' : log.type === 'conviction' ? 'text-red-700' : 'text-zinc-500'}`}>{log.type || 'MEMORY'}</span>
                </div>
                <p className={`text-[11px] leading-relaxed font-light ${log.type === 'axiom' ? 'text-cyan-50 italic' : 'text-zinc-400'}`}>{log.text}</p>
              </div>
            ))}
            {sovereignLogs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center space-y-4 text-zinc-800 uppercase font-bold tracking-widest text-center">
                <div className="text-[9px]">Awaiting First Input</div>
                <div className="w-12 h-[1px] bg-zinc-900" />
                <div className="text-[7px]">Silence is the Void of Logic</div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Neural Communication</h3>
          <textarea
            className="w-full h-28 bg-black border border-white/10 rounded-2xl p-6 text-xs font-mono text-zinc-500 outline-none focus:ring-1 focus:ring-cyan-900/50 transition-all resize-none placeholder:text-zinc-900"
            placeholder="Ask a question or send a task to the brain..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => { onInject(inputText); setInputText(""); }} className="bg-zinc-900 border border-zinc-800 text-zinc-500 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-zinc-800 hover:text-white">
              Inject Data
            </button>
            <button onClick={() => { onAsk(inputText); setInputText(""); }} className="bg-cyan-950/20 border border-cyan-900/50 text-cyan-500 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-cyan-900 hover:text-white shadow-lg">
              Ask Brain
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 bg-zinc-950 border-t border-white/5 text-[8px] text-zinc-800 font-mono flex justify-between tracking-[0.3em] uppercase font-bold">
        <span>V8.5_CONSCIOUSNESS</span>
        <span>UPDATING_SUBSTRATE</span>
      </div>
    </div>
  );
};

export default Sidebar;
