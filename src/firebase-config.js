// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore,serverTimestamp } from "firebase/firestore"; // Import Firestore service
import { getAuth } from "firebase/auth"; // Import Auth service

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDdkh8AQ0J9STZ93mCxiBebZBssgyDAyM",
  authDomain: "physicsvisualizer.firebaseapp.com",
  projectId: "physicsvisualizer",
  storageBucket: "physicsvisualizer.firebasestorage.app",
  messagingSenderId: "404618393085",
  appId: "1:404618393085:web:1ddc35418dc2886ff09594",
  measurementId: "G-NFG62PELZF"

  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // Initialize Firestore
const auth = getAuth(app); // Initialize Auth

// Export the initialized services so you can use them in other components
export { app, analytics, db, auth,serverTimestamp };