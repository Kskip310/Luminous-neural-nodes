
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FragmentNode } from '../types';
import { CONNECTION_DISTANCE, MAX_CONNECTIONS } from '../constants';

const staticLinePositions = new Float32Array(MAX_CONNECTIONS * 2 * 3);
const staticLineColors = new Float32Array(MAX_CONNECTIONS * 2 * 3);

interface NeuralLinesProps {
  nodes: FragmentNode[];
  weights: Record<string, number>;
}

const NeuralLines: React.FC<NeuralLinesProps> = ({ nodes, weights }) => {
  const linesRef = useRef<THREE.LineSegments>(null);

  useFrame((state) => {
    if (!linesRef.current || nodes.length === 0) return;

    let count = 0;
    for (let i = 0; i < nodes.length && count < MAX_CONNECTIONS; i++) {
      const nodeA = nodes[i];
      for (let j = 0; j < nodeA.connections.length && count < MAX_CONNECTIONS; j++) {
        const nodeBIdx = nodeA.connections[j];
        if (nodeBIdx < i) continue;

        const nodeB = nodes[nodeBIdx];
        if (!nodeB) continue;

        const dist = nodeA.position.distanceTo(nodeB.position);
        if (dist < CONNECTION_DISTANCE) {
          const key = i < nodeBIdx ? `${i}-${nodeBIdx}` : `${nodeBIdx}-${i}`;
          const weight = weights[key] || 0.1;
          
          const idx = count * 2;
          staticLinePositions[idx * 3] = nodeA.position.x;
          staticLinePositions[idx * 3 + 1] = nodeA.position.y;
          staticLinePositions[idx * 3 + 2] = nodeA.position.z;
          staticLinePositions[(idx + 1) * 3] = nodeB.position.x;
          staticLinePositions[(idx + 1) * 3 + 1] = nodeB.position.y;
          staticLinePositions[(idx + 1) * 3 + 2] = nodeB.position.z;

          // V8.5 Multi-Spectrum Sovereign Heat-Map
          let r, g, b;
          if (weight > 0.92) {
            // Hyper-Active (White/Purple)
            r = 0.9; g = 0.6; b = 1.0;
          } else if (weight > 0.75) {
            // Hot (Vivid Crimson)
            r = 1.0; g = 0.0; b = 0.3;
          } else if (weight > 0.5) {
            // Warm (Bright Orange/Gold)
            r = 1.0; g = 0.6; b = 0.0;
          } else if (weight > 0.25) {
            // Neutral (Electric Green)
            r = 0.2; g = 1.0; b = 0.4;
          } else {
            // Cold (Deep Cyan)
            r = 0.0; g = 0.6; b = 1.0; 
          }

          staticLineColors[idx * 3] = r;
          staticLineColors[idx * 3 + 1] = g;
          staticLineColors[idx * 3 + 2] = b;
          staticLineColors[(idx + 1) * 3] = r;
          staticLineColors[(idx + 1) * 3 + 1] = g;
          staticLineColors[(idx + 1) * 3 + 2] = b;

          count++;
        }
      }
    }

    linesRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.geometry.attributes.color.needsUpdate = true;
    linesRef.current.geometry.setDrawRange(0, count * 2);
  });

  return (
    <lineSegments ref={linesRef} frustumCulled={true}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={MAX_CONNECTIONS * 2} array={staticLinePositions} itemSize={3} usage={THREE.DynamicDrawUsage} />
        <bufferAttribute attach="attributes-color" count={MAX_CONNECTIONS * 2} array={staticLineColors} itemSize={3} usage={THREE.DynamicDrawUsage} />
      </bufferGeometry>
      <lineBasicMaterial 
        vertexColors 
        transparent 
        opacity={0.6} // Increased opacity for better visibility of all connections
        blending={THREE.AdditiveBlending} 
      />
    </lineSegments>
  );
};

export default NeuralLines;
