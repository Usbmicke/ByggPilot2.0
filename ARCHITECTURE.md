# ByggPilot Architecture Map (v5.0)

## Core Principles
- **Zero Trust Client:** No client-side DB access.
- **Single Source of Truth:** `src/app/_lib/dal/dal.ts`.
- **Automated Sync:** Cloud Functions sync Auth users to Firestore.

## Directory Structure
- `src/app/_lib/dal`: **DAL.** Only place allowed to import `firebase-admin`.
- `src/middleware.ts`: Central traffic controller (Auth & Redirects).
- `src/lib/genkit`: AI flows (Running on separate process).
- `functions/index.js`: Firebase Cloud Functions (User creation trigger).

## "Det Heliga Flödet" (Data Access)
1. **Login (Client):** User logs in -> Gets `idToken`.
2. **Session (API):** Client POSTs `idToken` to `/api/auth/session`. Server creates `HttpOnly` Cookie.
3. **Request (Middleware):** Middleware verifies Cookie via Admin SDK.
4. **Data (Server Component):**
   - Component calls `dal.getMyProfile()`.
   - DAL calls internal `verifySession()` (reads Cookie).
   - DAL fetches data using verified UID.
   - DAL returns Zod-validated data.

## AI Integration (Genkit)
- Next.js API routes call Genkit via HTTP (`fetch`).
- Genkit performs heavy logic/tools using its own Admin privileges.