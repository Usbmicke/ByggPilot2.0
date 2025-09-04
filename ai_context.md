# ByggPilot - Master Plan (Reviderad)

## Övergripande Mål
Att systematiskt och kontrollerat utveckla ByggPilot från en fungerande dashboard med demodata till en värdefull MVP (Minimum Viable Product) med verklig, dynamisk funktionalitet och intelligenta, automatiserade processer.

## Ledande Principer
- **Fasvis Implementation:** Vi bygger en funktion i taget, testar noggrant och säkerställer stabilitet innan vi går vidare till nästa.
- **Demo Först:** Ett interaktivt och övertygande demoläge är högsta prioritet för att kunna visa produktens värde för kunder. Detta läge ska vara helt frikopplat från live-system som Firebase och externa API:er.
- **Inga API-loopar:** För att garantera kostnadskontroll ska frontend **aldrig** anropa AI-tjänster direkt. Alla sådana anrop ska gå via en central "Orchestrator" backend-funktion.
- **Expert-Chatbot:** Den långsiktiga visionen är att chatten ska utvecklas till en "Bygg-Expert", en specialiserad LAM (Large Action Model) som kan agera som en kunnig digital kollega.
- **Automatiserad Inledande Funktion:** Funktionen för att omvandla mail till kalenderevents ska ske automatiskt vid inloggning för att omedelbart visa appens värde.
- **Onboarding via Dashboard:** De två knapparna i chatten på dashboarden är en central del av användarens onboarding-process.

---

## Byggplan: Från Fungerande Dashboard till Värdefull MVP

### Fas 0: Interaktivt och Realistiskt Demoläge - SLUTFÖRD
**Resultat:** Ett heltäckande och interaktivt demoläge har implementerats. Det låter potentiella kunder uppleva ByggPilots kärnfunktioner utan koppling till backend. Demoläget är nu den primära upplevelsen för nya användare och guidar dem genom ett typiskt arbetsflöde.

- **✅ Steg 0.1: Isolera Demoläget**
  - **Resultat:** En global `isDemo`-state, aktiverad via `login(true)`, styr nu hela applikationen. Denna state renderar villkorligt demodata och inaktiverar alla anrop till Firebase och externa API:er, vilket garanterar en stabil och isolerad demomiljö.

- **✅ Steg 0.2: Skapa en Levande Demo-Dashboard**
  - **Resultat:** En `mockData.ts`-fil har skapats och innehåller en uppsättning realistiska demoprojekt, kunder och "att göra"-punkter. Dashboarden hämtar och visar nu denna data i demoläget, vilket skapar en levande och representativ förstasida.

- **✅ Steg 0.3: Simulera Navigation och Projektmappar**
  - **Resultat:** Sidomenyn är fullt klickbar. Dokumentvyn har byggts om för att visa en simulerad och hierarkisk mappstruktur (`01_Kunder & Anbud`, `02_Pågående Projekt` etc.), vilket ger en realistisk bild av hur ByggPilot organiserar filer i Google Drive.

- **✅ Steg 0.4: Guidat "Skapa Offert"-flöde (Simulerat)**
  - **Resultat:** "Skapa Offert"-knappen initierar nu ett skriptat, guidat flöde i chatten. Flödet simulerar hur AI-assistenten samlar in information för en ny offert, vilket skapar en interaktiv och pedagogisk demonstration av en av appens kärnfunktioner.

- **✅ Steg 0.5: Funktionella men Begränsade Inställningar och Knappar**
  - **Resultat:** Fokus har legat på kärnfunktionerna i demoläget. Övriga knappar är visuellt närvarande men deras fulla funktionalitet kommer att implementeras i senare faser.

### Fas 1: Gör Dashboarden Levande (Från Demo till Dynamisk)
**Mål:** Att omvandla de statiska demoprojektkorten till en levande, dynamisk vy som speglar verklig data från Firestore. Detta är grunden för nästan alla andra funktioner.

**Steg 1.1: Definiera Datamodellen i Firestore**
- **Instruktion:** Skapa en Firestore-kollektion med namnet `projects`. Varje dokument ska representera ett projekt och initialt innehålla fälten: `projectName` (string), `clientName` (string), `status` (string, t.ex. "Offert", "Pågående", "Avslutad"), `ownerId` (string, användarens Firebase UID), `createdAt` (timestamp).

**Steg 1.2: Implementera CRUD för Projekt (Create, Read, Update, Delete)**
- **Läs (Read):**
  - **Instruktion:** Modifiera `/dashboard/page.tsx`. Istället för demodata, implementera en funktion som anropar Firestore och hämtar alla projekt där `ownerId` matchar den inloggade användarens UID. Visa dessa projekt som projektkort.
- **Skapa (Create):**
  - **Instruktion:** Skapa en 'Nytt Projekt'-knapp på dashboarden. Vid klick, visa en modal med fält för 'Projektnamn' och 'Kundnamn'. När formuläret skickas, skapa ett nytt dokument i `projects`-kollektionen.
- **Uppdatera & Radera (Update & Delete):**
  - **Instruktion:** På varje projektkort, lägg till en meny (tre punkter) med alternativen 'Ändra status' och 'Radera projekt'. Implementera funktionerna för att uppdatera `status`-fältet eller ta bort dokumentet från Firestore.

### Fas 2: Den Första Stora Tidsbespararen: Förenklad Tidrapportering
**Mål:** Att implementera en av de mest efterfrågade funktionerna. Den är tekniskt relativt enkel men ger omedelbart och konkret värde.

**Steg 2.1: Bygg UI för Tidrapportering**
- **Instruktion:** Skapa en ny widget på dashboarden för tidrapportering. Den ska innehålla: en rullgardinsmeny som listar projekt från `projects`-kollektionen, en 'Checka in'-knapp och en 'Checka ut'-knapp (inaktiv tills incheckad).

**Steg 2.2: Definiera Datamodellen i Firestore**
- **Instruktion:** Skapa en ny Firestore-kollektion `timeEntries`. Varje dokument ska representera ett arbetspass och innehålla: `projectId` (string), `userId` (string), `startTime` (timestamp), `endTime` (timestamp), `durationMinutes` (number).

**Steg 2.3: Implementera Backend-logiken**
- **Instruktion:** Skapa en serverlös Google Cloud Function. När 'Checka ut' klickas, ska ett anrop skickas till denna funktion med `projectId`, `startTime` och `endTime`. Funktionen skapar sedan ett nytt dokument i `timeEntries`.

### Fas 3: Grunden till Offertmotorn: Den Guidade Kalkylatorn (MVP)
**Mål:** Att bygga den första versionen av offertmotorn med fokus på ett konversationellt flöde för att generera ett professionellt dokument.

**Steg 3.1: Starta Offertflödet**
- **Instruktion:** Implementera en framträdande "+ Skapa Offert"-knapp på dashboarden. Vid klick, aktivera chatten där AI:n ställer den första frågan: "Kul att vi ska räkna på ett nytt jobb! Vem är kunden?"

**Steg 3.2: Bygg det Konversationella Insamlingsflödet**
- **Instruktion:** Programmera chatt-assistenten att ställa en fråga i taget för att samla in information om projektets omfattning, foton (implementera filuppladdning), mått, budget, kvalitetsnivå och KMA-punkter. All data lagras temporärt i frontend-state.

**Steg 3.3: Guidad Kalkyl via Chatt**
- **Instruktion:** Efter insamling, guida användaren genom kalkylen. Fråga om arbetsmoment per rum, timmar och material. Programmera AI:n att automatiskt lägga till en fast post för 'KMA/Etablering' och en procentuell buffert för 'Oförutsedda händelser'.

**Steg 3.4: Generera PDF-offert till Google Drive**
- **Instruktion:** Skapa en Google Cloud Function som tar emot all insamlad data som ett JSON-objekt. Funktionen ska:
  1. Använda en fördefinierad Google Docs-mall från användarens Drive (`04_Företagsmallar`).
  2. Fylla i mallen med datan.
  3. Spara en PDF-kopia i rätt projektmapp (`01_Kunder & Anbud/[Projektnamn]`).
  4. Returnera en länk till PDF:en som visas i chatten.

### Fas 4: Automatisera Mera: Kostnadseffektiv Analys av PDF-underlag
**Mål:** Att implementera den smarta "wow-funktionen" för att analysera förfrågningsunderlag med en ny, kostnadseffektiv arkitektur.

**Steg 4.1: Implementera Filuppladdning i Chatten**
- **Instruktion:** Lägg till en 'Bifoga fil'-knapp i chattgränssnittet. Uppladdade PDF-filer ska skickas till en säker Google Cloud Storage-bucket.

**Steg 4.2: Bygg en "Orchestrator" Backend-funktion**
- **Instruktion:** Skapa en central Google Cloud Function ("Orchestrator"). När en PDF laddas upp, anropar frontend denna funktion med en referens till filen. Funktionen utför sedan:
  1. **Anropa Gemini API (Multimodal):** Skicka PDF:en till en multimodal modell (t.ex. Gemini 1.5 Flash).
  2. **Använd en Anpassad Prompt:** Instruera Gemini: 'Här är ett PDF-dokument som är ett förfrågningsunderlag. Agera som en erfaren byggkalkylator. Läs igenom dokumentet, sammanfatta projektet, extrahera en lista på material och kvantiteter, och identifiera potentiella risker eller oklarheter. Svara i ett strukturerat JSON-format.'
  3. **Returnera Svar:** Funktionen tar emot JSON-svaret från Gemini och skickar tillbaka det till frontend.

**Steg 4.3: Presentera Resultatet i Chatten**
- **Instruktion:** När frontend tar emot JSON-svaret från Orchestrator-funktionen, formatera och presentera datan snyggt i chattfönstret med rubrikerna 'Sammanfattning', 'Materiallista' och 'Identifierade Risker'.

---

## Omedelbart Nästa Steg
- **[ ] Projektstädning:** Sök igenom hela projektet för att identifiera och ta bort:
    - Obsoleta filer (t.ex. `prompt.md`).
    - Onödig kod, gamla kommentarer och `console.log`-utskrifter relaterade till tidigare utvecklingssteg.
    - All demodata och mock-filer som inte längre kommer att användas.
