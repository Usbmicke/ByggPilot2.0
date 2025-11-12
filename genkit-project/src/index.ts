
import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { onFlow } from '@genkit-ai/firebase/functions';
import { defineFlow, run } from '@genkit-ai/flow';
import { googleAI, gemini25Flash, gemini25Pro } from '@genkit-ai/googleai';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onUserAfterCreate } from 'firebase-functions/v2/identity';
import * as logger from 'firebase-functions/logger';
import { z } from 'zod';
import { createUserProfile } from '../../lib/dal';
import { MessageData } from '../../lib/schemas';
import { generate, defineTool } from '@genkit-ai/ai';
import { askBranschensHjärnaFlow, askFöretagetsHjärnaFlow } from './brains';
// Importera alla specialiserade flöden
import { audioToAtaFlow, generateQuoteFlow, analyzeSpillWasteFlow } from './specialized-flows'; 

// ... (resten av filen är oförändrad, bara exportlistan justeras)

// =================================================================================
// EXPORTERADE FLÖDEN
// =================================================================================

// Lägg till analyzeSpillWasteFlow i exportlistan
export { 
    askBranschensHjärnaFlow, 
    askFöretagetsHjärnaFlow, 
    audioToAtaFlow, 
    generateQuoteFlow, 
    analyzeSpillWasteFlow 
};