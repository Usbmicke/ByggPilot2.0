
# ByggPilot AI - Teknisk Arkitektur & Status (V6 - "Rätt Häst för Rätt Vagn")

**Senast uppdaterad:** 2025-11-15

Detta dokument definierar den nuvarande, produktionsinriktade AI-arkitekturen för ByggPilot. All tidigare dokumentation (V1-V5) är att betrakta som **föråldrad**. Systemet bygger på en differentierad och kostnadseffektiv modellstrategi med **Genkit** som ryggrad.

---

### Kärnarkitektur: "Rätt Häst för Rätt Vagn" 🐎

Kärnan i systemet är att **alltid använda den billigaste, lämpligaste AI-modellen för varje specifik uppgift**. Detta hanteras av en central "router".

1.  **Central Router (`chatRouterFlow`):** Alla anrop från frontend går hit. Flödet använder den snabba och billiga **Gemini 2.5 Flash** för att omedelbart klassificera användarens avsikt.

2.  **Dirigering:** Baserat på avsikten skickas uppgiften till ett specialiserat under-flöde.

### Autentisering & Säkerhet: Firebase & Genkit

**VIKTIGT: `next-auth` är helt utfasat och har avinstallerats.** All tidigare kod som refererar till `useSession`, `getServerSession` eller `@auth/firebase-adapter` är felaktig och måste tas bort.

1.  **Frontend-autentisering:** Hanteras **uteslutande** via **Firebase Client SDK** (`firebase/auth`). UI-komponenter använder `onAuthStateChanged` för att få tillgång till den inloggade användaren (`User`).

2.  **Backend-anrop:** Alla anrop till Genkit-flöden måste inkludera en giltig Firebase ID-token från den inloggade användaren.

3.  **Säkerhet i flöden:** Genkit-flöden tar emot och verifierar denna token i sin `auth`-kontext. Alla databasåtgärder (via DAL-verktyg som `createAtaInDb`) måste använda `auth.uid` för att garantera att en användare endast kan komma åt och modifiera sin egen data.

---

### Modellstrategi (Gemini 2.5-serien)

| Alias i Kod | Modellnamn | Användningsområde | Status |
| :--- | :--- | :--- | :--- |
| `workhorse` | **Gemini 2.5 Flash** | **Arbetshäst:** Realtidschatt, RAG-frågor, routing, enkla verktyg. | ✅ Implementerad |
| `heavyDuty` | **Gemini 2.5 Pro** | **Tung Analys:** Komplexa uppgifter, multimodal ljudförståelse (`audioToAtaFlow`). | ✅ Implementerad |
| `vision` | **Gemini 2.5 Flash (Image)** | **Bildanalys:** Framtida funktioner som spill-analys. "Nano Banana". | ✅ Konfigurerad |

---

### Implementerade Flöden & Status

- [x] **Grundläggande Konfiguration**
  - _Mål: Definiera och konfigurera Genkit med korrekt modellstrategi._
  - Status: ✅ Klart.

- [x] **Fas 1: Central Kostnadskontroll (`chatRouterFlow`)**
  - _Mål: Skapa en router som klassificerar och dirigerar alla inkommande chatt-requests._
  - Status: ✅ Klart och aktivt.

- [x] **Fas 2: Dubbla RAG-Hjärnor (Faktabaserade Svar)**
  - _Mål: Eliminera hallucinationer genom att tvinga svar från specifika datakällor._
  - [x] **Branschens Hjärna (`askBranschensHjärnaFlow`):** Söker i publika byggstandarder (simulerat via retriever). 
  - [x] **Företagets Hjärna (`askFöretagetsHjärnaFlow`):** Söker säkert i privat företagsdata (simulerat via retriever med `auth`-kontext).
  - Status: ✅ Klart och integrerat med routern.

- [x] **Fas 3: Högvärdig Funktion (`audioToAtaFlow`)**
  - _Mål: Skapa en multimodal funktion som omvandlar röst till strukturerad data._
  - [x] Använder **Gemini 2.5 Pro** för ljudanalys.
  - [x] Tvingar **strukturerad JSON-output** som matchar `AtaSchema`.
  - [x] Anropar ett säkert DAL-verktyg (`createAtaInDb`) för att spara i databasen.
  - Status: ✅ Klart och redo att anropas från frontend.

- [ ] **Nästa Steg: Frontend-integration & Test**
  - _Mål: Koppla UI-komponenter (chatt, ljudinspelningsknapp) till de deployade Genkit-flödena._
  - Status: ⏳ Väntar på att påbörjas.

---

**Slutsats:** Kärnarkitekturen för ByggPilot AI är nu implementerad enligt specifikation. Koden är av hög kvalitet och följer den specificerade "Rätt Häst för Rätt Vagn"-principen. All gammal information och tidigare arkitekturer är ersatta. Projektet är redo för nästa fas: integration med frontend och fullskalig testning.
