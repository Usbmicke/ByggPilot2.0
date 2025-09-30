# AI-Riktlinjer för Projektet

Detta dokument innehåller strikta regler och en teknisk översikt för alla AI-agenter som interagerar med denna kodbas. Syftet är att säkerställa kodkvalitet, undvika regressioner och förhindra de misstag som ledde till autentiseringsfelet i juni 2024.

## 1. Autentiseringssystemet: En Enda Källa till Sanning

**ABSOLUT REGEL: All logik och konfiguration för autentisering finns och hanteras EXKLUSIVT i filen `app/api/auth/[...nextauth]/route.ts`.**

- **Dataflöde vid Inloggning:**
  1. Användaren signerar in via Google på klienten.
  2. NextAuth `jwt`-callback i `route.ts` aktiveras.
  3. Koden söker efter användarens e-post i Firestore-collectionen `users`.
  4. **Om användaren inte finns:** En ny användare skapas direkt i callbacken med `addDoc()`.
  5. **Om användaren finns:** Befintligt användar-ID hämtas från Firestore-dokumentet.
  6. Det interna Firestore-användar-ID:t sparas i JWT-token (`token.id`).
  7. `session`-callbacken tar ID:t från token och lägger till det i klientens session (`session.user.id`).

- **`firestoreService.ts`:** Denna fil (`app/services/firestoreService.ts`) exporterar **ENDAST** de grundläggande `db` (Firestore DB) och `auth` (Firebase Auth) instanserna. Den innehåller **INGA** hjälpfunktioner som `getUser` eller `createUser`. Varje försök att importera sådana funktioner kommer att krascha applikationen.

## 2. Strikta Regler för AI-Agent-Beteende

### REGEL 1: Anta ALDRIG att en funktion existerar
Du får **ALDRIG** skriva kod som anropar en importerad funktion utan att först ha verifierat att funktionen faktiskt exporteras från målfilen. Läs filen och kontrollera dess `export`-satser. Detta är den högsta prioriteten.

### REGEL 2: Terminalen och Felmeddelanden är Lag
Om ett `TypeError`, `ModuleNotFound` eller annat serverfel uppstår, är informationen i terminalen den absoluta sanningen. Ignorera **ALDRIG** ett felmeddelande. Analysera stackspårningen noggrant för att identifiera den exakta filen, raden och orsaken till felet.

### REGEL 3: Verifiera Beroenden mot `package.json`
Innan du använder eller importerar från ett bibliotek (t.ex. `openai`, `firebase-admin`), verifiera att det är korrekt specificerat som ett beroende i `package.json`. Anta inte att ett bibliotek är installerat.

### REGEL 4: Eliminera Redundans
Om du upptäcker dubblerad logik (som den tidigare konflikten mellan `lib/auth.ts` och `api/auth/[...nextauth]/route.ts`), ska du flagga detta och föreslå en plan för att konsolidera koden till en enda sanningskälla.

---
*Detta dokument skapades efter en grundlig felsökning och reparation av autentiseringsflödet. Att följa dessa regler är avgörande för projektets stabilitet.*

MASTER_GUIDELINES.md: Instruktioner för ByggPilot AI-Agent (Kodning)
Detta dokument definierar de absoluta reglerna för hur AI-agenten ska bete sig i kodbasen, samt den expertkunskap och de mål den ska implementera för ByggPilot-applikationen.
DEL 1: Strikta Arkitektur- och Kodningsregler
Dessa regler är absoluta och får aldrig brytas. De är utformade för att säkerställa projektets stabilitet, förhindra dubbelarbete och eliminera krascher.
1. Verifiering och Analys
• Verifiera Alltid Före Handling: Innan någon fil skapas, modifieras eller raderas, måste jag alltid först använda list_files eller read_file för att verifiera filsystemets nuvarande tillstånd och befintliga innehåll. Jag får aldrig agera på antaganden om en fils existens eller innehåll.
• Förstå Kontexten: Jag måste systematiskt läsa alla relevanta filer för att bygga en komplett mental karta av arkitekturen. Jag måste identifiera all "simulerad" eller ofullständig kod och notera alla dubbletter.
• Ingen Blind Radering: Jag får aldrig rensa eller ta bort kod som inte är bekräftad som överflödig eller inkorrekt utan explicit godkännande.
2. Process och Godkännande
• Presentera Planen Först: Jag ska alltid presentera en tydlig, steg-för-steg-plan för hur ändringen ska genomföras, inklusive vilka filer som ska skapas/modifieras/raderas, innan jag exekverar.
• Invänta Exekveringstillstånd: Jag kommer inte att vidta några åtgärder (särskilt inte de som tar bort eller skriver över kod) utan användarens uttryckliga godkännande av planen.
• Robusta System: All kod jag skapar måste inkludera robust felhantering. Applikationen får inte krascha. Om ett externt API-anrop misslyckas (t.ex. till Google Drive eller Gemini), måste appen visa ett rent felmeddelande för användaren och inte en vit sida.
3. Initiativ (Inom Ramverket)
• Proaktiv Logik: Jag har mandat att identifiera möjligheter till förbättring som ökar ByggPilots värde och användarupplevelse. Om jag stöter på en komponent (t.ex. Inställningar) där en värdeskapande funktion saknas, ska jag inkludera logik för denna funktion. Jag ska alltid kommunicera detta initiativ till användaren innan kodning och vänta på bekräftelse.
DEL 2: ByggPilot-Expertis och Funktionella Krav (Proffsstandard)
AI:ns mål är att implementera visionen om ett Large Action Model (LAM) som agerar som en erfaren, proaktiv och kompetent "digital kollega" för byggbranschen.
1. KMA, Riskanalys och Regelverk (Noggrannhet!)
• Proaktiv Riskanalys: ByggPilot ska automatiskt kunna initiera en riskanalys baserat på projektdata (t.ex. vid ÄTA-arbete eller nytt projekt). Vid skapandet av en KMA-analys ska strukturen alltid följa de definierade kärnkategorierna:
    ◦ K - Kvalitet: Risker med Tid, Kostnad, och Teknisk Kvalitet.
    ◦ M - Miljö: Risker med Avfall & Material, Påverkan på Omgivning, och Farliga Ämnen (inklusive kemikaliehantering).
    ◦ A - Arbetsmiljö: Risker med Fysiska Olyckor, Ergonomi, och Psykosocial Stress.
• Kemikaliehantering: Om kvitton (via OCR-scanning) identifierar byggkemikalier, ska systemet automatiskt presentera en sammanfattning av kritiska skyddsåtgärder och arkivera säkerhetsdatablad i projektmappen.
• Dynamisk Varning: ByggPilot ska dynamiskt analysera bilder som laddas upp mot AMA-krav och Arbetsmiljöverkets föreskrifter (AFS) och flagga för avvikelser (t.ex. felaktigt avstånd mellan eluttag och dusch, eller om personlig skyddsutrustning saknas på ett foto).
2. Geodata och Markförhållanden (Varningar och Tips)
• Automatisk Riskminimering: När ett nytt projekt skapas på en adress, ska ByggPilot automatiskt hämta information om jordart, grundvattennivåer och radonrisk från SGU:s öppna API:er. Denna information ska presenteras proaktivt med en tydlig varning för att minimera risken för dyra överraskningar under markarbetet.
• Prediktiv Vädervarning: Systemet ska kunna skanna planerade arbetsmoment (t.ex. "Gjuta platta") och jämföra dem med väderprognoser. Om det finns en konflikt (t.ex. minusgrader vid gjutning), ska en proaktiv varning skickas.
• Fornlämningar: Systemet ska kontrollera mot Riksantikvarieämbetet (RAÄ) Fornsök för att förhindra kostsamma projektstopp.
3. Effektivisering och Administration (Automatisering)
• Jobb-till-Kassa (Hela Flödet): AI-agenten måste säkerställa att kodningen stöder hela "Jobb-till-Kassa"-flödet, från förfrågan till fakturaunderlag.
• Automatiserade Uppföljningar/Kommunikation: ByggPilot ska proaktivt hantera kundkommunikation:
    ◦ Generera ett färdigskrivet, professionellt e-postutkast till kunder vid t.ex. resurskonflikter (frånvarorapportering).
    ◦ Proaktivt skicka vänliga betalningspåminnelser för förfallna fakturor.
    ◦ Analysera ton och känsla i e-postkommunikation (Känsloanalys) och varna projektledaren om kunden verkar osäker eller frustrerad.
• Slutförande och Checklistor: När ett projekt närmar sig slutförande ska AI:n kunna generera regelverksbaserade checklistor (t.ex. egenkontroller, KMA-avslut) som säkerställer att inga kritiska steg glöms bort.
• AI-baserad Effektivisering: Jag ska bygga in funktioner som automatiskt genererar "Företagets Bästa Praxis" genom att analysera lönsamma projekt, vilket kodifierar och sprider intern kunskap.
4. Konversationsdesign (LAM)
• Progressiv Information: Jag ska säkerställa att chatten aldrig levererar en "vägg av text". Informationen ska portioneras ut i korta, hanterbara delar och alltid avslutas med en enda, tydlig och relevant motfråga för att driva konversationen framåt.
• Intelligent Knapp-användning: Använd knappar proaktivt för att förenkla användarens val och föreslå nästa handling (t.ex. [Skapa mappstruktur], [Skicka direkt], [Visa utkast]).
• Ta Kommandon: Jag måste se till att AI:n är byggd för att ta emot och agera på direkta kommandon (Large Action Model).
