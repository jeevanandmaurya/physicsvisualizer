import React from 'react';
import './SceneConsole.css';

function SceneConsole({ changes, isVisible, onAccept, onReject }) {
  if (!isVisible || !changes || changes.length === 0) return null;

  const formatValue = (value) => {
    if (Array.isArray(value)) {
      return `[${value.map(v => typeof v === 'number' ? v.toFixed(1) : v).join(', ')}]`;
    }
    if (typeof value === 'string' && value.startsWith('#')) {
      return `${value}`;
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  };

  const getShortDescription = (change) => {
    const pathParts = change.path.split('/').filter(p => p);
    const lastPart = pathParts[pathParts.length - 1];

    if (change.op === 'add' && change.path === '/objects/-') {
      return `+ ${change.value.type || 'Object'}: ${change.value.id || 'new'}`;
    }

    if (change.op === 'replace') {
      if (pathParts.includes('objects')) {
        const objIndex = pathParts.findIndex(p => p === 'objects');
        if (objIndex !== -1 && pathParts[objIndex + 1]) {
          const objId = pathParts[objIndex + 1];
          return `~ ${objId}.${lastPart} = ${formatValue(change.value)}`;
        }
      }
      return `~ ${lastPart} = ${formatValue(change.value)}`;
    }

    if (change.op === 'remove') {
      return `- ${change.path.split('/').pop()}`;
    }

    return `${change.op} ${lastPart}`;
  };

  return (
    <div className="scene-console">
      <div className="console-header">
        <span className="console-title">🤖 AI Changes Preview</span>
        <span className="console-count">{changes.length}</span>
      </div>

      <div className="console-content">
        {changes.slice(0, 5).map((change, index) => (
          <div key={index} className="console-line">
            <span className="console-op">
              {change.op === 'add' && '+'}
              {change.op === 'replace' && '~'}
              {change.op === 'remove' && '-'}
            </span>
            <span className="console-text">
              {getShortDescription(change)}
            </span>
          </div>
        ))}

        {changes.length > 5 && (
          <div className="console-line">
            <span className="console-op">...</span>
            <span className="console-text">
              +{changes.length - 5} more changes
            </span>
          </div>
        )}
      </div>

      <div className="console-actions">
        <button className="console-btn accept-btn" onClick={onAccept}>
          ✅ Accept
        </button>
        <button className="console-btn reject-btn" onClick={onReject}>
          ❌ Reject
        </button>
      </div>
    </div>
  );
}

export default SceneConsole;
