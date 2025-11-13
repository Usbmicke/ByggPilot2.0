# ByggPilot Master-Dokument & Arkitektur (v5.0 - Genkit Gemini 2.5)

**Status:** Aktiv
**Senast Uppdaterad:** 2025-11-12
**Ägare:** Michael Ekengren Fogelström
**Paradigm:** Den Dunderstabila Genkit-Hybriden (med Modell-dirigering)

---

## 1. Vision & Kärnprinciper ("ByggPilot-Tänket")

Detta dokument är den **enda källan till sanning** för projektets arkitektur och tekniska strategi.

### 1.1. Filosofi
ByggPilot är en **proaktiv digital kollega** för hantverkare. Målet är att eliminera administrativt krångel och maximera lönsamheten.

### 1.2. Icke-förhandlingsbara Principer
1.  **Säkerhet Genom Design:** All backend-logik skyddas av Firebase Autentisering via Genkit-triggers (`onCallGenkit`).
2.  **Stabilitet & Kontroll:** AI:n agerar aldrig fritt. Allt styrs via "Tool Use" (LAM-arkitektur). AI:ns output tvingas till förutsägbara format via Zod-scheman.
3.  **Ren Kod & Tydliga Gränssnitt:** Strikt separation mellan frontend (Next.js för UI) och backend (Genkit för **all** logik).

---

## 2. Arkitektur-Blueprint

### 2.1. Systemöversikt

*   **Frontend (UI-lagret):**
    *   **Ramverk:** Next.js
    *   **Ansvar:** Rendera UI, hantera klient-sidig state, och anropa backend. `useChat` från Vercel AI SDK används för chatt-gränssnittet.

*   **Backend (Logik- & Datalagret):**
    *   **Ramverk:** Firebase Genkit
    *   **Ansvar:** **All affärslogik,** databas-interaktioner (via `dal.ts`), och AI-orkestrering.

### 2.2. Modell-Strategi (Hjärnans Arkitektur)

ByggPilots AI är ett system av specialiserade modeller som dirigeras av Genkit för maximal prestanda och kostnadseffektivitet.

*   **"Arbetsmyran" (Låg kostnad, hög hastighet): `gemini-2.5-flash`**
    *   **Syfte:** Standardmodell för majoriteten av alla chattkonversationer, avsikts-tolkning och enklare uppgifter. Blixtsnabb och billig i drift.

*   **"Experten" (Hög kapacitet, djupt resonemang): `gemini-2.5-pro`**
    *   **Syfte:** Används av Genkit för uppgifter som kräver hög precision och komplext resonemang.
    *   **Användningsfall:**
        *   **Strukturerad Data:** Generering av offerter, riskanalyser, och arbetsberedningar där output måste följa komplexa Zod-scheman.
        *   **Komplext Resonemang:** Analys av data från "Företagets Hjärna" (RAG).
        *   **Kritiska Integrationer:** Generering av SIE4-filer eller juridiska dokument.

*   **"Örat" & "Ögat" (Multimodala Modeller): `gemini-2.5-pro` (med Vision/Audio-input)**
    *   **Syfte:** Hanterar specialiserade flöden som kräver ljud- eller bilduppladdning.
    *   **Användningsfall:**
        *   **`audioToAtaFlow`:** Transkriberar ljud, förstår avsikten och skapar ett ÄTA-underlag i ett enda anrop.
        *   **`analyzeImageForPpeFlow`:** Analyserar bild för att kontrollera användning av personlig skyddsutrustning.

### 2.3. Kärnflöden

*   **Autentisering (`getOrCreateUserAndCheckStatusFlow`):**
    *   Hanteras av en central `AuthProvider` i Next.js som anropar ett Genkit-flöde via `onCallGenkit` vid inloggning för att synka användaren mot Firestore.

*   **Standard-chatt (`chatFlow`):**
    *   **Modell:** `gemini-2.5-flash`
    *   **Logik:** Hanterar den primära chatten. Flash-modellen är konfigurerad att kunna anropa relevanta verktyg (RAG-sökning, skapa projekt, etc.).

*   **Ljud-till-ÄTA (`audioToAtaFlow`):**
    *   **Modell:** `gemini-2.5-pro` (multimodal)
    *   **Logik:** Ett specialiserat flöde som endast har tillgång till verktyget `createChangeOrderTool` för att garantera korrekt output.

*   **Offert-generering (`generateQuoteFlow`):**
    *   **Modell:** `gemini-2.5-pro`
    *   **Logik:** Dedikerat flöde som använder RAG-verktyg för att grunda offerten i företagets data och sedan generera ett perfekt formaterat dokument.

---

## 3. Strategisk Roadmap & Checklista (v5.0)

### Fas 0-1: Grund & Sanering
- [X] `NextAuth.js` och all gammal API-logik är helt raderad.
- [X] Projektet har en ren struktur med `genkit-project/` för backend och `src/` för frontend.
- [X] `dal.ts` och `schemas.ts` är etablerade som enda källor för datalager och validering.

### Fas 2: Kärnflöde (Auth)
- [X] Backend-flöde `getOrCreateUserAndCheckStatusFlow` är implementerat.
- [X] Frontend `AuthProvider` med `signInWithRedirect` är implementerat.
- [X] Onboarding-flödet är anslutet till Genkit.

### Fas 3-4: "Hjärnan" & Kärnfunktionalitet
- [X] `chatFlow` är implementerat i Genkit med `gemini-2.5-flash`.
- [X] Frontend `useChat` är anslutet till Genkit-slutpunkten.
- [X] Specialiserade flöden (`generateQuoteFlow`, `audioToAtaFlow`) är definierade med `gemini-2.5-pro`.
- **[PÅGÅR NU]** 4.1: Implementation av "Företagets Hjärna" (RAG) med Gemini File Search API.
- **[PÅGÅR NU]** 4.2: Implementation av resterande kärnverktyg som `Flows`.

### Fas 5: Verifiering & Härdning
- [ ] 5.1: Verifiera bygget med `npx tsc --noEmit` och `npm run build`.
- [ ] 5.2: Implementera juridisk härdning (friskrivningar).
- [ ] 5.3: Implementera teknisk härdning (Rate Limiting, Human-in-the-Loop).
- [ ] 5.4: Skapa kritiska E2E-tester med Playwright.
