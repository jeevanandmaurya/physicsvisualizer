import React, { useEffect, useRef, useState } from 'react';
import JXG from 'jsxgraph';
// import './Graph.css'; // You might not need Graph.css for layout if handled here/App.css

function Graph({ data }) {
  const boardRef = useRef(null);
  const boardInstance = useRef(null);
  const [plotType, setPlotType] = useState('yvx');
  const [autoFit, setAutoFit] = useState(true);

  // Effect for initializing the board (runs once on mount)
  useEffect(() => {
    if (!boardRef.current) return;

    const id = `jsxg-${Math.random().toString(36).slice(2)}`;
    boardRef.current.id = id; // Assign dynamic ID

    console.log(`Initializing JSXGraph board with ID: ${id}`); // Debugging

    const board = JXG.JSXGraph.initBoard(id, {
      boundingbox: [-10, 10, 10, -10],
      grid: { theme: 1 },
      showCopyright: false,
      pan: { enabled: true, needShift: false },
      zoom: { enabled: true, wheel: true, needShift: false },
      keepaspectratio: false, // Allow independent width/height changes
      backgroundColor: 'white',
      // Ensure axis ticks are reasonable if default axes are used
      // defaultAxes: {
      //     x: { ticks: { majorHeight: 10, drawZero: true } },
      //     y: { ticks: { majorHeight: 10, drawZero: true } }
      // }
    });
    boardInstance.current = board;

    // Cleanup function: Free the board when component unmounts
    return () => {
      if (boardInstance.current) {
        console.log(`Freeing JSXGraph board with ID: ${boardInstance.current.container}`); // Debugging
        JXG.JSXGraph.freeBoard(boardInstance.current);
        boardInstance.current = null;
      }
    };
  }, []); // Empty dependency array: Run only once on mount

  // Effect for updating the plot based on data/plotType/autoFit
  useEffect(() => {
    const board = boardInstance.current;
    if (!board || !data) return;

    // --- Plotting Logic (Keep your existing, functional plotting logic here) ---
    board.suspendUpdate();

    // Clear previous curves and points
    const elementsToRemove = board.objectsList.filter(obj =>
      obj.elType === 'curve' || obj.elType === 'point'
    );
    elementsToRemove.forEach(obj => {
      if (board.objects[obj.id]) {
        board.removeObject(obj);
      }
    });

    // Determine keys based on plotType
    const xKey = plotType === 'xvt' ? 't' : 'x';
    const yKey = plotType === 'yvt' ? 'y' : plotType === 'xvt' ? 'x' : 'y';
    let allX = [], allY = [];

    // Plot data for each object ID
    Object.values(data || {}).forEach((history, i) => {
        if (!history || history.length === 0) return;

        const xData = history.map(p => p[xKey]);
        const yData = history.map(p => p[yKey]);

        if (xData.length > 0 && yData.length > 0) {
            // Create curve
            board.create('curve', [xData, yData], {
                strokeColor: ['#1f77b4', '#ff7f0e'][i % 2], // Example colors
                strokeWidth: 2,
            });

            // Create point for the last position
            const lastX = xData[xData.length - 1];
            const lastY = yData[yData.length - 1];
            if (typeof lastX === 'number' && typeof lastY === 'number' && isFinite(lastX) && isFinite(lastY)) {
                board.create('point', [lastX, lastY], {
                    size: 3,
                    color: ['#1f77b4', '#ff7f0e'][i % 2],
                    fixed: true,
                    name: '',
                });
            }

            allX.push(...xData.filter(Number.isFinite)); // Collect finite data for bounding box
            allY.push(...yData.filter(Number.isFinite));
        }
    });

    // --- Auto-Fit Logic (Keep your existing, functional auto-fit logic here) ---
    if (autoFit && allX.length > 0 && allY.length > 0) {
        const minX = Math.min(...allX);
        const maxX = Math.max(...allX);
        const minY = Math.min(...allY);
        const maxY = Math.max(...allY);
        const rangeX = maxX - minX;
        const rangeY = maxY - minY;
        const padX = Math.max(rangeX * 0.1, 1); // Ensure minimum padding
        const padY = Math.max(rangeY * 0.1, 1);
        let newMinX = minX - padX;
        let newMaxX = maxX + padX;
        let newMinY = minY - padY;
        let newMaxY = maxY + padY;
        const minRange = 2; // Prevent excessively zoomed-in views

        // Ensure minimum view range
        if (newMaxX - newMinX < minRange) {
            const midX = (newMinX + newMaxX) / 2;
            newMinX = midX - minRange / 2;
            newMaxX = midX + minRange / 2;
        }
        if (newMaxY - newMinY < minRange) {
            const midY = (newMinY + newMaxY) / 2;
            newMinY = midY - minRange / 2;
            newMaxY = midY + minRange / 2;
        }

        // Maintain aspect ratio (optional, adjust if needed) - currently makes view square-ish
        const finalRangeX = newMaxX - newMinX;
        const finalRangeY = newMaxY - newMinY;
        const maxRange = Math.max(finalRangeX, finalRangeY);
        const centerX = (newMinX + newMaxX) / 2;
        const centerY = (newMinY + newMaxY) / 2;

        board.setBoundingBox([
            centerX - maxRange / 2, centerY + maxRange / 2,
            centerX + maxRange / 2, centerY - maxRange / 2
        ], false); // false = don't keep aspect ratio (allows independent zoom), true = keep aspect ratio
    }

    board.unsuspendUpdate(); // Redraw the board with updates
    // --- End of Plotting Logic ---

  }, [data, plotType, autoFit]); // Dependencies for plot updates

  // Effect for handling resize using ResizeObserver (runs once on mount)
  useEffect(() => {
    const boardElement = boardRef.current; // Reference to the board container div
    if (!boardElement) return;

    // Define the resize handler function
    const handleResize = (entries) => {
        if (!boardInstance.current || !boardElement) return;

        // Use the current clientWidth/clientHeight of the observed element
        const width = boardElement.clientWidth;
        const height = boardElement.clientHeight;

        // Avoid resizing to 0x0 which can cause errors
        if (width > 0 && height > 0) {
            console.log(`ResizeObserver: Resizing board container to: ${width} x ${height}`); // Debugging
            // Tell JSXGraph to resize its internal canvas
            boardInstance.current.resizeContainer(width, height);
            // Update the board view to reflect the new size
            boardInstance.current.update(); // Or fullUpdate() if needed
        }
    };

    // Create observer instance
    const resizeObserver = new ResizeObserver(handleResize);

    // Start observing the board container element
    resizeObserver.observe(boardElement);
    console.log("ResizeObserver: Started observing board element."); // Debugging

    // Cleanup function: Stop observing when component unmounts
    return () => {
      if (boardElement) {
        resizeObserver.unobserve(boardElement);
        console.log("ResizeObserver: Stopped observing board element."); // Debugging
      }
      resizeObserver.disconnect(); // Disconnect observer
    };
  }, []); // Empty dependency array: Run setup/cleanup only once

  return (
    // This outer div uses flexbox to make the board container fill available space
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#ddd' /* Optional: Background for visual debugging */ }}>

      {/* This div is the actual container for the JSXGraph board */}
      {/* 'flex: 1' makes it take up available vertical space */}
      {/* 'width: 100%' makes it take up available horizontal space */}
      {/* 'minHeight: 0' prevents flexbox issues in some browsers */}
      <div
        ref={boardRef}
        style={{
            flex: 1,
            width: '100%',
            minHeight: 0, // Important for flex item shrinking
            border: '1px solid #ccc', // Keep border if desired
            backgroundColor: 'white', // Keep background if desired
            position: 'relative' // Often helps JSXGraph positioning
        }}
      />

      {/* Controls Section */}
      <div style={{ padding: '8px', backgroundColor: '#2a2a2a', color: 'white', fontSize: '14px', flexShrink: 0 /* Prevent controls shrinking */ }}>
        <span style={{ marginRight: '10px' }}>Plot:</span>
        {/* Radio buttons and Checkbox (keep your functional controls here) */}
        <label style={{ marginRight: '10px', color: 'white' }}>
            <input type="radio" value="yvx" checked={plotType === 'yvx'} onChange={(e) => setPlotType(e.target.value)} style={{ marginRight: '4px' }} /> Y vs X
        </label>
        <label style={{ marginRight: '10px', color: 'white' }}>
            <input type="radio" value="xvt" checked={plotType === 'xvt'} onChange={(e) => setPlotType(e.target.value)} style={{ marginRight: '4px' }} /> X vs T
        </label>
        <label style={{ color: 'white' }}>
            <input type="radio" value="yvt" checked={plotType === 'yvt'} onChange={(e) => setPlotType(e.target.value)} style={{ marginRight: '4px' }} /> Y vs T
        </label>
        <br />
        <label style={{ color: 'white', marginTop: '5px', display: 'inline-block' }}>
            <input type="checkbox" checked={autoFit} onChange={() => setAutoFit(!autoFit)} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Auto-Fit View
        </label>
      </div>
    </div>
  );
}

export default Graph;