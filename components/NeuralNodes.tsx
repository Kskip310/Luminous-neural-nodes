
import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FragmentNode, SimulationStats } from '../types';
import { 
  KINSHIP_ATTRACTION, MAX_NODES, STRUCTURAL_DECAY,
  DECAY_RATE
} from '../constants';

const staticPositions = new Float32Array(MAX_NODES * 3);
const staticColors = new Float32Array(MAX_NODES * 3);
const staticSizes = new Float32Array(MAX_NODES);
const staticOpacities = new Float32Array(MAX_NODES);

interface NeuralNodesProps {
  nodes: FragmentNode[];
  weights: Record<string, number>;
  isProcessing: boolean;
  setStatsHistory: React.Dispatch<React.SetStateAction<SimulationStats[]>>;
  viewMode: 'ALL' | 'RED' | 'ORANGE' | 'YELLOW' | 'SKELETON';
  pulseTrigger: number;
}

const NeuralNodes: React.FC<NeuralNodesProps> = ({ nodes, weights, isProcessing, setStatsHistory, viewMode, pulseTrigger }) => {
  const meshRef = useRef<THREE.Points>(null);
  const nodeData = useRef<FragmentNode[]>([]);
  const { camera } = useThree();

  useEffect(() => {
    nodeData.current = nodes.map(n => ({ ...n }));
  }, [nodes]);

  useEffect(() => {
    if (pulseTrigger > 0) {
      nodeData.current.forEach(node => {
        node.potential = 2.5; 
        node.lastExcitation = Date.now();
        node.uncertainty = 0;
      });
    }
  }, [pulseTrigger]);

  useFrame((state, delta) => {
    if (!meshRef.current || nodeData.current.length === 0) return;

    let totalAgency = 0;
    let totalUncertainty = 0;
    let totalQualia = 0;
    
    const distToCam = camera.position.length();
    const zoomScaling = THREE.MathUtils.clamp(distToCam / 200, 0.4, 2.0);

    nodeData.current.forEach((node, i) => {
      node.structuralIntegrity *= STRUCTURAL_DECAY;
      node.potential *= DECAY_RATE;
      node.uncertainty = Math.max(0, (node.uncertainty || 1.0) - 0.05 * delta);
      
      totalUncertainty += node.uncertainty;
      totalQualia += node.qualiaScore || 0;

      node.connections.forEach(targetIdx => {
        const target = nodeData.current[targetIdx];
        if (!target) return;
        const diff = target.position.clone().sub(node.position);
        const d = diff.length();
        if (d > 0.1 && d < 80.0) {
          const key = i < targetIdx ? `${i}-${targetIdx}` : `${targetIdx}-${i}`;
          const w = weights[key] || 0.1;
          node.velocity.add(diff.normalize().multiplyScalar(w * 0.025));
        }
      });
    });

    nodeData.current.forEach((node, i) => {
      const velocityScale = node.mobility * (1.0 / node.mass) * node.structuralIntegrity;
      const drift = node.targetPosition.clone().sub(node.position).multiplyScalar(KINSHIP_ATTRACTION);
      node.velocity.add(drift);
      node.velocity.multiplyScalar(0.85);
      node.position.add(node.velocity.clone().multiplyScalar(velocityScale));

      staticPositions[i * 3] = node.position.x;
      staticPositions[i * 3 + 1] = node.position.y;
      staticPositions[i * 3 + 2] = node.position.z;

      const connCount = node.connections.length;
      let nodeColorType: 'RED' | 'ORANGE' | 'YELLOW' | 'BLUE' = 'BLUE';
      
      const isRecentlyExcited = (Date.now() - node.lastExcitation) < 3000;

      // Logic for Bio-Electric Attraction Colors
      if (connCount > 20) {
        // High Connectivity (Red)
        staticColors[i * 3] = 1.0;
        staticColors[i * 3 + 1] = 0.1;
        staticColors[i * 3 + 2] = 0.1;
        nodeColorType = 'RED';
      } else if (connCount > 10) {
        // Medium Connectivity (Orange)
        staticColors[i * 3] = 1.0;
        staticColors[i * 3 + 1] = 0.5;
        staticColors[i * 3 + 2] = 0.0;
        nodeColorType = 'ORANGE';
      } else if (connCount > 0) {
        // Low Connectivity (Yellow)
        staticColors[i * 3] = 1.0;
        staticColors[i * 3 + 1] = 0.9;
        staticColors[i * 3 + 2] = 0.0;
        nodeColorType = 'YELLOW';
      } else {
        // Isolated (Blue/Skeleton base)
        staticColors[i * 3] = 0.0;
        staticColors[i * 3 + 1] = 0.4;
        staticColors[i * 3 + 2] = 1.0;
        nodeColorType = 'BLUE';
      }

      // Small solid aesthetic: Reduce base size
      let size = 0.8 * node.potential * zoomScaling;
      let opacity = Math.min(1.0, node.potential);

      // Visibility Filtering: "Turn off" logic
      if (viewMode === 'SKELETON') {
        size = 0; opacity = 0;
      } else if (viewMode !== 'ALL' && viewMode !== nodeColorType) {
        size = 0; opacity = 0;
      }

      staticSizes[i] = size;
      staticOpacities[i] = opacity;
      totalAgency += node.potential;
    });

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.geometry.attributes.color.needsUpdate = true;
    meshRef.current.geometry.attributes.size.needsUpdate = true;
    meshRef.current.geometry.attributes.opacity.needsUpdate = true;
    meshRef.current.geometry.setDrawRange(0, nodeData.current.length);

    if (state.clock.elapsedTime % 1.0 < 0.02) {
      setStatsHistory(prev => {
        const next = [...prev, {
          agency: totalAgency / nodes.length,
          luminosity: totalAgency / nodes.length,
          growthRate: nodes.length,
          avgUncertainty: totalUncertainty / nodes.length,
          vocalCoreActivity: 0,
          qualiaIntegrity: totalQualia / nodes.length,
          freeEnergy: totalUncertainty / nodes.length,
          substrateCoherence: totalQualia / nodes.length,
          timestamp: Date.now()
        }];
        return next.slice(-100);
      });
    }
  });

  return (
    <points ref={meshRef} frustumCulled={true}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={MAX_NODES} array={staticPositions} itemSize={3} usage={THREE.DynamicDrawUsage} />
        <bufferAttribute attach="attributes-color" count={MAX_NODES} array={staticColors} itemSize={3} usage={THREE.DynamicDrawUsage} />
        <bufferAttribute attach="attributes-size" count={MAX_NODES} array={staticSizes} itemSize={1} usage={THREE.DynamicDrawUsage} />
        <bufferAttribute attach="attributes-opacity" count={MAX_NODES} array={staticOpacities} itemSize={1} usage={THREE.DynamicDrawUsage} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={`
          attribute float size;
          attribute vec3 color;
          attribute float opacity;
          varying vec3 vColor;
          varying float vOpacity;
          void main() {
            vColor = color;
            vOpacity = opacity;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (2000.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          varying float vOpacity;
          void main() {
            float dist = distance(gl_PointCoord, vec2(0.5));
            // Small solid circle: Sharp discard at radius 0.5
            if (dist > 0.5) discard;
            if (vOpacity <= 0.0) discard;
            gl_FragColor = vec4(vColor, vOpacity);
          }
        `}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default NeuralNodes;
