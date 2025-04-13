import React, { useEffect, useRef, useState } from 'react';
import JXG from 'jsxgraph';
import { Rnd } from 'react-rnd'; // Import Rnd
import './Graph.css'; // Remove or adapt if needed

// Define default dimensions and position
const defaultOverlaySize = { width: 150, height: 150 };
const defaultOverlayPosition = { x: 10, y: 50 }; // Adjust as needed (relative to parent)

function OverlayGraph({ id, initialType = 'yvx', data, onClose }) { // Receive id, initialType, onClose
  const boardRef = useRef(null);
  const boardInstance = useRef(null);
  const [plotType, setPlotType] = useState(initialType); // Use initialType
  const [autoFit, setAutoFit] = useState(true);
  const rndRef = useRef(null); // Ref for Rnd component

  // --- Board Initialization Effect ---
  useEffect(() => {
    if (!boardRef.current) return;
    const boardId = `jsxg-overlay-${id}-${Math.random().toString(36).slice(2)}`;
    boardRef.current.id = boardId;
    console.log(`Initializing OVERLAY JSXGraph board with ID: ${boardId}`);

    const board = JXG.JSXGraph.initBoard(boardId, {
      boundingbox: [-5, 5, 5, -5], // Smaller initial box
      grid: false, // Disable grid
      showCopyright: false,
      pan: { enabled: true, needShift: false },
      zoom: { enabled: true, wheel: true, needShift: false },
      keepaspectratio: false,
      backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly transparent background
    });
    boardInstance.current = board;

    return () => {
      if (boardInstance.current) {
        console.log(`Freeing OVERLAY JSXGraph board with ID: ${boardInstance.current.container}`);
        JXG.JSXGraph.freeBoard(boardInstance.current);
        boardInstance.current = null;
      }
    };
  }, [id]); // Depend on id to re-init if component instance is reused (though key prop should prevent this)

  // --- Plotting Logic Effect ---
  useEffect(() => {
    const board = boardInstance.current;
    if (!board || !data) return;

    board.suspendUpdate();
    // Clear previous elements
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
          strokeColor: ['#1f77b4', '#ff7f0e'][i % 2],
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
        allX.push(...xData.filter(Number.isFinite));
        allY.push(...yData.filter(Number.isFinite));
      }
    });

    // Auto-Fit Logic
    if (autoFit && allX.length > 0 && allY.length > 0) {
      const minX = Math.min(...allX);
      const maxX = Math.max(...allX);
      const minY = Math.min(...allY);
      const maxY = Math.max(...allY);
      const rangeX = maxX - minX;
      const rangeY = maxY - minY;
      const padX = Math.max(rangeX * 0.1, 0.5); // Smaller min padding
      const padY = Math.max(rangeY * 0.1, 0.5);
      let newMinX = minX - padX;
      let newMaxX = maxX + padX;
      let newMinY = minY - padY;
      let newMaxY = maxY + padY;
      const minRange = 1; // Smaller min range

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
      // Don't force aspect ratio for overlays by default
      board.setBoundingBox([newMinX, newMaxY, newMaxX, newMinY], false);
    } else if (!autoFit && board.objectsList.length === 0) {
      // Reset to default view if autoFit is off and data is cleared
      board.setBoundingBox([-5, 5, 5, -5], false);
    }

    board.unsuspendUpdate();
  }, [data, plotType, autoFit]); // Dependencies remain the same

  // --- Resize Handler Effect (Use ResizeObserver) ---
  useEffect(() => {
    const boardElement = boardRef.current;
    if (!boardElement) return;

    const handleResize = () => { // Simplified - just call resizeContainer
      if (!boardInstance.current || !boardElement) return;
      const width = boardElement.clientWidth;
      const height = boardElement.clientHeight;
      if (width > 0 && height > 0) {
        // console.log(`Overlay ResizeObserver: Resizing board ${id} to: ${width} x ${height}`); // Less verbose logging
        boardInstance.current.resizeContainer(width, height, true); // Use true to reset ticks etc.
        boardInstance.current.update();
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(boardElement);
    // console.log(`Overlay ResizeObserver: Started observing board element ${id}.`);

    // Initial resize call in case size is already set by Rnd
    handleResize();

    return () => {
      if (boardElement) {
        resizeObserver.unobserve(boardElement);
        // console.log(`Overlay ResizeObserver: Stopped observing board element ${id}.`);
      }
      resizeObserver.disconnect();
    };
  }, [id]); // Re-run if id changes (for safety)

  return (
    <Rnd
      ref={rndRef}
      className="overlay-graph-rnd" // Add class for potential styling
      style={{ zIndex: 100 }} // Ensure graphs are above visualizer content
      default={{
        x: defaultOverlayPosition.x,
        y: defaultOverlayPosition.y,
        width: defaultOverlaySize.width,
        height: defaultOverlaySize.height,
      }}
      minWidth={200}
      minHeight={180}
      bounds="parent" // Keep within the visualizer content area
      onResizeStop={(e, direction, ref, delta, position) => {
        // Optional: Update board size explicitly if ResizeObserver is slow
        // if (boardInstance.current) {
        //     boardInstance.current.resizeContainer(ref.offsetWidth, ref.offsetHeight, true);
        //     boardInstance.current.update();
        // }
      }}
    >
      {/* This outer div structure is similar to before, using flexbox */}
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>

        {/* Close Button */}
        <button
          className="overlay-graph-close-button"
          onClick={() => onClose(id)} // Call onClose with the graph's id
          aria-label="Close Graph"
        >
          X {/* 'X' character */}
        </button>

        {/* JSXGraph Board Container */}
        <div
          ref={boardRef}
          style={{
            flex: 1, // Takes available vertical space
            width: '100%',
            minHeight: 0, // Important for flex shrinking
            position: 'relative', // For JSXGraph internal elements
            backgroundColor: 'transparent', // Specific background for the board area
          }}
        />

        {/* Controls Section */}
        <div style={{ padding: '0px 2px', color: 'white', fontSize: '10px', flexShrink: 0 }}>
          {/* Keep controls functional */}
          <label style={{ marginRight: '4px', cursor: 'pointer' }}>
            <input type="radio" value="yvx" checked={plotType === 'yvx'} onChange={(e) => setPlotType(e.target.value)} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> Y vs X
          </label>
          <label style={{ marginRight: '6px', cursor: 'pointer' }}>
            <input type="radio" value="xvt" checked={plotType === 'xvt'} onChange={(e) => setPlotType(e.target.value)} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> X vs T
          </label>
          <label style={{ marginRight: '8px', cursor: 'pointer' }}>
            <input type="radio" value="yvt" checked={plotType === 'yvt'} onChange={(e) => setPlotType(e.target.value)} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> Y vs T
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={autoFit} onChange={() => setAutoFit(!autoFit)} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> Auto-Fit
          </label>
        </div>
      </div>
    </Rnd>
  );
}

export default OverlayGraph;