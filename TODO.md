# ByggPilot - Teknisk Skuld & TODOs

Denna fil är en centraliserad lista över alla platshållare, simuleringar och temporära lösningar som har implementerats för att snabbt kunna bygga och demonstrera flöden. Varje punkt här måste åtgärdas och ersättas med en robust, produktionsklar implementation innan lansering.

## Fas 3: Den Proaktiva Assistenten

### 1. Autentisering & Säkerhet (OAuth 2.0)

- [x] **Hemligheter för Google OAuth:** I `app/api/auth/integrations/google/connect/route.ts` och `.../callback/route.ts` är `GOOGLE_CLIENT_ID` och `GOOGLE_CLIENT_SECRET` hårdkodade som platshållare. Dessa måste flyttas till säkra miljövariabler (`.env.local`) och konfigureras i Google Cloud Console.
- [x] **Säker Token-lagring:** `app/api/auth/integrations/google/callback/route.ts` simulerar kryptering och lagring av `access_token` och `refresh_token`. En robust krypteringsmekanism (t.ex. med `crypto`) måste implementeras och tokens måste sparas i Firestore-databasen, säkert kopplade till användaren.
- [x] **Frånkopplingslogik:** `app/components/GoogleConnectButton.tsx` har en `handleDisconnect`-funktion som är en platshållare. Den måste anropa en API-rutt som raderar användarens tokens från databasen.
- [ ] **API-Nyckel för Gemini:** `app/api/cron/scan-emails/route.ts` och `app/api/ai/extract-actions/route.ts` använder `process.env.GEMINI_API_KEY`. Detta måste konfigureras korrekt i produktionsmiljön.

### 2. Datainsamling (E-post-skanner)

- [ ] **Cron Job-Schemaläggning:** API-rutten `app/api/cron/scan-emails/route.ts` är just nu en manuell API-rutt. Denna måste konfigureras att köras automatiskt med jämna mellanrum med en riktig Cron-jobb-tjänst (t.ex. Vercel Cron, GitHub Actions, eller en extern tjänst).
- [ ] **Riktig E-posthämtning:** `scan-emails`-rutten simulerar hämtning av e-post. Logiken måste ersättas med riktiga anrop till Gmail API med den autentiserade användarens `access_token`.
- [ ] **Hantering av Användare:** Hela Cron-flödet är just nu hårdkodat för en enda 'user_123'. Detta måste byggas om för att iterera över *alla* användare som har en aktiv integration, hämta deras specifika tokens och bearbeta deras inkorgar individuellt.

### 3. Åtgärdshantering

- [ ] **Databaslagring för Åtgärder:** `app/api/ai/extract-actions/route.ts` simulerar bara loggning av det extraherade JSON-objektet. Detta objekt ("förslaget") måste sparas i en ny `actions`-samling i Firestore.
- [ ] **Databas-API för Åtgärder:** `app/api/actions/route.ts` kommer att returnera en hårdkodad lista med förslag. Den måste ersättas med en riktig databasfråga som hämtar alla öppna förslag för den inloggade användaren från Firestore.
- [ ] **Hantering av Åtgärder:** Logik för att uppdatera status på en åtgärd (t.ex. från 'ny' till 'arkiverad' när användaren klickar på 'Ignorera') måste implementeras.
