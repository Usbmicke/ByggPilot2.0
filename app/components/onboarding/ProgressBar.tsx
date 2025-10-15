
'use client';

// =================================================================================
// PROGRESS BAR V1.0 - GULDSTANDARD
// DESIGN: Ren, minimalistisk och tydlig visuell feedback på användarens
// framsteg genom flödet.
// =================================================================================

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
    const percentage = Math.max(0, Math.min(100, ((currentStep - 1) / (totalSteps -1)) * 100));

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Välkommen till ByggPilot!</h2>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Steg {currentStep} av {totalSteps}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}
