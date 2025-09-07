
# ByggPilot - Master Plan (Reviderad 2.0)

## Övergripande Mål
Att systematiskt och kontrollerat utveckla ByggPilot från en fungerande dashboard till en värdefull MVP (Minimum Viable Product) med djup integration mot Google Workspace för att skapa automatiserade och tidsbesparande arbetsflöden.

## Ledande Principer
- **Fasvis Implementation:** En funktion i taget, noggrant testad och stabil.
- **Orchestrator-arkitektur:** Alla anrop till externa tjänster (AI, Google API:er) går via en central `/api/orchestrator`-slutpunkt för att säkerställa kontroll, säkerhet och enhetlighet.
- **Expert-Chatbot:** Chatten är det primära gränssnittet för att interagera med ByggPilots smarta funktioner. Den ska vara proaktiv, kontextmedveten och agera som en digital kollega.
- **Säkerhet och Behörigheter:** Användarens data och integritet är högsta prioritet. Vi använder `next-auth` för säker autentisering och begär endast de behörigheter som är absolut nödvändiga för en specifik funktion.

---

## Byggplan: Från Dashboard till Automatiserad Projektpartner

### Fas 0: Interaktivt och Realistiskt Demoläge - SLUTFÖRD
**Resultat:** Ett heltäckande och interaktivt demoläge har implementerats. Det låter potentiella kunder uppleva ByggPilots kärnfunktioner utan koppling till backend, vilket skapar en övertygande säljpitch.

### Fas 1-3: (Föråldrade) - ERSATTA AV NY ARKITEKTUR
**Notering:** De ursprungliga planerna för Fas 1-3 baserades på en äldre arkitektur med Firebase som primär databas. Dessa har skrotats till förmån för en mer flexibel och kraftfull arkitektur centrerad kring `next-auth` och direkta Google API-integrationer.

### Fas 4: Google-autentisering & Proaktiv Onboarding - SLUTFÖRD
**Mål:** Att byta ut det gamla, simpla autentiseringssystemet mot en robust lösning med `next-auth` och förbereda applikationen för att kunna interagera med användarens Google-tjänster.

- **✅ Steg 4.1: Installera och Konfigurera `next-auth`**
  - **Resultat:** Biblioteket `next-auth` har installerats. En ny API-rutt, `app/api/auth/[...nextauth]/route.ts`, har skapats och konfigurerats för att använda Google som Oauth-leverantör. Miljövariabler (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) har lagts till.

- **✅ Steg 4.2: Uppdatera App-layouten för `SessionProvider`**
  - **Resultat:** Applikationens rotlayout (`app/layout.tsx`) har rensats från gamla auth-providers och använder nu den officiella `SessionProvider` från `next-auth/react`, vilket gör session-data tillgänglig i hela appen.

- **✅ Steg 4.3: Bygga om Inloggningskomponenter**
  - **Resultat:** Komponentfilen `app/components/layout/Header.tsx` har byggts om från grunden. Den använder nu `useSession`, `signIn` och `signOut` från `next-auth/react` för att dynamiskt visa användarens status och erbjuda in- och utloggning. Gamla, manuella API-anrop har tagits bort.

- **✅ Steg 4.4: Implementera det Proaktiva Onboarding-flödet**
  - **Resultat:** Dashboard-sidan (`app/dashboard/page.tsx` och `app/components/views/DashboardView.tsx`) är nu "inloggningsmedveten". Den visar en uppmaning och en knapp för inloggade användare att starta en proaktiv konfiguration. Chatten (`app/components/chat/Chat.tsx`) har uppdaterats för att ta emot en `startOnboardingFlow`-prop, vilket triggar ett specifikt startmeddelande (`@onboarding_start`) till `/api/orchestrator`. Orchestratorn har uppdaterats för att känna igen denna trigger och svara med ett unikt, guidande flöde.

### Fas 5: Google Drive-integration & Automatiserad Mappstruktur
**Mål:** Att bygga den första verkliga, tidsbesparande funktionen. När användaren godkänner onboarding-flödet ska ByggPilot automatiskt skapa en standardiserad projektmappstruktur i användarens Google Drive.

- **Steg 5.1: Skapa API-slutpunkt för Google Drive-åtgärder**
  - **Instruktion:** Skapa en ny, dedikerad API-rutt (t.ex. `/pages/api/google/drive/create-folders.ts`). Denna slutpunkt ska vara ansvarig för all logik som rör att skapa mappar och filer i Google Drive.

- **Steg 5.2: Implementera Logik för att Skapa Mappar**
  - **Instruktion:** Inom den nya slutpunkten: hämta användarens `accessToken` från sessionen. Använd detta token för att anropa Google Drive API (v3). Implementera logik som först skapar en huvudmapp ("ByggPilot Projekt") och därefter en standardiserad hierarki inuti den (t.ex. "01_Kunder & Anbud", "02_Pågående Projekt").

- **Steg 5.3: Uppdatera Orchestratorn för att Anropa Drive-API:et**
  - **Instruktion:** Modifiera `/pages/api/orchestrator.ts`. När konversationen når punkten där användaren har bekräftat att mapparna ska skapas (t.ex. svarar "Ja" på frågan), ska orchestratorn inte bara svara med text, utan även göra ett internt anrop till den nya API-slutpunkten från Steg 5.1 för att faktiskt utföra åtgärden.

---

## Omedelbart Nästa Steg
- **[ ] Starta implementationen av Fas 5.** Fokusera på **Steg 5.1:** Att skapa den nya, säkra API-slutpunkten som kommer att innehålla logiken för att interagera med Google Drive API. Detta lägger grunden för den första riktiga automatiseringsfunktionen i ByggPilot.
