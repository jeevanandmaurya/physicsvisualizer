# Overlay System

A reusable overlay component system with configurable transparency for all UI overlays in the Physics Visualizer.

## Features

- **Configurable Opacity**: Each overlay type can have its transparency adjusted in Settings
- **Position Variants**: left, right, top, bottom, center, full
- **Responsive**: Adapts to different screen sizes
- **Theme-Aware**: Automatically uses theme colors and opacity settings
- **Z-Index Management**: Proper layering with configurable z-index
- **Backdrop Support**: Optional blur backdrop for modal-like behavior

## Overlay Types

The system supports 5 overlay types, each with independent opacity control:

1. **chat** - Chat conversation panel (default: 85%)
2. **graph** - Graph visualization overlay (default: 80%)
3. **controller** - Parameter controllers (default: 85%)
4. **sceneSelector** - Scene selection panel (default: 90%)
5. **activityBar** - Activity bar overlay (default: 95%)

## Usage

### Basic Example

```tsx
import Overlay from '../workbench/Overlay';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Overlay
      type="sceneSelector"
      position="bottom"
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <div>Your content here</div>
    </Overlay>
  );
}
```

### Advanced Example with Custom Styling

```tsx
<Overlay
  type="chat"
  position="right"
  isOpen={chatOpen}
  width="400px"
  height="100%"
  maxWidth="40vw"
  zIndex={60}
  blurBackground={true}
  onClose={() => setChatOpen(false)}
  className="custom-chat-overlay"
  style={{ borderRadius: '8px 0 0 8px' }}
>
  <ChatInterface />
</Overlay>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `OverlayType` | required | Type of overlay for opacity lookup |
| `children` | `ReactNode` | required | Content to display in overlay |
| `position` | `OverlayPosition` | `'center'` | Positioning: left, right, top, bottom, center, full |
| `isOpen` | `boolean` | `true` | Whether overlay is visible |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Additional inline styles |
| `width` | `string` | - | Custom width (overrides position default) |
| `height` | `string` | - | Custom height (overrides position default) |
| `maxWidth` | `string` | - | Maximum width constraint |
| `maxHeight` | `string` | - | Maximum height constraint |
| `zIndex` | `number` | `50` | Stacking order |
| `blurBackground` | `boolean` | `false` | Show backdrop blur behind overlay |
| `onClose` | `function` | - | Called when backdrop is clicked |

## Position Variants

### Left
- Attached to left side (after activity bar)
- Default width: 300px
- Full height (minus status bar)

### Right
- Attached to right side
- Default width: 300px
- Full height (minus status bar)

### Top
- Attached to top edge
- Default height: 200px
- Full width (minus activity bar)

### Bottom
- Attached to bottom edge (above status bar)
- Default height: 300px
- Full width (minus activity bar)

### Center
- Centered in viewport
- Auto size based on content
- Max 80vw x 80vh

### Full
- Covers entire workspace
- Respects activity bar and status bar

## Configuration in Settings

Users can adjust overlay opacity in Settings → Overlay Opacity:
- Each overlay type has an independent slider (10% - 100%)
- Changes are saved to localStorage
- Real-time preview of changes

## Integration Example

### Converting Existing Panel to Overlay

**Before:**
```tsx
<div className="scene-selector-panel">
  <SceneSelectorUI />
</div>
```

**After:**
```tsx
<Overlay
  type="sceneSelector"
  position="bottom"
  isOpen={panelOpen}
  height="50vh"
  maxHeight="calc(100vh - 70px)"
>
  <SceneSelectorUI />
</Overlay>
```

### Z-Index Hierarchy

Recommended z-index values:
- Activity bar (normal): 10
- Activity bar (overlay): 40
- Overlays: 50-60
- Modals/Dialogs: 100+

## Styling

The overlay system uses CSS custom properties for theme integration:

- `--secondary-bg`: Overlay background color
- `--border-color`: Border color
- `--overlay-opacity`: Dynamic opacity from settings
- `--overlay-zindex`: Configurable z-index

## Best Practices

1. **Choose appropriate position**: Match position to UI purpose
2. **Set proper z-index**: Ensure overlays stack correctly
3. **Use backdrop wisely**: Only for modal-like behavior
4. **Respect boundaries**: Account for activity bar (40px) and status bar (35px)
5. **Test responsiveness**: Verify behavior on mobile/tablet
6. **Provide close handlers**: Allow users to dismiss overlays

## Accessibility

- Overlays are keyboard accessible
- Backdrop clicks trigger `onClose` handler
- Proper ARIA attributes should be added to content
- Focus management should be handled by parent components

## Future Enhancements

- [ ] Animation presets (slide, fade, scale)
- [ ] Drag to reposition
- [ ] Resize handles
- [ ] Snap-to-edge behavior
- [ ] Multi-overlay management
- [ ] Save position preferences
