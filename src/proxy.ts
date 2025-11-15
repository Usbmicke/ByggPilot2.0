import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin'; // KORRIGERAD: Importerar specifika moduler

// Hjälpfunktion för att verifiera session och hämta användarstatus
async function verifySessionAndGetStatus(sessionCookie: string): Promise<{ uid: string; isOnboarded: boolean } | null> {
  try {
    // Verifiera session-cookien med Firebase Admin SDK
    // KORRIGERAD: Använder adminAuth
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedToken.uid;

    // Använd Genkit-flödet för att hämta (eller skapa) användaren och få onboarding-status
    // Notera: Detta förutsätter att ditt Genkit-flöde är tillgängligt via en intern funktion/anrop.
    // Om det är en http-endpoint, skulle du använda fetch här.
    // För demonstrationens skull antar vi en direktimport (kräver anpassning av bygge).
    // I en verklig app skulle man anropa /api/genkit/flows/getOrCreateUserAndCheckStatusFlow
    // KORRIGERAD: Använder adminDb
    const userDoc = await adminDb.collection('users').doc(uid).get();

    if (userDoc.exists) {
      // KORRIGERAD: Använder 'onboardingStatus' från DAL-schemat
      const isOnboarded = userDoc.data()?.onboardingStatus === 'complete';
      return { uid, isOnboarded };
    }
    
    // Om användaren av någon anledning inte finns i Firestore än, behandla som ej onboardad.
    // Det verkliga flödet `getOrCreateUser...` skulle hantera detta, men detta är en fallback.
    return { uid, isOnboarded: false };

  } catch (error) {
    console.error('[PROXY] Fel vid verifiering av session cookie:', error);
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  const isPublic = ['/', '/integritetspolicy', '/anvandarvillkor'].includes(pathname);
  const isOnboarding = pathname.startsWith('/onboarding');
  const isDashboard = pathname.startsWith('/dashboard');
  const isApiRoute = pathname.startsWith('/api'); // Ignorera API-anrop

  if (isApiRoute) {
    return NextResponse.next();
  }

  // 1. ANVÄNDAREN ÄR UTLOGGAD (ingen session)
  if (!sessionCookie) {
    if (isDashboard || isOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 2. ANVÄNDAREN ÄR INLOGGAD (har session)
  const userStatus = await verifySessionAndGetStatus(sessionCookie);

  if (!userStatus) {
    // Ogiltig session, behandla som utloggad. Ta bort felaktig cookie.
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('session');
    return response;
  }

  const { isOnboarded } = userStatus;

  if (isOnboarded) {
    // Användaren är klar med onboarding.
    // Om de besöker en offentlig sida eller onboarding-sidan, skicka dem till dashboard.
    if (isPublic || isOnboarding) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else {
    // Användaren har INTE slutfört onboarding.
    // Om de INTE är på onboarding-sidan, tvinga dem dit.
    if (!isOnboarding) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // Om inget av ovanstående, låt användaren passera (t.ex. inloggad & på dashboard).
  return NextResponse.next();
}
