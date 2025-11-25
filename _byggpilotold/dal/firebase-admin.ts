
import * as admin from 'firebase-admin';

// ====================================================================
// GULDSTANDARD: Firebase Admin SDK - Single Source of Truth
// ====================================================================
// Denna fil är den ENDA platsen i hela applikationen där Firebase
// Admin SDK initieras. Detta garanterar att vi bara har en enda,
// förutsägbar instans av SDK:n.
//
// Principen "Zero Trust Client" innebär att denna fil ALDRIG får
// importeras eller användas i någon frontend-kod (t.ex. i /app).
// Den får endast anropas från säker backend-logik (t.ex. /lib/dal
// eller Genkit-flöden).
// ====================================================================

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      // Notera: databas-URL är ofta inte nödvändig i moderna
      // Firebase-projekt (särskilt med Firestore), men kan läggas till
      // om Realtime Database används.
      // databaseURL: `https://${process.env.GCLOUD_PROJECT}.firebaseio.com`,
    });
    console.log('[Firebase Admin] SDK initierad.');
  } catch (error: any) {
    console.error('[Firebase Admin] Initiering misslyckades:', error.message);
    // I ett produktionssystem skulle du här kunna skicka en notis
    // till ett övervakningssystem (t.ex. Sentry, Google Cloud Monitoring).
    process.exit(1); // Avsluta processen om Admin SDK inte kan starta
  }
}

export const auth = admin.auth();
export const firestore = admin.firestore();
export const storage = admin.storage();

// Exempel på en hård säkerhetsregel i kodform:
// Se till att Firestore-inställningarna inte kan ändras under körning.
Object.freeze(firestore.settings);
