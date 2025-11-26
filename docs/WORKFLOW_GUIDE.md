# ByggPilot Workflow & AI Capabilities Guide (v1)

Detta dokument förklarar de automatiserade arbetsflöden och avancerade funktioner som din AI-assistent, ByggPilot, har implementerat. Syftet är att göra er utveckling snabbare, säkrare och mer konsekvent.

## 1. Implementerade Funktioner (Aktiva Nu)

### a. Automatisk Kodformatering

- **Vad är det?** Varje gång du sparar en `.ts`, `.tsx`, eller `.js`-fil i VS Code, formateras koden automatiskt enligt en standardiserad stil.
- **Hur fungerar det?** Genom konfigurationen i `.vscode/settings.json`.
- **Fördel:** Slut på diskussioner om semikolon och mellanslag. All kod ser likadan ut, vilket gör den lättare att läsa och underhålla.
- **Krav:** `Prettier - Code formatter`-tillägget måste vara installerat i VS Code.

### b. Kontinuerlig Integration (CI) - "Kodvakten"

- **Vad är det?** En automatisk process som körs på GitHub varje gång du pushar kod till `main` eller `dev`-grenarna.
- **Hur fungerar det?** Genom arbetsflödet definierat i `.github/workflows/main.yml`.
- **Process:**
  1. Startar en ren server i molnet.
  2. Laddar ner er kod.
  3. Kör `npm ci` för att installera exakta versioner av alla paket.
  4. Kör `npm run build` för att säkerställa att projektet kan byggas utan fel.
  5. Kör `npm run lint` för att upptäcka potentiella problem eller stilbrott.
- **Fördel:** Förhindrar att trasig eller felaktig kod når era huvudgrenar. Ger omedelbar feedback om en ändring orsakar ett problem.

---

## 2. Meny för Framtida Förbättringar (På Din Begäran)

Du kan när som helst be mig, ByggPilot, att implementera följande. Säg bara till!

| Funktion                      | Beskrivning                                                                                                   | När ska vi använda det?                                                                  | Exempelkommando till ByggPilot                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Strikta Typer i Databasen** | Använda Zod för att definiera scheman för era `entities`. Garanterar att all data i Firestore är 100% korrekt. | När ni börjar definiera fler datamodeller (Project, Invoice etc.).                        | "Skapa ett Zod-schema för `Project`-entiteten i `src/entities/project.ts`."                   |
| **UI Komponentbibliotek**     | Sätta upp Storybook för att bygga och testa UI-komponenter (`Button`, `Card` etc.) i en isolerad miljö.      | När ert designsystem i `src/shared/ui` börjar växa och ni vill ha snabbare UI-utveckling. | "Installera Storybook och skapa en första 'story' för `Button`-komponenten."                      |
| **Automatiserade E2E-tester** | Expandera CI-pipelinen till att även köra Playwright-tester (`tests/`) för att simulera användarflöden.    | När ni har kritiska flöden (som inloggning, onboarding) som absolut inte får gå sönder.   | "Lägg till ett steg i `main.yml` som kör Playwright-testerna."                                    |
| **Infrastruktur som Kod (IaC)** | Skriva skript i `infra/` för att hantera Firebase-konfiguration (säkerhetsregler, index) som kod.      | När ni vill ha en repeterbar och versionshanterad miljö, istället för att klicka i UI:t. | "Skriv Firestore-säkerhetsregler i `infra/firestore.rules` som bara låter inloggade användare skriva." |
| **Avancerade AI-flöden**      | Bygga komplexa, kedjade Genkit-flöden för att lösa avancerade problem (t.ex. offertgenerering).           | När era grundläggande AI-funktioner är stabila och ni vill automatisera mer komplexa uppgifter. | "Skapa ett nytt Genkit-flöde, `generateQuoteFlow`, som använder `projectData` som input."       |

