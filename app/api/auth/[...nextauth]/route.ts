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
    async session({ session, user }) {
        session.user.id = user.id;
        return session;
    }
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
