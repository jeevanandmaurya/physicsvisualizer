import { useState, useEffect, useMemo, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import '../../../shared/ui/components/Graph.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

// Type definitions
interface PositionData {
  t: number;
  x: number;
  y: number;
  z: number;
  vx?: number;
  vy?: number;
  vz?: number;
}

interface OverlayGraphProps {
  id: string;
  initialType: string;
  data: Record<string, PositionData[]>;
  onClose: (id: string) => void;
}

interface ChartLabels {
  title: string;
  xlabel: string;
  ylabel: string;
}

interface PlotDataPoint {
  x: number;
  y: number;
}


function OverlayGraph({ id, initialType, data, onClose }: OverlayGraphProps) {
  const chartRef = useRef(null); // Ref to access the chart instance directly
  const objectIds = useMemo(() => Object.keys(data), [data]);

  // --- STATE FOR USER CONTROLS (Managed by React) ---
  const [selectedObjectId, setSelectedObjectId] = useState(objectIds[0] || null);
  const [connectPoints, setConnectPoints] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [liveWindowSeconds, setLiveWindowSeconds] = useState(10);

  // --- DATA PROCESSING (Memoized) ---
  const { plotData, labels } = useMemo(() => {
    const objectLabel = selectedObjectId ? `Object ${selectedObjectId}` : 'Select Object';
    let newLabels;
    switch (initialType) {
      case 'yvt': newLabels = { title: `Y vs Time (${objectLabel})`, xlabel: 'Time (s)', ylabel: 'Y Position (m)' }; break;
      case 'xvt': newLabels = { title: `X vs Time (${objectLabel})`, xlabel: 'Time (s)', ylabel: 'X Position (m)' }; break;
      case 'zvt': newLabels = { title: `Z vs Time (${objectLabel})`, xlabel: 'Time (s)', ylabel: 'Z Position (m)' }; break;
      case 'yvx': newLabels = { title: `Y vs X (${objectLabel})`, xlabel: 'X Position (m)', ylabel: 'Y Position (m)' }; break;
      default: newLabels = { title: 'Graph', xlabel: 'X', ylabel: 'Y' };
    }
    if (!selectedObjectId || !data[selectedObjectId]) return { plotData: [], labels: newLabels };
    const history = data[selectedObjectId];
    
    let newPlotData: PlotDataPoint[] = [];
    // Correctly map data based on type
    if (initialType === 'yvx') {
        newPlotData = history.map(p => ({ x: p.x, y: p.y }));
    } else if (initialType === 'yvt') {
        newPlotData = history.map(p => ({ x: p.t, y: p.y }));
    } else if (initialType === 'xvt') {
        newPlotData = history.map(p => ({ x: p.t, y: p.x }));
    } else if (initialType === 'zvt') {
        newPlotData = history.map(p => ({ x: p.t, y: p.z }));
    }
    
    return { plotData: newPlotData, labels: newLabels };
  }, [selectedObjectId, data, initialType]);


  // --- EFFECT TO IMPERATIVELY UPDATE CHART ---
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

  // --- EFFECT FOR OBJECT CHANGE ---
  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
        chart.options.scales.x.min = null;
        chart.options.scales.x.max = null;
        chart.options.scales.y.min = null;
        chart.options.scales.y.max = null;
        
        // Update axis labels for the new object/graph type
        chart.options.scales.x.title.text = labels.xlabel;
        chart.options.scales.y.title.text = labels.ylabel;
        
        chart.update('none');
    }
    setIsLive(true);
  }, [selectedObjectId, labels]);


  // --- CHART OPTIONS (WITH TOOLTIP FIX) ---
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
      
      // --- TOOLTIP CONFIGURATION FIX ---
      tooltip: {
        enabled: true,
        mode: 'nearest',   // Find the single nearest point
        intersect: false,  // Trigger tooltip even if not directly on the point
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        callbacks: {
          // Custom label formatter for a cleaner look
          label: function(context) {
            const xVal = context.parsed.x.toFixed(3);
            const yVal = context.parsed.y.toFixed(3);
            return `(${labels.xlabel.split(' ')[0]}: ${xVal}, ${labels.ylabel.split(' ')[0]}: ${yVal})`;
          },
          // We don't need a title for a single point, so hide it
          title: function() {
            return null;
          }
        }
      },
      // --- END OF TOOLTIP FIX ---

      zoom: {
        pan: {
          enabled: true,
          mode: 'xy',
          onPanStart: () => { setIsLive(false); return true; },
        },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'xy',
          onZoomStart: () => { setIsLive(false); return true; },
        },
      },
    },
  }), [labels.xlabel, labels.ylabel]); // Only depends on labels now

  // --- CHART DATA (Static structure) ---
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


  return (
    <Rnd
      default={{ x: 20, y: 80, width: 550, height: 380 }}
      minWidth={380}
      minHeight={300}
      bounds="parent"
      className="overlay-graph"
      dragHandleClassName="graph-header"
    >
      <div className="graph-header">
        <span className="title-text">{labels.title}</span>
        <button onClick={() => onClose(id)} className="close-btn" aria-label="Close">×</button>
      </div>

      <div className="graph-content-wrapper">
        <div className="graph-controls">
          <select  value={selectedObjectId || ''} onChange={(e) => setSelectedObjectId(e.target.value)} disabled={objectIds.length === 0} aria-label="Select Object">
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
    </Rnd>
  );
}

export default OverlayGraph;
