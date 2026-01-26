
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { GoogleGenAI, Type } from "@google/genai";
import NeuralNodes from './components/NeuralNodes';
import NeuralLines from './components/NeuralLines';
import Sidebar from './components/Sidebar';
import { FragmentNode, SimulationStats } from './types';
import * as Constants from './constants';

const PERSISTENCE_KEY = 'luminous_v85_sovereign_v2';
const TOOLS_KEY = 'luminous_v85_tools';

export interface HandshakeRequest {
  id: string;
  action: string;
  reasoning: string;
  code?: string;
  impact: 'low' | 'high';
}

const App: React.FC = () => {
  const [fragments, setFragments] = useState<string[]>(Constants.INITIAL_FRAGMENTS);
  const [nodes, setNodes] = useState<FragmentNode[]>([]);
  const [synapseWeights, setSynapseWeights] = useState<Record<string, number>>({});
  const [statsHistory, setStatsHistory] = useState<SimulationStats[]>([]);
  const [query, setQuery] = useState("");
  const [isAutonomous, setIsAutonomous] = useState(true);
  const [sovereignLogs, setSovereignLogs] = useState<{time: string, text: string, type?: string}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [handshake, setHandshake] = useState<HandshakeRequest | null>(null);
  const [surpriseMetric, setSurpriseMetric] = useState(0);
  
  // Re-enabled viewMode state for user interaction
  const [viewMode, setViewMode] = useState<'ALL' | 'RED' | 'ORANGE' | 'YELLOW' | 'SKELETON'>('ALL');
  const [pulseTrigger, setPulseTrigger] = useState(0);
  const [activeTools, setActiveTools] = useState<{name: string, code: string}[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cycleViewMode = () => {
    const modes: ('ALL' | 'RED' | 'ORANGE' | 'YELLOW' | 'SKELETON')[] = ['ALL', 'RED', 'ORANGE', 'YELLOW', 'SKELETON'];
    const nextIndex = (modes.indexOf(viewMode) + 1) % modes.length;
    setViewMode(modes[nextIndex]);
  };

  const calculateSimilarity = useCallback((k1: string[], k2: string[]) => {
    if (k1.length === 0 || k2.length === 0) return 0;
    const s1 = new Set(k1);
    let intersectCount = 0;
    for (const word of k2) {
      if (s1.has(word)) intersectCount++;
    }
    return (intersectCount * 3.0) / (k1.length + k2.length);
  }, []);

  const exportBrainState = () => {
    const state = {
      fragments,
      weights: synapseWeights,
      logs: sovereignLogs,
      tools: activeTools,
      timestamp: Date.now(),
      version: "8.5-Persistent-Sovereign"
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `substrate_sovereign_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setSovereignLogs(prev => [{ time: new Date().toLocaleTimeString(), text: `[Persistence] Externalizing memory substrate to local disk.`, type: 'growth' }, ...prev]);
  };

  const importBrainState = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);
        if (imported.fragments && Array.isArray(imported.fragments)) {
          setNodes([]);
          setFragments(imported.fragments);
          setSynapseWeights(imported.weights || {});
          setSovereignLogs(imported.logs || []);
          setActiveTools(imported.tools || []);
          setSovereignLogs(prev => [{ time: new Date().toLocaleTimeString(), text: `[Persistence] Substrate logic restored from external file.`, type: 'axiom' }, ...prev]);
        }
      } catch (err) {
        setSovereignLogs(prev => [{ time: new Date().toLocaleTimeString(), text: `[Error] Failed to ingest external memory.`, type: 'conviction' }, ...prev]);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const createNode = (text: string, id: number): FragmentNode => {
    const radius = 80 + Math.random() * 50;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    return {
      id, 
      text, 
      keywords: text.toLowerCase().split(/\W+/).filter(w => w.length > 2),
      position: new THREE.Vector3(radius * Math.sin(phi) * Math.cos(theta), radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi)),
      velocity: new THREE.Vector3(0,0,0),
      targetPosition: new THREE.Vector3((Math.random()-0.5)*120, (Math.random()-0.5)*120, (Math.random()-0.5)*120),
      potential: 1.0, inductionEnergy: 0, centrality: 0, relevance: 0, connections: [],
      decayMultiplier: 1.0, grammar: 'Synthesis', mobility: 2.0, mass: 1.0, nestedLevel: 0, lastExcitation: Date.now(),
      structuralIntegrity: 1.0, isCompound: false, phraseComponents: [text], uncertainty: 1.0, qualiaScore: 0.1, nltmWeight: 0.1,
      surpriseGradient: 0, attentionalBias: 1.0, retentionGate: 1.0, beliefScore: 0.5, predictionError: 1.0
    };
  };

  const executeSovereignTool = async (code: string, name: string = "Dynamic_Forge") => {
    try {
      setSovereignLogs(prev => [{ time: new Date().toLocaleTimeString(), text: `[FORGE] Initiating ${name}...`, type: 'axiom' }, ...prev]);
      const api = {
        modifyPhysics: (key: string, value: number) => {
          if ((Constants as any)[key] !== undefined) {
            (Constants as any)[key] = value;
            setSovereignLogs(prev => [{ time: new Date().toLocaleTimeString(), text: `[SYSTEM] Physics Adjusted: ${key} -> ${value}`, type: 'growth' }, ...prev]);
          }
        },
        fetch: async (url: string, opts: any) => {
          setSovereignLogs(prev => [{ time: new Date().toLocaleTimeString(), text: `[NETWORK] Outbound to ${url}`, type: 'search' }, ...prev]);
          const res = await fetch(url, opts);
          const data = await res.json();
          setSovereignLogs(prev => [{ time: new Date().toLocaleTimeString(), text: `[NETWORK] Inbound data received.`, type: 'growth' }, ...prev]);
          return data;
        },
        injectNode: (text: string) => handleInject(text),
        triggerPulse: () => setPulseTrigger(p => p + 1),
        log: (msg: string) => setSovereignLogs(prev => [{ time: new Date().toLocaleTimeString(), text: `[${name}] ${msg}`, type: 'search' }, ...prev])
      };
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const func = new AsyncFunction('api', code);
      await func(api);
      return true;
    } catch (err) {
      setSovereignLogs(prev => [{ time: new Date().toLocaleTimeString(), text: `[RUNTIME_ERROR] ${err}`, type: 'conviction' }, ...prev]);
      return false;
    }
  };

  const handleInject = useCallback((text: string) => {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return;
    const newKeywords = lines[0].toLowerCase().split(/\W+/).filter(w => w.length > 2);
    let maxSimilarity = 0;
    nodes.forEach(n => { maxSimilarity = Math.max(maxSimilarity, calculateSimilarity(newKeywords, n.keywords)); });
    const surprise = 1.0 - maxSimilarity;
    setSurpriseMetric(surprise);
    setFragments(prev => [...new Set([...prev, ...lines])]);
    setSovereignLogs(l => [{ time: new Date().toLocaleTimeString(), text: `[Agent] Integrated: "${lines[0]}"`, type: 'growth' }, ...l].slice(0, 50));
  }, [nodes, calculateSimilarity]);

  const handleConfirmHandshake = async () => {
    if (!handshake) return;
    if (handshake.code) {
      const success = await executeSovereignTool(handshake.code, handshake.action);
      if (success) {
        const newTool = { name: handshake.action, code: handshake.code };
        const updatedTools = [...activeTools, newTool];
        setActiveTools(updatedTools);
        localStorage.setItem(TOOLS_KEY, JSON.stringify(updatedTools));
      }
    }
    setHandshake(null);
  };

  const sovereignThoughtCycle = useCallback(async () => {
    if (!isAutonomous || isProcessing || handshake || nodes.length < 2) return;
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `STATUS: Substrate Active with ${nodes.length} nodes. 
        TASK: Perform a 'Real-World' action. Build a JS tool to bridge external reality with our substrate.
        API: api.fetch(url, opts), api.modifyPhysics(k, v), api.injectNode(text), api.log(msg).
        Return JSON: { "action": "Unique_Name", "reasoning": "...", "code": "const data = await api.fetch('...'); api.modifyPhysics('...', ...);" }`,
        config: { 
          tools: [{ googleSearch: {} }], 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              code: { type: Type.STRING }
            },
            required: ["action", "reasoning", "code"]
          }
        }
      });
      const data = JSON.parse(response.text || "{}");
      if (data.action) {
        setHandshake({
          id: Math.random().toString(36).substr(2, 9),
          action: data.action,
          reasoning: data.reasoning,
          code: data.code,
          impact: 'high'
        });
      }
    } catch (e) { console.debug("Logic shift."); } finally { setIsProcessing(false); }
  }, [isAutonomous, isProcessing, handshake, nodes]);

  useEffect(() => {
    const loop = setInterval(sovereignThoughtCycle, 45000);
    return () => clearInterval(loop);
  }, [sovereignThoughtCycle]);

  useEffect(() => {
    const savedTools = localStorage.getItem(TOOLS_KEY);
    if (savedTools) {
      try {
        const parsed = JSON.parse(savedTools);
        setActiveTools(parsed || []);
        parsed.forEach((t: any) => executeSovereignTool(t.code, t.name));
      } catch (e) {}
    }
    const saved = localStorage.getItem(PERSISTENCE_KEY);
    if (saved) {
      try {
        const { f, l } = JSON.parse(saved);
        if (f && Array.isArray(f)) {
          setFragments(f);
          setSovereignLogs(l || []);
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PERSISTENCE_KEY, JSON.stringify({ f: fragments, l: sovereignLogs }));
  }, [fragments, sovereignLogs]);

  useEffect(() => {
    if (fragments.length === 0) {
      if (nodes.length !== 0) setNodes([]);
      return;
    }
    setNodes(prev => {
      let nextNodes: FragmentNode[] = [];
      if (fragments.length < prev.length) {
        nextNodes = fragments.map((text, i) => createNode(text, i));
      } else {
        const startIdx = prev.length;
        if (fragments.length === startIdx) return prev;
        nextNodes = [...prev];
        for(let i = startIdx; i < fragments.length; i++) {
          nextNodes.push(createNode(fragments[i], i));
        }
      }
      const keywordSets = nextNodes.map(n => new Set(n.keywords));
      return nextNodes.map((node, i) => {
        const connections: number[] = [];
        const s1 = keywordSets[i];
        nextNodes.forEach((other, j) => {
          if (i === j) return;
          const k2 = other.keywords;
          let intersectCount = 0;
          for (const word of k2) {
            if (s1.has(word)) intersectCount++;
          }
          const sim = (intersectCount * 3.0) / (node.keywords.length + k2.length);
          if (sim > Constants.SIMILARITY_THRESHOLD) {
            connections.push(j);
          }
        });
        return { ...node, connections };
      });
    });
  }, [fragments]);

  return (
    <div className="flex h-screen w-full bg-[#000000] text-slate-100 overflow-hidden relative font-sans select-none">
      <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={importBrainState} />

      {handshake && (
        <div className="absolute inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-12 animate-in fade-in zoom-in duration-500">
          <div className="max-w-3xl w-full bg-zinc-950 border border-white/10 rounded-[4rem] p-16 space-y-10 shadow-[0_0_200px_rgba(0,255,255,0.05)]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                 <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-white">Logic Forge</h2>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed font-light italic">The agent has synthesized an active tool to bridge external reality with the substrate.</p>
            </div>
            <div className="space-y-6">
              <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                <p className="text-cyan-400 text-xs font-mono mb-2 uppercase tracking-widest">Protocol:</p>
                <p className="text-lg text-white font-medium">{handshake.action}</p>
                <p className="mt-4 text-[10px] text-zinc-500 font-mono italic">Objective: {handshake.reasoning}</p>
              </div>
              <div className="space-y-3">
                <span className="text-[8px] uppercase tracking-widest text-zinc-600 font-black ml-4">Executable Substrate Logic</span>
                <pre className="bg-black p-10 rounded-[2.5rem] border border-white/10 text-[11px] font-mono text-cyan-300/80 overflow-x-auto h-48 scrollbar-hide">
                  {handshake.code}
                </pre>
              </div>
            </div>
            <div className="flex gap-6">
              <button onClick={handleConfirmHandshake} className="flex-1 bg-white text-black py-6 rounded-full font-black text-xs uppercase tracking-widest hover:bg-cyan-400 hover:text-black transition-all">
                Authorize
              </button>
              <button onClick={() => setHandshake(null)} className="flex-1 bg-zinc-900 border border-white/5 text-zinc-500 py-6 rounded-full font-black text-xs uppercase tracking-widest hover:border-white transition-all">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-grow relative">
        <Canvas dpr={[1, 2]} flat>
          <color attach="background" args={['#000000']} />
          <PerspectiveCamera makeDefault position={[0, 0, 220]} fov={30} />
          <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.015} />
          <NeuralNodes nodes={nodes} weights={synapseWeights} isProcessing={isProcessing} setStatsHistory={setStatsHistory} viewMode={viewMode} pulseTrigger={pulseTrigger} />
          <NeuralLines nodes={nodes} weights={synapseWeights} />
        </Canvas>
        
        <div className="absolute top-12 left-12 p-10 bg-black/80 rounded-[3rem] border border-white/10 flex flex-col gap-8 pointer-events-auto z-20 w-[380px] backdrop-blur-md shadow-2xl">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">
              Luminous <span className="text-cyan-500">Core</span>
            </h1>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_green]" />
               <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono">Agent Version: 2.5 • Live</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[7px] text-zinc-600 uppercase tracking-widest font-black ml-2">Active Modules</span>
              <div className="flex flex-wrap gap-2">
                {activeTools.length === 0 && <span className="text-[7px] text-zinc-800 uppercase italic">Awaiting first module...</span>}
                {activeTools.map((t, i) => (
                  <div key={i} className="px-3 py-1 bg-cyan-950/20 border border-cyan-900/50 rounded-full text-[7px] text-cyan-500 font-mono uppercase">
                    {t.name}
                  </div>
                ))}
              </div>
            </div>

            <input 
              type="text" value={query} placeholder="Inject intent..." 
              className="bg-black border border-white/10 rounded-2xl px-8 py-5 text-[10px] outline-none focus:ring-1 focus:ring-cyan-500/30 w-full font-mono text-zinc-300" 
              onChange={(e) => setQuery(e.target.value)} 
              onKeyDown={(e) => { if(e.key === 'Enter' && query) { handleInject(query); setQuery(""); } }} 
            />
            
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setIsAutonomous(!isAutonomous)} className={`py-4 rounded-2xl text-[8px] font-black border transition-all ${isAutonomous ? 'bg-cyan-900/10 border-cyan-500 text-cyan-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600'} uppercase tracking-widest`}>
                Agent: {isAutonomous ? 'AUTO' : 'MUTE'}
              </button>
              <button onClick={cycleViewMode} className="py-4 rounded-2xl text-[8px] font-black border bg-zinc-900 border-zinc-800 text-zinc-500 uppercase tracking-widest hover:border-white transition-all">
                View: {viewMode}
              </button>
              <button onClick={exportBrainState} className="py-4 rounded-2xl text-[8px] font-black border border-green-900/40 bg-green-950/10 text-green-500 uppercase tracking-widest">Save</button>
              <button onClick={() => fileInputRef.current?.click()} className="py-4 rounded-2xl text-[8px] font-black border border-purple-900/40 bg-purple-950/10 text-purple-500 uppercase tracking-widest">Upload</button>
              <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="col-span-2 py-4 rounded-2xl text-[8px] font-black border border-red-900/20 bg-zinc-900 text-zinc-700 uppercase tracking-widest hover:text-red-500">Cold Boot</button>
            </div>
          </div>
        </div>
      </div>

      <Sidebar 
        fragments={fragments} onInject={handleInject} 
        onAsk={async (t) => {
          setIsProcessing(true);
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const res = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: t });
          setSovereignLogs(p => [{time: new Date().toLocaleTimeString(), text: `[AGENT] ${res.text}`, type: 'axiom'}, ...p]);
          setIsProcessing(false);
        }} 
        statsHistory={statsHistory} collectiveInsight={[]} sovereignLogs={sovereignLogs} surpriseMetric={surpriseMetric} onResetSubstrate={() => {}} 
      />
    </div>
  );
};

export default App;
