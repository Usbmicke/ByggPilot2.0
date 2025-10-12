
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Importera från den nya delade filen

// All Firebase Admin-initialisering finns nu i lib/admin.ts och behöver inte vara här.
// Detta håller API-routen ren och fokuserad.

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
