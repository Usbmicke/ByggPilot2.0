import { onFlow } from '@genkit-ai/flow';
import { defineTool } from '@genkit-ai/core';
import { geminiPro } from '@genkit-ai/google-genai';
import { generate } from '@genkit-ai/ai';
import { z } from 'zod';
import { firebaseAuth } from '@genkit-ai/firebase/auth';
import { createProject } from '../../lib/dal/projects';
import { MessageData } from '@genkit-ai/ai/model';

// Definiera verktyget "Skapa Projekt"
const createProjectTool = defineTool(
  {
    name: 'createProject',
    description: 'Creates a new construction project with a name and address.',
    inputSchema: z.object({
      name: z.string(),
      address: z.string(),
    }),
    outputSchema: z.string(),
  },
  async (input, context) => {
    if (!context?.auth?.uid) throw new Error("User not authenticated");
    
    const projectNum = await createProject(context.auth.uid, input.name, input.address);
    return `Project created successfully! Number: ${projectNum}`;
  }
);

// Helper to map auth context to tool context
const toToolContext = (authContext: any) => ({
  auth: authContext?.auth,
});

export const chatFlow = onFlow(
  {
    name: 'chatFlow',
    inputSchema: z.object({
      messages: z.array(
        z.object({
          role: z.enum(["user", "model"]),
          content: z.string(),
        })
      ),
    }),
    authPolicy: firebaseAuth((user) => {
      if (!user) throw new Error("Unauthorized");
    }),
    stream: true, 
  },
  async (input, context) => {

    const llmInput: MessageData[] = input.messages.map(m => ({
      role: m.role,
      content: [{ text: m.content }]
    }));

    const response = await generate({
      model: geminiPro, 
      prompt: { messages: llmInput }, 
      tools: [createProjectTool],
      context: toToolContext(context), 
      config: {
        temperature: 0.3, 
      }
    });

    return response.stream(); 
  }
);