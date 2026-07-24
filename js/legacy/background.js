(function() {
    const drawGame = window.__game.drawGame;

    const canvas = document.getElementById('canvas-bg');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const musicNotes = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function getTheme() {
        return document.documentElement.dataset.theme || 'dark';
    }

    let currentTheme = getTheme();

    const palettes = {
        dark: {
            particle: '224, 231, 255',
            line: '165, 180, 252',
            moonCore: '#f8fafc',
            moonEdge: '#a5b4fc',
            moonCrater: '99, 102, 241',
            moonGlowInner: '255, 255, 255',
            moonGlowMid: '165, 180, 252'
        },
        light: {
            particle: '79, 70, 229',
            line: '148, 163, 184',
            moonCore: '#fef08a',
            moonEdge: '#fbbf24',
            moonCrater: '245, 158, 11',
            moonGlowInner: '254, 240, 138',
            moonGlowMid: '251, 191, 36'
        }
    };

    function getPalette() {
        return palettes[getTheme()] || palettes.dark;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.size = Math.random() * 1.5 + 0.5;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        draw() {
            const alpha = Math.random() * 0.4 + 0.4;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${getPalette().particle}, ${alpha})`;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const count = Math.min(window.innerWidth / 10, 120);
        for (let i = 0; i < count; i++) particles.push(new Particle());
    }
    initParticles();

    function drawCelestial() {
        const x = canvas.width - 110;
        const y = 110;
        const r = 80;
        const palette = getPalette();
        const isLight = getTheme() === 'light';

        const glow = ctx.createRadialGradient(x, y, r * 0.7, x, y, r * 3.5);
        glow.addColorStop(0, `rgba(${palette.moonGlowInner}, 0.18)`);
        glow.addColorStop(0.4, `rgba(${palette.moonGlowMid}, 0.06)`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
        ctx.fill();

        const bodyGrad = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.1, x, y, r);
        bodyGrad.addColorStop(0, palette.moonCore);
        bodyGrad.addColorStop(1, palette.moonEdge);
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        if (isLight) {
            const rayCount = 12;
            const time = performance.now() / 2000;
            ctx.strokeStyle = palette.moonEdge;
            ctx.lineWidth = r * 0.08;
            ctx.lineCap = 'round';
            for (let i = 0; i < rayCount; i++) {
                const angle = (i / rayCount) * Math.PI * 2 + time * 0.2;
                ctx.beginPath();
                ctx.moveTo(x + Math.cos(angle) * r * 1.15, y + Math.sin(angle) * r * 1.15);
                ctx.lineTo(x + Math.cos(angle) * r * 1.55, y + Math.sin(angle) * r * 1.55);
                ctx.stroke();
            }
        } else {
            ctx.fillStyle = `rgba(${palette.moonCrater}, 0.12)`;
            ctx.beginPath();
            ctx.arc(x + r * 0.35, y + r * 0.2, r * 0.18, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x - r * 0.1, y + r * 0.45, r * 0.12, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function updateMusicNotes() {
        const now = performance.now();
        for (let i = musicNotes.length - 1; i >= 0; i--) {
            const note = musicNotes[i];
            let progress = (now - note.start) / note.duration;
            if (progress >= 1) {
                note.remove();
                musicNotes.splice(i, 1);
                continue;
            }
            if (progress < 0) progress = 0;

            let opacity, scale, tx, ty, rot;
            if (progress < 0.1) {
                const p = progress / 0.1;
                opacity = p;
                scale = 0.4 + 0.6 * p;
                tx = 0;
                ty = 0;
                rot = 0;
            } else {
                const p = (progress - 0.1) / 0.9;
                opacity = 1 - p;
                scale = 1 - 0.3 * p;
                tx = note.tx * p;
                ty = note.ty * p;
                rot = note.rot * p;
            }
            note.style.opacity = opacity;
            note.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${scale}) rotate(${rot}deg)`;
        }
    }

    function animateParticles() {
        if (getTheme() !== currentTheme) {
            currentTheme = getTheme();
            initParticles();
        }
        const isLight = getTheme() === 'light';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!isLight) {
            particles.forEach(p => { p.update(); p.draw(); });
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${getPalette().line}, ${0.08 * (1 - dist / 100)})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            drawGame();
        }
        drawCelestial();
        updateMusicNotes();
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    window.__background = {
        canvas, ctx, particles, musicNotes, updateMusicNotes,
        getMoon() { return { x: canvas.width - 110, y: 110, r: 80 }; }
    };
})();
