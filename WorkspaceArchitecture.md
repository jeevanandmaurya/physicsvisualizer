# Workspace-Based Architecture for Physics Visualizer

## Overview

The new Workspace architecture unifies scenes and chats into a single, cohesive unit that represents a complete physics exploration session. This eliminates the complexity of managing separate scene and chat entities while providing a clean, intuitive user experience.

## Core Concepts

### Workspace
A Workspace is the fundamental unit of the application, containing:
- **Scenes Array**: Multiple physics scenes (like current chat.scenes[])
- **Current Scene Index**: Active scene being displayed
- **Chat History**: Complete conversation with AI assistant
- **Settings**: UI preferences, visualization options
- **Metadata**: Creation date, tags, sharing status

### Workspace Manager
Central coordinator that manages:
- Workspace lifecycle (create, load, save, delete)
- Current workspace state
- Event system for UI updates
- Auto-save functionality
- Legacy data migration

## Architecture Benefits

### 1. **Unified Data Model**
```
Before: Scene + Chat (separate entities)
After:  Workspace (single entity)
```

### 2. **Simplified State Management**
- Single source of truth for each exploration session
- Automatic synchronization between scene and chat
- Consistent settings across all components

### 3. **Better User Experience**
- No more confusion about which chat belongs to which scene
- Seamless switching between exploration modes
- Automatic saving of complete sessions

### 4. **Educational Focus**
- Workspaces can be themed for different learning objectives
- Settings persist per workspace (Simple/Advanced mode per project)
- Easy sharing of complete learning experiences

## Data Flow Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Components │◄──►│ WorkspaceManager │◄──►│   Database      │
│                 │    │                  │    │                 │
│ • Visualizer    │    │ • Current        │    │ • saveWorkspace │
│ • Chat Panel    │    │   Workspace      │    │ • getWorkspace  │
│ • Scene List    │    │ • Event System   │    │ • getAllWorkspaces│
│ • Settings      │    │ • Auto-save      │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────────────┐
                    │    Workspace       │
                    │                    │
                    │ • Scene Data       │
                    │ • Chat History     │
                    │ • Settings         │
                    │ • Metadata         │
                    └────────────────────┘
```

## Component Architecture

### WorkspaceProvider (React Context)
```jsx
<WorkspaceProvider>
  <WorkspaceSelector />
  <WorkspaceVisualizer />
  <WorkspaceChat />
</WorkspaceProvider>
```

### Workspace-Aware Components
- **WorkspaceVisualizer**: Renders scene from current workspace
- **WorkspaceChat**: Shows chat history from current workspace
- **WorkspaceSelector**: Lists all user workspaces
- **WorkspaceSettings**: Manages workspace-specific preferences

## Migration Strategy

### Phase 1: Parallel Operation
- Keep existing scene/chat system
- Add workspace system alongside
- Allow users to migrate gradually

### Phase 2: Workspace-First
- New workspaces use unified system
- Legacy scenes/chats remain accessible
- Automatic migration on access

### Phase 3: Full Migration
- Complete transition to workspace system
- Legacy data fully migrated
- Simplified codebase

## Multiple Scenes Per Workspace

The workspace system fully supports the current behavior where users can create multiple scenes within a single chat session:

### Scene Management
```javascript
// Get all scenes in workspace
const scenes = workspace.scenes; // Array of scene objects

// Get current active scene
const currentScene = workspace.getCurrentScene();

// Switch to different scene
workspace.setCurrentScene(1); // Switch to scene at index 1

// Add new scene
const newScene = workspace.addScene({
  name: 'Modified Physics',
  objects: [/* custom objects */]
});

// Duplicate current scene
const copy = workspace.duplicateCurrentScene();

// Delete scene
workspace.deleteScene(2); // Delete scene at index 2
```

### Chat-Scene Relationship
- **Single Chat**: One conversation thread per workspace
- **Multiple Scenes**: Different physics states within that conversation
- **Scene Switching**: Chat context remains, but active scene changes
- **Timeline**: Chat messages can reference different scenes by index

### UI Integration
```jsx
function SceneSwitcher({ workspace }) {
  return (
    <div className="scene-switcher">
      {workspace.scenes.map((scene, index) => (
        <button
          key={scene.id}
          className={index === workspace.currentSceneIndex ? 'active' : ''}
          onClick={() => workspace.setCurrentScene(index)}
        >
          {scene.name}
        </button>
      ))}
      <button onClick={() => workspace.addScene()}>
        + Add Scene
      </button>
    </div>
  );
}
```

## API Design

### WorkspaceManager API
```javascript
const workspaceManager = new WorkspaceManager(database);

// Create new workspace
const workspace = workspaceManager.createWorkspace('My Physics Project');

// Load existing workspace
const workspace = await workspaceManager.loadWorkspace('workspace-123');

// Update workspace
workspaceManager.updateCurrentWorkspace({
  scenes: [/* scene updates */],
  chat: { /* chat updates */ },
  settings: { uiMode: 'advanced' }
});

// Save workspace
await workspaceManager.saveCurrentWorkspace();
```

### React Hook Integration
```javascript
function useWorkspace() {
  const workspace = useWorkspaceContext();

  return {
    workspace,
    updateScene: (updates) => updateWorkspace({ scene: updates }),
    addMessage: (message) => updateWorkspace({ chat: { messages: [...workspace.chat.messages, message] }}),
    updateSettings: (settings) => updateWorkspace({ settings })
  };
}
```

## Benefits for Different User Types

### Students (Simple Mode)
- Clean, distraction-free learning environment
- Educational hints integrated into workflow
- Automatic saving of learning progress
- Easy sharing of completed exercises

### Researchers (Advanced Mode)
- Full control over visualization settings
- Complex multi-object simulations
- Detailed analysis tools
- Custom AI interactions

### Educators
- Create themed workspaces for lessons
- Share complete learning experiences
- Track student progress
- Customize difficulty levels

## Technical Advantages

### 1. **Simplified State Management**
- Single workspace object instead of multiple entities
- Consistent update patterns
- Easier debugging and testing

### 2. **Better Performance**
- Reduced database queries (one workspace vs scene + chat)
- Efficient caching strategies
- Optimized rendering updates

### 3. **Enhanced Reliability**
- Atomic workspace operations
- Better error recovery
- Consistent backup/restore

### 4. **Future Extensibility**
- Easy addition of new workspace features
- Plugin system potential
- Collaboration features foundation

## Implementation Roadmap

### Week 1: Core Infrastructure
- [ ] Workspace and WorkspaceManager classes
- [ ] Database schema updates
- [ ] Basic CRUD operations

### Week 2: UI Integration
- [ ] WorkspaceProvider context
- [ ] Workspace-aware components
- [ ] Migration utilities

### Week 3: Feature Parity
- [ ] All existing features in workspace system
- [ ] Import/export functionality
- [ ] Sharing and collaboration

### Week 4: Optimization & Polish
- [ ] Performance optimizations
- [ ] UI/UX improvements
- [ ] Documentation and testing

This architecture provides a solid foundation for a more intuitive, powerful, and maintainable physics visualization platform.
