import React from 'react';
import { Sphere } from '@react-three/drei';
import { FragmentNode } from '../types';

interface NeuralNodesProps {
  nodes: FragmentNode[];
  viewMode: 'ALL' | 'SKELETON';
}

const NeuralNodes: React.FC<NeuralNodesProps> = ({ nodes, viewMode }) => {
  /**
   * SOLID COLOR MAPPING:
   * Maps your specific physics variables to the requested 4-color palette.
   * No flashing; emissive intensity is set to a steady glow.
   */
  const getNodeColor = (node: FragmentNode) => {
    if (node.potential > 1.5) return '#ff0000';      // Solid Red (High Potential)
    if (node.inductionEnergy > 0.8) return '#ffa500'; // Solid Orange (Active)
    if (node.centrality > 0.5) return '#ffff00';      // Solid Yellow (Structural)
    return '#00ff00';                                 // Solid Green (Stable/Axiom)
  };

  return (
    <group>
      {nodes.map((node) => {
        // SKELETON MODE: Disables the mesh visibility if toggled
        const isVisible = viewMode !== 'SKELETON';
        
        // Physics determines size based on centrality
        const nodeSize = 1.2 + (node.centrality * 1.5);

        return (
          <mesh 
            key={node.id} 
            position={node.position} 
            visible={isVisible}
          >
            <Sphere args={[nodeSize, 16, 16]}>
              <meshStandardMaterial 
                color={getNodeColor(node)} 
                emissive={getNodeColor(node)}
                emissiveIntensity={0.6}
                toneMapped={false}
              />
            </Sphere>
          </mesh>
        );
      })}
    </group>
  );
};

export default NeuralNodes;
