
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
// ... (alla andra imports)
import { 
    generateInitialRiskAnalysis, 
    generateRiskAnalysisUpdate 
} from '@/app/services/aiService';
import { 
    createRiskAnalysisDocument, 
    updateRiskAnalysisDocument 
} from '@/app/services/documentService';
import { getProject, updateProject } from '@/app/services/projectService';

const WORK_ORDER_KEYWORDS = ['komplettera med', 'installera', 'riva', 'åtgärda', 'bygga', 'montera', 'lägga till'];

const isWorkOrder = (text: string): boolean => {
    return WORK_ORDER_KEYWORDS.some(keyword => text.toLowerCase().startsWith(keyword));
};

export async function POST(request: Request) {
    // ... (session och auth-logik)
    const session: ExtendedSession | null = await getServerSession();
    const { messages, trigger } = await request.json();
    const lastUserMessage = messages[messages.length - 1];
    const internalState: FlowState = messages.filter((m: ChatMessage) => m.role === 'assistant').pop()?.internalState || {};

    // ========== DYNAMISK RISKANALYS-UPPDATERING ========== 
    if (isWorkOrder(lastUserMessage.content) && internalState.projectId) {
        const projectId = internalState.projectId;
        const workOrderText = lastUserMessage.content;

        try {
            const project = await getProject(projectId);
            if (!project?.riskAnalysisUrl) {
                // Om ingen riskanalys finns, skapa en initial först.
                // (Denna logik kan göras mer robust, men är en bra start)
                return sendReply(`Jag kan inte uppdatera riskanalysen eftersom ingen ursprunglig analys finns. Skapa en först med "Skapa riskanalys för ${project?.name}".`, internalState);
            }

            const documentId = project.riskAnalysisUrl.split('/').slice(-2, -1)[0];
            if (!documentId) {
                return sendReply("Kunde inte extrahera dokument-ID från databasen.", internalState);
            }
            
            // Det här är en förenkling. I en riktig app skulle vi behöva ett sätt att läsa Docs-innehåll och
            // konvertera det tillbaka till det JSON-format som `generateRiskAnalysisUpdate` förväntar sig. 
            // För nu simulerar vi att vi har det befintliga `RiskAnalysis`-objektet.
            // I en fullständig implementation skulle vi lagra JSON-objektet i Firestore.
            const placeholderExistingAnalysis: RiskAnalysis = { summary: "Initial summary", risks: [] }; 

            const updatedAnalysis = await generateRiskAnalysisUpdate(placeholderExistingAnalysis, workOrderText);
            if (!updatedAnalysis) {
                return sendReply("AI:n kunde inte uppdatera riskanalysen just nu.", internalState);
            }

            await updateRiskAnalysisDocument(docs, documentId, updatedAnalysis, project.name);

            let reply = `OK, jag har noterat arbetsordern: \"${workOrderText}\".\n\n`
            reply += `Jag har också uppdaterat projektets riskanalys. Här är den nya sammanfattningen:\n**${updatedAnalysis.summary}**\n\n`
            reply += `Du kan se den fullständiga, uppdaterade analysen här: [Riskanalys - ${project.name}](${project.riskAnalysisUrl})`

            return sendReply(reply, internalState);

        } catch (error) {
            console.error("Error during dynamic risk analysis update:", error);
            return sendReply("Ett oväntat fel uppstod när jag skulle uppdatera riskanalysen.", internalState);
        }
    }

    // ... (alla andra flöden, inklusive att skapa det FÖRSTA projektet med sin initiala riskanalys)

    return sendReply(`Jag är osäker på hur jag ska tolka \"${lastUserMessage.content}\".`);
}
