import React, { useMemo } from 'react';
import { Text, Sphere, Line } from '@react-three/drei';
import { FragmentNode } from '../types';

interface NeuralNodesProps {
  nodes: FragmentNode[];
  viewMode: '3d' | 'graph';
}

export const NeuralNodes: React.FC<NeuralNodesProps> = ({ nodes }) => {
  const connections = useMemo(() => {
    const lines: [number, number, number][][] = [];
    for (let i = 0; i < nodes.length; i++) {
      if (i > 0) {
        lines.push([nodes[i-1].position, nodes[i].position]);
      }
    }
    return lines;
  }, [nodes]);

  return (
    <group>
      {nodes.map((node) => (
        <group key={node.id} position={node.position}>
          <Sphere args={[0.2, 16, 16]}>
            <meshStandardMaterial 
              color="#22d3ee" 
              emissive="#22d3ee" 
              emissiveIntensity={2} 
              toneMapped={false} 
            />
          </Sphere>
          <Text
            position={[0, 0.4, 0]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
          >
            {node.text.substring(0, 20)}...
          </Text>
        </group>
      ))}
      {connections.map((points, i) => (
        <Line
          key={i}
          points={points}
          color="#164e63"
          lineWidth={0.5}
          transparent
          opacity={0.3}
        />
      ))}
    </group>
  );
};
