import React, { createContext, useContext, useState, useCallback } from 'react';
import { OverlayType } from '../workbench/Overlay';

interface OverlayState {
  id: string;
  type: OverlayType;
  baseZIndex: number;
  isOpen: boolean;
}

interface OverlayContextType {
  overlays: Map<string, OverlayState>;
  focusedOverlay: string | null;
  registerOverlay: (id: string, type: OverlayType, baseZIndex: number) => void;
  unregisterOverlay: (id: string) => void;
  focusOverlay: (id: string) => void;
  getZIndex: (id: string) => number;
  setOverlayOpen: (id: string, isOpen: boolean) => void;
}

const OverlayContext = createContext<OverlayContextType | null>(null);

export const useOverlay = (): OverlayContextType => {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error('useOverlay must be used within an OverlayProvider');
  }
  return context;
};

interface OverlayProviderProps {
  children: React.ReactNode;
}

export const OverlayProvider = ({ children }: OverlayProviderProps) => {
  const [overlays, setOverlays] = useState<Map<string, OverlayState>>(new Map());
  const [focusedOverlay, setFocusedOverlay] = useState<string | null>(null);

  const registerOverlay = useCallback((id: string, type: OverlayType, baseZIndex: number) => {
    setOverlays(prev => {
      const newMap = new Map(prev);
      newMap.set(id, { id, type, baseZIndex, isOpen: true });
      return newMap;
    });
  }, []);

  const unregisterOverlay = useCallback((id: string) => {
    setOverlays(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
    setFocusedOverlay(current => current === id ? null : current);
  }, []);

  const focusOverlay = useCallback((id: string) => {
    setFocusedOverlay(id);
  }, []);

  const setOverlayOpen = useCallback((id: string, isOpen: boolean) => {
    setOverlays(prev => {
      const newMap = new Map(prev);
      const overlay = newMap.get(id);
      if (overlay) {
        newMap.set(id, { ...overlay, isOpen });
      }
      return newMap;
    });
  }, []);

  const getZIndex = useCallback((id: string): number => {
    const overlay = overlays.get(id);
    if (!overlay) return 50; // Default z-index
    
    // If this overlay is focused, give it a boost
    if (focusedOverlay === id) {
      return overlay.baseZIndex + 10;
    }
    
    return overlay.baseZIndex;
  }, [overlays, focusedOverlay]);

  return (
    <OverlayContext.Provider value={{
      overlays,
      focusedOverlay,
      registerOverlay,
      unregisterOverlay,
      focusOverlay,
      getZIndex,
      setOverlayOpen
    }}>
      {children}
    </OverlayContext.Provider>
  );
};
