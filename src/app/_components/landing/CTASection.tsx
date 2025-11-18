'use client';

import React from 'react';
import AnimatedSection from './AnimatedSection';

const CTASection: React.FC = () => {
    return (
        <AnimatedSection>
            <div className="py-24 sm:py-32">
                <div className="container mx-auto px-6">
                    <div className="text-center">
                         <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
                           Sluta bygga som igår.
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-neutral-400">
                           Börja bygga lönsamt, säkert och stressfritt. Prova ByggPilot gratis i 14 dagar, inga förpliktelser.
                        </p>
                        <div className="mt-10">
                            <a href="#" className="group inline-flex items-center justify-center w-full sm:w-auto bg-white text-neutral-900 font-semibold py-4 px-10 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:bg-neutral-200 text-lg hover:-translate-y-1.5 hover:shadow-xl hover:shadow-white/20">
                                Ta kontrollen över ditt företag nu
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedSection>
    );
};

export default CTASection;
