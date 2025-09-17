
// Fil: app/api/auth/[...nextauth]/route.ts
import NextAuth, { Session, User } from "next-auth"
import { JWT } from "next-auth/jwt"
import GoogleProvider from "next-auth/providers/google"
import { FirestoreAdapter } from "@next-auth/firebase-adapter"
import { collection, getDocs, where, query, addDoc, limit } from "firebase/firestore";

// === SLUTGILTIG LÖSNING ===
// Importerar från den ENDA, auktoritativa källan för Firebase Admin.
// Detta säkerställer att alla delar av koden (Adapter, callbacks) använder samma databasanslutning.
import { firestoreAdmin } from "@/app/lib/firebase-admin"

const handler = NextAuth({
  adapter: FirestoreAdapter(firestoreAdmin),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        const usersRef = collection(firestoreAdmin, "users");
        const q = query(usersRef, where("email", "==", user.email), limit(1));
        const userQuerySnap = await getDocs(q);

        let userId: string;

        if (!userQuerySnap.empty) {
          // Användaren finns redan.
          userId = userQuerySnap.docs[0].id;
        } else {
          // FirestoreAdapter bör ha skapat användaren. Vi hämtar den.
          const newUserQuerySnap = await getDocs(q);
          if (!newUserQuerySnap.empty) {
            userId = newUserQuerySnap.docs[0].id;
          } else {
            // Nödlösning om användaren inte hittas direkt, men detta bör inte hända.
            console.error("FATAL: User not found immediately after creation by adapter.");
            // Försök inte fortsätta utan ett ID.
            return Promise.reject(new Error("User creation failed"));
          }
        }

        token.id = userId;
        token.accessToken = account.access_token;
        if (account.refresh_token) {
          token.refreshToken = account.refresh_token;
        }
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
      }
      return session;
    }
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
