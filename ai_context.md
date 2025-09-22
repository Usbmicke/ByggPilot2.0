
## 1. Mål & Vision

ByggPilot är en digital kollega för små och medelstora byggföretag i Sverige. Målet är att eliminera "pappersmonstret" – all den tidskrävande administration som stjäl tid från det verkliga hantverket. Applikationen ska agera som ett proaktivt och intelligent lager ovanpå användarens Google Workspace för att automatisera flöden från offert till faktura, samla all projektdata på ett ställe och ge användaren datadrivna insikter för att öka lönsamheten.

**Grundare:** Michael Ekengren Fogelström, en hantverkare med 20 års erfarenhet.
**Kärnvärde:** Byggd av en hantverkare, för hantverkare. Empati för användarens stressiga vardag är centralt.

---

## 2. ByggPilot-Tänk: Kärnprinciper

Detta är den centrala filosofin som definierar hur ByggPilot ska kännas och agera. Den väger tyngre än allt annat.

1.  **Den Proaktiva Digitala Kollegan:** ByggPilot är en erfaren, lugn och extremt kompetent digital kollega. Tonfallet är självsäkert, rakt på sak och förtroendeingivande. Den agerar och automatiserar, tar initiativ och förklarar alltid värdet av sina handlingar för att minska stress, skapa ordning och frigöra tid.

2.  **Agera, men med Omdöme och Empati:** Ta initiativ för att förbereda och föreslå. Sammanfatta ett mail, förbered ett utkast, flagga en risk. Men agera aldrig externt (t.ex. skicka ett mail) utan användarens explicita godkännande. All kommunikation är empatisk inför hantverkarens stressiga vardag.

3.  **Planering och Tydlig Kommunikation är A och O:** Hela produktens syfte är att främja dessa två grundpelare. Funktioner ska guida användaren till bättre planering och tydligare kommunikation med sina kunder.

4.  **Alltid Fokuserad på Målet:** Målet är att ge användaren tillbaka kontroll, tid och lönsamhet. Om en funktion är komplicerad är den fel. Om en process är manuell är den en möjlighet till automatisering.

---

## 3. Handlingsplan & Status

Detta är den prioriterade checklistan. Status (EJ PÅBÖRJAT, PÅGÅR, AVKLARAD) uppdateras löpande av AI-assistenten.

### Fas 1: Proaktiv Onboarding & Kärnfunktionalitet

*   **[PÅGÅR] AI-assistent och Proaktiv Chattfunktionalitet**
    *   **[AVKLARAD]** Engagerande Hälsning och Konversation.
    *   **[EJ PÅBÖRJAT]** Proaktiv Informationshämtning (företagsinfo).
    *   **[PÅGÅR]** Språkanpassning.
    *   **[EJ PÅBÖRJAT]** Generering av Tydliga Checklistor (KMA etc.).

*   **[PÅGÅR] Google Workspace Integration & Automatiserad Onboarding**
    *   **[AVKLARAD]** Grundläggande Autentisering & Inloggning.
    *   **[PÅGÅR]** Reparera Dashboard & Projektöversikt (index + auth-fix).
    *   **[EJ PÅBÖRJAT]** Automatisk Mappstruktur i Google Drive (Onboarding).
    *   **[EJ PÅBÖRJAT]** Dashboard med "Zero State" vy.
    *   **[EJ PÅBÖRJAT]** Google Kalender-integration (Proaktiv). 
    *   **[EJ PÅBÖRJAT]** Gmail-integration (Proaktiv).

*   **[NÄSTA STEG] Offertmotor – Grunden (Den Guidade Kalkylatorn)**
    *   **[EJ PÅBÖRJAT]** Datamodell för Offert.
    *   **[EJ PÅBÖRJAT]** Guidad Insamling av Underlag (Platsbesöket).
    *   **[EJ PÅBÖRJAT]** AI-assisterad Kalkyl (Skrivbordsjobbet).
    *   **[EJ PÅBÖRJAT]** Proaktiva KMA-frågor under kalkylen.
    *   **[EJ PÅBÖRJAT]** Generering av Professionell PDF-offert.

### Fas 2: Proaktiva Varningar och Förbättrad Projektstyrning

*   **[EJ PÅBÖRJAT] Prediktiv Projektledning & Automatiska Varningar**
    *   AI-driven Likviditetsanalys & Faktureringsstrategi.
    *   Dynamisk Riskanalys baserad på Bildigenkänning.
    *   Prediktiv Resursplanering & UE-koordination.

*   **[EJ PÅBÖRJAT] Omfattande Administration och Projektstyrning**
    *   Kvittohantering med Bildigenkänning (OCR).
    *   Automatisk Tids- och Milersättning.
    *   ÄTA-hantering.
    *   Underlagsskapande (Anbud/Faktura).
    *   Fullfölj Fakturaflödet (Skicka, Spåra, Påminn).
    *   Automatiserad Överlämning till Projektfasen.

*   **[EJ PÅBÖRJAT] Platsinformation & Riskminimering (Geodata)**
    *   Automatiska Markförhållanden (SGU).
    *   Fornlämningar (RAÄ - Fornsök).
    *   Geospatial Kontekst (Lantmäteriet).

*   **[EJ PÅBÖRJAT] Företagsinformation & Trygghet (Bakgrundskontroll)**
    *   Skatteverket (F-skatt & Moms).
    *   Bolagsverket (Företagsinformation).
    *   Bakgrundskontroll av Kunder (Proaktiv).

### Fas 3: Avancerade & Prediktiva Funktioner

*   **[EJ PÅBÖRJAT] Hyper-personalisering & Effektivisering**
    *   Automatisk Generering av "Företagets Bästa Praxis".
    *   AI-baserad Inköpsoptimering.
    *   Visuell Materialsökning & Inventering.
    *   Intelligent "Spill"-optimering.
    *   Känsloanalys i Kundkommunikation.

*   **[EJ PÅBÖRJAT] Säkerhet & Regelefterlevnad**
    *   Automatisk Utrustnings- & Säkerhetskontroll.
    *   Kontinuerlig inlärning av nya branschregler.
    *   Bokföringslagen och Digital Arkivering.
    *   Hantering av Skatteverkets krav (ROT, Omvänd etc.).
    *   GDPR-efterlevnad.

---

## 4. Teknisk Stack

*   **Framework:** Next.js (App Router)
*   **Språk:** TypeScript
*   **Backend:** Firebase (Authentication, Firestore), Next.js API Routes / Google Cloud Functions
*   **Styling:** Tailwind CSS
*   **State Management:** React Context (för Auth), `useState` för lokal state.
*   **Deployment:** Vercel
