# ByggPilot Architecture Map (v15.0)

## Core Principles
- **Zero Trust Client:** No client-side DB access.
- **Single Source of Truth:** `src/app/_lib/dal/dal.ts`.
- **Automated Sync:** Cloud Functions sync Auth users to Firestore.
- **Strict Process Separation:** Next.js (frontend/API proxy) and Genkit (AI server) are completely separate processes.

## Directory Structure
- `src/app/_lib/dal`: **DAL.** Only place allowed to import `firebase-admin`.
- `src/app/_lib/session.ts`: **Session Management.** Central hub for `iron-session` configuration.
- `src/app/_hooks/useUser.ts`: **Client-side User Data.** SWR-based hook for fetching user profile.
- `src/app/api/auth/`: **Auth Endpoints.** Secure routes for login/logout.
- `src/middleware.ts`: Central traffic controller (Auth & Redirects).
- `src/lib/genkit`: **Genkit Server Core.** Houses the AI server configuration and flow definitions. This code runs in its own dedicated process.
- `functions/index.js`: Firebase Cloud Functions (User creation trigger).

---

## Gold Standard: Auth & Session (v15.0)

Denna sektion definierar den moderna, säkra och performanta arkitekturen för autentisering och dataåtkomst i Next.js-applikationen.

### 1. Kärnteknologier
- **`iron-session`**: För att skapa krypterade, stateless `httpOnly` server-side session cookies. Detta är kärnan i vår säkerhetsmodell.
- **`swr`**: För effektiv och cache-optimerad datahämtning på klientsidan via `useUser`-hooken.
- **`Next.js Middleware`**: För att skydda sidor och hantera omdirigeringar på servern innan sidan renderas.

### 2. Autentiseringsflöde (The Holy Flow 2.0)
1.  **Initiering (Klient):** Användaren klickar på "Logga in med Google" i `AuthForm.tsx`.
2.  **Firebase-autentisering (Klient):** `signInWithPopup` från Firebase Client SDK öppnar ett popup-fönster. Användaren autentiserar sig mot Google.
3.  **Token-hämtning (Klient):** Efter lyckad popup-autentisering hämtar klienten en `idToken` från Firebase.
4.  **Session-skapande (Backend):**
    - Klienten skickar ett `POST`-anrop med `idToken` till vår backend-endpoint: `/api/auth/login`.
    - Endpointen verifierar `idToken` med **Firebase Admin SDK**.
    - Om token är giltig, skapas/hämtas en användarprofil från Firestore via DAL:en.
    - En session skapas med `iron-session`, som innehåller användarens profil.
    - `iron-session` krypterar sessionsdatan och skickar tillbaka den till klienten som en `httpOnly`-cookie i `Set-Cookie`-headern.
5.  **Programmatisk Omdirigering (Klient):**
    - Direkt efter att `/api/auth/login`-anropet lyckats, använder klienten `next/navigation` (`useRouter`) för att omdirigera användaren till rätt sida (t.ex. `/dashboard` eller `/onboarding`). **Ingen `router.refresh()` eller `onAuthStateChanged`-lyssnare behövs.**

### 3. Dataåtkomst efter Inloggning
- **Skyddad Sida (Middleware):**
    - Användaren navigerar till `/dashboard`.
    - `middleware.ts` exekveras på servern, ser `__session`-cookien, dekrypterar den med `iron-session` och verifierar att `isLoggedIn` är `true`. Requesten tillåts passera.
- **Klientsidan (t.ex. en profilmeny):**
    - En klientkomponent anropar `useUser()`-hooken.
    - Hooken använder `swr` för att göra ett `fetch`-anrop till `/api/user/me`.
    - `/api/user/me`-routen (en Route Handler) använder `getVerifiedSession()` för att läsa cookien, extrahera användardatan och returnera den som JSON.
    - `swr` cache-lagrar resultatet och tillhandahåller det till komponenten.
- **Serversidan (t.ex. för sid-rendering):**
    - En React Server Component (RSC) anropar `getVerifiedSession()` direkt för att få tillgång till sessionsdatan och rendera sidan med rätt information.

### 4. Utloggning
1.  **Initiering (Klient):** Användaren klickar på "Logga ut".
2.  **Anrop (Klient):** Klienten skickar ett `POST`-anrop till `/api/auth/logout`.
3.  **Session-förstöring (Backend):** API-routen anropar `session.destroy()`, vilket instruerar `iron-session` att rensa cookien.
4.  **Rensning & Omdirigering (Klient):** Efter lyckat anrop rensar klienten eventuellt lokalt state (t.ex. SWR-cachen) och omdirigerar till startsidan (`/`).

---

## Genkit Gold Standard (v15.0): Paket & Syntax

Denna sektion definierar den obligatoriska standarden för all Genkit-implementation.

### 1. Process & Kommunikation
- Genkit körs som en egen serverprocess (t.ex. på port 3400).
- Next.js kommunicerar **enbart** med Genkit via `fetch`-anrop till Genkits exponerade flödes-endpoints.
- `package.json` i Next.js-appen får **ALDRIG** innehålla `@genkit-ai/*`-paket.

### 2. Obligatoriska Paket
- **Kärna:** `genkit`
- **Flöden:** `@genkit-ai/flow`
- **Google AI & Vertex AI:** `@genkit-ai/google-genai` (detta är det nya, enhetliga paketet).

### 3. Föråldrade/Förbjudna Paket
- Följande paket får **INTE** användas:
  - `@genkit-ai/googleai`
  - `@genkit-ai/vertexai`
  - `@genkit-ai/core` (har ersatts av `genkit`)

### 4. Konfigurationssyntax
- All Genkit-konfiguration måste använda den moderna `genkit()`-funktionen.
- Den gamla `configureGenkit`-funktionen är föråldrad och **förbjuden**.

**Exempel på korrekt konfiguration (`src/lib/genkit.ts`):
```typescript
import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    vertexAI({ location: 'europe-north1' })
  ]
});
```
