// src/usePhysicsSync.js
import { useState, useCallback } from 'react';

function usePhysicsSync() {
  const [positionData, setPositionData] = useState([]);

  const updatePosition = useCallback((data) => {
    setPositionData(prev => {
      const newData = [...prev, data].slice(-100); // Limit to 100 points
      return newData;
    });
  }, []);

  const resetData = useCallback(() => {
    setPositionData([]);
  }, []);

  return { positionData, updatePosition, resetData };
}

export default usePhysicsSync;