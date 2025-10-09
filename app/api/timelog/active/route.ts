
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { firestoreAdmin as firestore } from '@/lib/admin';

// GET: Hämta den för närvarande aktiva timern för en användare
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const runningTimerQuery = await firestore.collection('timelogs')
      .where('userId', '==', userId)
      .where('status', '==', 'running')
      .limit(1)
      .get();

    if (runningTimerQuery.isEmpty) {
      // Helt normalt, ingen timer är igång. Returnera null.
      return NextResponse.json({ activeTimer: null });
    }

    const timerDoc = runningTimerQuery.docs[0];
    const timerData = timerDoc.data();

    const activeTimer = {
      logId: timerDoc.id,
      projectId: timerData.projectId,
      startTime: timerData.startTime.toMillis(), // Skicka som millisekunder
    };

    return NextResponse.json({ activeTimer });

  } catch (error) {
    console.error("Error fetching active timelog:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
