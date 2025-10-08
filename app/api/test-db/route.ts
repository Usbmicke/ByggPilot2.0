
import { NextResponse } from 'next/server';
import { firestoreAdmin } from '@/lib/firebase-admin';

// =================================================================================
// DIAGNOSTISK ROUTE: /api/test-db
// Syftet är att isolera och testa databasanslutningen.
// =================================================================================

export async function GET() {
  console.log("\n--- KÖR DIAGNOSTISKT TEST: /api/test-db ---");

  try {
    // Steg 1: Försök att referera till firestoreAdmin-objektet.
    // Om lib/firebase-admin.ts kraschar vid initiering, kommer vi aldrig förbi denna punkt.
    console.log("Steg 1/3: Importering av firestoreAdmin lyckades.");

    // Steg 2: Utför den absolut enklaste möjliga läsoperationen.
    console.log("Steg 2/3: Försöker hämta 1 dokument från 'customers'-collectionen...");
    const snapshot = await firestoreAdmin.collection('customers').limit(1).get();
    console.log(`Steg 3/3: Databasanrop lyckades. Hittade ${snapshot.docs.length} dokument.`);

    // Steg 3: Om vi kommer hit, fungerar anslutningen!
    return NextResponse.json({
      status: 'success',
      message: 'Databasanslutning verifierad! Anslutning till Firestore fungerar.',
      documentsFound: snapshot.docs.length,
    });

  } catch (error) {
    // Om något går fel, logga det detaljerade felet på servern.
    console.error("--- DIAGNOSTISKT FEL ---");
    console.error("Ett fel uppstod under databastestet:", error);
    console.error("----------------------");

    // Returnera ett tydligt felmeddelande till webbläsaren.
    return NextResponse.json(
      {
        status: 'error',
        message: 'Kunde inte ansluta till databasen. Kontrollera server-terminalen för ett detaljerat felmeddelande.',
        // Inkludera en del av felmeddelandet för kontext.
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
