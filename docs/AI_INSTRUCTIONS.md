'''# BYGGPILOT AI MASTER INSTRUCTIONS (v2025.11 - Genkit Native)

## 1. KÄRNFILOSOFI (EXIT READY)
Vi bygger en **"Zero Trust"**-applikation. Next.js (Frontend) är endast ett skal. All intelligens, säkerhet och datahantering äger rum i **Genkit** (Backend).

## 2. KRITISKA REGLER (NON-NEGOTIABLE)

### A. Arkitektur: The Unified Process (Proxy Pattern)
1.  **Next.js 16 (Frontend):** Hanterar UI och Routing.
2.  **Genkit Server (Backend Brain):** Körs separat (port 3400). Hanterar AI, Auth-validering och DB-anrop.
3.  **The Bridge:** Next.js kommunicerar **ENBART** med Genkit via en "Pass-through Proxy" i `src/app/api/[[...genkit]]/route.ts`. Denna proxy skickar vidare Headers (Auth) och Body orört.

### B. Säkerhet & Autentisering (Token-Based Zero Trust)
1.  **Inga Cookies i Backend:** Vi använder **Bearer Tokens** (Firebase ID Token).
2.  **Flödet:**
    - Frontend: `auth.currentUser.getIdToken()` hämtas vid varje anrop.
    - Transport: Skickas i `Authorization: Bearer <token>` header.
    - Backend (Genkit): Policyn `firebaseAuth()` validerar token och sätter `context.auth`.
3.  **DAL (Data Access Layer):**
    - Ligger i `src/app/_lib/dal`.
    - Får **ALDRIG** anropas från Next.js UI-komponenter.
    - Måste anropas inifrån ett Genkit-flöde där `context.auth.uid` är verifierat.

### C. Genkit & Gemini 3 (Modern Standard)
1.  **Paket:** Använd enbart `@genkit-ai/google-genai` (Unified SDK).
2.  **Modeller:**
    - **`gemini-3-pro`**: För komplex logik, resonemang och kodgenerering.
    - **`gemini-3-flash`**: För chatt, snabba svar och "tool calling".
3.  **Streaming:** Alla chatt-flöden SKA stödja streaming (`stream: true`) för att ge omedelbar feedback.

## 3. ARBETSFLÖDE FÖR DIG (AGENTEN)
1.  **Läs Kartan:** Innan du kodar, läs `ARCHITECTURE.md` för att förstå proxy-mönstret.
2.  **Inga Gissningar:** Hitta inte på filvägar. Om du är osäker på var en fil ligger, fråga eller kör `ls`.
3.  **Code Quality:** Använd strikt TypeScript och Zod-validering på all data in/ut ur Genkit.'''