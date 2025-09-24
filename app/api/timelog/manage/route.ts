
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { firestore } from '@/app/lib/firebase/firestore';
import { Timestamp } from 'firebase-admin/firestore';

// Interface för en tidslogg
interface TimeLog {
  userId: string;
  projectId: string;
  startTime: Timestamp;
  endTime: Timestamp | null;
  status: 'running' | 'stopped';
}

// POST: Starta en ny timer
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { projectId } = await req.json();
  if (!projectId) {
    return NextResponse.json({ error: 'ProjectId is required' }, { status: 400 });
  }

  try {
    // Kontrollera om det redan finns en aktiv timer för denna användare
    const runningTimers = await firestore.collection('timelogs')
      .where('userId', '==', userId)
      .where('status', '==', 'running')
      .get();

    if (!runningTimers.isEmpty) {
        // Stoppa alla befintliga timers innan en ny startas för att undvika dubbletter
        const batch = firestore.batch();
        runningTimers.docs.forEach(doc => {
            batch.update(doc.ref, { status: 'stopped', endTime: Timestamp.now() });
        });
        await batch.commit();
    }

    // Skapa den nya tidsloggen
    const newLog: TimeLog = {
      userId,
      projectId,
      startTime: Timestamp.now(),
      endTime: null,
      status: 'running',
    };

    const docRef = await firestore.collection('timelogs').add(newLog);
    
    return NextResponse.json({ success: true, logId: docRef.id, startTime: newLog.startTime.toMillis() });

  } catch (error) {
    console.error("Error starting timelog:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Stoppa en pågående timer
export async function PUT(req: NextRequest) {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const runningTimerQuery = await firestore.collection('timelogs')
            .where('userId', '==', userId)
            .where('status', '==', 'running')
            .limit(1)
            .get();

        if (runningTimerQuery.isEmpty) {
            return NextResponse.json({ error: 'No running timer found to stop.' }, { status: 404 });
        }

        const timerDoc = runningTimerQuery.docs[0];
        const endTime = Timestamp.now();

        await timerDoc.ref.update({
            endTime: endTime,
            status: 'stopped'
        });

        return NextResponse.json({ success: true, logId: timerDoc.id, endTime: endTime.toMillis() });

    } catch (error) {
        console.error("Error stopping timelog:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
