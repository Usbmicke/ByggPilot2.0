
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Denna konfiguration definierar vilka scopes (behörigheter) vi begär från användaren.
// Detta är kritiskt för att kunna utföra handlingar i deras Google Workspace senare.
const GOOGLE_AUTHORIZATION_URL = 
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    prompt: "consent",
    access_type: "offline",
    response_type: "code",
    scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/drive", // Full access to Google Drive
        "https://www.googleapis.com/auth/gmail.readonly", // Read-only access to Gmail
        "https://www.googleapis.com/auth/calendar", // Read/write access to Calendar
        "https://www.googleapis.com/auth/contacts.readonly" // **NYTT** Read-only access to Contacts
    ].join(" ")
  });

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: GOOGLE_AUTHORIZATION_URL,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
    async jwt({ token, account }) {
      // Spara access_token och refresh_token i JWT:n direkt efter inloggning
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Exponera access_token till sessionen så den kan användas av klient-komponenter (om nödvändigt)
      // och av backend API-rutter.
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    },
  },
});
