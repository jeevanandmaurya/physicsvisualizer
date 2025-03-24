// Graph.jsx
import React, { useEffect, useRef } from 'react';
import JXG from 'jsxgraph';
import './Graph.css';

function Graph({ data }) {
  const boardRef = useRef(null);
  const boardInstance = useRef(null);

  // Initialize the board
  useEffect(() => {
    if (!boardInstance.current) {
      boardInstance.current = JXG.JSXGraph.initBoard(boardRef.current, {
        boundingbox: [-10, 10, 10, -10],
        axis: true,
        showCopyright: false,
        showNavigation: true,
        pan: { enabled: true, needShift: false },
        zoom: {
          enabled: true,
          wheel: true,
          needShift: false,
          min: 0.1,
          max: 10,
        },
        keepaspectratio: false,
      });

      // Add title
      boardInstance.current.create('text', [0, 9, 'Position Graph'], {
        fontSize: 16,
        fixed: true,
        anchorX: 'middle'
      });
    }

    // Clean up
    return () => {
      if (boardInstance.current) {
        JXG.JSXGraph.freeBoard(boardInstance.current);
        boardInstance.current = null;
      }
    };
  }, []);

  // Update the point
  useEffect(() => {
    if (!boardInstance.current || data.length === 0) return;

    // Remove previous point if it exists
    if (boardInstance.current.objects['currentPoint']) {
      boardInstance.current.removeObject(boardInstance.current.objects['currentPoint']);
    }

    // Add current position point
    const latestPosition = data[data.length - 1];
    boardInstance.current.create('point', [latestPosition.x, latestPosition.y], {
      name: 'Current',
      size: 2,
      color: 'red',
      fixed: true,
      id: 'currentPoint'
    });

    // Adjust bounds dynamically
    const xMax = Math.max(...data.map(p => Math.abs(p.x)), 1) * 1.1;
    const yMax = Math.max(...data.map(p => Math.abs(p.y)), 1) * 1.1;
    const currentBounds = boardInstance.current.getBoundingBox();
    
    if (xMax > currentBounds[2] || yMax > currentBounds[1]) {
      boardInstance.current.setBoundingBox(
        [-xMax, yMax, xMax, -yMax],
        false
      );
    }

    // Force update
    boardInstance.current.update();
  }, [data]);

  return (
    <div className="graph-container">
      <div
        ref={boardRef}
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '200px', // Ensure minimum height
          backgroundColor: '#fff' // Add background to make it visible
        }}
        id="jsxgraph-board"
      />
    </div>
  );
}

export default Graph;