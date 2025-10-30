import React, { useState, useEffect, useRef } from 'react';
import { AudioOnIcon, AudioOffIcon } from './icons/AudioIcons';

const AudioControl: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // We need to query the DOM for the audio element since it's in index.html
        const audioElement = document.getElementById('background-audio') as HTMLAudioElement;
        if (audioElement) {
            audioRef.current = audioElement;
            audioRef.current.volume = 0.2; // Set a subtle volume
        }
    }, []);

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(error => {
                    // Autoplay is often blocked, this is expected
                    console.log("Audio play failed:", error);
                });
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button
                onClick={toggleAudio}
                className="w-12 h-12 flex items-center justify-center bg-neutral-800/80 border border-neutral-700 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all duration-300 backdrop-blur-sm hover:scale-110 hover:-translate-y-1"
                aria-label={isPlaying ? 'Stäng av ljud' : 'Sätt på ljud'}
            >
                {isPlaying ? <AudioOnIcon /> : <AudioOffIcon />}
            </button>
        </div>
    );
};

export default AudioControl;