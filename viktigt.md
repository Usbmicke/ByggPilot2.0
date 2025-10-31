Del IV: ByggPilots Implementerings-Blueprint
Detta är den mest omfattande och handlingsinriktade delen av rapporten, som tillhandahåller kompletta, färdiga prompter för att återuppbygga ByggPilot.

4.1 Flöde 1: Grundläggande Refaktorering & Kodsannering
Mål: Att vägleda AI:n i att utföra den "Kirurgiska Rensning" som beskrivs i MASTER-PROMPT: ByggPilot Totalrenovering & Världsklass-Arkitektur v2.0.   

Arkitektens Prompt: Kodhygien & Strukturell Sanering

ROLL & MÅL:
Du är en senior mjukvaruingenjör specialiserad på kodkvalitet och storskalig refaktorering i Next.js-projekt. Ditt uppdrag är att genomföra en total sanering av ByggPilot-kodbasen för att etablera en kliniskt ren och förutsägbar grund, i enlighet med Fas 0 i projektets huvudplan.

ARKITEKTONISK KONTEXT & BEGRÄNSNINGAR:
1.  **Sökvägs-alias:** Projektet använder alias definierade i `tsconfig.json` (t.ex. `@/components`, `@/lib`). En känd systematisk bugg är felaktiga importvägar som använder `@/app/`.
2.  **Loggning:** All `console.log`, `console.warn`, och `console.error` ska ersättas med anrop till den befintliga `pino`-loggerinstansen från `@/lib/logger`.
3.  **Schema-centralisering:** Alla Zod-scheman är för närvarande utspridda i projektet. De ska konsolideras till en "Single Source of Truth" i en ny katalog: `lib/schemas`.
4.  **Verifieringsprotokoll:** Efter *varje enskild filändring* måste du verifiera att applikationen fortfarande kompilerar utan nya fel genom att köra `npm run dev`. Detta är ett icke-förhandlingsbart krav för att förhindra ackumulering av fel.

STEG-FÖR-STEG IMPLEMENTERINGSPLAN:
1.  **Korrigera Importvägar:**
    a.  Exekvera kommandot `grep -r "'@/app/" app/` för att generera en komplett lista över alla filer med felaktiga importvägar.
    b.  Gå igenom listan metodiskt, en fil i taget.
    c.  För varje fil, korrigera alla `@/app/...`-importer till att använda korrekta alias (t.ex. `@/components/...`).
    d.  Efter varje korrigerad fil, kör `npm run dev` och rapportera resultatet. Fortsätt inte till nästa fil förrän kompileringen lyckas.

2.  **Sanera `console.log`:**
    a.  Sök igenom hela kodbasen efter alla förekomster av `console.log`, `console.warn`, och `console.error`.
    b.  Ersätt systematiskt varje anrop med motsvarande anrop till `logger`-instansen (t.ex. `logger.info(...)`, `logger.error(...)`). Importera loggern från `@/lib/logger` där det behövs.
    c.  Verifiera kompilering efter varje filändring.

3.  **Centralisera Zod-scheman:**
    a.  Skapa en ny katalog: `lib/schemas`.
    b.  Genomsök hela projektet och identifiera alla Zod-scheman.
    c.  Flytta varje schema till en egen fil inuti `lib/schemas` (t.ex. `lib/schemas/userSchema.ts`).
    d.  Skapa en `index.ts`-fil i `lib/schemas` som exporterar alla scheman från en central plats.
    e.  Refaktorera all kod i hela projektet som använde de gamla scheman-filerna till att nu importera dem från `lib/schemas`.
    f.  Verifiera kompilering efter varje refaktorerad fil.

ACCEPTANSKRITERIER & VERIFIERINGSPROTOKOLL:
-   Inga `console.log`-anrop finns kvar i applikationskoden.
-   Kommandot `grep -r "'@/app/" app/` returnerar ett tomt resultat.
-   Alla Zod-scheman importeras från den centrala `lib/schemas`-katalogen.
-   Hela applikationen kompilerar och körs framgångsrikt med `npm run dev` efter att alla steg är slutförda.
4.2 Flöde 2: Härdning av Autentisering & Onboarding
Mål: Att återuppbygga autentiserings- och onboarding-flödena enligt "Guldstandard"-checklistan.   

Arkitektens Prompt: Implementering av Vattentät Autentisering och Onboarding

ROLL & MÅL:
Du är en säkerhetsexpert och Next.js-arkitekt. Ditt uppdrag är att implementera ett "vattentätt" autentiserings- och onboarding-flöde för ByggPilot, enligt Kategori 1 och 2 i "Teknisk Granskning & Valideringsprotokoll". Du ska eliminera alla tidigare säkerhetsrisker och buggar, inklusive den kända omdirigeringsloopen.

ARKITEKTONISK KONTEXT & BEGRÄNSNINGAR:
1.  **Autentiseringskärna:** All NextAuth-logik måste centraliseras i `app/api/auth/[...nextauth]/route.ts`.
2.  **Adapter:** `@auth/firebase-adapter` ska användas för att koppla NextAuth till Firebase.
3.  **Sessionstrategi:** Sessionstrategin måste vara `jwt` för att säkerställa "stateless" verifiering och minimera databasanrop.
4.  **DAL-imperativet:** All databaslogik för att spara onboarding-status måste gå via DAL (`lib/data-access.ts`).
5.  **Känt Problem:** En "race condition" har tidigare orsakat en oändlig omdirigeringsloop. Lösningen kräver en explicit synkronisering av klientsessionen.

STEG-FÖR-STEG IMPLEMENTERINGSPLAN:
1.  **Konfigurera NextAuth-kärnan (`app/api/auth/[...nextauth]/route.ts`):**
    a.  Implementera `GoogleProvider`. Hämta `clientId` och `clientSecret` exklusivt från miljövariabler (`process.env`).
    b.  Konfigurera `@auth/firebase-adapter` med Firestore-instansen.
    c.  Sätt `session: { strategy: 'jwt' }`.
    d.  Implementera `callbacks`-objektet:
        i.  `jwt`: Berika tokenet med användarens unika Firebase UID (`token.sub = user.id`).
        ii. `session`: Exponera UID från token till klientsessionen (`session.user.id = token.sub`) och hämta `onboardingCompleted`-status från Firestore via DAL för att lägga till den i sessionen.

2.  **Skydda Sidor med Middleware (`middleware.ts`):**
    a.  Implementera middleware för att skydda alla routes under `/dashboard`.
    b.  Logiken ska omedelbart omdirigera oautentiserade användare till startsidan på nätverkskanten ("the edge") för att förhindra kostsam server-rendering.

3.  **Refaktorera Onboarding-flödet:**
    a.  Säkerställ att varje steg i onboarding-flödet (t.ex. spara företagsprofil, skapa mappstruktur) anropar en dedikerad och säker Server Action.
    b.  Verifiera att dessa Server Actions *uteslutande* anropar funktioner i DAL för att interagera med databasen.
    c.  **Lös omdirigeringsloopen:** I den klientkomponent som hanterar det sista steget av onboardingen (t.ex. efter att mappstrukturen har skapats), implementera följande logik:
        i.   Anropa Server Action och `await` dess slutförande.
        ii.  Hämta `update` funktionen från `useSession()`-hooken.
        iii. *Efter* att Server Action har lyckats, anropa `await update()`. Detta tvingar klienten att hämta den senaste sessioninformationen från servern.
        iv.  *Först därefter*, anropa `router.push('/dashboard')`.

ACCEPTANSKRITERIER & VERIFIERINGSPROTOKOLL:
-   En ny användare kan logga in med Google, och en användarpost skapas korrekt i både Firebase Authentication och Firestore.
-   Användarens session-objekt på klienten innehåller korrekt `userId` och `onboardingCompleted` status.
-   En oautentiserad användare som försöker nå `/dashboard` omdirigeras omedelbart.
-   En ny användare slutför hela onboarding-processen och landar på `/dashboard` utan att fastna i en omdirigeringsloop.
-   Server Action för att skapa Google Drive-mappstruktur är idempotent (innehåller kontroll för att förhindra dubbletter).
4.3 Flöde 3: Rekonstruktion av AI Co-Pilot (Chatt)
Mål: Att implementera den fullständiga LAM-arkitekturen för chattfunktionen enligt checklistan och bästa praxis från Del II.

Arkitektens Prompt: Bygga en Säker och Strömmande AI Co-Pilot

ROLL & MÅL:
Du är en expert på att bygga AI-agenter med Next.js. Ditt uppdrag är att från grunden bygga om ByggPilots chattfunktion till "Platinum Standard", enligt Kategori 3 i "Teknisk Granskning & Valideringsprotokoll". Systemet ska vara extremt säkert, stabilt, intelligent och byggt enligt LAM-arkitekturen med strömmande svar.

ARKITEKTONISK KONTEXT & BEGRÄNSNINGAR:
1.  **LAM-brandväggen:** AI:n får endast returnera `tool_calls`-objekt. All exekvering sker i backend-orkestreraren.
2.  **Verktygsdefinition:** Alla AI-förmågor definieras som "verktyg" i `lib/tools.ts` med Zod-scheman för validering.
3.  **Streaming:** Svar till klienten måste strömmas för en responsiv användarupplevelse. Vercel AI SDK ska användas för detta.
4.  **State Management:** Klient-sidig state för chatthistorik måste hanteras med `useSWR`.
5.  **Säkerhet:** Användarsessionen måste verifieras i början av varje API-anrop. Rate limiting med `@upstash/ratelimit` är ett krav.

STEG-FÖR-STEG IMPLEMENTERINGSPLAN:
1.  **Definiera Verktygslådan (`lib/tools.ts`):**
    a.  Skapa en `tool`-definition för varje planerad AI-förmåga (t.ex. `createProject`, `getWeather`).
    b.  För varje verktyg, definiera ett Zod-schema som strikt validerar alla inparametrar.
    c.  Inkludera en tydlig `description` för varje verktyg som förklarar dess syfte för AI-modellen.

2.  **Bygg Backend-orkestreraren (`app/api/chat/route.ts`):**
    a.  Implementera en `POST`-hanterare.
    b.  **Säkerhet:** Som första steg, validera användarsessionen. Om ingen session finns, returnera ett 401-fel.
    c.  **Rate Limiting:** Integrera `@upstash/ratelimit` för att skydda mot missbruk.
    d.  **Streaming & Tool Use:** Använd Vercel AI SDK:s `streamText` eller motsvarande funktion. Skicka med användarens meddelandehistorik, Master-Prompten, och den definierade `tools`-listan från `lib/tools.ts`.
    e.  Implementera logik för att hantera svaret från AI-modellen. Om svaret innehåller `tool_calls`:
        i.   Validera `tool_calls`-objektet (behörighet, Zod-schema).
        ii.  Anropa motsvarande säkra funktion i DAL.
        iii. Skicka tillbaka resultatet från verktyget till AI-modellen för att generera ett slutsvar.
    f.  **Felhantering:** Omslut all logik i robusta `try...catch`-block. Logga tekniska fel med `pino` men returnera användarvänliga felmeddelanden i strömmen.

3.  **Implementera Frontend-UI:**
    a.  **Datahantering:** Använd `useSWR` för att hämta och hantera all data och state för chatthistoriken.
    b.  **Interaktion:** Använd `useChat`-hooken från `@ai-sdk/react` (eller motsvarande) för att hantera sändning av meddelanden och mottagning av den strömmade responsen.
    c.  **Optimistiskt UI:** Implementera optimistiska UI-uppdateringar när användaren skickar ett meddelande för att ge en omedelbar känsla av snabbhet.
    d.  **Specialiserade Komponenter:** Bygg dedikerade React-komponenter (`ChatMessage`, `ChatInput`, etc.). Skapa även specialkomponenter för att rendera AI:ns svar, såsom inramade checklistor med kopiera-ikon och "dokument-kort" med länkar, för att uppnå "Platinum Standard UI".

ACCEPTANSKRITERIER & VERIFIERINGSPROTOKOLL:
-   Användarsessionen verifieras vid varje anrop till chatt-API:et.
-   Rate limiting är aktivt och förhindrar missbruk.
-   AI-modellen utför aldrig handlingar direkt, utan returnerar endast ett `tool_calls`-objekt.
-   Backend validerar `tool_calls`-objektet med Zod innan DAL anropas.
-   AI:ns svar strömmas till klienten och renderas ord för ord.
-   Chatthistoriken hanteras stabilt med `useSWR`.
-   Specialiserade svar (checklistor, dokument) renderas med anpassade, polerade UI-komponenter.
-   "Trelagers Friskrivning" är implementerad (statisk text i UI, dynamisk sidfot i genererade dokument, kontextuell regel i Master-Prompt).
4.4 Flöde 4: Montering av "Kungstandard"-Dashboarden
Mål: Att bygga huvud-dashboard-sidorna enligt checklistan.   

Arkitektens Prompt: Konstruktion av en Prestandaoptimerad Dashboard

ROLL & MÅL:
Du är en Next.js-prestandaexpert. Ditt uppdrag är att bygga kärnsidorna i ByggPilots dashboard (t.ex. `/dashboard/projects`) enligt Kategori 4 i "Teknisk Granskning & Valideringsprotokoll". Arkitekturen måste vara snabb, säker och kostnadseffektiv genom maximal användning av Server Components.

ARKITEKTONISK KONTEXT & BEGRÄNSNINGAR:
1.  **Server Components Först:** Huvudsidorna måste byggas som `async` Server Components för att maximera prestanda och säkerhet.
2.  **DAL-imperativet:** All datahämtning måste ske direkt och säkert via DAL (`lib/data-access.ts`) inuti Server Components. Inga mellanliggande, onödiga API-anrop är tillåtna.
3.  **Minimal Dataexponering:** Endast den minimala data som behövs ska skickas som `props` till underliggande klientkomponenter. Känslig information får aldrig exponeras för klienten.
4.  **Sömlös UX:** Användarupplevelsen ska vara sömlös. UI ska uppdateras intelligent när underliggande data ändras av andra delar av applikationen, som chatten.

STEG-FÖR-STEG IMPLEMENTERINGSPLAN:
1.  **Bygg Huvudsidan (`/dashboard/projects/page.tsx`):**
    a.  Definiera komponenten som en `async function`.
    b.  Inuti komponenten, anropa DAL-funktionen `getProjectsForUser()` för att hämta projektlistan. DAL kommer internt att hantera sessionsvalidering.
    c.  Rendera en server-komponent (t.ex. `<ProjectList>`) och skicka den hämtade datan som en `prop`.

2.  **Implementera Interaktiva Klientkomponenter:**
    a.  Om projektlistan behöver interaktivitet (t.ex. knappar, filter), skapa en underliggande klientkomponent (`'use client';`).
    b.  Server-komponenten `<ProjectList>` ska rendera denna klientkomponent och endast skicka den data som är absolut nödvändig för rendering (t.ex. projekt-ID och namn, men inte interna kostnadsdata).

3.  **Implementera Sömlösa UI-uppdateringar:**
    a.  Säkerställ att datahämtningen på dashboardsidan använder `useSWR`.
    b.  I AI-chatten, efter att en handling som ändrar data har slutförts (t.ex. verktyget `createProject` har exekverats framgångsrikt), anropa `mutate`-funktionen från `SWR` med nyckeln för projektlistan.
    c.  Detta kommer intelligent att trigga en automatisk omvalidering och uppdatering av UI på `/dashboard/projects` utan att en fullständig sidomladdning krävs.

4.  **Bygg Dashboard-widgets (`/dashboard/page.tsx`):**
    a.  Designa varje widget (Väder, Google Tasks) som en oberoende klientkomponent.
    b.  Varje widget ska hämta sin egen data med `useSWR`.
    c.  Implementera isolerad felhantering för varje widget. Ett fel i väder-API:et får inte krascha hela dashboarden; endast den specifika widgeten ska visa ett felmeddelande.
    d.  Designa proaktiva "Zero States" för varje widget som guidar användaren till nästa logiska handling när ingen data finns att visa.

ACCEPTANSKRITERIER & VERIFIERINGSPROTOKOLL:
-   Huvudsidor som `/dashboard/projects` är `async` Server Components.
-   Data hämtas direkt via DAL utan onödiga API-anrop.
-   Känslig information exponeras inte för klienten.
-   När ett projekt skapas i chatten, uppdateras projektlistan på dashboarden automatiskt.
-   Ett fel i en enskild dashboard-widget påverkar inte resten av sidan.
4.5 Flöde 5: En Mall för Framtida Tillväxt (Kemikaliehantering)
Mål: Att tillhandahålla en praktisk, återanvändbar mall som demonstrerar hur man tillämpar "Arkitektens Prompt"-metodiken på en ny funktion från backloggen.   

Arkitektens Prompt: Implementering av Automatiserad Kemikaliehantering

ROLL & MÅL:
Du är en fullstack-utvecklare med expertis inom AI-integration och regelefterlevnad. Ditt uppdrag är att implementera en ny funktion för "Automatiserad Kemikaliehantering" i ByggPilot. Funktionen ska proaktivt hjälpa användaren att uppfylla Arbetsmiljöverkets krav genom att identifiera kemikalier från skannade kvitton och presentera säkerhetsinformation.

ARKITEKTONISK KONTEXT & BEGRÄNSNINGAR:
1.  **LAM-arkitekturen:** Funktionen måste implementeras som ett nytt "verktyg" för AI-agenten.
2.  **Indata:** Funktionen triggas när användaren laddar upp en bild av ett kvitto. Vi antar att en OCR-tjänst redan finns som kan extrahera text från bilden.
3.  **DAL-imperativet:** All interaktion med databaser eller lagring av information måste ske via DAL.
4.  **Extern Data:** Funktionen kommer att behöva anropa ett externt API (simulerat för detta steg) för att hämta säkerhetsdatablad.

STEG-FÖR-STEG IMPLEMENTERINGSPLAN:
1.  **Skapa ett Nytt Verktyg (`lib/tools.ts`):**
    a.  Definiera ett nytt verktyg med namnet `identifyChemicalsAndProvideSafetyInfo`.
    b.  Dess Zod-schema ska acceptera en sträng som parameter: `receiptText: z.string()`.
    c.  Skriv en tydlig `description`: "Analyserar texten från ett kvitto för att identifiera produktnamn på byggkemikalier, hämtar säkerhetsinformation för dem och returnerar en sammanfattning."

2.  **Skapa en Ny DAL-funktion (`lib/data-access.ts`):**
    a.  Skapa en ny asynkron funktion, `fetchSafetyDataForProduct(productName: string)`.
    b.  Denna funktion ska (för nu) simulera ett anrop till ett externt API. Den ska returnera ett objekt med säkerhetsinformation (t.ex. `{ protectiveGear:, hazardLevel: 'Röd' }`).

3.  **Implementera Verktygets Exekveringslogik (`app/api/chat/route.ts`):**
    a.  I orkestreraren, lägg till logik för att hantera anrop till det nya verktyget `identifyChemicalsAndProvideSafetyInfo`.
    b.  När verktyget anropas ska exekveringslogiken:
        i.   Parsa `receiptText` för att extrahera potentiella produktnamn (t.ex. "Essve Fogskum").
        ii.  För varje identifierat produktnamn, anropa DAL-funktionen `fetchSafetyDataForProduct`.
        iii. Sammanställ resultaten och returnera dem till AI-modellen.

4.  **Skapa en Ny UI-komponent:**
    a.  Skapa en ny React-komponent, `ChemicalSafetyCard.tsx`.
    b.  Denna komponent ska ta emot säkerhetsinformationen som `props` och rendera den på ett tydligt och visuellt sätt, med färgkodning baserat på `hazardLevel` (t.ex. röd bakgrund för hög fara).

5.  **Uppdatera Master-Prompten:**
    a.  Lägg till en instruktion i Master-Prompten som uppmanar AI:n att, när ett kvitto analyseras, proaktivt föreslå att använda verktyget `identifyChemicalsAndProvideSafetyInfo` om den misstänker att kvittot innehåller kemikalier.

ACCEPTANSKRITERIER & VERIFIERINGSPROTOKOLL:
-   När en användare laddar upp ett kvitto med "Essve Fogskum", kan AI:n identifiera produkten och använda det nya verktyget.
-   Resultatet presenteras i chatten med hjälp av den nya `ChemicalSafetyCard.tsx`-komponenten, som tydligt visar nödvändig skyddsutrustning och en röd varningsfärg.
-   All extern datainhämtning är korrekt inkapslad inom DAL.