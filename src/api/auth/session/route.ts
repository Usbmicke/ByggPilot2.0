import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { initializeAdminApp } from "@/lib/config/firebase-admin";

// Detta är en Route Handler för att skapa en session-cookie efter inloggning.
export async function POST(request: NextRequest) {
  const reqBody = await request.json();
  const idToken = reqBody.idToken;

  if (!idToken) {
    return NextResponse.json(
      { error: "ID token is required" },
      { status: 400 }
    );
  }

  try {
    const { auth } = initializeAdminApp();
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 dagar i millisekunder

    const decodedToken = await auth.verifyIdToken(idToken);
    const isUserNew = (decodedToken as any).isNewUser || false;

    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    // Gör cookien flexibel: säker i produktion, osäker i utveckling.
    const isProduction = process.env.NODE_ENV === 'production';

    cookies().set("__session", sessionCookie, {
      maxAge: expiresIn / 1000, // maxAge är i sekunder
      httpOnly: true,
      secure: isProduction, // Endast säker i produktion!
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ success: true, isNewUser: isUserNew });
  } catch (error: any) {
    console.error("Error creating session cookie:", error);
    return NextResponse.json(
      { error: "Failed to create session cookie", details: error.message },
      { status: 500 }
    );
  }
}
