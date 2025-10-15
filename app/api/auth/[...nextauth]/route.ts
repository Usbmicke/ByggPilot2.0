import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

// =================================================================================
// API ROUTE V11.0 (KORREKT ARKITEKTUR FÖR NEXT-AUTH V4)
// ARKITEKTUR: Denna fil följer nu det korrekta mönstret för Next.js App Router
// med Next-Auth v4.
//
// LÖSNING: Istället för att felaktigt försöka destrukturera ett `handlers`-objekt
// (som hör till Auth.js v5), anropar vi `NextAuth` direkt med `authOptions` och
// exporterar den resulterande handler-funktionen som både GET och POST. Detta
// löser TypeError-felet.
// =================================================================================

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
