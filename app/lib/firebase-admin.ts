
// Fil: app/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// Denna kod körs bara en gång när modulen laddas första gången på servern.
if (!admin.apps.length) {
  try {
    // Försöker först initiera med service-konto från miljövariabler (för Vercel/produktion).
    console.log('Försöker initiera Firebase Admin SDK från miljövariabel...');
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!)),
    });
    console.log('Firebase Admin SDK har initierats framgångsrikt från miljövariabel.');
  } catch (e) {
    // Om det misslyckas (t.ex. under lokal utveckling), faller vi tillbaka till standard-credentials.
    // Detta fungerar automatiskt på Google Cloud Workstations.
    console.warn('Kunde inte hitta eller tolka FIREBASE_SERVICE_ACCOUNT_JSON. Faller tillbaka till standard-credentials.');
    admin.initializeApp();
    console.log('Firebase Admin SDK har initierats med standard-credentials.');
  }
}

// Exportera den färdiga och återanvändbara anslutningen direkt.
const firestoreAdmin = admin.firestore();

export { firestoreAdmin };
