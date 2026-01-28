import React, { useMemo } from 'react';
import * as THREE from 'three';
import { FragmentNode } from '../types';

interface NeuralNodesProps {
  nodes: FragmentNode[];
  viewMode: 'ALL' | 'SKELETON';
}

const NeuralNodes: React.FC<NeuralNodesProps> = ({ nodes, viewMode }) => {
  // HIGH PERFORMANCE: Converts 2000+ nodes into a single draw call
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(nodes.length * 3);
    const col = new Float32Array(nodes.length * 3);

    nodes.forEach((node, i) => {
      pos[i * 3] = node.position.x;
      pos[i * 3 + 1] = node.position.y;
      pos[i * 3 + 2] = node.position.z;

      // SKIPPER COLORS: Maps physics to solid Red, Orange, Yellow, Green
      const color = new THREE.Color(
        node.potential > 1.5 ? '#ff0000' : 
        node.inductionEnergy > 0.8 ? '#ffa500' : 
        node.centrality > 0.5 ? '#ffff00' : '#00ff00'
      );
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    });

    return { positions: pos, colors: col };
  }, [nodes]);

  if (viewMode === 'SKELETON' || nodes.length === 0) return null;

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={3.5} 
        vertexColors 
        transparent 
        opacity={0.9} 
        sizeAttenuation={true} 
      />
    </points>
  );
};

export default NeuralNodes;
