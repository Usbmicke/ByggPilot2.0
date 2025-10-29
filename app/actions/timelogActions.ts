
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { db } from '@/lib/config/firebase-admin';
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp, writeBatch, doc, updateDoc, getDoc } from 'firebase/firestore';

/**
 * GULDSTANDARD ACTION: `getActiveTimer`
 * Hämtar den för närvarande aktiva timern för en användare.
 */
export async function getActiveTimer() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.id;

    try {
        const timelogsRef = collection(db, 'users', userId, 'timelogs');
        const q = query(timelogsRef, where('status', '==', 'running'), limit(1));
        const querySnapshot = await getDocs(q);

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
 * GULDSTANDARD ACTION: `startTimer`
 * Startar en ny timer för ett projekt, och stoppar eventuella andra aktiva timers.
 */
export async function startTimer(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.id;

    try {
        const timelogsRef = collection(db, 'users', userId, 'timelogs');
        const batch = writeBatch(db);

        // Stoppa först alla befintliga timers
        const runningTimersQuery = query(timelogsRef, where('status', '==', 'running'));
        const runningTimersSnapshot = await getDocs(runningTimersQuery);
        runningTimersSnapshot.forEach(doc => {
            batch.update(doc.ref, { status: 'stopped', endTime: serverTimestamp() });
        });

        // Skapa den nya timern
        const newLogRef = doc(timelogsRef); // Skapa en referens med unikt ID
        const newLogData = {
            projectId,
            status: 'running',
            startTime: serverTimestamp(),
            endTime: null,
            userId: userId, // Inkludera för enkelhetens skull
        };
        batch.set(newLogRef, newLogData);

        await batch.commit();

        // Hämta starttiden för att returnera
        const newLogSnapshot = await getDoc(newLogRef);
        const createdTime = newLogSnapshot.data()?.startTime.toMillis();

        return { success: true, data: { logId: newLogRef.id, startTime: createdTime } };

    } catch (error) {
        console.error('Fel vid start av timer:', error);
        return { success: false, error: 'Ett serverfel uppstod.' };
    }
}

/**
 * GULDSTANDARD ACTION: `stopTimer`
 * Stoppar den nuvarande aktiva timern.
 */
export async function stopTimer() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.id;

    try {
        const timelogsRef = collection(db, 'users', userId, 'timelogs');
        const q = query(timelogsRef, where('status', '==', 'running'), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: false, error: 'Ingen aktiv timer att stoppa.' };
        }

        const timerDoc = querySnapshot.docs[0];
        const endTime = serverTimestamp();
        await updateDoc(timerDoc.ref, {
            status: 'stopped',
            endTime: endTime,
        });

        // Hämta sluttiden för att returnera
        const updatedDoc = await getDoc(timerDoc.ref);
        const stoppedTime = updatedDoc.data()?.endTime.toMillis();

        return { success: true, data: { logId: timerDoc.id, endTime: stoppedTime } };

    } catch (error) {
        console.error('Fel vid stopp av timer:', error);
        return { success: false, error: 'Ett serverfel uppstod.' };
    }
}
