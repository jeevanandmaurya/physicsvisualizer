# Overlay System Architecture

## Component Hierarchy

```
main.tsx
└── ThemeProvider (theme, opacity settings)
    └── OverlayProvider (focus management, z-index)
        └── DatabaseProvider
            └── WorkspaceProvider
                └── App
                    └── Workbench
                        ├── ActivityBar
                        ├── EditorArea
                        │   └── Views (Dashboard, Collection, Visualizer, etc.)
                        ├── StatusBar
                        │
                        └── Overlays
                            ├── Overlay (id="scene-selector", z:50)
                            │   └── Panel → SceneSelectorUI
                            │
                            ├── Overlay (id="chat-overlay", z:55)
                            │   └── ChatOverlay
                            │
                            ├── Overlay (id="graph-overlay", z:60)
                            │   └── GraphOverlay
                            │
                            └── Overlay (id="controller-overlay", z:55)
                                └── ControllerOverlay
```

## Data Flow

### 1. Overlay Registration
```
Component Mount
    ↓
Overlay.tsx: useEffect()
    ↓
registerOverlay(id, type, baseZIndex)
    ↓
OverlayContext: overlays Map updated
```

### 2. Focus Handling
```
User clicks overlay
    ↓
onClick handler triggered
    ↓
focusOverlay(id)
    ↓
OverlayContext: focusedOverlay = id
    ↓
All overlays re-render with updated z-index
    ↓
Focused overlay: baseZIndex + 10
Other overlays: baseZIndex
```

### 3. Opacity Configuration
```
User adjusts slider in Settings
    ↓
updateOverlayOpacity(type, value)
    ↓
ThemeContext: overlayOpacity[type] = value
    ↓
localStorage: save setting
    ↓
All overlays re-render with new opacity
```

## State Management

### ThemeContext
```typescript
{
  theme: 'light' | 'dark',
  overlayOpacity: {
    chat: 0.85,
    graph: 0.8,
    controller: 0.85,
    sceneSelector: 0.9,
    activityBar: 0.95
  }
}
```

### OverlayContext
```typescript
{
  overlays: Map<string, {
    id: string,
    type: OverlayType,
    baseZIndex: number,
    isOpen: boolean
  }>,
  focusedOverlay: string | null
}
```

## Z-Index Calculation Logic

```typescript
function getZIndex(id: string): number {
  const overlay = overlays.get(id);
  if (!overlay) return 50; // Default
  
  if (focusedOverlay === id) {
    return overlay.baseZIndex + 10; // Focus boost
  }
  
  return overlay.baseZIndex;
}
```

### Example Scenario

**Initial State:**
```
chat-overlay:       55
graph-overlay:      60 ← Highest by default
controller-overlay: 55
scene-selector:     50
```

**User clicks chat:**
```
chat-overlay:       65 ← Now on top! (55 + 10)
graph-overlay:      60
controller-overlay: 55
scene-selector:     50
```

**User clicks controller:**
```
chat-overlay:       55
graph-overlay:      60
controller-overlay: 65 ← Now on top! (55 + 10)
scene-selector:     50
```

## CSS Class Application

```typescript
className={`
  overlay                              // Base styles
  ${positionClasses[position]}        // left/right/top/bottom/center/full
  ${isFocused ? 'focused' : ''}       // Blue border when focused
  ${className}                        // Custom classes
`}
```

### CSS Specificity

```css
/* Base state */
.overlay { 
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

/* Hover state */
.overlay:hover { 
  box-shadow: 0 6px 16px rgba(0,0,0,0.4);
}

/* Focused state */
.overlay.focused { 
  border-color: var(--primary-color);
  box-shadow: 0 8px 20px rgba(0,123,255,0.3);
}
```

## Event Flow

### Click Event
```
User clicks overlay
    ↓
<div onClick={handleClick} onMouseDown={handleClick}>
    ↓
e.stopPropagation() // Prevent bubbling
    ↓
focusOverlay(id)
    ↓
Context update triggers re-render
    ↓
getZIndex(id) returns boosted value
    ↓
CSS z-index updated
    ↓
Visual feedback applied (focused class)
```

## Integration Points

### 1. Workbench.tsx
- Renders all Overlay components
- Passes state (isOpen, onClose)
- Provides unique IDs

### 2. Overlay.tsx
- Wraps child components
- Handles registration/focus
- Applies opacity/z-index/position

### 3. OverlayContext.tsx
- Manages overlay registry
- Tracks focused overlay
- Calculates dynamic z-index

### 4. ThemeContext.tsx
- Stores opacity settings
- Persists to localStorage
- Provides to all overlays

## Performance Considerations

### Optimizations
1. **Memoized calculations**: getZIndex uses Map lookup (O(1))
2. **Event bubbling**: stopPropagation prevents unnecessary handlers
3. **CSS transitions**: Hardware-accelerated transforms
4. **Conditional rendering**: Only render when isOpen=true

### Re-render Triggers
- Overlay registration/unregistration
- Focus change
- Opacity setting change
- isOpen prop change

## Accessibility

### Focus Management
```typescript
// Focus trap (future enhancement)
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    // Cycle through focusable elements
  }
  if (e.key === 'Escape') {
    onClose?.();
  }
};
```

### ARIA Attributes (to be added)
```tsx
<div
  role="dialog"
  aria-modal={blurBackground}
  aria-labelledby={`${id}-title`}
  aria-describedby={`${id}-description`}
>
```

## Testing Strategy

### Unit Tests
- [ ] OverlayContext registration/unregistration
- [ ] Focus management logic
- [ ] Z-index calculation
- [ ] Opacity settings persistence

### Integration Tests
- [ ] Multiple overlays co-existing
- [ ] Focus switching between overlays
- [ ] Settings changes reflect in overlays
- [ ] Overlay open/close behavior

### E2E Tests
- [ ] User clicks through overlays
- [ ] Settings UI updates opacity
- [ ] Overlays maintain state across navigation
- [ ] Responsive behavior on different devices
