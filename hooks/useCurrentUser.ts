
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { doc, onSnapshot } from 'firebase/firestore';
// =================================================================================
// KORRIGERING V1.1
// Importerar den korrekt namngivna 'firestore'-instansen istället för 'db'.
// =================================================================================
import { firestore } from '@/lib/firebase'; 
import { UserProfile } from '@/types';

interface CurrentUserHook {
  user: UserProfile | null;
  loading: boolean;
  error: Error | null;
}

export const useCurrentUser = (): CurrentUserHook => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (status === 'unauthenticated' || !session?.user?.id) {
      setLoading(false);
      setUser(null);
      return;
    }

    const userId = session.user.id;
    // KORRIGERING: Använder 'firestore'-variabeln här.
    const userDocRef = doc(firestore, 'users', userId);

    const unsubscribe = onSnapshot(userDocRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          const userData = { id: snapshot.id, ...snapshot.data() } as UserProfile;
          setUser(userData);
        } else {
          setError(new Error('Användarprofilen kunde inte hittas i databasen.'));
        }
        setLoading(false);
      },
      (err) => {
        console.error("[useCurrentUser] Error fetching user profile:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();

  }, [session, status]);

  return { user, loading, error };
};
