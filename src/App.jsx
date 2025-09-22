// src/App.jsx
import React from 'react';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import Workbench from './workbench/Workbench';

function App() {
  return (
    <DatabaseProvider>
      <WorkspaceProvider>
        <Workbench />
      </WorkspaceProvider>
    </DatabaseProvider>
  );
}

export default App;
