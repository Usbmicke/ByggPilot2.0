Projekt-Brief & Kontext för AI-assistent: ByggPilot v2.0
Detta dokument innehåller den grundläggande informationen som krävs för att förstå och arbeta med ByggPilot-projektet. Läs igenom detta noggrant innan du påbörjar något arbete.

1. Övergripande Mål & Vision
ByggPilot är ett avancerat Large Action Model (LAM), en "digital kollega" för små och medelstora företag (SME) i den svenska byggbranschen. Målet är att lösa deras största smärtpunkt: den enorma administrativa bördan.

Kärnkonceptet är att ByggPilot fungerar som ett intelligent lager ovanpå användarens befintliga Google Workspace (Gmail, Drive, Kalender etc.). Istället för att tvinga användaren att lära sig ett nytt komplext system, gör ByggPilot de verktyg de redan använder smartare. Visionen är att automatisera hela arbetsflödet från förfrågan (via Gmail) till färdigt fakturaunderlag (i Google Docs).

2. Teknisk Arkitektur (VIKTIGT & BEKRÄFTAD)
Den tekniska arkitekturen är modern, säker och serverlös.

Frontend: En Next.js 14-applikation (med App Router) skriven i TypeScript och stylad med Tailwind CSS. Den är hostad på Netlify.

Backend (Motor): All backend-logik (API Routes) körs som en del av Next.js-applikationen. Vi använder inte en separat VM-instans eller Cloud Functions i detta skede.

Autentisering & Databas: Vi använder Firebase.

Firebase Authentication för all användarinloggning (specifikt "Logga in med Google").

Cloud Firestore för att lagra applikationsdata (användarprofiler, projektdata, etc.).

AI-Motor: Google Gemini API. Alla anrop till AI:n ska gå via en säker backend-funktion (API Route) för att skydda API-nyckeln.

Hantering av Hemligheter:

Frontend (Firebase-nycklar): Laddas från en .env.local-fil i projektets rot. Nycklarna måste vara prefixade med NEXT_PUBLIC_. I produktion hanteras dessa som miljövariabler i Netlify.

Backend (Google/Gemini API-nycklar): Lagras uteslutande i Google Cloud Secret Manager. Backend-funktioner ska hämta dessa vid behov.

3. AI-Personlighet & Konversationsdesign
ByggPilots personlighet är definierad i en detaljerad Master-Prompt. De viktigaste punkterna är:

Persona: En erfaren, lugn och kompetent "digital kollega". Tonen är självsäker och empatisk.

Expertis: Djup domänkunskap om den svenska byggbranschen, inklusive regelverk (PBL, BBR, AFS), standardavtal (AB 04, ABT 06) och KMA-planer.

Agerande (LAM): Den är byggd för att ta kommandon och agera. Efter en lyckad Google-inloggning ska den proaktivt erbjuda sig att skapa en standardiserad mappstruktur i användarens Google Drive.

Konversation: AI:n ska följa principen om progressiv information. Svaren ska vara korta, koncisa och alltid avslutas med en relevant motfråga för att guida användaren.

4. Nuvarande Projektstatus & Nästa Steg
Den tekniska ryggraden är på plats och fungerar. Användare kan logga in säkert med Firebase, och en grundläggande dashboard-struktur finns.

Nuvarande fokus: Att implementera och testa den första riktiga "LAM"-funktionen: att på kommando från chatten kunna läsa ett mail från användarens Gmail och skapa en händelse i deras Google Kalender. Detta är ett "Proof of Concept" för hela visionen. OBS! DETTA FUNKAR! Vi har byggt in två knappar. en som läser mail och skapar kalender händelse, och en knapp som skapar mappstruktur. Dessa ska byggas in i chatten sen när vi kommer dit. Det ska ingå i chattens onboarding funktion när man loggar in för första gången.