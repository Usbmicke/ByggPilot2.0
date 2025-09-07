
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Importera getAuth
import { firebaseConfig } from "@/app/firebaseConfig";

// Undvik att initialisera appen flera gånger
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialisera och exportera tjänster
const db = getFirestore(app);
const auth = getAuth(app); // Initialisera Auth

export { db, auth }; // Exportera både db och auth
