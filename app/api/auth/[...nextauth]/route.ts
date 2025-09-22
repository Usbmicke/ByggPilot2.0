
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// Importera den FÄRDIGA anslutningen, inte hela admin-paketet
import { firestoreAdmin } from "@/app/lib/firebase-admin"; 
import type { NextAuthOptions } from 'next-auth';
import { FieldValue } from 'firebase-admin/firestore';

// Använd den redan initierade databas-anslutningen
const db = firestoreAdmin;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!profile || !profile.email) {
        console.error('[Auth] Inloggning misslyckades: ingen profil eller e-post hittades.');
        return false;
      }

      try {
        const usersRef = db.collection('users');
        const q = usersRef.where('email', '==', profile.email);
        const querySnapshot = await q.get();

        if (querySnapshot.empty) {
          console.log(`[Auth] Ny användare: ${profile.email}. Skapar dokument i Firestore.`);
          await usersRef.add({
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        return true;
      } catch (error) {
        console.error("[Auth] Fel vid signIn callback:", error);
        return false;
      }
    },

    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const usersRef = db.collection('users');
          const q = usersRef.where('email', '==', session.user.email);
          const querySnapshot = await q.get();
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            session.user.id = userDoc.id;
          } else if (token.sub) {
            // Fallback om databasen är långsam eller användaren just skapats
            session.user.id = token.sub;
          }
        } catch (error) {
            console.error("[Auth] Fel vid hämtning av användar-ID i session:", error);
            // Behåll token.sub som en sista utväg
            if(token.sub) session.user.id = token.sub;
        }
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
