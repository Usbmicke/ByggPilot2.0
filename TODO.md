# ByggPilot - Teknisk Skuld & TODOs

**Status: All teknisk skuld från den initiala utvecklingsfasen är nu åtgärdad.**

Systemet har uppgraderats från en serie av simuleringar och platshållare till en fungerande, integrerad applikation. Alla kärnfunktioner, från säker autentisering till automatisk e-postanalys och åtgärdshantering, är nu implementerade med robust och skalbar kod.

## Översikt över slutförda uppgifter

### Fas 1: Autentisering & Säkerhet (OAuth 2.0)
- [x] **Hemligheter för Google OAuth:** `GOOGLE_CLIENT_ID` och `GOOGLE_CLIENT_SECRET` har flyttats till miljövariabler.
- [x] **Säker Token-lagring:** `access_token` och `refresh_token` krypteras nu och lagras säkert i Firestore.
- [x] **Riktigt Token-utbyte:** Simulerad token-logik har ersatts med riktiga `googleapis`-anrop för att byta auktorisationskoder mot tokens.
- [x] **Frånkopplingslogik:** API-rutt och logik för att radera användarens tokens och frånkoppla kontot är implementerad.
- [x] **API-Nyckel för Gemini:** Validering har lagts till för att säkerställa att `GEMINI_API_KEY` är konfigurerad, vilket förhindrar körningsfel.

### Fas 2: Datainsamling (E-post-skanner)
- [x] **Cron Job-Schemaläggning:** En `vercel.json`-fil har skapats för att definiera det automatiska Cron-jobbet, redo för Vercel-driftsättning.
- [x] **Riktig E-posthämtning:** Simulerad e-posthämtning har ersatts med riktiga anrop till Gmail API med användarens autentiserade `access_token`.
- [x] **Hantering av Flera Användare:** Cron-flödet itererar nu över *alla* användare som har en aktiv Google-integration och bearbetar deras inkorgar individuellt.
- [x] **Effektiv Användaridentifiering:** En `hasGoogleIntegration`-flagga har lagts till på användardokumenten för effektiva databasfrågor.

### Fas 3: Åtgärdshantering
- [x] **Databaslagring för Åtgärder:** AI-genererade åtgärdsförslag sparas nu i en `actions`-samling i Firestore, kopplade till rätt användare.
- [x] **Databas-API för Åtgärder:** API:et för att hämta och uppdatera åtgärder har implementerats för att använda riktiga databasfrågor.
- [x] **Interaktion med Åtgärder:** Frontend kan nu hämta riktiga åtgärder och markera dem som 'ignorerade', vilket uppdaterar deras status i databasen.
- [x] **Simulerade Projekt:** Den sista simulerade funktionen för projekt har ersatts med ett riktigt (men enkelt) API-anrop, vilket rensar all kvarvarande simuleringslogik.

---
*Detta dokument är nu arkiverat. All vidare utveckling bör hanteras i ett nytt ärendehanteringssystem.*
