
# Viktigt 2.0: Arkitektur för Byggpilot (Horisont 2025)

Detta dokument ersätter alla tidigare versioner och utgör den enda källan till sanning för Byggpilot-projektets tekniska arkitektur. Målet är att säkerställa en robust, säker och framtidssäker applikation.

## Grundprinciper

### 1. Den Hermetiska Uppdelningen (Frontend vs. Backend)

Det råder en absolut och icke-förhandlingsbar uppdelning mellan frontend (Next.js) och backend (säker servermiljö).

*   **Frontend (Next.js-appen i `/src`):**
    *   Hanterar **ENDAST** UI, state management och klient-logik.
    *   Använder **ENDAST** den klient-anpassade Firebase SDK:n (`@firebase/auth`, `@firebase/firestore`, etc.).
    *   **FÅR ALDRIG** innehålla `firebase-admin` eller några server-hemligheter. Filen `admin.ts` är strikt förbjuden i Next.js-källkoden.

*   **Backend (Säker Servermiljö, t.ex. Firebase Functions):**
    *   Är den **ENDA** platsen där `firebase-admin` används.
    *   Hanterar all säkerhetskritisk logik: verifiering av ID-tokens, hantering av användarroller, och exekvering av Genkit AI-flöden.
    *   Kommunikation med frontend sker uteslutande via säkra API-anrop.

### 2. Den Officiella Dörrvakten (`middleware.ts`)

Applikationens åtkomstkontroll hanteras av **ENDAST EN** mekanism: en `middleware.ts`-fil i projektets rot.

*   **Syfte:** Agera som en blixtsnabb "dörrvakt" som körs före varje sidladdning.
*   **Logik:** Den inspekterar **endast två saker**: 1) Den begärda URL:en och 2) Förekomsten av en giltig `session`-cookie.
*   **Förbud:** Den gamla `proxy.ts`-metoden är utfasad och **får inte användas**. Middleware är den officiella, framtidssäkra standarden från Vercel/Next.js.

### 3. Den Säkra Sessionshanteringen (Cookie-flödet)

Autentisering och sessionshantering följer ett säkert och väldefinierat flöde för att koppla samman frontend-inloggning med backend-verifiering.

1.  **Inloggning (Klient):** Användaren loggar in via Google i sin webbläsare med hjälp av Firebase Client SDK i `AuthProvider.tsx`.
2.  **Signal till Backend (API-anrop):** `AuthProvider`, efter en lyckad inloggning, skickar ett `POST`-anrop till vår backend-API-väg: `/api/auth/session`.
3.  **Cookie-skapande (Backend):** API-vägen (`/api/auth/session/route.ts`) tar emot anropet. Den skapar och sätter en **`httpOnly`, `secure` `session`-cookie**. Detta är kritiskt, då `httpOnly` förhindrar att klient-skript kan komma åt cookien, vilket skyddar mot XSS-attacker.
4.  **Verifiering (Dörrvakten):** Vid varje ny sidförfrågan läser `middleware.ts` `session`-cookien. Om cookien finns, släpps användaren in till skyddade sidor. Om den saknas, omdirigeras de till landningssidan.

### 4. Centraliserad Konfiguration

För att undvika fel och säkerställa underhållsbarhet, centraliseras all konfiguration.

*   **Klient-konfiguration:** All Firebase-klientkonfiguration finns i **ENDAST EN** fil: `src/lib/config/firebase-client.ts`. Alla komponenter och providers importerar härifrån.
*   **Backend-konfiguration:** Hanteras via säkra miljövariabler (`.env.local`) som endast är tillgängliga på serversidan.

---

## Framtida Integration: Genkit AI-flöden

De planerade chatt-flödena (t.ex. `Gemini 2.5 Flash` för snabba frågor, `Gemini 2.5 Pro` för djupare analys) kommer att implementeras med full respekt för denna arkitektur.

*   **Implementation:** Varje Genkit-flöde kommer att exponeras som en säker Firebase Function (eller annan serverless endpoint).
*   **Anrop:** Frontend-appen kommer att anropa dessa endpoints via autentiserade API-anrop. Användarens ID-token kommer att skickas med i `Authorization`-headern och verifieras av backend-funktionen med `firebase-admin` innan flödet exekveras.
*   **Resultat:** Detta garanterar att den tunga AI-bearbetningen och eventuella hemliga API-nycklar förblir säkra på servern, medan Next.js-appen förblir lättviktig och snabb.

---
**Denna arkitektur är vår kompass. Alla nya funktioner och all kodrefaktorering måste följa dessa principer.**
