
import { GoogleGenerativeAI } from '@google/generative-ai';

// **KORRIGERING:** Standardiserar till att använda GEMINI_API_KEY, i enlighet med resten av applikationen.
if (!process.env.GEMINI_API_KEY) {
  throw new Error("API-nyckeln GEMINI_API_KEY är inte konfigurerad i .env.local.");
}

// Initiera Google AI-klienten med den korrekta, standardiserade nyckeln.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export interface RiskAnalysis {
  summary: string;
  risks: {
    area: string;
    description: string;
    consequence: string;
    measure: string;
  }[];
}

/**
 * Genererar en avancerad, initial riskanalys för ett svenskt byggprojekt med Google Gemini.
 */
export async function generateInitialRiskAnalysis(projectName: string, projectDescription: string): Promise<RiskAnalysis | null> {
  // Använder en specifik, stabil version av modellen för att undvika tvetydighet.
  const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

  const systemPrompt = `
    Du är ByggPilot AI, en Sveriges ledande experter på KMA (Kvalitet, Miljö, Arbetsmiljö) och riskhantering inom bygg- och anläggningssektorn.
    Analysen måste grunda sig i svenska lagar och branschstandarder (AFS, BBR, PBL).
    Fokusera på Kvalitet, Tid och Ekonomi.
    Strukturera ditt svar som ett JSON-objekt med "summary" och "risks".
    Svara ENDAST med ett giltigt JSON-objekt, utan extra text eller markdown-formatering.
  `;
  const userContent = `Analysera följande projekt:\nProjektnamn: ${projectName}\nBeskrivning: ${projectDescription || 'Ingen detaljerad beskrivning angiven.'}`;
  
  const prompt = `${systemPrompt}\n\n${userContent}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const analysis: RiskAnalysis = JSON.parse(cleanedText);
    if (!analysis.risks || !analysis.summary) {
      throw new Error("AI response is missing required fields.");
    }
    return analysis;

  } catch (error) {
    console.error("Error in generateInitialRiskAnalysis with Google Gemini:", error);
    return null;
  }
}

/**
 * Uppdaterar en befintlig riskanalys med nya risker från en arbetsorder med Google Gemini.
 */
export async function generateRiskAnalysisUpdate(existingAnalysis: RiskAnalysis, workOrder: string): Promise<RiskAnalysis | null> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

  const systemPrompt = `
    Du är ByggPilot AI, en expert på KMA i den svenska byggbranschen.
    Din uppgift är att uppdatera en befintlig riskanalys baserat på en ny arbetsorder.
    
    1. Analysera den nya arbetsordern nedan.
    2. Identifiera de nya, specifika riskerna den medför inom områdena Kvalitet, Tid, Ekonomi och Arbetsmiljö (AFS).
    3. Infoga dessa nya risker i den befintliga listan med risker.
    4. Skriv om den övergripande sammanfattningen ("summary") så att den reflekterar den nya, mest kritiska risken.
    5. Returnera hela det uppdaterade riskanalys-objektet i samma JSON-format.

    Svara ENDAST med det kompletta, uppdaterade och giltiga JSON-objektet, utan extra text eller markdown.
  `;

  const userContent = `Befintlig riskanalys (JSON):\n${JSON.stringify(existingAnalysis)}\n\nNy arbetsorder att analysera och infoga:\n"${workOrder}"`;
  const prompt = `${systemPrompt}\n\n${userContent}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const updatedAnalysis: RiskAnalysis = JSON.parse(cleanedText);
    if (!updatedAnalysis.risks || !updatedAnalysis.summary) {
      throw new Error("AI response is missing required fields.");
    }
    return updatedAnalysis;

  } catch (error) {
    console.error("Error in generateRiskAnalysisUpdate with Google Gemini:", error);
    return null;
  }
}
