
import { NextResponse } from 'next/server';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/app/services/firestoreService';
import { Project } from '@/app/types';

export async function GET(request: Request) {
  try {
    const querySnapshot = await getDocs(collection(db, "projects"));
    const projects: Project[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      projects.push({
        id: doc.id,
        name: data.name,
        customerName: data.customerName,
        status: data.status,
        lastActivity: data.lastActivity,
        createdAt: data.createdAt?.toDate().toISOString(), // Konvertera Timestamp till ISO-sträng
      });
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects: ", error);
    // Se till att error är ett Error-objekt för att kunna komma åt message-propertyn
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(`Internal Server Error: ${errorMessage}`, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, customerName, status } = body;

    if (!name || !customerName || !status) {
      return new NextResponse(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }

    const docRef = await addDoc(collection(db, "projects"), {
      name,
      customerName,
      status,
      lastActivity: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    const newProject: Project = {
        id: docRef.id,
        name,
        customerName,
        status,
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };

    return NextResponse.json(newProject, { status: 201 });

  } catch (error) {
    console.error("Error creating project: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}`}), { status: 500 });
  }
}
