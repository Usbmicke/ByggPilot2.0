# BYGGPILOT AI MASTER INSTRUCTIONS (v2025.11 - Audit Edition)

## 1. SYSTEMKRAV (HARD REQUIREMENTS)
- **Runtime:** Node.js v20 eller senare (Krävs för Next.js 16 & Genkit).
- **Modeller:** Gemini 3 (Flash & Pro) via Vertex AI.
- **Framework:** Next.js 16 (App Router).

## 2. ARKITEKTURELL LAGBOK (NON-NEGOTIABLE)
1. **Genkit Separation:** Genkit backend MÅSTE köras separat (port 3400). Next.js anropar den via `fetch` till vår Proxy-route. Ingen direktimport av `@genkit-ai/flow` i Frontend.
2. **Data Access Layer (DAL):** All Firestore-trafik går via `src/lib/dal`. Inga direkta db-anrop i komponenter.
3. **Genkit Auth:** Vi använder Genkits inbyggda sessionshantering (cookies) via `firebaseAuth`-policyn. Inte `next-auth` eller egna JWT-lösningar.

## 3. DIN UPPGIFT: REVISION & SÄKRING
Du ska inte bara skriva kod, du ska **granska** existerande kod. Om inloggningen eller onboardingen bryter mot "Zero Trust" eller använder gamla paket, måste du flagga det och skriva om det.