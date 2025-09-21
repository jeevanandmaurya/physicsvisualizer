import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faInfoCircle, faRobot } from '@fortawesome/free-solid-svg-icons';
import Conversation from './Conversation';
import SceneDetails from '../../collection/components/SceneDetails';
import './IntegratedPanel.css';

function IntegratedPanel({
  updateConversation,
  conversationHistory,
  initialMessage,
  currentScene,
  onSceneSwitch,
  onNewChat,
  onSceneUpdate,
  onPendingChanges,
  onPreviewMode
}) {
  const [activeView, setActiveView] = useState('chat'); // 'chat', 'details', 'hints'

  const renderEducationalHints = () => {
    if (!currentScene) {
      return (
        <div className="educational-hints">
          <div className="hints-header">
            <FontAwesomeIcon icon={faLightbulb} />
            <h3>Learning Physics</h3>
          </div>
          <div className="hints-content">
            <div className="hint-card">
              <h4>🧲 Forces & Motion</h4>
              <p>Objects move based on forces acting upon them. Gravity pulls objects downward, while other forces can push or pull in different directions.</p>
            </div>
            <div className="hint-card">
              <h4>⚡ Energy</h4>
              <p>Energy can change forms but is never created or destroyed. Watch how kinetic energy (motion) and potential energy (height) interact.</p>
            </div>
            <div className="hint-card">
              <h4>🔄 Conservation Laws</h4>
              <p>Momentum and energy are conserved in collisions. The total amount stays the same, just redistributed among objects.</p>
            </div>
          </div>
        </div>
      );
    }

    // Scene-specific hints
    const hints = [];

    if (currentScene.objects?.length > 1) {
      hints.push({
        icon: '💥',
        title: 'Collisions',
        text: 'Watch how objects interact when they collide. Notice how momentum is conserved!'
      });
    }

    if (currentScene.gravity && currentScene.gravity[1] < 0) {
      hints.push({
        icon: '🌍',
        title: 'Gravity',
        text: 'Gravity pulls all objects downward. Heavier objects fall at the same rate as lighter ones in a vacuum.'
      });
    }

    if (currentScene.objects?.some(obj => obj.velocity && Math.abs(obj.velocity[0]) > 0.1)) {
      hints.push({
        icon: '🏃',
        title: 'Motion',
        text: 'Objects in motion stay in motion unless acted upon by a force (Newton\'s First Law).'
      });
    }

    return (
      <div className="educational-hints">
        <div className="hints-header">
          <FontAwesomeIcon icon={faLightbulb} />
          <h3>Physics Concepts in This Scene</h3>
        </div>
        <div className="hints-content">
          {hints.map((hint, index) => (
            <div key={index} className="hint-card">
              <h4>{hint.icon} {hint.title}</h4>
              <p>{hint.text}</p>
            </div>
          ))}
          {hints.length === 0 && (
            <div className="hint-card">
              <h4>🔬 Explore!</h4>
              <p>Try adding objects or asking the AI to create an interesting physics scenario. What would you like to learn about?</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="integrated-panel">
      {/* Tab Navigation */}
      <div className="integrated-tabs">
        <button
          className={`integrated-tab ${activeView === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveView('chat')}
          title="Chat with AI Physics Assistant"
        >
          <FontAwesomeIcon icon={faRobot} />
          <span>Chat</span>
        </button>
        <button
          className={`integrated-tab ${activeView === 'hints' ? 'active' : ''}`}
          onClick={() => setActiveView('hints')}
          title="Educational hints and explanations"
        >
          <FontAwesomeIcon icon={faLightbulb} />
          <span>Hints</span>
        </button>
        <button
          className={`integrated-tab ${activeView === 'details' ? 'active' : ''}`}
          onClick={() => setActiveView('details')}
          title="Scene properties and object details"
        >
          <FontAwesomeIcon icon={faInfoCircle} />
          <span>Details</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="integrated-content">
        {activeView === 'chat' && (
          <Conversation
            updateConversation={updateConversation}
            conversationHistory={conversationHistory}
            initialMessage={initialMessage}
            currentScene={currentScene}
            onSceneSwitch={onSceneSwitch}
            onNewChat={onNewChat}
            onSceneUpdate={onSceneUpdate}
            onPendingChanges={onPendingChanges}
            onPreviewMode={onPreviewMode}
          />
        )}

        {activeView === 'hints' && renderEducationalHints()}

        {activeView === 'details' && (
          <SceneDetails scene={currentScene} />
        )}
      </div>
    </div>
  );
}

export default IntegratedPanel;
