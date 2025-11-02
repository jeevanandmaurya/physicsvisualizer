# PhysicsVisualizer

PhysicsVisualizer is an interactive web-based physics simulation and visualization platform designed for educational purposes. It enables users to explore complex physics concepts through immersive 3D animations, real-time simulations, and AI-assisted scene creation and modification.

## What It Is

PhysicsVisualizer is a comprehensive tool that bridges the gap between theoretical physics and visual understanding. It provides:

- **Interactive 3D Simulations**: Real-time physics engines power accurate representations of physical phenomena
- **Educational Content**: Each scene includes theoretical explanations, key facts, and mathematical equations
- **AI-Powered Assistance**: Natural language processing allows users to describe physics scenarios and generate corresponding simulations
- **Modular Scene System**: Extensible framework for creating and sharing physics demonstrations

## How It Works

### Architecture Overview

The application follows a layered architecture:

```
User Interface (React Components)
    ↓
Application Layer (State Management, Routing)
    ↓
Feature Layer (Visualizer, Chat, Collection)
    ↓
Core Layer (AI Engine, Physics Engine, Scene Management)
    ↓
Infrastructure (Three.js, Web Workers, IndexedDB)
```

### Core Components

1. **Text Parser & Analyzer**: Converts natural language descriptions into structured physics data using AI
2. **Scene Director & Assembler**: Transforms parsed data into 3D scene configurations
3. **Physics Engine Coordinator**: Manages real-time physics simulations using Rapier3D
4. **Control System Manager**: Handles interactive parameter manipulation
5. **Rendering Engine**: Provides WebGL-based 3D visualization using Three.js
6. **AI Integration**: Gemini AI enables conversational physics assistance and scene generation

### Scene Structure

Each physics scene is defined by a JSON configuration containing:
- Object definitions (spheres, boxes, cylinders) with physical properties
- Initial conditions (position, velocity, mass)
- Environmental parameters (gravity, friction)
- Educational context and metadata

## Features

### 🎯 Core Features

- **Real-time 3D Physics Simulations**: Powered by Rapier3D physics engine
- **Interactive Controls**: Play/pause, parameter adjustment, camera controls
- **Data Visualization**: Real-time graphs and overlays for position, velocity, energy
- **Scene Management**: Collection browser, scene switching, persistence
- **AI Chat Interface**: Conversational physics assistance and scene modification

### 📚 Educational Content

- **Theory Explanations**: Detailed descriptions of physical principles
- **Mathematical Equations**: Key formulas with LaTeX rendering
- **Interactive Demonstrations**: Hands-on exploration of concepts
- **Progress Tracking**: Learning path through categorized scenes

### 🔧 Technical Features

- **Modular Architecture**: Extensible component system
- **Web Worker Physics**: Non-blocking simulations for smooth performance
- **Responsive Design**: Works across desktop and mobile devices
- **Offline Capability**: Local storage for scenes and conversations

### 📊 Available Scenes

The platform includes scenes covering:

- **Mechanics**: Projectile motion, collisions, pendulum dynamics, momentum conservation
- **Gravitation**: Orbital mechanics, binary star systems
- **Waves**: Wave patterns, interference demonstrations
- **Electromagnetism**: (Planned for future releases)
- **Thermodynamics**: (Planned for future releases)

## How to Use

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jeevanandmaurya/physicsvisualizer.git
cd physicsvisualizer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Basic Usage

1. **Select a Scene**: Use the scene selector to choose from available physics demonstrations
2. **Interact**: Use play/pause controls to start/stop simulations
3. **Adjust Parameters**: Modify physical properties using the control panel
4. **View Data**: Open graphs to visualize position, velocity, and energy over time
5. **Chat with AI**: Ask physics questions or request scene modifications

### Advanced Usage

- **Create Custom Scenes**: Use the AI chat to describe physics scenarios in natural language
- **Modify Existing Scenes**: Request changes to current simulations through conversation
- **Export Data**: Access simulation data for further analysis
- **Share Scenes**: Save and share custom physics demonstrations

## Development

### Project Structure

```
src/
├── components/          # React components
├── core/               # Core business logic
│   ├── ai/            # AI integration (Gemini)
│   ├── physics/       # Physics calculations
│   └── scene/         # Scene management
├── contexts/          # React contexts
├── pages/             # Page components
├── utils/             # Utility functions
└── workbench/         # Main application layout

scenes/                 # Scene definitions
├── scene_name/
│   ├── scene_name_v1.0.json  # Scene configuration
│   ├── context.txt           # Educational content
│   └── thumbnail.svg         # Preview image
```

### Building

```bash
npm run build
```

### Testing

```bash
npm run test
```

### Adding New Scenes

1. Create a new folder in `scenes/`
2. Add `scene_name_v1.0.json` with scene configuration
3. Include `context.txt` with educational content
4. Update `public/scenes/manifest.json`

## Differences from Existing Tools

### vs. Traditional Physics Software

- **Web-Native**: No installation required, runs in any modern browser
- **AI Integration**: Natural language scene creation and modification
- **Educational Focus**: Built-in theory, explanations, and learning paths
- **Real-time Collaboration**: Web-based sharing and discussion

### vs. Other Physics Simulators

- **Conversational Interface**: Chat with AI to create and modify simulations
- **Modular Scene System**: Easy to extend and customize
- **Performance Optimized**: Web Workers ensure smooth 60fps simulations
- **Open Source**: Fully transparent and community-driven development

### vs. Educational Platforms

- **Hands-on 3D**: Immersive 3D visualizations vs. 2D diagrams
- **Interactive Parameters**: Real-time adjustment of physical properties
- **AI Tutoring**: Intelligent assistance and scene generation
- **Comprehensive Coverage**: From basic mechanics to advanced physics

## Contributing

We welcome contributions! Please see our contributing guidelines for details on:

- Adding new physics scenes
- Improving AI integration
- Enhancing visualization features
- Documentation improvements

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React, Three.js, and Rapier3D
- AI powered by Google Gemini
- Physics calculations using established principles
- Educational content based on standard physics curricula</content>
<parameter name="filePath">d:\Programming\Web Development\physicsvisualizer\README.md