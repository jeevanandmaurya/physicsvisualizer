# Media Preview System for ChatView

## Overview

The ChatView now includes a powerful **MediaPreview** component that can display various media types directly within chat messages. This provides a compact, interactive preview with playback controls for simulations, videos, animations, and static media like images, SVGs, and PDFs.

## 🎯 Features

### Supported Media Types
- ⚛️ **Simulations** - Physics simulations with direct link to 3D visualizer
- 🖼️ **Images** - JPG, PNG, GIF, WebP with full-view option
- 🎬 **Videos** - MP4, WebM with play/pause/reset controls
- 🎨 **SVG** - Scalable vector graphics
- 📄 **PDF** - Embedded document viewer
- 🎞️ **Animations** - HTML5 animations in iframe
- 🌐 **IFrames** - Generic embedded content

### Control Options
- ▶️ **Play/Pause** - Available for videos, simulations, animations
- ↺ **Reset** - Return to initial state/time 0
- ⛶ **View Full** - Open in visualizer (simulations) or new tab (other media)

### Design Features
- 📱 **Responsive** - Optimized for mobile and desktop
- 🌙 **Dark Mode** - Automatic theme adaptation
- 📦 **Compact** - Max 400px wide, 200px tall for chat embedding
- ⚡ **Performance** - Lazy loading and optimized rendering

## 🚀 Quick Start

### Basic Usage

Add media to a message by including a `mediaContent` property:

```typescript
const message = {
  id: 1,
  text: "Here's a simulation!",
  isUser: false,
  mediaContent: {
    type: 'simulation',
    sceneId: 'pendulum_energy_v1.0',
    title: 'Pendulum Energy',
    thumbnail: '/scenes/pendulum_energy/thumbnail.png',
    metadata: {
      objectCount: 5
    }
  }
};
```

### File Structure

```
src/views/components/chat/
├── MediaPreview.tsx           # Main component
├── MediaPreview.css           # Styling
├── MediaPreviewDemo.tsx       # Demo/examples
├── MEDIA_PREVIEW_USAGE.md     # Detailed usage guide
└── MessageItem.tsx            # Updated to support media
```

## 📖 Examples

### 1. Simulation Preview

Perfect for showing physics simulations created by AI:

```typescript
{
  mediaContent: {
    type: 'simulation',
    sceneId: 'binary_star_v1.0',
    chatId: 'chat-123',
    title: 'Binary Star System',
    description: 'Gravitational interaction demo',
    thumbnail: '/scenes/binary_star/thumbnail.png',
    metadata: {
      objectCount: 2,
      duration: 15
    }
  }
}
```

Features:
- Shows thumbnail of simulation
- Displays object count overlay
- Play/Pause/Reset controls
- "Open in Visualizer" button navigates to full 3D view

### 2. Image Preview

For diagrams, graphs, or illustrations:

```typescript
{
  mediaContent: {
    type: 'image',
    src: '/images/force-diagram.png',
    title: 'Free Body Diagram',
    description: 'Forces acting on object',
    metadata: {
      dimensions: { width: 800, height: 600 },
      fileSize: '125 KB'
    }
  }
}
```

Features:
- Lazy loading for performance
- Click to open full resolution in new tab
- Shows dimensions and file size

### 3. Video Preview

For tutorial videos or explanations:

```typescript
{
  mediaContent: {
    type: 'video',
    src: '/videos/explanation.mp4',
    title: 'How Gravity Works',
    thumbnail: '/videos/explanation-thumb.jpg',
    autoPlay: false,
    metadata: {
      duration: 120,
      fileSize: '15 MB'
    }
  }
}
```

Features:
- Native video controls (play/pause/reset)
- Thumbnail poster while loading
- Duration and size display
- Full-screen option

### 4. SVG Preview

For interactive vector graphics:

```typescript
{
  mediaContent: {
    type: 'svg',
    src: '/graphics/orbit-diagram.svg',
    title: 'Orbital Mechanics',
    description: 'Elliptical orbit visualization'
  }
}
```

### 5. PDF Preview

For documents and papers:

```typescript
{
  mediaContent: {
    type: 'pdf',
    src: '/documents/physics-paper.pdf',
    title: 'Research Paper',
    description: 'Quantum Mechanics Study',
    metadata: {
      fileSize: '2.3 MB'
    }
  }
}
```

### 6. Animation Preview

For custom animations:

```typescript
{
  mediaContent: {
    type: 'animation',
    src: '/animations/wave-interference.html',
    title: 'Wave Interference Pattern',
    autoPlay: true
  }
}
```

## 🔧 Integration with AI

When the AI generates content with media, structure the response like this:

```typescript
// In your AI response handler
async function processAIResponse(response) {
  const message = {
    id: Date.now(),
    text: response.message,
    isUser: false,
    timestamp: new Date()
  };
  
  // Check if response includes scene generation (simulation)
  if (response.sceneId) {
    message.mediaContent = {
      type: 'simulation',
      sceneId: response.sceneId,
      title: response.sceneName,
      thumbnail: `/scenes/${response.sceneId}/thumbnail.png`,
      metadata: {
        objectCount: response.objectCount
      }
    };
  }
  
  // Check if response includes other media
  if (response.imageUrl) {
    message.mediaContent = {
      type: 'image',
      src: response.imageUrl,
      title: response.imageTitle
    };
  }
  
  return message;
}
```

## 🎨 Styling & Theming

The component automatically adapts to your theme:

```css
/* Uses CSS variables */
--card-bg         /* Background color */
--border-color    /* Border color */
--text-color      /* Text color */
--primary-color   /* Accent color */
--hover-bg        /* Hover state */
```

Customize in your theme:

```css
[data-theme="custom"] .media-preview-container {
  border-radius: 16px;
  max-width: 500px;
}
```

## 📱 Responsive Design

Automatically adjusts for mobile:

- **Desktop**: 400px max width, full controls with labels
- **Tablet**: 400px max width, icon-only controls
- **Mobile**: 100% width, compact controls

## 🔒 Security

- IFrames use `sandbox="allow-scripts allow-same-origin"`
- Only embed trusted content
- Validate URLs before rendering
- CORS-aware for cross-origin media

## ⚡ Performance Tips

1. **Always provide thumbnails** for videos and simulations
2. **Use lazy loading** for images (built-in)
3. **Compress media** - keep thumbnails under 100KB
4. **Host on CDN** for large files
5. **Optimize videos** - prefer WebM over MP4

## 🧪 Testing

View the demo component:

```typescript
import MediaPreviewDemo from './components/chat/MediaPreviewDemo';

// Render in your app
<MediaPreviewDemo />
```

This shows all media types in action with example code.

## 🐛 Troubleshooting

### Media not showing
- Check `mediaContent.type` is valid
- Verify `src` URL is accessible
- For simulations, ensure `sceneId` and `chatId` are provided

### Controls not working
- Ensure `type` is 'simulation', 'video', or 'animation'
- Check browser console for errors
- Verify video format is supported (MP4/WebM recommended)

### Styling issues
- Check CSS variables are defined in theme
- Verify `MediaPreview.css` is imported
- Use browser dev tools to inspect styles

## 📚 API Reference

### MediaPreview Props

```typescript
interface MediaPreviewProps {
  type: MediaType;        // Required: Media type
  src?: string;           // Source URL (except simulations)
  sceneId?: string;       // Scene ID (for simulations)
  chatId?: string;        // Chat ID (for simulations)
  title?: string;         // Display title
  description?: string;   // Short description
  autoPlay?: boolean;     // Auto-play videos/animations
  thumbnail?: string;     // Preview image URL
  metadata?: {            // Additional metadata
    duration?: number;
    objectCount?: number;
    dimensions?: { width: number; height: number };
    fileSize?: string;
    [key: string]: any;
  };
}
```

## 🚀 Future Enhancements

Planned features:

- [ ] Progress bar for videos
- [ ] Volume control
- [ ] Carousel for multiple media
- [ ] 3D model preview (.glb, .gltf)
- [ ] Audio file support
- [ ] YouTube/Vimeo embeds
- [ ] Live stream support
- [ ] Download button

## 📝 License

Part of Physics Visualizer project - see main LICENSE file.

## 🤝 Contributing

To add a new media type:

1. Add type to `MediaType` union in `MediaPreview.tsx`
2. Add rendering logic in `renderMediaContent()`
3. Add icon in `getMediaIcon()`
4. Update CSS if needed
5. Add example to `MediaPreviewDemo.tsx`
6. Update documentation

---

**Need help?** Check the detailed [MEDIA_PREVIEW_USAGE.md](./MEDIA_PREVIEW_USAGE.md) guide.
