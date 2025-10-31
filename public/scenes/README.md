# Scene Examples Structure

This document explains how to add new physics scene examples to the Physics Visualizer.

## Folder Structure

All scene examples are stored in the `scenes/` folder (and copied to `public/scenes/` during build). Each scene has its own subfolder with the following structure:

```
scenes/
└── scene_name/
    ├── scene_name_v1.0.json    # Scene structure (main configuration)
    ├── context.txt              # Educational content (theory, explanation, facts)
    └── thumbnail.svg            # Visual representation (optional, auto-generated if missing)
```

## Adding a New Scene

### 1. Create Scene Folder

Create a new folder in `scenes/` with a descriptive name using snake_case:
```
scenes/new_scene_name/
```

### 2. Create Scene JSON File

Create a JSON file named `{scene_name}_v1.0.json` with the scene configuration:

```json
{
  "id": "unique-scene-id",
  "name": "Scene Display Name",
  "description": "Brief description of what the scene demonstrates",
  "version": "1.0",
  "objects": [
    {
      "id": "object-1",
      "type": "Sphere",
      "mass": 1,
      "radius": 0.5,
      "position": [0, 5, 0],
      "velocity": [0, 0, 0],
      "color": "#FF6347"
    }
  ],
  "gravity": [0, -9.81, 0],
  "hasGround": true,
  "contactMaterial": {
    "friction": 0.5,
    "restitution": 0.7
  },
  "gravitationalPhysics": {
    "enabled": false
  },
  "simulationScale": "terrestrial",
  "controllers": [
    {
      "id": "control-1",
      "label": "Gravity",
      "type": "slider",
      "min": -20,
      "max": 0,
      "step": 0.5,
      "value": -9.81,
      "propertyPath": "gravity[1]"
    }
  ]
}
```

#### Object Types
- `Sphere`: Requires `radius`
- `Box`: Requires `dimensions` [width, height, depth]
- `Cylinder`: Requires `radius` and `height`

#### Common Properties
- `id`: Unique identifier for the object
- `type`: Object type (Sphere, Box, Cylinder)
- `mass`: Mass in kg (0 for static objects)
- `position`: [x, y, z] coordinates
- `velocity`: Initial [vx, vy, vz] (optional)
- `color`: Hex color code
- `isStatic`: Boolean, true for immovable objects

### 3. Create Context File

Create `context.txt` with educational content:

```
Theory:
[Theoretical background of the physics concept]

Explanation:
[Detailed explanation of what's happening in the scene]
[How the physics principles are demonstrated]

Facts:
- First interesting fact
- Second interesting fact
- Key equations and formulas
- Important observations

Key Equations:
- Equation 1: description
- Equation 2: description
```

### 4. Create or Generate Thumbnail

#### Option A: Create Custom SVG
Create `thumbnail.svg` with a simple visual representation:

```svg
<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
  <!-- Your custom scene visualization -->
</svg>
```

#### Option B: Auto-generate
Leave out the `thumbnail.svg` file, and the system will auto-generate a simple thumbnail with the scene initials.

### 5. Update Manifest

Add your scene to `public/scenes/manifest.json`:

```json
{
  "scenes": [
    {
      "id": "your-scene-id",
      "folderName": "your_scene_folder",
      "enabled": true
    }
  ]
}
```

### 6. Copy to Public Directory

After creating/updating scenes, copy them to the public directory:

```bash
# Windows
xcopy /E /I /Y "scenes" "public\scenes"

# Linux/Mac
cp -r scenes/* public/scenes/
```

## Scene Properties Reference

### Simulation Scales
- `terrestrial`: Earth-like gravity and forces
- `astronomical`: For planetary/stellar systems
- `microscopic`: For particle physics

### Controllers
Interactive controls that allow users to modify scene parameters:

```json
{
  "id": "unique-control-id",
  "label": "Display Name",
  "type": "slider",
  "min": 0,
  "max": 100,
  "step": 1,
  "value": 50,
  "objectId": "target-object-id",      // For object properties
  "property": "velocity[0]",            // Or for scene properties
  "propertyPath": "gravity[1]"
}
```

### Contact Materials
Define friction and restitution (bounciness):

```json
{
  "friction": 0.5,      // 0 = no friction, 1 = high friction
  "restitution": 0.7    // 0 = no bounce, 1 = perfect bounce
}
```

## Example Scenes

See these examples for reference:
- `scenes/projectile_motion/` - Basic projectile motion demonstration
- More examples coming soon!

## Best Practices

1. **Keep it Simple**: Start with basic scenes and gradually add complexity
2. **Educational Value**: Include comprehensive context explaining the physics
3. **Visual Clarity**: Use distinct colors and clear spatial arrangement
4. **Interactive**: Add controllers for key parameters students should experiment with
5. **Versioning**: Use version numbers in filenames for future updates
6. **Testing**: Test your scene thoroughly before adding to manifest

## Future Plans

Later, we will implement a database container system similar to this structure for handling user-generated scenes with additional features like:
- Cloud storage
- Sharing and collaboration
- Version control
- Community contributions
