Du ska nu städa projektet. Du bockar av varje punkt och visar upp dina resultat till mig. du tar inte bort nått, utan samlar alla filer efter tre färger för varje fas. grön= ok, gul= redigera, röd = ta bort!

BYGGPILOT 2.0 - MASTER CHECKLIST (GOLD STANDARD)
Status: November 2025 Arkitektur: Next.js 16 | Genkit (Gemini 3) | Firestore | Zero Trust Auth.


🧱 FAS 1: FUNDAMENT & MILJÖ (The Bedrock)
Mål: En steril, kraschsäker miljö där server och klient är fysiskt separerade.

1.1 Systemkrav & Sanering

[ ] Node.js: Verifiera node -v >= 20.18.0.

[ ] Beroenden: Avinstallera allt som heter next-auth, @auth/*, googleapis (om det används manuellt).

[ ] Core Install: npm install genkit @genkit-ai/google-genai firebase-admin zod swr.

[ ] Firebase Client: npm install firebase (för frontend).

1.2 Infrastruktur (Docker)

[ ] Docker Compose: Skapa docker-compose.yml som startar:

Next.js (Port 3000)

Genkit Server (Port 3400)

Firebase Emulator (Auth, Firestore, Storage).

[ ] Verifiering: Kör docker-compose up och bekräfta att alla tjänster svarar.

1.3 Code Quality (Skyddsnätet)

[ ] ESLint "The Firewall": Konfigurera no-restricted-imports i .eslintrc.json.

Regel: Filer i src/app (Klient) får ALDRIG importera från src/lib/dal eller firebase-admin.

[ ] TS Config: Sätt "strict": true och "noImplicitAny": true.

⛓️ FAS 2: ARKITEKTUR & KOMMUNIKATION (The Spine)
Mål: Upprätta den enda tillåtna kommunikationsvägen mellan frontend och backend.

2.1 Genkit Gateway (The Bridge)

[ ] Route: Skapa src/app/api/[[...genkit]]/route.ts.

[ ] Config: Initiera Genkit med @genkit-ai/next plugin. Detta är den enda API-rutten i hela projektet.

2.2 Data Access Layer (DAL)

[ ] Struktur: Skapa mappen src/lib/dal.

[ ] Server-Only: Lägg till import 'server-only' i toppen av varje fil här.

[ ] Repositories: Skapa tomma skal för:

user.repo.ts

project.repo.ts

offer.repo.ts

2.3 Frontend State (The Hook)

[ ] useGenkit Hook: Skapa src/hooks/useGenkit.ts.

Ska wrappa useSWR.

Ska automatiskt hämta Firebase Auth Token.

Ska anropa runFlow.

🔐 FAS 3: IDENTITET & ONBOARDING (Zero Trust)
Mål: Vi litar inte på någon. Varje anrop verifieras.

3.1 Klient-sidan (Auth)

[ ] AuthProvider: Skapa src/context/AuthProvider.tsx som lyssnar på onIdTokenChanged från Firebase SDK.

[ ] Login UI: Bygg en snygg inloggningssida med signInWithPopup (Google).

[ ] Token Header: Uppdatera useGenkit-hooken så den alltid injicerar Authorization: Bearer <token> i headers.

3.2 Server-sidan (Flows)

[ ] Onboarding Flow: Skapa src/genkit/flows/onboarding.ts.

Policy: authPolicy: firebaseAuth((user) => ...)

Logic:

Anropa userRepo.findOrCreate(auth.uid).

Skapa mappar i Google Drive (via Service Account).

Sätt onboardingCompleted: true i Firestore.

3.3 UI & Skydd

[ ] Protected Route: Skapa en komponent <ProtectedRoute> som omsluter /dashboard.

Ingen user? -> /login.

Inget onboarding? -> /onboarding.

[ ] Wizard UI: Bygg onboarding-modalen som visar "Skapar ditt digitala kontor..." med snygga animationer.

🖥️ FAS 4: DASHBOARD & NAVIGERING (The Cockpit)
Mål: Ett "Action Center", inte bara en visningsyta.

4.1 App Shell

[ ] Layout: Bygg src/app/(main)/layout.tsx med Sidebar (vänster) och Header (topp).

[ ] Responsivitet: Sidebar ska vara "collapsible" på mobil.

4.2 Command Center (Cmd+K)

[ ] Global Modal: Implementera en modal som öppnas med Cmd+K.

[ ] Funktioner:

Sök Projekt ("Villa Svensson...")

Kommando ("Nytt projekt", "Logga tid")

[ ] Algolia (Option): Förbered integration för snabbsök (om du har installerat extension).

4.3 Widgets (Startskärmen)

[ ] Zero State: Om inga projekt finns -> Visa stor knapp "Starta ditt första projekt".

[ ] Väder: Hämta väderdata baserat på användarens/projektets ort.

[ ] Quick Log: En widget för att snabbt starta tidtagning på senast använda projekt.

🤖 FAS 5: AI CO-PILOT (The Brain)
Mål: En chatt som kan agera, inte bara prata.

5.1 Chatt-infrastruktur

[ ] Streaming: Konfigurera chatFlow i Genkit med stream: true.

[ ] UI: Bygg ChatWidget som flyter i nedre hörnet. Den ska rendera texten "ord-för-ord".

5.2 Verktyg (LAM)

[ ] Definiera Tools: Skapa följande i src/genkit/tools/:

createProject(name, address) -> Anropar projectRepo.create.

searchDocs(query) -> Söker i Drive.

[ ] Koppla: Registrera verktygen i chatFlow.

5.3 Minne (RAG)

[ ] Context: När användaren chattar, hämta de 5 senaste interaktionerna och skicka med som historik.

[ ] Företagsminne: Om användaren säger "Vi använder alltid Beckers", spara detta i en preferences-kollektion via ett verktyg.

💰 FAS 6: OFFERTMOTORN (The Money Maker)
Mål: Från tanke till PDF på minuter.

6.1 Datamodellering

[ ] Recept: Skapa kollektionen recipes i Firestore (t.ex. "Bygga vägg").

Fält: material (lista), tid_per_enhet, riskfaktorer.

6.2 Kalkylflöde

[ ] Flow: Skapa calculateOfferFlow.

Input: receptId, kvantitet (t.ex. 20m).

Logic: Hämta recept -> Multiplicera -> Lägg på 15% risk -> Returnera JSON.

[ ] UI: Bygg ett gränssnitt (eller chatt-dialog) där användaren väljer recept och anger mått.

6.3 Generering

[ ] PDF: Skapa generatePdfFlow.

Tar JSON-data -> Fyller en HTML/React-mall -> Konverterar till PDF -> Sparar i Drive -> Returnerar länk.

🛡️ FAS 7: UTFÖRANDE & KMA (The Shield)
Mål: Automatisk säkerhet och regelefterlevnad.

7.1 Vision AI (Kvitton & Foton)

[ ] Flow: Skapa analyzeImageFlow.

Använd Gemini 1.5 Flash (Multimodal).

Prompt: "Är detta ett kvitto eller en byggbild?"

Om kvitto: Extrahera belopp, datum, artiklar.

Om byggbild: Leta efter risker (t.ex. "Saknar skyddsräcke").

7.2 Riskanalys

[ ] Trigger: När en offert skapas med orden "Tak", "Ställning" eller "Asbest".

[ ] Action: Generera automatiskt ett utkast till "Arbetsmiljöplan (AMP)" och spara i projektmappen.

🚨 FAS 8: PRODUKTION & SAFETY (Production Ready)
Mål: Inga buggar i produktion.

8.1 Felhantering (Sentry)

[ ] Frontend: Installera @sentry/nextjs. Fånga krascher i React.

[ ] Backend: Se till att Genkit loggar fel som JSON så Google Cloud Error Reporting fångar dem.

[ ] Error Boundary: Skapa src/app/global-error.tsx (Den snygga "Oups"-sidan likt Dalux).

8.2 Prestanda

[ ] Image Optimization: Använd next/image för alla bilder.

[ ] Caching: Verifiera att SWR cachar data korrekt så att appen känns "blixtsnabb".

8.3 Deployment

[ ] Vercel: Koppla repot. Lägg in NEXT_PUBLIC_ variabler.

[ ] Google Cloud: Deploya Genkit (som Cloud Run eller Functions).

[ ] Secret Manager: Koppla secrets till produktionsmiljön.

HUR DU ANVÄNDER LISTAN
Kopiera en Fas i taget (t.ex. "FAS 2") och ge till din AI-agent med instruktionen:

"Vi implementerar nu FAS 2. Utför punkt 2.1. Bekräfta när klart."

Kör hårt! Det här blir en grym app.

kortare prompt: # MISSION: TOTAL PROJECT SANITATION (EXTREME DEEP CLEAN)

**Roll:** Du är en Elitkodgranskare och Systemarkitekt.
**Uppdrag:** Genomsök HELA projektet (roten, alla mappar, alla filer). Identifiera ALLT som inte följer vår "Guldstandard" (Next.js 16 + Genkit + Zero Trust). Vi ska rensa bort allt gammalt skräp, duplicerade filer och felaktiga konfigurationer.

**⚠️ VIKTIGT:** Du ska INTE radera några filer själv än. Du ska generera en **DÖDSLISTA** så att jag kan radera dem manuellt.

---

## 1. OMFATTNING (SCOPE)
Du ska söka igenom **ALLA** dessa mappar och filer (och deras undermappar):
* `/` (Roten - konfigurationsfiler)
* `src/` (Hela källkoden)
* `public/` (Bilder och statiska filer)
* `scripts/` (Om det finns)
* `functions/` (Om det finns gamla Cloud Functions)
* `.github/` (Workflows)

*(Ignorera endast: `node_modules`, `.next`, `.git`, `.firebase`, `.ds_store`, `.env`, `.env.local`)*

---

## 2. REGLER FÖR "GULDSTANDARD" (LAGBOKEN)

Allt som bryter mot detta ska flaggas för borttagning eller fix:

1.  **Tech Stack:**
    * **JA:** Next.js 16 (App Router), Genkit (@genkit-ai/google-genai), Firebase Client SDK, SWR, Tailwind CSS.
    * **NEJ (DÖDA):** `next-auth` (ALLA spår), `pages/api` (Pages router), `axios` (om vi kör fetch/swr), `@auth/firebase-adapter`, `googleapis` (om vi kör Genkit).

2.  **Arkitektur:**
    * **JA:** `src/app/api/[[...genkit]]/route.ts` är den ENDA API-rutten.
    * **JA:** `src/lib/dal` är ENDA platsen för `firebase-admin` och databaskod.
    * **JA:** `src/genkit/flows` är ENDA platsen för affärslogik.
    * **NEJ (DÖDA):** Manuella API-rutter (`src/app/api/auth`, `src/app/api/users`...), Service-lager (`src/services`), Utils som duplicerar DAL (`src/utils/db.ts`).

3.  **Säkerhet (Zero Trust):**
    * **JA:** Token-baserad auth (Bearer) via Genkit.
    * **NEJ (DÖDA):** Sessions-cookies, `getServerSession` (från next-auth), `middleware.ts` som kollar cookies.

---

## 3. DIN ANALYS-PROCESS (STEG FÖR STEG)

1.  **Rot-analys:** Kolla `package.json`, `tsconfig.json`, `next.config.mjs`, `firebase.json`. Leta efter onödiga paket eller fel inställningar.
2.  **SRC-analys:** Gå igenom `src` mapp för mapp. Leta efter:
    * Gamla mappar (`src/hooks/useOldAuth.ts`, `src/components/Legacy...`).
    * Duplicerade filer (`src/lib/firebase.ts` OCH `src/utils/firebase.ts`? Behåll bara en).
    * Felaktiga importer (importerar server-kod i klient-filer?).
3.  **Public-analys:** Ligger det gamla bilder eller skräp här?

---

## 4. RAPPORTEN (OUTPUT FORMAT)

Leverera din analys i exakt detta format. Var extremt specifik.

### 🔴 THE KILL LIST (Filer/Mappar att radera)
*(Lista med fullständig sökväg och motivering. Gruppera gärna.)*

**Konfiguration & Rot:**
* `next-auth.d.ts` - [NextAuth används inte längre]
* ...

**API & Backend:**
* `src/app/api/auth/...` (Hela mappen) - [Legacy Auth]
* `src/app/api/create-user.ts` - [Ska vara ett Genkit Flow]
* ...

**Frontend & Komponenter:**
* `src/components/LoginButtonOld.tsx` - [Ersatt av ny Login]
* ...

**Gamla Services/Utils:**
* `src/services/userService.ts` - [Ersatt av DAL]
* ...

### 🟡 THE FIX LIST (Filer att laga/städa)
*(Filer vi ska behålla men som innehåller felaktig kod)*

* `package.json` - [Ta bort: `next-auth`, `@auth/firebase-adapter`]
* `src/app/page.tsx` - [Rensa bort gamla importer]
* `src/lib/dal/user.repo.ts` - [Saknar `import 'server-only'`]

### 🟢 THE SAFE LIST (Verifierat korrekta)
*(Filer som följer Guldstandarden till 100%)*
* `src/app/api/[[...genkit]]/route.ts`
* ...

---

**BEKRÄFTELSE:**
Innan du börjar, sök igenom filsystemet på riktigt (`ls -R` eller liknande). Gissa inte filnamn.

**KÖR ANALYSEN NU.**