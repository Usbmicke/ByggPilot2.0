'use client';
import { useAuth } from '@/app/providers/AuthContext';
import React from 'react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" /><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" /><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" /><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.901,36.625,44,31.023,44,24C44,22.659,43.862,21.35,43.611,20.083z" /></svg>
);

export default function HeroSection() {
    const { login } = useAuth();
    return (
        <section className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-68px)] bg-brand-dark text-brand-text px-6">
            <div className="max-w-4xl">
                <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">Mindre papperskaos. <span className="text-cyan-400">Mer tid att bygga.</span></h1>
                <p className="text-lg md:text-xl text-brand-accent mb-10">ByggPilot är din nya digitala kollega som förvandlar administration till en automatiserad process, direkt i ditt befintliga Google-konto. Frigör tid, eliminera papperskaos och fokusera på det som verkligen driver din firma framåt.</p>
                <button onClick={login} className="flex items-center justify-center mx-auto bg-white text-gray-800 font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-200 transition-transform duration-300 hover:scale-105 shadow-lg">
                    <GoogleIcon className="mr-3" />
                    Logga in med Google
                </button>
                <p className="text-xs text-brand-light mt-4">ByggPilot är byggd för Googles kraftfulla och kostnadsfria verktyg.</p>
            </div>
        </section>
    );
};