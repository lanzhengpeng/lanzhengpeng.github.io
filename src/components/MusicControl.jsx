import { useAudio } from '../contexts/AudioContext.jsx';

export default function MusicControl() {
    const { isPlaying, toggle } = useAudio();

    return (
        <button
            id="music-control"
            className={`music-control ${isPlaying ? 'playing' : ''}`}
            aria-label="播放/暂停音乐"
            aria-pressed={isPlaying}
            onClick={(e) => {
                e.preventDefault();
                toggle();
            }}
        >
            <svg className="icon-play" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
            </svg>
            <svg className="icon-pause" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
        </button>
    );
}
