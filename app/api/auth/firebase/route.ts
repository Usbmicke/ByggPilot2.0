
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { admin } from "@/lib/admin";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        console.error("[Firebase Token API] Authorization Error: No NextAuth session found.");
        return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const uid = session.user.id;

    try {
        const customToken = await admin.auth().createCustomToken(uid);
        console.log(`[Firebase Token API] Successfully created custom token for UID: ${uid}`)
        return NextResponse.json({ firebaseToken: customToken });
    } catch (error) {
        console.error(`[Firebase Token API] Error creating custom token for UID: ${uid}`, error);
        return NextResponse.json({ error: "Failed to create Firebase token" }, { status: 500 });
    }
}
