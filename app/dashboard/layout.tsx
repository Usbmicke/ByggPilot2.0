'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore as db } from '@/app/lib/firebase/client';
import { UserProfile } from '@/app/types/user';

import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import ChatWidget from '@/app/components/layout/ChatWidget';
import AnimatedBackground from '@/app/components/layout/AnimatedBackground';

interface Props {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
                if (doc.exists()) {
                    setUserProfile(doc.data() as UserProfile);
                } else {
                    setUserProfile(null); 
                }
                setLoading(false);
            });
            return () => unsub();
        } else {
            setLoading(false);
        }
    }, [user]);

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
                <p className="text-white">Laddar din arbetsyta...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <AnimatedBackground />
            <Sidebar />
            
            <div className="md:pl-64"> 
                <Header />
                
                <main className="pt-20">
                    <div className="grid justify-center pt-24 px-4">
                        {children}
                    </div>
                </main>
            </div>

            {/* Skickar med användarprofilen till ChatWidget */}
            <ChatWidget userProfile={userProfile} />
        </div>
    );
}
