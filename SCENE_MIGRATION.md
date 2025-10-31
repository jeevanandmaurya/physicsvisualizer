# Scene System Migration Guide

## Overview

The Physics Visualizer has been updated to use a new file-based scene loading system. This replaces the old hardcoded `scenes.ts` file with a flexible folder structure that makes it easy to add and manage physics scene examples.

## What Changed

### Before (Old System)
- Scenes were hardcoded in `src/scenes.ts` and `src/scene.ts`
- All scene data was bundled in the application code
- Adding new scenes required editing TypeScript files
- No separation between code and content

### After (New System)
- Scenes are stored in the `scenes/` folder as JSON files
- Each scene has its own folder with JSON, context, and thumbnail
- Scenes are loaded dynamically at runtime
- Easy to add new scenes without touching code
- Preparation for future database integration

## New Architecture

### Key Components

1. **SceneLoader** (`src/core/scene/SceneLoader.ts`)
   - Dynamically loads scenes from the file system
   - Handles JSON parsing, context loading, and thumbnail generation
   - Caches loaded scenes for performance
   - Provides methods: `getAllScenes()`, `getSceneById()`, `reload()`

2. **Scene Folder Structure** (`scenes/`)
   ```
   scenes/
   └── scene_name/
       ├── scene_name_v1.0.json    # Scene configuration
       ├── context.txt              # Educational content
       └── thumbnail.svg            # Visual (optional)
   ```

3. **Manifest** (`public/scenes/manifest.json`)
   - Lists all available scenes
   - Controls which scenes are enabled
   - Allows easy scene management

4. **DatabaseContext** (Updated)
   - Now uses SceneLoader instead of direct imports
   - `getScenes('examples')` loads from scenes folder
   - Backward compatible with user scenes

## File Structure

### Scene JSON Structure
```json
{
  "id": "unique-id",
  "name": "Display Name",
  "description": "Brief description",
  "version": "1.0",
  "objects": [...],
  "gravity": [0, -9.81, 0],
  "controllers": [...],
  "contactMaterial": {...},
  "simulationScale": "terrestrial"
}
```

### Context File Structure
```
Theory:
[Physics theory]

Explanation:
[How it works]

Facts:
- Fact 1
- Fact 2
```

## Migration Steps Completed

1. ✅ Created SceneLoader service with TypeScript interfaces
2. ✅ Updated DatabaseContext to use SceneLoader
3. ✅ Created scene folder structure with manifest
4. ✅ Implemented automatic thumbnail generation
5. ✅ Added projectile_motion example scene
6. ✅ Created documentation and sync utility

## Deprecated Files

The following files are now deprecated but kept for reference:
- `src/scenes.ts` - Old scene definitions
- `src/scene.ts` - Old scene definitions

These files can be safely removed once all scenes have been migrated to the new structure.

## How to Add New Scenes

See `scenes/README.md` for detailed instructions. Quick steps:

1. Create folder in `scenes/`
2. Add `scene_name_v1.0.json`
3. Add `context.txt`
4. Optionally add `thumbnail.svg`
5. Update `public/scenes/manifest.json`
6. Run `sync-scenes.bat` to copy to public folder

## Benefits

### For Developers
- ✅ Separation of concerns (code vs content)
- ✅ No need to rebuild for content changes
- ✅ Easy scene versioning
- ✅ Type-safe with TypeScript interfaces
- ✅ Modular and maintainable

### For Content Creators
- ✅ Edit scenes without touching code
- ✅ Clear file structure and documentation
- ✅ Automatic thumbnail generation
- ✅ Rich context and educational content support
- ✅ Easy to test individual scenes

### For Future Development
- ✅ Ready for database integration
- ✅ Supports scene versioning
- ✅ Can implement scene validation
- ✅ Enables scene import/export
- ✅ Foundation for user-generated content

## Future Enhancements

Planned improvements to the scene system:

1. **Database Integration**
   - Store user-generated scenes
   - Cloud sync and backup
   - Scene sharing and collaboration

2. **Scene Validation**
   - JSON schema validation
   - Physics constraint checking
   - Performance testing

3. **Enhanced Editor**
   - Visual scene builder
   - Real-time preview
   - Template system

4. **Community Features**
   - Scene marketplace
   - Rating and reviews
   - Remix and fork functionality

## Technical Details

### Loading Process
1. SceneLoader fetches `manifest.json`
2. For each enabled scene, it loads:
   - Scene JSON (required)
   - Context file (optional)
   - Thumbnail (optional, auto-generated if missing)
3. All data is merged into a `LoadedScene` object
4. Scenes are cached for performance

### Performance Considerations
- Scenes are loaded asynchronously
- Results are cached after first load
- Only enabled scenes are loaded
- Thumbnails can be lazy-loaded

### Error Handling
- Graceful degradation if files are missing
- Console warnings for debugging
- Fallback to generated thumbnails
- Empty array returned on manifest load failure

## Testing

The new system has been integrated with the existing codebase:
- ✅ No compilation errors
- ✅ Backward compatible with existing features
- ✅ Projectile motion example working
- ✅ Ready for production use

## Support

For questions or issues:
1. Check `scenes/README.md` for scene creation help
2. Review example scenes in `scenes/projectile_motion/`
3. See TypeScript interfaces in `src/core/scene/SceneLoader.ts`

## Notes

- Old `scenes.ts` and `scene.ts` are kept for reference during transition
- The sync script (`sync-scenes.bat`) must be run when scenes are updated
- In production, consider automating the sync process in the build pipeline
- Scene IDs should remain stable across versions for user references
