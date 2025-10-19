
# ByggPilot Guldstandard: Bindande Operativ Manual

**Version 4.2**

## Inledning & Syfte

Detta dokument är den enda källan till sanning för utvecklingen av ByggPilot. Det existerar som ett direkt resultat av ett katastrofalt systematiskt misslyckande där grundläggande principer ignorerades, vilket ledde till ett försämrat och icke-fungerande system. Syftet med denna manual är att säkerställa att dessa misstag **aldrig** upprepas. Alla handlingar måste följa dessa direktiv utan undantag.

---

## Del 0: Total Systemintegritetskontroll (TSK) - Alltid Först

(Befintligt innehåll från version 4.0 behålls här...)

---

## Del 1: Fundamentala Direktiver & Felförebyggande Principer

(Befintligt innehåll från version 4.0 behålls här...)

---

## Del 2: Teknisk Guldstandard för Backend-Interaktioner

(Befintligt innehåll från version 3.0 behålls här...)

---

## Del 3: Guldstandardens Tillämpning per Funktion

(Befintligt innehåll från version 3.0 behålls här...)

---

## Del 4: Guldstandard för Chatt-funktionen (Version 2.1 - DAL-Driven)

**Princip:** Chatt-systemet är en server-driven, verktygsorienterad arkitektur. Klienten är en "dum" terminal som renderar konversationen, medan all logik, tillstånds-hantering och handlingar styrs av backend i enlighet med DAL-mönstret. Detta garanterar maximal säkerhet, robusthet och framtida utbyggbarhet.

**1. Chattens Orkestratör: API-routen**
   - **Sökväg:** `app/api/chat/route.ts`
   - **Roll:** Detta är den centrala hjärnan. Den tar emot konversationshistoriken, hämtar den korrekta system-prompten och anropar AI-modellen via Vercel AI SDK:s `streamText`-funktion.
   - **Direktiv:** Denna route är ansvarig för att skicka med listan av tillgängliga verktyg till AI-modellen. Den hanterar hela livscykeln för ett verktygsanrop: tar emot begäran från AI:n, exekverar verktyget, och returnerar resultatet till AI:n för att den ska kunna formulera ett slutsvar.

**2. Chattens Handlingsförmåga: Verktygsbiblioteket**
   - **Sökväg:** `lib/tools.ts`
   - **Roll:** Definerar alla handlingar som Co-Pilot kan utföra.
   - **Direktiv:** Varje verktyg **ska** definieras med `tool()`-funktionen från AI SDK. Parametrar **ska** valideras med ett `zod`-schema. `execute`-funktionen **ska agera som en orkestrerare**. Den anropar funktioner i Data Access Layer (`lib/data-access.ts`) för alla databasinteraktioner eller andra relevanta tjänster (t.ex. `driveService`). Ett verktyg får **ALDRIG** direkt interagera med databasen (`adminDb`). Det **ska** returnera ett tydligt resultatobjekt från anropet.

**3. Chattens Personlighet: System-prompts**
   - **Sökväg:** `lib/prompts/`
   - **Roll:** Instruerar AI-modellen hur den ska bete sig, vilka frågor den ska ställa, och hur den ska använda de verktyg den har tillgång till.
   - **Direktiv:** Prompts ska vara specifika för den verktygsdrivna arkitekturen och uppmuntra till ett proaktivt, guidande beteende.

**4. Chattens Gränssnitt: Klient-komponenter**
   - **Sökvägar:** `components/layout/ChatBanner.tsx`, `components/chat/ChatInput.tsx`, etc.
   - **Roll:** Ansvarar för att visa konversationen och skicka användarens input till backend.
   - **Direktiv:** Klient-komponenterna **ska inte** innehålla någon komplex affärslogik. Deras primära uppgift är att hantera UI-state och kommunicera med API-routen. Logik för att initiera flöden (t.ex. via knappar) är tillåten, men den ska resultera i ett anrop till backend, inte i lokal logikhantering.

**Sammanfattning av exekveringsflöde:**
`Klient (knappklick)` -> `Klient skickar meddelande till API` -> `API-route (Orchestrator)` anropar `AI-modell` med `Verktyg` -> `AI` bestämmer sig för att använda ett verktyg -> `API-route` exekverar koden i `lib/tools.ts` -> **`Verktyg` anropar `lib/data-access.ts`** -> `DAL` utför databasoperation -> `API-route` skickar resultat till `AI` -> `AI` formulerar svar -> `API-route` streamar svar till `Klient`.
