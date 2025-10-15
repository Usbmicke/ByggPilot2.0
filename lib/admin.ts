
import admin from 'firebase-admin';
import logger from './logger';

// =================================================================================
// ADMIN SDK V3.0 - ROBUST SINGLETON MED EXPLICIT NYCKELVALIDERING
// ARKITEKTUR: Utökar V2.0 med en avgörande förbättring: explicit validering
// och tolkning av `FIREBASE_SERVICE_ACCOUNT_KEY`. Detta för att slutgiltigt
// diagnostisera 500-felet som orsakas av en felaktig eller saknad miljövariabel.
// =================================================================================

// Global singleton-instans (oförändrad)
declare global {
  var firebaseAdminInstance: admin.app.App | undefined;
}

// En funktion för att säkert hämta och tolka service-nyckeln.
function getServiceAccount() {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    // STEG 1: Validera att miljövariabeln existerar.
    if (!serviceAccountKey) {
        logger.error("KRITISKT FEL: Miljövariabeln FIREBASE_SERVICE_ACCOUNT_KEY saknas. Applikationen kan inte ansluta till databasen.");
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY är inte definierad. Kontrollera din .env.local-fil.");
    }

    try {
        // STEG 2: Validera att miljövariabeln är giltig JSON.
        return JSON.parse(serviceAccountKey);
    } catch (error: any) {
        logger.error({ 
            message: "KRITISKT FEL: Kunde inte tolka FIREBASE_SERVICE_ACCOUNT_KEY. Detta beror oftast på ett kopieringsfel eller felaktigt format.", 
            error: error.message,
            suggestion: "Säkerställ att hela JSON-objektet från Firebase är kopierat som en enda rad, och att alla specialtecken är korrekt \"escaped\"."
        });
        throw new Error("Kunde inte tolka FIREBASE_SERVICE_ACCOUNT_KEY. Kontrollera serverloggarna för detaljer.");
    }
}

function getFirebaseAdmin() {
  if (global.firebaseAdminInstance) {
    return global.firebaseAdminInstance;
  }

  try {
    logger.info("Initierar ny Firebase Admin SDK-instans...");
    const serviceAccount = getServiceAccount(); // Använd vår nya, säkra funktion

    global.firebaseAdminInstance = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    logger.info("Firebase Admin SDK har initierats framgångsrikt.");

  } catch (error: any) {
    // Detta block fångar nu upp de specifika felen från getServiceAccount()
    logger.error({ 
        message: "Allvarligt fel under initiering av Firebase Admin. Applikationen kommer inte fungera korrekt.", 
        error: error.message 
    });
    // Kasta felet vidare så att servern korrekt indikerar ett fel.
    throw error;
  } 

  return global.firebaseAdminInstance;
}

// Exportera tjänsterna (oförändrat)
const adminApp = getFirebaseAdmin();
const adminDb = adminApp.firestore();
const adminAuth = adminApp.auth();

export { adminDb, adminAuth };
