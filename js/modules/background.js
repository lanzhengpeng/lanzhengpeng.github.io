import { drawGame } from './game.js';

export const canvas = document.getElementById('canvas-bg');
export const ctx = canvas.getContext('2d');
export let particles = [];
export const musicNotes = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

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
        ctx.fillStyle = `rgba(224, 231, 255, ${alpha})`;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = Math.min(window.innerWidth / 10, 120);
    for (let i = 0; i < count; i++) particles.push(new Particle());
}
initParticles();

function drawMoon() {
    const x = canvas.width - 110;
    const y = 110;
    const r = 80;

    const glow = ctx.createRadialGradient(x, y, r * 0.7, x, y, r * 3.5);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
    glow.addColorStop(0.4, 'rgba(165, 180, 252, 0.06)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
    ctx.fill();

    const moonGrad = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.1, x, y, r);
    moonGrad.addColorStop(0, '#f8fafc');
    moonGrad.addColorStop(1, '#a5b4fc');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(99, 102, 241, 0.12)';
    ctx.beginPath();
    ctx.arc(x + r * 0.35, y + r * 0.2, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - r * 0.1, y + r * 0.45, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
}

export function updateMusicNotes() {
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(165, 180, 252, ${0.08 * (1 - dist / 100)})`;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    drawMoon();
    drawGame();
    updateMusicNotes();
    requestAnimationFrame(animateParticles);
}
animateParticles();
