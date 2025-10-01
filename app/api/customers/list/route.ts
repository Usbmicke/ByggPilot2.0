
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/app/services/firestoreService'; // KORREKT SÖKVÄG
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Customer } from '@/app/types';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.uid) {
    return NextResponse.json({ error: 'Användaren är inte autentiserad.' }, { status: 401 });
  }

  try {
    const customersRef = collection(db, 'users', session.user.uid, 'customers');
    const q = query(customersRef);
    const querySnapshot = await getDocs(q);

    const customers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Customer[];

    return NextResponse.json({ customers });

  } catch (error) {
    console.error("Fel vid hämtning av kunder från Firestore: ", error);
    return NextResponse.json({ error: 'Internt serverfel' }, { status: 500 });
  }
}
