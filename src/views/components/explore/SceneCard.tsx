import React, { useState } from 'react';
import ScenePreviewRenderer from './ScenePreviewRenderer';
import './SceneCard.css';

// Helper function for avatar colors
export function generateAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
}

export function SceneSkeleton() {
  return (
    <div className="scene-card skeleton">
      <div className="scene-thumbnail-container">
        <div className="scene-thumbnail skeleton-shimmer" />
      </div>
      <div className="scene-card-details">
        <div className="scene-avatar skeleton skeleton-shimmer" />
        <div className="scene-meta-content">
          <div className="skeleton-title skeleton-shimmer" />
          <div className="skeleton-line skeleton-shimmer" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
}

interface SceneCardProps {
  scene: any; // Using any for flexibility as the scene object structure varies between examples and user scenes
  isPublic?: boolean;
  onSceneClick: (sceneId: string, isPublic: boolean) => void;
}

export function SceneCard({ scene, isPublic = false, onSceneClick }: SceneCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const sceneName = scene.name || scene.title || 'Untitled Scene';
  // Get scene ID for loading - for example scenes, use sceneId field, otherwise use id
  const sceneIdForPreview = scene.sceneId || scene.id;
  // For user scenes, we already have the full scene data including objects
  // For public/example scenes, the renderer will load from file
  const sceneDataForPreview = !isPublic && scene.objects ? scene : undefined;
  
  const author = scene.author || (isPublic ? 'Physics Lab' : 'You');
  const avatarColor = generateAvatarColor(author);
  const avatarLetter = author.charAt(0).toUpperCase();

  const handleSceneClick = () => {
    onSceneClick(scene.id, isPublic);
  };

  return (
    <div 
      className="scene-card" 
      onClick={handleSceneClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="scene-thumbnail-container">
        <ScenePreviewRenderer 
          sceneId={sceneIdForPreview}
          sceneData={sceneDataForPreview}
          isHovered={isHovered}
        />
        <div className="scene-duration">3D</div>
      </div>
      <div className="scene-card-details">
        <div className="scene-avatar" style={{ backgroundColor: avatarColor }}>
          {avatarLetter}
        </div>
        <div className="scene-meta-content">
          <h3 className="scene-title" title={sceneName}>{sceneName}</h3>
          <div className="scene-channel-name">{author}</div>
        </div>
      </div>
    </div>
  );
}
