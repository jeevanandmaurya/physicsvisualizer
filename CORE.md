# Core Documentation

This document provides detailed information about the core modules of PhysicsVisualizer, which form the foundation of the application's functionality.

## Overview

The core layer consists of several interconnected modules that handle the application's primary logic:

- **AI**: Natural language processing and scene generation
- **Database**: Data persistence and storage
- **Physics**: Physics simulation engines and calculations
- **Scene**: Scene management, patching, and history
- **Tools**: AI tool system for code execution and scene generation
- **Visuals**: Visual annotation and rendering systems
- **Workspace**: Workspace management and configuration

## AI Module (`src/core/ai/`)

### GeminiAIManager (`gemini.ts`)

The Gemini AI Manager handles all interactions with Google's Gemini AI API for physics-related conversations and scene generation.

**Key Features:**
- Natural language physics assistance
- Scene creation from text descriptions
- Real-time scene modifications via chat
- Tool integration for code execution

**Architecture:**
```typescript
class GeminiAIManager {
  private apiKey: string;
  private prompt: string;
  private scenePatcher: ScenePatcher;
  // ... methods for API calls and scene manipulation
}
```

**Usage:**
```typescript
const aiManager = new GeminiAIManager();
await aiManager.initialize();
const response = await aiManager.callGeminiAPI(prompt);
```

### Prompts (`prompts/`)

Contains predefined prompts for different AI interactions:
- `agentPrompt.txt`: Main agent behavior and capabilities
- `chatPrompt.txt`: Chat-specific instructions

## Database Module (`src/core/database/`)

### IndexedDBService (`IndexedDBService.ts`)

Handles persistent storage using IndexedDB for scenes, conversations, and user data.

**Features:**
- Scene storage and retrieval
- Conversation history persistence
- User preferences storage
- Offline capability

**Key Methods:**
- `saveScene(sceneId, sceneData)`
- `loadScene(sceneId)`
- `saveConversation(conversationData)`
- `getAllScenes()`

## Physics Module (`src/core/physics/`)

### Engine (`engine.tsx`)

The main physics engine component using Rapier3D for real-time physics simulation.

**Components:**
- `PhysicsEngine`: Main engine class (API compatibility layer)
- `GravitationalForces`: Handles gravitational interactions
- `ConstraintForces`: Manages physics constraints
- `FluidForces`: Fluid dynamics calculations

**Supported Physics Types:**
- Rigid body dynamics
- Gravitational forces
- Constraints (springs, joints)
- Fluid interactions
- Particle systems

### Specialized Physics Modules

#### Gravitation (`gravitation/`)
- Orbital mechanics calculations
- N-body gravitational simulations
- Celestial body interactions

#### Constraints (`constraints/`)
- Spring systems
- Joint constraints
- Collision detection
- Force propagation

#### Fluid (`fluid/`)
- Fluid dynamics
- Buoyancy calculations
- Drag forces

#### Electrostatic (`electrostatic/`)
- Electric field calculations
- Charge interactions
- Electromagnetic forces

### Data Management

#### PhysicsDataStore (`PhysicsDataStore.ts`)
Manages physics simulation data and state.

#### usePhysicsDataStore (`usePhysicsDataStore.ts`)
React hook for accessing physics data in components.

## Scene Module (`src/core/scene/`)

### ScenePatcher (`patcher.ts`)

Handles JSON Patch operations for scene modifications with validation.

**Features:**
- JSON Patch RFC 6902 compliance
- Comprehensive validation rules
- Safe scene modifications
- Error handling and rollback

**Validation Rules:**
```typescript
validationRules: {
  gravity: (value) => Array.isArray(value) && value.length === 3,
  mass: (value) => typeof value === 'number' && value > 0,
  position: (value) => Array.isArray(value) && value.length === 3,
  // ... more validation rules
}
```

**Usage:**
```typescript
const patcher = new ScenePatcher();
const result = patcher.applyPatches(scene, patches);
```

### SceneLoader (`SceneLoader.ts`)

Manages scene loading, parsing, and initialization.

**Features:**
- JSON scene file parsing
- Scene validation
- Asset loading coordination
- Error handling

### History (`history.ts`)

Manages scene modification history for undo/redo functionality.

## Tools Module (`src/core/tools/`)

### Overview

The tools system enables the AI agent to execute JavaScript code, generate procedural scenes, and perform complex operations.

### Core Components

#### ToolRegistry (`ToolRegistry.ts`)
Manages available tools and their execution.

#### FunctionCallSystem (`FunctionCallSystem.ts`)
Handles function calling and parameter validation.

#### JavaScriptExecutor (`JavaScriptExecutor.ts`)
Safe JavaScript execution environment with physics utilities.

#### BuiltInTools (`BuiltInTools.ts`)
Predefined tools for common operations.

### Available Tools

1. **JavaScript Execution**: Run arbitrary JS code with physics context
2. **Scene Generation**: Procedural scene creation
3. **Three.js Preview**: Generate standalone 3D visualizations
4. **Physics Analysis**: Calculate energies, momenta, etc.
5. **Math Operations**: Vector math, calculus, etc.
6. **File Operations**: Scene import/export

### Tool Categories

- **Generation Tools**: Create objects, patterns, structures
- **Analysis Tools**: Physics calculations and measurements
- **Visualization Tools**: Graphs, plots, 3D previews
- **Utility Tools**: Math helpers, data processing

## Visuals Module (`src/core/visuals/`)

### Overview

The visual annotation system adds interactive elements to physics scenes.

### Components

#### VisualAnnotationManager (`VisualAnnotationManager.tsx`)
Main component for managing visual annotations.

#### Annotations (`annotations/`)
- Text labels and measurements
- Velocity/force vectors
- Motion trails
- Coordinate systems
- Scale indicators

#### Renderers (`renderers/`)
- Three.js rendering components
- Annotation positioning
- Dynamic updates

### Annotation Types

1. **Text Annotations**
   - Speed/velocity labels
   - Force magnitudes
   - Custom text overlays

2. **Vector Annotations**
   - Velocity vectors
   - Force vectors
   - Acceleration indicators

3. **Trail Annotations**
   - Motion paths
   - Trajectory visualization
   - Particle traces

4. **Geometric Annotations**
   - Coordinate axes
   - Measurement lines
   - Angle indicators

### Configuration

Annotations are defined in scene JSON:

```json
{
  "visualAnnotations": [
    {
      "id": "velocity-vector",
      "type": "vector",
      "attachedToObjectId": "projectile",
      "contentType": "velocity",
      "scale": 0.1,
      "color": "#00ff00"
    }
  ]
}
```

## Workspace Module (`src/core/workspace/`)

### WorkspaceManager (`WorkspaceManager.ts`)

Manages the overall application workspace state and configuration.

**Features:**
- Scene collection management
- Workspace layout persistence
- User preferences
- Multi-scene coordination

**Key Responsibilities:**
- Scene switching and management
- Layout state persistence
- User settings storage
- Workspace initialization

## Integration Patterns

### Scene Modification Flow

```
User Input → AI Processing → Tool Execution → Scene Patching → Physics Update → Visual Rendering
```

### Data Flow

```
Scenes → SceneLoader → Physics Engine → Data Store → Visual Components → UI
```

### AI Integration

```
User Query → Gemini API → Tool Selection → Code Execution → Scene Modification → Validation → Update
```

## Performance Considerations

### Physics Optimization
- Web Workers for heavy calculations
- Spatial partitioning for collision detection
- LOD (Level of Detail) for complex scenes
- Caching of computed values

### Rendering Optimization
- Instanced rendering for multiple objects
- Frustum culling
- Texture atlasing
- Shader precompilation

### Memory Management
- Object pooling for frequently created/destroyed objects
- Garbage collection hints
- IndexedDB for large data sets
- Lazy loading of scene assets

## Error Handling

### Validation Layers
- Input validation at API boundaries
- Scene validation before physics simulation
- Runtime error catching in tools execution
- Fallback rendering for failed components

### Recovery Mechanisms
- Scene rollback on patch failures
- Default values for missing properties
- Graceful degradation of features
- User-friendly error messages

## Extensibility

### Adding New Physics Types
1. Create physics calculation module
2. Add to engine integration
3. Update scene validation rules
4. Add UI controls if needed

### Adding New Tools
1. Implement tool function
2. Register in ToolRegistry
3. Add to AI prompts
4. Update documentation

### Adding New Annotations
1. Create annotation component
2. Add to VisualAnnotationManager
3. Update scene schema
4. Add configuration UI

This core documentation provides the foundation for understanding and extending the PhysicsVisualizer system. Each module is designed to be modular and extensible while maintaining performance and reliability.</content>
<parameter name="filePath">d:\Programming\Web Development\physicsvisualizer\CORE.md