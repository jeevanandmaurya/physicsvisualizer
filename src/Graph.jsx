import React, { useEffect, useRef, useState } from 'react';
import JXG from 'jsxgraph';
import './Graph.css'; 

function Graph({ data }) {
  const boardRef = useRef(null);
  const boardInstance = useRef(null);
  const [plotType, setPlotType] = useState('yvx');
  const [autoFit, setAutoFit] = useState(true);

  useEffect(() => {
    if (!boardRef.current) return;

    const id = `jsxg-${Math.random().toString(36).slice(2)}`;
    boardRef.current.id = id;

    const board = JXG.JSXGraph.initBoard(id, {
      boundingbox: [-10, 10, 10, -10],
      // axis: false,
      // defaultAxes: {
      //     x: { ticks: {majorHeight: 10,ticksDistance: 1} },
      //     y: { ticks: {majorHeight: 10,ticksDistance: 1} }
      // },
       grid: { theme: 1 },
      // showNavigation: true,
      showCopyright: false,
      pan: {
        enabled: true,
        needShift: false
      },
      zoom: {
        enabled: true,
        wheel: true,
        needShift: false,
      },
      keepaspectratio: false,
      backgroundColor: 'white'
    });
    boardInstance.current = board;

    return () => {
      if (boardInstance.current) {
        JXG.JSXGraph.freeBoard(boardInstance.current);
        boardInstance.current = null;
      }
    };
  }, []); 
    // Update plot
  useEffect(() => {
    const board = boardInstance.current;
    if (!board || !data) return;

    // Store elements to remove
    const elementsToRemove = board.objectsList.filter(obj =>
      obj.elType === 'curve' || obj.elType === 'point'
    );

    board.suspendUpdate();

    // Remove previous plot elements safely
    elementsToRemove.forEach(obj => {
      // Check if object still exists before removing (important for async updates)
      if (board.objects[obj.id]) {
        board.removeObject(obj);
      }
    });


    const xKey = plotType === 'xvt' ? 't' : 'x';
    const yKey = plotType === 'yvt' ? 'y' : plotType === 'xvt' ? 'x' : 'y';

    let allX = [], allY = [];

    Object.values(data || {}).forEach((history, i) => {
      if (!history || history.length === 0) return;

      const xData = history.map(p => p[xKey]);
      const yData = history.map(p => p[yKey]);

      if (xData.length > 0 && yData.length > 0) {
        board.create('curve', [xData, yData], {
          strokeColor: ['#1f77b4', '#ff7f0e'][i % 2], // Cycle through colors
          strokeWidth: 2,
        });

        // Ensure last point data is valid before creating point
        const lastX = xData[xData.length - 1];
        const lastY = yData[yData.length - 1];
        if (typeof lastX === 'number' && typeof lastY === 'number' && isFinite(lastX) && isFinite(lastY)) {
          board.create('point', [lastX, lastY], {
            size: 3,
            color: ['#1f77b4', '#ff7f0e'][i % 2], // Match curve color
            fixed: true,
            name: '',
          });
        }


        allX.push(...xData);
        allY.push(...yData);
      }
    });

    // Filter out any non-finite values before calculating min/max
    const finiteX = allX.filter(Number.isFinite);
    const finiteY = allY.filter(Number.isFinite);


    if (autoFit && finiteX.length && finiteY.length) {
      const minX = Math.min(...finiteX);
      const maxX = Math.max(...finiteX);
      const minY = Math.min(...finiteY);
      const maxY = Math.max(...finiteY);

      const rangeX = maxX - minX;
      const rangeY = maxY - minY;

      // Add padding, ensure minimum padding
      const padX = Math.max(rangeX * 0.1, 1);
      const padY = Math.max(rangeY * 0.1, 1);

      // Calculate new bounds with padding
      let newMinX = minX - padX;
      let newMaxX = maxX + padX;
      let newMinY = minY - padY;
      let newMaxY = maxY + padY;

      // Ensure minimum viewing window size to prevent extreme zoom
      const minRange = 2; // Minimum width and height of the view
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


      // Adjust bounding box to maintain aspect ratio (square view)
      const finalRangeX = newMaxX - newMinX;
      const finalRangeY = newMaxY - newMinY;
      const maxRange = Math.max(finalRangeX, finalRangeY);
      const centerX = (newMinX + newMaxX) / 2;
      const centerY = (newMinY + newMaxY) / 2;

      board.setBoundingBox([
        centerX - maxRange / 2,
        centerY + maxRange / 2,
        centerX + maxRange / 2,
        centerY - maxRange / 2
      ], false); // 'false' for smoother transition without immediate redraw
    }

    board.unsuspendUpdate(); // Redraw changes
  }, [data, plotType, autoFit]); // Dependencies for updating plot


  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (boardInstance.current && boardRef.current) { // Ensure both refs are valid
        boardInstance.current.resizeContainer(
          boardRef.current.clientWidth,
          boardRef.current.clientHeight
        );
        boardInstance.current.update(); // Force update after resize might be needed
      }
    };

    // Call resize once initially to set the correct size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency, runs once

  return (
    // Ensure the container allows the board div to flex correctly
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Ensure this div takes up space and allows boardRef to have dimensions */}
      <div ref={boardRef} style={{ flex: 1, minHeight: '200px', border: '1px solid #ccc', backgroundColor: 'white', width: '100%' }} />
      <div style={{ padding: '8px', backgroundColor: '#2a2a2a', color: 'white', fontSize: '14px' /* Use string */ }}>
        <span style={{ marginRight: '10px' /* Use string */ }}>Plot:</span>
        <label style={{ marginRight: '10px', color: 'white' }}>
          <input
            type="radio"
            value="yvx"
            checked={plotType === 'yvx'}
            onChange={(e) => setPlotType(e.target.value)} // Use event target value
            style={{ marginRight: '4px' }} // Add spacing
          /> Y vs X
        </label>
        <label style={{ marginRight: '10px', color: 'white' }}>
          <input
            type="radio"
            value="xvt"
            checked={plotType === 'xvt'}
            onChange={(e) => setPlotType(e.target.value)}
            style={{ marginRight: '4px' }}
          /> X vs T
        </label>
        <label style={{ color: 'white' }}>
          <input
            type="radio"
            value="yvt"
            checked={plotType === 'yvt'}
            onChange={(e) => setPlotType(e.target.value)}
            style={{ marginRight: '4px' }}
          /> Y vs T
        </label>
        <br />
        <label style={{ color: 'white', marginTop: '5px', display: 'inline-block' }}>
          <input
            type="checkbox"
            checked={autoFit}
            onChange={() => setAutoFit(!autoFit)}
            style={{ marginRight: '4px', verticalAlign: 'middle' }} // Align checkbox
          /> Auto-Fit View
        </label>
      </div>
    </div>
  );
}

export default Graph;