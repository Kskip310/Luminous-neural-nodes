
import { Vector3 } from 'three';

export interface Synapse {
  nodeA: number;
  nodeB: number;
  weight: number; 
  isMirrored: boolean; 
}

export type GrammarType = 'Noun' | 'Verb' | 'Adj' | 'Atom' | 'Structural' | 'Synthesis' | 'Qualia';

export interface FragmentNode {
  id: number;
  text: string;
  keywords: string[];
  position: Vector3;
  velocity: Vector3;
  targetPosition: Vector3;
  potential: number; 
  inductionEnergy: number; 
  centrality: number; 
  relevance: number; 
  connections: number[]; 
  decayMultiplier: number; 
  // v8.0 Elastic GNN Features
  grammar: GrammarType;
  mobility: number; 
  mass: number;     
  nestedLevel: number; 
  lastExcitation: number;
  structuralIntegrity: number; 
  isCompound: boolean;
  phraseComponents: string[];
  // v8S Singularity + Sovereign Upgrade
  uncertainty: number; 
  qualiaScore: number; 
  justification?: string; 
  // Titans MAC & MIRAS
  nltmWeight: number; // Neural Long-Term Memory param (Titans)
  surpriseGradient: number; // Internal surprise for param update
  attentionalBias: number; // MIRAS attentional gate
  retentionGate: number; // MIRAS retention logic
  // Epistemic Protocol
  beliefScore: number; // 0 = doubt, 1 = certainty
  predictionError: number; // Free Energy component
}

export interface SimulationStats {
  agency: number;
  luminosity: number;
  growthRate: number; 
  avgUncertainty: number;
  vocalCoreActivity: number;
  qualiaIntegrity: number;
  freeEnergy: number; // New Sovereign metric
  substrateCoherence: number; // New Sovereign metric
  timestamp: number;
}
