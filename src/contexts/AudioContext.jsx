import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const AUDIO_SRC = '/files/Allard%20Sidonia%20-%20Rain%20Without%20End.mp3';

const AudioContext = createContext({
    isPlaying: false,
    play: () => {},
    pause: () => {},
    toggle: () => {},
});

export function AudioProvider({ children }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const audio = document.createElement('audio');
        audio.id = 'bgm';
        audio.src = AUDIO_SRC;
        audio.loop = true;
        audio.preload = 'metadata';
        audio.volume = 0.08;
        document.body.appendChild(audio);
        audioRef.current = audio;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => setIsPlaying(false);

        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('ended', onEnded);
            audio.pause();
            audio.remove();
        };
    }, []);

    const play = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.muted = false;
        audio.play().catch(() => {});
    }, []);

    const pause = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.pause();
    }, []);

    const toggle = useCallback(() => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }, [isPlaying, pause, play]);

    return (
        <AudioContext.Provider value={{ isPlaying, play, pause, toggle, audioRef }}>
            {children}
        </AudioContext.Provider>
    );
}

export function useAudio() {
    return useContext(AudioContext);
}
