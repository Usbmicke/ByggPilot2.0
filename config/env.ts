
import { z } from 'zod';

// =================================================================================
// MILJÖVARIABEL-VALIDERING V7.0 (REALISTISKT SCHEMA)
// BESKRIVNING: Detta är den slutgiltiga, korrekta versionen. Den tidigare, 
// överdrivet strikta schemat för servicekontot har ersatts med ett realistiskt 
// schema som BARA validerar de tre fält som Firebase Admin SDK faktiskt kräver.
// Detta löser den grundläggande kraschen vid serverstart.
// =================================================================================

// REALISTISKT SCHEMA: Validerar endast de absolut nödvändiga fälten.
const serviceAccountJsonSchema = z.object({
  type: z.literal('service_account'),
  project_id: z.string().min(1, 'project_id saknas i JSON.'),
  private_key: z.string().min(1, 'private_key saknas i JSON.'),
  client_email: z.string().email('client_email är ogiltig i JSON.'),
}).passthrough(); // VIKTIGT: Ignorerar alla andra fält som kan finnas i JSON-objektet.

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID får inte vara tom.'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET får inte vara tom.'),
  NEXTAUTH_SECRET: z.string().min(10, 'NEXTAUTH_SECRET måste vara minst 10 tecken lång.'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL måste vara en giltig URL.'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY får inte vara tom.'),
  UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL måste vara en giltig URL.'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN får inte vara tom.'),

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

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    '❌ Ogiltiga eller saknade miljövariabler:',
    parsedEnv.error.flatten().fieldErrors,
  );
  throw new Error('Servern kan inte starta på grund av ogiltig konfiguration.');
}

export const env = parsedEnv.data;
