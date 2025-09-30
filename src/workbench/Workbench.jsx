import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import ActivityBar from "./ActivityBar";
import Panel from "./Panel";
import EditorArea from "./EditorArea";
import StatusBar from "./StatusBar";
import ChatOverlay from "../views/components/chat/ChatOverlay";
import GraphOverlay from "../views/components/visualizer/GraphOverlay";
import ControllerOverlay from "../views/components/visualizer/ControllerOverlay";
import {
  useWorkspace,
  useWorkspaceScene,
  useWorkspaceChat,
} from "../contexts/WorkspaceContext";

import "./Workbench.css";

const Workbench = () => {
  const { currentView, setCurrentView, getChatForScene, resetSimulation } = useWorkspace();
  const { scene, updateScene, replaceCurrentScene } = useWorkspaceScene();
  const { messages, addMessage } = useWorkspaceChat();
  const [chatOpen, setChatOpen] = useState(false);
  const [graphOpen, setGraphOpen] = useState(false);
  const [controllerOpen, setControllerOpen] = useState(false);
  const [showSceneDetails, setShowSceneDetails] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  // VS Code-inspired layout configuration for each view
  const getLayoutConfig = (view) => {
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
    };
    return configs[view] || configs.dashboard;
  };

  const layoutConfig = getLayoutConfig(currentView);

  // Keyboard shortcuts for view switching (VS Code style: Ctrl+1,2,3...)
  useEffect(() => {
    const handleKeyDown = (e) => {
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
      <ActivityBar activeView={currentView} onViewChange={setCurrentView} />
      {currentView === "visualizer" && !panelOpen && (
        <button
          className="panel-toggle-attached"
          onClick={() => setPanelOpen(!panelOpen)}
          title={panelOpen ? "Hide Scene Selector" : "Show Scene Selector"}
        >
          {!panelOpen && <FontAwesomeIcon icon={faChevronRight} />}
        </button>
      )}
      <div className="workbench-main">
        <div className="workbench-content">
            {currentView === "visualizer" && panelOpen && (
       
       
                  <Panel
                    showSceneDetails={showSceneDetails}
                    onToggleSceneDetails={() =>
                      setShowSceneDetails(!showSceneDetails)
                    }
                    onClosePanel={() => setPanelOpen(false)}
                  />
               
            )}

          <EditorArea activeView={currentView} onViewChange={setCurrentView} />
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
      />
      <ChatOverlay
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
        messages={messages}
        addMessage={addMessage}
        scene={scene}
        getChatForScene={getChatForScene}
        workspaceMessages={messages}
        onSceneUpdate={(propertyPath, value, reason) => {
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
        scene={scene}
        onSceneUpdate={(updatedScene) => {
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
          let objectId, property;

          if (!propertyPath) {
            objectId = prompt('Enter object ID:');
            property = prompt('Enter property name:');
            if (!objectId || !property) return;
          }

          const min = parseFloat(prompt('Enter min value:', '0'));
          const max = parseFloat(prompt('Enter max value:', '10'));
          const step = parseFloat(prompt('Enter step:', '0.1'));
          const value = parseFloat(prompt('Enter initial value:', '1'));

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

          const updatedScene = {
            ...scene,
            controllers: [...(scene.controllers || []), newController]
          };

          console.log('Workbench: Adding new controller, updated scene:', updatedScene.controllers);
          updateScene(updatedScene);
        }}
      />
    </div>
  );
};

export default Workbench;
