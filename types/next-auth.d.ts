
import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// Augment the default types from next-auth to include the properties 
// we are adding to the session and user objects.

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's unique identifier. */
      id: string;
      /** Add any other custom properties you want on the user object. */
    } & DefaultSession['user'];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * available in the `jwt` and `session` callbacks.
   */
  interface User extends DefaultUser {
    id: string;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and sent to the `session` callback. */
  interface JWT {
    /** The user's unique identifier. */
    id: string;
  }
}
