
import * as admin from 'firebase-admin';

// Denna kod säkerställer att vi bara initierar appen en gång.
// Detta kallas "singleton pattern" och är kritisk i en serverless miljö.
if (!admin.apps.length) {
  console.log('Försöker initiera Firebase Admin SDK...');

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    try {
      // Denna metod är explicit och påverkar inte andra Google-klienter.
      // Den använder servicekontot direkt.
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
      });
      console.log('Firebase Admin SDK har initierats framgångsrikt med servicekonto.');
    } catch (error) {
      console.error('Kritiskt fel: Kunde inte initiera Firebase Admin SDK med servicekonto.', error);
      // I en produktionsmiljö vill vi att detta ska misslyckas högljutt om servicekontot är felaktigt.
    }
  } else {
    // Om ingen service account finns (typiskt för lokal utveckling),
    // och emulatorn inte används, logga en tydlig varning.
    // Appen kommer troligen inte fungera fullt ut, men vi undviker kraschen.
    console.warn('VARNING: FIREBASE_SERVICE_ACCOUNT_JSON är inte satt. Firebase Admin SDK är inte initierad.');
    console.warn('För lokal utveckling, se till att denna miljövariabel är korrekt konfigurerad i .env.local');
  }
}

// Skapa och exportera den initierade Firestore-instansen.
// Alla server-filer ska importera denna instans.
const firestoreAdmin = admin.firestore();

export { admin, firestoreAdmin };
