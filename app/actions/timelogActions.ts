
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Hämtar den för närvarande aktiva timern för en användare.
 */
export async function getActiveTimer() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.id;

    try {
        const timelogsRef = firestoreAdmin.collection('users').doc(userId).collection('timelogs');
        const q = timelogsRef.where('status', '==', 'running').limit(1);
        const querySnapshot = await q.get();

        if (querySnapshot.empty) {
            return { success: true, data: null };
        }

        const timerDoc = querySnapshot.docs[0];
        const timerData = timerDoc.data();

        const activeTimer = {
            logId: timerDoc.id,
            projectId: timerData.projectId,
            startTime: timerData.startTime.toMillis(),
        };

        return { success: true, data: activeTimer };

    } catch (error) {
        console.error('Fel vid hämtning av aktiv timer:', error);
        return { success: false, error: 'Ett serverfel uppstod.' };
    }
}

/**
 * Startar en ny timer för ett projekt, och stoppar eventuella andra aktiva timers.
 */
export async function startTimer(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.id;

    try {
        const timelogsRef = firestoreAdmin.collection('users').doc(userId).collection('timelogs');
        const batch = firestoreAdmin.batch();

        // Stoppa först alla befintliga timers
        const runningTimersQuery = timelogsRef.where('status', '==', 'running');
        const runningTimersSnapshot = await runningTimersQuery.get();
        runningTimersSnapshot.forEach(doc => {
            batch.update(doc.ref, { status: 'stopped', endTime: FieldValue.serverTimestamp() });
        });

        // Skapa den nya timern
        const newLogRef = timelogsRef.doc(); // Skapa en referens med unikt ID
        const newLogData = {
            projectId,
            status: 'running',
            startTime: FieldValue.serverTimestamp(),
            endTime: null,
            userId: userId, 
        };
        batch.set(newLogRef, newLogData);

        await batch.commit();
        
        // Hämta starttiden för att returnera (kräver ett nytt anrop)
        const newLogSnapshot = await newLogRef.get();
        const createdTime = newLogSnapshot.data()?.startTime.toMillis();

        return { success: true, data: { logId: newLogRef.id, startTime: createdTime } };

    } catch (error) {
        console.error('Fel vid start av timer:', error);
        return { success: false, error: 'Ett serverfel uppstod.' };
    }
}

/**
 * Stoppar den nuvarande aktiva timern.
 */
export async function stopTimer() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.id;

    try {
        const timelogsRef = firestoreAdmin.collection('users').doc(userId).collection('timelogs');
        const q = timelogsRef.where('status', '==', 'running').limit(1);
        const querySnapshot = await q.get();

        if (querySnapshot.empty) {
            return { success: false, error: 'Ingen aktiv timer att stoppa.' };
        }

        const timerDoc = querySnapshot.docs[0];
        await timerDoc.ref.update({
            status: 'stopped',
            endTime: FieldValue.serverTimestamp(),
        });

        // Hämta sluttiden för att returnera (kräver ett nytt anrop)
        const updatedDoc = await timerDoc.ref.get();
        const stoppedTime = updatedDoc.data()?.endTime.toMillis();

        return { success: true, data: { logId: timerDoc.id, endTime: stoppedTime } };

    } catch (error) {
        console.error('Fel vid stopp av timer:', error);
        return { success: false, error: 'Ett serverfel uppstod.' };
    }
}
