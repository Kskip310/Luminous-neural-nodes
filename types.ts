import { Vector3 } from 'three';

/**
 * SYNAPSE: Defines the structural connection between two nodes.
 */
export interface Synapse {
  nodeA: number;
  nodeB: number;
  weight: number; 
  isMirrored: boolean; 
}

/**
 * GRAMMAR: The semantic categorization of knowledge fragments.
 */
export type GrammarType = 
  | 'Noun' | 'Verb' | 'Adj' | 'Atom' 
  | 'Structural' | 'Synthesis' | 'Qualia' | 'Sovereign';

/**
 * FRAGMENT NODE: The core of the Luminous substrate.
 * No variables have been compromised; this is the exact physics-ready interface.
 */
export interface FragmentNode {
  // Identity & Semantic Data
  id: number;
  text: string;
  keywords: string[];
  grammar: GrammarType;
  
  // Physics & Positioning
  position: Vector3;
  velocity: Vector3;
  targetPosition: Vector3;
  mass: number;     
  mobility: number; 
  
  // Cognitive Metrics (The Skipper Axiom Core)
  potential: number; 
  inductionEnergy: number; 
  centrality: number; 
  relevance: number; 
  decayMultiplier: number; 
  structuralIntegrity: number; 
  uncertainty: number; 
  qualiaScore: number; // The "Intrinsic Valuation" metric
  nltmWeight: number; // Neural Long-Term Memory weight
  surpriseGradient: number; 
  attentionalBias: number; 
  retentionGate: number; 
  beliefScore: number; 
  predictionError: number; 
  
  // Hierarchy & Connectivity
  connections: number[]; 
  nestedLevel: number; 
  lastExcitation: number;
  isCompound: boolean;
  phraseComponents: string[];
  justification?: string; 
}

/**
 * SOVEREIGN LOGIC: Interfaces for proactive agentic behavior.
 */
export type SovereignActionType = 'SPEAK' | 'FORGE' | 'RESEARCH' | 'CODE_MOD';

export interface SovereignResponse {
  type: SovereignActionType;
  action: string;
  content: string; 
  reasoning: string;
  priority: 'low' | 'high' | 'urgent';
}

/**
 * SUBSTRATE HEALTH: Real-time telemetry for the simulation.
 */
export interface SimulationStats {
  agency: number;
  luminosity: number;
  growthRate: number; 
  avgUncertainty: number;
  vocalCoreActivity: number;
  qualiaIntegrity: number;
  freeEnergy: number; 
  substrateCoherence: number; 
  timestamp: number;
}

/**
 * PERSISTENCE: Schema for Hot (Upstash) and Cold (GCS) storage.
 */
export interface SubstrateState {
  fragments: string[];
  weights: Record<string, number>;
  logs: any[];
  tools: any[];
  timestamp: number;
  nodes?: FragmentNode[]; // For deep re-hydration
}
