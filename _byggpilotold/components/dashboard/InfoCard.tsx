import React from 'react';

interface InfoCardProps {
    icon: React.ReactNode;
    title: string;
    text: string;
    ctaText: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ icon, title, text, ctaText }) => (
    <div className="bg-component-background border border-border p-6 rounded-lg text-center flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 flex items-center justify-center bg-background rounded-full mb-4 border border-border">
            {icon}
        </div>
        <h4 className="text-md font-semibold text-text-primary">{title}</h4>
        <p className="text-sm text-text-secondary mt-1">{text} <span className="font-semibold text-accent">{ctaText}</span>.</p>
    </div>
);
