
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { userRepo } from '@/genkit/dal/user.repo';

// GULDSTANDARD: Anpassade callbacks för full kontroll

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // Steg 1: Körs när en användare loggar in
    async signIn({ user, account, profile }) {
      if (!user.email || !user.id) {
        console.error("Auth-signIn: Saknar email eller id från provider.");
        return false;
      }
      // Anropa vår DAL för att säkerställa att användaren finns i Firestore
      await userRepo.findOrCreate(user.id, user.email);
      return true;
    },

    // Steg 2: Körs efter signIn, skapar JWT-token
    async jwt({ token, user, profile }) {
      if (user?.id) {
        // Hämta hela profilen från vår databas för att få färsk data
        const dbUser = await userRepo.get(user.id);
        if (dbUser) {
          token.uid = dbUser.uid; // Lägg till Firestore UID i token
          token.onboardingCompleted = dbUser.onboardingCompleted;
        }
      }
      return token;
    },

    // Steg 3: Skapar sessionsobjektet som är tillgängligt på klienten
    async session({ session, token }) {
      if (session.user) {
        session.user.uid = token.uid as string;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
      }
      return session;
    },
  },
  // Använd inte databasadapter, vi sköter allt manuellt via callbacks
  adapter: undefined, 
  session: {
    strategy: 'jwt',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
