import React, { useEffect, useRef } from 'react';
import JXG from 'jsxgraph';
import './Graph.css';

function Graph({ data }) {
  const boardRef = useRef(null);
  const boardInstance = useRef(null);
  const graphObjects = useRef({});

  // Initialize the JSXGraph board once
  useEffect(() => {
    console.log('Initializing JSXGraph board...');
    try {
      boardInstance.current = JXG.JSXGraph.initBoard(boardRef.current, {
        boundingbox: [-15, 15, 15, -15], // Initial bounds, will adjust dynamically
        axis: true,
        showCopyright: false,
        showNavigation: true,
        pan: { enabled: true, needShift: false },
        zoom: { enabled: true, wheel: true, needShift: false, min: 0.1, max: 10 },
        keepaspectratio: false,
      });
      console.log('Board initialized successfully:', boardInstance.current);

      boardInstance.current.create('text', [5, 14, 'Physics Graphs'], {
        fontSize: 16,
        fixed: true,
      });
    } catch (error) {
      console.error('Board initialization failed:', error);
    }

    return () => {
      if (boardInstance.current) {
        JXG.JSXGraph.freeBoard(boardInstance.current);
        boardInstance.current = null;
      }
    };
  }, []);

  // Update all graphs when data changes
  useEffect(() => {
    console.log('Graph data received:', data);
    if (!boardInstance.current) {
      console.log('No board instance');
      return;
    }

    // Clear previous points and curves
    if (graphObjects.current.points) {
      graphObjects.current.points.forEach(point => {
        boardInstance.current.removeObject(point);
      });
    }
    if (graphObjects.current.xy) {
      boardInstance.current.removeObject(graphObjects.current.xy);
    }
    if (graphObjects.current.xt) {
      boardInstance.current.removeObject(graphObjects.current.xt);
    }
    if (graphObjects.current.yt) {
      boardInstance.current.removeObject(graphObjects.current.yt);
    }

    // Plot points for Y vs X (blue)
    graphObjects.current.points = data.map((point, index) =>
      boardInstance.current.create('point', [point.x, point.y], {
        size: 2,
        strokeColor: 'blue',
        fillColor: 'blue',
        name: ``,
      })
    );

    // Draw curves if enough data
    if (data.length >= 2) {
      // Y vs X (blue)
      graphObjects.current.xy = boardInstance.current.create('curve', [
        data.map(point => point.x),
        data.map(point => point.y),
      ], {
        strokeColor: 'blue',
        strokeWidth: 2,
        name: 'Y vs X',
      });

      // // X vs T (red)
      // graphObjects.current.xt = boardInstance.current.create('curve', [
      //   data.map(point => point.t),
      //   data.map(point => point.x),
      // ], {
      //   strokeColor: 'red',
      //   strokeWidth: 2,
      //   name: 'X vs T',
      // });

      // Y vs T (green)
      graphObjects.current.yt = boardInstance.current.create('curve', [
        data.map(point => point.t),
        data.map(point => point.y),
      ], {
        strokeColor: 'green',
        strokeWidth: 2,
        name: 'Y vs T',
      });

      console.log('Curves created: Y vs X (blue), X vs T (red), Y vs T (green)');
    } else {
      console.log('Not enough points for curves, showing Y vs X points');
    }

    // Adjust bounds to fit all data
    if (data.length > 0) {
      const xMax = Math.max(...data.map(p => p.x), 1) * 1.1;
      const yMax = Math.max(...data.map(p => p.y), 1) * 1.1;
      const tMax = Math.max(...data.map(p => p.t), 1) * 1.1;
      const xMin = Math.min(...data.map(p => p.x), -1) * 1.1;
      const yMin = Math.min(...data.map(p => p.y), -1) * 1.1;
      const tMin = Math.min(...data.map(p => p.t), 0) * 1.1;

      // Use the largest range needed for X-axis (tMax for X vs T, Y vs T; xMax for Y vs X)
      const xAxisMax = Math.max(tMax, xMax);
      const xAxisMin = Math.min(tMin, xMin);
      const yAxisMax = Math.max(yMax, xMax); // X vs T uses X as Y-axis
      const yAxisMin = Math.min(yMin, xMin);

      const currentBounds = boardInstance.current.getBoundingBox();
      if (
        xAxisMax > currentBounds[2] || yAxisMax > currentBounds[1] ||
        xAxisMin < currentBounds[0] || yAxisMin < currentBounds[3]
      ) {
        boardInstance.current.setBoundingBox([xAxisMin, yAxisMax, xAxisMax, yAxisMin], false);
        console.log('Bounds adjusted:', [xAxisMin, yAxisMax, xAxisMax, yAxisMin]);
      }
    }
  }, [data]);

  return (
    <div className="graph-container" style={{ width: '100%', height: '100%' }}>
      <div
        ref={boardRef}
        style={{ width: '100%', height: '100%', border: '1px solid red' }}
        id="jsxgraph-board"
      />
    </div>
  );
}

export default Graph;