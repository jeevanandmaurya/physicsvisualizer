# PhysicsVisualizer - Roadmap

> **Mission**: Make classical mechanics intuitive for students, teachers, and curious minds.  
> **Scope**: High school → Intro college physics (AP Physics 1/C, IB Physics, University Physics I)

---

## Stack Decision: KEEP CURRENT ✅

| Current | Alternative | Verdict |
|---------|-------------|---------|
| **Vite + React** | Next.js | ✅ Keep - No SSR needed, faster dev, simpler deployment |
| **No router** | React Router | ✅ Keep - Single-page workbench works fine, add later if needed |
| **Rapier3D** | Cannon/Ammo | ✅ Keep - Best WASM physics for browser, covers all mechanics |
| **Context API** | Zustand/Redux | ✅ Keep - Already well-structured, no complexity needed |
| **Vercel deploy** | — | ✅ Keep - Perfect for static SPA |

**No stack changes needed.** Focus on content and pedagogy, not architecture.

---

## Phase 1: Core Simulations (Content) 🎯

Complete the foundational simulation library covering all major mechanics topics.

### Have ✅
- [x] Projectile motion
- [x] Momentum conservation
- [x] Pendulum energy
- [x] Orbital mechanics (N-body)
- [x] Binary star system
- [x] Laws of motion / collisions

### Need 🔨
- [ ] **Friction demo** - Block on surface with μs/μk sliders
- [ ] **Inclined plane** - Mass on ramp, decompose forces
- [ ] **Spring oscillator** - Mass on spring, SHM with energy graph
- [ ] **Atwood machine** - Two masses on pulley
- [ ] **Rotational motion** - Spinning disk, angular momentum
- [ ] **Rolling vs sliding** - Ball/cylinder down ramp comparison
- [ ] **Coupled pendulums** - Energy transfer between oscillators
- [ ] **Elastic vs inelastic** - Side-by-side collision comparison
- [ ] **Centripetal force** - Ball on string, circular motion
- [ ] **Torque balance** - Seesaw/lever equilibrium
- [ ] **Ballistic pendulum** - Classic momentum→energy problem

---

## Phase 2: Learning Experience (Pedagogy) 📚

Transform simulations from demos into teaching tools.

### Scene Metadata Enhancements
- [ ] Add `learningObjectives` to each scene JSON
- [ ] Add `prerequisites` (which scenes to do first)
- [ ] Add `difficulty` level (beginner/intermediate/advanced)
- [ ] Add `curriculum` tags (AP Physics 1, IB, etc.)
- [ ] Add `keyEquations` array for formula display

### Formula Overlay System
- [ ] Toggle to show relevant equations (KaTeX rendering)
- [ ] Equations update with live values from simulation
- [ ] Example: `KE = ½mv² = ½(2)(3.5)² = 12.25 J`

### Guided Mode
- [ ] Step-by-step walkthrough for each simulation
- [ ] "What to notice" callouts
- [ ] Questions to prompt thinking
- [ ] Reveal answers after user attempts

---

## Phase 3: AI Tutor Enhancement 🤖

Make the AI a true physics tutor, not just a chatbot.

### Context-Aware Explanations
- [ ] AI reads current scene state when answering
- [ ] "Why is the ball slowing down?" → uses actual velocity data
- [ ] AI can reference specific objects by name

### Interactive Teaching
- [ ] AI can pause simulation to make a point
- [ ] AI can highlight specific objects
- [ ] AI can add temporary annotations (vectors, labels)
- [ ] AI asks follow-up questions to check understanding

### Socratic Mode
- [ ] Instead of answering directly, AI guides with questions
- [ ] "What do you think happens to momentum?" → waits for response
- [ ] Provides hints before full answers

---

## Phase 4: Teacher Tools 👩‍🏫

Enable classroom use and assignments.

### Sharing & Embedding
- [ ] Shareable scene URLs with specific initial conditions
- [ ] Embed mode (`?embed=true`) for LMS integration
- [ ] Export simulation as GIF/MP4
- [ ] Fullscreen presentation mode

### Assignment Builder
- [ ] Teacher creates scenario with hidden variables
- [ ] Student must determine mass/friction/etc from behavior
- [ ] "Predict mode" - pause, draw expected path, compare

### Class Management (Future)
- [ ] Teacher accounts with student tracking
- [ ] Assign specific simulations
- [ ] View student interactions

---

## Phase 5: Polish & Scale 💎

### UX Improvements
- [ ] Onboarding tour for first-time users
- [ ] Keyboard shortcuts (space=play/pause, r=reset)
- [ ] Mobile-responsive controls
- [ ] Accessibility (screen reader support for key info)

### Performance (Only If Needed)
- [ ] Lazy load scenes
- [ ] Compress scene JSON files
- [ ] Service worker for offline use

### Community (Long-term)
- [ ] User-submitted simulations
- [ ] Rating/review system
- [ ] Teacher-curated collections

---

## Immediate Next Steps (This Week)

1. **Add scene metadata schema** - Define JSON structure for learning objectives
2. **Build friction demo** - Most requested basic simulation
3. **Formula overlay MVP** - Show 1-2 equations per scene
4. **Update README** - Reflect educational focus

---

## Non-Goals (Explicitly Out of Scope)

- ❌ Advanced physics (relativity, quantum, fluid dynamics)
- ❌ Research-grade accuracy
- ❌ Multiplayer/collaboration
- ❌ Mobile app (web-first)
- ❌ Custom physics engine

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Core simulations | 15+ covering full curriculum |
| Scene completion | Each has objectives, equations, walkthrough |
| AI helpfulness | Can explain any visible phenomenon |
| Teacher adoption | Embeddable in 3 major LMS platforms |

---

*Last updated: January 22, 2026*
