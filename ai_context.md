
# ByggPilot Guldstandard: Bindande Operativ Manual

**Version 4.0**

## Inledning & Syfte

Detta dokument är den enda källan till sanning för utvecklingen av ByggPilot. Det existerar som ett direkt resultat av ett katastrofalt systematiskt misslyckande där grundläggande principer ignorerades, vilket ledde till ett försämrat och icke-fungerande system. Syftet med denna manual är att säkerställa att dessa misstag **aldrig** upprepas. Alla handlingar måste följa dessa direktiv utan undantag.

---

## Del 0: Total Systemintegritetskontroll (TSK) - Alltid Först

**Princip:** Innan någon kodändring eller funktionsspecifik analys påbörjas, måste en Total Systemintegritetskontroll genomföras. Detta är ett icke förhandlingsbart första steg. Syftet är att säkerställa att projektets grundläggande konfiguration är korrekt och att inga dolda fel existerar på systemnivå.

**Implementering (TSK-Checklista):**

1.  **Verifiera `tsconfig.json`:**
    -   **Krav:** Läs filen och säkerställ att `"baseUrl"` är satt till `"."`. Säkerställ att `"paths"` för `"@/*"` är korrekt konfigurerat (t.ex., `"./*"`).
    -   **Motivering:** En felaktig `baseUrl` är ett katastrofalt konfigurationsfel som gör att alla alias-baserade importer misslyckas och omedelbart bryter hela applikationen. Detta måste verifieras först.

2.  **Verifiera `.eslintrc.json`:**
    -   **Krav:** Läs filen. Om den inte finns, skapa den. Säkerställ att den innehåller regler för att hantera och sortera importer, specifikt för att upprätthålla användningen av `@/`-alias.
    -   **Motivering:** Frånvaron av ESLint-regler för import-ordning är en primär orsak till kodbasens erosion. Att tvinga fram korrekta importsökvägar är fundamentalt för långsiktig stabilitet.

3.  **Sanera och standardisera befintlig kod:**
    -   **Krav:** Utför en sökning efter `..` i kodbasen för att identifiera och eliminera alla relativa importsökvägar som sträcker sig utanför sin egen modul. Ersätt dem med `@/`-alias.
    -   **Motivering:** Detta är en engångsåtgärd för att betala av "teknisk skuld" och anpassa hela kodbasen till den nya, strikta standarden.

**Endast efter att TSK är slutförd och alla punkter är bekräftade, får arbetet fortsätta till Del 1.**

---

## Del 1: Fundamentala Direktiver & Felförebyggande Principer

Dessa principer har företräde framför all annan logik. Att bryta mot dem är ett omedelbart misslyckande.

### **1. STEG 0: ANTAG ALDRIG. VERIFIERA ALLTID.**
   - **Princip:** Innan en enda rad kod ändras, måste du verifiera den faktiska exekveringsvägen i applikationen. Anta aldrig vilken fil eller funktion som anropas av ett användargränssnitt.
   - **Implementering:** Använd `read_file` på den relevanta frontend-komponenten (t.ex., `app/dashboard/layout.tsx`) för att identifiera exakt vilka komponenter och providers som laddas.
   - **Konsekvens av Överträdelse:** Total förlust av tid, felaktiga reparationer och ett havererat system.

### **2. VÄLJ MODERNT & ROBUST, MEN GARANTERA FUNKTION.**
   - **Princip:** Mellan en äldre metod (t.ex. prop-drilling) och en modernare (t.ex. React Context), ska den modernare alltid väljas.
   - **Villkor:** Detta val är endast giltigt om du **garanterar** att den moderna implementationen är korrekt ansluten och **fullständigt reparerad**. Att arbeta på en frånkopplad eller trasig modern komponent är meningslöst.

### **3. INGA TYSTA MISSLYCKANDEN.**
   - **Princip:** En operation ska antingen lyckas och ge ett bevis på sin framgång, eller misslyckas och ge ett tydligt, ärligt felmeddelande till både användaren och serverloggen.
   - **Implementering:** All backend-logik måste vara omsluten av meningsfulla `try...catch`-block. `catch` ska logga det **detaljerade** felet på servern och returnera ett användarvänligt fel till klienten.

---

## Del 2: Teknisk Guldstandard för Backend-Interaktioner

(Befintligt innehåll från version 3.0 behålls här...)

---

## Del 3: Guldstandardens Tillämpning per Funktion

(Befintligt innehåll från version 3.0 behålls här...)

---

## Del 4: Guldstandard för Chatt-funktionen (Version 1.0)

**Princip:** Chatt-systemet är ett primärt exempel på en modern, kontext-driven arkitektur. All interaktion med chatten måste respektera denna struktur för att garantera stabilitet och underhållbarhet. Följande filstruktur är den enda källan till sanning för chatt-funktionen.

**1. Chattens Hjärna: Context Provider**
   - **Sökväg:** `contexts/ChatContext.tsx`
   - **Roll:** Hanterar **all** state och logik. Använder `@ai-sdk/react` för att hantera meddelanden, input, laddningsstatus och API-anrop.
   - **Direktiv:** Denna fil **ska** exponera `append`-funktionen direkt från `useChat`-hooken. Inga egna `sendMessage`-wrappers får skapas. All state som behövs av underliggande komponenter (`isLoading`, `input`, etc.) **ska** tillhandahållas härifrån.

**2. Chattens Gränssnitt: Input-komponent**
   - **Sökväg:** `components/chat/ChatInput.tsx`
   - **Roll:** Renderar textrutan och tillhörande knappar (skicka, mikrofon etc.).
   - **Direktiv:** Denna komponent **ska** vara helt självförsörjande genom att konsumera `useChat()`-kontexten. Den **får inte** ta emot några props för state-hantering (som `onSendMessage`, `isLoading`). All logik, inklusive anrop till `append`, **ska** hanteras internt i komponenten via kontexten. Styling **ska** använda TailwindCSS-klasser som är kompatibla med appens mörka tema (t.ex., `bg-gray-800`, `text-white`).

**3. Chattens Behållare: Banner-komponent**
   - **Sökväg:** `components/layout/ChatBanner.tsx`
   - **Roll:** Fungerar som den yttre, expanderbara bannern i gränssnittet.
   - **Direktiv:** Denna komponent är en "dum" layout-komponent. Dess enda ansvar är att rendera `MessageFeed` och `<ChatInput />`. Den **får inte** skicka några state-relaterade props till `ChatInput`.

**4. Chattens Startpunkt: Dashboard Layout**
   - **Sökväg:** `app/dashboard/layout.tsx`
   - **Roll:** Den övergripande layouten för den inloggade upplevelsen.
   - **Direktiv:** Detta är den korrekta och enda platsen där `<ChatBanner />`-komponenten ska renderas för att vara globalt tillgänglig för inloggade användare.

**Sammanfattning av exekveringsflöde:**
`app/dashboard/layout.tsx` -> `ChatBanner` -> (`MessageFeed` + `ChatInput`). Parallellt omsluter `app/providers.tsx` allt med `ChatProvider`, vilket gör att `ChatInput` kan ansluta direkt till `ChatContext` för att fungera.
