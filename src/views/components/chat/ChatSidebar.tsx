import { useState } from 'react';
import { Plus, X, Search, MessageSquare, Trash2, Beaker, ChevronDown, ChevronRight } from 'lucide-react';
import { EXAMPLE_SCENES, type ExampleScene } from '../../../utils/exampleScenes';

interface ChatSession {
  id: string;
  name?: string;
  messages?: any[];
  [key: string]: any;
}

interface ChatSidebarProps {
  collapsed: boolean;
  onClose: () => void;
  chats: ChatSession[];
  currentChatId?: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  getSceneCount?: (chatId: string) => number;
  onSelectExampleScene?: (sceneId: string) => void;
}

export function ChatSidebar({
  collapsed,
  onClose,
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  searchQuery,
  onSearchChange,
  getSceneCount,
  onSelectExampleScene
}: ChatSidebarProps) {
  const [exampleScenesExpanded, setExampleScenesExpanded] = useState(true);
  const [categoryExpanded, setCategoryExpanded] = useState<Record<string, boolean>>({
    'Classical Mechanics': true,
    'Features': false
  });

  // Group example scenes by category
  const scenesByCategory = EXAMPLE_SCENES.reduce((acc, scene) => {
    if (!acc[scene.category]) {
      acc[scene.category] = [];
    }
    acc[scene.category].push(scene);
    return acc;
  }, {} as Record<string, ExampleScene[]>);

  return (
    <div className={`chat-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {!collapsed && (
        <>
          <div className="sidebar-header">
            <div className="sidebar-header-top">
              <button
                className="new-chat-btn"
                onClick={onNewChat}
              >
                <Plus size={18} />
                New Chat
              </button>
              <button 
                className="sidebar-close-mobile"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="sidebar-search">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <div className="sidebar-content">
            {/* Example Simulations Section */}
            {onSelectExampleScene && (
              <div className="sidebar-section">
                <div 
                  className="sidebar-section-header"
                  onClick={() => setExampleScenesExpanded(!exampleScenesExpanded)}
                >
                  {exampleScenesExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <Beaker size={16} />
                  <span className="sidebar-section-title">Example Simulations</span>
                </div>
                
                {exampleScenesExpanded && (
                  <div className="example-scenes-list">
                    {Object.entries(scenesByCategory).map(([category, scenes]) => (
                      <div key={category} className="example-category">
                        <div 
                          className="example-category-header"
                          onClick={() => setCategoryExpanded({
                            ...categoryExpanded,
                            [category]: !categoryExpanded[category]
                          })}
                        >
                          {categoryExpanded[category] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          <span>{category}</span>
                        </div>
                        
                        {categoryExpanded[category] && (
                          <div className="example-category-items">
                            {scenes.map((scene) => (
                              <div
                                key={scene.id}
                                className="example-scene-item"
                                onClick={() => onSelectExampleScene(scene.id)}
                                title={scene.description}
                              >
                                <span className="example-scene-icon">⚛️</span>
                                <span className="example-scene-name">{scene.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recent Chats Section */}
            <div className="sidebar-section-label">Recent Chats</div>
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-session-item ${currentChatId === chat.id ? 'active' : ''}`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="session-info">
                  <MessageSquare size={16} />
                  <span className="session-name">
                    {chat.name || `Chat ${chat.id.slice(-6)}`}
                  </span>
                </div>
                {getSceneCount && (
                  <span className="scene-count-badge" title="Number of scenes">
                    {getSceneCount(chat.id)}
                  </span>
                )}
                {currentChatId === chat.id && chats.length > 1 && (
                  <button
                    className="delete-session-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
