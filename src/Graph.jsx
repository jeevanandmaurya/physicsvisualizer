import React, { useEffect, useRef } from 'react';
import JXG from 'jsxgraph';
import './Graph.css'; // Load CSS

// Define colors (can be adjusted for light/dark theme)
const plotColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'];
const axisColor = '#888888'; // Color for axes and grid
const textColor = '#333333'; // Color for text labels

// Function to initialize or re-initialize the board
const initBoard = (boardRef) => {
  // Ensure container has explicit size for initialization
  if (!boardRef.current || boardRef.current.offsetWidth === 0) {
     console.warn("Graph container has no size yet.");
     return null; // Wait for layout
  }

  const board = JXG.JSXGraph.initBoard(boardRef.current, {
    boundingbox: [-10, 10, 10, -10],
    axis: false, // Disable default axis drawing, we'll create custom ones
    showCopyright: false,
    showNavigation: true, // Keep zoom/pan controls
    pan: { enabled: true, needShift: false },
    zoom: { enabled: true, wheel: true, needShift: false, min: 0.01, max: 100 },
    keepaspectratio: false,
    // Optional: Set default element colors (can be overridden)
    defaultAxes: {
        strokeColor: axisColor,
        ticks: {
            strokeColor: axisColor,
            label: { color: textColor } // Label color for ticks
        }
    },
    grid: { // Default grid properties (if we create one later)
        strokeColor: axisColor,
        strokeOpacity: 0.5, // Make grid slightly faint
    },
     text: { // Default text properties
         color: textColor
     }
  });

  // --- Create Custom Grid and Axes ---
  // This gives more control over appearance
  board.create('grid', [], { majorX: 1, majorY: 1 }); // Grid lines every 1 unit
  board.create('axis', [[0, 0], [1, 0]], { // X Axis
      name: 'X',
      withLabel: true,
      label: { position: 'rt', offset: [-15, 10], anchorX: 'right', color: textColor } // Position label
  });
  board.create('axis', [[0, 0], [0, 1]], { // Y Axis
      name: 'Y',
      withLabel: true,
      label: { position: 'rt', offset: [10, -15], anchorY: 'top', color: textColor } // Position label
  });
  // --- End Custom Grid and Axes ---


  // Add Title (using dynamic positioning based on bounding box)
  board.create('text',
    [
      () => (board.getBoundingBox()[2] + board.getBoundingBox()[0]) / 2, // Center X
      () => board.getBoundingBox()[1] - (board.getBoundingBox()[1] - board.getBoundingBox()[3]) * 0.05, // Near Top Y
      'Position Graph (Y vs X)'
    ],
    {
      fontSize: 14,
      fixed: true,
      anchorX: 'middle',
      anchorY: 'top', // Anchor title text to its top
      cssClass: 'graph-title',
      layer: 10 // Ensure title is on top
    }
  );

  return board;
};


function Graph({ data }) {
  const boardRef = useRef(null);
  const boardInstance = useRef(null);

  // Initialize board on component mount & handle resize
  useEffect(() => {
    const attemptInit = () => {
        if (boardRef.current && !boardInstance.current) {
            boardInstance.current = initBoard(boardRef);
        }
    }

    // Attempt initial init
     attemptInit();

     // Optional: Re-initialize on resize if layout affects board creation
     // (Can be complex - only use if necessary)
     // const resizeObserver = new ResizeObserver(attemptInit);
     // if (boardRef.current) {
     //   resizeObserver.observe(boardRef.current);
     // }

    // Cleanup function on unmount
    return () => {
      // if (resizeObserver && boardRef.current) {
      //    resizeObserver.unobserve(boardRef.current);
      // }
      if (boardInstance.current) {
        JXG.JSXGraph.freeBoard(boardInstance.current);
        boardInstance.current = null;
      }
    };
  }, []);


  // Update graph when 'data' prop changes
  useEffect(() => {
    // Board must exist to update plots
    if (!boardInstance.current) {
      // It might not have initialized on first render if container size was 0
      // Try initializing again now that data is present (layout might be ready)
      if (boardRef.current) {
           boardInstance.current = initBoard(boardRef);
           if (!boardInstance.current) {
               console.warn("Graph board failed to initialize on update.");
               return; // Still couldn't initialize
           }
      } else {
          return; // No ref yet
      }
    }

    const board = boardInstance.current;
    const hasData = Object.keys(data).length > 0 && Object.values(data).some(history => history.length > 0);

    // Clear previous plots before drawing new data
    const elementsToRemove = board.objectsList.filter(el =>
        el.elType === 'curve' || el.elType === 'point'
    );
    board.suspendUpdate(); // Pause updates
    board.removeObject(elementsToRemove);

    let allX = [], allY = [];

    if (hasData) {
      Object.entries(data).forEach(([objectId, history], index) => {
        if (history.length > 0) {
          const xCoords = history.map(p => p.x);
          const yCoords = history.map(p => p.y);
          const color = plotColors[index % plotColors.length];

          allX.push(...xCoords);
          allY.push(...yCoords);

          // Plot curve
          board.create('curve', [xCoords, yCoords], {
            strokeColor: color, strokeWidth: 2, highlightStrokeColor: color, layer: 5
          });

          // Plot latest point marker
          const latest = history[history.length - 1];
          board.create('point', [latest.x, latest.y], {
            name: '', size: 3, face: 'o', color: color, fixed: true, highlightFillColor: color, layer: 6
          });
        }
      });

      // Dynamic Bounding Box Calculation
      if (allX.length > 0 && allY.length > 0) {
            const bufferFactor = 1.15;
            let minX = Math.min(...allX); let maxX = Math.max(...allX);
            let minY = Math.min(...allY); let maxY = Math.max(...allY);
            let paddingX = Math.max((maxX - minX) * (bufferFactor - 1.0), 1.0);
            let paddingY = Math.max((maxY - minY) * (bufferFactor - 1.0), 1.0);
            if (minX === maxX) paddingX = 1.0; if (minY === maxY) paddingY = 1.0;
            board.setBoundingBox([minX - paddingX, maxY + paddingY, maxX + paddingX, minY - paddingY], false);
      } else {
           board.setBoundingBox([-10, 10, 10, -10], false);
      }

    } else {
      // No data, reset zoom
      board.setBoundingBox([-10, 10, 10, -10], false);
    }

    board.unsuspendUpdate(); // Redraw

  }, [data]); // Re-run effect when 'data' changes

  return (
    // Ensure the container has the white background style
    <div className="graph-container" style={{ width: '100%', height: '100%', minHeight: '250px' }}>
      <div
        ref={boardRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'white', // Explicitly white background
          border: '1px solid #ccc' // Add a faint border to see boundaries
        }}
        id="jsxgraph-board"
        className="jxgbox"
      />
    </div>
  );
}

export default Graph;