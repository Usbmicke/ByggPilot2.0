
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// =================================================================================
// VÄKTARE V1.0 - RATE LIMITER
// ARKITEKTUR: En återanvändbar rate-limiter som kan skydda vilken endpoint som helst.
// 1. **Redis-anslutning:** Ansluter till Upstash Redis med hjälp av miljövariabler.
//    Detta är ett blixtsnabbt, externt minne för att spåra anrop.
// 2. **Algoritm:** Använder "Sliding Window"-algoritmen. Detta är en robust metod
//    som räknar anrop inom ett glidande tidsfönster (60 sekunder) istället för
//    fasta block, vilket ger en mer rättvis och exakt begränsning.
// 3. **Konfiguration:** Centralt definierad regel (10 anrop / 60 sekunder) som
//    lätt kan justeras och återanvändas i hela applikationen.
// =================================================================================

// VIKTIGT: Du måste skapa en .env.local-fil och lägga till dessa värden
// från din Upstash-databas: https://console.upstash.com/redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Skapa en ny rate-limiter som tillåter 10 anrop per 60 sekunder.
export const rateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true, // Möjliggör insikter i Upstash-konsolen
  prefix: "@ratelimit", // Globalt prefix för alla nycklar
});
