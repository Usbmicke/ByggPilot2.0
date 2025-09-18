'use client';

import React, { useState, useEffect } from 'react';
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore as db } from '@/app/lib/firebase/client';
import { UserProfile } from '@/app/types/user';

export default function OnboardingWidget() {
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setUserProfile({ id: user.uid, ...docSnap.data() } as UserProfile);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleOnboardingComplete = async () => {
        if (user) {
            setIsCompleting(true);
            const { updateUserOnboardingStatus } = await import('@/app/lib/firebase/firestore');
            await updateUserOnboardingStatus(user.uid, 'complete');
        }
    };

    if (loading || userProfile?.onboardingStatus === 'complete') {
        return null;
    }

    return (
        <div className="fixed inset-0 md:left-64 z-40 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-gray-800 border border-gray-700/80 shadow-2xl rounded-lg max-w-2xl w-full flex flex-col items-center p-8 md:p-12 text-center"
            >
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gray-700 rounded-full">
                        <ChatBubbleOvalLeftEllipsisIcon size={32} className="text-cyan-400 h-10 w-10" />
                    </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Kom igång med ByggPilot</h2>
                <h3 className="text-xl font-semibold text-white mb-2">Anslut ditt Google Drive-konto</h3>
                <p className="text-gray-300 mb-8 max-w-prose mx-auto">
                    För att jag ska kunna hjälpa dig att automatiskt skapa, hantera och spara dina projektdokument behöver jag tillgång till Google Drive. Dina filer förblir dina.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md">
                    <button
                        onClick={handleOnboardingComplete}
                        disabled={isCompleting}
                        className="flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCompleting ? 'Ansluter...' : 'Ja, koppla Google Drive'}
                    </button>
                    <button
                        onClick={handleOnboardingComplete} // Samma funktion, vi hanterar inte "kanske senare" annorlunda just nu
                        disabled={isCompleting}
                        className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                        Kanske senare
                    </button>
                </div>
                 <p className="text-xs text-gray-500 mt-6 max-w-sm mx-auto">
                  Genom att ansluta godkänner du att ByggPilot kan läsa och hantera filer relaterade till dina byggprojekt.
                </p>
            </motion.div>
        </div>
    );
}
