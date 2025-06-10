import React, { createContext, useContext, useCallback } from 'react';
import { db, serverTimestamp } from '../firebase-config';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc, limit, orderBy, addDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
// NOTE: Path updated from scenes.js to data.js as per refactor plan
import { mechanicsExamples } from '../scenes.js'; 

const DatabaseContext = createContext();

export function useDatabase() {
  return useContext(DatabaseContext);
}

export function DatabaseProvider({ children }) {
  const { currentUser } = useAuth();

  // --- LOW-LEVEL FIRESTORE HELPERS (kept internal) ---
  const getDocument = async (collectionPath, docId) => {
    const docRef = doc(db, collectionPath, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  };

  const queryCollection = async (collectionPath, conditions = [], order = null, limitTo = null) => {
    let q = query(collection(db, collectionPath));
    conditions.forEach(c => { q = query(q, where(c.field, c.operator, c.value)); });
    if (order) { q = query(q, orderBy(order.field, order.direction)); }
    if (limitTo) { q = query(q, limit(limitTo)); }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  // --- DATA MANAGER API ---

  /**
   * Fetches scenes from various sources based on type.
   */
  const getScenes = useCallback(async (type, options = {}) => {
    switch (type) {
      case 'user':
        if (!currentUser) return [];
        const userPath = `users/${currentUser.uid}/scenes`;
        const finalUserConditions = [{ field: 'authorId', operator: '==', value: currentUser.uid }, ...(options.conditions || [])];
        return queryCollection(userPath, finalUserConditions, options.orderBy, options.limitTo);

      case 'public':
        return queryCollection('public_scenes', options.conditions, options.orderBy, options.limitTo);

      case 'examples':
        return Promise.resolve(mechanicsExamples);

      default:
        console.error(`Unknown scene type: ${type}`);
        return Promise.resolve([]);
    }
  }, [currentUser]);

  /**
   * Fetches a single scene by its ID.
   */
  const getSceneById = useCallback(async (sceneId, isPublic = false) => {
    if (isPublic) {
      return getDocument('public_scenes', sceneId);
    }
    if (!currentUser) return null;
    return getDocument(`users/${currentUser.uid}/scenes`, sceneId);
  }, [currentUser]);

  /**
   * Saves or updates a scene to the user's collection.
   */
  const saveScene = useCallback(async (sceneObject) => {
    if (!currentUser) throw new Error("Authentication required to save scenes.");
    
    // Remove temporary client-side flags before saving
    const { isExtracted, isTemporary, ...dataToSave } = sceneObject;

    const sceneData = {
      ...dataToSave,
      authorId: currentUser.uid,
      authorName: currentUser.displayName || 'Anonymous',
      updatedAt: serverTimestamp(),
    };

    const collectionRef = collection(db, `users/${currentUser.uid}/scenes`);

    if (!sceneObject.id || sceneObject.id.startsWith('new-') || sceneObject.id.startsWith('extracted-')) {
        sceneData.createdAt = serverTimestamp();
        const docRef = await addDoc(collectionRef, sceneData);
        return docRef.id;
    } else {
        const docRef = doc(db, `users/${currentUser.uid}/scenes`, sceneObject.id);
        await setDoc(docRef, sceneData, { merge: true });
        return sceneObject.id;
    }
  }, [currentUser]);

  /**
   * Deletes a scene from the user's collection.
   */
  const deleteScene = useCallback(async (sceneId) => {
    if (!currentUser) throw new Error("Authentication required to delete scenes.");
    if (!sceneId) throw new Error("Scene ID is required for deletion.");
    const docRef = doc(db, `users/${currentUser.uid}/scenes`, sceneId);
    await deleteDoc(docRef);
  }, [currentUser]);

  /**
   * Fetches the entire chat history for the current user.
   */
  const getChatHistory = useCallback(async () => {
    if (!currentUser) return [];
    const historyDoc = await getDocument(`users/${currentUser.uid}/chat`, 'history');
    return historyDoc?.messages || [];
  }, [currentUser]);

  /**
   * Overwrites the entire chat history for the current user.
   */
  const saveChatHistory = useCallback(async (history) => {
    if (!currentUser) throw new Error("Authentication required to save chat history.");
    const docRef = doc(db, `users/${currentUser.uid}/chat`, 'history');
    await setDoc(docRef, { messages: history });
  }, [currentUser]);

  /**
   * Logs that a user has viewed a scene by saving it to localStorage.
   * The list is capped at 10 items.
   * @param {string} sceneId - The ID of the viewed scene.
   * @param {string} sceneName - The name of the viewed scene.
   * @param {boolean} isPublic - Whether the scene is public.
   */
  const logSceneView = useCallback((sceneId, sceneName, isPublic) => {
    if (!sceneId || !sceneName) return;
    try {
      const recentScenes = JSON.parse(localStorage.getItem('recentScenes') || '[]');
      const filteredScenes = recentScenes.filter(s => s.id !== sceneId);
      const newRecent = [{ id: sceneId, name: sceneName, isPublic, viewedAt: new Date().toISOString() }, ...filteredScenes];
      const limitedRecent = newRecent.slice(0, 10);
      localStorage.setItem('recentScenes', JSON.stringify(limitedRecent));
    } catch (error) {
      console.error("Could not update recent scenes in localStorage:", error);
    }
  }, []);

  /**
   * Gets the list of recently viewed scenes from localStorage.
   * @returns {Array} An array of up to 10 recently viewed scene objects.
   */
  const getRecentScenes = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('recentScenes') || '[]');
    } catch (error) {
      console.error("Could not retrieve recent scenes from localStorage:", error);
      return [];
    }
  }, []);

  // The public API provided by the context
  const value = {
    // Scene Management
    getScenes,
    getSceneById,
    saveScene,
    deleteScene,

    // Chat Management
    getChatHistory,
    saveChatHistory,
    
    // Recently Viewed Management
    logSceneView,
    getRecentScenes,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}