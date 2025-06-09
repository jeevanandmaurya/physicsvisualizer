// src/contexts/AuthContext.jsx (UPDATED FOR NEW USER PROFILE)

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase-config'; // Import 'db' here!
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Import Firestore functions

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to create or update a basic user profile document in Firestore
  const createOrUpdateUserProfile = async (user) => {
    if (!user) return; // Ensure there's a user object

    const userProfileRef = doc(db, 'users', user.uid, 'profile', 'data');

    try {
      // Check if profile exists
      const docSnap = await getDoc(userProfileRef);

      if (!docSnap.exists()) {
        // Profile does not exist, create a new one
        console.log("Creating new user profile for:", user.uid);
        await setDoc(userProfileRef, {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          photoURL: user.photoURL || '',
          createdAt: new Date(), // Use Firestore Timestamp if preferred
        });
      } else {
        // Profile exists, you could potentially update it here if needed
        // For now, just log that it exists
        console.log("User profile already exists for:", user.uid);
        // If you want to update displayName/photoURL on subsequent logins:
        // await updateDoc(userProfileRef, {
        //   displayName: user.displayName || docSnap.data().displayName,
        //   photoURL: user.photoURL || docSnap.data().photoURL,
        //   lastLogin: new Date()
        // });
      }
    } catch (error) {
      console.error("Error creating/updating user profile:", error);
    }
  };

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // After successful sign-in, create or update the user's profile
      await createOrUpdateUserProfile(result.user);
      return result;
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error; // Re-throw to allow component to handle
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // If a user logs in (or is already logged in on refresh),
        // ensure their profile exists/is updated.
        await createOrUpdateUserProfile(user);
      }
      setLoading(false); // Auth state determined
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []); // Empty dependency array means this effect runs once on mount

  const value = {
    currentUser,
    loading,
    googleSignIn,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};