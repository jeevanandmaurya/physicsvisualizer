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
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // Initialize Firestore
const auth = getAuth(app); // Initialize Auth

// Export the initialized services so you can use them in other components
export { app, analytics, db, auth,serverTimestamp };