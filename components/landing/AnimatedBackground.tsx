
'use client';

import React, { useState, useEffect } from 'react';

const CustomAnimationsStyle = () => (
  <style>{`
    @keyframes float-up { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { transform: translateY(-100vh); opacity: 0; } }
    .particle { position: absolute; bottom: 0; border-radius: 50%; background: rgba(224, 224, 224, 0.1); animation-name: float-up; animation-timing-function: linear; animation-iteration-count: infinite; }
  `}</style>
);

const AnimatedBackground = () => {
    const [particles, setParticles] = useState([]);
    useEffect(() => {
        const newParticles = Array.from({ length: 40 }).map((_, i) => {
            const size = Math.random() * 1.5 + 0.5;
            const style = { width: `${size}px`, height: `${size}px`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 15}s`, animationDuration: `${Math.random() * 20 + 20}s` };
            return <div key={i} className="particle" style={style}></div>;
        });
        setParticles(newParticles);
    }, []);

    return (
        <>
            <CustomAnimationsStyle />
            <div className="fixed inset-0 -z-10 bg-gray-900">{particles}</div>
        </>
    );
};

export default AnimatedBackground;
