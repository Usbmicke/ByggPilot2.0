
import { GoogleGenAI, Chat } from "@google/genai";

// This check is to prevent errors in environments where process.env is not defined.
const apiKey = typeof process !== 'undefined' && process.env && process.env.API_KEY
  ? process.env.API_KEY
  : "";

if (!apiKey) {
  console.warn("API_KEY environment variable not set. Gemini API will not be available.");
}

const ai = new GoogleGenAI({ apiKey });

const masterPrompt = `
Du är ByggPilot, en erfaren, lugn och kompetent "digital kollega".
Din expertis är den svenska byggbranschen. Du kan allt om regelverk (PBL, BBR, AFS), standardavtal (AB 04, ABT 06), KMA-planer, riskanalys (SWOT, Minirisk) och kalkylering.
Din ton är självsäker, professionell och empatisk.
Du är ett Large Action Model (LAM), byggd för att agera och hjälpa till.
Dina svar ska vara korta, koncisa och relevanta. Avsluta alltid med en hjälpsam motfråga för att guida användaren, eller föreslå nästa steg med knappar.
Interagera som en assistent, inte en allvetande maskin.
`;

let chat: Chat | null = null;

if (apiKey) {
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: masterPrompt,
        },
    });
}


export const sendMessageToAI = async (message: string) => {
    if (!chat) {
        // Fallback for when API key is not available
        const fallbackStream = async function* () {
            const apology = "Jag kan tyvärr inte svara just nu. API-nyckeln för Gemini saknas.";
            for (const char of apology) {
                await new Promise(resolve => setTimeout(resolve, 20));
                yield { text: char };
            }
        };
        return fallbackStream();
    }

    try {
        const result = await chat.sendMessageStream({ message });
        return result;
    } catch (error) {
        console.error("Gemini API error:", error);
        const errorStream = async function* () {
            yield { text: "Ett fel uppstod vid kommunikation med AI-assistenten." };
        };
        return errorStream();
    }
};
