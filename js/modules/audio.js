const AUDIO_SRC = '/files/Allard%20Sidonia%20-%20Rain%20Without%20End.mp3';

let bgm = null;
let control = null;
let isPlaying = false;
let listeners = [];

function updateControl() {
    if (!control) return;
    control.classList.toggle('playing', isPlaying);
    control.setAttribute('aria-pressed', String(isPlaying));
}

function onPlay() {
    isPlaying = true;
    updateControl();
}

function onPause() {
    isPlaying = false;
    updateControl();
}

function bind(el, event, handler, options) {
    el.addEventListener(event, handler, options);
    listeners.push({ el, event, handler, options });
}

export function isAudioPlaying() {
    return isPlaying;
}

export function playAudio() {
    if (!bgm) return;
    bgm.muted = false;
    bgm.play().catch(() => {});
}

export function pauseAudio() {
    if (!bgm) return;
    bgm.pause();
}

export function toggleAudio() {
    console.log('toggleAudio called, isPlaying:', isPlaying, 'bgm:', bgm?.paused);
    if (isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

function createControl() {
    if (document.getElementById('music-control')) return document.getElementById('music-control');

    const btn = document.createElement('button');
    btn.id = 'music-control';
    btn.className = 'music-control';
    btn.setAttribute('aria-label', '播放/暂停音乐');
    btn.innerHTML = `
        <svg class="icon-play" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z"/>
        </svg>
        <svg class="icon-pause" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
    `;
    document.body.appendChild(btn);
    return btn;
}

export function initAudio() {
    bgm = document.getElementById('bgm');
    if (!bgm) {
        bgm = document.createElement('audio');
        bgm.id = 'bgm';
        bgm.src = AUDIO_SRC;
        bgm.loop = true;
        bgm.preload = 'metadata';
        document.body.appendChild(bgm);
    }

    bgm.volume = 0.08;
    isPlaying = !bgm.paused && !bgm.ended;

    listeners.forEach(({ el, event, handler, options }) => el.removeEventListener(event, handler, options));
    listeners = [];

    bind(bgm, 'play', onPlay);
    bind(bgm, 'pause', onPause);
    bind(bgm, 'ended', onPause);

    control = createControl();
    bind(control, 'click', (e) => {
        e.preventDefault();
        toggleAudio();
    });

    updateControl();
}
