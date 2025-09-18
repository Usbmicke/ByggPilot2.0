'use client';

import React, { useState, useEffect } from 'react';

const AnimatedBackground = () => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const newParticles = Array.from({ length: 50 }).map((_, i) => {
            const size = Math.random() * 1.5 + 0.5;
            const style = {
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${Math.random() * 20 + 20}s`,
            };
            return <div key={i} className="particle" style={style}></div>;
        });
        setParticles(newParticles);
    }, []);

    return (
        <>
            <style>{`
                @keyframes float-up {
                    0% { transform: translateY(0); opacity: 0; }
                    10% { opacity: 0.7; }
                    90% { opacity: 0.7; }
                    100% { transform: translateY(-100vh); opacity: 0; }
                }
                .particle {
                    position: absolute;
                    bottom: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    animation-name: float-up;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
            `}</style>
            <div className="fixed inset-0 -z-10 bg-[#0B2545]">{particles}</div>
        </>
    );
};

export default AnimatedBackground;
