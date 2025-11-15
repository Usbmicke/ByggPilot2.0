
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../lib/firebase/client'; // Korrekt sökväg till din Firebase-klient
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase/client';

// Definierar formen på datan i användarprofilen
interface UserProfile {
    displayName: string;
    email: string;
    onboardingStatus: 'complete' | 'incomplete';
    // Lägg till andra fält från din Firestore-databas här
}

// Definierar vad vår AuthContext kommer att innehålla
interface AuthContextType {
    user: User | null; // Firebase Auth-användarobjektet
    userProfile: UserProfile | null; // Vår anpassade användarprofil från Firestore
    loading: boolean; // Säger om vi fortfarande väntar på att få auth-status
}

// Skapar en Context med ett default-värde (null)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Huvudkomponenten som omsluter appen och tillhandahåller auth-data
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Lyssnar på ändringar i Firebase Auth-status (inloggning/utloggning)
        const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Om användaren är inloggad, sätt upp en lyssnare på deras profildokument i Firestore
                const userProfileRef = doc(db, 'users', firebaseUser.uid);
                
                const unsubscribeProfile = onSnapshot(userProfileRef, (snapshot) => {
                    if (snapshot.exists()) {
                        // Om profildokumentet finns, uppdatera vår userProfile-state
                        setUserProfile(snapshot.data() as UserProfile);
                    } else {
                        // Om dokumentet inte finns (t.ex. direkt efter skapande, innan backend hunnit med),
                        // sätt profilen till null.
                        setUserProfile(null);
                    }
                    setLoading(false); // Sluta ladda när vi fått svar från Firestore
                }, (error) => {
                    console.error("Fel vid hämtning av användarprofil:", error);
                    setUserProfile(null);
                    setLoading(false);
                });

                // Returnera funktionen som städar upp Firestore-lyssnaren
                return () => unsubscribeProfile();

            } else {
                // Om ingen användare är inloggad, rensa allt och sluta ladda
                setUser(null);
                setUserProfile(null);
                setLoading(false);
            }
        });

        // Returnera funktionen som städar upp Auth-lyssnaren när komponenten tas bort
        return () => unsubscribeAuth();
    }, []);

    // Värdet som görs tillgängligt för alla barn-komponenter
    const value = { user, userProfile, loading };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * En custom Hook för att enkelt komma åt AuthContext i andra komponenter.
 * Säkerställer att den används inom en AuthProvider.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth måste användas inom en AuthProvider');
    }
    return context;
};
