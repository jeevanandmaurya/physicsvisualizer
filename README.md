# PhysicsVisualizer

PhysicsVisualizer is a high-performance, interactive web platform for physics simulation and education. It combines real-time 3D rendering, advanced physics engines, and AI-driven scene generation to make complex physical concepts intuitive and accessible.

**Live Demo**: [physicsvisualizer.vercel.app](https://physicsvisualizer.vercel.app)

## 🚀 How to Use It

### Prerequisites

- **Node.js**: Version 18.x or higher.
- **npm**: Version 9.x or higher.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jeevanandmaurya/physicsvisualizer.git
   cd physicsvisualizer
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Running the App

1. **Start Development Server**:
   ```bash
   npm run dev
   ```
2. **Access the UI**: Open [http://localhost:5173](http://localhost:5173) in your browser.

### Key Features

- **Interactive 3D Sandbox**: Rotate, zoom, and interact with physics objects in real-time.
- **AI Physics Assistant**: Chat with an AI that understands physics and can modify the scene based on your requests.
- **Scene Collection**: Browse pre-built simulations ranging from orbital mechanics to fluid dynamics.
- **Real-time Analytics**: View live graphs of velocity, energy, and momentum.

---

## 🛠️ How It Works

### 🎨 Frontend Architecture

The frontend is a modern React application optimized for 3D performance and modularity.

- **React 19 & Vite**: Utilizes the latest React features and Vite's lightning-fast build system.
- **3D Rendering (Three.js & R3F)**:
  - Uses `@react-three/fiber` for declarative 3D scene management.
  - `@react-three/drei` for high-quality helpers and abstractions.
- **UI & State**:
  - **Tailwind-like CSS**: Custom modular CSS for a clean, responsive dashboard.
  - **Context API**: Manages global state for scenes, AI conversations, and user settings.
  - **Lucide & FontAwesome**: Comprehensive iconography for the workbench.
- **Visual Annotations**: A custom system that renders real-time vectors (velocity, force) and text labels directly in the 3D space using `VisualAnnotationManager`.

### 🧠 CORE PHYSICS and AI

The core logic is decoupled from the UI, allowing for complex simulations and intelligent interactions.

#### Physics Engine

- **Rapier3D Integration**: Uses `@react-three/rapier` for high-performance, WASM-powered rigid body dynamics.
- **Specialized Solvers**:
  - **Gravitational Physics**: Custom N-body simulation logic for orbital mechanics and celestial bodies.
  - **Fluid Dynamics**: Implements buoyancy, viscous drag, and pressure drag for immersive liquid simulations.
  - **Constraint System**: Advanced joint management (springs, revolute joints, fixed joints) via Rapier's impulse joints.
  - **Particle Systems**: High-performance instanced rendering for gas and thermal motion simulations.
- **Physics Data Store**: A centralized store (`PhysicsDataStore`) that captures high-frequency simulation data for UI graphs and annotations without triggering React re-renders.

#### AI Intelligence

- **Gemini 2.5 Flash**: Integrated via `@google/generative-ai` for natural language understanding.
- **Scene Patcher**: A sophisticated system that translates AI intent into incremental JSON patches, allowing the AI to "edit" the world live.
- **Tool System**: The AI can execute JavaScript code in a sandboxed environment to generate complex geometries (e.g., spirals, grids) or perform mathematical calculations.

---

## ⚠️ Limitations and Future

### Current Limitations

- **Physics Fidelity**: While Rapier3D is fast, it is a game physics engine. It may lack the precision required for high-stakes scientific research (e.g., extreme mass ratios or sub-millimeter collisions).
- **Single-Threaded Bottlenecks**: Complex scenes with thousands of constraints can still impact the main thread's frame rate.
- **Particle Limits**: Current particle systems are limited by CPU-side physics calculations.

### Future Roadmap

- **Scientific Physics Engines**: Integration with **MuJoCo** or **PhysX** for research-grade accuracy and more stable constraint solving.
- **Multithreaded Physics**: Moving the entire physics simulation to dedicated **Web Workers** to ensure a consistent 60 FPS UI regardless of simulation complexity.
- **WebGPU Acceleration**: Implementing **WebGPU-based particle solvers** to handle millions of particles for realistic fluid and smoke simulations.
- **Extended Domains**: Adding support for Electromagnetism (Maxwell's equations) and Thermodynamics (Heat transfer).
