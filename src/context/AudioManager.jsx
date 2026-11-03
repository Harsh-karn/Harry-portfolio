import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { setMusicVolume } from '../utils/audioManager';

const AudioContext = createContext({
    isMuted: false,
    toggleMute: () => { },
    play: () => { },
    playPaper: () => { },
    playDoorCreak: () => { },
    playDoorOpen: () => { },
    playDoorClose: () => { },
    playMagic: () => { },
    playWhoosh: () => { },
    enableAudio: () => { },
    audioEnabled: false,
    globalVolume: 0.5,
    setGlobalVolume: () => { },
});

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
    // Persist mute preference
    const [isMuted, setIsMuted] = useState(() => {
        const saved = localStorage.getItem('audio_muted');
        return saved === 'true';
    });

    // Persist volume preference (0.0 to 1.0)
    const [globalVolume, setGlobalVolume] = useState(() => {
        const saved = localStorage.getItem('audio_volume');
        return saved !== null ? parseFloat(saved) : 0.5;
    });

    const [audioEnabled, setAudioEnabled] = useState(false);

    // Track active sounds to stop them later
    const activeSounds = useRef({});

    useEffect(() => {
        localStorage.setItem('audio_muted', isMuted);
        localStorage.setItem('audio_volume', globalVolume);

        // Sync background music volume
        setMusicVolume(isMuted ? 0 : globalVolume * 0.35);

        // Update all active sounds
        Object.values(activeSounds.current).forEach(audio => {
            if (audio) {
                audio.muted = isMuted;
                // Scale effective volume by global volume
                const base = audio._baseVolume !== undefined ? audio._baseVolume : 1.0;
                let targetVol = base * globalVolume;
                audio.volume = Math.max(0, Math.min(1, targetVol));
            }
        });

    }, [isMuted, globalVolume]);

    const toggleMute = () => setIsMuted(prev => !prev);

    // Enhanced setter that auto-unmutes if user manually drags slider above 0
    const enhancedSetGlobalVolume = useCallback((vol) => {
        if (typeof vol === 'function') {
            setGlobalVolume(prev => {
                const newVol = vol(prev);
                if (newVol > 0) setIsMuted(false);
                return newVol;
            });
        } else {
            setGlobalVolume(vol);
            if (vol > 0) setIsMuted(false);
        }
    }, []);

    // Call this on first interaction
    const enableAudio = useCallback(() => {
        if (!audioEnabled) {
            setAudioEnabled(true);
        }
    }, [audioEnabled]);

    const play = useCallback((soundName, { loop = false, volume = 1.0 } = {}) => {
        // Map common audio names to public asset files
        const soundPaths = {
            'szumwiatru': '/sounds/szumwiatru.mp3', // Wind sound in About room
            'szummiasta': '/sounds/szummiasta.mp3', // City ambiance in The Gallery room
            'uchyleniedrzwi': '/sounds/uchyleniedrzwi.mp3', // Door creak
            'doorcreak': '/sounds/uchyleniedrzwi.mp3',
            'otwarciedrzwi': '/sounds/otwarciedrzwi.mp3',   // Door opening sound
            'dooropen': '/sounds/otwarciedrzwi.mp3',
            'zamknieciedrzwi': '/sounds/zamknieciedrzwi.mp3', // Door closing sound
            'doorclose': '/sounds/zamknieciedrzwi.mp3',
            'paper': '/sounds/papersound.mp3', // Paper rustle / page turn
            'papersound': '/sounds/papersound.mp3',
            'tear': '/sounds/papersound.mp3', // Paper tear
            'pencil': '/sounds/pencil.mp3', // Pencil sketch sound
            'whoosh': '/sounds/spell_whoosh.mp3', // Sweeping magical transition
            'baloonpoop': '/sounds/baloonpoop.mp3',
            'balloon': '/sounds/baloonpoop.mp3'
        };
        const path = soundPaths[soundName] || `/sounds/${soundName}.mp3`;

        const audio = new Audio(path);

        // Store metadata
        audio.loop = loop;
        audio._baseVolume = volume;

        // Apply current global state
        audio.muted = isMuted;
        let targetVol = volume * globalVolume;
        audio.volume = Math.max(0, Math.min(1, targetVol));

        if (activeSounds.current[soundName]) {
            activeSounds.current[soundName].pause();
        }
        activeSounds.current[soundName] = audio;

        // Attempt to play
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                if (error.name === 'NotAllowedError') {
                    // Auto-play blocked waiting for user gesture
                } else if (error.name === 'NotSupportedError' || error.message.includes('404')) {
                    // Silently fail for clean console
                }
            });
        }

        return {
            stop: () => {
                audio.pause();
                audio.currentTime = 0;
                delete activeSounds.current[soundName];
            },
            fade: (duration = 1000) => {
                const startVol = audio.volume;
                const startTime = performance.now();
                const fadeInterval = setInterval(() => {
                    const elapsed = performance.now() - startTime;
                    const progress = Math.min(1, elapsed / duration);
                    audio.volume = Math.max(0, startVol * (1 - progress));
                    if (progress >= 1) {
                        clearInterval(fadeInterval);
                        audio.pause();
                        audio.currentTime = 0;
                        delete activeSounds.current[soundName];
                    }
                }, 30);
            }
        };
    }, [isMuted, globalVolume]);

    const playPaper = useCallback((vol = 0.75) => play('paper', { volume: vol }), [play]);
    const playDoorCreak = useCallback((vol = 0.85) => play('doorcreak', { volume: vol }), [play]);
    const playDoorOpen = useCallback((vol = 0.85) => play('dooropen', { volume: vol }), [play]);
    const playDoorClose = useCallback((vol = 0.85) => play('doorclose', { volume: vol }), [play]);
    const playMagic = useCallback(() => {}, []);
    const playWhoosh = useCallback((vol = 0.7) => play('whoosh', { volume: vol }), [play]);

    return (
        <AudioContext.Provider value={{
            isMuted,
            toggleMute,
            globalVolume,
            setGlobalVolume: enhancedSetGlobalVolume,
            play,
            playPaper,
            playDoorCreak,
            playDoorOpen,
            playDoorClose,
            playMagic,
            playWhoosh,
            enableAudio,
            audioEnabled
        }}>
            {children}
        </AudioContext.Provider>
    );
};
