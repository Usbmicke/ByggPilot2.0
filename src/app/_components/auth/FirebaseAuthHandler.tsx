
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/app/_lib/config/firebase-client';
import { useRouter } from 'next/navigation';

/**
 * FirebaseAuthHandler är en osynlig klient-komponent som agerar brygga mellan
 * Firebase klient-autentisering och vår server-sidans sessionshantering (httpOnly cookie).
 * Den lyssnar på ändringar i Firebase Auth-status och synkroniserar med vår backend.
 */
export function FirebaseAuthHandler() {
  const router = useRouter();
  // Vi använder state för att undvika att anropa login-API:et flera gånger
  // för samma inloggningstillfälle, t.ex. vid HMR (Hot Module Replacement).
  const [lastUid, setLastUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        // En användare har loggat in på klienten.
        if (user.uid !== lastUid) {
          setLastUid(user.uid);

          // Hämta ID-token från Firebase.
          const idToken = await user.getIdToken();

          // Skicka token till vår backend-endpoint för att skapa en session-cookie.
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ idToken }),
            });

            if (response.ok) {
              // Servern har nu satt session-cookien. Vi måste tala om för Next.js att
              // utvärdera om sidan på nytt. router.refresh() kör om middleware
              // och server-komponenter med den nya cookien.
              router.refresh();
            } else {
              console.error("Misslyckades med att skapa session-cookie:", await response.text());
            }
          } catch (error) {
            console.error("Nätverksfel vid anrop till /api/auth/login:", error);
          }
        }
      } else {
        // Användare har loggat ut på klienten.
        // Om användaren var inloggad tidigare (enligt vårt state), rensa och uppdatera.
        if (lastUid !== null) {
            setLastUid(null);
            // UserMenu-komponenten anropar redan /api/auth/logout.
            // Vi ser till att sidan uppdateras för att reflektera utloggat tillstånd.
            router.refresh();
        }
      }
    });

    // Städa upp prenumerationen när komponenten tas bort
    return () => unsubscribe();
  }, [router, lastUid]); // Effektens beroenden

  // Denna komponent renderar inget visuellt.
  return null;
}
