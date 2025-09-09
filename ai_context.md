
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
**Resultat:** Ett heltäckande och interaktivt demoläge har implementerats.

### Fas 1-3: (Föråldrade) - ERSATTA AV NY ARKITEKTUR
**Notering:** De ursprungliga planerna har skrotats till förmån för en mer flexibel arkitektur centrerad kring `next-auth` och direkta Google API-integrationer.

### Fas 4: Google-autentisering & Proaktiv Onboarding - SLUTFÖRD
**Mål:** Att byta ut det gamla autentiseringssystemet mot en robust lösning med `next-auth` och förbereda applikationen för att kunna interagera med användarens Google-tjänster.

### Fas 5: Google Drive-integration & Projektstruktur - SLUTFÖRD
**Mål:** Att skapa en solid grund för projekt- och dokumenthantering genom att integrera med Google Drive.

### Fas 6: Den Intelligenta Offertmotorn (MVP) - SLUTFÖRD
**Mål:** Att skapa ett komplett, konversationsbaserat flöde för att generera en offert med hjälp av en AI-assistent. Detta är den första, sanna "intelligenta" funktionen i ByggPilot och binder samman kunder, projekt och dokument.

---

## Projektstatus: Implementation Slutförd - Granskning & Kvalitetssäkring

**Status:** All implementation enligt Byggplanen (Fas 0-6) är nu slutförd.

**Nästa Steg:** Hela applikationen behöver nu en grundlig granskning och kvalitetssäkring för att identifiera eventuella buggar, utvärdera användarflödets effektivitet och säkerställa att all funktionalitet är robust och motsvarar de uppsatta målen. 

**Fokusområden för granskning:**
- **Konversationslogik:** Säkerställa att chattflödena är logiska, hjälpsamma och utan återvändsgränder.
- **API-integrationer:** Verifiera att all kommunikation med externa API:er (Google Drive, Databasen) är stabil och har korrekt felhantering.
- **Användarupplevelse (UX):** Utvärdera hur intuitiv och effektiv applikationen är att använda ur ett slutanvändarperspektiv.
- **Kodkvalitet och Stabilitet:** Genomgång av kodbasen för att säkerställa att den är underhållbar och presterar väl.
