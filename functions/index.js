const { onUserCreate } = require("firebase-functions/v2/auth");
const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");
const { logger } = require("firebase-functions");

// Initialisera Firebase Admin SDK
initializeApp();

/**
 * En v2 Cloud Function som triggas när en ny Firebase-användare skapas.
 * Den skapar automatiskt ett motsvarande användardokument i Firestore.
 * Regionen är specificerad direkt i exporten.
 */
exports.makeuserdocument = onUserCreate({ region: "europe-west1" }, async (event) => {
  // Hämta användardata från händelsen
  const user = event.data;
  const { uid, email, displayName, photoURL } = user;

  logger.info(`Ny användare skapades: ${uid}`, { structuredData: true });

  // Referens till användarens dokument i Firestore
  const userDocRef = getFirestore().collection("users").doc(uid);

  try {
    // Skapa dokumentet med initial data.
    await userDocRef.set({
      email: email, // E-post från Auth
      displayName: displayName || null, // Visningsnamn från Auth (om det finns)
      photoURL: photoURL || null, // Profilbild-URL från Auth (om det finns)
      createdAt: new Date(), // Använder nu klientens tidstämpel vid skapande
      onboardingStatus: "incomplete", // Standardstatus för nya användare
    });
    logger.info(`Firestore-dokument skapat för användare: ${uid}`);
  } catch (error) {
    logger.error(`Fel vid skapande av Firestore-dokument för ${uid}:`, error);
  }
});
