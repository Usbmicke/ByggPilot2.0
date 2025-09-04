# ByggPilot Projektplan & Kontext

Detta dokument fungerar som den centrala kunskapsbasen och planen för utvecklingen av ByggPilot-applikationen.

## Kärnprinciper & Viktiga Noteringar

1.  **Två Huvudlägen:** Applikationen har två distinkta användarupplevelser:
    *   **Demoläge:** Aktiveras via "Testa Gratis"-knappen. Detta läge är avsett för att visa upp appens fulla potential och använder sig av fördefinierad mock-data (`mockData`). All funktionalitet ska vara synlig och fungerande med denna data.
    *   **Verkligt Läge:** Aktiveras vid normal inloggning med Google. Detta är den rena, tomma upplevelsen för en ny användare. Dashboarden ska vara tom och redo för användarens egna projekt och data. Ingen demodata får synas här.

2.  **UI/UX-status:**
    *   **Landningssida & Dashboard:** Den grundläggande designen och layouten för dessa sidor anses vara "färdig". Inga större omstruktureringar, endast finputsning och funktionalitet ska läggas till.
    *   **Prioriterade Komponenter:** De två "chatt"-knapparna på landningssidan är designmässigt klara och ska **inte** ändras.

## Utvecklings-Roadmap

### Steg 1: Städa & Stabilisera (Högsta Prioritet)

Innan ny funktionalitet byggs ska projektet genomgå en grundlig städning och optimering.
- [ ] **Strukturanalys:** Identifiera och ta bort onödiga eller felplacerade filer.
- [ ] **Kodgranskning:** Leta efter felaktig kod, potentiella buggar och möjligheter för refaktorering.
- [ ] **Optimering:** Säkerställ att projektet är stabilt och har en ren grund att bygga vidare på.

### Steg 2: Landningssida - Finputsning

- [ ] **Bakgrundsanimation:** Åtgärda bakgrunden. Den ska ha en snygg gradient (blå-till-grå) och en diskret animation med små, vita partiklar som svävar uppåt. Inget rutnät. *(Påbörjad)*

### Steg 3: Dashboard - Demoläge

Målet är att hela dashboarden ska vara fullt funktionell i demoläget.

- [ ] **Knapp-funktionalitet:** Gå igenom alla knappar och interaktiva element i dashboardens huvudvy.
- [ ] **Vy-funktionalitet:** Säkerställ att sidorna i huvudmenyn (`Översikt`, `Projekt`, `Dokument`, `Kunder`, etc.) korrekt visar data från `mockData`. Det ska finnas en tydlig logik i hur datan presenteras i de olika vyerna, inte bara på översiktskorten.

### Steg 4: Verkligt Läge & Firebase-integration

Detta är det långsiktiga målet efter att demoläget är komplett.

- [ ] **Firebase-autentisering:** Koppla inloggningsknapparna ("Logga in med Google") till Firebase Authentication.
- [ ] **Tom Start:** Säkerställ att en ny, inloggad användare möts av en helt tom dashboard, redo att fyllas med deras egna data.
- [ ] **Databas-integration:** Koppla applikationen till Firestore/Firebase för att spara och hämta användarens projektdata.
