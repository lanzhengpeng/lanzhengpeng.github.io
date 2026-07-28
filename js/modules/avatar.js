import { musicNotes } from './background.js';
import { isAudioPlaying, toggleAudio } from './audio.js';

let avatar = null;
let avatarContainer = null;
let avatarFrame = null;
let progressRing = null;
let noteTimer = null;
let listeners = [];

function bind(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    listeners.push({ target, event, handler, options });
}

function updateAudioProgress() {
    const bgm = document.getElementById('bgm');
    if (!bgm || !bgm.buffered || !bgm.duration || !Number.isFinite(bgm.duration)) return;
    const bufferedEnd = bgm.buffered.length ? bgm.buffered.end(bgm.buffered.length - 1) : 0;
    const percent = Math.min(100, Math.round((bufferedEnd / bgm.duration) * 100));
    if (progressRing) {
        progressRing.style.setProperty('--progress', String(percent));
    }
}

function finishAudioProgress() {
    if (progressRing) {
        progressRing.style.setProperty('--progress', '100');
        progressRing.classList.add('loaded');
        setTimeout(() => {
            progressRing.style.display = 'none';
        }, 500);
    }
    if (avatarFrame) {
        avatarFrame.classList.add('loaded');
    }
}

function spawnNote() {
    if (!avatarContainer) return;
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
    avatarContainer.appendChild(note);
    musicNotes.push(note);
}

function scheduleNotes() {
    if (!avatarContainer || !avatarContainer.classList.contains('playing')) {
        noteTimer = null;
        return;
    }
    spawnNote();
    noteTimer = setTimeout(scheduleNotes, 400 + Math.random() * 600);
}

function startNotes() {
    if (noteTimer || !avatarContainer) return;
    scheduleNotes();
}

function stopNotes() {
    if (noteTimer) {
        clearTimeout(noteTimer);
        noteTimer = null;
    }
    if (avatarContainer) {
        avatarContainer.classList.remove('playing');
    }
    musicNotes.forEach(note => note.remove());
    musicNotes.length = 0;
}

function onAvatarClick(e) {
    e.stopPropagation();
    toggleAudio();
}

function syncVisualState() {
    if (!avatarContainer) return;
    if (isAudioPlaying()) {
        avatarContainer.classList.add('playing');
        startNotes();
    } else {
        avatarContainer.classList.remove('playing');
        stopNotes();
    }
}

export function initAvatar() {
    console.log('initAvatar called');
    destroyAvatar();

    avatar = document.getElementById('avatar');
    avatarContainer = document.getElementById('avatar-container');
    avatarFrame = document.getElementById('avatar-frame');
    progressRing = document.getElementById('progress-ring');

    if (avatar) {
        bind(document, 'mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 15;
            const y = (e.clientY / window.innerHeight - 0.5) * 15;
            avatar.style.transform = `translate(${x}px, ${y}px)`;
        });
    }

    const bgm = document.getElementById('bgm');
    if (bgm) {
        bgm.volume = 0.08;
        bind(bgm, 'progress', updateAudioProgress);
        bind(bgm, 'loadedmetadata', finishAudioProgress, { once: true });
        bind(bgm, 'canplaythrough', finishAudioProgress, { once: true });
        bind(bgm, 'play', syncVisualState);
        bind(bgm, 'pause', syncVisualState);
    }

    if (avatarContainer) {
        bind(avatarContainer, 'click', onAvatarClick);
        syncVisualState();
    }
}

export function destroyAvatar() {
    stopNotes();
    listeners.forEach(({ target, event, handler, options }) => {
        target.removeEventListener(event, handler, options);
    });
    listeners = [];
    avatar = null;
    avatarContainer = null;
    avatarFrame = null;
    progressRing = null;
}
