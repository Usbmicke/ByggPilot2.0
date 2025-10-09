
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { adminDb } from '@/lib/admin';
import { Customer } from '@/app/types';

export async function GET() {
  const session = await getServerSession(authOptions);

  // Guldstandard: Använd session.user.id som kommer från vår [...nextauth] callback
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Användaren är inte autentiserad.' }, { status: 401 });
  }

  try {
    // Använd Admin SDK för att hämta data, vilket är korrekt för en API-route
    const customersRef = adminDb.collection('users').doc(session.user.id).collection('customers');
    const querySnapshot = await customersRef.get();

    const customers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Customer[];

    return NextResponse.json({ customers });

  } catch (error) {
    console.error("Fel vid hämtning av kunder från Firestore (Admin SDK): ", error);
    return NextResponse.json({ error: 'Internt serverfel' }, { status: 500 });
  }
}
