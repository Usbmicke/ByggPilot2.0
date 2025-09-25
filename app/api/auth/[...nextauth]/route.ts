
import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
// KORREKT IMPORT: Importerar BÅDE admin-objektet och firestoreAdmin-instansen.
import { admin, firestoreAdmin } from '@/app/lib/firebase-admin';
// FELAKTIG IMPORT BORTTAGEN: Raden 'import { ... } from 'firebase/firestore/lite';' är helt borttagen.

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
          scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/gmail.modify',
          ].join(' '),
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ profile }) {
      if (!profile?.email) {
        return '/auth/error?error=EmailRequired';
      }

      try {
        // KORREKT SYNTAX (Admin SDK): Använder .collection() och .where() direkt på firestoreAdmin-objektet.
        const usersRef = firestoreAdmin.collection('users');
        const querySnapshot = await usersRef.where('email', '==', profile.email).get();

        if (querySnapshot.empty) {
          console.log(`[Auth Success] Ny användare: ${profile.email}. Skapar dokument.`);
          // KORREKT SYNTAX (Admin SDK): Använder .add() för att skapa dokument.
          await usersRef.add({
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            // KORREKT SYNTAX (Admin SDK): Hämtar server-tidsstämpel från admin-objektet.
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        return true;
      } catch (error) {
        console.error("[Auth Critical Failure] Databasfel vid signIn: ", error);
        return '/auth/error?error=DatabaseError';
      }
    },

    async jwt({ token, profile }) {
      if (!profile?.email) {
        return token;
      }
      // KORREKT SYNTAX (Admin SDK)
      const usersRef = firestoreAdmin.collection('users');
      const querySnapshot = await usersRef.where('email', '==', profile.email).get();

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        token.sub = userDoc.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },

  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
