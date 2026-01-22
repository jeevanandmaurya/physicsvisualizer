import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { SimulationProvider } from './contexts/SimulationContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { OverlayProvider } from './contexts/OverlayContext';
import { SceneCacheProvider } from './contexts/SceneCacheContext';
import App from './App.tsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <OverlayProvider>
        <DatabaseProvider>
          <WorkspaceProvider>
            <SimulationProvider>
              <NavigationProvider>
                <SceneCacheProvider>
                  <App />
                </SceneCacheProvider>
              </NavigationProvider>
            </SimulationProvider>
          </WorkspaceProvider>
        </DatabaseProvider>
      </OverlayProvider>
    </ThemeProvider>
  </StrictMode>
);
