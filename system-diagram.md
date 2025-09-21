# PhysicsVisualizer System Architecture

## 🏗️ PhysicsVisualizer System Architecture (ASCII)

```
+-----------------------------------+
|         USER INTERFACE             |
|  +-----------------------------+  |
|  | React Components            |  |
|  | - App.jsx (Main)            |  |
|  | - GlobalNav.jsx (Navigation)|  |
|  | - Pages (Dashboard, etc.)   |  |
|  +-----------------------------+  |
+-----------------------------------+
                |
                v
+-----------------------------------+
|      APPLICATION LAYER             |
|  +-----------------------------+  |
|  | React Router                |  |
|  | DatabaseContext (State)     |  |
|  +-----------------------------+  |
+-----------------------------------+
                |
                v
+-----------------------------------+
|        FEATURE LAYER               |
|  +-----------------------------+  |
|  | Visualizer Feature          |  |
|  | - Visualizer.jsx            |  |
|  | - OverlayGraph.jsx          |  |
|  | - SceneConsole.jsx          |  |
|  +-----------------------------+  |
|  | Chat Feature                |  |
|  | - Conversation.jsx          |  |
|  +-----------------------------+  |
|  | Collection Feature          |  |
|  | - SceneSelector.jsx         |  |
|  | - SceneDetails.jsx          |  |
|  | - ChangePreview.jsx         |  |
|  +-----------------------------+  |
+-----------------------------------+
                |
                v
+-----------------------------------+
|          CORE LAYER                |
|  +-----------------------------+  |
|  | AI Engine (Gemini.js)       |  |
|  | Physics Engine (Cannon.js)  |  |
|  | Scene Management (Patcher) |  |
|  +-----------------------------+  |
+-----------------------------------+
                |
                v
+-----------------------------------+
|      INFRASTRUCTURE                |
|  +-----------------------------+  |
|  | Three.js (WebGL Rendering)  |  |
|  | Web Workers (Physics)       |  |
|  | IndexedDB (Storage)         |  |
|  +-----------------------------+  |
+-----------------------------------+
```

## 🔄 Data Flow (Simple Flow)

```
User Input
    |
    v
React UI (Components)
    |
    v
State Management (DatabaseContext)
    |
    +--> Physics Engine (Cannon.js in Web Worker)
    |       |
    |       v
    |   Three.js Rendering (Visuals)
    |
    +--> AI Engine (Gemini API)
    |       |
    |       v
    |   Chat Responses
    |
    +--> Scene Storage (IndexedDB)
            |
            v
Persistent Scenes
```

## 📊 Key Connections

- **UI → State**: User interactions update React state
- **State → Physics**: Parameters flow to Cannon.js simulation
- **Physics → UI**: Results update visuals in real-time
- **AI → State**: Gemini processes chat and generates scene changes
- **Storage ↔ State**: Scenes load/save from IndexedDB

## 🎯 Why This Format?
- **Simple & Supported**: Pure text/ASCII - works everywhere (VS Code, GitHub, any editor)
- **Clear Structure**: Shows layers from UI to infrastructure
- **Easy to Read**: No special rendering needed
- **Professional**: Clean hierarchy with clear flow

This diagram clearly shows how your **feature-based architecture** works: from user interface down to physics simulation and storage. Everything is modular and connected through the central state management!

If you need more details or adjustments, let me know! 🚀
