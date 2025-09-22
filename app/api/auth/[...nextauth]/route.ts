// Fil: app/api/auth/[...nextauth]/route.ts
import NextAuth, { Session } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { FirestoreAdapter } from "@next-auth/firebase-adapter"
import { getFirestoreAdmin } from "@/app/lib/firebase-admin"

// Denna konfiguration förutsätter att alla miljövariabler är korrekt satta
// antingen i .env.local (för lokal körning) eller i Secret Manager (för molnet)

const handler = NextAuth({
  // Adaptern som kopplar NextAuth till din Firestore-databas.
  // Den KRÄVER att FIREBASE_SERVICE_ACCOUNT_JSON är tillgänglig.
  adapter: FirestoreAdapter(getFirestoreAdmin()),

  providers: [
    GoogleProvider({
      // Dessa används för användarens inloggningsflöde.
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
    // Denna callback lägger till användarens unika ID (från databasen) i session-objektet,
    // så du kan komma åt det i din app.
    async session({ session, user }) {
        session.user.id = user.id;
        return session;
    }
  },

  // Används för att kryptera sessionen.
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
