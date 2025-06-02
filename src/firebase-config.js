// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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