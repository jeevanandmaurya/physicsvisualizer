import React, { createContext, useContext, useState, useCallback } from 'react';
import { OverlayType } from '../workbench/Overlay';

interface OverlayState {
  id: string;
  type: OverlayType;
  baseZIndex: number;
  isOpen: boolean;
  isMinimized: boolean;
}

interface OverlayContextType {
  overlays: Map<string, OverlayState>;
  focusedOverlay: string | null;
  minimizedOrder: string[];
  registerOverlay: (id: string, type: OverlayType, baseZIndex: number) => void;
  unregisterOverlay: (id: string) => void;
  focusOverlay: (id: string) => void;
  getZIndex: (id: string) => number;
  setOverlayOpen: (id: string, isOpen: boolean) => void;
  toggleMinimize: (id: string) => void;
  isMinimized: (id: string) => boolean;
  getMinimizedPosition: (id: string) => { x: number, y: number } | null;
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
  const [minimizedOrder, setMinimizedOrder] = useState<string[]>([]);

  const registerOverlay = useCallback((id: string, type: OverlayType, baseZIndex: number) => {
    setOverlays(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(id)) {
        newMap.set(id, { id, type, baseZIndex, isOpen: true, isMinimized: false });
      }
      return newMap;
    });
  }, []);

  const unregisterOverlay = useCallback((id: string) => {
    setOverlays(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
    setMinimizedOrder(prev => prev.filter(oid => oid !== id));
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
    if (!isOpen) {
      setMinimizedOrder(prev => prev.filter(oid => oid !== id));
    }
  }, []);

  const toggleMinimize = useCallback((id: string) => {
    setOverlays(prev => {
      const newMap = new Map(prev);
      const overlay = newMap.get(id);
      if (overlay) {
        const newMinimized = !overlay.isMinimized;
        newMap.set(id, { ...overlay, isMinimized: newMinimized });
        
        if (newMinimized) {
          setMinimizedOrder(prevOrder => [...prevOrder.filter(oid => oid !== id), id]);
        } else {
          setMinimizedOrder(prevOrder => prevOrder.filter(oid => oid !== id));
        }
      }
      return newMap;
    });
  }, []);

  const isMinimized = useCallback((id: string) => {
    return overlays.get(id)?.isMinimized || false;
  }, [overlays]);

  const getMinimizedPosition = useCallback((id: string) => {
    const index = minimizedOrder.indexOf(id);
    if (index === -1) return null;
    
    // Minimized overlays are 200px wide, spaced 10px apart
    // Positioned at the bottom, just above the status bar (approx 30px from bottom)
    // Start at x=60 to avoid overlapping the 40px activity bar
    const width = 200;
    const spacing = 10;
    const x = 60 + index * (width + spacing);
    const y = window.innerHeight - 70; // 40px for status bar + 30px for minimized height
    
    return { x, y };
  }, [minimizedOrder]);

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
      minimizedOrder,
      registerOverlay,
      unregisterOverlay,
      focusOverlay,
      getZIndex,
      setOverlayOpen,
      toggleMinimize,
      isMinimized,
      getMinimizedPosition
    }}>
      {children}
    </OverlayContext.Provider>
  );
};
