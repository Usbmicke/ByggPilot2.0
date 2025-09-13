
import NextAuth, { NextAuthOptions, DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/app/services/firestoreService'; // Importerar ADMIN db instance
import { FieldValue } from 'firebase-admin/firestore'; // Importerar ADMIN FieldValue

// Deklarerar egna fält för Session och JWT
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user, account }) {
      // Vid första inloggningen, synka med Firestore
      if (account && user) {
        try {
          if (!user.email) {
            throw new Error("Email not returned from Google. Cannot sign in.");
          }

          // ANVÄNDER FIREBASE ADMIN SDK SYNTAX
          const usersRef = db.collection('users');
          const q = usersRef.where('email', '==', user.email);
          const querySnapshot = await q.get();
          
          let internalUserId: string;

          if (querySnapshot.empty) {
            // Användare finns inte, skapa den med Admin SDK
            const newUserDoc = {
              email: user.email,
              name: user.name || 'Anonymous',
              image: user.image || null,
              createdAt: FieldValue.serverTimestamp(), // ADMIN SDK server timestamp
            };
            const newUserRef = await usersRef.add(newUserDoc);
            internalUserId = newUserRef.id;
          } else {
            // Användare finns, hämta ID
            internalUserId = querySnapshot.docs[0].id;
          }
          
          // Bifoga det interna IDt och access token till JWT
          token.id = internalUserId;
          token.accessToken = account.access_token;

        } catch (error) {
          console.error("Auth.ts: Error in JWT callback while syncing with Firestore:", error);
          throw new Error("Failed to sync user with database.");
        }
      }
      return token;
    },

    async session({ session, token }) {
      // Gör värden från token tillgängliga i sessionen
      if (token.id && session.user) {
        session.user.id = token.id;
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
