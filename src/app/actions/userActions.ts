
import { firestoreAdmin } from "@/lib/config/firebase-admin";

const db = firestoreAdmin;

export async function getNewActions(userId: string) {
    const actionsSnapshot = await db.collection('users').doc(userId)
                                   .collection('actions')
                                   .where('status', '==', 'new')
                                   .orderBy('createdAt', 'desc')
                                   .get();

    if (actionsSnapshot.empty) {
        return [];
    }

    return actionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));
}

export async function updateActionStatus(userId: string, actionId: string, newStatus: string) {
    const actionRef = db.collection('users').doc(userId).collection('actions').doc(actionId);
    const doc = await actionRef.get();

    if (!doc.exists) {
        throw new Error("Action not found");
    }

    await actionRef.update({ status: newStatus });
    return { success: true };
}
