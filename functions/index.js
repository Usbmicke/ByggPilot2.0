const { onUserCreate } = require("firebase-functions/v2/auth");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");
const { logger } = require("firebase-functions");
const { v4: uuidv4 } = require("uuid"); // Importera UUID

// Initialisera Firebase Admin SDK
initializeApp();
const db = getFirestore();

/**
 * Cloud Function (v2) som triggas när en ny Firebase-användare skapas.
 * ANSVAR:
 * 1. Skapa ett nytt, unikt FÖRETAG (company) för den nya användaren.
 * 2. Skapa ett ANVÄNDARDOKUMENT i Firestore för användaren.
 * 3. Länka användaren till det nya företaget via ett `companyId`.
 * Allt detta sker i en atomär batch-operation för dataintegritet.
 */
exports.provisionNewUserEnvironment = onUserCreate({ region: "europe-west1" }, async (event) => {
  const user = event.data;
  const { uid, email } = user;

  logger.info(`Provisioning environment for new user: ${uid}`, { email });

  // 1. Skapa ett nytt, unikt companyId
  const companyId = uuidv4();

  // 2. Definiera referenser
  const userDocRef = db.collection("users").doc(uid);
  const companyDocRef = db.collection("companies").doc(companyId);

  // 3. Starta en atomär batch write
  const batch = db.batch();

  // 4. Skapa Företagsdokumentet
  batch.set(companyDocRef, {
    companyId: companyId,
    name: "Mitt Företag", // Standardnamn, kan ändras under onboarding
    ownerId: uid, // Håll reda på vem som skapade företaget
    createdAt: Timestamp.now(),
  });

  // 5. Skapa Användardokumentet
  batch.set(userDocRef, {
    userId: uid,
    email: email,
    companyId: companyId, // Länka användaren till det nya företaget
    createdAt: Timestamp.now(),
    onboardingStatus: "incomplete",
  });

  // 6. Genomför operationen
  try {
    await batch.commit();
    logger.info(`Successfully created company ${companyId} and user document for ${uid}.`);
  } catch (error) {
    logger.error(`Failed to provision environment for user ${uid}:`, error);
    // Kasta om felet för att Firebase ska veta att funktionen misslyckades
    throw new Error(`Failed to commit Firestore batch for user ${uid}`);
  }
});

// Ta bort den gamla, felaktiga funktionen för att undvika dubbelkörning.
// Denna rad kan tas bort efter att den nya funktionen har deployats.
// exports.makeuserdocument = ... (gammal kod)
