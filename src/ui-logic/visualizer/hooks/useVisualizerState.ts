import { useState, useCallback } from 'react';

export interface VisualizerUIState {
  sceneSwitching: boolean;
  error: string | null;
  pendingChanges: any;
  isPreviewMode: boolean;
  capturedThumbnail: string | null;
  rightPanelView: string;
  showSceneDetails: boolean;
}

export function useVisualizerState() {
  const [sceneSwitching, setSceneSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<any>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [capturedThumbnail, setCapturedThumbnail] = useState<string | null>(null);
  const [rightPanelView, setRightPanelView] = useState('chat');
  const [showSceneDetails, setShowSceneDetails] = useState(false);

  const handleToggleSceneDetails = useCallback(() => {
    setShowSceneDetails(prev => !prev);
  }, []);

  const handleThumbnailCapture = useCallback((thumbnailDataUrl: string) => {
    setCapturedThumbnail(thumbnailDataUrl);
  }, []);

  const handleAcceptChanges = useCallback(() => {
    setPendingChanges(null);
    setIsPreviewMode(false);
  }, []);

  const handleRejectChanges = useCallback(() => {
    setPendingChanges(null);
    setIsPreviewMode(false);
  }, []);

  const resetState = useCallback(() => {
    setSceneSwitching(false);
    setError(null);
    setPendingChanges(null);
    setIsPreviewMode(false);
    setCapturedThumbnail(null);
  }, []);

  return {
    // State
    sceneSwitching,
    setSceneSwitching,
    error,
    setError,
    pendingChanges,
    setPendingChanges,
    isPreviewMode,
    setIsPreviewMode,
    capturedThumbnail,
    rightPanelView,
    setRightPanelView,
    showSceneDetails,
    
    // Handlers
    handleToggleSceneDetails,
    handleThumbnailCapture,
    handleAcceptChanges,
    handleRejectChanges,
    resetState
  };
}
