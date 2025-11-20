# ByggPilot Arkitektur: Guldstandarden (v5.0)

Detta dokument beskriver den slutgiltiga och säkraste arkitekturen för ByggPilot. Den är designad för maximal säkerhet, underhållbarhet och tydlighet. Alla framtida ändringar, oavsett om de görs av människor eller AI, **MÅSTE** följa dessa principer.

## 1. De Tre Grundpelarna

### A. Nolltillit till Klienten (Frontend)
- **Princip:** Klienten (webbläsaren) är osäker och får **aldrig** lita på. All affärslogik, validering och databasåtkomst måste ske på servern.
- **`firestore.rules`:** Våra databasregler är permanent låsta: `allow read, write: if false;`. Detta är vår sista försvarslinje och förhindrar all direktåtkomst från klienten.

### B. En Enda, Säker Port till Datan (DAL)
- **Princip:** All databasinteraktion **MÅSTE** gå genom vårt Data Access Layer (DAL).
- **Fil:** `src/app/_lib/dal/dal.ts`
- **Regler för DAL:**
    1.  **Säkerhet Inbyggd:** Varje funktion i DAL som hanterar användarspecifik data anropar `verifySession()` internt. De tar **INTE** emot en `userId` som parameter. Detta gör det arkitektoniskt omöjligt för en funktion att av misstag agera på fel användares data.
    2.  **Inga Undantag:** Ingen annan fil i `src`-mappen får importera `firebase-admin/firestore` eller `firebase/firestore`. `dal.ts` är den **enda** tillåtna vägen.
    3.  **Datavalidering:** All data som returneras från DAL valideras med Zod för att garantera typsäkerhet i hela applikationen.

### C. Automatiserad och Centraliserad Logik
- **Princip:** Logik ska vara centraliserad för att undvika duplicering och vara lätt att resonera kring.
- **Middleware (`src/middleware.ts`):** Denna fil är den centrala trafikpolisen. Den verifierar varje inkommande request, kontrollerar sessionens giltighet och omdirigerar användare baserat på deras autentiserings- och onboarding-status. Den är den enda platsen där omdirigeringslogik baserad på sessionen ska finnas.
- **Cloud Function för Användarskapande (`functions/index.js`):** Processen att skapa ett användardokument i Firestore är helt automatiserad. En `onUserCreate`-trigger i Firebase körs omedelbart när ett nytt Auth-konto skapas och skapar det nödvändiga Firestore-dokumentet. Detta garanterar att Auth och databas alltid är i synk.

---

## 2. Det Heliga Flödet (Autentisering & Dataåtkomst)

Detta beskriver hela livscykeln från inloggning till säker dataåtkomst.

1.  **Steg 1: Inloggning & ID-Token (Klient)**
    - Användaren loggar in (t.ex. med Google) via Firebase Client SDK i webbläsaren.
    - Firebase returnerar ett kortlivat `idToken`.

2.  **Steg 2: Skapa Session-Cookie (Server)**
    - Klienten skickar omedelbart `idToken` till vår API-route: `/api/auth/session`.
    - Denna route (den enda som behöver hantera `idToken`) verifierar token och skapar en säker, krypterad `HttpOnly` **session-cookie**. Denna cookie är nu beviset på en giltig session.

3.  **Steg 3: Middleware Validerar All Trafik (Server)**
    - Vid varje efterföljande anrop till en skyddad sida (`/dashboard`, `/onboarding` etc.) skickar webbläsaren automatiskt med session-cookien.
    - Vår `middleware.ts` fångar upp anropet, verifierar cookien med `firebase-admin`, och hämtar användarprofilen via `getUserProfileForMiddleware()` från DAL.
    - Middlewaren omdirigerar till `/onboarding` eller `/dashboard` baserat på `onboardingStatus`.

4.  **Steg 4: Säker Dataåtkomst i Komponenter (Server)**
    - En Server-Komponent (t.ex. på `/dashboard`) behöver hämta data.
    - Komponenten anropar en funktion från DAL, t.ex. `getMyProfile()`.
    - `getMyProfile()`-funktionen anropar `verifySession()` internt, som läser och verifierar session-cookien från request-headern.
    - Den verifierade `uid` från cookien används för att säkert hämta rätt användares data från Firestore.
    - Datan valideras med Zod och returneras till komponenten för rendering.

Detta system är byggt för att vara självdokumenterande genom sin strikta struktur. Genom att följa dessa regler säkerställer vi en robust, säker och underhållbar kodbas för ByggPilot.
