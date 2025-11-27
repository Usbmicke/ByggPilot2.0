Läs @AI_INSTRUCTIONS.md som ligger i docs mappen i roten innan du gör något alls. Du skapar aldrig nya filer utan att ha stenkoll på ifall det finns något innan.
      
      Kontrollera alla punkter igen NOGGRANT. Varje steg är utformat för att bygga vidare på det föregående, vilket eliminerar risken för "spagettikod".
      

---Varje steg är utformat för att bygga vidare på det föregående, vilket eliminerar risken för "spagettikod".

🟢 FAS 1: Infrastruktur & Miljö (The Foundation)
Mål: En stabil, isolerad och reproducerbar miljö som förhindrar krascher (SIGKILL) och datakaos.
1.1 Renovering av Miljön
[ ] Node.js Uppgradering: Säkerställ att utvecklingsmiljön och CI/CD kör Node.js v20 LTS (krav för Next.js 16/Genkit).
[ ] Paketrensning: Avinstallera skoningslöst alla gamla paket: next-auth, @auth/firebase-adapter, @genkit-ai/vertexai. Dessa orsakar konflikter.
[ ] Installation: Installera kärnpaketen: genkit, @genkit-ai/google-genai (Unified SDK), firebase-admin, zod, swr.
1.2 Dockerisering & IaC
[ ] Docker: Skapa docker-compose.yml som startar Next.js, Genkit Server och Firebase Emulator Suite i isolerade containrar.
[ ] Terraform: Skapa grundläggande Terraform-konfig för att definiera Firestore, Cloud Functions och IAM-roller. Inga manuella "klick" i Google Cloud Console.
[ ] Secret Manager: Skapa hemligheter i Google Secret Manager (Service Account JSON, API-nycklar). Ta bort känslig data från .env-filer.(denna hoppar vi över tills allt funkar. Inget här förän mitt ok.)

🟡 FAS 2: Kärnarkitektur (The Skeleton)
Mål: Etablera de tvingande reglerna för hur kod får skrivas och hur data flödar.
(Extra tillägg, dock fel punkter men bry dig inte om det: FAS 2: Felhantering & Övervakning (The Safety Net)
      Mål: Att aldrig mer behöva jaga buggar manuellt. Få dem serverade på silverfat och ge användaren en professionell upplevelse, även när något går fel.

      2.xx Förebygga Fel (Statisk Analys & Validering)
      
      [ ] ESLint (Superladdad): Konfigurera `.eslintrc.json` med "no-restricted-imports" för att förbjuda server-kod (som `firebase-admin` eller `server-only`) i klient-komponenter (`./src/app`). Detta hade fångat vårt `SIGKILL`-fel direkt.
      
      [ ] TypeScript (Strict Mode): Granska `tsconfig.json` och säkerställ att `noImplicitAny` är `true`. Krascha bygget om `any` används.
      
      [ ] Zod (Runtime Validation): Integrera Zod i alla Genkit-flöden för både `inputSchema` och `outputSchema`. Detta garanterar att AI-svar och klient-input alltid har rätt format.

      2.x Övervakning i Produktion (Automatisk Felrapportering)
      
      [ ] Sentry (Frontend): Installera och konfigurera Sentry för Next.js. Fånga alla klient-fel automatiskt, inklusive Session Replays för att se exakt vad användaren gjorde.
      
      [ ] Google Cloud Error Reporting (Backend): Verifiera att `console.error` i Genkit-flöden (fångade i `try...catch`) automatiskt dyker upp i Google Cloud Console. Detta är inbyggt, men vi måste säkerställa att vi loggar korrekt.

      2.xxx Användarupplevelse vid Fel (Graceful Degradation)
      
      [ ] Global Error Boundary: Skapa en rot-fil `error.tsx` i `/app`. Denna komponent kommer att renderas istället för en kraschad del av applikationen, visa ett användarvänligt meddelande ("Hoppsan, något gick fel. Våra tekniker har underrättats.") och logga felet till Sentry.

)
2.1 Data Access Layer (DAL) - "The Gatekeeper"
[ ] Skapa mappen: src/lib/dal.
[ ] Server-Only: Lägg till import 'server-only' överst i varje fil i denna mapp. Detta förhindrar att firebase-admin läcker till klienten och kraschar bygget.
[ ] Repositories: Skapa basfiler: user.repo.ts, project.repo.ts. Dessa är de enda filerna som får importera firebase-admin.
2.2 Genkit Gateway - "The Bridge"
[ ] Proxy-rutt: Skapa filen src/app/api/[[...genkit]]/route.ts. Denna ska konfigureras att ta emot anrop och vidarebefordra dem till Genkit-instansen.
[ ] CORS & Headers: Konfigurera rutten att tillåta och vidarebefordra Authorization: Bearer-headern intakt.
2.3 Frontend Core
[ ] ESLint Regler: Konfigurera no-restricted-imports för att förbjuda import av src/lib/dal från klientkomponenter.
[ ] useGenkit Hook: Skapa en custom hook (wrapper runt SWR) som hanterar runFlow, token-hämtning och loading-states.

🔵 FAS 3: Identitet & Onboarding (The Entry)
Mål: Ett "Zero Trust"-inloggningsflöde som sätter upp användarens digitala kontor utan loopar.
3.1 Klient-autentisering
[ ] AuthProvider: Skapa en React Context (AuthProvider.tsx) som använder Firebase Client SDK (onIdTokenChanged). Denna ska bara hålla koll på token och user-objekt, inga cookies.
[ ] Login UI: Implementera signInWithPopup (Google) i inloggningskomponenten.
[ ] Token Injection: Säkerställ att useGenkit-hooken automatiskt hämtar en färsk token (user.getIdToken()) vid varje anrop.
3.2 Onboarding Flow (Backend)
[ ] Genkit Flow: Skapa src/lib/genkit/flows/onboarding.ts.
[ ] Auth Policy: Lägg till authPolicy: firebaseAuth(...) som validerar token innan koden körs.
[ ] Logik (Idempotent):
Verifiera/Skapa användare i Firestore via DAL.
Autentisera mot Google Drive (Service Account).
Kritisk kontroll: Kolla om mappen "ByggPilot - [Företagsnamn]" redan finns. Om ja -> hoppa över skapande (förhindrar loopar/kostnader).
Sätt onboardingCompleted: true i Firestore.
3.3 Onboarding UI
[ ] ProtectedRoute: Skapa en komponent som omsluter skyddade sidor. Om användaren saknar token -> Login. Om onboardingCompleted (hämtat via Genkit) är false -> Onboarding.
[ ] Onboarding Wizard: Bygg en steg-för-steg-modal som anropar onboardingFlow och visar en laddningsanimation medan mappar skapas.

🟣 FAS 4: Dashboard & Navigation (The Cockpit)
Mål: En operativ kommandocentral, inte bara en statisk sida.
4.1 Layout & Navigation
[ ] App Shell: Implementera Sidebar och Header i layout.tsx.
[ ] Command Center: Implementera en global modal (Cmd+K) för snabbsökning av projekt och kommandon ("Nytt projekt", "Logga tid").
4.2 Widgets
[ ] Project List: Hämta aktiva projekt via Genkit+DAL. Implementera "Zero State" (stor CTA-knapp om listan är tom).
[ ] Quick Log: Skapa en widget för snabb tidsregistrering. Dropdown med projekt -> Start/Stopp-knapp.
[ ] Todo List: Integrera Google Tasks (via Genkit flow som pratar med Google API).
[ ] Väder: Integrera väder-API baserat på projektets geolokalisering.

🟠 FAS 5: AI Co-Pilot (The Brain)
Mål: En strömmande, proaktiv assistent som kan utföra handlingar.
5.1 Chatt-motor
[ ] Chat Flow: Skapa chatFlow i Genkit med stream: true.
[ ] Streaming UI: Implementera frontend-logik för att rendera texten ord-för-ord ("skrivmaskinseffekt").
[ ] Historik: Implementera logik i DAL för att hämta de N senaste meddelandena och ge AI:n kontext.
5.2 Verktyg (Tools - LAM)
[ ] Tool Definitions: Definiera verktyg i Genkit med Zod-scheman:
startProject: Skapar projekt i DB + Mapp i Drive.
createPdf: Genererar PDF från mall.
getGeoData: Hämtar data från SGU/Lantmäteriet.
[ ] Human-in-the-Loop UI: Om AI vill köra ett destruktivt verktyg, rendera en "Bekräfta"-knapp i chatten som användaren måste klicka på.
5.3 RAG (Minne)
[ ] Vektordatabas: Sätt upp en enkel vektorlagring (t.ex. Firestore med embeddings) för "Företagets Hjärna".
[ ] Save/Recall: Implementera verktyg för att spara preferenser ("Vi använder Beckers") och hämta dem vid relevanta frågor.

🔴 FAS 6: Offertmotorn (The Money Maker)
Mål: En receptbaserad, konversationell motor för lönsamhet.
6.1 Datamodellering
[ ] Recept-databas: Skapa en recipes-kollektion i Firestore. Definiera struktur: materialåtgång, tidsåtgång, risker (KMA).
6.2 Kalkylflöde
[ ] Calculation Tool: Skapa ett Genkit-verktyg som tar in receptID och mängd (t.ex. 40 kvm vägg).
[ ] Logik:
Hämta recept från DAL.
Multiplicera material och tid.
Lägg på 10-15% riskbuffert.
Lägg till "KMA & Etablering" om receptet kräver det.
Returnera en JSON med kalkylen.
6.3 Dokumentgenerering
[ ] PDF Generator: Implementera logik för att ta kalkyl-JSON och populera en Google Docs-mall, konvertera till PDF och spara i Drive-mappen 01_Kunder & Anbud.

⚫ FAS 7: KMA & Utförande (The Shield)
Mål: Automatiserad regelefterlevnad.
7.1 Kvitto & Vision AI
[ ] Bildanalys: Skapa ett flöde där användaren laddar upp en bild. Använd Gemini Vision för att extrahera belopp, datum och artiklar (OCR).
[ ] Kemikaliekoll: Om artikeln är en kemikalie -> Hämta säkerhetsblad -> Skapa skyddsinstruktion i KMA-mappen.
7.2 Automatisk Riskanalys
[ ] AMP-trigger: Lägg till logik i createProject: Om beskrivningen innehåller "tak", "ställning" eller "asbest" -> Generera automatiskt ett utkast till Arbetsmiljöplan (AMP).

⚪ FAS 8: Produktion & Drift (The Seal)
Mål: En applikation redo för revision och skalning.
8.1 Testning
[ ] Playwright: Skriv E2E-tester för de kritiska flödena: Login, Onboarding, Skapa Projekt.
8.2 Övervakning
[ ] Sentry: Integrera Sentry i både Next.js och Genkit för felrapportering och distributed tracing (följ anropet hela vägen).
8.3 Deployment
[ ] CI/CD: Sätt upp GitHub Actions som kör tester innan deploy till Vercel (Frontend) och Firebase Functions (Backend).



Uppdatering för Fas 8.4 (Övervakning):
[ ] Installera Sentry: Konfigurera @sentry/nextjs. Detta ger oss "Dalux-funktionen" direkt.
[ ] Skapa Global Error Boundary (src/app/global-error.tsx): Designa en snygg "Oups"-sida som liknar Dalux, med en knapp "Försök igen".
[ ] Konfigurera "Strict Linting": Uppdatera .eslintrc.json med regeln no-restricted-imports för att stoppa src/lib/dal från att nå klienten (detta är din viktigaste brandvägg mot krascher).
[ ] Aktivera Google Cloud Error Reporting: Se till att backend-loggar (Genkit) är formatterade som JSON så Google kan läsa dem och varna dig.



