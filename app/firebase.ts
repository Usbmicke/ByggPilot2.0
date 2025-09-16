// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "@/app/firebaseConfig"; // Importera konfigurationen

// Initialize Firebase
// Vi kollar om en app redan har initierats för att undvika fel under Next.js hot-reloading.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Hämta och exportera auth-objektet från den initierade appen
const auth = getAuth(app);

// Exportera de objekt vi behöver i resten av applikationen
export { app, auth };
