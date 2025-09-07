
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

### Fas 5: Google Drive-integration & Automatiserad Mappstruktur - SLUTFÖRD
**Mål:** Att bygga den första verkliga, tidsbesparande funktionen. När användaren godkänner onboarding-flödet, skapar ByggPilot automatiskt en standardiserad projektmappstruktur i användarens Google Drive.
- ✅ **Steg 5.1:** Skapa API-slutpunkt för Google Drive-åtgärder.
- ✅ **Steg 5.2:** Implementera Logik för att Skapa Mappar.
- ✅ **Steg 5.3:** Uppdatera Orchestratorn för att Anropa Drive-API:et.

### Fas 6: Den Intelligenta Offertmotorn (MVP)
**Mål:** Att omvandla det simulerade "Skapa Offert"-flödet till en verklig, automatiserad process som, genom en guidad konversation, samlar in information och genererar en professionell PDF-offert från en mall i användarens Google Drive.

- **Steg 6.1: Aktivera "Skapa Offert"-flödet i UI**
  - **Instruktion:** Identifiera och aktivera den knapp eller det gränssnittselement som ska starta offertskapandet för en inloggad användare. Detta ska, precis som onboarding, trigga en specifik konversation i chatten (t.ex., med en `startQuoteFlow`-prop).

- **Steg 6.2: Uppdatera Orchestratorn för Offertinsamling**
  - **Instruktion:** Skapa en ny specialiserad prompt för offerter. Den ska instruera AI-modellen att agera som en erfaren kalkylator och ställa en fråga i taget för att samla in nödvändig information: kundnamn, projektbeskrivning, mått, materialval, etc. Denna konversation ska avslutas med att AI:n anropar en ny `ACTION`-tagg, t.ex. `[ACTION:CREATE_QUOTE_DOCUMENT]`.

- **Steg 6.3: Skapa API-slutpunkt för Google Docs**
  - **Instruktion:** Skapa en ny, dedikerad API-rutt (t.ex. `/pages/api/google/docs/create-quote.ts`). Denna slutpunkt ska ta emot den insamlade datan från orchestratorn. 

- **Steg 6.4: Implementera Logik för Dokumentgenerering**
  - **Instruktion:** Inom Docs-API-slutpunkten: implementera logik som hittar en fördefinierad offertmall i användarens Drive (från `04_Företagsmallar`), skapar en kopia av den, fyller den med den insamlade datan, och sparar den som en PDF i rätt projektmapp (`01_Kunder & Anbud`).

---

## Omedelbart Nästa Steg
- **[ ] Starta implementationen av Fas 6.** Fokusera på **Steg 6.1:** Att lokalisera och aktivera "Skapa Offert"-knappen i användargränssnittet för inloggade användare så att den korrekt initierar det nya, intelligenta flödet i chatten.
