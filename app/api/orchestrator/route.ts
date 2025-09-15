
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, ExtendedSession } from '@/app/api/auth/[...nextauth]/route';
import { google } from 'googleapis';
import { ChatMessage, FlowState, RiskAnalysis } from '@/app/types';
import { generateInitialRiskAnalysis, generateRiskAnalysisUpdate } from '@/app/services/aiService';
import { createRiskAnalysisDocument, updateRiskAnalysisDocument } from '@/app/services/documentService';
import { getProject, updateProjectWithRiskAnalysis } from '@/app/services/projectService'; // Importera rätt uppdateringsfunktion

const sendReply = (text: string, internalState?: FlowState) => {
    const response: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: text,
        internalState,
    };
    return NextResponse.json(response);
};

const WORK_ORDER_KEYWORDS = ['komplettera med', 'installera', 'riva', 'åtgärda', 'bygga', 'montera', 'lägga till'];

const isWorkOrder = (text: string): boolean => {
    return WORK_ORDER_KEYWORDS.some(keyword => text.toLowerCase().startsWith(keyword));
};

export async function POST(request: Request) {
    const session: ExtendedSession | null = await getServerSession(authOptions);

    if (!session?.accessToken || !session.user?.id) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { messages } = await request.json();
    const lastUserMessage = messages[messages.length - 1];
    const internalState: FlowState = messages.filter((m: ChatMessage) => m.role === 'assistant').pop()?.internalState || {};

    // ========== DYNAMISK RISKANALYS-UPPDATERING (NU KORRIGERAD) ========== 
    if (isWorkOrder(lastUserMessage.content) && internalState.projectId) {
        const projectId = internalState.projectId;
        const workOrderText = lastUserMessage.content;

        try {
            const project = await getProject(projectId);
            if (!project || !project.riskAnalysisJson) {
                return sendReply(`Jag kan inte uppdatera riskanalysen eftersom ingen ursprunglig analys finns sparad i databasen. Skapa en först.`, internalState);
            }

            const documentId = project.riskAnalysisUrl?.split('/').slice(-2, -1)[0];
            if (!documentId) {
                return sendReply("Kunde inte hitta dokument-ID i databasen för att uppdatera Google-dokumentet.", internalState);
            }
            
            // **HÄR ÄR FIXEN:** Hämta den befintliga analysen från databasen
            const existingAnalysis: RiskAnalysis = JSON.parse(project.riskAnalysisJson as string);

            const updatedAnalysis = await generateRiskAnalysisUpdate(existingAnalysis, workOrderText);
            if (!updatedAnalysis) {
                return sendReply("AI:n kunde inte uppdatera riskanalysen just nu. Försök igen.", internalState);
            }

            const docs = google.docs({ version: 'v1', auth: new google.auth.OAuth2() /* ...auth setup... */ }); // Auth måste konfigureras korrekt
            await updateRiskAnalysisDocument(docs, documentId, updatedAnalysis, project.name);
            
            // Spara den uppdaterade analysen (både URL och JSON) till Firestore
            await updateProjectWithRiskAnalysis(projectId, updatedAnalysis, project.riskAnalysisUrl!);

            let reply = `OK, jag har noterat arbetsordern: \"${workOrderText}\".\n\n`
            reply += `Jag har uppdaterat riskanalysen med de nya punkterna. Här är den nya sammanfattningen:\n**${updatedAnalysis.summary}**\n\n`
            reply += `Du kan se den fullständiga, uppdaterade analysen här: [Riskanalys - ${project.name}](${project.riskAnalysisUrl})`

            return sendReply(reply, internalState);

        } catch (error) {
            console.error("[ORCHESTRATOR] Error during risk analysis update:", error);
            return sendReply("Ett oväntat fel uppstod när jag skulle uppdatera riskanalysen.", internalState);
        }
    }
    
    // ... (Logik för att skapa initiala projekt etc. ligger här)

    return sendReply(`Jag är osäker på hur jag ska tolka \"${lastUserMessage.content}\".`);
}

