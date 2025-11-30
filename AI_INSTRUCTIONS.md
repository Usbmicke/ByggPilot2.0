# Guldstandarden för Byggpilot-utveckling

Detta dokument definierar de regler och den arkitektur som ALL ny utveckling i detta projekt måste följa. Målet är att säkerställa en högkvalitativ, skalbar och underhållsvänlig kodbas.

## 1. Den Enda Vägen In: Genkit Gateway

All kommunikation mellan frontend (Next.js) och backend måste gå genom ett Genkit-flöde. Det finns inga undantag.

- **Endpoint:** Den enda tillåtna API-endpointen är den som skapas av Genkit-pluginet: `src/app/api/[[...genkit]]/route.ts`.
- **Inga manuella API:er:** Skapa aldrig några egna `route.ts`-filer för backend-logik.
- **Frontend-anrop:** Använd `runFlow` från `@genkit-ai/flow/client` för att anropa dina flöden.

## 2. Strikt Separation: DAL (Data Access Layer)

All direktinteraktion med databasen (Firestore) måste isoleras i ett Data Access Layer (DAL).

- **Plats:** Alla DAL-filer ska ligga i `src/genkit/dal/`.
- **Syfte:** En DAL-fil innehåller funktioner som utför CRUD-operationer (Create, Read, Update, Delete) mot en specifik samling i Firestore. Exempel: `user.repo.ts`, `project.repo.ts`.
- **Total frikoppling:** Frontend-komponenter (`src/app/...`) eller Genkit-tjänster (`src/genkit/services/...`) får **ALDRIG** importera `firebase-admin` eller anropa Firestore direkt. De måste anropa en funktion från DAL.

## 3. Nolltolerans: "Zero Trust" på Backend

Varje Genkit-flöde som kan anropas från klienten måste vara säkrat.

- **Auth Policy:** Använd `firebaseAuth`-policyn i definitionen av ditt flöde för att verifiera att en giltig Firebase-användare gör anropet.
- **Exempel:**
  ```typescript
  export const mittSakraFlode = defineFlow({
    name: 'mittSakraFlode',
    // ... input/output schema
    authPolicy: firebaseAuth((user) => {
      if (!user) throw new Error('Användare måste vara inloggad.');
    }),
  },
  async (input, { auth }) => {
    const uid = auth.uid; // Nu kan du lita på att denna UID är korrekt.
    // ... din logik
  });
  ```

---

## CHECKLISTA FÖR NYA FUNKTIONER

Följ dessa steg när du bygger en ny funktion:

1.  **DAL:** Om funktionen behöver interagera med databasen, skapa eller uppdatera en DAL-fil i `src/genkit/dal/` med nödvändiga funktioner.
2.  **Service (om nödvändigt):** Om funktionen involverar komplex affärslogik eller en extern tjänst (t.ex. Google Drive API), skapa en service-fil i `src/genkit/services/`.
3.  **Flow:** Skapa Genkit-flödet i `src/genkit/flows/`. Detta flöde orkestrerar anrop till DAL och services. Kom ihåg att säkra det med `firebaseAuth`.
4.  **UI:** Skapa komponenten i `src/app/`. Använd `useGenkit` (för att **läsa** och cacha data) eller anropa ditt flöde med `runFlow` inuti en händelsehanterare som `onClick` eller `onSubmit` (för att **skriva** eller modifiera data).
