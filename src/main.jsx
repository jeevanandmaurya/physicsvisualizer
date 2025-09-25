import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DatabaseProvider>
      <WorkspaceProvider>
        <App />
      </WorkspaceProvider>
    </DatabaseProvider>
  </StrictMode>
);
