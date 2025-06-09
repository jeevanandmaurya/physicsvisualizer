// src/contexts/DatabaseContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { db } from '../firebase-config'; // Your Firestore instance
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc, limit, orderBy } from 'firebase/firestore';
import { useAuth } from './AuthContext'; // To get the current user

const DatabaseContext = createContext();

export function useDatabase() {
  return useContext(DatabaseContext);
}

export function DatabaseProvider({ children }) {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Function to get a document from a user's specific collection
  const getUserDocument = useCallback(async (collectionName, documentId) => {
    if (!currentUser) return null;
    const docRef = doc(db, 'users', currentUser.uid, collectionName, documentId);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.log(`Document ${documentId} in ${collectionName} for user ${currentUser.uid} does not exist.`);
        return null;
      }
    } catch (error) {
      console.error("Error getting user document:", error);
      throw error; // Propagate error
    }
  }, [currentUser]);

  // Function to set/create a document in a user's specific collection
  const setUserDocument = useCallback(async (collectionName, documentId, data) => {
    if (!currentUser) throw new Error("No authenticated user to set document.");
    const docRef = doc(db, 'users', currentUser.uid, collectionName, documentId);
    try {
      await setDoc(docRef, data, { merge: true });
      console.log("Document successfully written/updated!");
      return true;
    } catch (error) {
      console.error("Error setting user document:", error);
      throw error;
    }
  }, [currentUser]);

  // Function to update fields in an existing document
  const updateUserDocument = useCallback(async (collectionName, documentId, data) => {
    if (!currentUser) throw new Error("No authenticated user to update document.");
    const docRef = doc(db, 'users', currentUser.uid, collectionName, documentId);
    try {
      await updateDoc(docRef, data);
      console.log("Document successfully updated!");
      return true;
    } catch (error) {
      console.error("Error updating user document:", error);
      throw error;
    }
  }, [currentUser]);

  // Function to query a user's specific sub-collection
  const queryUserCollection = useCallback(async (collectionName, conditions = [], order = null, limitTo = null) => {
    if (!currentUser) return []; // Return empty array if no user
    const qRef = collection(db, 'users', currentUser.uid, collectionName);
    let q = qRef;
    conditions.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });
    if (order) {
        q = query(q, orderBy(order.field, order.direction));
    }
    if (limitTo) {
        q = query(q, limit(limitTo));
    }

    try {
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      return data;
    } catch (error) {
      console.error("Error querying user collection:", error);
      throw error; // Re-throw to allow component to catch and set local error state
    }
  }, [currentUser]);

  // NEW: Function to query a public collection (not user-specific path)
  const queryPublicCollection = useCallback(async (collectionName, conditions = [], limitTo = null, order = null) => {
    const qRef = collection(db, collectionName);
    let q = qRef;
    conditions.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });
    if (order) {
        q = query(q, orderBy(order.field, order.direction));
    }
    if (limitTo) {
        q = query(q, limit(limitTo));
    }

    try {
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      return data;
    } catch (error) {
      console.error("Error querying public collection:", error);
      throw error; // Re-throw to allow component to catch and set local error state
    }
  }, []); // This does NOT depend on currentUser, as it's public

  // Function to delete a document from a user's specific collection
  const deleteUserDocument = useCallback(async (collectionName, documentId) => {
    if (!currentUser) throw new Error("No authenticated user to delete document.");
    const docRef = doc(db, 'users', currentUser.uid, collectionName, documentId);
    try {
      await deleteDoc(docRef);
      console.log("Document successfully deleted!");
      return true;
    } catch (error) {
      console.error("Error deleting user document:", error);
      throw error;
    }
  }, [currentUser]);

  // Example: Fetch user profile data when currentUser changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoadingProfile(true);
      if (currentUser) {
        // Fetch user profile (assuming it's a document 'data' in subcollection 'profile' under the user doc)
        const profile = await getUserDocument('profile', 'data');
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoadingProfile(false);
    };

    fetchUserProfile();
    // Re-run if currentUser or getUserDocument (which is memoized with useCallback) changes
  }, [currentUser, getUserDocument]);

  const value = {
    userProfile,
    loadingProfile,
    getUserDocument,
    setUserDocument,
    updateUserDocument,
    queryUserCollection,
    queryPublicCollection, // Make sure this is exposed
    deleteUserDocument,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}