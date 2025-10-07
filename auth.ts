
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createOrUpdateUser } from "@/services/userService"; // Importera funktionen från userService

// =================================================================================
// GULDSTANDARD: auth.ts
// Denna fil är den centrala konfigurationen för NextAuth.js.
// Den definierar autentiserings-providers (Google) och hanterar callbacks,
// som t.ex. att skapa eller uppdatera en användare i databasen efter lyckad inloggning.
// =================================================================================

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email || !user.name || !account?.provider) {
        // Om nödvändig information saknas, avbryt inloggningen.
        return false;
      }
      try {
        // När en användare loggar in via en provider (t.ex. Google),
        // anropa userService för att skapa eller uppdatera användaren i Firestore.
        await createOrUpdateUser({
          provider: account.provider,
          providerAccountId: user.id, // Använd user.id som är unikt för providern
          email: user.email,
          name: user.name,
          imageUrl: user.image,
        });
        return true; // Tillåt inloggning
      } catch (error) {
        console.error("Fel vid createOrUpdateUser i signIn callback:", error);
        return false; // Stoppa inloggningen vid databasfel
      }
    },
    async jwt({ token, user }) {
      // Efter inloggning, lägg till användarens unika ID (sub) i JWT-token.
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Gör användar-ID:t tillgängligt i session-objektet som används på klientsidan och i API-routes.
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  // Valfritt: Om du behöver anpassade sidor för inloggning, fel etc.
  // pages: {
  //   signIn: '/auth/signin',
  // },
});
