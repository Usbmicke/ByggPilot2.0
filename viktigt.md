ByggPilot Guldstandard: Arkitektonisk Blueprint & Implementeringsflöden v3.0
Detta dokument ersätter alla tidigare "Viktigt.md"-filer och "Implementerings-Blueprints". Det utgör den enda, slutgiltiga källan till sanning för ByggPilots tekniska arkitektur och flöden per den 16 november 2025.

Mål: Eliminera all "manuell skit" och definiera de 100% automatiserade, säkra och topmoderna flöden som ByggPilot fungerar efter.

Del 1: Kärnprinciper (De Icke-Förhandlingsbara Grunderna)
Den Hermetiska Uppdelningen (Frontend vs. Backend):

Frontend (/src): Hanterar ENDAST UI och klient-logik. Använder ENDAST Firebase Client SDK (@firebase/auth, @firebase/firestore) från lib/config/firebase-client.ts. Får ALDRIG innehålla firebase-admin eller hemligheter.

Backend (API Routes, Genkit Flows): Är den ENDA platsen där firebase-admin och secret-manager.ts används. Hanterar all säkerhetskritisk logik.

Strikt Runtime-Separering (Lösningen på Krascherna):

src/middleware.ts körs i Edge Runtime. Den är en "dum" dörrvakt. Den får INTE importera firebase-admin eller tunga paket.

src/app/api/auth/** (t.ex. session, verify) körs i Node.js Runtime (export const runtime = 'nodejs'). De får importera firebase-admin och göra tungt arbete.

Alla Genkit-flöden körs i Node.js Runtime.

Förbud mot Gammal Skit:

NextAuth.js (next-auth) ÄR FÖRBJUDET. Det är källan till våra konflikter. Vi använder endast Firebases inbyggda autentiseringsflöde.

Del 2: Det 100% Automatiska Huvudflödet (Så ByggPilot Funkar)
Detta är det "gyllene" flödet som sker automatiskt för att logga in en användare och hantera deras session säkert.

Fas 1: Automatisk Inloggning (Klient)
Initial Laddning & Avkänning:

Användaren startar appen. src/app/layout.tsx laddar ClientProviders.tsx.

ClientProviders (som innehåller vår "tålmodiga" AuthProvider) visar en global laddningsskärm (Laddar ByggPilot...).

Firebase Client SDK:s onAuthStateChanged-lyssnare körs automatiskt och känner av om användaren har en giltig Google-session i webbläsaren.

Token-Bevis Hämtas:

onAuthStateChanged returnerar ett user-objekt. Vår AuthProvider anropar user.getIdToken() för att få ett färskt, digitalt signerat ID Token.

Säker Session-Etablering (API-anrop):

AuthProvider skickar detta ID Token – en enda gång – till vår backend-endpoint: POST /api/auth/session.

Fas 2: Sessionsskapande (Backend / Node.js)
Cookie-Skapande & Användar-Synk:

Vår API-route (/api/auth/session/route.ts) tar emot ID-tokenet.

Den anropar initializeAdminApp() (som nu fungerar tack vare vår secret-manager-fix).

Med Firebase Admin SDK verifieras ID-tokenet.

Den kör "upsert"-logiken: letar efter användaren i Firestore. Om användaren inte finns, skapas den med isOnboarded: false.

Servern skapar en krypterad Session Cookie (admin.auth().createSessionCookie(...)) och sätter den i webbläsarens svar med HttpOnly, Secure och SameSite=Lax.

Fas 3: Automatisk Omdirigering (Middleware & Verifiering)
Synkronisering (Klient):

När AuthProvider på klienten får "OK" (status 200) från api/auth/session, anropar den router.refresh().

Middleware-Verifiering (Edge):

router.refresh() tvingar Next.js middleware.ts att köras om.

middleware.ts (som nu är "dum") anropar fetch('/api/auth/verify') och skickar med den nya session-cookien.

Verifiering (Backend / Node.js):

api/auth/verify/route.ts tar emot cookien.

Den använder admin.auth().verifySessionCookie(...) för att validera den.

Den hämtar användarens profil från Firestore (via DAL) och returnerar { isAuthenticated: true, isOnboarded: false }.

Slutgiltig Omdirigering (Edge):

middleware.ts tar emot det giltiga JSON-svaret.

Den ser isAuthenticated: true och isOnboarded: false.

Den omdirigerar användaren från / till /onboarding. FLÖDET ÄR KOMPLETT.

Del 3: Backend- & AI-Arkitektur (Genkit i Centrum)
All affärslogik (skapa projekt, KMA, etc.) ska byggas med Genkit.

Genkit som Hjärnan: Genkit är vår backend. Vi bygger inte separata API-rutter och Genkit-flöden; Genkit-flödena exponeras som API-rutter (antingen via Firebase Functions eller Next.js API-rutter med runtime = 'nodejs').

AI-Modellstrategi (Topmodern): Vi använder en differentierad AI-strategi för att optimera kostnad och prestanda:

Gemini 2.5 Flash: Används för alla snabba, billiga uppgifter: Snabba chatt-svar, transkribering av röstmemon, extrahering av data från kvitton.

Gemini 2.5 Pro: Används för tunga, komplexa uppgifter: Djupanalys av PDF-underlag, generering av KMA-rapporter, framtagning av "Företagets Bästa Praxis".

Säkerhet i Genkit: Alla Genkit-flöden måste skyddas. De måste anropa initializeAdminApp() och verifiera session-cookien (som skickas med av fetch-anropet) innan någon kod exekveras.

Del 4: Implementerings-Blueprint (Prompts för AI-Agenten)
Detta är de handlingsinriktade "Flöden" som din AI-agent ska följa för att bygga eller refaktorera appen enligt denna nya arkitektur.

Flöde 1: Grundläggande Refaktorering & Kods sanering
Mål: Etablera en kliniskt ren och förutsägbar kodbas.

Arkitektens Prompt: Kodhygien & Strukturell Sanering

ROLL: Senior mjukvaruingenjör specialiserad på kodkvalitet.

UPPDRAG: Genomför en total sanering av ByggPilot-kodbasen.

PLAN:

Korrigera Importvägar: Kör grep -r "'@/app/" app/. Gå igenom listan metodiskt, en fil i taget, och korrigera alla @/app/...-importer till korrekta alias (t.ex. @/components/...).

Sanera console.log: Sök igenom kodbasen efter alla console.log, console.warn, och console.error. Ersätt dem systematiskt med logger.info(...) eller logger.error(...) från @/lib/logger. Undantag: Behåll de "spårnings-loggar" vi precis lagt till i middleware.ts och api/auth/** tills vidare.

Centralisera Zod-scheman: Skapa lib/schemas. Flytta alla Zod-scheman dit. Skapa en index.ts i lib/schemas som exporterar allt. Refaktorera all kod att importera därifrån.

VERIFIERING: Applikationen måste kompilera (npm run dev) felfritt efter varje filändring.

Flöde 2: Härdning av Autentisering & Onboarding (NYTT & KRITISKT)
Mål: Implementera det 100% automatiska huvudflödet och radera all gammal NextAuth-kod.

Arkitektens Prompt: Implementering av Vattentät Firebase Auth

ROLL: Säkerhetsarkitekt.

UPPDRAG: Riva ut all NextAuth.js-kod och implementera det "100% Automatiska Huvudflödet" som beskrivs i Del 2 av detta dokument.

PLAN:

Avinstallation: Kör npm uninstall next-auth @auth/firebase-adapter. Radera filen app/api/auth/[...nextauth]/route.ts.

Implementera Backend: Säkerställ att src/app/api/auth/session/route.ts och src/app/api/auth/verify/route.ts existerar och matchar koden i "Guldstandard"-planen (med runtime = 'nodejs').

Implementera Frontend: Säkerställ att src/app/providers/ClientProviders.tsx existerar och innehåller den "tålmodiga" AuthProvider-logiken.

Implementera Väktaren: Säkerställ att src/middleware.ts existerar och endast innehåller fetch-anropet till /api/auth/verify samt omdirigeringslogiken.

VERIFIERING: En ny användare kan logga in, skickas automatiskt till /onboarding, och fastnar inte i en loop.

Flöde 3: Rekonstruktion av AI Co-Pilot (Chatt)
Mål: Bygga en säker, strömmande och intelligent AI-chatt.

Arkitektens Prompt: Bygga en Säker och Strömmande AI Co-Pilot

ROLL: Expert på AI-agenter.

UPPDRAG: Bygga ByggPilots chattfunktion enligt LAM-arkitekturen.

PLAN:

Bygg Backend (Genkit-flöde): Skapa ett nytt Genkit-flöde (t.ex. chat.ts). Flödet måste:

Skyddas genom att verifiera session-cookien.

Använda streamText från Vercel AI SDK.

Använda Gemini 2.5 Flash för snabba svar.

Definiera "verktyg" (tools) med Zod-scheman för all affärslogik (t.ex. createProject).

Implementera Frontend:

Använd useSWR för att hämta och hantera chatthistorik.

Använd useChat-hooken från @ai-sdk/react för att hantera sändning och mottagning av strömmad data.

Bygg dedikerade UI-komponenter för att rendera AI-svar (inramade checklistor, dokument-kort etc.).

Implementera LAM-brandväggen: Säkerställ att Genkit-flödet validerar alla tool_calls med Zod innan DAL anropas.

VERIFIERING: Svar strömmas ord för ord. AI:n kan anropa ett "verktyg" (som createProject) säkert.

Flöde 4: Montering av "Kungstandard"-Dashboarden
Mål: Bygga huvud-dashboarden med fokus på prestanda.

Arkitektens Prompt: Konstruktion av en Prestandaoptimerad Dashboard

ROLL: Next.js-prestandaexpert.

UPPDRAG: Bygga kärnsidorna (t.ex. /dashboard/projects) med Server Components.

PLAN:

Bygg Huvudsidan (/dashboard/projects/page.tsx): Definiera komponenten som en async function. Anropa ditt DAL (lib/dal/projects.ts) direkt inuti komponenten för att hämta data.

Sömlös UI-uppdatering: När ett projekt skapas i chatten (Flöde 3), se till att chat-flödet anropar mutate från SWR (eller router.refresh()) för att tvinga dashboarden att hämta ny data automatiskt.

Proaktiva "Zero States": Designa alla tomma listor för att guida användaren till nästa logiska handling (t.ex. en stor "Skapa ditt första projekt"-knapp).

VERIFIERING: Data laddas på servern. När data ändras via chatten, uppdateras dashboarden automatiskt utan en fullständig sidomladdning.

Flöde 5: Mall för Nya Funktioner (Ex: Kemikaliehantering)
Mål: Skapa en mall för all framtida funktionsutveckling.

Arkitektens Prompt: Implementering av Automatiserad Kemikaliehantering

ROLL: Fullstack-utvecklare.

UPPDRAG: Implementera funktionen för Kemikaliehantering enligt vår arkitektur.

PLAN:

Skapa DAL-funktion(ALLT DETTA FINNS REDAN, DU SKA ALLTID SÖKA INNAN DU SKAPAR NÅTT NYTT!!!): Skapa lib/dal/safety.ts. Lägg till en funktion fetchSafetyDataForProduct(productName: string) som (simulerat) anropar ett externt API.

Skapa Genkit-verktyg: Definiera ett nytt verktyg identifyChemicals i ditt Genkit-flöde. Verktyget ska ha ett Zod-schema som tar emot receiptText: z.string().

Implementera Logik: Exekveringslogiken för verktyget ska:

Använda Gemini 2.5 Flash för att extrahera produktnamn från receiptText.

Anropa DAL-funktionen fetchSafetyDataForProduct för varje namn.

Sammanställa resultaten och returnera dem till AI-modellen.

Skapa UI-komponent: Bygg en ny React-komponent ChemicalSafetyCard.tsx som kan rendera säkerhetsinformationen med färgkodning.

VERIFIERING: När ett kvitto med "Fogskum" laddas upp, kan AI:n anropa verktyget och presentera en röd varningsruta i chatten.