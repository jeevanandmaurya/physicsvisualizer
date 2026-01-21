# MediaPreview Component Usage Guide

The `MediaPreview` component is a versatile media viewer that can be embedded in chat messages to display various types of content with playback controls.

## Features

- **Multi-format support**: Simulations, images, videos, SVGs, PDFs, animations, and iframes
- **Playback controls**: Play, pause, and reset for interactive content
- **Compact design**: Optimized for chat view (400px max width, 200px height)
- **Link to full visualizer**: One-click navigation to full 3D visualizer for simulations
- **Responsive**: Works on mobile and desktop
- **Dark mode**: Automatically adapts to theme

## Supported Media Types

1. **Simulation** - Physics simulations with link to visualizer
2. **Image** - Static images (JPG, PNG, GIF, WebP)
3. **Video** - Video files with native controls
4. **SVG** - Scalable vector graphics
5. **PDF** - Embedded PDF viewer
6. **Animation** - Animated content in iframe
7. **IFrame** - Generic embedded content

## Usage Examples

### 1. Simulation Preview

```typescript
// In your message handler or AI response:
const message = {
  id: 1,
  text: "I've created a pendulum simulation for you!",
  isUser: false,
  mediaContent: {
    type: 'simulation',
    sceneId: 'pendulum_energy_v1.0',
    title: 'Pendulum Energy Conservation',
    description: 'Interactive physics simulation',
    thumbnail: '/scenes/pendulum_energy/thumbnail.png',
    metadata: {
      objectCount: 5,
      duration: 10
    }
  }
};
```

### 2. Image Preview

```typescript
const message = {
  id: 2,
  text: "Here's a diagram showing the forces:",
  isUser: false,
  mediaContent: {
    type: 'image',
    src: '/images/force-diagram.png',
    title: 'Force Diagram',
    description: 'Free body diagram',
    metadata: {
      dimensions: { width: 800, height: 600 },
      fileSize: '45 KB'
    }
  }
};
```

### 3. Video Preview

```typescript
const message = {
  id: 3,
  text: "Watch this explanation video:",
  isUser: false,
  mediaContent: {
    type: 'video',
    src: '/videos/explanation.mp4',
    title: 'Newton\'s Laws Explained',
    thumbnail: '/videos/explanation-thumb.jpg',
    autoPlay: false,
    metadata: {
      duration: 120,
      fileSize: '15 MB'
    }
  }
};
```

### 4. SVG Preview

```typescript
const message = {
  id: 4,
  text: "Here's a vector illustration:",
  isUser: false,
  mediaContent: {
    type: 'svg',
    src: '/graphics/orbit-diagram.svg',
    title: 'Orbital Mechanics',
    description: 'Interactive SVG diagram'
  }
};
```

### 5. PDF Preview

```typescript
const message = {
  id: 5,
  text: "Check out this research paper:",
  isUser: false,
  mediaContent: {
    type: 'pdf',
    src: '/documents/physics-paper.pdf',
    title: 'Research Paper',
    description: 'Quantum Mechanics Study',
    metadata: {
      fileSize: '2.3 MB'
    }
  }
};
```

### 6. Animation Preview

```typescript
const message = {
  id: 6,
  text: "Here's an animated visualization:",
  isUser: false,
  mediaContent: {
    type: 'animation',
    src: '/animations/wave-interference.html',
    title: 'Wave Interference',
    description: 'Interactive animation',
    autoPlay: true
  }
};
```

## Integration with Message Interface

Update your Message interface to support media content:

```typescript
// In src/ui-logic/chat/Conversation.tsx
export interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sceneId?: string;
  aiMetadata?: any;
  
  // Add media content support
  mediaContent?: {
    type: 'simulation' | 'image' | 'video' | 'svg' | 'pdf' | 'iframe' | 'animation';
    src?: string;
    sceneId?: string;
    title?: string;
    description?: string;
    autoPlay?: boolean;
    thumbnail?: string;
    metadata?: {
      duration?: number;
      objectCount?: number;
      dimensions?: { width: number; height: number };
      fileSize?: string;
      [key: string]: any;
    };
  };
}
```

## AI Response Integration

When the AI generates a response with media, structure it like this:

```typescript
// In your AI response handler
async function handleAIResponse(userMessage: string, chatId: string) {
  const response = await callAI(userMessage);
  
  // Check if response includes media
  const message = {
    id: Date.now(),
    text: response.text,
    isUser: false,
    timestamp: new Date(),
    
    // Add media if detected
    ...(response.hasMedia && {
      mediaContent: {
        type: response.mediaType,
        src: response.mediaSrc,
        title: response.mediaTitle,
        thumbnail: response.mediaThumbnail,
        metadata: response.mediaMetadata
      }
    })
  };
  
  return message;
}
```

## Advanced: Dynamic Media Detection

Automatically detect media URLs in messages:

```typescript
function detectMediaInMessage(text: string): MediaContent | null {
  // Image detection
  const imageRegex = /\.(jpg|jpeg|png|gif|webp)$/i;
  if (imageRegex.test(text)) {
    return { type: 'image', src: text };
  }
  
  // Video detection
  const videoRegex = /\.(mp4|webm|ogg)$/i;
  if (videoRegex.test(text)) {
    return { type: 'video', src: text };
  }
  
  // PDF detection
  const pdfRegex = /\.pdf$/i;
  if (pdfRegex.test(text)) {
    return { type: 'pdf', src: text };
  }
  
  // SVG detection
  const svgRegex = /\.svg$/i;
  if (svgRegex.test(text)) {
    return { type: 'svg', src: text };
  }
  
  return null;
}
```

## Controls Reference

### Play/Pause Button
- **Icon**: Play (▶️) or Pause (⏸️)
- **Function**: Start/stop playback for videos, simulations, animations
- **Availability**: Simulation, Video, Animation types only

### Reset Button
- **Icon**: Rotate CCW (↺)
- **Function**: Reset to initial state/time 0
- **Availability**: Simulation, Video, Animation types only

### View Full/Visualizer Button
- **Icon**: Maximize (⛶)
- **Label**: "Visualizer" (simulations) or "Full View" (other media)
- **Function**: 
  - Simulations: Navigate to full visualizer
  - Other media: Open in new tab
- **Availability**: All media types

## Styling

The component uses CSS variables for theming:

```css
--card-bg: Background color
--border-color: Border color
--text-color: Text color
--text-secondary: Secondary text
--hover-bg: Hover background
--primary-color: Primary accent
--primary-hover: Primary hover state
--bg-darker: Darker background
```

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (with some PDF iframe limitations)
- **Mobile**: Optimized responsive design

## Performance Tips

1. **Lazy loading**: Images use `loading="lazy"`
2. **Thumbnails**: Always provide thumbnails for videos
3. **Small previews**: Keep simulation thumbnails under 100KB
4. **Optimize videos**: Use compressed formats (WebM, MP4)
5. **CDN**: Host large media files on CDN

## Security

- IFrames use `sandbox="allow-scripts allow-same-origin"`
- Only trusted sources should be embedded
- Validate all media URLs before rendering

## Future Enhancements

- [ ] Progress bar for videos
- [ ] Volume control
- [ ] Full-screen mode within chat
- [ ] Multiple media in carousel
- [ ] GIF autoplay control
- [ ] 3D model preview (.glb, .gltf)
- [ ] Audio file support
- [ ] Live stream support
