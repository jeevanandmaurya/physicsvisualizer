# Visual Annotation System - Demo Scene

This file demonstrates how to add visual annotations to your physics scenes.

## Example Scene with Annotations

```json
{
  "id": "projectile-with-annotations",
  "name": "Projectile Motion with Visual Annotations",
  "description": "Projectile motion demo with velocity vectors, speed labels, and motion trails",
  "objects": [
    {
      "id": "projectile",
      "type": "Sphere",
      "mass": 1,
      "radius": 0.3,
      "position": [0, 1, 0],
      "velocity": [10, 10, 0],
      "color": "#FF4500"
    },
    {
      "id": "ground",
      "type": "Box",
      "mass": 0,
      "dimensions": [50, 0.1, 50],
      "position": [0, 0, 0],
      "color": "#666666",
      "isStatic": true
    }
  ],
  "gravity": [0, -9.81, 0],
  "hasGround": true,
  "contactMaterial": {
    "friction": 0.3,
    "restitution": 0.6
  },
  "visualAnnotations": [
    {
      "id": "speed-label",
      "type": "text",
      "attachedToObjectId": "projectile",
      "contentType": "speed",
      "prefix": "Speed: ",
      "suffix": " m/s",
      "precision": 1,
      "offset": [0, 1, 0],
      "anchor": "top",
      "fontSize": 20,
      "color": "#ffffff",
      "backgroundColor": "rgba(0, 0, 0, 0.8)",
      "visible": true,
      "updateFrequency": 30
    },
    {
      "id": "velocity-vector",
      "type": "vector",
      "attachedToObjectId": "projectile",
      "vectorType": "velocity",
      "scale": 0.3,
      "color": "#00aaff",
      "showMagnitude": true,
      "offset": [0, 0, 0],
      "anchor": "center",
      "visible": true
    },
    {
      "id": "position-label",
      "type": "text",
      "attachedToObjectId": "projectile",
      "contentType": "position",
      "prefix": "Pos: ",
      "precision": 1,
      "offset": [0, -0.8, 0],
      "anchor": "bottom",
      "fontSize": 14,
      "color": "#ffff00",
      "backgroundColor": "rgba(0, 0, 0, 0.6)"
    }
  ]
}
```

## Annotation Types

### 1. Text Annotations

Display dynamic labels showing physics properties:

```json
{
  "id": "speed-label",
  "type": "text",
  "attachedToObjectId": "my-object",
  "contentType": "speed",        // speed, velocity, mass, kineticEnergy, momentum, position
  "prefix": "V: ",
  "suffix": " m/s",
  "precision": 2,
  "offset": [0, 1, 0],           // Position relative to object
  "anchor": "top",               // Where to attach: top, bottom, left, right, center
  "fontSize": 18,
  "color": "#ffffff",
  "backgroundColor": "rgba(0, 0, 0, 0.7)",
  "padding": 8,
  "borderRadius": 4,
  "opacity": 1.0,
  "visible": true,
  "minSpeed": 0.1,               // Only show when object is moving
  "updateFrequency": 30          // Update rate in Hz
}
```

**Available contentType values:**
- `speed` - Magnitude of velocity
- `velocity` - Full velocity vector (vx, vy, vz)
- `position` - Position coordinates (x, y, z)
- `mass` - Object mass
- `kineticEnergy` - Kinetic energy (0.5 * m * v²)
- `momentum` - Momentum vector (m * v)
- `custom` - Use customText field

**Custom text example:**
```json
{
  "type": "text",
  "contentType": "custom",
  "customText": "My Label"
}
```

### 2. Vector Annotations

Display arrows showing velocity, force, momentum, etc:

```json
{
  "id": "velocity-arrow",
  "type": "vector",
  "attachedToObjectId": "my-object",
  "vectorType": "velocity",      // velocity, momentum, acceleration, force, custom
  "scale": 0.5,                  // Visual scale multiplier
  "color": "#00ff88",
  "showMagnitude": true,         // Show value at arrow tip
  "offset": [0, 0, 0],
  "anchor": "center",
  "shaftRadius": 0.02,           // Arrow shaft thickness
  "headLength": 0.25,            // Arrow head length ratio
  "headRadius": 0.08,            // Arrow head width ratio
  "minSpeed": 0.1                // Only show when moving
}
```

**Available vectorType values:**
- `velocity` - Velocity vector
- `momentum` - Momentum (mass × velocity)
- `acceleration` - Acceleration (needs velocity history)
- `force` - Force vector (needs force data)
- `custom` - Use customVector field

### 3. Trail Annotations (Coming Soon)

Display motion paths:

```json
{
  "id": "motion-trail",
  "type": "trail",
  "attachedToObjectId": "my-object",
  "maxLength": 100,              // Maximum trail points
  "updateInterval": 0.1,         // Time between points (seconds)
  "color": "#ff00ff",
  "colorGradient": true,         // Use speed-based gradient
  "gradientStartColor": "#0000ff",
  "gradientEndColor": "#ff0000",
  "width": 2,
  "opacity": 0.8,
  "fadeOut": true                // Fade older points
}
```

### 4. Symbol Annotations (Coming Soon)

Display physics symbols and icons:

```json
{
  "id": "energy-symbol",
  "type": "symbol",
  "attachedToObjectId": "my-object",
  "symbolType": "energy",        // energy, collision, target, direction, custom
  "customSymbol": "⚡",          // Unicode character or emoji
  "size": 1.0,
  "color": "#ffff00",
  "offset": [0, 1.5, 0],
  "billboarding": true           // Always face camera
}
```

## Common Properties

All annotations support these properties:

- `id` (required) - Unique identifier
- `type` (required) - Annotation type: text, vector, trail, symbol, effect
- `attachedToObjectId` (required) - ID of the object to attach to
- `offset` - Position offset [x, y, z] relative to object
- `anchor` - Attachment point: top, bottom, left, right, center, etc.
- `visible` - Show/hide annotation (default: true)
- `fadeDistance` - Distance from camera where annotation starts fading
- `minScale` - Minimum scale when far (default: 0.5)
- `maxScale` - Maximum scale when close (default: 2.0)
- `showWhenPlaying` - Only show during simulation
- `showWhenPaused` - Only show when paused
- `minSpeed` - Only show when object speed > this value

## Integration Example

Add the `visualAnnotations` array to your scene JSON:

```json
{
  "id": "my-scene",
  "name": "My Physics Scene",
  "objects": [ /* your objects */ ],
  "visualAnnotations": [
    {
      "id": "annotation-1",
      "type": "text",
      /* annotation config */
    },
    {
      "id": "annotation-2",
      "type": "vector",
      /* annotation config */
    }
  ]
}
```

## Examples

### Example 1: Speed Label Above Object
```json
{
  "id": "speed-top",
  "type": "text",
  "attachedToObjectId": "ball",
  "contentType": "speed",
  "prefix": "V: ",
  "suffix": " m/s",
  "precision": 1,
  "offset": [0, 0.8, 0],
  "anchor": "top",
  "fontSize": 18,
  "color": "#00ff00"
}
```

### Example 2: Velocity Vector
```json
{
  "id": "vel-vector",
  "type": "vector",
  "attachedToObjectId": "ball",
  "vectorType": "velocity",
  "scale": 0.5,
  "color": "#00aaff",
  "offset": [0, 0, 0],
  "anchor": "center"
}
```

### Example 3: Multiple Labels
```json
{
  "visualAnnotations": [
    {
      "id": "speed",
      "type": "text",
      "attachedToObjectId": "cart",
      "contentType": "speed",
      "prefix": "Speed: ",
      "suffix": " m/s",
      "offset": [0, 1.5, 0],
      "anchor": "top"
    },
    {
      "id": "mass",
      "type": "text",
      "attachedToObjectId": "cart",
      "contentType": "mass",
      "prefix": "Mass: ",
      "suffix": " kg",
      "offset": [0, -1.5, 0],
      "anchor": "bottom"
    },
    {
      "id": "ke",
      "type": "text",
      "attachedToObjectId": "cart",
      "contentType": "kineticEnergy",
      "prefix": "KE: ",
      "suffix": " J",
      "precision": 2,
      "offset": [-1.5, 0, 0],
      "anchor": "left"
    }
  ]
}
```

## Tips

1. **Performance**: Keep `updateFrequency` reasonable (30-60 Hz) for text annotations
2. **Visibility**: Use `minSpeed` to hide annotations for stationary objects
3. **Positioning**: Adjust `offset` to prevent overlap with object
4. **Readability**: Use contrasting colors with semi-transparent backgrounds
5. **Scale**: Adjust `minScale` and `maxScale` for better visibility at different distances

## Next Steps

1. Add annotations to your existing scenes in the `scenes/` folder
2. Test with different object types and velocities
3. Experiment with different anchor positions and offsets
4. Combine multiple annotation types for rich visualizations
