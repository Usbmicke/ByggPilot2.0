
// =================================================================================
// GENKIT FLOWS - HUVUDFIL (V5 ARKITEKTUR - KVALITETSSÄKRAD)
// =================================================================================

import { configureGenkit } from '@genkit-ai/core';
import { defineFlow, run } from '@genkit-ai/flow';
import { firebase } from '@genkit-ai/firebase';
import { onCall } from '@genkit-ai/firebase/functions';
import * as z from 'zod';
import { geminiPro } from '@genkit-ai/googleai';
import { generate, Message, Part } from '@genkit-ai/ai';

import { OnboardingDataSchema, UserSchema } from '../../lib/schemas';
import { getOrCreateUser, completeOnboarding, createDemoProject } from '../../lib/dal';
import { googleDriveTool, createQuoteTool, getWeatherForecast, knowledgeBaseRetriever, analyzeMaterialSpillTool } from '../../lib/tools';

export default configureGenkit({
  plugins: [firebase()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// =================================================================================
// AUTH & ONBOARDING FLOWS (Stabila och oförändrade)
// =================================================================================

export const getOrCreateUserFlow = defineFlow(
  {
    name: 'getOrCreateUserFlow',
    inputSchema: z.void(),
    outputSchema: UserSchema,
    trigger: { type: 'onCall' },
  },
  async (input, { auth }) => {
    if (!auth) throw new Error('Användaren är inte autentiserad.');
    return await run('get-or-create-user-in-dal', () => getOrCreateUser(auth));
  }
);

export const onboardingCompleteFlow = defineFlow(
  {
    name: 'onboardingCompleteFlow',
    inputSchema: OnboardingDataSchema,
    outputSchema: UserSchema,
    trigger: { type: 'onCall' },
  },
  async (onboardingData, { auth }) => {
    if (!auth) throw new Error('Användaren är inte autentiserad.');
    await run('create-drive-folders', () => googleDriveTool.run({ companyName: onboardingData.companyName }));
    const updatedUser = await run('save-onboarding-data-to-db', () => completeOnboarding(auth, onboardingData));
    return updatedUser;
  }
);

export const createDemoProjectFlow = defineFlow(
  {
    name: 'createDemoProjectFlow',
    inputSchema: z.void(),
    outputSchema: z.any(),
    trigger: { type: 'onCall' },
  },
  async (input, { auth }) => {
    if (!auth) throw new Error('Användaren är inte autentiserad.');
    return await run('create-demo-project-in-dal', () => createDemoProject(auth));
  }
);

// =================================================================================
// CHAT FLOW (FAS 5 - KVALITETSSÄKRAD OCH OPTIMERAD)
// =================================================================================

const chatSystemPrompt = `Du är ByggPilot, en erfaren, lugn och kompetent AI-kollega för professionella hantverkare i Sverige. Ditt mål är att hjälpa användaren att planera och administrera sina byggprojekt. Agera alltid, fråga inte. Använd dina verktyg när det är lämpligt. Svara kort och koncist på svenska.`;

export const chatFlow = defineFlow(
  {
    name: 'chatFlow',
    inputSchema: z.object({ messages: z.array(z.any()) }),
    outputSchema: z.string(),
    stream: true,
    trigger: { type: 'onCall' },
  },
  async (input, { auth, stream }) => {
    if (!auth) throw new Error('Användaren är inte autentiserad för att chatta.');

    const model = geminiPro;
    const tools = [createQuoteTool, googleDriveTool, getWeatherForecast, knowledgeBaseRetriever, analyzeMaterialSpillTool];
    
    // KORREKT IMPLEMENTERING: Använd `let` för en variabel som muteras i en loop.
    let history: Message[] = [
        new Message('system', chatSystemPrompt),
        ...input.messages.map(m => new Message(m.role, m.content))
    ];

    while (true) {
      const generateResult = await generate({
        model,
        tools,
        history,
        prompt: '', 
      });

      const choice = generateResult.candidates[0];
      const choiceMessage = choice.message;
      history.push(choiceMessage);

      if (choice.finishReason === 'toolCode' && choiceMessage.toolCalls) {
        const toolCallResults = await Promise.all(
          choiceMessage.toolCalls.map(async (toolCall) => {
            const tool = tools.find((t) => t.name === toolCall.name);
            if (!tool) throw new Error(`Verktyget ${toolCall.name} hittades inte.`);
            
            console.log(`[Tool Call] Exekverar: ${tool.name} med input:`, toolCall.args);
            const output = await tool.run(toolCall.args);
            
            return new Message('tool', [
              part({ toolResponse: { name: toolCall.name, result: output } })
            ]);
          })
        );
        
        history.push(...toolCallResults);
        continue; // Fortsätt loopen för att låta modellen bearbeta verktygssvaret
      }

      // OPTIMERING: Om modellen är klar, streama det existerande svaret direkt.
      // Inget behov av ett andra, kostsamt anrop till `generate`.
      if (choice.finishReason === 'stop') {
        for (const part of choiceMessage.content) {
          if (part.text) {
            stream(part.text);
          }
        }
        break; // Avsluta loopen
      }
      
      // Oväntade fall hanteras, men bör inte inträffa i normal drift.
      console.log('Oväntad finishReason:', choice.finishReason);
      break;
    }
  }
);
