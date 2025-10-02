
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { firestore } from '@/app/lib/firebase-admin';

/**
 * API-endpoint för att uppdatera en användares företagsnamn.
 * Detta är en del av onboarding-processen.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Användaren är inte autentiserad.' }, { status: 401 });
  }

  try {
    const { companyName } = await req.json();

    if (!companyName || typeof companyName !== 'string' || companyName.trim().length < 2) {
      return NextResponse.json({ message: 'Ogiltigt företagsnamn.' }, { status: 400 });
    }

    const userRef = firestore.collection('users').doc(session.user.id);

    await userRef.update({
      companyName: companyName.trim(),
    });

    return NextResponse.json({ success: true, companyName: companyName.trim() }, { status: 200 });

  } catch (error) {
    console.error("Fel vid uppdatering av företagsnamn:", error);
    return NextResponse.json({ message: 'Internt serverfel.' }, { status: 500 });
  }
}
