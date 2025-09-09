
import { NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/app/services/firestoreService';
import { Customer } from '@/app/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Destrukturera isCompany tillsammans med de andra fälten
    const { name, email, phone, isCompany } = body;

    // Validering: Endast namn är ett absolut krav.
    if (!name) {
      return new NextResponse(JSON.stringify({ message: 'Name is required' }), { status: 400 });
    }

    // Lägg till det nya fältet i objektet som sparas i Firestore
    const docRef = await addDoc(collection(db, "customers"), {
      name,
      email,
      phone,
      isCompany: isCompany || false, // Sätt till false om det inte är definierat
      createdAt: serverTimestamp(),
    });

    // Inkludera det nya fältet i det returnerade objektet
    const newCustomer: Partial<Customer> = {
        id: docRef.id,
        name,
        email,
        phone,
        isCompany: isCompany || false,
    };

    return NextResponse.json(newCustomer, { status: 201 });

  } catch (error) {
    console.error("Error creating customer: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}`}), { status: 500 });
  }
}
