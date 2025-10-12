
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import * as admin from 'firebase-admin';

// =================================================================================
// GULDSTANDARD - NEXTAUTH OPTIONS V8.0 (SESSION SOM SANNINSKÄLLA)
// REVIDERING:
// 1. KONSOLIDERAD LOGIK: Firebase Admin SDK-initialiseringen har flyttats hit från
//    ett separat bibliotek för att samla all kritisk autentiseringslogik på ett
//    ställe, i enlighet med bästa praxis för Next.js App Router.
// 2. OMFATTANDE REFAKTORERING AV `session` CALLBACK: Gör sessionen till den enda källan
//    till sanning (Single Source of Truth) för användarens status.
// 3. HÄMTAR DATA FRÅN FIRESTORE: `session` hämtar nu `onboardingComplete` och `tourCompleted`
//    direkt från Firestore-dokumentet vid varje sessionsladdning.
// 4. HÄRLEDD `isNewUser`: `isNewUser`-flaggan är inte längre ett fält i databasen, utan
//    härleds i realtid baserat på `onboardingComplete`. `isNewUser = !onboardingComplete`.
//    Detta eliminerar risken för osynkroniserad data mellan databasen och sessionen.
// =================================================================================

// Initiera Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\n/g, '
'),
        })
    });
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
