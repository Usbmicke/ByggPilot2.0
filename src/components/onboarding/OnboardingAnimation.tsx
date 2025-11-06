
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Ord och fraser som ska animeras
const phrases = [
    { text: "Samla allt på ett ställe.", icon: "📂" },
    { text: "Från offert till faktura.", icon: "invoice" },
    { text: "Full koll på dina projekt.", icon: "construction_worker" },
    { text: "Automatiska riskbedömningar.", icon: "warning" },
    { text: "Din digitala kollega.", icon: "robot_face" },
];

// Mappar ikon-namn till faktiska emojis eller ikoner
const iconMap: { [key: string]: string } = {
    invoice: "🧾",
    construction_worker: "👷",
    warning: "⚠️",
    robot_face: "🤖",
};

export default function OnboardingAnimation() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % phrases.length);
        }, 4000); // Byt fras var 4:e sekund

        return () => clearInterval(interval);
    }, []);

    const currentPhrase = phrases[index];
    const icon = iconMap[currentPhrase.icon] || currentPhrase.icon;

    return (
        <div className="w-full h-full flex flex-col justify-center items-center bg-gray-900 p-8 md:p-16 rounded-l-2xl">
            <div className="text-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.7, ease: "easeInOut" }}
                        className="flex flex-col items-center"
                    >
                        <motion.div 
                            initial={{ scale: 0.5 }} 
                            animate={{ scale: 1 }} 
                            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}>
                           <span className="text-8xl">{icon}</span>
                        </motion.div>
                        <p className="mt-6 text-3xl font-semibold text-gray-200 max-w-sm">
                            {currentPhrase.text}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>
             <div className="absolute bottom-8 text-center text-gray-600">
                <p>ByggPilot - Din digitala hantverksassistent</p>
            </div>
        </div>
    );
}
