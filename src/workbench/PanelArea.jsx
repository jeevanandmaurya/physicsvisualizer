import React, { useState, Suspense } from 'react';
import { useWorkspace, useWorkspaceScene, useWorkspaceChat, useWorkspaceSettings } from '../contexts/WorkspaceContext';

// Lazy load components
const Conversation = React.lazy(() => import('../features/chat/components/Conversation'));
const IntegratedPanel = React.lazy(() => import('../features/chat/components/IntegratedPanel'));
const SceneDetails = React.lazy(() => import('../features/collection/components/SceneDetails'));

// Loading component
const ComponentLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px' }}>
    <span>Loading...</span>
  </div>
);

const PanelArea = ({ activeView, collapsed, onToggleCollapse }) => {
  const [rightPanelView, setRightPanelView] = useState('chat');
  const { scene } = useWorkspaceScene();
  const { messages, addMessage } = useWorkspaceChat();
  const { uiMode } = useWorkspaceSettings();
  const { getChatForScene } = useWorkspace();

  // Get the chat ID for the current scene
  const currentChatId = scene?.id ? getChatForScene(scene.id) : null;

  const getPanelContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <div>Dashboard Details</div>;
      case 'collection':
        return <div>Scene Properties</div>;
      case 'visualizer':
        if (uiMode === 'simple') {
          return (
            <Suspense fallback={<ComponentLoader />}>
              <IntegratedPanel
                updateConversation={(newMessages) => {
                  // Handle conversation updates
                  const latestMessage = newMessages[newMessages.length - 1];
                  if (latestMessage) {
                    addMessage(latestMessage);
                  }
                }}
                conversationHistory={messages}
                initialMessage="Hello! I'm a Physics AI Agent. I can help you with physics questions and also discuss how to represent described scenes in a 3D visualizer JSON format. How can I assist you with physics today?"
                currentScene={scene}
                onSceneUpdate={(propertyPath, value, reason) => {
                  // Handle scene updates from AI
                  console.log('Scene update:', propertyPath, value, reason);
                }}
                onPendingChanges={() => {}}
                onPreviewMode={() => {}}
                chatId={currentChatId}
              />
            </Suspense>
          );
        } else {
          return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #3e3e42' }}>
                <button
                  className={`panel-tab ${rightPanelView === 'chat' ? 'active' : ''}`}
                  onClick={() => setRightPanelView('chat')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    color: rightPanelView === 'chat' ? '#ffffff' : '#cccccc',
                    cursor: 'pointer',
                    borderBottom: rightPanelView === 'chat' ? '2px solid #007acc' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  💬 Chat
                </button>
                <button
                  className={`panel-tab ${rightPanelView === 'details' ? 'active' : ''}`}
                  onClick={() => setRightPanelView('details')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    color: rightPanelView === 'details' ? '#ffffff' : '#cccccc',
                    cursor: 'pointer',
                    borderBottom: rightPanelView === 'details' ? '2px solid #007acc' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  📋 Details
                </button>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <Suspense fallback={<ComponentLoader />}>
                  {rightPanelView === 'chat' ? (
                    <Conversation
                      updateConversation={(newMessages) => {
                        const latestMessage = newMessages[newMessages.length - 1];
                        if (latestMessage) {
                          addMessage(latestMessage);
                        }
                      }}
                      conversationHistory={messages}
                      initialMessage="Hello! I'm a Physics AI Agent. I can help you with physics questions and also discuss how to represent described scenes in a 3D visualizer JSON format. How can I assist you with physics today?"
                      currentScene={scene}
                      onSceneUpdate={(propertyPath, value, reason) => {
                        console.log('Scene update:', propertyPath, value, reason);
                      }}
                      onPendingChanges={() => {}}
                      onPreviewMode={() => {}}
                      chatId={currentChatId}
                    />
                  ) : (
                    <SceneDetails scene={scene} />
                  )}
                </Suspense>
              </div>
            </div>
          );
        }
      case 'history':
        return <div>Chat Details</div>;
      case 'settings':
        return <div>Setting Details</div>;
      case 'analytics':
        return <div>Analytics Details</div>;
      default:
        return <div>Details</div>;
    }
  };

  return (
    <div className={`panel-area ${collapsed ? 'collapsed' : ''}`}>
      {!collapsed && (
        <>
          <div className="panel-header">
            <span>{activeView.charAt(0).toUpperCase() + activeView.slice(1)} Panel</span>
            <button className="toggle-button" onClick={onToggleCollapse}>×</button>
          </div>
          <div className="panel-content">
            {getPanelContent()}
          </div>
        </>
      )}
      {collapsed && (
        <button className="toggle-button" onClick={onToggleCollapse} style={{ margin: '10px' }}>
          ☰
        </button>
      )}
    </div>
  );
};

export default PanelArea;
