# ByggPilot: Användarflöden & Datamodeller

Detta dokument är en del av vår Guldstandard och agerar som Sanningens Enda Källa för systemets flöden och datastrukturer.

## 1. Användarflöde: Skapa ett Nytt Projekt via Co-Pilot

```mermaid
sequenceDiagram
    participant U as Användare
    participant C as Klient (React)
    participant S as Server (Next.js API)
    participant AI as AI Modell (Google)
    participant DB as Firestore

    U->>C: Klickar på "Nytt Projekt"
    C->>S: POST /api/chat (meddelande: "Skapa nytt projekt")
    S->>AI: streamText(messages, tools: [createProject])
    AI-->>S: "Visst, vad heter projektet?"
    S-->>C: Streamar svar
    C->>U: Visar "Vad heter projektet?"
    
    U->>C: Svarar "Villa Solbacken"
    C->>S: POST /api/chat (med historik)
    S->>AI: streamText(messages, tools: [createProject])
    AI-->>S: "Ok, vilket kund-ID?"
    S-->>C: Streamar svar
    C->>U: Visar "Vilket kund-ID?"

    U->>C: Svarar "cust_12345"
    C->>S: POST /api/chat (med historik)
    S->>AI: streamText(messages, tools: [createProject])
    AI-->>S: "Ska jag skapa projektet?"
    S-->>C: Streamar svar
    C->>U: Visar "Ska jag skapa projektet?"

    U->>C: Svarar "Ja"
    C->>S: POST /api/chat (med historik)
    S->>AI: streamText(messages, tools: [createProject])
    AI-->>S: [TOOL_CALL: createProject({ name: "Villa Solbacken", customerId: "cust_12345" })]
    
    S->>S: Exekverar toolDefinition.createProject
    S->>DB: create(collection: 'projects', data: {...})
    DB-->>S: Success (projectId: "proj_abc")
    S-->>AI: [TOOL_RESULT: { success: true, projectId: "proj_abc" }]

    AI-->>S: "Klart! Projektet 'Villa Solbacken' är skapat."
    S-->>C: Streamar svar
    C->>U: Visar bekräftelse

```

## 2. Datamodell: `Project`

- **Collection:** `projects`
- **Dokument-ID:** Automatiskt genererat av Firestore

| Fält | Datatyp | Obligatoriskt? | Beskrivning |
| :--- | :--- | :--- | :--- |
| `name` | `string` | Ja | Projektets namn, t.ex. "Renovering Kök". |
| `customerId` | `string` | Ja | Referens (ID) till ett dokument i `customers`-collection. |
| `status` | `string` | Ja | Projektets nuvarande status. Tillåtna värden: `pending`, `active`, `completed`, `on-hold`, `cancelled`. Standard: `pending`. |
| `budget` | `number` | Nej | Projektets totala budget i kronor. |
| `timeline` | `string` | Nej | En textbeskrivning av tidslinjen, t.ex. "Q3 2024 - Q1 2025". |
| `createdAt`| `Timestamp`| Ja | Tidsstämpel när dokumentet skapades. |
| `updatedAt`| `Timestamp`| Ja | Tidsstämpel när dokumentet senast uppdaterades. |

