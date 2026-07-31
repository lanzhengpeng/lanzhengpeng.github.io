import { useEffect, useRef } from 'react';
import { useMusicNotes } from '../contexts/MusicNotesContext.jsx';
import { hexToRgba, mixColor } from '../lib/helpers.js';

const itemColors = ['#c084fc', '#818cf8', '#38bdf8', '#2dd4bf', '#fbbf24', '#fb7185'];

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

function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getTheme() {
    return document.documentElement.dataset.theme || 'dark';
}

function getPalette() {
    return palettes[getTheme()] || palettes.dark;
}

function getPlayerColor() {
    return getTheme() === 'light' ? '#0f172a' : '#f8fafc';
}

class Particle {
    constructor(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 1.5 + 0.5;
    }
    update(w, h) {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
    }
    draw(ctx) {
        const alpha = Math.random() * 0.4 + 0.4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${getPalette().particle}, ${alpha})`;
        ctx.fill();
    }
}

class GameEngine {
    constructor() {
        this.score = 0;
        this.items = [];
        this.bursts = [];
        this.player = { x: 0, y: 0, targetX: 0, targetY: 0, radius: 12, tint: 0, tintColor: '#c084fc' };
        this.nextSpawnTime = performance.now() + 1000;
        this.enabled = false;
        this.scoreEl = null;
    }

    init() {
        const isTouch = window.matchMedia('(pointer: coarse)').matches
            || ('ontouchstart' in window)
            || (navigator.maxTouchPoints > 0);
        if (isTouch) {
            this.enabled = false;
            return;
        }
        this.enabled = true;
        this.score = 0;
        this.items = [];
        this.bursts = [];
        this.player = { x: 0, y: 0, targetX: 0, targetY: 0, radius: 12, tint: 0, tintColor: '#c084fc' };
        this.nextSpawnTime = performance.now() + 1000;
        this.scoreEl = document.getElementById('game-score');
        if (this.scoreEl) this.scoreEl.textContent = '0';
    }

    setTarget(x, y) {
        this.player.targetX = x;
        this.player.targetY = y;
    }

    draw(ctx, w, h) {
        if (!this.enabled) return;
        const now = performance.now();

        if (now >= this.nextSpawnTime) {
            this.items.push({
                x: Math.random() * (w - 20) + 10,
                y: -10,
                vx: (Math.random() - 0.5) * 1.2,
                speed: Math.random() * 2 + 1.8,
                radius: Math.random() * 3 + 3,
                color: itemColors[Math.floor(Math.random() * itemColors.length)]
            });
            this.nextSpawnTime = now + Math.random() * 1000 + 400;
        }

        this.player.x += (this.player.targetX - this.player.x) * 0.85;
        this.player.y += (this.player.targetY - this.player.y) * 0.85;
        this.player.tint *= 0.92;

        const basePlayerColor = getPlayerColor();
        const playerColor = this.player.tint > 0.01 ? mixColor(basePlayerColor, this.player.tintColor, this.player.tint) : basePlayerColor;
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
        ctx.fillStyle = playerColor;
        ctx.shadowColor = this.player.tint > 0.5 ? this.player.tintColor : cssVar('--accent');
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let i = this.items.length - 1; i >= 0; i--) {
            let item = this.items[i];
            item.x += item.vx;
            item.y += item.speed;

            const tailLength = item.speed * 36;
            const angle = Math.atan2(item.speed, item.vx);
            const steps = 14;
            for (let s = 0; s < steps; s++) {
                const t1 = s / steps;
                const t2 = (s + 1) / steps;
                const x1 = item.x - Math.cos(angle) * tailLength * t1;
                const y1 = item.y - Math.sin(angle) * tailLength * t1;
                const x2 = item.x - Math.cos(angle) * tailLength * t2;
                const y2 = item.y - Math.sin(angle) * tailLength * t2;
                const width = item.radius * 2 * (1 - t1) + 0.4 * t1;
                const segGrad = ctx.createLinearGradient(x1, y1, x2, y2);
                segGrad.addColorStop(0, hexToRgba(item.color, 0.9 * (1 - t1)));
                segGrad.addColorStop(1, hexToRgba(item.color, 0.9 * (1 - t2)));
                ctx.strokeStyle = segGrad;
                ctx.lineWidth = width;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
            ctx.fillStyle = basePlayerColor;
            ctx.shadowColor = item.color;
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;

            const dx = item.x - this.player.x;
            const dy = item.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= item.radius + this.player.radius) {
                this.score += 10;
                if (this.scoreEl) this.scoreEl.textContent = this.score;
                for (let k = 0; k < 10; k++) {
                    this.bursts.push({
                        x: item.x,
                        y: item.y,
                        vx: (Math.random() - 0.5) * 8,
                        vy: (Math.random() - 0.5) * 8,
                        radius: Math.random() * 2 + 1,
                        life: 1,
                        decay: Math.random() * 0.04 + 0.02,
                        color: item.color
                    });
                }
                this.player.tint = 1;
                this.player.tintColor = item.color;
                this.items.splice(i, 1);
            } else if (item.y > h || item.x < -50 || item.x > w + 50) {
                this.items.splice(i, 1);
            }
        }

        for (let i = this.bursts.length - 1; i >= 0; i--) {
            let b = this.bursts[i];
            b.x += b.vx;
            b.y += b.vy;
            b.life -= b.decay;
            if (b.life <= 0) {
                this.bursts.splice(i, 1);
                continue;
            }
            ctx.globalAlpha = b.life;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fillStyle = b.color;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
}

export default function BackgroundCanvas() {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const particlesRef = useRef([]);
    const gameRef = useRef(new GameEngine());
    const themeRef = useRef(getTheme());
    const sizeRef = useRef({ w: 0, h: 0 });
    const mouseRef = useRef({ x: 0, y: 0 });
    const notesRef = useMusicNotes();
    const rafRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const setup = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = window.innerWidth;
            const h = window.innerHeight;
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                ctxRef.current = ctx;
            }
            sizeRef.current = { w, h };
            particlesRef.current = [];
            const count = Math.min(w / 10, 120);
            for (let i = 0; i < count; i++) {
                particlesRef.current.push(new Particle(w, h));
            }
            themeRef.current = getTheme();
            gameRef.current.init();
        };

        setup();

        const onResize = () => setup();
        const onMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
            gameRef.current.setTarget(e.clientX, e.clientY);
        };
        const onTouchStart = (e) => {
            const t = e.touches[0];
            mouseRef.current = { x: t.clientX, y: t.clientY };
            gameRef.current.setTarget(t.clientX, t.clientY);
        };
        const onTouchMove = (e) => {
            e.preventDefault();
            const t = e.touches[0];
            mouseRef.current = { x: t.clientX, y: t.clientY };
            gameRef.current.setTarget(t.clientX, t.clientY);
        };

        window.addEventListener('resize', onResize);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: false });

        const loop = () => {
            const ctx = ctxRef.current;
            const { w, h } = sizeRef.current;
            if (!ctx) {
                rafRef.current = requestAnimationFrame(loop);
                return;
            }

            if (getTheme() !== themeRef.current) {
                themeRef.current = getTheme();
                particlesRef.current = [];
                const count = Math.min(w / 10, 120);
                for (let i = 0; i < count; i++) {
                    particlesRef.current.push(new Particle(w, h));
                }
            }

            const isLight = getTheme() === 'light';
            ctx.clearRect(0, 0, w, h);

            if (!isLight) {
                particlesRef.current.forEach((p) => {
                    p.update(w, h);
                    p.draw(ctx);
                });
                for (let i = 0; i < particlesRef.current.length; i++) {
                    for (let j = i + 1; j < particlesRef.current.length; j++) {
                        const dx = particlesRef.current[i].x - particlesRef.current[j].x;
                        const dy = particlesRef.current[i].y - particlesRef.current[j].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 100) {
                            ctx.beginPath();
                            ctx.strokeStyle = `rgba(${getPalette().line}, ${0.08 * (1 - dist / 100)})`;
                            ctx.lineWidth = 1;
                            ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
                            ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
                            ctx.stroke();
                        }
                    }
                }
                gameRef.current.draw(ctx, w, h);
            }

            drawCelestial(ctx, w, h);
            updateMusicNotes();

            rafRef.current = requestAnimationFrame(loop);
        };

        const drawCelestial = (ctx, w, h) => {
            const x = w - 110;
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
        };

        const updateMusicNotes = () => {
            if (!notesRef) return;
            const now = performance.now();
            for (let i = notesRef.current.length - 1; i >= 0; i--) {
                const note = notesRef.current[i];
                let progress = (now - note.start) / note.duration;
                if (progress >= 1) {
                    note.remove();
                    notesRef.current.splice(i, 1);
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
        };

        rafRef.current = requestAnimationFrame(loop);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
        };
    }, [notesRef]);

    return <canvas id="canvas-bg" ref={canvasRef} />;
}
