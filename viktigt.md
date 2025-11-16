
# Arkitektur Horisont 2025: Den Definitiva Guiden för Byggpilot

Detta dokument är den enda källan till sanning för Byggpilots tekniska arkitektur. Alla tidigare versioner är obsoleta. Målet är en automatiserad, säker och högpresterande applikation, fri från manuell hantering och föråldrade mönster.

## Kärnprinciper

### 1. Absolut Separation: UI vs. Logik

Applikationen är strikt uppdelad. Detta är inte förhandlingsbart.

*   **Frontend (Next.js `/src`):** Är ett rent presentationslager. Dess enda ansvar är UI, lokal state och att initiera anrop till backend. Den använder den vanliga Firebase Client SDK:n för detta initiala syfte.

*   **Backend (Next.js API Routes, `/src/app/api`):** Är hjärnan och kassaskåpet. All affärslogik, all databasinteraktion via **Firebase Admin SDK**, all AI-bearbetning (Genkit) och all säkerhetskritisk kod lever här. API-vägarna körs som serverless functions i en säker miljö.

### 2. Autentisering: Det Automatiska Session-Cookie Flödet

Vi har övergivit all manuell token-hantering. Autentisering sker via ett modernt, säkert och automatiserat flöde som utnyttjar Firebase och Next.js fullt ut.

1.  **Initiering (Klient):** En användare klickar på "Logga in". Firebase Client SDK (`signInWithPopup`) hanterar interaktionen med Google. Efter lyckad inloggning hos Google får klienten ett **ID Token**.

2.  **Session-etablering (API-anrop):** Klienten skickar omedelbart detta ID Token – *en enda gång* – till vår backend-endpoint: `POST /api/auth/session`.

3.  **Cookie-skapande (Backend):** Vår API-route tar emot ID-tokenet, verifierar det med **Firebase Admin SDK**, och skapar sedan en **Session Cookie** med `admin.auth().createSessionCookie()`. Denna cookie sätts i webbläsarens svar med `HttpOnly`, `Secure` och `SameSite=Lax`-flaggor, vilket gör den osynlig och oåtkomlig för klient-skript. Detta är branschstandard för säkerhet.

4.  **Automatisk Verifiering (`middleware.ts`):** För varje efterföljande anrop som görs till applikationen skickar webbläsaren automatiskt med denna säkra cookie. Vår `middleware.ts` fångar upp den, verifierar den blixtsnabbt via ett anrop till `/api/auth/verify`, och vet då exakt vem användaren är. Middlewaren agerar som en intelligent dörrvakt för hela applikationen.

Detta mönster eliminerar helt behovet för klienten att någonsin igen befatta sig med tokens. Sessionen är etablerad och hanteras sömlöst.

### 3. Centraliserad & Säker Hantering av Hemligheter (NY STANDARD)

All hantering av hemligheter och miljövariabler har standardiserats för maximal säkerhet och minimal risk för läckage.

*   **Princip:** Hemligheter lagras **aldrig** i koden eller i `.env.local`. De hämtas dynamiskt från en säker, molnbaserad källa (t.ex. Google Secret Manager) vid behov.

*   **Implementering:** All server-kod **måste** använda den centraliserade funktionen `getSecret('SECRET_NAME')` från `src/lib/config/secrets.ts` för att hämta hemligheter. Denna funktion är den enda tillåtna vägen för att accessa känslig konfiguration.

*   **`.env.local`-filens roll:** Denna fil är **endast** avsedd för:
    1.  **Publika variabler:** Värden som är säkra att exponera för klienten. Dessa måste ha prefixet `NEXT_PUBLIC_`. Exempel: `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.
    2.  **Lokala pekare (endast utveckling):** Variabeln `GOOGLE_APPLICATION_CREDENTIALS` som pekar till den lokala JSON-filen för Firebase Admin-tjänstekontot. Denna används bara under lokal utveckling.

*   **Aktiva Hemligheter (hanteras via `getSecret`):**
    *   `ENCRYPTION_KEY`: 32-bytes nyckel för AES-256-kryptering.
    *   `ENCRYPTION_IV`: 16-bytes IV för AES-256-kryptering.

*   **Inaktiva/Framtida Hemligheter:**
    *   `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`: Är **inte aktiva**. Projektet använder Firebase inbyggda sessionshantering, inte Redis.
    *   `GOOGLE_CLIENT_SECRET`: Är **inte aktiv**. Används för framtida Google API-integrationer men har ingen funktion i nuläget.

-- -

## Integration av AI (Genkit)

Denna arkitektur är skräddarsydd för säker integration av Genkit.

*   **Flöden som API:er:** Varje Genkit AI-flöde (t.ex., `chatOrchestrator`) exponeras som en egen säker API-route (t.ex., `/api/genkit/chat`).
*   **Automatisk Auktorisering:** När frontend anropar `/api/genkit/chat`, verifierar vår `middleware.ts` automatiskt användarens session via session-cookien. Genkit-flödet kan därmed lita på att anropet är autentiserat och kan agera på uppdrag av den verifierade användaren.

-- -

**Denna arkitektur är inte en rekommendation; den är en lag. All nyutveckling och refaktorering måste följa dessa principer för att säkerställa en skalbar, säker och underhållbar produkt för 2025 och framåt.**
