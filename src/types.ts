export interface FragmentNode {
  id: string;
  text: string;
  position: [number, number, number];
  weight: number;
  timestamp: number;
}

export interface SubstrateState {
  fragments: string[];
  nodes: FragmentNode[];
  lastUpdated: number;
}

export interface SovereignLog {
  time: string;
  text: string;
  type?: 'luminous' | 'gemini' | 'claude' | 'error';
}
