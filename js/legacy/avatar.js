(function() {
    const musicNotes = window.__background.musicNotes;

    const avatar = document.getElementById('avatar');

    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth > 768) {
            const x = (e.clientX / window.innerWidth - 0.5) * 15;
            const y = (e.clientY / window.innerHeight - 0.5) * 15;
            avatar.style.transform = `translate(${x}px, ${y}px)`;
        }
    });

    const bgm = document.getElementById('bgm');
    const avatarContainer = document.getElementById('avatar-container');
    const avatarFrame = document.getElementById('avatar-frame');
    const progressRing = document.getElementById('progress-ring');

    function updateAudioProgress() {
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

    if (bgm && avatar && avatarContainer) {
        bgm.volume = 0.08;
        bgm.muted = true;

        window.addEventListener('load', () => {
            bgm.load();
        });

        bgm.addEventListener('progress', updateAudioProgress);
        bgm.addEventListener('canplaythrough', finishAudioProgress, { once: true });

        let noteTimer = null;

        function spawnNote() {
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
            if (!avatarContainer.classList.contains('playing')) {
                noteTimer = null;
                return;
            }
            spawnNote();
            noteTimer = setTimeout(scheduleNotes, 400 + Math.random() * 600);
        }

        function startNotes() {
            if (noteTimer) return;
            scheduleNotes();
        }

        avatar.addEventListener('click', () => {
            if (bgm.muted || bgm.paused) {
                bgm.muted = false;
                bgm.play().catch(() => {});
                avatarContainer.classList.add('playing');
                startNotes();
            } else {
                bgm.muted = true;
                bgm.pause();
                avatarContainer.classList.remove('playing');
                clearTimeout(noteTimer);
                noteTimer = null;
            }
        });
    }
})();
