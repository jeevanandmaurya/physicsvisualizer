import { useState, useEffect } from "react";
import ActivityBar from "./ActivityBar";
import EditorArea from "./EditorArea";
import StatusBar from "./StatusBar";
import logo from '../assets/icon-transparent.svg';
import ChatOverlay from "../views/components/chat/ChatOverlay";
import GraphOverlay from "../views/components/visualizer/GraphOverlay";
import ControllerOverlay from "../views/components/visualizer/ControllerOverlay";
import SceneSelectorUI from "../views/components/scene-management/SceneSelectorUI";
import {
  useWorkspace,
  useWorkspaceScene,
  useWorkspaceChat,
} from "../contexts/WorkspaceContext";
import { SceneData } from "../contexts/DatabaseContext"; // Import SceneData for type safety

import "./Workbench.css";

const Workbench = () => {
  const { currentView, setCurrentView, getChatForScene, resetSimulation } = useWorkspace();
  const { scene, updateScene, replaceCurrentScene } = useWorkspaceScene();
  const { messages, addMessage } = useWorkspaceChat();
  const [chatOpen, setChatOpen] = useState(false);
  const [graphOpen, setGraphOpen] = useState(false);
  const [controllerOpen, setControllerOpen] = useState(false);
  const [sceneSelectorOpen, setSceneSelectorOpen] = useState(false);

  // Open scene selector by default only in visualizer view
  useEffect(() => {
    setSceneSelectorOpen(currentView === 'visualizer');
  }, [currentView]);

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
    const handleKeyDown = (e: React.KeyboardEvent<Document>) => { // Added type for event
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setCurrentView]);

  return (
    <div className="workbench">
      <div className="workbench-body">
        <ActivityBar
          activeView={currentView}
          onViewChange={setCurrentView}
        />
        <div className="workbench-main">
          <div className="workbench-content">
            <EditorArea activeView={currentView} onViewChange={setCurrentView} />
          </div>
        </div>
      </div>
      <StatusBar
        activeView={currentView}
        chatOpen={chatOpen}
        onChatToggle={() => setChatOpen(!chatOpen)}
        graphOpen={graphOpen}
        onGraphToggle={() => setGraphOpen(!graphOpen)}
        controllerOpen={controllerOpen}
        onControllerToggle={() => setControllerOpen(!controllerOpen)}
        sceneSelectorOpen={sceneSelectorOpen}
        onSceneSelectorToggle={() => setSceneSelectorOpen(!sceneSelectorOpen)}
      />
      <SceneSelectorUI
        isOpen={sceneSelectorOpen}
        onToggle={() => setSceneSelectorOpen(!sceneSelectorOpen)}
        currentScene={scene}
        handleSceneChange={updateScene}
        userScenes={[]}
        loadingUserScenes={false}
        onDeleteScene={() => {}}
        onSaveScene={() => {}}
        onUpdateScene={() => {}}
        currentChatId={null}
        onChatSelect={() => {}}
        onNewChat={() => {}}
        onSceneButtonClick={() => {}}
        refreshTrigger={0}
        activeTab="examples"
        onTabChange={() => {}}
        onToggleSceneDetails={() => {}}
        onRefreshSceneList={() => {}}
        workspaceScenes={[scene]}
      />
      <ChatOverlay
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
        messages={messages}
        addMessage={addMessage}
        scene={scene}
        getChatForScene={getChatForScene}
        workspaceMessages={messages}
        onSceneUpdate={(propertyPath: string, value: any, reason: string) => { // Added types
          console.log("Scene update:", propertyPath, value, reason);
        }}
      />
      <GraphOverlay
        isOpen={graphOpen}
        onToggle={() => setGraphOpen(!graphOpen)}
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
