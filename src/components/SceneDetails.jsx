import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faList, faCode } from '@fortawesome/free-solid-svg-icons';
import './SceneDetails.css'; // We will update this CSS file next

function SceneDetails({ scene }) {
    const [expandedObjects, setExpandedObjects] = useState({});
    const [activeTab, setActiveTab] = useState('list');

    if (!scene) {
        return (
            <div className="scene-details-container">
                <p className="placeholder-text">No scene selected.</p>
            </div>
        );
    }

    const toggleObjectDetails = (objectId) => {
        setExpandedObjects(prev => ({ ...prev, [objectId]: !prev[objectId] }));
    };

    // Helper to format array values for display
    const formatArray = (arr) => `[${arr?.map(v => v.toFixed(2)).join(', ') ?? ''}]`;

    return (
        <div className="scene-details-container">
            {/* Tabs for List and JSON views */}
            <div className="scene-details-tabs">
                <button
                    className={`scene-tab ${activeTab === 'list' ? 'active' : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    <FontAwesomeIcon icon={faList} /> List View
                </button>
                <button
                    className={`scene-tab ${activeTab === 'json' ? 'active' : ''}`}
                    onClick={() => setActiveTab('json')}
                >
                    <FontAwesomeIcon icon={faCode} /> JSON View
                </button>
            </div>

            <div className="details-content">
                {activeTab === 'list' && (
                    <>
                        {/* Scene title above description */}
                        <div className="scene-title-section">
                            <h4 className="scene-title">{scene.name}</h4>
                            {(scene.isTemporary || scene.isExtracted) && (
                                <span className="unsaved-indicator" title="This scene is unsaved">
                                    <FontAwesomeIcon icon={faExclamationTriangle} /> Unsaved
                                </span>
                            )}
                        </div>

                        <p className="scene-description-text"><strong>Description:</strong> {scene.description || 'No description.'}</p>
                        {(scene.isTemporary || scene.isExtracted) && (
                            <div className="extraction-notice">
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                <span>This scene has unsaved changes. Save it to keep it permanently.</span>
                            </div>
                        )}

                        {/* --- Scene Properties Section --- */}
                        <div className="properties-section">
                            <strong className="properties-section-title">Scene Properties</strong>
                            <div className="property-row"><span>Gravity:</span> <span>{formatArray(scene.gravity)} m/s²</span></div>
                            <div className="property-row"><span>Friction:</span> <span>{scene.contactMaterial?.friction?.toFixed(2) ?? 'N/A'}</span></div>
                            <div className="property-row"><span>Restitution:</span> <span>{scene.contactMaterial?.restitution?.toFixed(2) ?? 'N/A'}</span></div>
                            <div className="property-row"><span>Ground Plane:</span> <span>{scene.hasGround !== false ? 'Yes' : 'No'}</span></div>
                            {scene.authorName && <div className="property-row"><span>Author:</span> <span>{scene.authorName}</span></div>}
                        </div>

                        {/* --- Gravitational Physics Section --- */}
                        {scene.gravitationalPhysics?.enabled && (
                            <div className="properties-section">
                                <strong className="properties-section-title">Gravitational Physics</strong>
                                <div className="property-row"><span>G Constant:</span> <span>{scene.gravitationalPhysics.gravitationalConstant?.toExponential(2) ?? 'N/A'}</span></div>
                                <div className="property-row"><span>Min Distance:</span> <span>{scene.gravitationalPhysics.minDistance?.toExponential(2) ?? 'N/A'}</span></div>
                                <div className="property-row"><span>Softening:</span> <span>{scene.gravitationalPhysics.softening?.toFixed(2) ?? 'N/A'}</span></div>
                            </div>
                        )}

                        {/* --- Objects Section --- */}
                        <div className="properties-section">
                            <strong className="properties-section-title">Objects ({scene.objects?.length || 0})</strong>
                            {scene.objects?.length > 0 ? (
                                <ul className="object-list">
                                    {scene.objects.map((obj, index) => (
                                        <li key={obj.id || index} className="object-list-item">
                                            <div
                                                className="object-header"
                                                onClick={() => toggleObjectDetails(obj.id || index)}
                                                role="button" tabIndex={0}
                                            >
                                                <span className={`toggle-icon ${expandedObjects[obj.id || index] ? 'expanded' : ''}`}></span>
                                                <span className="object-title">{obj.type} ({obj.id || `obj-${index}`})</span>
                                                {obj.isStatic && <span className="static-badge">Static</span>}
                                            </div>
                                            {expandedObjects[obj.id || index] && (
                                                <div className="object-properties">
                                                    <div className="property-row"><span>Mass:</span><span>{obj.mass ?? 'N/A'} kg</span></div>
                                                    <div className="property-row"><span>Position:</span><span>{formatArray(obj.position)}</span></div>
                                                    <div className="property-row"><span>Velocity:</span><span>{formatArray(obj.velocity)}</span></div>
                                                    <div className="property-row"><span>Color:</span><div style={{display: 'flex', alignItems: 'center'}}><span className="color-preview" style={{ backgroundColor: obj.color }}></span><span>{obj.color}</span></div></div>
                                                    {obj.radius && <div className="property-row"><span>Radius:</span><span>{obj.radius.toFixed(2)} m</span></div>}
                                                    {obj.dimensions && <div className="property-row"><span>Dimensions:</span><span>{formatArray(obj.dimensions)}</span></div>}
                                                    {obj.height && <div className="property-row"><span>Height:</span><span>{obj.height.toFixed(2)} m</span></div>}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="placeholder-text">No objects in this scene.</p>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'json' && (
                    <div className="json-view">
                        <div className="json-header">
                            <strong>Scene JSON</strong>
                            <button
                                className="copy-json-btn"
                                onClick={() => navigator.clipboard.writeText(JSON.stringify(scene, null, 2))}
                                title="Copy JSON to clipboard"
                            >
                                Copy JSON
                            </button>
                        </div>
                        <pre className="json-content">
                            {JSON.stringify(scene, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SceneDetails;
