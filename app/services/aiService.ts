
import OpenAI from 'openai';

// ... (befintliga interfaces och OpenAI-klient)

export interface RiskAnalysis {
  summary: string;
  risks: {
    area: string;
    description: string;
    consequence: string;
    measure: string;
  }[];
}

// ... (befintlig generateQuoteSuggestion)

/**
 * Genererar en avancerad, initial riskanalys för ett svenskt byggprojekt.
 */
export async function generateInitialRiskAnalysis(projectName: string, projectDescription: string): Promise<RiskAnalysis | null> {
  // Samma kraftfulla prompt som tidigare, men med ett nytt namn för tydlighet
  const systemPrompt = `
    Du är ByggPilot AI, en Sveriges ledande experter på KMA (Kvalitet, Miljö, Arbetsmiljö) och riskhantering inom bygg- och anläggningssektorn.
    Analysen måste grunda sig i svenska lagar och branschstandarder (AFS, BBR, PBL).
    Fokusera på Kvalitet, Tid och Ekonomi.
    Strukturera ditt svar som ett JSON-objekt med "summary" och "risks".
    Svara ENDAST med ett giltigt JSON-objekt.
  `;
  const userContent = `Analysera följande projekt:\nProjektnamn: ${projectName}\nBeskrivning: ${projectDescription || 'Ingen detaljerad beskrivning angiven.'}`;

  try {
    // ... OpenAI API-anrop som tidigare ...
    const analysis: RiskAnalysis = {} as any; // Dummy
    return analysis;
  } catch (error) {
    console.error("Error in generateInitialRiskAnalysis:", error);
    return null;
  }
}

/**
 * Uppdaterar en befintlig riskanalys med nya risker från en arbetsorder.
 */
export async function generateRiskAnalysisUpdate(existingAnalysis: RiskAnalysis, workOrder: string): Promise<RiskAnalysis | null> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured.");
  }

  const systemPrompt = `
    Du är ByggPilot AI, en expert på KMA i den svenska byggbranschen.
    Din uppgift är att uppdatera en befintlig riskanalys baserat på en ny arbetsorder.
    
    1. Analysera den nya arbetsordern nedan.
    2. Identifiera de nya, specifika riskerna den medför inom områdena Kvalitet, Tid, Ekonomi och Arbetsmiljö (AFS).
    3. Infoga dessa nya risker i den befintliga listan med risker.
    4. Skriv om den övergripande sammanfattningen ("summary") så att den reflekterar den nya, mest kritiska risken.
    5. Returnera hela det uppdaterade riskanalys-objektet i samma JSON-format.

    Svara ENDAST med det kompletta, uppdaterade och giltiga JSON-objektet.
  `;

  const userContent = `Befintlig riskanalys (JSON):\n${JSON.stringify(existingAnalysis)}\n\nNy arbetsorder att analysera och infoga:\n"${workOrder}"`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      response_format: { type: "json_output" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.5,
    });

    const result = response.choices[0].message?.content;
    if (!result) throw new Error('AI model returned an empty response.');

    const updatedAnalysis: RiskAnalysis = JSON.parse(result);
    if (!updatedAnalysis.risks || !updatedAnalysis.summary) {
      throw new Error("AI response is missing required fields.");
    }
    return updatedAnalysis;

  } catch (error) {
    console.error("Error in generateRiskAnalysisUpdate:", error);
    return null;
  }
}
