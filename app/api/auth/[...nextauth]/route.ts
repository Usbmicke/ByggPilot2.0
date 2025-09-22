// Fil: app/api/auth/[...nextauth]/route.ts
import NextAuth, { Session } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { FirestoreAdapter } from "@next-auth/firebase-adapter"
import { getFirestoreAdmin } from "@/app/lib/firebase-admin"


const handler = NextAuth({
  adapter: FirestoreAdapter(getFirestoreAdmin()),

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

  callbacks: {
    // --- DIAGNOSTISK CALLBACK ---
    // Denna funktion körs efter att Google svarat, men innan en session skapas.
    async signIn({ user, account, profile, email, credentials }) {
      console.log('--- signIn Callback Start ---');
      console.log('User:', JSON.stringify(user, null, 2));
      console.log('Account:', JSON.stringify(account, null, 2));
      console.log('Profile:', JSON.stringify(profile, null, 2));
      console.log('--- signIn Callback Slut ---');
      // Vi tillåter alltid inloggning för nu, syftet är att logga.
      return true;
    },
    async session({ session, user }) {
        session.user.id = user.id;
        return session;
    }
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
