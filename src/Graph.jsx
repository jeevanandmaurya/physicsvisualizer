import React, { useEffect, useRef, useState } from 'react';
import JXG from 'jsxgraph';
import './Graph.css';

function Graph({ data }) {
  const boardRef = useRef(null);
  const boardInstance = useRef(null);
  const [plotType, setPlotType] = useState('yvx');
  const [autoFit, setAutoFit] = useState(true);

  // Init board on mount
  useEffect(() => {
    if (!boardRef.current) return;
    
    const id = `jsxg-${Math.random().toString(36).slice(2)}`;
    boardRef.current.id = id;

    const board = JXG.JSXGraph.initBoard(id, {
      boundingbox: [-10, 10, 10, -10],
      axis: true,
      showNavigation: true,
      showCopyright: false,
      // Fix trackpad panning - separate mouse wheel zoom from trackpad panning
      pan: {
        enabled: true,
        // needTwoFingers: true, // Enable two-finger trackpad panning
        needShift: false      // Don't require shift key for panning
      },
      zoom: {
        enabled: true,
        wheel: true,
        needShift: false,     // Don't require shift key for zooming
        // pinchHorizontal: true,// Enable pinch zoom on trackpad
        // pinchVertical: true   // Enable pinch zoom on trackpad
      },
      keepaspectratio: true,
      grid: {
        visible: true,
        gridX: 2,
        gridY: 2,
        strokeColor: '#888',
        strokeWidth: 0.5
      },
      backgroundColor: 'white'
    });

    // Helper to create an axis with consistent dark style
    const createAxis = (board, direction, color = 'black') => {
      const point = direction === 'x' ? [[0, 0], [1, 0]] : [[0, 0], [0, 1]];
      return board.create('axis', point, {
        strokeColor: color,
        strokeWidth: 2,
        ticks: {
          drawLabels: true,
          strokeColor: color,
          strokeWidth: 1,
          label: { fontSize: 10, color: '#333' },
          ticksDistance: 2,
          insertTicks: false
        },
      });
    };

    // Create axes
    board.xAxis = createAxis(board, 'x');
    board.yAxis = createAxis(board, 'y');

    boardInstance.current = board;

    return () => {
      if (board) {
        JXG.JSXGraph.freeBoard(board);
      }
    };
  }, []);

  // Update plot
  useEffect(() => {
    const board = boardInstance.current;
    if (!board || !data) return;

    // Remove previous plot elements
    board.objectsList.forEach(obj => {
      if (obj.elType === 'curve' || obj.elType === 'point') {
        board.removeObject(obj);
      }
    });

    board.suspendUpdate();

    const xKey = plotType === 'xvt' ? 't' : 'x';
    const yKey = plotType === 'yvt' ? 'y' : plotType === 'xvt' ? 'x' : 'y';

    let allX = [], allY = [];

    Object.values(data || {}).forEach((history, i) => {
      if (!history || history.length === 0) return;
      
      const xData = history.map(p => p[xKey]);
      const yData = history.map(p => p[yKey]);

      if (xData.length > 0 && yData.length > 0) {
        board.create('curve', [xData, yData], {
          strokeColor: ['#1f77b4', '#ff7f0e'][i % 2],
          strokeWidth: 2,
        });

        board.create('point', [xData[xData.length - 1], yData[yData.length - 1]], {
          size: 3,
          color: ['#1f77b4', '#ff7f0e'][i % 2],
          fixed: true,
          name: '',
        });

        allX.push(...xData);
        allY.push(...yData);
      }
    });

    if (autoFit && allX.length && allY.length) {
      const minX = Math.min(...allX), maxX = Math.max(...allX);
      const minY = Math.min(...allY), maxY = Math.max(...allY);
      
      // Calculate proper padding for both axes
      const padX = Math.max((maxX - minX) * 0.1, 1);
      const padY = Math.max((maxY - minY) * 0.1, 1);
      
      // Ensure minimum viewing window size to prevent extreme zoom
      const xRange = Math.max(maxX - minX + 2 * padX, 2);
      const yRange = Math.max(maxY - minY + 2 * padY, 2);
      
      // Calculate center points
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      
      // Set bounding box maintaining aspect ratio
      // Create a square view that contains all data points
      const maxRange = Math.max(xRange, yRange);
      board.setBoundingBox([
        centerX - maxRange/2, 
        centerY + maxRange/2, 
        centerX + maxRange/2, 
        centerY - maxRange/2
      ], true);
    }

    board.unsuspendUpdate();
  }, [data, plotType, autoFit]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (boardInstance.current) {
        boardInstance.current.resizeContainer(
          boardRef.current.clientWidth,
          boardRef.current.clientHeight
        );
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div ref={boardRef} style={{ flex: 1, border: '1px solid #ccc', backgroundColor: 'white' }} />
      <div style={{ padding: '8px', backgroundColor: '#2a2a2a', color: 'white', fontSize: 14 }}>
        <span style={{ marginRight: 10 }}>Plot:</span>
        <label style={{ marginRight: 10, color: 'white' }}>
          <input 
            type="radio" 
            value="yvx" 
            checked={plotType === 'yvx'} 
            onChange={() => setPlotType('yvx')} 
          /> Y vs X
        </label>
        <label style={{ marginRight: 10, color: 'white' }}>
          <input 
            type="radio" 
            value="xvt" 
            checked={plotType === 'xvt'} 
            onChange={() => setPlotType('xvt')} 
          /> X vs T
        </label>
        <label style={{ color: 'white' }}>
          <input 
            type="radio" 
            value="yvt" 
            checked={plotType === 'yvt'} 
            onChange={() => setPlotType('yvt')} 
          /> Y vs T
        </label>
        <br/>
        <label style={{ color: 'white' }}>
          <input 
            type="checkbox" 
            checked={autoFit} 
            onChange={() => setAutoFit(!autoFit)} 
          /> Auto-Fit View
        </label>
      </div>
    </div>
  );
}

export default Graph;