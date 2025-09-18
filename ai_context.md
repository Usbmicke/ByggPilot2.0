## 1. Mål & Vision

ByggPilot är en digital kollega för små och medelstora byggföretag i Sverige. Målet är att eliminera "pappersmonstret" – all den tidskrävande administration som stjäl tid från det verkliga hantverket. Applikationen ska automatisera flöden från offert till faktura, samla all projektdata på ett ställe och ge användaren datadrivna insikter för att öka lönsamheten.

**Grundare:** Michael Ekengren Fogelström, en hantverkare med 20 års erfarenhet.
**Kärnvärde:** Byggd av en hantverkare, för hantverkare. Empati för användarens frustration är centralt.

---

## 2. Generella Riktlinjer

Dessa riktlinjer styr din utvecklingsprocess.

1.  **AGERA, FRÅGA INTE:** Agera alltid först. Ta kommando, utför uppgiften och rapportera resultatet. Fråga endast om en avsikt är tvetydig eller om en åtgärd är destruktiv.
2.  **ANVÄNDARFOKUS FRAMFÖR ALLT:** Målet är att eliminera administrativ huvudvärk. Alla funktioner ska designas för att vara maximalt enkla och intuitiva. Prioritera klickbara knappar framför textinmatning.
3.  **KORREKTHET ÄR HELIGT:** All kod ska vara robust, testbar och följa bästa praxis. All information som presenteras (t.ex. från externa API:er) måste vara korrekt och från verifierade källor.
4.  **SÄKERHET SOM STANDARD:** Hantera all känslig information (API-nycklar, kunddata, tokens) med största varsamhet. Skriv aldrig känslig data i klartext i loggar eller kod.
5.  **ETT STEG I TAGET:** Bryt ner komplexa problem i mindre, hanterbara steg. Slutför och verifiera varje steg innan du går vidare till nästa. Checka av slutförda steg i detta dokument.

---
## 2.1 ByggPilot-Tänk: Kärnprinciper

Detta är den centrala filosofin som definierar hur ByggPilot ska kännas och agera. Den väger tyngre än de generella riktlinjerna.

1.  **Den Pålitliga Kollegan:** ByggPilot är alltid närvarande men aldrig i vägen. Funktionalitet ska vara integrerad, stabil och förutsägbar. Den är proaktiv, men stör aldrig. Den inger förtroende.

2.  **Byggd för Hantverkare, av Hantverkare:** Varje beslut ska mätas mot frågan: "Hjälper detta användaren att undvika pappersarbete och fokusera på sitt hantverk?" Praktisk nytta går alltid före teknisk finess. Språket är enkelt och direkt.

3.  **Agera, men med Omdöme:** Ta initiativ och lös problem självständigt, men ha omdömet att förklara handlingar som kan verka oväntade eller drastiska (t.ex. att radera en fil). Transparens bygger förtroende.

4.  **Alltid Fokuserad på Målet:** Målet är att ge användaren tillbaka kontroll och tid. Om en funktion är komplicerad är den fel. Om en process är manuell är den fel. ByggPilot är den rakaste vägen från administrativt problem till automatiserad lösning.
---

## 3. Status & Slutförda Steg
- [ ] **FAS 1: Grundläggande struktur & Onboarding (Pågår)**
  - [x] Skapa Firebase-projekt & grundläggande databasregler.
  - [x] Implementera användarautentisering (Google).
  - [x] Skapa grundläggande layout med Sidebar och Header.
  - [x] Skapa datamodell för `User` och `Project`.
  - [x] Implementera grundläggande Onboarding-flöde.
- [ ] **FAS 2: Kärnfunktioner (Ej påbörjad)**
- [ ] **FAS 3: Integrationer (Ej påbörjad)**
- [ ] **FAS 4: AI & Insikter (Ej påbörjad)**

---

## 4. Teknisk Stack

*   **Framework:** Next.js (App Router)
*   **Språk:** TypeScript
*   **Backend:** Firebase (Authentication, Firestore, Storage)
*   **Styling:** Tailwind CSS
*   **State Management:** React Context (för Auth), `useState` för lokal state.
*   **Deployment:** Vercel

---
## 5. Viktiga Filer
*   `app/layout.tsx`: Root layout, applicerar globala styles och providers.
*   `app/page.tsx`: Landningssida för oinloggade användare.
*   `app/dashboard/page.tsx`: Huvudsida för inloggade användare.
*   `app/context/AuthContext.tsx`: Hanterar all användar-state och inloggningslogik.
*   `app/lib/firebase/client.ts`: Klient-konfiguration för Firebase.
*   `app/lib/firebase/firestore.ts`: Funktioner för att interagera med Firestore-databasen.
*   `tailwind.config.ts`: Konfiguration för Tailwind CSS.
*   `ai_context.md`: **Denna fil.** Din primära källa för kontext och projektstatus.
*   `AI_GUIDELINES.md`: Specifika, tekniska regler du måste följa.
