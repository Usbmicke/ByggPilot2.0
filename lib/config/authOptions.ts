
import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { FirestoreAdapter } from "@next-auth/firebase-adapter"
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { logger } from '@/lib/logger';

const adapter = FirestoreAdapter(firestoreAdmin);

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/tasks',
        },
      },
    }),
  ],
  adapter: adapter,
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign-in
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.id = user.id;
        // Persist all user properties from the database to the token
        const dbUser = await adapter.getUser(user.id);
        if (dbUser) {
            token.companyName = dbUser.companyName;
            token.onboardingComplete = dbUser.onboardingComplete;
            token.driveRootFolderId = dbUser.driveRootFolderId;
            token.driveRootFolderUrl = dbUser.driveRootFolderUrl;
        }
        return token;
      }

      // Subsequent requests, refresh the token with the latest data from the DB
      // This is the crucial part that solves the redirect loop
      if (token.id) {
        const dbUser = await adapter.getUser(token.id as string);
        if (dbUser) {
            token.companyName = dbUser.companyName;
            token.onboardingComplete = dbUser.onboardingComplete; // KORRIGERING: Typo fixad här
            token.driveRootFolderId = dbUser.driveRootFolderId;
            token.driveRootFolderUrl = dbUser.driveRootFolderUrl;
        } else {
          // If user is not found in DB, something is wrong, invalidate the session.
          logger.warn(`User with token ID ${token.id} not found in DB during JWT refresh.`);
          return { ...token, error: "UserNotFound" };
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // Pass all properties from the JWT token to the session object
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;

      if (session.user) {
        session.user.id = token.id as string;
        session.user.companyName = token.companyName as string | undefined;
        session.user.onboardingComplete = token.onboardingComplete as boolean | undefined;
        session.user.driveRootFolderId = token.driveRootFolderId as string | undefined;
        session.user.driveRootFolderUrl = token.driveRootFolderUrl as string | undefined;
      }
      
      // Handle error case
      if (token.error) {
        session.error = token.error as string;
      }

      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
