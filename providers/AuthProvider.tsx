
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore as db } from '@/lib/firebase';

// Detta är en platshållare. I en verklig applikation skulle detta vara en mer robust typ.
interface FirestoreUser {
    uid: string;
    [key: string]: any;
}

interface FirebaseSyncContextType {
    firebaseUser: FirestoreUser | null;
    isLoading: boolean;
}

const FirebaseSyncContext = createContext<FirebaseSyncContextType>({ firebaseUser: null, isLoading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { data: session, status } = useSession();
    const [firebaseUser, setFirebaseUser] = useState<FirestoreUser | null>(null);
    const authLoading = status === 'loading';

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            const userDocRef = doc(db, 'users', session.user.id);
            const unsubscribe = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    setFirebaseUser({ uid: doc.id, ...doc.data() } as FirestoreUser);
                } else {
                    setFirebaseUser(null);
                }
            });
            return () => unsubscribe();
        } else if (status === 'unauthenticated') {
            setFirebaseUser(null);
        }
    }, [session, status]);

    return (
        <FirebaseSyncContext.Provider value={{ firebaseUser, isLoading: authLoading || !firebaseUser }}>
            {children}
        </FirebaseSyncContext.Provider>
    );
};

export const useFirebaseSync = () => useContext(FirebaseSyncContext);
