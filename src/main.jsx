// src/main.jsx (CORRECTED FINAL VERSION)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
        <DatabaseProvider>
          <WorkspaceProvider>
            <App />
          </WorkspaceProvider>
        </DatabaseProvider>
    </BrowserRouter>
  </StrictMode>
);

// Register Service Worker for caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

/* ===== VIEWPORT HEIGHT FIXING REMOVED ===== */
/* Removed viewport height fixing code to prevent WebGL context loss */
