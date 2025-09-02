// src/main.jsx (CORRECTED FINAL VERSION)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { DatabaseProvider } from './contexts/DatabaseContext'; // <--- IMPORT THIS
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
        <DatabaseProvider> {/* <--- ADD THIS HERE */}
          <App />
        </DatabaseProvider> {/* <--- AND THIS CLOSING TAG */}
    </BrowserRouter>
  </StrictMode>
);