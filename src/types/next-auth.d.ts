
import 'next-auth';

declare module 'next-auth' {
  /**
   * Utökar Session-interfacet för att inkludera vårt anpassade användar-ID.
   * Detta ID kommer från Firestore-dokumentet och läggs till i JWT-token.
   */
  interface Session {
    user: {
      /** Användarens unika Firestore-dokument-ID. */
      id: string;
    } & DefaultSession['user'];
  }
}
