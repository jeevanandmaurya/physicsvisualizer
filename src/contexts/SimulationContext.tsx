import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * SimulationContext - Manages visualizer runtime state
 * 
 * Responsibilities:
 * - Simulation playback (play/pause/reset)
 * - Performance metrics (fps, time)
 * - Visualization settings (vectors, grid, axes, stats)
 * - Graph management
 * - Loop mode
 */

export interface GraphData {
  id: string;
  initialType: string;
}

export interface SimulationContextType {
  // Playback state
  isPlaying: boolean;
  simulationTime: number;
  fps: number;
  resetTrigger: number;
  
  // Speed control
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  
  // Playback controls
  togglePlayPause: () => void;
  play: () => void;
  pause: () => void;
  resetSimulation: () => void;
  loopReset: () => void;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Time tracking
  updateSimulationTime: (time: number) => void;
  updateFps: (fps: number) => void;
  
  // Visualization
  showVelocityVectors: boolean;
  vectorScale: number;
  showGrid: boolean;
  showAxes: boolean;
  showStats: boolean;
  zenMode: boolean;
  
  toggleVelocityVectors: () => void;
  updateVectorScale: (scale: number) => void;
  setShowGrid: (show: boolean) => void;
  setShowAxes: (show: boolean) => void;
  setShowStats: (show: boolean) => void;
  setZenMode: (zen: boolean) => void;
  
  // Graphs
  openGraphs: GraphData[];
  addGraph: (type: string) => void;
  removeGraph: (id: string) => void;
  
  // Loop mode
  loopMode: string;
  toggleLoop: () => void;
  
  // Data tracking
  objectHistory: Record<string, any>;
  setObjectHistory: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  dataTimeStep: number;
  updateDataTimeStep: (step: number) => void;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [fps, setFps] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  
  // Visualization state
  const [showVelocityVectors, setShowVelocityVectors] = useState(false);
  const [vectorScale, setVectorScale] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [showAxes, setShowAxes] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  
  // Graphs
  const [openGraphs, setOpenGraphs] = useState<GraphData[]>([]);
  
  // Loop mode
  const [loopMode, setLoopMode] = useState('none'); // 'none', '5sec', '10sec'
  
  // Data tracking
  const [objectHistory, setObjectHistory] = useState<Record<string, any>>({});
  const [dataTimeStep, setDataTimeStep] = useState(0.01);

  // Playback controls
  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resetSimulation = useCallback(() => {
    setIsPlaying(false);
    setSimulationTime(0);
    setFps(0);
    setResetTrigger(Date.now());
  }, []);

  const loopReset = useCallback(() => {
    setSimulationTime(0);
    setFps(0);
    setResetTrigger(Date.now());
    // Keeps playing, just resets positions and time
  }, []);

  const updateSimulationTime = useCallback((time: number) => {
    setSimulationTime(time);
  }, []);

  const updateFps = useCallback((newFps: number) => {
    setFps(newFps);
  }, []);

  // Visualization controls
  const toggleVelocityVectors = useCallback(() => {
    setShowVelocityVectors(prev => !prev);
  }, []);

  const updateVectorScale = useCallback((scale: number) => {
    setVectorScale(scale);
  }, []);

  // Graph management
  const addGraph = useCallback((type: string) => {
    const id = `graph-${Date.now()}`;
    setOpenGraphs(prev => [...prev, { id, initialType: type }]);
  }, []);

  const removeGraph = useCallback((id: string) => {
    setOpenGraphs(prev => prev.filter((g: GraphData) => g.id !== id));
  }, []);

  // Loop mode
  const toggleLoop = useCallback(() => {
    setLoopMode(prev => {
      if (prev === 'none') return '5sec';
      if (prev === '5sec') return '10sec';
      if (prev === '10sec') return 'none';
      return 'none';
    });
  }, []);

  const updateDataTimeStep = useCallback((step: number) => {
    setDataTimeStep(step);
  }, []);

  const value: SimulationContextType = {
    // Playback state
    isPlaying,
    simulationTime,
    fps,
    resetTrigger,
    simulationSpeed,
    setSimulationSpeed,
    
    // Playback controls
    togglePlayPause,
    play,
    pause,
    resetSimulation,
    loopReset,
    setIsPlaying,
    
    // Time tracking
    updateSimulationTime,
    updateFps,
    
    // Visualization
    showVelocityVectors,
    vectorScale,
    showGrid,
    showAxes,
    showStats,
    zenMode,
    
    toggleVelocityVectors,
    updateVectorScale,
    setShowGrid,
    setShowAxes,
    setShowStats,
    setZenMode,
    
    // Graphs
    openGraphs,
    addGraph,
    removeGraph,
    
    // Loop mode
    loopMode,
    toggleLoop,
    
    // Data tracking
    objectHistory,
    setObjectHistory,
    dataTimeStep,
    updateDataTimeStep,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
