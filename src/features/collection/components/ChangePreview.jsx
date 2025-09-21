import React from 'react';
import './ChangePreview.css';

function ChangePreview({ changes, onAccept, onReject, onClose }) {
  if (!changes || changes.length === 0) return null;

  const formatValue = (value) => {
    if (Array.isArray(value)) {
      return `[${value.map(v => typeof v === 'number' ? v.toFixed(2) : v).join(', ')}]`;
    }
    if (typeof value === 'string' && value.startsWith('#')) {
      return `${value} (color)`;
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  };

  const getChangeDescription = (change) => {
    const pathParts = change.path.split('/').filter(p => p);
    const lastPart = pathParts[pathParts.length - 1];

    if (change.op === 'add' && change.path === '/objects/-') {
      return `Add new ${change.value.type || 'object'}: ${change.value.id || 'unnamed'}`;
    }

    if (change.op === 'replace') {
      if (pathParts.includes('objects')) {
        const objIndex = pathParts.findIndex(p => p === 'objects');
        if (objIndex !== -1 && pathParts[objIndex + 1]) {
          const objId = pathParts[objIndex + 1];
          return `Change ${objId}.${lastPart} to ${formatValue(change.value)}`;
        }
      }
      return `Change ${lastPart} to ${formatValue(change.value)}`;
    }

    if (change.op === 'remove') {
      return `Remove ${change.path}`;
    }

    return `${change.op} ${change.path}`;
  };

  return (
    <div className="change-preview-overlay">
      <div className="change-preview-panel">
        <div className="change-preview-header">
          <h3>🤖 AI Scene Changes</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="change-preview-content">
          <div className="change-list">
            {changes.map((change, index) => (
              <div key={index} className="change-item">
                <div className="change-icon">
                  {change.op === 'add' && '➕'}
                  {change.op === 'replace' && '🔄'}
                  {change.op === 'remove' && '🗑️'}
                </div>
                <div className="change-description">
                  {getChangeDescription(change)}
                </div>
              </div>
            ))}
          </div>

          <div className="change-preview-details">
            <div className="change-count">
              📊 {changes.length} change{changes.length !== 1 ? 's' : ''} ready to apply
            </div>
          </div>
        </div>

        <div className="change-preview-actions">
          <button
            className="reject-btn"
            onClick={onReject}
            title="Reject these changes"
          >
            ❌ Reject
          </button>
          <button
            className="accept-btn"
            onClick={onAccept}
            title="Apply these changes"
          >
            ✅ Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChangePreview;
