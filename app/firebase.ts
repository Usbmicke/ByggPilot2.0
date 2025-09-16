// Rättad fil: app/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <-- IMPORTERA FIRESTORE
import { firebaseConfig } from "@/app/firebaseConfig";

// Undvik åter-initialisering på serversidan
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const firestore = getFirestore(app); // <-- INITIERA FIRESTORE

// Exportera allt som behövs
export { app, auth, firestore }; // <-- EXPORTERA FIRESTORE
