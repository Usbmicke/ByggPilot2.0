# ByggPilot: Masterplan & Kärnfilosofi (v2.1)

Detta dokument är den enda, centrala källan till sanning för ByggPilot-projektet. All utveckling utgår härifrån.

---

## 1. Vision & Kärnfilosofi: "ByggPilot-Tänket"

ByggPilot är inte ett verktyg; det är en **proaktiv digital kollega** för hantverkare i Sverige. Målet är att eliminera "pappersmonstret" och ge hantverkaren full kontroll över sin tid och lönsamhet.

**Grundare:** Michael Ekengren Fogelström.
**Kärnvärde:** Byggd av en hantverkare, för hantverkare. Empati och förståelse för användarens vardag är allt.

### Kärnprinciper:

1.  **Proaktivitet är Standard:** ByggPilot frågar inte "Vill du ha hjälp?". Den agerar.
    *   **Fel:** "Ska vi göra en riskanalys?"
    *   **Rätt:** "Jag har skapat ett utkast för riskanalysen baserat på platsen. Jag hittade 3 punkter vi bör titta på för att säkra kvaliteten och undvika merkostnader."

2.  **Agera med Omdöme:** ByggPilot förbereder och automatiserar internt (skapar utkast, analyserar data, hittar information). Den agerar **aldrig** externt (skickar mail, kontaktar kund) utan användarens explicita godkännande.

3.  **Fokus på Värde:** Varje funktion, varje knapp, varje textrad måste svara på frågan: "Hur hjälper detta hantverkaren att spara tid, minska stress eller öka lönsamheten?" Om svaret är oklart är funktionen fel.

4.  **Företagsvisionen som Kompass:** Systemet ska erbjuda användaren att definiera sin företagsvision (t.ex. "välmående ekonomi, minskad stress, 100% nöjda kunder"). ByggPilot använder sedan denna vision som en extra kompass för sina rekommendationer och proaktiva handlingar.

---

## 2. Teknisk Arkitektur & Filstruktur

För att undvika dubbelarbete och upprätthålla en ren kodbas följer vi denna struktur:

*   **/app/api/**: All backend-logik och API-endpoints. Varje route har sin egen mapp (t.ex. `/app/api/projects/create/route.ts`).
*   **/app/components/**: Alla återanvändbara React-komponenter.
    *   `/dashboard/`: Komponenter specifika för Dashboarden.
    *   `/modals/`: Alla modal-dialoger (t.ex. `CreateProjectModal`).
    *   `/views/`: Större "vy"-komponenter (t.ex. `AtaView`).
*   **/app/lib/**: Kärnbibliotek och konfigurationer (t.ex. `auth.ts`, `firebase.ts`, `prisma.ts`).
*   **/app/services/**: Funktioner för att interagera med backend-tjänster och databaser (t.ex. `projectService.ts`).
*   **/app/types/**: Centraliserade TypeScript-typer och interfaces.
*   **/ai_context.md**: **Detta dokument.** Den enda källan till sanning för vision och planering.

---

## 3. Komplett Master-Checklista (Strategisk Roadmap)

Status: `[VÄNTAR]`, `[PÅBÖRJAD]`, `[KLAR]`

### Fas 0: Grundsystem & Stabilisering (95% KLAR)

*   **Autentisering & Användare:**
    *   [KLAR] Inloggning via Google (`NextAuth`).
    *   [KLAR] Synkronisering `NextAuth` <-> `Firebase`.
*   **Dashboard & Projekt:**
    *   [KLAR] Grundläggande Dashboard-sida (`app/dashboard/page.tsx`).
    *   [KLAR] Kritiska import/export-fel på Dashboard är lösta.
    *   [KLAR] Modal för att skapa nya projekt (`CreateProjectModal`).
    *   [KLAR] API för att skapa projekt.
    *   [KLAR] Professionell, sekventiell projektnumrering (t.ex. `353-2475`).
*   **ÄTA-hantering (Grundflöde):**
    *   [KLAR] "ÄTA"-flik i projektvyn.
    *   [KLAR] Modal för snabbinmatning av ÄTA (`CreateAtaModal`).
    *   [KLAR] API för att skapa ÄTA-utkast.
    *   [KLAR] Nyskapade ÄTA-utkast visas i en lista (`AtaView`).
*   **Databas:**
    *   [VÄNTAR] **KRITISKT:** Byta ut all *simulerad* datalagring mot **riktig, permanent databas-interaktion** (t.ex. med Prisma/Firestore).

### Fas 1: Kärnprocesser & Intelligens (NÄSTA STEG)

*   **Finalisera Chatt-Intelligens (Masterprompt 9.0):**
    *   [VÄNTAR] Implementera "Masterprompt 9.0" fullt ut i `app/api/chat/route.ts` för att vässa den proaktiva personan.
    *   [VÄNTAR] Definiera och implementera ett gränssnitt (API/events) för hur chatten kan styra och interagera med UI-komponenter (öppna modaler, navigera, uppdatera vyer).
    *   [VÄNTAR] Full integration av röst-till-text-transkribering för att mata chatten.

*   **Utökad Onboarding:**
    *   [PÅBÖRJAD] "Zero State" / Onboarding-vy när inga projekt finns.
    *   [VÄNTAR] Vid första inloggning: guida användaren genom en kort process.
    *   [VÄNTAR] **Automatisk skapande av Google Drive-mappstruktur** (`/01_Kunder`, `/02_Projekt`, etc.) under onboardingen.
    *   [VÄNTAR] Möjlighet att fylla i "Företagsvision" & policy-dokument som ByggPilot kan använda som kunskapsbank.
    *   [VÄNTAR] Inkludera en smart, skyddande text om AI:ns roll, vikten av att dubbelkolla, och hur ByggPilot sparar tid.
*   **Förädling av ÄTA-processen:**
    *   [VÄNTAR] Gör ÄTA-listan klickbar för att öppna en detaljvy.
    *   [VÄNTAR] I detaljvyn: möjlighet att lägga till/redigera pris, material, status (Utkast -> Skickad -> Godkänd).
*   **Smarta Offertmotorn (Grundläggande "Text Calculator"):**
    *   [VÄNTAR] Skapa en ny vy för kalkylering/offertskapande.
    *   [VÄNTAR] Bygg en grundläggande "text-till-kalkyl"-motor där användaren kan skriva fritt och AI:n strukturerar det till offert-rader.
    *   [VÄNTAR] Generera en enkel, professionell PDF-offert från kalkylen.

### Fas 2: Funktions-Expansion & Effektivisering (PLANERAD)

*   **Utökad ÄTA-insamling:**
    *   [VÄNTAR] Implementera **röstmemo-inspelning** i `CreateAtaModal`.
    *   [VÄNTAR] Implementera **bilduppladdning** (Ta/välj bild) i `CreateAtaModal`.
    *   [VÄNTAR] Backend för att lagra dessa filer i projektets Drive-mapp.
*   **Tid & Resor (Förenklad version):**
    *   [VÄNTAR] Lägg till en "Logga Tid"-knapp på projektkort/vyer.
    *   [VÄNTAR] I tidloggningen, erbjuda en enkel checkbox för "Biltillägg" eller liknande.
    *   [VÄNTAR] Loggad tid och tillägg kopplas till projektets ekonomi.
*   **Dokument & Underlag:**
    *   [VÄNTAR] Skanna kvitton med OCR för att identifiera belopp och koppla till projekt.
    *   [VÄNTAR] **Automatisk hämtning av Fastighetsbeteckning** via Lantmäteriet API vid ROT-arbeten.

### Fas 3: Team, Samarbete & Säkerhet (FRAMTID)

*   **Teamhantering (Multi-user):**
    *   [VÄNTAR] Inför Företagskonton med roller: **Administratör** och **Anställd**.
    *   [VÄNTAR] Admin kan bjudas in anställda, se alla projekt och hantera inställningar.
    *   [VÄNTAR] Anställd kan se tilldelade projekt, rapportera tid/utlägg, och göra interna utbildningar.
*   **Visuell Resursplanering:**
    *   [VÄNTAR] En central vy för admin att se personalens beläggning.
    *   [VÄNTAR] "Dra-och-släpp"-tilldelning av anställda till projekt.
*   **Säkerhet & Regelefterlevnad:**
    *   [VÄNTAR] **Automatiserad Kemikaliehantering:** Identifiera kemikalier från kvitton, presentera förenklad skyddsinfo proaktivt, och arkivera säkerhetsdatablad i projektmappen.
*   **Intern Utbildning:**
    *   [VÄNTAR] Företagets kunskapsbank baserad på dokument i en specifik Drive-mapp.
    *   [VÄNTAR] Interaktivt "Quizz" för nyanställda baserat på kunskapsbanken.

### Fas 4: Avancerad Automation & Intelligens (VISION)

*   **Avancerad Körjournal (Ersätter den enkla tidloggen):**
    *   [VÄNTAR] Fullfjädrad körjournal med "Start/Stopp"-knapp (ej GPS-spårning i bakgrunden), automatisk sträckberäkning och intelligent kategorisering (Projekt vs. Företagsresa).
    *   [VÄNTAR] Generering av deklarationsfärdig PDF.
*   **Proaktiv Resurshantering ("Jonas är sjuk"-scenariot):**
    *   [VÄNTAR] Vid frånvaro: automatisk konsekvensanalys och förslag på omfördelning av personal.
    *   [VÄNTAR] Förbereda utkast för kundkommunikation vid omprioriteringar.
*   **Google Integration & Affärsmodell:**
    *   [VÄNTAR] Proaktiv kontroll av Google Drive-lagringsutrymme med rekommendation om uppgradering som ett tecken på tillväxt.
    *   [VÄNTAR] Säkerställ full funktionalitet med gratis Google-konton.
