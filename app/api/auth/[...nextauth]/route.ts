
// Fil: app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { FirestoreAdapter } from "@auth/firebase-adapter"
import { firestore } from "@/app/firebase" // Importera vår centrala firestore-instans

// Detta är den korrekta och enhetliga konfigurationen för NextAuth.
// Den hanterar Google-inloggning, begär refresh_token för Drive, och lagrar användardata i Firestore.

const handler = NextAuth({
  // Använd Firestore för att lagra användare, sessioner, etc.
  // Detta kopplar NextAuth till vår befintliga databas.
  adapter: FirestoreAdapter(firestore),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      
      // ==== HÄR ÄR KÄRNAN I LÖSNINGEN ====
      // Vi specificerar exakt vad vi vill ha från Google.
      // Detta tvingar fram en refresh_token vid första inloggningen.
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          // Vi begär de scopes vi behöver för Drive API.
          scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive"
        }
      }
    }),
  ],
  
  session: {
    strategy: "jwt", // Vi använder JSON Web Tokens för sessioner.
  },

  callbacks: {
    // Denna callback körs när en JWT skapas (t.ex. vid inloggning).
    // Här sparar vi den viktiga informationen i själva tokenet.
    async jwt({ token, user, account }) {
      // Vid första inloggningen efter att ha gett samtycke...
      if (account && user) {
        // ...spara access_token och refresh_token i JWT:n.
        token.accessToken = account.access_token;
        // Refresh token är KRITISK. Den sparas bara första gången.
        if (account.refresh_token) {
          token.refreshToken = account.refresh_token;
        }
        token.id = user.id;
      }
      return token;
    },

    // Denna callback körs när en session ska hämtas av klienten (t.ex. med useSession).
    // Här gör vi informationen från JWT:n tillgänglig för vår applikation.
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
