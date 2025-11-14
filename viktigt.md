# ByggPilot Master-Dokument & Arkitektur (v6.0 - Härdad)

**Status:** Aktiv
**Senast Uppdaterad:** 2025-11-13
**Ägare:** Michael Ekengren Fogelström
**Paradigm:** Den Dunderstabila Genkit-Hybriden (med Modell-dirigering)

---

## 1. Vision & Kärnprinciper ("ByggPilot-Tänket")

Detta dokument är den **enda källan till sanning** för projektets arkitektur och tekniska strategi.

### 1.1. Filosofi
ByggPilot är en **proaktiv digital kollega** för hantverkare. Målet är att eliminera administrativt krångel och maximera lönsamheten.

### 1.2. Icke-förhandlingsbara Principer
1.  **Ren Kod & Tydliga Gränssnitt:** Strikt separation mellan frontend (Next.js för UI) och backend (Genkit för **all** logik).
2.  **Next.js-applikationen (frontend) får aldrig och under inga omständigheter importera, initiera eller på annat sätt vidröra `firebase-admin`-paketet. All admin-åtkomst sker exklusivt via säkra Genkit-flöden.**
3.  **Säkerhet Genom Design:** All backend-logik skyddas av Firebase Autentisering via Genkit-triggers (`onFlow`).
4.  **Autentisering är inte Auktorisering:** Varje enskilt Genkit-flöde som tar emot ett ID (t.ex. `projectId`, `invoiceId`) **måste** börja med att verifiera att den autentiserade användaren (`context.auth.uid`) har explicit behörighet att agera på den resursen. Data-åtkomst sker via en strikt Data Access Layer (`dal.ts`) som framtvingar dessa regler.
5.  **Stabilitet & Kontroll:** AI:n agerar aldrig fritt. Allt styrs via "Tool Use". AI:ns output tvingas till förutsägbara format via Zod-scheman.

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
*   **"Arbetsmyran" (`gemini-2.5-flash`):** Standardmodell för chatt, avsikts-tolkning och enklare uppgifter.
*   **"Experten" (`gemini-2.5-pro`):** Används för strukturerad data, komplext resonemang och kritiska integrationer.
*   **"Örat" & "Ögat" (`gemini-2.5-pro` med Vision/Audio):** Hanterar multimodala flöden.

### 2.3. Autentiseringsarkitektur (Kritisk)
Denna arkitektur är designad för att vara säker, effektiv och fri från omdirigerings-loopar.

1.  **"Dörrvakten" (`src/proxy.ts`):**
    *   **Syfte:** Den **enda** platsen för omdirigeringslogik.
    *   **Logik:** Denna Next.js Proxy (tidigare Middleware) körs på servern före varje sidladdning. Den kontrollerar om en session-cookie finns och omdirigerar användaren (`/` -> `/dashboard` eller `/dashboard` -> `/`) omedelbart. Den är helt frikopplad från Firebase SDK.

2.  **State Provider (`src/components/providers/AuthProvider.tsx`):**
    *   **Syfte:** Har **noll** logik för omdirigering. Dess **enda** ansvar är att lyssna på Firebase Auth's state (`onAuthStateChanged`), hämta `user`-objektet och tillhandahålla det (tillsammans med `loading`-status) till applikationens klient-komponenter via en React Context (`useAuth`).

### 2.4. Dataflöde vid AI-Interaktion (Kritisk)
För att garantera dataintegritet och säkerhet, måste alla AI-interaktioner som modifierar data följa denna ordning:
1.  **AI Genererar:** Modellen (Flash eller Pro) genererar ett output (JSON).
2.  **Zod Validerar:** Genkit-flödet **måste** omedelbart parsa och validera denna output mot ett strikt Zod-schema. Om valideringen misslyckas, kastas ett fel och flödet avbryts.
3.  **Human-in-the-Loop (HITL) eller Spara:**
    *   **Känslig uppgift (offert, ÄTA):** Den Zod-validerade datan skickas till klienten för "Human-in-the-Loop"-godkännande.
    *   **Enkel uppgift:** Den Zod-validerade datan kan sparas direkt till Firestore.

---

## 3. Strategisk Roadmap & Checklista (v6.0)
... (Roadmap-sektionen förblir densamma) ...

---

## 4. Kritiska Implementationskrav (Härdning)
*Denna sektion ersätter den gamla "Akut Granskning". Dessa är permanenta, icke-förhandlingsbara krav på all ny kod som skrivs.*

*   **[KRITISK SÄKERHET] AuthN ≠ AuthZ:**
    *   **Beskrivning:** Flera flöden tar emot ett `projectId` men verifierar **inte** att den inloggade användaren (`context.auth.uid`) har behörighet till projektet.
    *   **KRAV:** Varje flöde som hanterar resurs-specifik data **måste** inledas med en auktoriseringskontroll via `dal.ts`.

*   **[KRITISK STABILITET] AI-data måste valideras:**
    *   **Beskrivning:** Flöden får inte lita blint på AI-output.
    *   **KRAV:** All AI-genererad data som är avsedd för databasen måste först valideras mot ett Zod-schema och, för känsliga operationer, godkännas av en människa (HITL).

*   **[KRITISK STABILITET] Atomära operationer:**
    *   **Beskrivning:** "Get-or-create"-logik är sårbar för race conditions.
    *   **KRAV:** All kritisk "läs-modifiera-skriv"-logik, speciellt vid användarskapande, **måste** omslutas av en Firestore-transaktion (`runTransaction`).

*   **[KRITISK STABILITET] Robust felhantering:**
    *   **Beskrivning:** Bakgrundsfunktioner och flöden saknar ofta tillräcklig felhantering.
    *   **KRAV:** Alla flöden och triggers **måste** ha en `try/catch`-block som loggar fel aggressivt (`logger.error`) och hanterar dem på ett förutsägbart sätt.
