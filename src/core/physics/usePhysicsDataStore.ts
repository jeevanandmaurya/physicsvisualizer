/**
 * React hook to subscribe to PhysicsDataStore
 * Provides efficient access to physics data without causing re-renders
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { physicsDataStore } from './PhysicsDataStore';

/**
 * Subscribe to current physics data (position/velocity)
 * Updates UI at throttled rate (default: 10 FPS)
 */
export function usePhysicsData() {
  const [data, setData] = useState(physicsDataStore.getSnapshot());

  useEffect(() => {
    const unsubscribe = physicsDataStore.subscribeToData((snapshot) => {
      setData(snapshot);
    });

    return unsubscribe;
  }, []);

  return data;
}

/**
 * Subscribe to object history (for graphs)
 * Updates at throttled rate (default: 2 FPS)
 */
export function usePhysicsHistory() {
  const [history, setHistory] = useState(physicsDataStore.getHistory());

  useEffect(() => {
    const unsubscribe = physicsDataStore.subscribeToHistory((hist) => {
      setHistory(hist);
    });

    return unsubscribe;
  }, []);

  return history;
}

/**
 * Get history for specific object (optimized, no re-renders)
 */
export function useObjectHistory(objectId: string) {
  const [history, setHistory] = useState(() => 
    physicsDataStore.getHistory(objectId) as any[]
  );

  useEffect(() => {
    const unsubscribe = physicsDataStore.subscribeToHistory((allHistory) => {
      setHistory(allHistory[objectId] || []);
    });

    return unsubscribe;
  }, [objectId]);

  return history;
}

/**
 * Direct access to store without subscribing (for one-time reads)
 */
export function usePhysicsDataStore() {
  const getSnapshot = useCallback(() => {
    return physicsDataStore.getSnapshot();
  }, []);

  const getHistory = useCallback((objectId?: string) => {
    return physicsDataStore.getHistory(objectId);
  }, []);

  const getObjectIds = useCallback(() => {
    return physicsDataStore.getObjectIds();
  }, []);

  return {
    getSnapshot,
    getHistory,
    getObjectIds,
    store: physicsDataStore
  };
}

/**
 * Hook for imperative access (doesn't trigger re-renders)
 * Use this in performance-critical components
 */
export function usePhysicsDataRef() {
  const dataRef = useRef(physicsDataStore.getSnapshot());
  const historyRef = useRef(physicsDataStore.getHistory());

  useEffect(() => {
    const dataUnsub = physicsDataStore.subscribeToData((snapshot) => {
      dataRef.current = snapshot;
    });

    const historyUnsub = physicsDataStore.subscribeToHistory((hist) => {
      historyRef.current = hist;
    });

    return () => {
      dataUnsub();
      historyUnsub();
    };
  }, []);

  return { dataRef, historyRef };
}
