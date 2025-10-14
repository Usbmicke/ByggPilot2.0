
// =================================================================================
// MESSAGE SKELETON V1.0
// BESKRIVNING: En enkel platshållare (skeleton) som visas medan AI:n
// genererar ett svar. Ger omedelbar visuell feedback till användaren.
// Steg C.1 i arkitekturplanen.
// =================================================================================

const MessageSkeleton = () => {
    return (
        <div className="flex flex-col">
            <div className="max-w-2xl p-4 rounded-xl shadow-md bg-background-tertiary border border-border-primary animate-pulse">
                <div className="space-y-3">
                    <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-600 rounded w-5/6"></div>
                </div>
            </div>
        </div>
    );
};

export default MessageSkeleton;
