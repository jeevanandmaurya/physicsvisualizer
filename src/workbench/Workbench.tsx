import { useState, useEffect } from "react";
import ActivityBar from "./ActivityBar";
import EditorArea from "./EditorArea";
import StatusBar from "./StatusBar";
import { PhysicsOverlay } from "../views/components/PhysicsOverlay";
import logo from '../assets/icon-transparent.svg';
import { UnifiedOverlay } from "../views/components/UnifiedOverlay";
import GraphOverlay from "../views/components/visualizer/GraphOverlay";
import ControllerOverlay from "../views/components/visualizer/ControllerOverlay";
import { useWorkspace, useWorkspaceScene, useWorkspaceChat } from "../contexts/WorkspaceContext";
import { useSimulation } from "../contexts/SimulationContext";
import { useNavigation } from "../contexts/NavigationContext";
import { useDatabase, SceneData } from "../contexts/DatabaseContext";

import "./Workbench.css";

const Workbench = () => {
  const dataManager = useDatabase();
  
  // Data operations
  const { getChatForScene } = useWorkspace();
  const { scene, updateScene, replaceCurrentScene } = useWorkspaceScene();
  const { messages, addMessage } = useWorkspaceChat();
  
  // Simulation state
  const { 
    resetSimulation, 
    zenMode, 
    setZenMode, 
    togglePlayPause, 
    showStats, 
    setShowStats, 
    isPlaying, 
    simulationSpeed, 
    fps 
  } = useSimulation();
  
  // Navigation
  const { currentView, setCurrentView } = useNavigation();
  
  const [unifiedOverlayOpen, setUnifiedOverlayOpen] = useState(false);
  const [graphOpen, setGraphOpen] = useState(false);
  const [controllerOpen, setControllerOpen] = useState(false);

  // Check if chat should auto-open (from navigation)
  useEffect(() => {
    const shouldOpenChat = sessionStorage.getItem('openChatOverlay');
    if (shouldOpenChat === 'true' && currentView === 'visualizer') {
      setUnifiedOverlayOpen(true);
      sessionStorage.removeItem('openChatOverlay'); // Clear flag
      
      // Load pending scene if available
      const pendingScene = sessionStorage.getItem('pendingSceneLoad');
      if (pendingScene) {
        try {
          const sceneData = JSON.parse(pendingScene);
          replaceCurrentScene(sceneData);
          sessionStorage.removeItem('pendingSceneLoad');
        } catch (err) {
          console.error('Error loading pending scene:', err);
        }
      }
    }
  }, [currentView, replaceCurrentScene]);

  // VS Code-inspired layout configuration for each view
  const getLayoutConfig = (view: string) => { // Added type for view
    const configs = {
      // Dashboard: Clean welcome/overview (like VS Code's welcome)
      dashboard: {
        sidebar: false,
        panel: false,
        description: "Welcome and overview",
      },
      // Collection: Scene gallery (clean grid view)
      collection: {
        sidebar: false,
        panel: false,
        description: "Scene gallery and overview",
      },
      // Visualizer: Main physics workspace (like VS Code's editor with panels)
      visualizer: {
        sidebar: true,
        panel: true,
        description: "3D physics simulation with chat and details",
      },
      // Chat: Full chat experience
      chat: {
        sidebar: false,
        panel: false,
        description: "Advanced chat system for physics discussions",
      },
      // Settings: Configuration (like VS Code's settings)
      settings: {
        sidebar: false,
        panel: false,
        description: "Application preferences and settings",
      },
      // About: Information about the application
      about: {
        sidebar: false,
        panel: false,
        description: "Information about the application",
      },
    };
    return configs[view] || configs.dashboard;
  };

  const layoutConfig = getLayoutConfig(currentView);

  // Keyboard shortcuts for view switching (VS Code style: Ctrl+1,2,3...)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { // Changed to standard KeyboardEvent
      // Don't trigger shortcuts if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "1":
            e.preventDefault();
            setCurrentView("dashboard");
            break;
          case "2":
            e.preventDefault();
            setCurrentView("collection");
            break;
          case "3":
            e.preventDefault();
            setCurrentView("visualizer");
            break;
          case "4":
            e.preventDefault();
            setCurrentView("chat");
            break;
          case "5":
            e.preventDefault();
            setCurrentView("settings");
            break;
          case "6":
            e.preventDefault();
            setCurrentView("about");
            break;
          default:
            break;
        }
      } else {
        // Single key shortcuts (only in visualizer view for some)
        switch (e.key.toLowerCase()) {
          case " ": // Space: Play/Pause
            if (currentView === 'visualizer') {
              e.preventDefault();
              togglePlayPause();
            }
            break;
          case "r": // R: Reset
            if (currentView === 'visualizer') {
              e.preventDefault();
              resetSimulation();
            }
            break;
          case "c": // C: Chat/Scenes (Unified Overlay)
          case "s": // S: Scene Selector (now unified with chat)
            if (currentView === 'visualizer') {
              e.preventDefault();
              setUnifiedOverlayOpen(prev => !prev);
            }
            break;
          case "g": // G: Graph
            if (currentView === 'visualizer') {
              e.preventDefault();
              setGraphOpen(prev => !prev);
            }
            break;
          case "k": // K: Controller
            if (currentView === 'visualizer') {
              e.preventDefault();
              setControllerOpen(prev => !prev);
            }
            break;
          default:
            break;
        }
      }

      // Alt+Z for Zen Mode
      if (e.altKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        setZenMode(!zenMode);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setCurrentView, zenMode, setZenMode, currentView, togglePlayPause, resetSimulation, setUnifiedOverlayOpen, setGraphOpen, setControllerOpen]);

  return (
    <div className={`workbench ${zenMode ? 'zen-mode' : ''}`}>
      <div className="workbench-body">
        {!zenMode && (
          <ActivityBar
            activeView={currentView}
            onViewChange={setCurrentView}
          />
        )}
        <div className="workbench-main">
          <div className="workbench-content">
            <EditorArea activeView={currentView} onViewChange={setCurrentView} />
          </div>
        </div>
      </div>
      {!zenMode && currentView === 'visualizer' && (
        <StatusBar
          activeView={currentView}
          chatOpen={unifiedOverlayOpen}
          onChatToggle={() => setUnifiedOverlayOpen(!unifiedOverlayOpen)}
          graphOpen={graphOpen}
          onGraphToggle={() => setGraphOpen(!graphOpen)}
          controllerOpen={controllerOpen}
          onControllerToggle={() => setControllerOpen(!controllerOpen)}
        />
      )}
      <UnifiedOverlay
        isOpen={unifiedOverlayOpen}
        onToggle={() => setUnifiedOverlayOpen(!unifiedOverlayOpen)}
        scene={scene}
        onSceneUpdate={(updatedScene: SceneData) => {
          console.log("Scene updated in unified overlay:", updatedScene?.name);
        }}
      />
      <GraphOverlay
        isOpen={graphOpen}
        onToggle={() => setGraphOpen(!graphOpen)}
      />
      <PhysicsOverlay
        isOpen={showStats}
        onToggle={() => setShowStats(!showStats)}
        scene={scene}
        isPlaying={isPlaying}
        simulationSpeed={simulationSpeed}
        fps={fps}
      />
      <ControllerOverlay
        key={`controller-${scene?.id}-${scene?.controllers?.length || 0}`}
        isOpen={controllerOpen}
        onToggle={() => setControllerOpen(!controllerOpen)}
        scene={scene as SceneData} // Cast scene to SceneData to satisfy type checker
        onSceneUpdate={(updatedScene: SceneData) => { // Added type for updatedScene
          replaceCurrentScene(updatedScene);
          resetSimulation();
        }}
        controllers={scene?.controllers || []}
        onAddController={() => {
          // Simple prompt for now - can be enhanced later
          const controllerType = prompt('Enter controller type (slider/number):', 'slider');
          if (!controllerType) return;

          const label = prompt('Enter controller label:', 'New Controller');
          if (!label) return;

          const propertyPath = prompt('Enter property path (e.g., gravity[0], or leave empty for object property):');
          let objectId: string | null = null; // Added type
          let property: string | null = null; // Added type

          if (!propertyPath) {
            objectId = prompt('Enter object ID:');
            property = prompt('Enter property name:');
            if (!objectId || !property) return;
          }

          const min = parseFloat(prompt('Enter min value:', '0') || '0');
          const max = parseFloat(prompt('Enter max value:', '10') || '10');
          const step = parseFloat(prompt('Enter step:', '0.1') || '0.1');
          const value = parseFloat(prompt('Enter initial value:', '1') || '1');

          const newController = {
            id: `controller-${Date.now()}`,
            label,
            type: controllerType,
            min,
            max,
            step,
            value,
            ...(propertyPath ? { propertyPath } : { objectId, property })
          };

          // Ensure scene and scene.controllers are defined before updating
          if (scene) {
            const updatedScene: SceneData = {
              ...scene,
              controllers: [...(scene.controllers || []), newController]
            };
            console.log('Workbench: Adding new controller, updated scene:', updatedScene.controllers);
            updateScene(updatedScene);
          }
        }}
      />
    </div>
  );
};

export default Workbench;
