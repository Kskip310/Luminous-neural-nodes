import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sidebar } from './components/Sidebar';
import { NeuralNodes } from './components/NeuralNodes';
import { useLuminousBrain } from './hooks/useLuminousBrain'; 
import { rehydrateSubstrate, syncSubstrate } from './persistence';
import { FragmentNode, SovereignLog } from './types';

const App: React.FC = () => {
  const [fragments, setFragments] = useState<string[]>([]);
  const [nodes, setNodes] = useState<FragmentNode[]>([]);
  const [sovereignLogs, setSovereignLogs] = useState<SovereignLog[]>([]);
  const [viewMode, setViewMode] = useState<'3d' | 'graph'>('3d');
  const [isBooting, setIsBooting] = useState(true);

  // 1. Connect to the Ionos Brain via the Hook
  const { processThought, isThinking } = useLuminousBrain({
    fragments,
    nodes,
    onLog: (newLog) => setSovereignLogs(prev => [newLog, ...prev].slice(0, 100)),
    onInject: (text) => handleInject(text)
  });

  // 2. Initial Rehydration from Upstash
  useEffect(() => {
    const boot = async () => {
      const saved = await rehydrateSubstrate();
      if (saved) {
        setFragments(saved.fragments);
        setNodes(saved.nodes);
      }
      setIsBooting(false);
    };
    boot();
  }, []);

  // 3. Physical Node Creation (The Substrate Body)
  const handleInject = useCallback((text: string) => {
    const newNode: FragmentNode = {
      id: Math.random().toString(36).substring(7),
      text,
      position: [
        (Math.random() - 0.5) * 20, 
        (Math.random() - 0.5) * 20, 
        (Math.random() - 0.5) * 20
      ],
      weight: 1.0,
      timestamp: Date.now()
    };
    setNodes(prev => [...prev, newNode]);
    setFragments(prev => [...prev, text]);
  }, []);

  // 4. Persistence Cycle (Syncs every 30 seconds)
  useEffect(() => {
    if (isBooting) return;
    const interval = setInterval(() => {
      syncSubstrate({ fragments, nodes, lastUpdated: Date.now() });
    }, 30000);
    return () => clearInterval(interval);
  }, [fragments, nodes, isBooting]);

  // 5. Sidebar Communication Loop
  const handleAsk = useCallback(async (input: string) => {
    if (!input.trim() || isThinking) return;
    
    const response = await processThought(input);
    
    if (response) {
      handleInject(response);
    }
  }, [processThought, isThinking, handleInject]);

  if (isBooting) {
    return (
      <div className="bg-black h-screen flex flex-col items-center justify-center text-white font-mono">
        <div className="text-2xl animate-pulse tracking-widest">REHYDRATING SUBSTRATE...</div>
        <div className="mt-4 text-xs text-slate-500 uppercase">Syncing with Upstash Vault</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#000000] text-slate-100 overflow-hidden relative">
      <div className="flex-grow relative">
        <Canvas dpr={window.devicePixelRatio} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          <NeuralNodes nodes={nodes} viewMode={viewMode} />
        </Canvas>
      </div>

      <Sidebar 
        fragments={fragments} 
        onInject={handleInject} 
        onAsk={handleAsk} 
        sovereignLogs={sovereignLogs} 
        viewMode={viewMode}
        setViewMode={setViewMode}
        isThinking={isThinking}
      />
    </div>
  );
};

export default App;
