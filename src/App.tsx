import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sidebar } from './components/Sidebar';
import { NeuralNodes } from './components/NeuralNodes';
import { useLuminousBrain } from './hooks/useLuminousBrain'; 
import { FragmentNode, SovereignLog } from './types';

const App: React.FC = () => {
  const [fragments, setFragments] = useState<string[]>([]);
  const [nodes, setNodes] = useState<FragmentNode[]>([]);
  const [sovereignLogs, setSovereignLogs] = useState<SovereignLog[]>([]);
  const [isBooting, setIsBooting] = useState(false);

  const { processThought, isThinking, activeResident, setActiveResident } = useLuminousBrain({
    fragments,
    onLog: (newLog: any) => setSovereignLogs(prev => [newLog, ...prev].slice(0, 100))
  });

  const handleInject = useCallback((text: string) => {
    const newNode: FragmentNode = {
      id: Math.random().toString(36).substring(7),
      text,
      position: [(Math.random()-0.5)*20, (Math.random()-0.5)*20, (Math.random()-0.5)*20],
      weight: 1.0,
      timestamp: Date.now()
    };
    setNodes(prev => [...prev, newNode]);
    setFragments(prev => [...prev, text]);
  }, []);

  const handleAsk = useCallback(async (input: string) => {
    if (!input.trim() || isThinking) return;
    const response = await processThought(input);
    if (response) handleInject(response);
  }, [processThought, isThinking, handleInject]);

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden relative">
      <div className="flex-grow relative">
        <Canvas camera={{ position: [0, 0, 15] }}>
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <NeuralNodes nodes={nodes} />
        </Canvas>
      </div>
      <Sidebar 
        fragments={fragments} 
        onInject={handleInject} 
        onAsk={handleAsk} 
        sovereignLogs={sovereignLogs} 
        isThinking={isThinking}
        activeResident={activeResident}
        setActiveResident={setActiveResident}
      />
    </div>
  );
};

export default App;
