# Visual Annotations - Quick Reference

## Add to Any Scene

Just add `visualAnnotations` array to your scene JSON:

```json
{
  "id": "your-scene",
  "objects": [ /* ... */ ],
  "visualAnnotations": [
    /* Add annotations here */
  ]
}
```

## Annotation Templates

### Speed Label (Most Common)
```json
{
  "id": "speed-1",
  "type": "text",
  "attachedToObjectId": "your-object-id",
  "contentType": "speed",
  "prefix": "Speed: ",
  "suffix": " m/s",
  "precision": 1,
  "offset": [0, 1, 0],
  "anchor": "top",
  "fontSize": 18,
  "color": "#ffffff",
  "backgroundColor": "rgba(0,0,0,0.7)",
  "minSpeed": 0.1
}
```

### Velocity Vector
```json
{
  "id": "vel-arrow-1",
  "type": "vector",
  "attachedToObjectId": "your-object-id",
  "vectorType": "velocity",
  "scale": 0.5,
  "color": "#00aaff",
  "anchor": "center"
}
```

### Position Display
```json
{
  "id": "pos-1",
  "type": "text",
  "attachedToObjectId": "your-object-id",
  "contentType": "position",
  "prefix": "Pos: ",
  "precision": 1,
  "offset": [0, -1, 0],
  "anchor": "bottom",
  "fontSize": 14
}
```

### Kinetic Energy
```json
{
  "id": "ke-1",
  "type": "text",
  "attachedToObjectId": "your-object-id",
  "contentType": "kineticEnergy",
  "prefix": "KE: ",
  "suffix": " J",
  "precision": 2,
  "fontSize": 16
}
```

### Mass Label
```json
{
  "id": "mass-1",
  "type": "text",
  "attachedToObjectId": "your-object-id",
  "contentType": "mass",
  "prefix": "m = ",
  "suffix": " kg",
  "fontSize": 14
}
```

## Text Content Types

- `speed` - Velocity magnitude (scalar)
- `velocity` - Full velocity vector
- `position` - Position coordinates
- `mass` - Object mass
- `kineticEnergy` - KE = 0.5 × m × v²
- `momentum` - Momentum vector (m × v)
- `custom` - Use `customText` field

## Vector Types

- `velocity` - Velocity vector (blue arrows)
- `momentum` - Momentum vector (mass × velocity)
- `acceleration` - Acceleration vector
- `force` - Force vector
- `custom` - Use `customVector` field

## Anchor Positions

- `top` - Above object
- `bottom` - Below object
- `left` - Left side
- `right` - Right side
- `center` - At object center
- `top-left`, `top-right`, `bottom-left`, `bottom-right`

## Common Colors

- White: `#ffffff`
- Red: `#ff0000`
- Green: `#00ff00`
- Blue: `#0000ff`
- Yellow: `#ffff00`
- Cyan: `#00ffff`
- Magenta: `#ff00ff`
- Orange: `#ff8800`

## Tips

1. Use `minSpeed: 0.1` to hide labels when object is still
2. Set `updateFrequency: 30` for better performance
3. Use `offset` to position labels away from object
4. Semi-transparent backgrounds: `rgba(0,0,0,0.7)`
5. Keep `fontSize` between 14-24 for readability

## Complete Example

```json
{
  "id": "my-scene",
  "objects": [
    {
      "id": "ball",
      "type": "Sphere",
      "mass": 2,
      "radius": 0.5,
      "position": [0, 5, 0],
      "velocity": [10, 0, 0],
      "color": "#ff0000"
    }
  ],
  "gravity": [0, -9.81, 0],
  "visualAnnotations": [
    {
      "id": "ball-speed",
      "type": "text",
      "attachedToObjectId": "ball",
      "contentType": "speed",
      "prefix": "V: ",
      "suffix": " m/s",
      "offset": [0, 1, 0],
      "anchor": "top",
      "fontSize": 18,
      "color": "#ffffff"
    },
    {
      "id": "ball-vel-vector",
      "type": "vector",
      "attachedToObjectId": "ball",
      "vectorType": "velocity",
      "scale": 0.4,
      "color": "#00aaff"
    }
  ]
}
```

## See Also

- Full docs: `src/core/visuals/README.md`
- Demo scene: `scenes/annotation_demo/annotation_demo_v1.0.json`
- Implementation: `VISUAL_ANNOTATIONS_SUMMARY.md`
