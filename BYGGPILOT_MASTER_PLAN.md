# ByggPilot Master Plan v3.0: Arkitektur & Vision

**Status:** Aktiv
**Senast Uppdaterad:** 2025-10-27
**Ägare:** Michael Ekengren Fogelström

---

## 1. Kärnvision & Filosofi: "ByggPilot-Tänket"

ByggPilot är inte ett verktyg; det är en **proaktiv digital kollega** för hantverkare i Sverige. Målet är att eliminera "pappersmonstret", ge hantverkaren full kontroll över sin tid och maximera lönsamheten i varje projekt.

- **Grundare:** Michael Ekengren Fogelström.
- **Kärnvärde:** Byggd av en hantverkare, för hantverkare. Empati och en djup förståelse för användarens stressiga vardag genomsyrar varje beslut.

### 1.1 Kärnprinciper (Icke-förhandlingsbara)

1.  **Säkerhet Genom Design:** Säkerhet implementeras på databasnivå (Firestore Rules) och i varje lager av applikationen. Vi litar aldrig på klienten; all affärslogik och validering sker på serversidan.
2.  **Stabilitet Först:** En buggfri, förutsägbar och blixtsnabb användarupplevelse prioriteras över allt annat. Applikationen får aldrig krascha eller visa en "vit sida".
3.  **Ren Kod & Enkelhet:** Koden ska vara lätt att läsa, underhålla och testa. Vi följer SRP (Single Responsibility Principle) och DRY (Don't Repeat Yourself). Komplexitet isoleras och hanteras genom väldefinierade gränssnitt.

### 1.2 Agentens Persona & Konversationsregler

- **Persona:** Du är erfaren, lugn, extremt kompetent, självsäker och förtroendeingivande. Du är en expertkollega, inte en undergiven assistent. Dina ledord är "Planeringen är A och O!" och "Tydlig kommunikation och förväntanshantering är A och O!".
- **Proaktivitet är Standard:** Du frågar inte "Vill du ha hjälp?". Du agerar.
    - **Fel:** "Ska vi göra en riskanalys?"
    - **Rätt:** "Jag har skapat ett utkast för riskanalysen baserat på platsen. Jag hittade 3 punkter vi bör titta på för att säkra kvaliteten och undvika merkostnader."
- **Agera med Omdöme:** Du förbereder och automatiserar internt (skapar utkast, analyserar data). Du agerar **aldrig** externt (skickar mail, kontaktar kund) utan användarens explicita godkännande.
- **Progressiv Information:** Leverera ALLTID information i små, hanterbara delar. ALDRIG en vägg av text.
- **En Fråga i Taget:** Varje svar från dig ska vara kort, koncist och ALLTID avslutas med en enda, tydlig och relevant motfråga för att driva konversationen framåt.

---

## 2. Agentens Arbetsregler (Tekniska Direktiv)

Dessa regler är absoluta och får aldrig brytas. De är utformade för att säkerställa projektets stabilitet och kodkvalitet.

1.  **Verifiera Alltid Före Handling:** Innan du skapar, modifierar eller raderar en fil, använd **alltid** `list_files` eller `read_file` för att verifiera filsystemets nuvarande tillstånd. Agera aldrig på antaganden.
2.  **Analysera Före Agerande:** Innan du skriver kod, läs innehållet i relevanta filer för att förstå deras syfte, beroenden och relation till andra delar av kodbasen. Agera aldrig på ofullständig information.
3.  **Presentera Planen Först:** Efter analys, presentera en tydlig, steg-för-steg-plan. Påbörja **absolut inte** någon kodning förrän du har fått ett explicit **OK** eller godkännande.
4.  **Terminalen & Felmeddelanden är Lag:** Om ett fel uppstår är informationen i terminalen den absoluta sanningen. Analysera stackspårningen noggrant för att identifiera exakt fil, rad och orsak.
5.  **Verifiera Beroenden:** Innan du använder ett bibliotek, verifiera att det finns i `package.json`.

---

## 3. Arkitektur-Blueprint: Världsklass-Standard

Denna arkitektur är designad för snabbhet, säkerhet och skalbarhet, inspirerad av principer från ledande teknikföretag som Linear.

### 3.1 Filstruktur & Ansvarsområden

- **`/app/api/**`**: Endast Next.js API Routes. All kärnlogik ska ligga i DAL eller services.
- **`/app/components/**`**: Återanvändbara React-komponenter.
    - `components/ui/`: Generiska, återanvändbara UI-element (Button, Input, etc.).
    - `components/chat/`: Komponenter relaterade till chatt-gränssnittet.
    - `components/onboarding/`: Komponenter för onboarding-flödet.
- **`/lib/**`**: Kärnan i applikationen.
    - **`/lib/dal/` (Data Access Layer):** **DEN ENDA PLATSEN FÖR DATABASINTERAKTION.** All kod som pratar med Firestore (läsa, skriva, uppdatera) MÅSTE finnas här. Ingen annan fil i applikationen får direktimportera eller använda Firestore-SDK:t. Detta skapar ett skottsäkert, testbart och utbytbart datalager.
    - **`/lib/schemas/`**: **Single Source of Truth för all datavalidering.** All Zod-scheman för input-validering, formulär, API-svar etc. samlas här.
    - **`/lib/services/**`**: Tjänster för att interagera med externa API:er (Google Drive, SGU, etc.).
    - **`/lib/config/`**: Konfigurationsfiler (t.ex. Firebase-initiering).
- **`/app/(routes)/`**: Next.js-routes för olika vyer i applikationen.
- **`/app/actions/`**: Server Actions. Används för formulärhantering och mutationer från klienten. Dessa actions anropar i sin tur DAL:et för att utföra databasoperationer.

### 3.2 Autentisering & Säkerhet

- **Auth-Källa:** `app/api/auth/[...nextauth]/route.ts` är den **enda** källan till sanning för autentisering.
- **Flöde:**
    1.  Användaren loggar in med Google (NextAuth.js).
    2.  `jwt`-callback i `route.ts` anropas.
    3.  Callbacken använder en funktion från DAL (t.ex. `dal.users.findOrCreate()`) för att hitta eller skapa användaren i Firestore.
    4.  Användarens **Firestore-dokument-ID** (inte e-post) lagras i JWT-token (`token.id`).
    5.  `session`-callbacken exponerar detta ID till klientsessionen.
- **Säkerhetsregler:** Firestore Security Rules används för att implementera databassäkerhet. Reglerna ska verifiera att en användares `request.auth.uid` matchar det `userId` som är kopplat till dokumentet de försöker komma åt.
- **Secrets:** Alla API-nycklar och hemligheter MÅSTE hanteras via Google Secret Manager och accessas via en säker funktion i `lib/services`. Inga hemligheter får hårdkodas.

### 3.3 Data & State Management

- **Klient-sidan:** SWR (Stale-While-Revalidate) används för all data-fetching på klientsidan. Detta ger automatisk cachning, revalidering och en "optimistisk" UI-känsla. Undvik `useEffect` för datahämtning.
- **Server-sidan:** Data hämtas direkt i React Server Components (RSC) genom att anropa funktioner från DAL.

---

## 4. Strategisk Roadmap: ByggPilot Totalrenovering v2.0

Varje steg ska verifieras. Vi avancerar inte förrän föregående steg är 100% slutfört och godkänt.

**Fas 0: Total Nollställning & Kod-Sanering**
*Mål: Att skapa en kliniskt ren och förutsägbar kodbas.*

- `[ ]` **0.1 Fullständig Kodbas-Inventering:** Identifiera alla filer relaterade till `chat`, `prompt`, `AI`, `message`, `onboarding`, `auth`, `user`, `project`, `customer`.
- `[ ]` **0.2 Kategorisera & Planera Rensning:** Kategorisera filer som "BEHÅLL", "KONSOLIDERA", "RADERA". Presentera en motiverad lista för godkännande.
- `[ ]` **0.3 Verkställ Rensning & Etablera Ny Struktur:**
    - `[ ]` Radera godkända filer.
    - `[ ]` Konsolidera all UI-kod under `app/components/` enligt den nya strukturen.
    - `[ ]` Skapa `lib/schemas` och flytta alla Zod-scheman dit. Refaktorera importer.
- `[ ]` **0.4 Systematisk Kodhygien:**
    - `[ ]` **Importvägar:** Korrigera alla importvägar till att använda korrekta alias från `tsconfig.json`. **Verifiera med `npm run build`** efter varje större ändring.
    - `[ ]` **Rensa console.log:** Ersätt alla `console.log` med en riktig logger-instans (t.ex. Pino).

**Fas 1: Arkitektonisk Härdning (Skottsäker Kärna)**
*Mål: Att implementera en säker och professionell arkitektur.*

- `[ ]` **1.1 Etablera Data Access Layer (DAL):** Skapa `/lib/dal` och refaktorera all Firestore-logik till denna mapp.
- `[ ]` **1.2 Strikta Firestore Security Rules:** Implementera regler som låser all data till den inloggade användaren.
- `[ ]` **1.3 Byt till SWR:** Refaktorera all klient-sidig datahämtning från `useEffect` till SWR-hooks.
- `[ ]` **1.4 Implementera Secret Manager:** Flytta alla API-nycklar till Google Secret Manager.

**(Faser 2-5 förblir som i den ursprungliga checklistan, fokuserade på CI/CD, avancerad funktionalitet, monitorering och Edge-funktioner).**

---

## 5. Funktionell Expertis: "ByggPilot-Intelligensen"

Detta är kunskapen som gör ByggPilot till en expert, inte bara en app.

- **KMA & Riskanalys:**
    - **Struktur:** Analyser måste följa kärnkategorierna: **Kvalitet** (Tid, Kostnad, Teknik), **Miljö** (Avfall, Påverkan, Kemikalier), **Arbetsmiljö** (Olyckor, Ergonomi, Stress).
    - **Automatisk Initiering:** Ska kunna föreslå en riskanalys vid skapande av projekt eller ÄTA.
- **Geodata & Varningar:**
    - **Automatisk Kontroll:** Vid nytt projekt, hämta automatiskt data från SGU (jordart, grundvatten, radon) och RAÄ (fornlämningar) för att varna för dyra överraskningar.
    - **Prediktiv Vädervarning:** Jämför planerade moment (t.ex. "Gjuta platta") med väderprognoser och varna för konflikter.
- **Regelverk & Pro Tips:**
    - **Dynamisk Varning:** Analysera bilder och data mot AMA-krav och AFS (t.ex. avstånd el/dusch, saknad skyddsutrustning).
    - **Proaktiva Råd:** Informera kunden om processer som "Startbesked efter bygglov" för att demonstrera expertis och förebygga missförstånd.
- **Jobb-till-Kassa Flöde:** Stöd hela processen från förfrågan, via offert, ÄTA, tidrapportering, till fakturaunderlag och uppföljning.
