import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDssTI-PTsoWfgxmwvRCwCYfD9B4ye51GpQ",
  authDomain: "litz-41c00.firebaseapp.com",
  projectId: "litz-41c00",
  storageBucket: "litz-41c00.firebasestorage.app",
  messagingSenderId: "1046829843839",
  appId: "1:1046829843839:web:7b11419ca36c039c7b064a",
  measurementId: "G-4C5P8YYEQ5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (THIS IS THE DATABASE)
const db = getFirestore(app);

export { db };