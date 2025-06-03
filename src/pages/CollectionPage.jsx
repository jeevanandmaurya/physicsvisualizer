// src/pages/CollectionPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function CollectionPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Scene Collection</h1>
      <p>Browse and manage your saved scenes and simulations here.</p>
      {/* Future content for the collection page */}
      <Link to="/">Back to Dashboard</Link>
    </div>
  );
}

export default CollectionPage;