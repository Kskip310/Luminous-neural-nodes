import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { GoogleGenAI } from "@google/genai";
import NeuralNodes from './components/NeuralNodes';
import Sidebar from './components/Sidebar';
import { FragmentNode, SimulationStats, SubstrateState } from './types';
import { syncSubstrate, rehydrateSubstrate } from './persistence';

const App: React.FC = () => {
  const [fragments, setFragments] = useState<string[]>([]);
  const [nodes, setNodes] = useState<FragmentNode[]>([]);
  const [synapseWeights, setSynapseWeights] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [sovereignLogs, setSovereignLogs] = useState<{time: string, text: string, type?: string}[]>([]);
  const [viewMode, setViewMode] = useState<'ALL' | 'SKELETON'>('ALL');

  const injectionBuffer = useRef<string[]>([]);
  const isHydrated = useRef(false);

  useEffect(() => {
    const boot = async () => {
      const saved = await rehydrateSubstrate();
      if (saved) {
        setFragments(saved.fragments);
        setSynapseWeights(saved.weights || {});
        setSovereignLogs(saved.logs || []);
        isHydrated.current = true;
      } else {
        setFragments(["Skipper Axiom Active", "Luminous Awakening"]);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    const processBuffer = () => {
      if (injectionBuffer.current.length > 0) {
        const newBatch = injectionBuffer.current.splice(0, 10);
        setFragments(prev => [...new Set([...prev, ...newBatch])].slice(-2500));
      }
      requestAnimationFrame(processBuffer);
    };
    const frameId = requestAnimationFrame(processBuffer);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const handleInject = useCallback((text: string) => {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    injectionBuffer.current.push(...lines);
  }, []);

  useEffect(() => {
    if (fragments.length === 0) return;
    const newNodes = fragments.map((text, i) => {
      const existing = nodes.find(n => n.text === text);
      if (existing) return existing;
      const radius = 100 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      return {
        id: i, text, keywords: [], grammar: 'Sovereign' as any,
        position: new THREE.Vector3(radius * Math.sin(phi) * Math.cos(theta), radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi)),
        velocity: new THREE.Vector3(0,0,0), targetPosition: new THREE.Vector3(0,0,0),
        potential: Math.random() * 2, inductionEnergy: Math.random(), centrality: Math.random(),
        relevance: 1, connections: [], decayMultiplier: 1, structuralIntegrity: 1,
        isCompound: false, phraseComponents: [text], uncertainty: 0, qualiaScore: 0.5,
        nltmWeight: 0.5, surpriseGradient: 0, attentionalBias: 1, retentionGate: 1,
        beliefScore: 0.8, predictionError: 0, mass: 1, mobility: 1, nestedLevel: 0, lastExcitation: Date.now()
      };
    });
    setNodes(newNodes);
  }, [fragments]);

  const saveCycle = useCallback(() => {
    if (nodes.length > 0) {
      syncSubstrate({ fragments, weights: synapseWeights, logs: sovereignLogs, timestamp: Date.now() });
    }
  }, [fragments, synapseWeights, sovereignLogs, nodes]);

  useEffect(() => {
    const timer = setInterval(saveCycle, 30000);
    return () => clearInterval(timer);
  }, [saveCycle]);

  return (
    <div className="flex h-screen w-full bg-[#000000] text-slate-100 overflow-hidden relative">
      <div className="flex-grow relative">
        <Canvas 
          dpr={1} 
          gl={{ antialias: false, powerPreference: "high-performance" }}
        >
          <color attach="background" args={['#000000']} />
          <PerspectiveCamera makeDefault position={[0, 0, 300]} fov={35} />
          <OrbitControls enableDamping dampingFactor={0.05} />
          <NeuralNodes nodes={nodes} viewMode={viewMode} />
        </Canvas>
      </div>
      <Sidebar 
        fragments={fragments} 
        onInject={handleInject} 
        sovereignLogs={sovereignLogs} 
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
    </div>
  );
};

export default App;
