
import NextAuth, { DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { firestoreAdmin } from "@/app/lib/firebase-admin"; 
import type { NextAuthOptions } from 'next-auth';
import { FieldValue } from 'firebase-admin/firestore';

// TYPUTÖKNING FÖR NEXT-AUTH
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      termsAcknowledged: boolean;
    } & DefaultSession['user'];
  }
}

const db = firestoreAdmin;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          // **KORRIGERING AV SCOPES FÖR TRANSPARENS**
          // Vi begär nu direkt den behörighet som krävs för att skapa mappar i Drive.
          // Detta gör det tydligare för användaren från start.
          scope: [
            'openid',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/drive.file', // ÄNDRAD från drive.readonly
            'https://www.googleapis.com/auth/calendar.readonly'
          ].join(' ')
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!profile || !profile.email) {
        console.error('[Auth Critical] Inloggningsförsök blockerat. Profil eller e-post saknas från Google Provider.');
        return false; 
      }

      try {
        const usersRef = db.collection('users');
        const q = usersRef.where('email', '==', profile.email);
        const querySnapshot = await q.get();

        if (querySnapshot.empty) {
          console.log(`[Auth] Ny användare: ${profile.email}. Skapar dokument i Firestore.`);
          // Sätt en flagga för att markera att detta är en ny användare
          await usersRef.add({
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            termsAcknowledged: false, // Explicit satt för nya användare
            isNewUser: true // **NYTT FÄLT** för att hjälpa frontend att trigga onboarding
          });
        } else {
          // För befintliga användare, se till att isNewUser är borta eller satt till false
          const userDoc = querySnapshot.docs[0];
          if (userDoc.data().isNewUser) {
            await userDoc.ref.update({ isNewUser: false });
          }
        }

        return true;
      } catch (error) {
        console.error("[Auth] Kritiskt fel i signIn callback:", error);
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
            const userData = userDoc.data();
            session.user.id = userDoc.id;
            session.user.termsAcknowledged = userData.termsAcknowledged ?? false;
            // Skicka med den nya flaggan till klienten
            // @ts-ignore - Utökar session-objektet temporärt
            session.user.isNewUser = userData.isNewUser ?? false;

          } else if (token.sub) {
            session.user.id = token.sub;
            session.user.termsAcknowledged = false;
          }
        } catch (error) {
            console.error("[Auth] Fel vid hämtning av användardata i session:", error);
            if(token.sub) session.user.id = token.sub;
            session.user.termsAcknowledged = false; // Säkert standardvärde
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
