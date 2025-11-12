
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { VertexAI, Part } from "@google-cloud/vertexai";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { MODELS } from "../lib/config/models";

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Initialize Firestore
const db = getFirestore();

// Initialize Vertex AI
const vertex_ai = new VertexAI({
  project: process.env.GCLOUD_PROJECT,
  location: process.env.GCLOUD_LOCATION,
});

// Initialize Generative Models
const flashModel = vertex_ai.getGenerativeModel({
    model: MODELS.DEFAULT_TIER,
});

const proModel = vertex_ai.getGenerativeModel({
    model: MODELS.HEAVY_TIER,
});

// --- Helper Functions ---

const system_prompt_intent = `You are an intent classification AI. Your task is to classify the user\'s prompt into one of two categories: \'simple_qa\' or \'complex_task\'. 
- \'simple_qa\' is for general questions, greetings, simple requests, or conversation.
- \'complex_task\' is for prompts that require deep reasoning, complex logic, code generation, multi-step problem solving, or tasks that involve recalling and processing large amounts of information from the context.
Your response MUST be either \'simple_qa\' or \'complex_task\' and nothing else.`;


async function getHistoryFromFirestore(sessionId: string): Promise<{ history: Part[], summary: string | null }> {
    console.log(`Fetching history for session: ${sessionId}`);
    const sessionRef = db.collection('chat_sessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
        console.log("No existing session found, starting new one.");
        return { history: [], summary: null };
    }

    const sessionData = sessionDoc.data();
    const summary = sessionData?.summary || null;
    const recentHistory = sessionData?.history?.slice(-10) || [];

    return { history: recentHistory, summary };
}

async function classifyIntent(prompt: string): Promise<'simple_qa' | 'complex_task'> {
    console.log(`Classifying intent for prompt: "${prompt}"`);
    
    try {
        const classificationResult = await flashModel.generateContent([
            { role: 'system', parts: [{ text: system_prompt_intent }] },
            { role: 'user', parts: [{ text: prompt }] },
        ]);
        
        const classification = classificationResult.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'simple_qa';
        
        if (classification === 'complex_task') {
            return 'complex_task';
        }
    } catch (error) {
        console.error("Error during intent classification, defaulting to simple_qa:", error);
    }
    
    return 'simple_qa';
}

async function saveToFirestore(sessionId: string, userPrompt: string, modelResponse: string): Promise<void> {
    console.log(`Saving to Firestore for session: ${sessionId}`);
    const sessionRef = db.collection('chat_sessions').doc(sessionId);

    const userTurn: Part = { role: 'user', parts: [{ text: userPrompt }] };
    const modelTurn: Part = { role: 'model', parts: [{ text: modelResponse }] };

    await sessionRef.set({
        history: admin.firestore.FieldValue.arrayUnion(userTurn, modelTurn)
    }, { merge: true });
}


function isFailure(response: string): boolean {
    const lowerCaseResponse = response.toLowerCase();
    const failurePhrases = [
        "i cannot help with that",
        "i can't assist with that",
        "i am unable to",
        "i can't provide",
        "as a large language model",
        "i do not have the capacity to"
    ];

    return failurePhrases.some(phrase => lowerCaseResponse.includes(phrase));
}


// --- Main Orchestrator Function ---

export const chatOrchestrator = onCall(async (request) => {
    // 1. Handle Input and State
    const { prompt, sessionId } = request.data;

    if (!prompt || !sessionId) {
        throw new HttpsError('invalid-argument', 'The function must be called with "prompt" and "sessionId" arguments.');
    }

    const { history, summary } = await getHistoryFromFirestore(sessionId);
    
    // Construct the full prompt context
    const context: Part[] = [];
    if (summary) {
        context.push({ role: 'system', parts: [{ text: `Conversation summary: ${summary}` }] });
    }
    context.push(...history);

    // 2. Eskaleringsväg 1: Intent-baserad Dirigering
    const intent = await classifyIntent(prompt);

    let finalResponse: string;

    try {
        const fullContext = [...context, { role: 'user', parts: [{ text: prompt }] }];

        if (intent === 'complex_task') {
            console.log("Intent classified as complex_task. Escalating to Pro model.");
            const proResult = await proModel.generateContent({ contents: fullContext });
            finalResponse = proResult.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "Pro model did not return a valid response.";
        } else {
            // 3. Standardflöde
            console.log("Intent classified as simple_qa. Using Flash model.");
            const flashResult = await flashModel.generateContent({ contents: fullContext });
            let flashResponse = flashResult.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "Flash model did not return a valid response.";
            
            // 4. Eskaleringsväg 2: Failure-baserad Återförsök
            if (isFailure(flashResponse)) {
                console.log("Flash model failed. Escalating to Pro model for retry.");
                const proRetryResult = await proModel.generateContent({ contents: fullContext });
                finalResponse = proRetryResult.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "Pro model retry did not return a valid response.";
            } else {
                finalResponse = flashResponse;
            }
        }
    } catch (error) {
        console.error("Error during model generation:", error);
        throw new HttpsError('internal', 'An error occurred while processing your request.');
    }
    
    // 5. Spara och Returnera
    await saveToFirestore(sessionId, prompt, finalResponse);

    return { response: finalResponse };
});
