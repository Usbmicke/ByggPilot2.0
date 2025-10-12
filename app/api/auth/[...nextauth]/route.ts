
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import * as admin from 'firebase-admin';

// =================================================================================
// GULDSTANDARD - NEXTAUTH OPTIONS V9.0 (KORREKT ENV-HANTERING)
// REVIDERING:
// 1. ANPASSAD TILL .ENV.LOCAL: Initialiseringen av Firebase Admin SDK har skrivits
//    om helt för att läsa den enskilda miljövariabeln `FIREBASE_SERVICE_ACCOUNT_JSON`.
//    Detta löser grundorsaken till serverkraschen (500-felet).
// 2. ROBUST FELHANTERING: Lade till tydlig felhantering som kastar ett fel om
//    miljövariabeln saknas eller är felaktigt formaterad, vilket förhindrar
//    att applikationen startar med en trasig konfiguration.
// =================================================================================

// Initiera Firebase Admin SDK
if (!admin.apps.length) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
        throw new Error('Miljövariabeln FIREBASE_SERVICE_ACCOUNT_JSON är inte definierad. Kontrollera din .env.local fil.');
    }
    try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error("Kritiskt fel: Kunde inte parsa FIREBASE_SERVICE_ACCOUNT_JSON. Se till att det är giltig JSON.", error);
        throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON är felaktigt formaterad.");
    }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();


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
                    scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/gmail.readonly",
                },
            },
        }),
    ],
    adapter: FirestoreAdapter(adminDb),
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (account && user) {
                try {
                    await adminDb.collection("users").doc(user.id).update({
                        refreshToken: account.refresh_token,
                        accessToken: account.access_token,
                        accessTokenExpires: account.expires_at ? Date.now() + account.expires_at * 1000 : null,
                    });
                } catch (error) {
                    console.error("[Auth Callback: jwt] Fel vid sparande av tokens till Firestore:", error);
                }
                token.accessToken = account.access_token;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.id && session.user) {
                session.user.id = token.id as string;

                try {
                    const userDocRef = adminDb.collection("users").doc(token.id as string);
                    const userDoc = await userDocRef.get();

                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        
                        session.user.onboardingComplete = userData?.onboardingComplete ?? false;
                        session.user.tourCompleted = userData?.tourCompleted ?? false;
                        
                        // isNewUser är nu en härledd egenskap. Detta är den "enda källan till sanning".
                        session.user.isNewUser = !session.user.onboardingComplete;

                    } else {
                        console.warn(`[Auth Session]: Användardokument för id ${token.id} hittades inte i Firestore.`);
                        session.user.onboardingComplete = false;
                        session.user.tourCompleted = false;
                        session.user.isNewUser = true;
                    }
                } catch (error) {
                    console.error("[Auth Session]: Fel vid hämtning av användardata från Firestore:", error);
                    // Sätt säkra standardvärden vid fel
                    session.user.onboardingComplete = false;
                    session.user.tourCompleted = false;
                    session.user.isNewUser = true;
                }
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            console.log("[Auth SignIn]: Callback startad.");
            if (user.id && user.email) {
                console.log(`[Auth SignIn]: Användare ${user.id} med e-post ${user.email} identifierad.`);
                try {
                    console.log(`[Auth SignIn]: Försöker hämta authUser för UID: ${user.id}...`);
                    const authUser = await adminAuth.getUser(user.id);
                    console.log(`[Auth SignIn]: authUser hämtad. E-post i Firebase Auth: '${authUser.email}'. E-post från Google: '${user.email}'.`);

                    if (authUser.email !== user.email) {
                        console.log(`[Auth SignIn]: E-post skiljer sig. Försöker uppdatera...`);
                        await adminAuth.updateUser(user.id, {
                            email: user.email,
                            displayName: user.name,
                        });
                        console.log(`[Auth SignIn]: Firebase Auth-användare ${user.id} har uppdaterats med e-post ${user.email}.`);
                    } else {
                        console.log("[Auth SignIn]: E-post är redan synkroniserad. Ingen uppdatering behövs.");
                    }
                } catch (error: any) {
                    if (error.code === 'auth/user-not-found') {
                        console.log(`[Auth SignIn]: Användaren ${user.id} hittades inte i Firebase Auth. Försöker skapa användare...`);
                        await adminAuth.createUser({
                            uid: user.id,
                            email: user.email,
                            displayName: user.name,
                        });
                        console.log(`[Auth SignIn]: Ny Firebase Auth-användare ${user.id} skapad med e-post ${user.email}.`);
                    } else {
                        console.error("[Auth SignIn]: Ett oväntat fel inträffade vid hantering av Auth-användare:", error);
                    }
                }
            } else {
                console.log("[Auth SignIn]: Antingen user.id eller user.email saknas. Avbryter synkronisering.", { userId: user.id, email: user.email });
            }
            return true;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
