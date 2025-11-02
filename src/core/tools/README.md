# Physics Visualizer - Enhanced Tool System

## 🚀 Overview

The Physics Visualizer now includes a **powerful tool system** that goes far beyond simple LLM chat capabilities. The AI agent can execute real-time JavaScript, generate complex procedural scenes, create Three.js visualizations, analyze physics, and chain multiple operations together.

## 🔧 Core Features

### 1. **Real-Time JavaScript Execution**
Execute arbitrary JavaScript code with access to physics utilities, vector math, and scene context.

**Example:**
```javascript
// Generate 50 spheres in a spiral
const objects = [];
for(let i=0; i<50; i++) {
  const t = i/49;
  const angle = t * 5 * Math.PI * 2;
  const r = 2 + t * 8;
  objects.push({
    id: `sphere_${i}`,
    type: 'Sphere',
    position: [Math.cos(angle)*r, t*15, Math.sin(angle)*r],
    radius: 0.3,
    mass: 1,
    color: `hsl(${t*360}, 70%, 50%)`
  });
}
return objects;
```

### 2. **Procedural Scene Generation**
Generate complex patterns, grids, fractals, and structures programmatically.

**Built-in Generators:**
- Sphere arrays and patterns
- Cube grids (3D)
- Hexagonal arrangements
- Spiral formations
- Fractal trees
- Procedural terrain
- Particle fields

### 3. **Three.js HTML Preview**
Create standalone Three.js visualizations that can be saved and run independently.

### 4. **Physics Analysis**
Analyze scenes for:
- Total kinetic and potential energy
- Momentum (magnitude and direction)
- Center of mass
- Force analysis
- Stability checks

### 5. **Multi-Step Workflows**
Chain multiple tools together for complex operations.

## 📁 Architecture

```
src/core/tools/
├── ToolRegistry.ts         # Central tool registry and execution engine
├── JavaScriptExecutor.ts   # Sandboxed JS execution with physics utilities
├── BuiltInTools.ts         # All built-in tools (7 powerful tools)
├── FunctionCallSystem.ts   # Legacy scene function system (kept for compatibility)
└── index.ts                # Module exports
```

## 🎯 Available Tools

### 1. `execute_javascript`
Execute JavaScript code with full access to Math, Vector3, and Physics utilities.

**Parameters:**
- `code` (string): JavaScript code to execute
- `returnType` (string): 'value', 'objects', or 'scene'
- `timeout` (number): Execution timeout in ms

**Use Cases:**
- Complex calculations
- Custom object generation
- Physics simulations
- Data transformations

### 2. `generate_scene_objects`
Generate arrays of physics objects using code.

**Parameters:**
- `code` (string): Code returning array of objects
- `description` (string): Human-readable description

**Use Cases:**
- Patterns (spirals, grids, waves)
- Procedural content
- Large numbers of objects
- Algorithmic placement

### 3. `generate_complete_scene`
Generate entire physics scenes programmatically.

**Parameters:**
- `code` (string): Code returning complete scene object
- `sceneId` (string): Scene identifier

**Use Cases:**
- Complex multi-object scenes
- Scenes with specific physics settings
- Templated scene generation

### 4. `analyze_scene_physics`
Analyze current scene physics properties.

**Parameters:**
- `analysisType` (string): 'comprehensive', 'energy', 'momentum', 'forces', 'stability'

**Returns:**
- Energy calculations
- Momentum analysis
- Center of mass
- Object statistics

### 5. `create_threejs_preview`
Generate standalone HTML with Three.js visualization.

**Parameters:**
- `threeJsCode` (string): Three.js scene code
- `title` (string): Page title
- `includeControls` (boolean): Add OrbitControls

**Use Cases:**
- Custom visualizations
- Shareable demos
- Non-physics 3D content
- Educational examples

### 6. `execute_workflow`
Chain multiple tools together in sequence.

**Parameters:**
- `steps` (array): Array of {tool, params} objects
- `description` (string): Workflow description

**Use Cases:**
- Generate and analyze
- Multi-step scene building
- Complex operations
- Data pipelines

### 7. `apply_scene_patches`
Apply JSON patch operations to modify scenes.

**Parameters:**
- `patches` (array): JSON patch operations

**Use Cases:**
- Precise modifications
- Programmatic editing
- Batch updates

## 🧪 Example Use Cases

### Generate Hexagonal Grid
```javascript
AI: "Create a hexagonal grid of cylinders"

Tool Call: generate_scene_objects
Code:
const objects = [];
const rings = 4;
const spacing = 2.5;
for(let q=-rings; q<=rings; q++) {
  const r1 = Math.max(-rings, -q-rings);
  const r2 = Math.min(rings, -q+rings);
  for(let r=r1; r<=r2; r++) {
    const x = (Math.sqrt(3)*q + Math.sqrt(3)/2*r) * spacing;
    const z = (3/2*r) * spacing;
    objects.push({
      id: `hex_${q}_${r}`,
      type: 'Cylinder',
      position: [x, 1, z],
      radius: 1,
      height: 0.5,
      mass: 2,
      rotation: [Math.PI/2, 0, 0],
      color: '#32cd32'
    });
  }
}
return objects;
```

### Analyze and Report
```javascript
AI: "Analyze the energy in this scene"

Tool Call: analyze_scene_physics
Parameters: { analysisType: "energy" }

Result:
- Kinetic Energy: 125.43 J
- Potential Energy: 245.82 J
- Total Energy: 371.25 J
```

### Complex Workflow
```javascript
AI: "Generate 20 random balls and analyze their momentum"

Tool Call: execute_workflow
Steps:
1. generate_scene_objects (create balls)
2. analyze_scene_physics (analyze momentum)

Result:
✅ Generated 20 objects
📊 Total Momentum: [12.45, -3.21, 8.67] kg⋅m/s
📊 Momentum Magnitude: 15.23 kg⋅m/s
```

## 🎓 Utilities Available in Code

### Vector3 Class
```javascript
const v = new Vector3(1, 2, 3);
v.add(new Vector3(1, 0, 0));
v.magnitude();
v.normalize();
v.dot(otherVector);
v.cross(otherVector);
```

### Physics Utilities
```javascript
Physics.gravityForce(mass1, mass2, distance, G);
Physics.springForce(k, displacement);
Physics.kineticEnergy(mass, velocity);
Physics.potentialEnergy(mass, height, g);
Physics.momentum(mass, velocity);
Physics.distance(point1, point2);
```

### Math Utilities
All standard JavaScript Math functions plus:
- `Math.random()`
- Trigonometry (sin, cos, tan, etc.)
- Constants (PI, E, etc.)

## 🔒 Security

- **Sandboxed Execution**: Code runs in controlled environment
- **Timeout Protection**: All executions have time limits
- **No File System Access**: Cannot read/write files
- **No Network Access**: Cannot make HTTP requests
- **Memory Limited**: Output size restrictions

## 🚦 Usage Guide

### For AI Agent
The AI should automatically detect when to use tools vs standard responses:

**Use Tools When:**
- User requests >15 objects
- User wants patterns (spirals, grids, fractals)
- User wants custom code execution
- User wants Three.js preview
- User wants physics analysis
- Complex multi-step operations

**Use Standard Responses When:**
- Simple scenes (<10 objects)
- Basic property changes
- Chat/explanations
- Single object add/remove

### For Developers
```typescript
import { toolRegistry } from '@/core/tools';

// Execute a tool
const result = await toolRegistry.executeTool(
  'generate_scene_objects',
  { code: '...', description: '...' },
  { scene: currentScene }
);

// Get all available tools
const tools = toolRegistry.getAllTools();

// Get tool schema for LLM
const schema = toolRegistry.getToolSchemaForAI();
```

## 📊 Performance

- **JavaScript Execution**: < 100ms for most operations
- **Scene Generation**: 1000 objects in ~200ms
- **Tool Registry**: O(1) lookup
- **Memory**: Configurable limits per execution

## 🔄 Integration with Existing System

The new tool system **coexists** with the existing FunctionCallSystem:

- **FunctionCallSystem**: Handles scene function calls (backward compatible)
- **ToolRegistry**: New advanced tool system for AI agent
- **Both work together**: Old scenes still work, new capabilities added

## 📝 Adding Custom Tools

```typescript
import { toolRegistry } from '@/core/tools';

toolRegistry.registerTool({
  name: 'my_custom_tool',
  description: 'Does something amazing',
  category: 'generation',
  parameters: [
    {
      name: 'param1',
      type: 'string',
      description: 'First parameter',
      required: true
    }
  ],
  executor: async (params, context) => {
    // Your tool logic here
    return {
      success: true,
      data: { result: 'Amazing result!' }
    };
  }
});
```

## 🎯 Why This Makes Us Better Than Simple LLM Chat

1. **Code Execution**: Run actual JavaScript, not just describe it
2. **Procedural Generation**: Generate 1000s of objects efficiently
3. **Multi-Step Workflows**: Chain operations together
4. **Physics Analysis**: Real calculations, not estimations
5. **Three.js Export**: Create shareable visualizations
6. **Extensible**: Easy to add new tools
7. **Type-Safe**: Full TypeScript support
8. **Sandboxed**: Secure execution environment

## 📚 Resources

- See `BuiltInTools.ts` for all tool implementations
- See `agentPrompt.txt` for AI agent instructions
- See `gemini.ts` for AI integration
- See examples in `/scenes` directory

---

**Built with ❤️ for Physics Education**
