
// Fil: app/api/auth/[...nextauth]/route.ts
import NextAuth, { Session, User } from "next-auth"
import { JWT } from "next-auth/jwt"
import GoogleProvider from "next-auth/providers/google"
import { FirestoreAdapter } from "@next-auth/firebase-adapter"
import { firestoreAdmin } from "@/app/lib/firebase-admin"

console.log("--- NextAuth route handler loaded ---");

const handler = NextAuth({
  adapter: FirestoreAdapter(firestoreAdmin),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/drive.file',
        },
      },
    }),
  ],
  
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, account, isNewUser }) {
      // --- DEBUGGING LOGS ---
      console.log("--- JWT Callback Triggered ---");
      console.log("isNewUser:", isNewUser);
      console.log("Account object:", JSON.stringify(account, null, 2));
      console.log("User object:", JSON.stringify(user, null, 2));
      console.log("Initial Token:", JSON.stringify(token, null, 2));
      // --- END DEBUGGING LOGS ---

      // This is the condition for the first sign-in
      if (account && user) {
        console.log("JWT: Account and User found, processing for the first time or re-authentication.");
        
        // The user object from the adapter should have the id.
        if (!user.id) {
            console.error("FATAL: User object from adapter is missing 'id'. This is unexpected.");
            // Throwing an error here will cause the generic "Try signing in with a different account" page.
            throw new Error("User ID not found after adapter processing.");
        }

        token.id = user.id;
        token.accessToken = account.access_token;
        if (account.refresh_token) {
          token.refreshToken = account.refresh_token;
        }
        
        console.log("JWT: Token after processing:", JSON.stringify(token, null, 2));
      }
      
      console.log("--- JWT Callback Finished ---");
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      // --- DEBUGGING LOGS ---
      console.log("--- Session Callback Triggered ---");
      console.log("Token received in session callback:", JSON.stringify(token, null, 2));
      console.log("Initial Session object:", JSON.stringify(session, null, 2));
      // --- END DEBUGGING LOGS ---

      if (token && session.user) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        console.log("Session: User ID and tokens attached to session object.");
      } else {
        console.log("Session: Token or session.user not found, skipping attachment.");
      }

      console.log("Session: Final session object:", JSON.stringify(session, null, 2));
      console.log("--- Session Callback Finished ---");
      return session;
    }
  },

  debug: true, // Enable NextAuth debug messages in the console

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
