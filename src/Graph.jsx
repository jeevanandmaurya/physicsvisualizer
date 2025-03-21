// src/Graph.jsx
import React, { useEffect, useRef } from 'react';
import JXG from 'jsxgraph';
import './Graph.css'; // Optional styling

function Graph() {
  const boardRef = useRef(null);
  const graphRef = useRef(null);

  useEffect(() => {
    // Initialize JSXGraph board
    if (!graphRef.current) {
      graphRef.current = JXG.JSXGraph.initBoard(boardRef.current, {
        boundingbox: [-5, 5, 5, -5], // [x_min, y_max, x_max, y_min]
        axis: true, // Show x and y axes
        showCopyright: false,
        showNavigation: true, // Zoom/pan controls
      });

      // Plot a sample function: y = x²
      const curve = graphRef.current.create('functiongraph', [
        (x) => x * x,
        -5,
        5,
      ], { strokeColor: 'blue', strokeWidth: 2 });
    }

    // Cleanup on unmount
    return () => {
      if (graphRef.current) {
        JXG.JSXGraph.freeBoard(graphRef.current);
        graphRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={boardRef}
      style={{ width: '100%', height: '100%' }}
      id="jsxgraph-board"
    />
  );
}

export default Graph;