import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * NavigationContext - Manages view navigation and cross-view state
 * 
 * Responsibilities:
 * - Current view management
 * - Navigation between views with context
 * - Cross-view communication (chat <-> visualizer)
 */

export interface NavigationContextData {
  fromView?: string;
  linkedChatId?: string;
}

export interface NavigationContextType {
  // Current view
  currentView: string;
  setCurrentView: (view: string) => void;
  
  // Navigation context for cross-view flows
  navigationContext: NavigationContextData;
  setNavigationContext: (context: NavigationContextData) => void;
  
  // Helper: Navigate to visualizer with scene and chat context
  navigateToVisualizerWithScene: (
    sceneId: string, 
    chatId: string, 
    options?: { openChat?: boolean }
  ) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [navigationContext, setNavigationContext] = useState<NavigationContextData>({});

  const navigateToVisualizerWithScene = useCallback((
    sceneId: string,
    chatId: string,
    options?: { openChat?: boolean }
  ) => {
    console.log('🚀 Navigating to visualizer with scene:', sceneId, 'chat:', chatId);
    
    // Store navigation context
    setNavigationContext({
      fromView: currentView,
      linkedChatId: chatId
    });
    
    // Switch to visualizer view
    setCurrentView('visualizer');
    
    // Store chat open preference (will be used by Workbench)
    if (options?.openChat) {
      sessionStorage.setItem('openChatOverlay', 'true');
    }
    
    console.log('✅ Navigation complete');
  }, [currentView]);

  const value: NavigationContextType = {
    currentView,
    setCurrentView,
    navigationContext,
    setNavigationContext,
    navigateToVisualizerWithScene,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
