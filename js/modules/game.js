import { hexToRgb, mixColor, hexToRgba } from '../utils/helpers.js';

const canvas = document.getElementById('canvas-bg');
const ctx = canvas.getContext('2d');

let score = 0;
let player = { x: 0, y: 0, targetX: 0, targetY: 0, radius: 12, tint: 0, tintColor: '#c084fc' };
let items = [];
let bursts = [];
const itemColors = ['#c084fc', '#818cf8', '#38bdf8', '#2dd4bf', '#fbbf24', '#fb7185'];
const scoreEl = document.getElementById('game-score');
let nextSpawnTime = performance.now() + 1000;

function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getPlayerColor() {
    const theme = document.documentElement.dataset.theme || 'dark';
    return theme === 'light' ? '#0f172a' : '#f8fafc';
}

window.addEventListener('mousemove', (e) => {
    player.targetX = e.clientX;
    player.targetY = e.clientY;
});
window.addEventListener('touchstart', (e) => {
    player.targetX = e.touches[0].clientX;
    player.targetY = e.touches[0].clientY;
}, { passive: true });
window.addEventListener('touchmove', (e) => {
    e.preventDefault();
    player.targetX = e.touches[0].clientX;
    player.targetY = e.touches[0].clientY;
}, { passive: false });

export function drawGame() {
    const now = performance.now();

    if (now >= nextSpawnTime) {
        items.push({
            x: Math.random() * (canvas.width - 20) + 10,
            y: -10,
            vx: (Math.random() - 0.5) * 1.2,
            speed: Math.random() * 2 + 1.8,
            radius: Math.random() * 3 + 3,
            color: itemColors[Math.floor(Math.random() * itemColors.length)]
        });
        nextSpawnTime = now + Math.random() * 1000 + 400;
    }

    player.x += (player.targetX - player.x) * 0.85;
    player.y += (player.targetY - player.y) * 0.85;

    player.tint *= 0.92;

    const basePlayerColor = getPlayerColor();
    const playerColor = player.tint > 0.01 ? mixColor(basePlayerColor, player.tintColor, player.tint) : basePlayerColor;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = playerColor;
    ctx.shadowColor = player.tint > 0.5 ? player.tintColor : cssVar('--accent');
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;

    for (let i = items.length - 1; i >= 0; i--) {
        let item = items[i];
        item.x += item.vx;
        item.y += item.speed;

        const tailLength = item.speed * 36;
        const angle = Math.atan2(item.speed, item.vx);
        const tailX = item.x - Math.cos(angle) * tailLength;
        const tailY = item.y - Math.sin(angle) * tailLength;

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

        const dx = item.x - player.x;
        const dy = item.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= item.radius + player.radius) {
            score += 10;
            if (scoreEl) scoreEl.textContent = score;
            for (let k = 0; k < 10; k++) {
                bursts.push({
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
            player.tint = 1;
            player.tintColor = item.color;
            items.splice(i, 1);
        } else if (item.y > canvas.height || item.x < -50 || item.x > canvas.width + 50) {
            items.splice(i, 1);
        }
    }

    for (let i = bursts.length - 1; i >= 0; i--) {
        let b = bursts[i];
        b.x += b.vx;
        b.y += b.vy;
        b.life -= b.decay;
        if (b.life <= 0) {
            bursts.splice(i, 1);
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
