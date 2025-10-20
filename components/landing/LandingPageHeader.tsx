
'use client';

import Image from 'next/image';
import { signIn } from 'next-auth/react';
import GoogleIcon from '@/components/icons/GoogleIcon';
import { useState } from 'react';

const LandingPageHeader = () => {
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleSignIn = async () => {
        setIsSigningIn(true);
        signIn('google', { callbackUrl: '/dashboard' }).catch(error => {
            console.error("NextAuth signIn error: ", error);
            setIsSigningIn(false);
        });
    };

    return (
        <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/60">
            <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2 sm:gap-3">
                    <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={36} height={36} />
                    <span className="text-2xl font-bold text-white">ByggPilot</span>
                </div>
                <nav>
                    <button 
                        onClick={handleSignIn} 
                        disabled={isSigningIn}
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 disabled:opacity-60"
                    >
                        {isSigningIn ? 
                            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></span> : 
                            <GoogleIcon />
                        }
                        <span className='ml-3'>
                            {isSigningIn ? 'Ansluter...' : 'Logga in med Google'}
                        </span>
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default LandingPageHeader;
