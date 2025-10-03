import React, { createContext, useContext, useState, useEffect } from 'react';

// Define types for ThemeContext
export interface OverlayOpacitySettings {
  chat: number;
  graph: number;
  controller: number;
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
  const [theme, setTheme] = useState('light');
  const [overlayOpacity, setOverlayOpacity] = useState({
    chat: 0.8,
    graph: 0.8,
    controller: 0.8
  });

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setTheme(saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }

    // Load overlay opacity settings
    const savedChatOpacity = localStorage.getItem('chatOpacity');
    const savedGraphOpacity = localStorage.getItem('graphOpacity');
    const savedControllerOpacity = localStorage.getItem('controllerOpacity');
    if (savedChatOpacity) {
      setOverlayOpacity(prev => ({ ...prev, chat: parseFloat(savedChatOpacity) }));
    }
    if (savedGraphOpacity) {
      setOverlayOpacity(prev => ({ ...prev, graph: parseFloat(savedGraphOpacity) }));
    }
    if (savedControllerOpacity) {
      setOverlayOpacity(prev => ({ ...prev, controller: parseFloat(savedControllerOpacity) }));
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

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
