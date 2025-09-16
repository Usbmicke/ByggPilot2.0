
// Fil: app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { FirestoreAdapter } from "@auth/firebase-adapter"
import { firestore } from "@/app/firebase" 

const handler = NextAuth({
  adapter: FirestoreAdapter(firestore),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      
      // ==== FÖRBÄTTRAD AUTHORIZATION FÖR ATT ALLTID VISA SAMTYCKE ====
      authorization: {
        params: {
          // "consent" ber om samtycke.
          // "select_account" tvingar användaren att välja ett Google-konto.
          // Kombinationen löser problemet där Google auto-väljer ett konto utan att fråga igen.
          prompt: "consent select_account",
          access_type: "offline",
          response_type: "code",
          scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive"
        }
      }
    }),
  ],
  
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
        if (account.refresh_token) {
          token.refreshToken = account.refresh_token;
        }
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },

  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
