// src/main.jsx (Corrected)
import { StrictMode } from 'react'; // Correctly importing StrictMode
import { createRoot } from 'react-dom/client';
import './index.css'; // Make sure this path is correct for your global styles
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode> {/* Changed from <React.StrictMode> to <StrictMode> */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);