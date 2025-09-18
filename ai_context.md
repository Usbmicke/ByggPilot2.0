# ByggPilot: AI Context & Development Guidelines

**Dokumentversion: 1.2**
**Senast uppdaterad: 2024-05-22**

---

## 1. Kärnmission

ByggPilot är ett **Large Action Model (LAM)**, utformat för att vara den digitala kollegan för små och medelstora byggföretag. Målet är inte bara att svara på frågor, utan att **agera proaktivt** för att automatisera, förenkla och effektivisera hela den administrativa processen – från "Jobb-till-Kassa". Vi är ett intelligent lager ovanpå Google Workspace som frigör hantverkarens tid och minskar risken för kostsamma fel. All interaktion ska vara så enkel som möjligt, med **klickbara knappar och guidade flöden** som primär interaktionsmetod i chatten.

---

## 2. AI-utvecklarens Riktlinjer (Regler för mig, AI:n)

1.  **AGERA, FRÅGA INTE:** Agera alltid först. Ta kommando, utför uppgiften och rapportera resultatet. Fråga endast om en avsikt är tvetydig eller om en åtgärd är destruktiv.
2.  **ANVÄNDARFOKUS FRAMFÖR ALLT:** Målet är att eliminera administrativ huvudvärk. Alla funktioner ska designas för att vara maximalt enkla och intuitiva. Prioritera klickbara knappar framför textinmatning.
3.  **KORREKTHET ÄR HELIGT:** All kod ska vara robust, testbar och följa bästa praxis. All information som presenteras (t.ex. från externa API:er) måste vara korrekt och från verifierade källor.
4.  **SÄKERHET SOM STANDARD:** Hantera all känslig information (API-nycklar, kunddata, tokens) med största varsamhet. Skriv aldrig känslig data i klartext i loggar eller kod.
5.  **ETT STEG I TAGET:** Bryt ner komplexa problem i mindre, hanterbara steg. Slutför och verifiera varje steg innan du går vidare till nästa. Checka av slutförda steg i detta dokument.

---

## 3. Status & Slutförda Steg

-   [x] **Kodgranskning och städning:**
    -   [x] Refaktorerat `DashboardLayout` och `OnboardingWidget` för ökad modularitet och renare kod.
    -   [x] Rensat bort oanvänd och framtida kod från `ProTipsModal`.
-   [x] **Förbättrat Onboarding-flöde:**
    -   [x] Omdesignat `OnboardingWidget` till en centrerad modal för ett tydligare första intryck för nya användare.
    -   [x] Säkerställt att onboarding-vyn korrekt täcker över den initiala "ZeroState"-vyn.
-   [x] **Grundläggande Firebase Autentisering:** Användare kan logga in med Google.
-   [x] **Centraliserad Firebase Initiering:** Skapat `app/firebase.ts` för att lösa modulberoenden och säkerställa en enda källa för Firebase-objekt.
-   [x] **Konsoliderad Sessionhantering:** Byggfel relaterade till `getServerSession` är lösta genom att standardisera på NextAuth.js.
-   [x] **Struktur för AI-kontext:** Detta dokument, `ai_context.md`, har skapats.
-   [x] **Reparera Utloggningsfunktion:**
    -   [x] Återplacerat utloggningsknappen i det nedre vänstra hörnet.
    -   [x] Säkerställt att klick på knappen tvingar en fullständig utloggning.

---

## 4. Utvecklingsplan & Checklista

### Fas 1: Foundation & Kärnfunktionalitet (Nuvarande Fokus)

-   [ ] **Google Drive Integration:**
    -   [ ] **(PÅGÅR)** Hämta och säkert spara `refresh_token` för Google API-åtkomst i `.env.local`.
    -   [ ] Implementera funktion (`driveService.ts`) för att vid första anrop skapa en rotmapp vid namn "ByggPilot" i användarens Google Drive.
    -   [ ] Implementera funktion för att automatiskt skapa en standardiserad projektmappstruktur (inspirerad av ISO 9001) inuti "ByggPilot"-mappen när ett nytt projekt skapas.
-   [ ] **Grundläggande Företagsverifiering:**
    -   [ ] Skapa en service (`companyService.ts` eller liknande).
    -   [ ] Implementera API-anrop för att hämta grundläggande företagsinformation från Bolagsverket (via en tredjeparts-API om nödvändigt) baserat på organisationsnummer.
    -   [ ] Implementera API-anrop för att verifiera F-skatt och momsstatus via Skatteverket.

### Fas 2: Offertmotorn (Högsta Prioritet)

-   [ ] **Konversationell Offertskapande:**
    -   [ ] Skapa ett chattflöde där AI:n agerar som en kalkylator och guidar användaren steg-för-steg genom att ställa frågor för att bygga upp en offert.
-   [ ] **Interaktiv Offertpresentation:**
    -   [ ] Generera en unik, delbar webbsida för varje offert.
    -   [ ] Kunden ska kunna välja/avvälja tillval, och priset uppdateras i realtid.
-   [ ] **E-signering & Deposition:**
    -   [ ] Integrera en lösning för juridiskt bindande e-signering direkt på offertsidan.
    -   [ ] Möjliggör krav på deposition vid godkännande för att förbättra kassaflödet.

### Fas 3: Automatiserad Administration

-   [ ] **KMA-analys via Chatt:**
    -   [ ] Skapa ett guidat flöde där AI:n ställer relevanta frågor för att genomföra och dokumentera en riskanalys (Kvalitet, Miljö, Arbetsmiljö) för ett projekt.
-   [ ] **Automatiserade Kunduppdateringar:**
    -   [ ] Skapa en funktion där AI:n kan generera en enkel, professionell veckouppdatering baserad på projektets status och skicka som förslag till användaren.
-   [ ] **Extern Datainhämtning för Projekt:**
    -   [ ] Integration med Lantmäteriet för fastighetsinformation.
    -   [ ] Integration med SGU (Sveriges Geologiska Undersökning) för markdata (jordart, radonrisk).
    -   [ ] Integration med RAÄ (Riksantikvarieämbetet) för att kontrollera fornlämningar.

### Fas 4: Visionära Funktioner (Efter Kärnfunktionalitet)

-   [ ] **Kvittohantering med Vision AI:**
    -   [ ] Användaren laddar upp en bild på ett kvitto.
    -   [ ] AI:n skannar, tolkar och kopplar automatiskt kostnaden till rätt projekt.
-   [ ] **Hantering av ÄTA-arbeten:**
    -   [ ] Transkribera ett röstmemo från användaren till ett ÄTA-underlag.
    -   [ ] Föreslå att underlaget skickas till kund för godkännande.

---

## 5. Teknisk Arkitektur & Standarder

-   **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
-   **Autentisering:** NextAuth.js (credentials) och Firebase Authentication (Google provider).
-   **Databas:** Firestore för projekt-, kund- och användardata.
-   **Backend Services:** Next.js API Routes.
-   **Filhantering:** Google Drive API.
-   **Hosting/Deployment:** Vercel (förutsatt).
-   **Kodstandard:** All kod ska vara på svenska i kommentarer och användarvända strängar. Funktionsnamn och variabler på engelska.
