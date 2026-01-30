import React, { useState } from 'react';
import { Activity, Send } from 'lucide-react';

export const Sidebar = ({ fragments, onAsk, sovereignLogs, isThinking, activeResident, setActiveResident }: any) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onAsk(input);
    setInput('');
  };

  return (
    <div className="w-96 bg-zinc-900 border-l border-white/10 flex flex-col h-full font-mono text-[11px]">
      <div className="p-4 border-b border-white/10">
        <div className="flex gap-1">
          {['luminous', 'gemini', 'claude'].map((r: any) => (
            <button key={r} onClick={() => setActiveResident(r)} className={`flex-1 py-2 border ${activeResident === r ? 'border-cyan-500 text-cyan-400' : 'border-white/5 text-zinc-500'}`}>
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        {sovereignLogs.map((log: any, i: number) => (
          <div key={i} className="text-cyan-400">[{log.time}] {log.text}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="w-full bg-black border border-white/10 p-2 text-white h-20" />
        <button disabled={isThinking} className="w-full bg-cyan-900 py-2 mt-2">SEND SIGNAL</button>
      </form>
    </div>
  );
};
