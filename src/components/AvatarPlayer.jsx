import { useEffect, useRef, useState } from 'react';
import { useAudio } from '../contexts/AudioContext.jsx';
import { useMusicNotes } from '../contexts/MusicNotesContext.jsx';

export default function AvatarPlayer() {
    const { isPlaying, toggle } = useAudio();
    const notesRef = useMusicNotes();
    const avatarRef = useRef(null);
    const containerRef = useRef(null);
    const progressRef = useRef(null);
    const frameRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const noteTimerRef = useRef(null);

    useEffect(() => {
        const avatar = avatarRef.current;
        const container = containerRef.current;
        const frame = frameRef.current;
        const progressRing = progressRef.current;
        if (!container) return;

        const onMouseMove = (e) => {
            if (!avatar) return;
            const x = (e.clientX / window.innerWidth - 0.5) * 15;
            const y = (e.clientY / window.innerHeight - 0.5) * 15;
            avatar.style.transform = `translate(${x}px, ${y}px)`;
        };

        document.addEventListener('mousemove', onMouseMove);

        const audio = document.getElementById('bgm');

        const updateAudioProgress = () => {
            if (!audio || !audio.buffered || !audio.duration || !Number.isFinite(audio.duration)) return;
            const bufferedEnd = audio.buffered.length ? audio.buffered.end(audio.buffered.length - 1) : 0;
            const percent = Math.min(100, Math.round((bufferedEnd / audio.duration) * 100));
            setProgress(percent);
        };

        const finishAudioProgress = () => {
            setProgress(100);
            setLoaded(true);
        };

        if (audio) {
            audio.addEventListener('progress', updateAudioProgress);
            audio.addEventListener('loadedmetadata', finishAudioProgress, { once: true });
            audio.addEventListener('canplaythrough', finishAudioProgress, { once: true });
        }

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            if (audio) {
                audio.removeEventListener('progress', updateAudioProgress);
            }
            if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
        };
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        if (isPlaying) {
            container.classList.add('playing');
            scheduleNotes();
        } else {
            container.classList.remove('playing');
            stopNotes();
        }

        function spawnNote() {
            if (!container) return;
            const note = document.createElement('span');
            note.className = 'note';
            note.textContent = ['♪', '♫', '♬'][Math.floor(Math.random() * 3)];
            const angle = Math.random() * Math.PI * 2;
            const dist = 70 + Math.random() * 50;
            note.tx = Math.cos(angle) * dist;
            note.ty = Math.sin(angle) * dist - 30;
            note.rot = (Math.random() - 0.5) * 60;
            note.start = performance.now();
            note.duration = 2200 + Math.random() * 600;
            container.appendChild(note);
            notesRef.current.push(note);
        }

        function scheduleNotes() {
            if (!container.classList.contains('playing')) {
                noteTimerRef.current = null;
                return;
            }
            spawnNote();
            noteTimerRef.current = setTimeout(scheduleNotes, 400 + Math.random() * 600);
        }

        function stopNotes() {
            if (noteTimerRef.current) {
                clearTimeout(noteTimerRef.current);
                noteTimerRef.current = null;
            }
            notesRef.current.forEach((note) => note.remove());
            notesRef.current.length = 0;
        }

        return () => {
            if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
        };
    }, [isPlaying, notesRef]);

    const handleClick = (e) => {
        e.stopPropagation();
        toggle();
    };

    return (
        <div className="avatar-frame" ref={frameRef}>
            <div
                className={`avatar-container ${isPlaying ? 'playing' : ''}`}
                id="avatar-container"
                ref={containerRef}
                onClick={handleClick}
            >
                <div className="vinyl"></div>
                <div className="tonearm-wrap">
                    <svg viewBox="0 0 120 200" width="120" height="200">
                        <circle cx="60" cy="30" r="10" fill="rgba(128, 128, 128, 0.12)" />
                        <circle cx="60" cy="30" r="5" fill="var(--tonearm-color)" />
                        <circle cx="60" cy="30" r="2" fill="var(--tonearm-contrast)" />
                        <path className="tonearm-path" d="M60 30 L68 105 L30 160" stroke="var(--tonearm-color)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        <g transform="translate(30, 160) rotate(35)">
                            <rect x="-7" y="0" width="14" height="22" rx="2.5" fill="var(--tonearm-color)" />
                            <line x1="-2.5" y1="5" x2="-2.5" y2="17" stroke="var(--tonearm-contrast)" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="2.5" y1="5" x2="2.5" y2="17" stroke="var(--tonearm-contrast)" strokeWidth="1.5" strokeLinecap="round" />
                            <path className="needle" d="M-3 22 L -1.5 26 L 1.5 26 L 3 22" fill="var(--tonearm-contrast)" />
                            <circle className="bulb" cx="0" cy="12" r="2.5" fill="#ef4444" />
                        </g>
                    </svg>
                </div>
                <img src="/images/avatar.jpg" alt="Zhengpeng Lan" className="avatar" id="avatar" ref={avatarRef} />
            </div>
            <div
                className={`progress-ring ${loaded ? 'loaded' : ''}`}
                id="progress-ring"
                ref={progressRef}
                style={{ '--progress': progress }}
                aria-hidden="true"
            ></div>
        </div>
    );
}
