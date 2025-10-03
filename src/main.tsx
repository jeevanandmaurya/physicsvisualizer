import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App.tsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <DatabaseProvider>
        <WorkspaceProvider>
          <App />
        </WorkspaceProvider>
      </DatabaseProvider>
    </ThemeProvider>
  </StrictMode>
);
