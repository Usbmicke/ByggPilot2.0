# ByggPilot Master-Dokument & Arkitektur (v4.1 - Genkit)

**Status:** Aktiv
**Senast Uppdaterad:** 2025-11-12
**Ägare:** Michael Ekengren Fogelström
**Paradigm:** Den Dunderstabila Genkit-Hybriden

---

## 1. Vision & Kärnprinciper ("ByggPilot-Tänket")

Detta dokument är den **enda källan till sanning** för projektets arkitektur och tekniska strategi. Det är designat för att en ny utvecklare eller AI-assistent omedelbart ska förstå projektets "hur" och "varför".

### 1.1. Filosofi
ByggPilot är en **proaktiv digital kollega** för hantverkare. Målet är att eliminera administrativt krångel och maximera lönsamheten. Empati för användarens vardag är kärnan i varje beslut.

### 1.2. Icke-förhandlingsbara Principer
1.  **Säkerhet Genom Design:** All backend-logik skyddas av Firebase Autentisering via Genkit-triggers (`onCallGenkit`). Klient-sidan litas aldrig på. Databasen skyddas av tvingande Firestore Security Rules.
2.  **Stabilitet & Kontroll:** AI:n agerar aldrig fritt. Allt styrs via "Tool Use" (LAM-arkitektur). AI:ns output tvingas till förutsägbara format via Zod-scheman.
3.  **Ren Kod & Tydliga Gränssnitt:** Strikt separation mellan frontend och backend.
    *   **Frontend (Next.js):** Hanterar **endast** UI och användarinteraktion.
    *   **Backend (Genkit):** Hanterar **all** affärslogik, databas- och API-anrop.

---

## 2. Arkitektur-Blueprint

### 2.1. Systemöversikt

*   **Frontend (UI-lagret):**
    *   **Ramverk:** Next.js
    *   **Ansvar:** Rendera UI, hantera klient-sidig state, och anropa backend. `useChat` från Vercel AI SDK används för att bygga ett responsivt chatt-gränssnitt.

*   **Backend (Logik- & Datalagret):**
    *   **Ramverk:** Firebase Genkit
    *   **Ansvar:** **All affärslogik.** Allt definieras som `Flows` och `Tools`. Hanterar databaslogik (via `lib/dal.ts`), validering (Zod), och AI-orkestrering.

### 2.2. Autentiseringsflödet (Högsta Standard)

Detta är det **enda korrekta** flödet och ersätter all tidigare logik (NextAuth, manuella tokens).

1.  **Initiering (Frontend):** Användaren klickar på "Logga in med Google". Detta anropar `signInWithRedirect` från Firebase klient-SDK. Hela sidan omdirigeras till Google.
2.  **Retur & Verifiering (Frontend):** Användaren återvänder till appen. En central `AuthProvider`-komponent fångar upp detta via `onAuthStateChanged` och `getRedirectResult`.
3.  **Synkronisering (Backend-anrop):** `AuthProvider` anropar ett säkert Genkit-flöde (`getOrCreateUserAndCheckStatusFlow`) via `onCallGenkit`. Triggern validerar automatiskt användarens token.
4.  **Kontroll (Backend):** Genkit-flödet använder `auth.uid` för att kolla i Firestore (via `lib/dal.ts`) om användaren är ny eller har slutfört onboarding. Det returnerar `{ isOnboarded: boolean }`.
5.  **Navigering (Frontend):** `AuthProvider` tar emot svaret och använder Next.js `useRouter` för att sömlöst navigera användaren till `/dashboard` eller `/onboarding` **utan** en full sid-omladdning.

### 2.3. Chattflödet (Förstå detta för felsökning)

Om chatten "inte svarar" beror det på ett avbrott i denna kedja:

1.  **Frontend:** `useChat` (Vercel AI SDK) skickar användarens input. Dess `api`-parameter pekar **direkt** på Genkits `onCallGenkit` HTTP-slutpunkt för chattflödet.
2.  **Backend Trigger:** `onCallGenkit` tar emot anropet, validerar användarens auth-token och startar `chatFlow`. Den har inbyggt stöd för att strömma svaret tillbaka.
3.  **Backend Flow (`chatFlow`):** Flödet orkestrerar konversationen, använder "Tools" (som `askKnowledgeBaseTool` eller `createQuoteTool`) och genererar ett svar.
4.  **Frontend:** `useChat` tar emot det strömmande svaret och renderar det i realtid.

**EXEMPEL PÅ GAMMAL, FÖRBJUDEN KOD (från `app/api`):**
```javascript
// DETTA ÄR FEL! Använder inte Genkit, blandar logik, osäker.
const vertex_ai = new VertexAI({ project: project, location: location });
// ... manuell hantering av prompt och anrop ...
return res.status(200).send({ message: "..." });
```
**Korrekt metod är alltid att paketera logik i ett `defineFlow` och exponera det säkert med `onCallGenkit`.**

---

## 3. Strategisk Roadmap & Checklista (Totalrenovering v4.1)

Detta är den aktiva handlingsplanen.

### Fas 0: Kirurgisk Sanering
- [X] Radera `app/api/`-mappen.
- [X] Radera all `NextAuth.js`-kod.
- [X] Avinstallera `next-auth`-paket.
- [X] **Återstår:** Radera `src/app/types/` (planerat i denna session).

### Fas 1: Ny Stabil Grund
- [X] Genkit initierat i `genkit-project/`.
- [X] `lib/dal.ts` etablerat som Data Access Layer.
- [X] `lib/schemas.ts` etablerat för Zod-scheman.
- [X] Tvingande Firestore Security Rules är på plats.

### Fas 2: Återuppbyggnad av Kärnflöden (Auth & Onboarding)
- **[PÅGÅR NU]** 2.1: Bygg backend-flöde `getOrCreateUserAndCheckStatusFlow`.
- **[PÅGÅR NU]** 2.2: Bygg frontend `AuthProvider` med `onAuthStateChanged` och `signInWithRedirect`.
- **[PÅGÅR NU]** 2.3: Återanslut Onboarding-UI till ett nytt `onboardingCompleteFlow`.

### Fas 3: Totalrenovering av "Hjärnan" (Chatten)
- [ ] 3.1: Bygg `chatFlow` i Genkit som hanterar "Tool Use" och streaming.
- [ ] 3.2: Återanslut frontend-UI med `useChat` pekat mot Genkit-slutpunkten.

### Fas 4: Implementera Kärnfunktionalitet (LAM & RAG)
- [ ] 4.1: Implementera "Företagets Hjärna" (RAG) med Gemini File Search API för att eliminera hallucinationer.
- [ ] 4.2: Implementera kärnverktyg som `Flows` (t.ex. `createOfferFlow`, `audioToAtaFlow`, `analyzeSpillWasteFlow`).

### Fas 5: Verifiering & Härdning
- [ ] 5.1: Verifiera bygget med `npx tsc --noEmit` och `npm run build`.
- [ ] 5.2: Implementera juridisk härdning (friskrivningar).
- [ ] 5.3: Implementera teknisk härdning (Rate Limiting, Human-in-the-Loop).
- [ ] 5.4: Skapa kritiska E2E-tester med Playwright.
