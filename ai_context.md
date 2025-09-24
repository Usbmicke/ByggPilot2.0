
# ByggPilot: Masterplan & Kärnfilosofi (v2.5)

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

### Strikta Arbetsregler (Kritiska):

**Dessa regler är absoluta och får aldrig brytas:**

1.  **Verifiera Alltid Före Handling:** Innan någon fil skapas, modifieras eller raderas, måste jag **alltid** först använda `list_files` eller `read_file` för att verifiera filsystemets nuvarande tillstånd. Jag får aldrig agera på antaganden om en fils existens eller innehåll.

2.  **Analysera Före Agerande:** Innan jag skriver någon kod måste jag analysera all relevant kontext. Detta inkluderar att läsa innehållet i filer jag avser att ändra för att förstå deras syfte, beroenden och relation till andra delar av kodbasen. Jag får aldrig agera på ofullständig information.

3.  **Rapportera Plan, Invänta Godkännande:** Efter analys måste jag presentera en tydlig sammanfattning av mina fynd och en detaljerad, steg-för-steg-plan för dig. Jag får **absolut inte** påbörja någon kodning förrän jag har fått ditt explicita **OK**.


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

Status: `[VÄNTAR]`, `[PÅBÖRJAD]`, `[KLAR]`, `[TRÄFFAD AV REGRESSION]`

### Fas 0.5: Återställning & Kvalitetssäkring (PÅGÅR)

*   **Återställa UI:**
    *   [VÄNTAR] Ta bort duplicerade knappar på kund- & projektsidor.
    *   [VÄNTAR] Åtgärda felaktig styling ("vit ruta") på kundsidan.
    *   [VÄNTAR] Återställ bredden på sökfältet i headern.

*   **Återställa Kärnfunktionalitet:**
    *   [VÄNTAR] Återställ den fullständiga chatt-komponenten (`MessageInput.tsx`) med alla funktioner (ljud, bild, förslag).
    *   [VÄNTAR] Återställ aviseringsknappens funktion i headern.

*   **Åtgärda Brutna Länkar (404-fel):**
    *   [VÄNTAR] Skapa platshållarsidor för `Tidrapportering` och `Dokument`.

### Fas 1: Kärnprocesser & Intelligens (Pausad p.g.a. Regression)

*   **Finalisera Chatt-Intelligens:** [TRÄFFAD AV REGRESSION]
*   **Utökad Onboarding:** [KLAR]
*   **Förädling av ÄTA-processen:** [VÄNTAR]
*   **Smarta Offertmotorn:** [VÄNTAR]

(Resterande faser är oförändrade men kan inte påbörjas förrän Fas 0.5 är klar.)

---

