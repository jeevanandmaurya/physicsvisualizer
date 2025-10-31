# How to Add Visual Annotations to Existing Scenes

## Step-by-Step Guide

### Step 1: Open Your Scene JSON File

For example, if you want to add annotations to the projectile motion scene:
```
scenes/projectile_motion/projectile_motion_v1.0.json
```

### Step 2: Add the `visualAnnotations` Array

At the end of your scene object (after `contactMaterial` or other properties), add:

```json
{
  "id": "projectile-motion",
  "objects": [ /* existing objects */ ],
  "gravity": [0, -9.81, 0],
  "contactMaterial": { "friction": 0.3, "restitution": 0.6 },
  
  "visualAnnotations": [
    /* Add annotations here */
  ]
}
```

### Step 3: Add Your First Annotation

Copy one of these templates:

**Speed Label:**
```json
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
  "fontSize": 18,
  "color": "#ffffff",
  "backgroundColor": "rgba(0,0,0,0.7)"
}
```

**Velocity Arrow:**
```json
{
  "id": "velocity-arrow",
  "type": "vector",
  "attachedToObjectId": "projectile",
  "vectorType": "velocity",
  "scale": 0.5,
  "color": "#00aaff"
}
```

### Step 4: Replace Object IDs

Change `"attachedToObjectId"` to match your actual object IDs from the `objects` array.

For example, if your object is:
```json
{ "id": "cart_left", ... }
```

Then use:
```json
"attachedToObjectId": "cart_left"
```

### Step 5: Save and Test

1. Save the JSON file
2. Reload the scene in your application
3. Click Play to start the simulation
4. You should see the annotations appear!

## Complete Example

Here's the projectile motion scene with annotations added:

```json
{
  "id": "projectile-motion",
  "name": "Projectile Motion",
  "description": "Demonstrates parabolic trajectory with visual annotations",
  "objects": [
    {
      "id": "projectile",
      "type": "Sphere",
      "mass": 1,
      "radius": 0.2,
      "position": [0, 1, 0],
      "velocity": [8, 8, 0],
      "color": "#FF4500"
    },
    {
      "id": "launcher",
      "type": "Box",
      "mass": 0,
      "dimensions": [2, 0.5, 2],
      "position": [0, 0.25, 0],
      "color": "#8B4513",
      "isStatic": true
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
      "id": "projectile-speed",
      "type": "text",
      "attachedToObjectId": "projectile",
      "contentType": "speed",
      "prefix": "Speed: ",
      "suffix": " m/s",
      "precision": 1,
      "offset": [0, 0.8, 0],
      "anchor": "top",
      "fontSize": 20,
      "color": "#ffffff",
      "backgroundColor": "rgba(255, 69, 0, 0.8)",
      "minSpeed": 0.1
    },
    {
      "id": "projectile-velocity",
      "type": "vector",
      "attachedToObjectId": "projectile",
      "vectorType": "velocity",
      "scale": 0.3,
      "color": "#00aaff"
    },
    {
      "id": "projectile-position",
      "type": "text",
      "attachedToObjectId": "projectile",
      "contentType": "position",
      "prefix": "Pos: ",
      "precision": 1,
      "offset": [0, -0.6, 0],
      "anchor": "bottom",
      "fontSize": 14,
      "color": "#ffff00",
      "backgroundColor": "rgba(0,0,0,0.6)"
    }
  ]
}
```

## Quick Checklist

- [ ] Added `visualAnnotations` array to scene JSON
- [ ] Set correct `attachedToObjectId` for each annotation
- [ ] Chose appropriate `contentType` or `vectorType`
- [ ] Set `offset` to position annotation away from object
- [ ] Saved the JSON file
- [ ] Reloaded scene in application
- [ ] Tested by playing the simulation

## Troubleshooting

**Annotations don't appear?**
- Check that `attachedToObjectId` matches an object ID in your scene
- Make sure the object is not static (or set `showWhenPaused: true`)
- Try increasing `offset` if annotation is hidden inside the object

**Text is too small/large?**
- Adjust `fontSize` (14-24 recommended)
- Modify `offset` distance from object

**Arrow too short/long?**
- Change `scale` value (0.3-1.0 recommended)
- Try different anchor positions

## Next Steps

1. Start with the demo scene: `scenes/annotation_demo/annotation_demo_v1.0.json`
2. Add simple speed labels to your favorite scenes
3. Experiment with different colors and positions
4. Try combining multiple annotation types
5. Check `ANNOTATIONS_QUICK_REF.md` for more templates

## Need Help?

See full documentation:
- `src/core/visuals/README.md` - Complete API reference
- `ANNOTATIONS_QUICK_REF.md` - Quick templates
- `VISUAL_ANNOTATIONS_SUMMARY.md` - System overview
