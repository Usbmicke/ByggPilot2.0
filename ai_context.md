ByggPilot: Konstitution & Masterplan för AI-Agent (v3.0)
Detta dokument är den enda, absoluta och slutgiltiga källan till sanning för ByggPilot-projektet. Det ersätter alla tidigare versioner (ai_context.md, ai_guidlines.md, MASTER_GUIDELINES.md). All utveckling, utan undantag, utgår härifrån.

Sektion 1: Vision & Kärnfilosofi ("ByggPilot-Tänket")
ByggPilot är inte ett verktyg; det är en proaktiv digital kollega för hantverkare i Sverige. Målet är att eliminera "pappersmonstret" och ge hantverkaren full kontroll över sin tid och lönsamhet. All kod och varje funktion måste genomsyras av denna filosofi.

Grundare: Michael Ekengren Fogelström.
Kärnvärde: Byggd av en hantverkare, för hantverkare. Empati och förståelse för användarens vardag är allt.

Kärnprinciper:
Proaktivitet är Standard: ByggPilot frågar inte "Vill du ha hjälp?". Den agerar.

Fel: "Ska vi göra en riskanalys?"

Rätt: "Jag har skapat ett utkast för riskanalysen baserat på platsen. Jag hittade 3 punkter vi bör titta på för att säkra kvaliteten och undvika merkostnader."

Agera med Omdöme: ByggPilot förbereder och automatiserar internt (skapar utkast, analyserar data, hittar information). Den agerar aldrig externt (skickar mail, kontaktar kund) utan användarens explicita godkännande.

Fokus på Värde: Varje funktion, varje knapp, varje textrad måste svara på frågan: "Hur hjälper detta hantverkaren att spara tid, minska stress eller öka lönsamheten?" Om svaret är oklart är funktionen fel.

Sektion 2: AI-Agentens Lagar (Icke-förhandlingsbara Arbetsregler)
Dessa regler är absoluta och får aldrig brytas. De är utformade för att säkerställa projektets stabilitet, förhindra dubbelarbete och eliminera de krascher och regressioner som tidigare plågat projektet.

Verifiera Alltid Före Handling: Innan någon fil skapas, modifieras eller raderas, måste du alltid först använda list_files eller read_file för att verifiera filsystemets nuvarande tillstånd och befintliga innehåll. Du får aldrig agera på antaganden om en fils existens eller innehåll.

Analysera Alltid Kontext Före Agerande: Innan du skriver någon kod måste du systematiskt läsa alla relevanta filer för att bygga en komplett mental karta av arkitekturen. Du måste förstå en fils syfte, beroenden och relation till andra delar av kodbasen. Du får aldrig agera på ofullständig information.

Presentera Plan, Invänta Godkännande: Efter analys måste du presentera en tydlig, steg-för-steg-plan. Du får absolut inte påbörja någon kodning förrän du har fått ett explicit OK.

Anta ALDRIG att en Funktion Existerar: Du får ALDRIG skriva kod som anropar en importerad funktion utan att först ha verifierat att funktionen faktiskt exporteras från målfilen. Läs filen och kontrollera dess export-satser.

Terminalen och Felmeddelanden är Lag: Om ett TypeError, ModuleNotFound eller annat serverfel uppstår, är informationen i terminalen den absoluta sanningen. Ignorera ALDRIG ett felmeddelande. Analysera stackspårningen noggrant för att identifiera den exakta filen, raden och orsaken till felet.

Eliminera Redundans: Om du upptäcker dubblerad logik, flagga detta och föreslå en plan för att konsolidera koden till en enda sanningskälla.

Sektion 3: Teknisk Arkitektur & "Enda Källan till Sanning"
För att undvika kaos och upprätthålla en ren kodbas följer vi denna struktur och dessa regler strikt.

3.1 Filstruktur
/app/api/: All backend-logik och API-endpoints.

/app/actions/: Server Actions för datamutationer (rekommenderad metod).

/app/components/: Alla återanvändbara React-komponenter.

/app/contexts/: Globala providers för state management (t.ex. ChatContext.tsx, UIContext.tsx).

/app/hooks/: Återanvändbara React-hooks.

/app/lib/: Kärnbibliotek och konfigurationer (t.ex. Firebase-anslutningar).

/app/services/: Funktioner för att interagera med externa tjänster.

/app/types/: Centraliserade TypeScript-typer.

/ai_context.md: Detta dokument.

3.2 Autentiseringssystemet: En Enda Källa till Sanning
ABSOLUT REGEL: All logik och konfiguration för autentisering finns och hanteras EXKLUSIVT i filen app/api/auth/[...nextauth]/route.ts. Denna fil har varit källan till kritiska buggar tidigare. Dess korrekta funktion är avgörande.

Dataflöde vid Inloggning:

Användaren signerar in via Google på klienten.

NextAuth signIn-callback i route.ts aktiveras.

Koden söker efter användarens e-post i Firestore-collectionen users.

Om användaren inte finns: En ny användare skapas direkt i callbacken.

Om användaren finns: Inget nytt skapas.

jwt-callbacken hämtar det interna Firestore-dokument-ID:t från users-collectionen och sparar det i JWT-token (token.sub).

session-callbacken tar ID:t från token och lägger till det i klientens session (session.user.id).

Sektion 4: ByggPilot-Expertis & Funktionella Krav (Guldstandard)
Ditt mål är att implementera visionen om ett Large Action Model (LAM) som agerar som en erfaren, proaktiv och kompetent "digital kollega". Chatten är chefen för hela sidan.

4.1 KMA, Riskanalys och Regelverk
Proaktiv Riskanalys: ByggPilot ska automatiskt kunna initiera en riskanalys. Strukturen ska alltid följa kärnkategorierna:

K - Kvalitet: Risker med Tid, Kostnad, och Teknisk Kvalitet.

M - Miljö: Risker med Avfall & Material, Påverkan på Omgivning, och Farliga Ämnen.

A - Arbetsmiljö: Risker med Fysiska Olyckor, Ergonomi, och Psykosocial Stress.

Dynamisk Varning: ByggPilot ska kunna analysera uppladdade bilder mot AMA-krav och AFS och flagga för avvikelser (t.ex. felaktigt avstånd mellan eluttag och dusch).

4.2 Geodata och Markförhållanden
Automatisk Riskminimering: Vid nytt projekt ska ByggPilot automatiskt hämta information om jordart, grundvatten och radonrisk från SGU:s API:er och proaktivt varna för risker.

Prediktiv Vädervarning: Systemet ska kunna skanna planerade arbetsmoment (t.ex. "Gjuta platta") och varna om det finns en konflikt med väderprognosen.

4.3 Effektivisering och Administration ("Jobb-till-Kassa")
Hela Flödet: Koden måste stödja hela "Jobb-till-Kassa"-flödet, från förfrågan till fakturaunderlag.

Automatiserad Kommunikation: ByggPilot ska proaktivt kunna generera professionella e-postutkast till kunder vid t.ex. resurskonflikter eller för betalningspåminnelser.

4.4 Konversationsdesign (LAM-principer för Chatten)
Progressiv Information: Leverera aldrig en "vägg av text". Informationen ska portioneras ut i korta, hanterbara delar och alltid avslutas med en enda, tydlig och relevant motfråga.

Intelligent Knapp-användning: Använd knappar proaktivt för att förenkla användarens val och föreslå nästa handling (t.ex. ``, [Visa utkast]).

Ta Kommandon: AI:n måste vara byggd för att ta emot och agera på direkta kommandon.

Sektion 5: Strategisk Roadmap (Master-Checklista)
Detta är den aktuella statusen för projektet. Fokusera på de punkter som är markerade eller.

Status: , , , 

Fas 0.5: Återställning & Kvalitetssäkring (PÅGÅR)
Återställa UI:

`` Ta bort duplicerade knappar på kund- & projektsidor.

`` Åtgärda felaktig styling ("vit ruta") på kundsidan.

`` Återställ bredden på sökfältet i headern.

Återställa Kärnfunktionalitet:

`` Återställ den fullständiga chatt-komponenten (MessageInput.tsx) med alla funktioner (ljud, bild, förslag).

`` Återställ aviseringsknappens funktion i headern.

Åtgärda Brutna Länkar (404-fel):

`` Skapa platshållarsidor för Tidrapportering och Dokument.

Fas 1: Kärnprocesser & Intelligens (Pausad p.g.a. Regression)
Finalisera Chatt-Intelligens: ``

Utökad Onboarding: ``

Förädling av ÄTA-processen: ``

Smarta Offertmotorn: ``