ByggPilot - Master Plan (Reviderad 4.0)
Övergripande Mål
Att bygga en tekniskt solid, säker och skalbar SaaS-applikation (ByggPilot) som fungerar som en "digital kollega" för byggbranschen. Projektet har ett tydligt exit-fokus, vilket ställer extremt höga krav på kodkvalitet, testning och underhållbarhet.

Nulägesanalys & Arkitektur
Projektet består av två distinkta delar:

Den Skarpa Applikationen (/dashboard): En Next.js-app med App Router. Använder Firebase för databas (Firestore) och autentisering (NextAuth med Google Provider). All backend-logik hanteras av API Routes. Kärnan i appens intelligens är en central /api/orchestrator-slutpunkt som styr konversationer och anropar andra interna API:er.

Den Interaktiva Demon (/demo): En helt frikopplad sandlåda på en separat route. Den använder ingen live-data från Firebase, utan drivs uteslutande av statisk, hårdkodad data från app/demo/data.ts. Syftet är att ge en riskfri och övertygande demonstration av appens UI och grundläggande flöden.

VIKTIGT: All ny utveckling av kärnfunktioner ska ske i den Skarpa Applikationen. Demon uppdateras endast vid behov för att spegla nya UI-förändringar.

Reviderad Byggplan 4.0
Kärnfunktionalitet & Kvalitetssäkring - SLUTFÖRD
Status: En fullständig kvalitetsgranskning av den befintliga kodbasen har genomförts.

Resultat:

Sessionshantering (iron-session) är säker och korrekt implementerad.

API-routes för att lista projekt och kunder är skyddade och effektiva.

Orchestrator-API:et är säkert men har ofullständiga funktioner.

Google Drive-integrationen är inte påbörjad, endast förberedd i UI.

Fas 7: Automatisk Kundverifiering (Bolagsverket)
Status: Grund-API & Simulerat Flöde Slutfört.

Detaljer: En API-route (/api/verify-company) finns och är integrerad i orchestratorns "Skapa ny kund"-flöde. API:et är simulerat och returnerar hårdkodad data för testning.

Aktuell Arbetsorder & Nästa Steg
Nästa Steg (Högsta Prioritet): Slutför 'Skapa Projekt'-logiken i Orchestratorn

Bakgrund: Kvalitetsgranskningen visade att chattflödet för att skapa en offert är komplett fram till dokumentval, men funktionen för att faktiskt skapa ett nytt projekt i databasen via chatten är inte implementerad.

Uppdrag:

Implementera logiken i /api/orchestrator/route.ts som hanterar när användaren bekräftar en offertsammanfattning.

Orchestratorn ska då anropa den befintliga API-routen för att skapa projekt (/api/projects/route.ts) med den insamlade datan (kund-ID, projektnamn etc.).

Säkerställ att det nya projektet sparas korrekt i Firestore.

Ge användaren en bekräftelse i chatten med en länk till det nyskapade projektet.

Efterföljande Faser (Enligt tidigare plan):
När kärnflödet för att skapa projekt är komplett, fortsätter vi med externa API-integrationer.

Fas 8: Proaktiv Väder- och Varningsassistent (SMHI)

Fas 9: Dynamisk Regelverkskontroll (Lantmäteriet & Boverket)

Fas 10: Geologisk Riskbedömning (SGU)

Fas 11: System för Kontinuerligt Lärande

Fas 12: Förbättrad Användbarhet i Fält (Röststyrning & PWA)

Fas 13: Slutgiltig Kvalitetssäkring

Stående Order & Kvalitetskrav
Testning Först: All ny backend-logik (API Routes) måste föregås av eller åtföljas av automatiserade tester (Vitest). Detta är icke-förhandlingsbart.

Säkerhet: Alla API-routes måste verifiera användarens session i början av varje anrop. Ingen data får exponeras för oautentiserade användare.

Effektivitet: Använd fields-parametern vid anrop till externa API:er (som Google Drive) för att minimera datamängd och kostnad. Undvik onödiga databasläsningar.

Versionshantering: Använd Conventional Commits för alla Git-commits för att skapa en tydlig och spårbar historik.