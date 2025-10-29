
import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let firestoreAdmin: admin.firestore.Firestore;
let auth: admin.auth.Auth;

console.log("[Firebase Admin] Module loaded."); // Loggar när modulen först importeras

if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    console.error("[Firebase Admin CRITICAL] Environment variable FIREBASE_SERVICE_ACCOUNT_JSON is missing. Firebase Admin SDK will not be initialized.");
} else if (!admin.apps.length) {
    console.log("[Firebase Admin] Initializing Firebase Admin SDK...");
    try {
        console.log("[Firebase Admin] Attempting to parse FIREBASE_SERVICE_ACCOUNT_JSON...");
        const jsonContent = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        
        // Logga ett säkert utdrag av variabeln för att kontrollera formatet
        console.log(`[Firebase Admin] JSON snippet: ${jsonContent.substring(0, 100)}...`);

        const serviceAccount = JSON.parse(jsonContent);

        console.log("[Firebase Admin] JSON parsed successfully. Initializing app...");

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        db = admin.firestore();
        firestoreAdmin = admin.firestore();
        auth = admin.auth();
        console.log("[Firebase Admin] Firebase Admin SDK initialized successfully.");

    } catch (error) {
        console.error("================================================================");
        console.error("[Firebase Admin CRITICAL] FAILED TO INITIALIZE FIREBASE ADMIN SDK");
        console.error("================================================================");
        if (error instanceof SyntaxError) {
            console.error("[Firebase Admin Error] The error is a JSON SyntaxError. This means the FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not a valid JSON string.");
            console.error(`[Firebase Admin Error Details] ${error.message}`);
        } else {
            console.error("[Firebase Admin Error] An unexpected error occurred during initialization:", error);
        }
        // Logga den råa variabeln för att felsöka problem med nya rader
        console.log("--- Raw FIREBASE_SERVICE_ACCOUNT_JSON value ---");
        console.log(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        console.log("---------------------------------------------");
    }
} else {
    console.log("[Firebase Admin] Firebase Admin SDK already initialized.");
    // Säkerställ att variabler tilldelas, vilket kan behövas vid Next.js Fast Refresh
    if (!firestoreAdmin) {
        db = admin.firestore();
        firestoreAdmin = admin.firestore();
        auth = admin.auth();
    }
}

// @ts-ignore
export { db, firestoreAdmin, auth, admin };
