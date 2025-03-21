// src/Graph.jsx
import React, { useEffect, useRef } from 'react';
import JXG from 'jsxgraph';
import './Graph.css';

function Graph() {
  const boardRef = useRef(null);
  const boardInstance = useRef(null);

  useEffect(() => {
    // Initialize the board with a fixed coordinate system
    boardInstance.current = JXG.JSXGraph.initBoard(boardRef.current, {
      boundingbox: [-5, 5, 5, -5], // Fixed view: x: -5 to 5, y: -5 to 5
      axis: true,
      showCopyright: false,
      showNavigation: true, // Enable navigation controls
      pan: {
        enabled: true, // Allow panning
        needShift: false, // Pan with left-click + drag (no shift key needed)
      },
      zoom: {
        enabled: true, // Allow zooming
        wheel: true, // Zoom with mouse wheel
        needShift: false, // No shift key needed for wheel zoom
        min: 0.1, // Minimum zoom level (10% of original)
        max: 10, // Maximum zoom level (10x original)
      },
      // Disable automatic resizing
      keepaspectratio: false, // Let axes stretch independently if needed
    });

    // Plot y = x^2
    boardInstance.current.create('functiongraph', [(x) => x * x], {
      strokeColor: 'blue',
      strokeWidth: 2,
      numberPointsHigh: 200, // Smoothness
    });

    // Cleanup
    return () => {
      if (boardInstance.current) {
        JXG.JSXGraph.freeBoard(boardInstance.current);
        boardInstance.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={boardRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden' }} // Clip content
      id="jsxgraph-board"
    />
  );
}

export default Graph;