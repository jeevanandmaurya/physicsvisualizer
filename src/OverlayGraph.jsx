// OverlayGraph.js
import React, { useState, useEffect, useMemo } from 'react';
import { Rnd } from 'react-rnd';
// You'll need to import your charting library here if you're using one
// import { Line } from 'react-chartjs-2'; // Example using react-chartjs-2
// import 'chart.js/auto'; // Import necessary Chart.js components
import './graph.css'; // Assume you have corresponding CSS

// Default size and position for the graph overlay
const defaultOverlaySize = { width: 300, height: 200 }; // Make it a bit larger for a graph
const defaultOverlayPosition = { x: 20, y: 80 }; // Default starting position

function OverlayGraph({ id, initialType, data, onClose }) {
    // Extract the list of available object IDs from the data keys
    const objectIds = useMemo(() => Object.keys(data), [data]);

    // State to keep track of the currently selected object ID for this graph instance
    const [selectedObjectId, setSelectedObjectId] = useState(objectIds[0] || null);

    // Effect to set the selected object when the list of objects changes or on initial mount
    useEffect(() => {
        // If no object is selected yet and there are objects available, select the first one
        if (!selectedObjectId && objectIds.length > 0) {
            setSelectedObjectId(objectIds[0]);
        } else if (selectedObjectId && !objectIds.includes(selectedObjectId)) {
             // If the currently selected object was removed, select the first available one (or null if none left)
            setSelectedObjectId(objectIds[0] || null);
        }
    }, [objectIds, selectedObjectId]); // Re-run if the list of object IDs changes

    // Use useMemo to calculate the data points for plotting efficiently
    const plotData = useMemo(() => {
        // If no object is selected or no data for the selected object, return empty array
        if (!selectedObjectId || !data[selectedObjectId]) {
            return [];
        }

        const history = data[selectedObjectId]; // Get the history array for the selected object

        // Determine which data points to use based on the initialType prop
        switch (initialType) {
            case 'yvt': // Y Position vs Time
                return history.map(p => ({ x: p.t, y: p.y }));
            case 'xvt': // X Position vs Time
                return history.map(p => ({ x: p.t, y: p.x }));
            case 'zvt': // Z Position vs Time
                return history.map(p => ({ x: p.t, y: p.z }));
            case 'yvx': // Y Position vs X Position (for the same object)
                 // Filter out points where x or y might be undefined if needed
                return history.filter(p => p.x !== undefined && p.y !== undefined).map(p => ({ x: p.x, y: p.y }));
            // Add cases for other graph types (velocity, acceleration, etc.) here if needed later
            default:
                return []; // Return empty array for unknown types
        }
    }, [selectedObjectId, data, initialType]); // Recalculate if selected object, data, or type changes

    // Determine the labels and title for the graph based on initialType and selected object
    const getLabels = useMemo(() => {
        const objectLabel = selectedObjectId ? `Object ${selectedObjectId}` : 'Select Object';
        switch (initialType) {
            case 'yvt': return { title: `Y Position vs Time (${objectLabel})`, xlabel: 'Time (s)', ylabel: 'Y Position' };
            case 'xvt': return { title: `X Position vs Time (${objectLabel})`, xlabel: 'Time (s)', ylabel: 'X Position' };
            case 'zvt': return { title: `Z Position vs Time (${objectLabel})`, xlabel: 'Time (s)', ylabel: 'Z Position' };
            case 'yvx': return { title: `Y Position vs X Position (${objectLabel})`, xlabel: 'X Position', ylabel: 'Y Position' };
            default: return { title: 'Position Graph', xlabel: '', ylabel: '' }; // Default labels
        }
    }, [selectedObjectId, initialType]); // Recalculate if selected object or type changes


    return (
        <Rnd
            size={defaultOverlaySize}
            default={{ ...defaultOverlaySize, ...defaultOverlayPosition }}
            minWidth={250} // Minimum size
            minHeight={200} // Minimum size
            bounds=".visualizer" // Restrict dragging within the visualizer container
            className="overlay" // Apply base overlay styles
            dragHandleClassName="overlay-header" // Define the drag handle area
            enableResizing={{ top:false, right: true, bottom: true, left:false, topRight:false, bottomRight: true, bottomLeft:false, topLeft:false }} // Enable specific resizing handles
            // Optional: Add a zIndex style if needed to control stacking of multiple overlays
            // style={{ zIndex: 100 }}
        >
            <div className="overlay-header">
                <span className="overlay-title">{getLabels.title}</span> {/* Display dynamic title */}
                {/* Close button */}
                <button className="overlay-close-button" onClick={() => onClose(id)}>×</button>
            </div>
            <div className="overlay-content graph-content"> {/* Add a class for specific graph content styling */}
                <div className="graph-controls">
                    {/* Dropdown to select the object */}
                    <label htmlFor={`object-select-${id}`}>Object:</label>
                    <select
                        id={`object-select-${id}`} // Unique ID for accessibility
                        value={selectedObjectId || ''} // Use selectedObjectId, default to '' if null
                        onChange={(e) => setSelectedObjectId(e.target.value)} // Update state on change
                        disabled={objectIds.length === 0} // Disable if no objects are available
                    >
                         {/* Show a default option if no objects or if no selection */}
                         {!selectedObjectId && <option value="">Select Object</option>}
                         {objectIds.length === 0 && <option value="">No objects available</option>}

                        {/* Map through the available object IDs to create dropdown options */}
                        {objectIds.map(objId => (
                            <option key={objId} value={objId}>{objId}</option>
                        ))}
                    </select>
                    {/* You could add more controls here, e.g., for selecting axes if initialType is 'custom' */}
                </div>

                <div className="graph-plot-area">
                    {/* This is where you would integrate your charting library (e.g., Chart.js, Plotly, Nivo) */}
                    {/* Or your custom canvas/SVG drawing code to render the plotData */}

                    {/* Example Placeholder Display */}
                    {plotData.length > 0 ? (
                        <div>
                            Graph Area for {getLabels.title}
                            <br/> Plotting {plotData.length} points.
                             <br/> Latest Data Point:
                             {/* Display the latest point's coordinates based on the plot type */}
                             {initialType === 'yvt' && ` (t: ${plotData[plotData.length-1].x.toFixed(3)}, y: ${plotData[plotData.length-1].y.toFixed(3)})`}
                             {initialType === 'xvt' && ` (t: ${plotData[plotData.length-1].x.toFixed(3)}, x: ${plotData[plotData.length-1].y.toFixed(3)})`}
                             {initialType === 'zvt' && ` (t: ${plotData[plotData.length-1].x.toFixed(3)}, z: ${plotData[plotData.length-1].y.toFixed(3)})`}
                             {initialType === 'yvx' && ` (x: ${plotData[plotData.length-1].x.toFixed(3)}, y: ${plotData[plotData.length-1].y.toFixed(3)})`}
                        </div>
                    ) : (
                        <div>Select an object to view data.</div>
                    )}

                </div>
            </div>
        </Rnd>
    );
}

export default OverlayGraph;