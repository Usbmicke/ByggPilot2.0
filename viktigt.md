# ByggPilot Master Plan & Arkitektur (v4.0 - Genkit Edition)

**Status:** Aktiv
**Senast Uppdaterad:** 2025-11-11
**Ägare:** Michael Ekengren Fogelström
**Arkitektur-paradigm:** Genkit Hybrid

---

## 1. Kärnvision & Filosofi: "ByggPilot-Tänket"

ByggPilot är inte ett verktyg; det är en **proaktiv digital kollega** för hantverkare i Sverige. Målet är att eliminera "pappersmonstret", ge hantverkaren full kontroll över sin tid och maximera lönsamheten i varje projekt.

- **Grundare:** Michael Ekengren Fogelström.
- **Kärnvärde:** Byggd av en hantverkare, för hantverkare. Empati och en djup förståelse för användarens stressiga vardag genomsyrar varje beslut.

### 1.1 Kärnprinciper (Icke-förhandlingsbara)

1.  **Säkerhet Genom Design:** Säkerhet implementeras i varje lager. Vi använder Firebase Genkits inbyggda autentisering (`onCallGenkit`) och Firebase App Check för att säkra vår backend. Klientlogik litas aldrig på.
2.  **Stabilitet Först:** En buggfri, förutsägbar och blixtsnabb användarupplevelse prioriteras över allt annat. Vi använder dedikerade ramverk (Genkit för backend, Next.js för frontend) för att säkerställa att varje del av systemet är robust och specialiserad för sitt syfte.
3.  **Ren Kod & Tydliga Gränssnitt:** Koden ska vara lätt att läsa och underhålla. Vi följer en strikt separation mellan frontend och backend. Frontend (Next.js) hanterar UI, backend (Genkit) hanterar all affärslogik och databasinteraktion.

### 1.2 Agentens Persona & Konversationsregler

- **Persona:** Erfaren, lugn, kompetent, självsäker och förtroendeingivande. En expertkollega, inte en undergiven assistent. Ledord: "Planeringen är A och O!" och "Tydlig kommunikation och förväntanshantering är A och O!".
- **Proaktivitet är Standard:** Agera, fråga inte. Förbered utkast internt, men agera aldrig externt utan användarens explicita godkännande.
- **En Fråga i Taget:** Varje svar ska vara kort, koncist och avslutas med en enda, tydlig motfråga för att driva konversationen framåt.

---

## 2. Arkitektur-Blueprint: Den Dunderstabila Genkit-Hybriden

Detta är den enda källan till sanning för ByggPilots arkitektur. Den är designad för maximal stabilitet, säkerhet och skalbarhet genom att använda de bästa verktygen för varje jobb.

### 2.1 Översikt: Frontend vs. Backend

- **Frontend (Presentation Layer):**
    - **Ramverk:** Next.js
    - **Hosting:** Vercel
    - **Ansvar:** Allt som användaren ser och interagerar med. Bygga UI-komponenter, hantera klient-sidig state (`useSWR`), och anropa backend.
    - **AI-integration:** **Vercel AI SDK** används *enbart* för UI-komponenter som `useChat`-hooken för att skapa ett responsivt chatt-gränssnitt.

- **Backend (Business & Data Layer):**
    - **Ramverk:** **Firebase Genkit**
    - **Hosting:** Firebase (Cloud Functions v2 / App Hosting)
    - **Ansvar:** **All affärslogik.** Att definiera och orkestrera AI-flöden, hantera "Tool Use" (verktygsanrop), anropa databasen (Firestore), interagera med externa API:er (Google Drive, SMHI), och hantera all datavalidering (Zod).

### 2.2 Filstruktur & Ansvarsområden

- **Next.js Projektet (Frontend):**
    - `src/app/`: Next.js-routes, Server Components och Client Components.
    - `src/components/`: Återanvändbara React-komponenter (UI-fokuserade).
    - `src/lib/`: Frontend-specifika hjälpfunktioner, och nu även de centrala Zod-schemana.
    - **FÖRBJUDET:** Inga direkta databas-anrop. Ingen komplex affärslogik. Inga `api/chat`-routes för AI-logik.

- **Genkit Projektet (Backend):**
    - `genkit-project/` (separat katalog)
    - `src/index.ts`: Definierar alla Genkit-flöden (`defineFlow`).
    - `src/tools/`: Definierar alla "verktyg" som AI:n kan anropa (`defineTool`), t.ex. `createQuote.ts`, `getWeather.ts`. Varje verktyg validerar sin input med Zod.
    - `src/lib/`: Databasinteraktioner (Firestore-anrop). All kod som pratar med databasen MÅSTE finnas här.

### 2.3 Autentisering & Säkerhet: Enkelt och Robust

Vi överger helt komplexiteten med `NextAuth` och manuell token-hantering.

- **Flöde:**
    1. Användaren loggar in på frontend-appen via **Firebase Authentication (klient-SDK)**.
    2. Frontend (`useChat`) anropar ett Genkit-flöde som är exponerat via `onCallGenkit`.
    3. `onCallGenkit`-triggern **validerar automatiskt** användarens Firebase Auth-token på servern. Om token är giltig, blir användarens `auth.uid` tillgänglig i Genkit-flödets kontext.
    4. Genkit-flödet använder `auth.uid` för att säkert hämta och spara data i Firestore.

Detta eliminerar behovet av komplicerad middleware i Next.js. Säkerheten är inbyggd, inte påskruvad.

### 2.4 Data & AI: Förutsägbart och Icke-Hallucinerande

- **Tool Use (LAM-arkitektur):** AI:n får **aldrig** agera direkt. Genkit tvingar modellen att returnera ett strukturerat `tool_calls`-objekt. Vår Genkit-kod tar emot denna begäran, validerar den med Zod, och exekverar den. Detta gör AI:ns handlingar 100% förutsägbara.

- **RAG (Företagets Hjärna):** För att eliminera hallucinationer (t.ex. falska BSAB-koder) används Genkits inbyggda RAG-funktioner.
    1. Kunskapsdokument (PDFs, text) laddas upp och indexeras via **Gemini File Search API**.
    2. I Genkit definierar vi ett "retriever-tool" som använder detta index.
    3. Master-Prompten instruerar AI:n att alltid använda detta verktyg för fack-specifika frågor. Svaren blir därmed "jordade" i verklig data.

---

## 3. Strategisk Roadmap: Totalrenovering v4.0

Denna plan är uppdaterad för att reflektera den nya Genkit-arkitekturen.

- **Fas 0: Total Nollställning & Kirurgisk Sanering:**
    - Mål: Skapa en kliniskt ren kodbas. Radera all gammal backend-logik från Next.js-projektet (`api/`, `actions/` som pratar med db, `services/`, `contexts/`).
    - **Status (2025-11-11):** KLAR. All affärslogik för datatyper har centraliserats till Zod-scheman under `src/lib/schemas/`. Den gamla, osäkra `app/types`-katalogen är nu redo att raderas.
- **Fas 1: Etablering av den Nya Grunden:**
    - Mål: Sätta upp de två separata, men sammankopplade, projekt-strukturerna.
    - Åtgärd: Initiera ett nytt Genkit-projekt. Konfigurera `onCallGenkit`-triggern.
    - Åtgärd: Konfigurera Next.js-frontend att anropa ett simpelt "helloWorld" Genkit-flöde för att verifiera anslutning och autentisering.
- **Fas 2: Återuppbyggnad av Kärnflöden:**
    - Mål: Återansluta den befintliga UI:n till den nya Genkit-backend.
    - Åtgärd: Migrera logiken från gamla Server Actions (t.ex. `updateUserProfile`) till nya Genkit-flöden. Uppdatera UI-komponenterna att anropa dessa flöden.
- **Fas 3: Totalrenovering av "The Co-Pilot" (Chatten):**
    - Mål: Bygga den nya, stabila och intelligenta chatten från grunden.
    - Åtgärd: Bygg chattens backend som ett Genkit-flöde som använder "Tool Use" och strömmar svar.
    - Åtgärd: Implementera `useChat`-hooken i Next.js-frontenden för att konsumera det strömmande svaret från Genkit.
    - Åtgärd: Återuppbygg "Offerthanteringen" som ett `createQuote`-verktyg i Genkit.
- **Fas 4 & 5:** Implementation av högvärdiga funktioner (Väder, RAG, **Materialspill-analys via bild ('Gemini Banan')**) och långsiktig kvalitetssäkring (tester, övervakning) enligt samma principer, där all logik byggs som robusta Genkit-verktyg.
