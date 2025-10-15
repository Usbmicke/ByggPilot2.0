
import pino from 'pino';

// =================================================================================
// LOGGER V1.0 - STRUKTURERAD OCH PRODUKTIONSKLAR
// ARKITEKTUR: Implementerar Pino för att skapa JSON-formaterade, sökbara loggar.
// Detta ersätter det ostrukturerade `console.log` och möjliggör effektiv 
// felsökning och övervakning i en produktionsmiljö.
// =================================================================================

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Pretty print i utvecklingsmiljö för bättre läsbarhet
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
});

export default logger;
