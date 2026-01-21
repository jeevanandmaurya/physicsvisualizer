import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Image as ImageIcon, Film, FileText } from 'lucide-react';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useDatabase } from '../../../contexts/DatabaseContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import CompactVisualizer from './CompactVisualizer';
import './MediaPreview.css';

export type MediaType = 'simulation' | 'image' | 'video' | 'svg' | 'pdf' | 'iframe' | 'animation';

export interface MediaPreviewProps {
  type: MediaType;
  src?: string;
  sceneId?: string;
  sceneData?: any;
  chatId?: string;
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
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  type,
  src,
  sceneId,
  sceneData,
  chatId,
  title,
  description,
  autoPlay = false,
  thumbnail,
  metadata
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [resetTrigger, setResetTrigger] = useState(0);
  const mediaRef = useRef<HTMLVideoElement | HTMLIFrameElement | null>(null);
  const { navigateToVisualizerWithScene } = useNavigation();
  const { setChatOverlayCurrentChat, workspaceScenes } = useWorkspace();

  const handlePlayPause = () => {
    if (type === 'simulation') {
      // For simulation, toggle playing state
      setIsPlaying(!isPlaying);
    } else if (type === 'video' && mediaRef.current && 'play' in mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (type === 'animation' || type === 'iframe') {
      // Send message to iframe to play/pause
      if (mediaRef.current && 'contentWindow' in mediaRef.current) {
        mediaRef.current.contentWindow?.postMessage(
          { type: isPlaying ? 'pause' : 'play' },
          '*'
        );
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    if (type === 'simulation') {
      // For simulation, reset state and trigger re-render
      setIsPlaying(false);
      setResetTrigger(prev => prev + 1); // Force CompactVisualizer to reset
    } else if (type === 'video' && mediaRef.current && 'currentTime' in mediaRef.current) {
      mediaRef.current.currentTime = 0;
    } else if (type === 'animation' || type === 'iframe') {
      // Send reset message to iframe
      if (mediaRef.current && 'contentWindow' in mediaRef.current) {
        mediaRef.current.contentWindow?.postMessage({ type: 'reset' }, '*');
      }
      setIsPlaying(false);
    }
  };

  const handleViewFull = async () => {
    if (type === 'simulation' && sceneId) {
      try {
        // Set chat first if chatId is provided
        if (chatId) {
          setChatOverlayCurrentChat(chatId);
        }
        
        // Find or load the scene
        let sceneToLoad = sceneData;
        if (!sceneToLoad) {
          // Try to find in workspace scenes
          const foundScene = workspaceScenes.find((s: any) => s.id === sceneId);
          if (foundScene) {
            sceneToLoad = foundScene;
          } else {
            // Load from database or public folder
            const database = useDatabase();
            try {
              sceneToLoad = await database?.getSceneById(sceneId);
            } catch {
              // Load from public folder
              const folderName = sceneId.replace(/_v\d+\.\d+$/, '');
              const scenePath = `/scenes/${folderName}/${sceneId}.json`;
              const response = await fetch(scenePath);
              if (response.ok) {
                sceneToLoad = await response.json();
              }
            }
          }
        }
        
        // Navigate with scene data
        if (sceneToLoad) {
          // Store scene data for visualizer to use
          sessionStorage.setItem('pendingSceneLoad', JSON.stringify(sceneToLoad));
        }
        
        navigateToVisualizerWithScene(sceneId, chatId || '', { openChat: true });
      } catch (error) {
        console.error('Error loading scene for visualizer:', error);
        // Navigate anyway, let visualizer handle loading
        navigateToVisualizerWithScene(sceneId, chatId || '', { openChat: true });
      }
    } else if (src) {
      // Open in new tab for other media types
      window.open(src, '_blank');
    }
  };

  const getMediaIcon = () => {
    switch (type) {
      case 'simulation':
        return '⚛️';
      case 'image':
        return <ImageIcon size={20} />;
      case 'video':
        return <Film size={20} />;
      case 'pdf':
        return <FileText size={20} />;
      case 'svg':
        return '🎨';
      default:
        return '📄';
    }
  };

  const renderMediaContent = () => {
    switch (type) {
      case 'simulation':
        return (
          <div className="media-preview-simulation">
            {sceneId ? (
              <SimulationPreview 
                sceneId={sceneId} 
                sceneData={sceneData}
                isPlaying={isPlaying}
                resetTrigger={resetTrigger}
              />
            ) : thumbnail ? (
              <img src={thumbnail} alt={title || 'Simulation'} className="media-preview-thumbnail" />
            ) : (
              <div className="media-preview-placeholder">
                <span className="placeholder-icon">⚛️</span>
                <span className="placeholder-text">Simulation Preview</span>
              </div>
            )}
            {metadata?.objectCount && (
              <div className="media-preview-overlay-info">
                <span>📦 {metadata.objectCount} objects</span>
              </div>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="media-preview-image">
            <img 
              src={src} 
              alt={title || 'Image'} 
              className="media-content-image"
              loading="lazy"
            />
          </div>
        );

      case 'video':
        return (
          <div className="media-preview-video">
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={src}
              poster={thumbnail}
              className="media-content-video"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        );

      case 'svg':
        return (
          <div className="media-preview-svg">
            <object 
              data={src} 
              type="image/svg+xml" 
              className="media-content-svg"
              aria-label={title || 'SVG'}
            >
              <img src={thumbnail || src} alt={title || 'SVG'} />
            </object>
          </div>
        );

      case 'pdf':
        return (
          <div className="media-preview-pdf">
            <iframe
              ref={mediaRef as React.RefObject<HTMLIFrameElement>}
              src={src}
              className="media-content-pdf"
              title={title || 'PDF'}
            />
          </div>
        );

      case 'iframe':
      case 'animation':
        return (
          <div className="media-preview-iframe">
            <iframe
              ref={mediaRef as React.RefObject<HTMLIFrameElement>}
              src={src}
              className="media-content-iframe"
              title={title || 'Content'}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        );

      default:
        return (
          <div className="media-preview-placeholder">
            <span className="placeholder-icon">{getMediaIcon()}</span>
            <span className="placeholder-text">{title || 'Media Preview'}</span>
          </div>
        );
    }
  };

  const needsControls = type === 'simulation' || type === 'video' || type === 'animation';

  return (
    <div className="media-preview-container">
      <div className="media-preview-header">
        <span className="media-preview-icon">{getMediaIcon()}</span>
        {title && <span className="media-preview-title">{title}</span>}
        {description && <span className="media-preview-description">{description}</span>}
      </div>

      <div className="media-preview-content">
        {renderMediaContent()}
      </div>

      {needsControls && (
        <div className="media-preview-controls">
          <button
            className="media-control-btn"
            onClick={handlePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <button
            className="media-control-btn"
            onClick={handleReset}
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>

          <div className="media-control-spacer" />

          <button
            className="media-control-btn media-control-expand"
            onClick={handleViewFull}
            title={type === 'simulation' ? 'Open in Visualizer' : 'View Full Screen'}
          >
            <Maximize2 size={16} />
            <span className="control-label">
              {type === 'simulation' ? 'Visualizer' : 'Full View'}
            </span>
          </button>
        </div>
      )}

      {!needsControls && (type === 'image' || type === 'svg' || type === 'pdf') && (
        <div className="media-preview-controls">
          <button
            className="media-control-btn media-control-expand full-width"
            onClick={handleViewFull}
            title="Open in New Tab"
          >
            <Maximize2 size={16} />
            <span className="control-label">Open Full View</span>
          </button>
        </div>
      )}

      {metadata && Object.keys(metadata).length > 0 && (
        <div className="media-preview-metadata">
          {metadata.duration && (
            <span className="metadata-item">
              ⏱️ {Math.round(metadata.duration)}s
            </span>
          )}
          {metadata.dimensions && (
            <span className="metadata-item">
              📐 {metadata.dimensions.width}×{metadata.dimensions.height}
            </span>
          )}
          {metadata.fileSize && (
            <span className="metadata-item">
              💾 {metadata.fileSize}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * SimulationPreview - Helper component to load and render scene JSON
 */
function SimulationPreview({ 
  sceneId, 
  sceneData,
  isPlaying = true,
  resetTrigger = 0
}: { 
  sceneId: string; 
  sceneData?: any;
  isPlaying?: boolean;
  resetTrigger?: number;
}) {
  const [scene, setScene] = useState<any>(sceneData || null);
  const [error, setError] = useState<string>('');
  const [key, setKey] = useState(0);
  const database = useDatabase();

  // Reset on resetTrigger change
  useEffect(() => {
    if (resetTrigger > 0) {
      setKey(prev => prev + 1);
    }
  }, [resetTrigger]);

  useEffect(() => {
    // If sceneData is provided directly, use it (no need to load)
    if (sceneData) {
      setScene(sceneData);
      setError('');
      return;
    }

    let mounted = true;

    async function loadScene() {
      try {
        // First, try to load from database (for AI-generated scenes)
        if (database?.getSceneById) {
          try {
            const dbScene = await database.getSceneById(sceneId);
            if (dbScene && mounted) {
              setScene(dbScene);
              setError('');
              return;
            }
          } catch (dbErr) {
            console.log('Scene not in database, trying public folder:', sceneId);
          }
        }

        // Fallback: Load from public/scenes folder (for pre-built demo scenes)
        const folderName = sceneId.replace(/_v\d+\.\d+$/, '');
        const scenePath = `/scenes/${folderName}/${sceneId}.json`;
        
        const response = await fetch(scenePath);
        if (!response.ok) {
          throw new Error(`Scene "${sceneId}" not found in database or public folder`);
        }
        
        const sceneData = await response.json();
        if (mounted) {
          setScene(sceneData);
          setError('');
        }
      } catch (err) {
        console.error('Error loading scene:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load scene');
        }
      }
    }

    loadScene();
    return () => { mounted = false; };
  }, [sceneId, sceneData, database]);

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        color: '#ff6b6b',
        fontSize: '12px',
        padding: '10px',
        textAlign: 'center'
      }}>
        {error}
      </div>
    );
  }

  if (!scene) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        fontSize: '12px',
        opacity: 0.6
      }}>
        Loading...
      </div>
    );
  }

  return (
    <CompactVisualizer 
      key={key}
      scene={scene} 
      height="100%"
      isPlaying={isPlaying}
    />
  );
}

export default MediaPreview;

