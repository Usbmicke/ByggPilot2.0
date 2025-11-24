# ByggPilot Architecture Map (v2025.11 - Gold Standard)

## Core Stack
- **Frontend:** Next.js 16 (App Router) + Tailwind CSS.
- **Backend/AI:** Firebase Genkit (körs på separat port).
- **Model:** Google Gemini 3 (Pro & Flash).
- **Database:** Firestore (låst för klienten).

## Directory Structure
- `src/app/api/[[...genkit]]`: **The Proxy.** Enda vägen in till backend.
- `src/lib/genkit`: **The Brain.** Här ligger alla Flows och Tools.
- `src/lib/dal`: **The Gatekeeper.** Enda koden som får importera `firebase-admin`.

## "The Holy Flows" (Godkända Dataflöden)

### 1. Chatt & AI (Streaming & Tools)
*Mål: Blixtsnabb respons med djup kunskap.*
1.  **User:** Skriver "Skapa projekt X".
2.  **Frontend (`useChat`):**
    - Hämtar färsk `idToken` från Firebase SDK.
    - Anropar `/api/genkit/chatFlow` med token i header.
3.  **Next.js Proxy:** Skickar vidare requesten direkt till Genkit Server.
4.  **Genkit (`chatFlow`):**
    - Validerar token (`firebaseAuth`).
    - Anropar **Gemini 3 Flash** med verktygsdefinitioner (Tools).
    - Om verktyg behövs (t.ex. `createProject`):
        - Genkit anropar DAL-funktionen `dal.createProject(uid, data)`.
        - DAL skriver till Firestore.
5.  **Response:** Svaret strömmas (chunked) tillbaka via proxyn till klienten.

### 2. Autentisering (Zero Trust)
*Vi förlitar oss inte på cookies eller sessioner på servern, vi verifierar varje anrop.*
1.  **Login:** `signInWithPopup(auth, provider)` på klienten.
2.  **State:** Firebase SDK hanterar `refreshToken` automatiskt i webbläsaren.
3.  **Access:** Vid varje API-anrop injiceras token via en `interceptor` eller hook.

### 3. Onboarding (Automatiserad)
1.  **Trigger:** Användaren loggar in första gången.
2.  **Flow:** Klienten anropar `onboardingFlow`.
3.  **Logic:** Genkit verifierar användaren, skapar Firestore-profil via DAL, och anropar Google Drive API (via service account) för att skapa mappar.