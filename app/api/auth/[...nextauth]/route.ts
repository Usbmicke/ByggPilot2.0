import NextAuth, { NextAuthOptions, DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/app/services/firestoreService';
import { FieldValue } from 'firebase-admin/firestore';

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
      if (account && user) {
        try {
          if (!user.email) {
            throw new Error("Email not returned from Google. Cannot sign in.");
          }
          const usersRef = db.collection('users');
          const q = usersRef.where('email', '==', user.email);
          const querySnapshot = await q.get();
          let internalUserId: string;
          if (querySnapshot.empty) {
            const newUserDoc = {
              email: user.email,
              name: user.name || 'Anonymous',
              image: user.image || null,
              createdAt: FieldValue.serverTimestamp(),
            };
            const newUserRef = await usersRef.add(newUserDoc);
            internalUserId = newUserRef.id;
          } else {
            internalUserId = querySnapshot.docs[0].id;
          }
          token.id = internalUserId;
          token.accessToken = account.access_token;
        } catch (error) {
          console.error("[AUTH_ROUTE] Error in JWT callback:", error);
          throw new Error("Failed to sync user with database.");
        }
      }
      return token;
    },
    async session({ session, token }) {
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
