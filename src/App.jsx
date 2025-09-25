// src/App.jsx
import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Workbench from './workbench/Workbench';

function App() {
  return (
    <ThemeProvider>
      <Workbench />
    </ThemeProvider>
  );
}

export default App;
