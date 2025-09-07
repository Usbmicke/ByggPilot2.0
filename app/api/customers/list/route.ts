
import { NextResponse } from 'next/server';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/app/services/firestoreService';
import { Customer } from '@/app/types';

export async function GET() {
  try {
    const customersCollection = collection(db, 'customers');
    const q = await getDocs(query(customersCollection, orderBy('createdAt', 'desc')));

    const customers: Customer[] = q.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            // Konvertera Firestore Timestamp till ISO-sträng
            createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        };
    });

    return NextResponse.json(customers);

  } catch (error) {
     console.error("Error fetching customers: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}`}), { status: 500 });
  }
}
