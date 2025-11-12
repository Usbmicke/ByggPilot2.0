
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { VertexAI } from "@google-cloud/vertexai";
import * as admin from "firebase-admin";
import { MODELS } from "../lib/config/models";

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// Initialize Vertex AI
const vertex_ai = new VertexAI({
  project: process.env.GCLOUD_PROJECT,
  location: process.env.GCLOUD_LOCATION,
});

const flashModel = vertex_ai.getGenerativeModel({
    model: MODELS.DEFAULT_TIER,
});

const system_prompt_summary = "Sammanfatta denna konversation kortfattat. Fokusera på de viktigaste ämnena och resultaten. Svaret ska vara en koncis sammanfattning och inget annat.";

export const onMessageCreate = onDocumentWritten("chat_sessions/{sessionId}", async (event) => {
    if (!event.data) {
        console.log("No data associated with the event. Nothing to do.");
        return;
    }

    const dataAfter = event.data.after.data();
    const dataBefore = event.data.before.data();

    const historyAfter = dataAfter.history || [];
    const historyBefore = dataBefore.history || [];

    // Only run if the history has grown
    if (historyAfter.length <= historyBefore.length) {
        console.log("History has not grown. No summary needed.");
        return;
    }

    // Trigger summarization every 5 new turns (10 messages: 5 user, 5 model)
    // And only if there are enough messages to summarize.
    const shouldSummarize = historyAfter.length >= 10 && historyAfter.length % 10 === 0;

    if (!shouldSummarize) {
        console.log(`History length is ${historyAfter.length}. No summary needed yet.`);
        return;
    }

    console.log(`History length is ${historyAfter.length}. Triggering summarization.`);

    try {
        const historyText = historyAfter.map((turn: any) => `${turn.role}: ${turn.parts[0].text}`).join("\n");

        const summaryResult = await flashModel.generateContent([
            { role: 'system', parts: [{ text: system_prompt_summary }] },
            { role: 'user', parts: [{ text: historyText }] },
        ]);

        const summary = summaryResult.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (summary) {
            await db.collection("chat_sessions").doc(event.params.sessionId).update({ summary });
            console.log(`Successfully updated summary for session: ${event.params.sessionId}`);
        } else {
            console.log("Generated summary was empty. Nothing to update.");
        }

    } catch (error) {
        console.error(`Failed to summarize session ${event.params.sessionId}:`, error);
    }
});
