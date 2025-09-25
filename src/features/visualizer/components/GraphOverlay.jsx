import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Rnd } from 'react-rnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { useTheme } from '../../../contexts/ThemeContext';
import './GraphOverlay.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

function GraphOverlay({ isOpen, onToggle }) {
  const { openGraphs, removeGraph, objectHistory } = useWorkspace();
  const chartRef = useRef(null);

  if (!isOpen) return null;

  return (
    <>
      {openGraphs.map((graphConfig, index) => (
        <OverlayGraph
          key={graphConfig.id}
          id={graphConfig.id}
          initialType={graphConfig.initialType}
          data={objectHistory}
          onClose={removeGraph}
          initialPosition={{ x: 20 + index * 30, y: 80 + index * 30 }}
        />
      ))}
    </>
  );
}

function OverlayGraph({ id, initialType, data, onClose }) {
  const { overlayOpacity } = useTheme();
  const chartRef = useRef(null);
  const objectIds = Object.keys(data);

  // --- STATE FOR USER CONTROLS ---
  const [selectedObjectId, setSelectedObjectId] = useState(objectIds[0] || null);
  const [connectPoints, setConnectPoints] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [liveWindowSeconds, setLiveWindowSeconds] = useState(10);

  // Minimize state (similar to ChatOverlay)
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [size, setSize] = useState({ width: 550, height: 380 });
  const [previousPosition, setPreviousPosition] = useState({ x: 20, y: 80 });
  const [previousSize, setPreviousSize] = useState({ width: 550, height: 380 });

  // --- DATA PROCESSING ---
  const { plotData, labels } = useMemo(() => {
    const objectLabel = selectedObjectId ? `Object ${selectedObjectId}` : 'Select Object';
    let newLabels;
    switch (initialType) {
      case 'position':
      case 'yvt': newLabels = { title: `Y vs Time (${objectLabel})`, xlabel: 'Time (s)', ylabel: 'Y Position (m)' }; break;
      case 'xvt': newLabels = { title: `X vs Time (${objectLabel})`, xlabel: 'Time (s)', ylabel: 'X Position (m)' }; break;
      case 'zvt': newLabels = { title: `Z vs Time (${objectLabel})`, xlabel: 'Time (s)', ylabel: 'Z Position (m)' }; break;
      case 'yvx': newLabels = { title: `Y vs X (${objectLabel})`, xlabel: 'X Position (m)', ylabel: 'Y Position (m)' }; break;
      case 'velocity': newLabels = { title: `Velocity vs Time (${objectLabel})`, xlabel: 'Time (s)', ylabel: 'Velocity (m/s)' }; break;
      case 'acceleration': newLabels = { title: `Acceleration vs Time (${objectLabel})`, xlabel: 'Time (s)', ylabel: 'Acceleration (m/s²)' }; break;
      case 'energy': newLabels = { title: `Energy vs Time (${objectLabel})`, xlabel: 'Time (s)', ylabel: 'Energy (J)' }; break;
      default: newLabels = { title: 'Graph', xlabel: 'X', ylabel: 'Y' };
    }
    if (!selectedObjectId || !data[selectedObjectId]) return { plotData: [], labels: newLabels };
    const history = data[selectedObjectId];

    let newPlotData = [];
    switch (initialType) {
      case 'position':
      case 'yvt':
        newPlotData = history.map(p => ({ x: p.t, y: p.y }));
        break;
      case 'xvt':
        newPlotData = history.map(p => ({ x: p.t, y: p.x }));
        break;
      case 'zvt':
        newPlotData = history.map(p => ({ x: p.t, y: p.z }));
        break;
      case 'yvx':
        newPlotData = history.map(p => ({ x: p.x, y: p.y }));
        break;
      case 'velocity':
        // Calculate velocity from position data
        newPlotData = history.slice(1).map((p, i) => {
          const prev = history[i];
          const dt = p.t - prev.t;
          if (dt > 0) {
            const vx = (p.x - prev.x) / dt;
            const vy = (p.y - prev.y) / dt;
            const vz = (p.z - prev.z) / dt;
            const speed = Math.sqrt(vx*vx + vy*vy + vz*vz);
            return { x: p.t, y: speed };
          }
          return { x: p.t, y: 0 };
        });
        break;
      case 'acceleration':
        // Calculate acceleration from velocity data (simplified)
        newPlotData = history.slice(2).map((p, i) => {
          const prev1 = history[i];
          const prev2 = history[i+1];
          const dt1 = p.t - prev2.t;
          const dt2 = prev2.t - prev1.t;
          if (dt1 > 0 && dt2 > 0) {
            // This is a simplified calculation - would need proper velocity calculation first
            return { x: p.t, y: 0 }; // Placeholder
          }
          return { x: p.t, y: 0 };
        });
        break;
      case 'energy':
        // Calculate kinetic energy (simplified - assumes mass = 1)
        newPlotData = history.map(p => {
          const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy + p.vz*p.vz) || 0;
          const kineticEnergy = 0.5 * 1 * speed * speed; // 1/2 * m * v^2
          return { x: p.t, y: kineticEnergy };
        });
        break;
    }

    return { plotData: newPlotData, labels: newLabels };
  }, [selectedObjectId, data, initialType]);

  // --- CHART UPDATE EFFECT ---
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    chart.data.datasets[0].data = plotData;
    chart.data.datasets[0].showLine = connectPoints;

    if (isLive && initialType !== 'yvx' && plotData.length > 0) {
      const lastTime = plotData[plotData.length - 1].x;
      const newXMin = lastTime - liveWindowSeconds;
      const newXMax = lastTime;

      chart.options.scales.x.min = newXMin;
      chart.options.scales.x.max = newXMax;
    }

    chart.update('none');
  }, [plotData, connectPoints, isLive, liveWindowSeconds, initialType]);

  // --- OBJECT CHANGE EFFECT ---
  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      chart.options.scales.x.min = null;
      chart.options.scales.x.max = null;
      chart.options.scales.y.min = null;
      chart.options.scales.y.max = null;
      chart.options.scales.x.title.text = labels.xlabel;
      chart.options.scales.y.title.text = labels.ylabel;
      chart.update('none');
    }
    setIsLive(true);
  }, [selectedObjectId, labels]);

  // --- CHART OPTIONS ---
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: {
      x: {
        title: { display: true, text: labels.xlabel, color: '#9ca3af' },
        ticks: { color: '#9ca3af', font: { size: 10 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        title: { display: true, text: labels.ylabel, color: '#9ca3af' },
        ticks: { color: '#9ca3af', font: { size: 10 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        callbacks: {
          label: function(context) {
            const xVal = context.parsed.x.toFixed(3);
            const yVal = context.parsed.y.toFixed(3);
            return `(${labels.xlabel.split(' ')[0]}: ${xVal}, ${labels.ylabel.split(' ')[0]}: ${yVal})`;
          },
          title: function() { return null; }
        }
      },
      zoom: {
        pan: { enabled: true, mode: 'xy' },
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'xy' },
      },
    },
  }), [labels.xlabel, labels.ylabel]);

  const initialChartData = useMemo(() => ({
    datasets: [{
      data: [],
      borderColor: '#3b82f6',
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#3b82f6',
      pointRadius: 2,
      pointHoverRadius: 5,
    }],
  }), []);

  const handleGoLive = () => {
    setIsLive(true);
    const chart = chartRef.current;
    if (chart) {
      chart.options.scales.y.min = null;
      chart.options.scales.y.max = null;
    }
  };

  // Minimize handler
  const handleMinimize = () => {
    if (isMinimized) {
      // Maximize: restore previous
      setPosition(previousPosition);
      setSize(previousSize);
      setIsMinimized(false);
    } else {
      // Minimize: save current, set compact
      setPreviousPosition(position);
      setPreviousSize(size);
      setPosition({
        x: (window.innerWidth - 200) / 2, // Centered horizontally
        y: window.innerHeight - 80 // Above status bar
      });
      setSize({ width: 200, height: 40 });
      setIsMinimized(true);
    }
  };

  // Escape key to close (like Chat)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose(id);
      }
    };
    if (!isMinimized) { // Only when open/full
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMinimized, id, onClose]);

  // Initial position (like Chat, but per graph index if needed)
  useEffect(() => {
    const centerX = Math.max(48, (window.innerWidth - 550) / 2);
    const centerY = Math.max(0, (window.innerHeight - 380 - 40) / 2);
    setPosition({ x: centerX, y: centerY });
    setPreviousPosition({ x: centerX, y: centerY });
  }, []);

  // Rnd drag/resize callbacks
  const handleDragStop = useCallback((e, data) => {
    setPosition({ x: data.x, y: data.y });
  }, []);

  const handleResizeStop = useCallback((e, dir, ref, delta, positionDelta) => {
    setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
    if (positionDelta) {
      setPosition({ x: positionDelta.x, y: positionDelta.y });
    }
  }, []);

  return (
    <Rnd
      position={position}
      size={size}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      minWidth={380}
      minHeight={isMinimized ? 40 : 300}
      bounds="parent"
      className={`overlay-graph ${isMinimized ? 'minimized' : ''}`}
      dragHandleClassName="graph-header"
      style={{ '--graph-bg-opacity': overlayOpacity.graph }}
    >
        <div className="graph-header">
          <span className="title-text">{labels.title}</span>
          <div className="graph-header-controls">
            <button
              className="minimize-btn"
              onClick={handleMinimize}
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              <FontAwesomeIcon icon={isMinimized ? faChevronUp : faChevronDown} />
            </button>
            <button onClick={() => onClose(id)} className="close-btn" aria-label="Close">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="graph-content-wrapper">
            <div className="graph-controls">
              <select value={selectedObjectId || ''} onChange={(e) => setSelectedObjectId(e.target.value)} disabled={objectIds.length === 0} aria-label="Select Object">
                <option value="" disabled>{objectIds.length === 0 ? 'No objects' : 'Select Object'}</option>
                {objectIds.map(objId => <option key={objId} value={objId}>{`Object ${objId}`}</option>)}
              </select>
              <label>
                <input type="checkbox" checked={connectPoints} onChange={(e) => setConnectPoints(e.target.checked)} />
                Connect Points
              </label>
              {initialType !== 'yvx' && (
                <div className="live-controls">
                  <span className={`live-indicator ${isLive ? 'active' : ''}`} title={isLive ? 'Live' : 'Paused'}></span>
                  <button onClick={handleGoLive} disabled={isLive}>Go Live</button>
                  <select value={liveWindowSeconds} onChange={(e) => setLiveWindowSeconds(Number(e.target.value))} aria-label="Live Window Size">
                    <option value={5}>5s</option>
                    <option value={10}>10s</option>
                    <option value={30}>30s</option>
                    <option value={60}>60s</option>
                  </select>
                </div>
              )}
            </div>

            <div className="chart-area-wrapper">
              <Scatter ref={chartRef} data={initialChartData} options={chartOptions} />
            </div>
          </div>
        )}
      </Rnd>
  );
}

export default GraphOverlay;
