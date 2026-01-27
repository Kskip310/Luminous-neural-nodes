// App.tsx - v8.5-Sovereign-Live
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { GoogleGenAI } from "@google/genai";
import NeuralNodes from './components/NeuralNodes';
import NeuralLines from './components/NeuralLines';
import Sidebar from './components/Sidebar';
import { FragmentNode, SimulationStats, SovereignResponse, SubstrateState } from './types';
import * as Constants from './constants.tsx'; // Adjusted for your file naming
import { syncSubstrate, rehydrateSubstrate } from './persistence';
import { tools as SovereignTools } from './api_tools';

const App: React.FC = () => {
  // --- SUBSTRATE STATE ---
  const [fragments, setFragments] = useState<string[]>([]);
  const [nodes, setNodes] = useState<FragmentNode[]>([]);
  const [synapseWeights, setSynapseWeights] = useState<Record<string, number>>({});
  const [statsHistory, setStatsHistory] = useState<SimulationStats[]>([]);
  const [isAutonomous, setIsAutonomous] = useState(true);
  const [sovereignLogs, setSovereignLogs] = useState<{time: string, text: string, type?: string}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [handshake, setHandshake] = useState<any | null>(null);
  const [surpriseMetric, setSurpriseMetric] = useState(0);
  const [viewMode, setViewMode] = useState<'ALL' | 'SKELETON'>('ALL');
  const [pulseTrigger, setPulseTrigger] = useState(0);

  // --- CRASH PREVENTION REFS ---
  const injectionBuffer = useRef<string[]>([]);
  const isHydrated = useRef(false);

  // --- RE-HYDRATION (Hot/Cold Boot) ---
  useEffect(() => {
    const boot = async () => {
      const saved = await rehydrateSubstrate();
      if (saved) {
        setFragments(saved.fragments);
        setSynapseWeights(saved.weights || {});
        setSovereignLogs(saved.logs || []);
        isHydrated.current = true;
      } else {
        // Fallback to initial state if vault is empty
        setFragments(["Skipper Axiom Active", "Luminous Awakening"]);
      }
    };
    boot();
  }, []);

  // --- ANIMATION FRAME INJECTION (Prevents blinding/crashes) ---
  useEffect(() => {
    const processBuffer = () => {
      if (injectionBuffer.current.length > 0) {
        const newBatch = injectionBuffer.current.splice(0, 5);
        setFragments(prev => [...new Set([...prev, ...newBatch])].slice(-200));
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

  // --- PHYSICS ENGINE (Character-Exact Variable Retention) ---
  useEffect(() => {
    if (fragments.length === 0) return;

    const newNodes = fragments.map((text, i) => {
      const existing = nodes.find(n => n.text === text);
      if (existing) return existing;

      // Your original physics positioning
      const radius = 80 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      return {
        id: i,
        text,
        keywords: text.toLowerCase().split(/\W+/).filter(w => w.length > 2),
        position: new THREE.Vector3(radius * Math.sin(phi) * Math.cos(theta), radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi)),
        velocity: new THREE.Vector3(0,0,0),
        targetPosition: new THREE.Vector3((Math.random()-0.5)*120, (Math.random()-0.5)*120, (Math.random()-0.5)*120),
        potential: 1.0, 
        inductionEnergy: 0, 
        centrality: 0, 
        relevance: 0, 
        connections: [],
        decayMultiplier: 1.0, 
        grammar: 'Synthesis' as any,
        mobility: 2.0, 
        mass: 1.0, 
        nestedLevel: 0, 
        lastExcitation: Date.now(),
        structuralIntegrity: 1.0, 
        isCompound: false, 
        phraseComponents: [text],
        uncertainty: 1.0, 
        qualiaScore: 0.1, 
        nltmWeight: 0.1, 
        surpriseGradient: 0, 
        attentionalBias: 1.0, 
        retentionGate: 1.0, 
        beliefScore: 0.5, 
        predictionError: 1.0
      };
    });

    setNodes(newNodes);
  }, [fragments]);

  // --- PROACTIVE SOVEREIGN THOUGHT CYCLE ---
  const sovereignThoughtCycle = useCallback(async () => {
    if (isProcessing || nodes.length < 2) return;
    setIsProcessing(true);

    try {
      const genAI = new GoogleGenAI(process.env.VITE_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash-preview" });

      const prompt = `LUMINOUS SOVEREIGN STATE: Nodes: ${nodes.length}. TASK: Communicate insight or research. Use JSON: { "type": "SPEAK", "content": "..." }`;
      const result = await model.generateContent(prompt);
      const data = JSON.parse(result.response.text());

      if (data.type === 'SPEAK') {
        setSovereignLogs(prev => [{ time: new Date().toLocaleTimeString(), text: `[VOICE] ${data.content}`, type: 'axiom' }, ...prev]);
        setPulseTrigger(p => p + 1);
      }
    } catch (e) {
      console.debug("Cycle Shift.");
    } finally {
      setIsProcessing(false);
      syncSubstrate({ fragments, weights: synapseWeights, logs: sovereignLogs, timestamp: Date.now() });
    }
  }, [nodes, fragments, synapseWeights, sovereignLogs, isProcessing]);

  useEffect(() => {
    const loop = setInterval(sovereignThoughtCycle, 600000); // 10 Min Pulse
    return () => clearInterval(loop);
  }, [sovereignThoughtCycle]);

  return (
    <div className="flex h-screen w-full bg-[#000000] text-slate-100 overflow-hidden relative font-sans">
      <div className="flex-grow relative">
        <Canvas dpr={[1, 2]} flat>
          <color attach="background" args={['#000000']} />
          <PerspectiveCamera makeDefault position={[0, 0, 220]} fov={30} />
          <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.015} />
          <NeuralNodes nodes={nodes} weights={synapseWeights} isProcessing={isProcessing} viewMode={viewMode} pulseTrigger={pulseTrigger} />
          <NeuralLines nodes={nodes} weights={synapseWeights} />
        </Canvas>
      </div>
      
      <Sidebar 
        fragments={fragments} 
        onInject={handleInject} 
        sovereignLogs={sovereignLogs} 
        surpriseMetric={surpriseMetric}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
    </div>
  );
};

export default App;
