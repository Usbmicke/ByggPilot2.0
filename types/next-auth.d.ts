
import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's unique ID from your database */
      id: string;
      isNewUser?: boolean;
      termsAccepted?: boolean;
      onboardingComplete?: boolean;
      companyName?: string;
    } & DefaultSession['user'];
    /** The access token for Google API calls */
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and sent to the `session` callback. */
  interface JWT {
    /** The user's unique ID from your database */
    id: string;
    isNewUser?: boolean;
    termsAccepted?: boolean;
    onboardingComplete?: boolean;
    companyName?: string;
    /** The access token for Google API calls */
    accessToken?: string;
  }
}
