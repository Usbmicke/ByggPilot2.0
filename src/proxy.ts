import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Hämta våra cookies
  const sessionCookie = request.cookies.get('session')?.value;
  const onboardingCookie = request.cookies.get('onboardingStatus')?.value;

  // Definiera våra sid-typer
  const isPublic = ['/', '/integritetspolicy', '/anvandarvillkor'].includes(pathname);
  const isOnboarding = pathname.startsWith('/onboarding');
  const isDashboard = pathname.startsWith('/dashboard');

  // --- Omdirigerings-logik ---

  // 1. ANVÄNDAREN ÄR UTLOGGAD (ingen session)
  if (!sessionCookie) {
    // Om de försöker nå en skyddad sida, skicka tillbaka dem till startsidan.
    if (isDashboard || isOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    // Annars, låt dem vara på den offentliga sidan.
    return NextResponse.next();
  }

  // 2. ANVÄNDAREN ÄR INLOGGAD (har session)
  if (sessionCookie) {
    // Om onboarding-status är okänd (pågående race condition), låt AuthProvider slutföra sitt jobb.
    if (!onboardingCookie || onboardingCookie === 'logged_out') {
      // Låt Next.js fortsätta rendera sidan. AuthProvider kommer visa en laddningsskärm
      // och sedan sätta rätt cookie, vilket löser problemet vid nästa navigation.
      return NextResponse.next();
    }
    
    // Om de behöver slutföra onboarding...
    if (onboardingCookie === 'incomplete') {
      // ...och de INTE är på onboarding-sidan, tvinga dem dit.
      if (!isOnboarding) {
        const url = request.nextUrl.clone();
        url.pathname = '/onboarding';
        return NextResponse.redirect(url);
      }
    } 
    // Om de ÄR klara med onboarding...
    else if (onboardingCookie === 'complete') {
        // ...och de är på en offentlig sida eller onboarding-sidan, skicka dem till dashboard.
        if(isPublic || isOnboarding) {
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }
    }
  }

  // I alla andra fall (t.ex. en inloggad, färdigställd användare som surfar runt i dashboarden),
  // gör ingenting. Låt dem passera.
  return NextResponse.next();
}
