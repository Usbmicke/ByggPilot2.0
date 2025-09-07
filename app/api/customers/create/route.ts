
import { NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/app/services/firestoreService';
import { Customer } from '@/app/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    if (!name || !email) {
      return new NextResponse(JSON.stringify({ message: 'Name and email are required' }), { status: 400 });
    }

    const docRef = await addDoc(collection(db, "customers"), {
      name,
      email,
      phone,
      createdAt: serverTimestamp(),
    });

    const newCustomer: Customer = {
        id: docRef.id,
        name,
        email,
        phone,
        createdAt: new Date().toISOString()
    };

    return NextResponse.json(newCustomer, { status: 201 });

  } catch (error) {
    console.error("Error creating customer: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}`}), { status: 500 });
  }
}
