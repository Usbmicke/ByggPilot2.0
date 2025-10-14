
import { z } from 'zod';

// =================================================================================
// MILJÖVARIABEL-VALIDERING V3.0
// BESKRIVNING: Anpassad för att hantera den ursprungliga .env.local-strukturen
// där servicekontoinformation finns i en enda FIREBASE_SERVICE_ACCOUNT_JSON-variabel.
// Denna fil validerar även de nya Upstash Redis-nycklarna.
// =================================================================================

// 1. Schema för den inre JSON-strukturen i FIREBASE_SERVICE_ACCOUNT_JSON
const serviceAccountJsonSchema = z.object({
  type: z.literal('service_account'),
  project_id: z.string().min(1, 'project_id saknas i JSON.'),
  private_key: z.string().min(1, 'private_key saknas i JSON.'),
  client_email: z.string().email('client_email är ogiltig i JSON.'),
});

// 2. Huvudschema för alla miljövariabler i process.env
const envSchema = z.object({
  // Google/NextAuth-variabler som läses direkt
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID får inte vara tom.'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET får inte vara tom.'),
  NEXTAUTH_SECRET: z.string().min(10, 'NEXTAUTH_SECRET måste vara minst 10 tecken lång.'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL måste vara en giltig URL.'),

  // AI-modell
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY får inte vara tom.'),

  // Rate Limiting (Upstash Redis)
  UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL måste vara en giltig URL.'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN får inte vara tom.'),

  // Den sammansatta JSON-variabeln. Vi transformerar den till ett validerat objekt.
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().transform((str, ctx) => {
    try {
      const parsedJson = JSON.parse(str);
      const result = serviceAccountJsonSchema.safeParse(parsedJson);

      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Innehållet i FIREBASE_SERVICE_ACCOUNT_JSON är ogiltigt.',
          path: result.error.flatten().fieldErrors,
        });
        return z.NEVER;
      }
      return result.data;
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'FIREBASE_SERVICE_ACCOUNT_JSON är inte en giltig JSON-sträng.',
      });
      return z.NEVER;
    }
  }),
});

// 3. Validera process.env mot huvudschemat
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    '❌ Ogiltiga eller saknade miljövariabler:',
    parsedEnv.error.flatten().fieldErrors,
  );
  throw new Error('Servern kan inte starta på grund av ogiltig konfiguration.');
}

// 4. Exportera ett "platt" env-objekt så att resten av appen inte behöver ändras.
// Vi kombinerar de direkta variablerna med de som extraherats från JSON.
export const env = {
  ...parsedEnv.data,
  // Mappa de extraherade värdena till de namn som applikationen förväntar sig
  FIREBASE_PROJECT_ID: parsedEnv.data.FIREBASE_SERVICE_ACCOUNT_JSON.project_id,
  GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL: parsedEnv.data.FIREBASE_SERVICE_ACCOUNT_JSON.client_email,
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: parsedEnv.data.FIREBASE_SERVICE_ACCOUNT_JSON.private_key,
};
