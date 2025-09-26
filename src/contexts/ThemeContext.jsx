import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
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

  const updateOverlayOpacity = (type, value) => {
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
