'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore as db } from '@/app/lib/firebase/client';
import AuthGuard from '@/app/components/AuthGuard';
import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import OnboardingWidget from '@/app/components/onboarding/OnboardingWidget';
import Providers from '@/app/components/Providers';
import { UserProfile } from '@/app/types/user';

const AnimatedBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
    </div>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

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
            const { updateUserOnboardingStatus } = await import('@/app/lib/firebase/firestore');
            await updateUserOnboardingStatus(user.uid, 'complete');
        }
    };

    return (
        <Providers>
            <AuthGuard>
                <div className="h-screen bg-gray-900">
                    <AnimatedBackground />
                    <Sidebar />
                    <Header />
                    
                    <main className="ml-0 md:ml-64 pt-20 h-full overflow-y-auto">
                        <div className="p-4 md:p-6 lg:p-8">
                            {children}
                        </div>
                    </main>

                    {!loading && userProfile?.onboardingStatus !== 'complete' && (
                        <OnboardingWidget onComplete={handleOnboardingComplete} />
                    )}
                </div>
            </AuthGuard>
        </Providers>
    );
}
