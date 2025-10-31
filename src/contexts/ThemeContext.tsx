import React, { createContext, useContext, useState, useEffect } from 'react';

// Define types for ThemeContext
export interface OverlayOpacitySettings {
  chat: number;
  graph: number;
  controller: number;
  sceneSelector: number;
  activityBar: number;
}

export interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
  overlayOpacity: OverlayOpacitySettings;
  updateOverlayOpacity: (type: keyof OverlayOpacitySettings, value: number) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Initialize theme from localStorage synchronously
  const getInitialTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [overlayOpacity, setOverlayOpacity] = useState({
    chat: 0.85,
    graph: 0.8,
    controller: 0.85,
    sceneSelector: 0.9,
    activityBar: 0.95
  });

  // Apply theme class immediately on mount and whenever theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load overlay opacity settings once on mount
  useEffect(() => {
    const overlayTypes: (keyof OverlayOpacitySettings)[] = ['chat', 'graph', 'controller', 'sceneSelector', 'activityBar'];
    overlayTypes.forEach(type => {
      const savedOpacity = localStorage.getItem(`${type}Opacity`);
      if (savedOpacity) {
        setOverlayOpacity(prev => ({ ...prev, [type]: parseFloat(savedOpacity) }));
      }
    });
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const updateOverlayOpacity = (type: keyof OverlayOpacitySettings, value: number) => {
    setOverlayOpacity(prev => {
      const newOpacity = { ...prev, [type]: value };
      localStorage.setItem(`${type}Opacity`, value.toString());
      return newOpacity;
    });
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      overlayOpacity,
      updateOverlayOpacity
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
