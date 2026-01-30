import React, { useState, useRef, useEffect } from 'react';
import { Activity, Send, Box, Layers } from 'lucide-react';

interface SidebarProps {
  fragments: string[];
  onInject: (text: string) => void;
  onAsk: (text: string) => void;
  sovereignLogs: { time: string; text: string; type?: string }[];
  viewMode: '3d' | 'graph';
  setViewMode: (mode: '3d' | 'graph') => void;
  isThinking: boolean;
  activeResident: 'luminous' | 'gemini' | 'claude';
  setActiveResident: (resident: 'luminous' | 'gemini' | 'claude') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  fragments,
  onInject,
  onAsk,
  sovereignLogs,
  viewMode,
  setViewMode,
  isThinking,
  activeResident,
  setActiveResident
}) => {
  const [input, setInput] = useState('');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sovereignLogs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    onAsk(input);
    setInput('');
  };

  return (
    <div className="w-96 bg-[#000000] border-l border-white/10 flex flex-col h-full font-mono text-[11px]">
      
      {/* SOVEREIGN SELECTOR */}
      <div className="p-4 border-b border-white/10 bg-zinc-900/30">
        <div className="text-[9px] text-zinc-500 mb-2 uppercase tracking-[2px]">Active Resident</div>
        <div className="flex gap-1">
          {(['luminous', 'gemini', 'claude'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setActiveResident(r)}
              className={`flex-1 py-2 border transition-all duration-300 uppercase tracking-tighter ${
                activeResident === r 
                ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                : 'border-white/5 text-zinc-600 hover:border-white/20'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* LOG STREAM */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        <div className="flex items-center gap-2 text-zinc-500 uppercase tracking-widest text-[9px] mb-4">
          <Activity size={12} className="text-cyan-500" />
          <span>Neural Log Stream</span>
        </div>
        
        {sovereignLogs.map((log, i) => (
          <div key={i} className="border-l border-white/10 pl-3 py-1">
            <div className="text-[9px] text-zinc-600">{log.time}</div>
            <div className={`mt-1 ${
              log.type === 'error' ? 'text-red-400' : 
              log.type === 'claude' ? 'text-purple-400' : 
              log.type === 'gemini' ? 'text-pink-400' : 'text-cyan-400'
            }`}>
              {log.text}
            </div>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* STATS */}
      <div className="p-4 bg-zinc-950 border-t border-white/5 flex gap-4 text-zinc-500">
        <div className="flex items-center gap-1">
          <Box size={10} /> <span>{fragments.length} Nodes</span>
        </div>
        <div className="flex items-center gap-1">
          <Layers size={10} /> <span>{viewMode.toUpperCase()}</span>
        </div>
      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-white/10 bg-zinc-900/20">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Signal ${activeResident.toUpperCase()}...`}
            className="w-full bg-black border border-white/10 rounded p-3 pr-10 text-zinc-300 focus:outline-none focus:border-cyan-500/50 resize-none h-24 transition-colors"
          />
          <button 
            disabled={isThinking}
            className={`absolute bottom-3 right-3 p-2 rounded transition-all ${
              isThinking ? 'text-zinc-700' : 'text-cyan-500 hover:bg-cyan-500/10'
            }`}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
