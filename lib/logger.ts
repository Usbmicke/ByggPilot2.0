
/**
 * @file Detta är applikationens strukturerade logger.
 * ALL loggning (förutom temporär debuggning) SKA ske via funktioner i denna fil.
 * Detta säkerställer att loggarna är i ett konsekvent, maskinläsbart JSON-format.
 * 
 * Guldstandard: Strukturerad och sökbar loggning.
 */

enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: any; // Tillåt ytterligare kontextuell data
}

const log = (level: LogLevel, message: string, context: object = {}) => {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context
  };
  
  // Skriv till konsolen som en JSON-sträng
  // I en produktionsmiljö skulle detta skickas till en loggtjänst
  switch (level) {
    case LogLevel.INFO:
      console.log(JSON.stringify(entry));
      break;
    case LogLevel.WARN:
      console.warn(JSON.stringify(entry));
      break;
    case LogLevel.ERROR:
      console.error(JSON.stringify(entry));
      break;
  }
};

export const logger = {
  info: (message: string, context?: object) => log(LogLevel.INFO, message, context),
  warn: (message: string, context?: object) => log(LogLevel.WARN, message, context),
  // För error, acceptera ett Error-objekt för att få med stack trace
  error: (context: { message: string, error?: any, [key: string]: any }) => {
    const { message, error, ...rest } = context;
    const errorInfo: any = { ...rest };
    if (error instanceof Error) {
      errorInfo.errorMessage = error.message;
      errorInfo.stack = error.stack;
    }
    log(LogLevel.ERROR, message, errorInfo);
  }
};
