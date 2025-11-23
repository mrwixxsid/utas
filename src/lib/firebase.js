// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_x3ituXmpyl2VfUp7EMQaAYowfEDojDI",
  authDomain: "university-routine-management.firebaseapp.com",
  projectId: "university-routine-management",
  storageBucket: "university-routine-management.firebasestorage.app",
  messagingSenderId: "397061334202",
  appId: "1:397061334202:web:c76696f958339139d58e83",
  measurementId: "G-EMQPKENR0G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ❗ REMOVE analytics — Node cannot run it
// const analytics = getAnalytics(app);

export const db = getFirestore(app);
