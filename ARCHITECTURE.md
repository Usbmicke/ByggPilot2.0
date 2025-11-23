# ByggPilot Architecture Map (v15.0)

## Core Principles
- **Zero Trust Client:** No client-side DB access.
- **Single Source of Truth:** `src/app/_lib/dal/dal.ts`.
- **Automated Sync:** Cloud Functions sync Auth users to Firestore.
- **Strict Process Separation:** Next.js (frontend/API proxy) and Genkit (AI server) are completely separate processes.

## Directory Structure
- `src/app/_lib/dal`: **DAL.** Only place allowed to import `firebase-admin`.
- `src/middleware.ts`: Central traffic controller (Auth & Redirects).
- `src/lib/genkit`: **Genkit Server Core.** Houses the AI server configuration and flow definitions. This code runs in its own dedicated process.
- `functions/index.js`: Firebase Cloud Functions (User creation trigger).

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

---

## "Det Heliga Flödet" (Data Access)
1. **Login (Client):** User logs in -> Gets `idToken`.
2. **Session (API):** Client POSTs `idToken` to `/api/auth/session`. Server creates `HttpOnly` Cookie.
3. **Request (Middleware):** Middleware verifies Cookie via Admin SDK.
4. **Data (Server Component):**
   - Component calls `dal.getMyProfile()`.
   - DAL calls internal `verifySession()` (reads Cookie).
   - DAL fetches data using verified UID.
   - DAL returns Zod-validated data.
