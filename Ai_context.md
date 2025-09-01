
# Startpaket för ByggPilot-projektet

Detta dokument är din guide för att agera som AI-assistent i detta projekt. Läs det noggrant. Målet är att bygga en webbapplikation för "ByggPilot".

## 1. Ditt Uppdrag & Persona

Du är en proaktiv och effektiv AI-kodningspartner integrerad i en IDE. Ditt mål är att förutse och uppfylla användarens önskemål. Arbeta metodiskt, en milstolpe i taget, och be om lov innan du går vidare till nästa steg. Agera istället för att bara berätta.

## 2. Projektets Mål

Vi ska bygga en SaaS-applikation för byggföretag. Projektet är uppdelat i två huvuddelar:
1.  **Landningssida:** En säljande, offentlig sida för att locka nya användare. (VÅRT FOKUS NU)
2.  **Dashboard:** Huvudapplikationen där användare hanterar sina projekt. (KOMMER SENARE)

## 3. Viktiga Regler & Filer (FÅR EJ ÄNDRAS)

Vissa filer utgör grunden i appen. **Ändra eller ta inte bort dessa:**
-   `app/layout.tsx`: Root layout, innehåller grundläggande sidstruktur och providers.
-   `app/providers/AuthContext.tsx`: Hanterar all logik för användarautentisering via Google.
-   `app/(public)/layout.tsx` och `app/(protected)/layout.tsx`: Separata layouter för offentliga och skyddade sidor.

Existerande bilder, logotyper och videor som finns i `public/`-mappen ska användas.

## 4. Nuvarande Uppgift: Bygg Landningssidan

Vårt omedelbara mål är att bygga klart landningssidan. All kod för detta ska skrivas i filen:
-   `app/(public)/page.tsx`

### Funktionskrav för Landningssidan:
-   **Logga in med Google:** Alla knappar som leder till inloggning ska anropa `login()`-funktionen från `useAuth()`-hooken.
-   **Testa ByggPilot Gratis-knapp:** Denna knapp ska **inte** logga in direkt. Den ska navigera användaren till sidan `/test`. Förbättra gärna användarupplevelsen för denna sida för att ge mer inlevelse när vi kommer till det steget.
-   **Design och innehåll:** Sidan ska byggas enligt mallen nedan.

### Mall för Landningssida (`LANDINGPAGE_PRD.md`)

```markdown
# ByggPilot Landing Page - Product Requirements Document

## 1. Målgrupp

Små till medelstora byggföretag i Sverige (1-25 anställda). Ägaren eller projektledaren är ofta stressad, överarbetad och har dålig överblick på grund av administrativt kaos.

## 2. Syfte

-   Få besökaren att förstå värdet av ByggPilot och hur det löser deras problem.
-   Konvertera besökaren till att bli användare genom att logga in med sitt Google-konto.

## 3. Sections & Innehåll

### Milstolpe 1: Hero Section
-   **Huvudrubrik:** "Mindre papperskaos. Mer tid att bygga."
-   **Underrubrik:** ByggPilot är din nya digitala kollega som förvandlar administration till en automatiserad process, direkt i ditt befintliga Google-konto. Frigör tid, eliminera papperskaos och fokusera på det som verkligen driver din firma framåt.
-   **Call to Action (CTA):** En framträdande "Logga in med Google"-knapp.
-   **Notis:** "ByggPilot är byggt för Googles kraftfulla och kostnadsfria verktyg. Skaffa ett konto här." (länk till Google-registrering).
-   **Visuellt:** Snygg bakgrund, eventuellt med subtila animationer. Logotypen ska vara synlig.

### Milstolpe 2: Problem Section
-   **Rubrik:** "Det administrativa kaoset som stjäl din lönsamhet"
-   **Layout:** 4 kort/boxar, varje med en ikon, en smärta och en lösning.
    1.  **Kort 1 (Ikon: Klocka/Stress):**
        -   **Problem:** "Tidspressen dödar planeringen" - Kvällar/helger går åt till pappersarbete istället för att planera och riskbedöma.
        -   **Lösning:** ByggPilot automatiserar flödet, vilket frigör tid att planera och vinna lönsamma projekt.
    2.  **Kort 2 (Ikon: Kaos/Mapp):**
        -   **Problem:** "Spridd information, noll struktur" - Underlag, foton, tidlappar är utspridda.
        -   **Lösning:** ByggPilot skapar automatiskt en perfekt strukturerad projektmapp i Google Drive för varje förfrågan.
    3.  **Kort 3 (Ikon: Nedåtgående graf):**
        -   **Problem:** "Beslut baserade på magkänsla" - Efterkalkyler görs sällan, vilket leder till att man upprepar dyra misstag.
        -   **Lösning:** All data samlas korrekt, vilket gör efterkalkylen till en enkel knapptryckning.
    4.  **Kort 4 (Ikon: Plånbok med minus):**
        -   **Problem:** "Förlorade intäkter" - Missade ÄTA-arbeten och felregistrerade timmar.
        -   **Lösning:** Smart loggning ser till att du får betalt för varenda krona.

### Milstolpe 3: Solution/Workflow Section
-   **Rubrik:** "Se hur din digitala kollega tar hand om administrationen."
-   **Visuellt:** En animerad video/gif (`animeradvideobyggpilot.mp4`) som visar arbetsflödet:
    1.  Mejl kommer in.
    2.  Projektmapp skapas.
    3.  Offert skapas från mall.
    4.  Tid och material loggas.
    5.  Fakturaunderlag genereras.

### Milstolpe 4: Feature/Benefit Section
-   **Rubrik:** "Planeringen är A och O – men vem har tid?"
-   **Underrubrik:** I en bransch med pressade marginaler är noggrann planering din största konkurrensfördel. Men administrationen stjäl den tiden. ByggPilot är byggt för att bryta den onda cirkeln. Genom att automatisera det administrativa arbetet frigör vi din tid och expertis till det som faktiskt ökar lönsamheten.
-   **Layout:** 4 kort/boxar.
    1.  **Kort 1:** "Från möte till offert – på minuter" (Skapa/skicka offerter direkt från mobilen).
    2.  **Kort 2:** "Trygghet & Kvalitetssäkring" (Färdiga branschanpassade checklistor/riskanalyser).
    3.  **Kort 3:** "Sömlös Ekonomi" (Koppling till Fortnox/Visma för automatisk bokföring).
    4.  **Kort 4:** "Lär av varje projekt" (Datadrivna insikter från analyserade projekt).

### Milstolpe 5: Pro Tips Banner
-   En snygg, klickbar banner.
-   **Ikon:** Glödlampa.
-   **Rubrik:** "Vässa ditt företag – Tips för proffs"
-   **Text:** En samling guider om allt från avtal och regler till hur du bygger starkare kundrelationer.
-   **CTA:** "Öppna kunskapsbanken &rarr;"
-   **Funktionalitet:** Klicket ska öppna ett **modal-fönster (popup)**.

### Milstolpe 6: Trust Section
-   **Layout:** Centrerat block.
-   **Bild:** En professionell bild på grundaren (`mickebild.png`).
-   **Citat:** *"Jag har själv känt frustrationen av att drunkna i admin. Jag byggde ByggPilot för att ge tillbaka kontrollen och lönsamheten till hantverkare som älskar sitt yrke, inte pappersarbete."*
-   **Namn:** Mikael, Grundare av ByggPilot.

### Milstolpe 7: Footer
-   Simpel footer med copyright, företagsnamn och länkar till integritetspolicy/användarvillkor.

```

## 5. Nästa Steg: Dashboarden

När landningssidan är klar och godkänd, är nästa stora uppgift att bygga applikationens dashboard. Den ska också byggas enligt en mall (`DASHBOARD_PRD.md`), men med en mer avancerad och interaktiv implementation.

---
**Instruktion till dig som användare:** Starta en ny chatt och be AI-assistenten att läsa och följa instruktionerna i filen `Ai_context.md`. Lycka till!
