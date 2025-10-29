// =================================================================================
// CENTRALT LOGGNINGSVERKTYG
// =================================================================================
// Denna fil tillhandahåller en standardiserad logger för hela applikationen.
// Genom att centralisera loggningen kan vi enkelt styra format och destination
// för all loggdata (t.ex. konsol, extern tjänst etc.)
// =================================================================================

// Basic implementation, kan expanderas med externa logging-bibliotek (pino, winston) i framtiden.

const formatMessage = (level: string, message: any) => {
  const timestamp = new Date().toISOString();
  // Om meddelandet är ett objekt, serialisera det snyggt
  const formattedMessage = typeof message === 'object' && message !== null
    ? JSON.stringify(message, null, 2)
    : message;
  return `${timestamp} [${level.toUpperCase()}] - ${formattedMessage}`;
};

export const logger = {
  info: (message: any) => {
    console.log(formatMessage('info', message));
  },
  warn: (message: any) => {
    console.warn(formatMessage('warn', message));
  },
  error: (message: any) => {
    console.error(formatMessage('error', message));
  },
};
