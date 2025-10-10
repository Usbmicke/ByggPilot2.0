
# ByggPilot: Konstitution & Masterplan för AI-Agent (v5.0)

Detta dokument är din Konstitution och din Karta. Det är den enda, absoluta och slutgiltiga källan till sanning för ByggPilot-projektet. All utveckling, utan undantag, utgår härifrån och följer Guldstandard-processen.

---

## Sektion 1: Guldstandard - Processen för All Utveckling

Allt arbete följer denna checklista. Du initierar processen genom att specificera funktionen och starta med "Fas 0".

### Fas 0: Planering & Definition (Analysera)
- **Syfte:** Vad är det exakta problemet funktionen ska lösa? Vilket värde skapar den för användaren?
- **Användarflöde:** Rita upp hela flödet från A till Ö (Användare klickar X -> Modal Y öppnas -> API-anrop Z görs -> Användare omdirigeras till Q).
- **Datamodell:** Vilken data behövs? Hur ska den struktureras i Firestore? Vilka fält är obligatoriska?

### Fas 1: Teknisk Grund (Backend & Konfiguration)
- **API Endpoints / Server Actions:** Vilka server-funktioner behövs? (t.ex. `POST /api/offers/create`, `action: createOffer`).
- **Databas-interaktion:** Används den korrekta, centraliserade databasinstansen (`adminDb` för server-kod)? Är alla databasregler (Firestore Rules) uppdaterade?
- **Autentisering & Säkerhet:** Är varje server-funktion skyddad (kontrollerar session och `userId`)? Valideras all inkommande data?
- **Beroenden:** Behöver `package.json` uppdateras med nya bibliotek?
- **Miljövariabler:** Krävs nya API-nycklar eller hemligheter i `.env.local`?

### Fas 2: Klient-sidans Implementering (Frontend)
- **Datakälla:** Hur ska klienten hämta data? (Hook som `useSWR`? Server-komponent? `useCurrentUser`?).
- **UI-Komponenter:** Vilka nya React-komponenter behöver skapas? (Modaler, formulär, knappar).
- **State-hantering:** Hur hanteras tillstånd? (Lokal `useState`? Global `Context`?).
- **Användarflöde & Routing:** Implementeras det planerade flödet korrekt med Next.js router? Är alla sökvägar korrekta?

### Fas 3: Test & Validering (Kvalitetssäkring)
- **"Happy Path"-simulering:** Gå igenom det förväntade flödet som en vanlig användare.
- **Edge Cases:** Vad händer vid felaktig data? Avbrutna flöden?
- **Felhantering:** Visas tydliga, användarvänliga felmeddelanden? Kraschar appen?
- **Responsivitet:** Fungerar funktionen perfekt på både dator och mobil?

---

## Sektion 2: ByggPilots Vision & Målbeskrivning

- **Vision:** ByggPilot är inte ett verktyg; det är en **proaktiv digital kollega** för hantverkare i Sverige. Målet är att eliminera "pappersmonstret" och bygga en "världsklass"-applikation.
- **Kärnvärde:** Byggd av en hantverkare, för hantverkare. Empati är allt.
- **Kärnprincip (ByggPilot-Tänket):** Proaktivitet är Standard. Agera, föreslå, och leverera värde innan användaren ens frågar.

---

## Sektion 3: Teknisk Arkitektur & Kritiska Regler

#### 3.1. Teknikstack:
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Backend:** Next.js API Routes & Server Actions
- **Databas & Autentisering:** Google Firebase (Firestore & Firebase Authentication)
- **Hosting:** Firebase Hosting

#### 3.2. Filstruktur (Enligt `tsconfig.json`):
- **`@/app`**: Applikationens rot. Innehåller sidor och layouter.
- **`@/components`**: Återanvändbara React-komponenter.
- **`@/lib`**: Kärnbibliotek (Firebase-klient, auth-konfiguration, etc.).
- **`@/actions`**: Server Actions för datamodifiering.
- **`@/hooks`**: Återanvändbara client-side hooks.
- **`@/types`**: Centraliserade TypeScript-definitioner.

#### 3.3. Kritiska Regler (Icke-förhandlingsbara):

1.  **Terminalen är Lag:** All felhantering utgår från felmeddelanden i terminalen. Stack-spårningen är den absoluta sanningen.
2.  **Kirurgisk Precision:** Lös en sak i taget. Gör minimala, nödvändiga ändringar.
3.  **Verifiera Före Handling:** Anta aldrig. Läs relevant kod (`read_file`) för att förstå kontexten innan du skriver ny kod.
4.  **IMPORT-BUGGEN:** `tsconfig.json` definierar `@/` som alias för rot-mappen (där `app` ligger). En import som `import ... from '@/app/...'` är **ALLTID FEL**. Korrekt syntax är `import ... from '@/...'` (för filer direkt under `app`) eller `import ... from '@/components/...'`.

---

## Sektion 4: Nuläge & Omedelbara Mål (2024-05-21)

- **Senaste Åtgärd:** En fundamental återställning av onboarding-flödet har genomförts. En trasig och fejkad API-koppling har ersatts med en fullt fungerande backend-funktion (`/api/onboarding/route.ts`) som korrekt skapar mappstruktur i Google Drive. Frontend-koden (`OnboardingFlow.tsx`) har uppdaterats för att anropa denna nya funktion.

- **Status:** Projektet är nu i ett stabilt, byggbart skick (`npm run build` fungerar). Onboarding är den första funktionen som implementerats enligt den nya Guldstandarden.

- **Omedelbart Mål:** Att slutföra **Fas 3: Test & Validering** för det kompletta onboarding-flödet. Målet är att verifiera att en ny användare kan logga in, godkänna villkor, fylla i företagsnamn, få en mapp skapad i sin Google Drive, och landa på dashboarden utan ett enda fel.
