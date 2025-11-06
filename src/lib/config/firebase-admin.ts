import * as admin from 'firebase-admin';

// GULDSTANDARD-ARKITEKTUR: Korrekt initiering i en Google Cloud-miljö.
// Genom att anropa initializeApp() utan argument används Application Default Credentials (ADC)
// som är säkert tillhandahållna av molninfrastrukturen (t.ex. Cloud Workstations, Cloud Run).
// Detta eliminerar behovet av .env-filer för server-autentisering och är bästa praxis.
if (!admin.apps.length) {
  try {
    admin.initializeApp();
    console.log('Firebase Admin SDK initialized successfully using Application Default Credentials.');
  } catch (error) {
    console.error('CRITICAL: Firebase admin initialization failed.', error);
    console.error('This likely means the environment is not configured with Application Default Credentials. Check the Cloud Workstations setup.');
    // Vi kastar inte om felet här för att undvika en omedelbar kraschloop under dev,
    // men loggar det som kritiskt.
  }
}

// Exportera instanser för användning i applikationen.
// Notera: Om initieringen ovan misslyckas kommer dessa anrop också att misslyckas,
// vilket är avsiktligt för att snabbt synliggöra konfigurationsfelet.
export const firestoreAdmin = admin.firestore();
export const authAdmin = admin.auth();
