// scripts/seed.js
// Run this file ONCE to populate Firestore with demo UTAS data.

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { seedFirestore } from "../src/lib/storage.js"; 

// -------------------
// Your Firebase config
// -------------------
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
const db = getFirestore(app);

// Create global db, because storage.js imports it
global.db = db;

// Run seed
(async () => {
  console.log("Seeding Firestore...");

  try {
    await seedFirestore();
    console.log("✔ Firestore seeded successfully!");
  } catch (err) {
    console.error("❌ Error seeding Firestore:", err);
  }

  process.exit();
})();
