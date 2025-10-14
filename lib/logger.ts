
import pino from 'pino';

// =================================================================================
// LOGGER V1.0 - SYSTEMETS SVARTA LÅDA
// ARKITEKTUR: En centraliserad, miljömedveten logger.
// 1. **Miljöanpassning:** Upptäcker om systemet körs i produktions- eller
//    utvecklingsläge (`process.env.NODE_ENV`).
// 2. **Utvecklingsläge:** Använder `pino-pretty` för att formatera loggar i en
//    lättläst, färgad textvy direkt i terminalen. Detta optimerar för
//    utvecklarupplevelsen.
// 3. **Produktionsläge:** Skriver råa JSON-objekt. Detta är optimalt för maskinell
//    bearbetning, intag i logghanteringssystem (som Google Cloud Logging, 
//    Datadog, etc.) och automatiserad analys.
// =================================================================================

const logger = pino({
  level: process.env.PINO_LOG_LEVEL || 'info', // Sätt standardnivå till 'info'
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,    // Gör det snyggt
      levelFirst: true,  // Visa loggnivån först
      translateTime: 'SYS:standard' // Mänskligt läsbart datum
    }
  } : undefined, // I produktion, använd standard (JSON)
});

export default logger;
