# PhysicsVisualizer

> **Learn physics by playing with it.**

An interactive 3D physics sandbox for students, teachers, and curious minds. Visualize classical mechanics concepts from projectile motion to orbital dynamics, with an AI tutor that explains what's happening.

**🎮 Live Demo**: [physicsvisualizer.vercel.app](https://physicsvisualizer.vercel.app)

---

## Who Is This For?

| User | Use Case |
|------|----------|
| 🎓 **Students** | Explore physics concepts visually, ask the AI "why does this happen?" |
| 👩‍🏫 **Teachers** | Demonstrate mechanics in class, create interactive examples |
| 🔬 **Curious minds** | Play with physics, build custom scenarios, satisfy your curiosity |

## Curriculum Coverage

- ✅ AP Physics 1 & C (Mechanics)
- ✅ IB Physics (Mechanics units)
- ✅ College Physics I (algebra & calculus-based)
- ✅ High school physics

---

## Features

- **🎮 Interactive 3D Sandbox** — Rotate, zoom, throw objects, watch physics unfold
- **🤖 AI Physics Tutor** — Ask questions, get explanations based on what's in the scene
- **📊 Real-time Graphs** — Velocity, energy, momentum plotted live
- **🎯 Vector Annotations** — See forces and velocities as arrows in 3D space
- **📚 Simulation Library** — Pre-built demos for key physics concepts

---

## Quick Start

```bash
git clone https://github.com/jeevanandmaurya/physicsvisualizer.git
cd physicsvisualizer
npm install
```

Create `.env` file:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Run:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + Vite |
| 3D Rendering | Three.js via @react-three/fiber |
| Physics | Rapier3D (WASM) |
| AI | Google Gemini 2.5 Flash |
| Deployment | Vercel |

---

## Available Simulations

- Projectile Motion
- Momentum Conservation
- Pendulum Energy
- Orbital Mechanics (N-body)
- Binary Star System
- Newton's Laws & Collisions
- *...and more in development*

---

## Contributing

See [TASKS.md](TASKS.md) for the current roadmap and priorities.

---

## License

MIT
