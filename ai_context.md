# ByggPilot: Masterplan & Kärnfilosofi (v2.4)

Detta dokument är den enda, centrala källan till sanning för ByggPilot-projektet. All utveckling utgår härifrån.

---

## 1. Vision & Kärnfilosofi: "ByggPilot-Tänket"

ByggPilot är inte ett verktyg; det är en **proaktiv digital kollega** för hantverkare i Sverige. Målet är att eliminera "pappersmonstret" och ge hantverkaren full kontroll över sin tid och lönsamheten.

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

*   **/app/api/**: All backend-logik och API-endpoints.
*   **/app/components/**: Alla återanvändbara React-komponenter.
*   **/app/contexts/**: Globala providers för state management (t.ex. `ChatContext.tsx`, `UIContext.tsx`).
*   **/app/hooks/**: Återanvändbara React-hooks (t.ex. `useVoiceRecognition.ts`).
*   **/app/lib/**: Kärnbibliotek och konfigurationer.
*   **/app/services/**: Funktioner för att interagera med backend-tjänster.
*   **/app/types/**: Centraliserade TypeScript-typer.
*   **/ai_context.md**: **Detta dokument.**

---

## 3. Komplett Master-Checklista (Strategisk Roadmap)

Status: `[VÄNTAR]`, `[PÅBÖRJAD]`, `[KLAR]`

### Fas 0: Grundsystem & Stabilisering (100% KLAR)

*   **Autentisering & Användare:** [KLAR]
*   **Dashboard & Projekt:** [KLAR]
*   **ÄTA-hantering (Grundflöde):** [KLAR]
*   **Databas:** [KLAR]

### Fas 1: Kärnprocesser & Intelligens (PÅBÖRJAD)

*   **Finalisera Chatt-Intelligens (Masterprompt 9.2):**
    *   [KLAR] Implementera "Masterprompt 9.2".
    *   [KLAR] Gränssnitt för chatt-styrning av UI.
    *   [KLAR] Full integration av röst-till-text.

*   **Utökad Onboarding:**
    *   [KLAR] "Zero State" / Onboarding-vy när inga projekt finns.
    *   [KLAR] Vid första inloggning: guida användaren genom en kort process.
    *   [KLAR] **Automatisk skapande av Google Drive-mappstruktur**.
    *   [KLAR] **Möjlighet att fylla i "Företagsvisionen"** som AI:n använder som kompass.
    *   [VÄNTAR] Inkludera en smart, skyddande text om AI:ns roll.

*   **Förädling av ÄTA-processen:**
    *   [VÄNTAR] Gör ÄTA-listan klickbar för detaljvy.
    *   [VÄNTAR] I detaljvyn: redigera pris, material, status.
*   **Smarta Offertmotorn (Grundläggande "Text Calculator"):**
    *   [VÄNTAR] Skapa kalkylering/offert-vy.
    *   [VÄNTAR] Bygg "text-till-kalkyl"-motor.
    *   [VÄNTAR] Generera PDF-offert.

### Fas 2: Funktions-Expansion & Effektivisering (PLANERAD)

*   **Utökad ÄTA-insamling:** Röstmemo, bilduppladdning, fillagring.
*   **Tid & Resor (Förenklad version):** Logga tid, biltillägg.
*   **Dokument & Underlag:** Skanna kvitton med OCR, hämta fastighetsbeteckning.

### Fas 3: Team, Samarbete & Säkerhet (FRAMTID)

*   **Teamhantering (Multi-user):** Roller, inbjudningar.
*   **Visuell Resursplanering:** Personalöversikt, dra-och-släpp-tilldelning.
*   **Säkerhet & Regelefterlevnad:** Automatiserad kemikaliehantering.
*   **Intern Utbildning:** Företagets kunskapsbank med interaktivt quizz.

### Fas 4: Avancerad Automation & Intelligens (VISION)

*   **Avancerad Körjournal:** Start/stopp, automatisk sträckberäkning, PDF-export.
*   **Proaktiv Resurshantering:** Konsekvensanalys vid frånvaro, förslag till omfördelning.
*   **Google Integration & Affärsmodell:** Proaktiv kontroll av lagringsutrymme.
