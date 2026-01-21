/**
 * CompactVisualizer - Lightweight instance of the full Visualizer
 * Reuses existing Visualizer component with minimal UI for inline previews
 */

import { useState, useMemo, useEffect, useImperativeHandle, forwardRef } from 'react';
import { SimulationProvider, useSimulation } from '../../../contexts/SimulationContext';
import Visualizer from '../../../ui-logic/visualizer/Visualizer';
import './CompactVisualizer.css';

interface CompactVisualizerProps {
  /** Scene JSON data to render */
  scene: any;
  /** Height of the preview (default: 200px) */
  height?: number | string;
  /** Control play/pause state from parent */
  isPlaying?: boolean;
  /** Callback when play/pause state changes */
  onPlayStateChange?: (isPlaying: boolean) => void;
}

/**
 * Internal component that has access to SimulationContext
 */
function CompactVisualizerInternal({ 
  scene, 
  isPlaying = true 
}: { 
  scene: any; 
  isPlaying?: boolean;
}) {
  const [showSceneDetails] = useState(false);
  const { setIsPlaying: setSimulationPlaying } = useSimulation();

  // Sync play/pause state with simulation context
  useEffect(() => {
    setSimulationPlaying(isPlaying);
  }, [isPlaying, setSimulationPlaying]);

  return (
    <Visualizer 
      scene={scene}
      showSceneDetails={showSceneDetails}
      onToggleSceneDetails={() => {}}
    />
  );
}

/**
 * Compact wrapper around full Visualizer with minimal controls
 * Creates isolated simulation context to avoid conflicts with main visualizer
 */
export default function CompactVisualizer({ 
  scene, 
  height = 200,
  isPlaying = true,
  onPlayStateChange
}: CompactVisualizerProps) {
  // Wrap scene to ensure it has required properties
  const wrappedScene = useMemo(() => {
    if (!scene) return null;
    
    return {
      ...scene,
      // Ensure basic properties exist
      gravity: scene.gravity || [0, -9.81, 0],
      hasGround: scene.hasGround !== undefined ? scene.hasGround : true,
      objects: scene.objects || [],
      simulationScale: scene.simulationScale || 'terrestrial',
      gravitationalPhysics: scene.gravitationalPhysics || { enabled: false }
    };
  }, [scene]);

  if (!wrappedScene) {
    return (
      <div className="compact-visualizer-error">
        <p>No scene data</p>
      </div>
    );
  }

  return (
    <div className="compact-visualizer-wrapper" style={{ height }}>
      {/* Isolated simulation context - won't interfere with main app */}
      <SimulationProvider>
        <div className="compact-visualizer-container">
          <CompactVisualizerInternal 
            scene={wrappedScene}
            isPlaying={isPlaying}
          />
        </div>
      </SimulationProvider>
    </div>
  );
}
