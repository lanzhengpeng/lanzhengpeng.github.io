const i18n = {
    en: {
        name: "Zhengpeng Lan",
        heroIntro: "M.S. in Software Engineering, Zhejiang Normal University · Agent Framework Researcher",
        navPub: "Publication",
        aboutTitle: "About Me",
        aboutText: "I am Zhengpeng Lan, a master's student in Software Engineering at Zhejiang Normal University, and an agent framework researcher. My research centers on LLM agents, tool learning, and latent-space verification, with the goal of building more robust and reliable autonomous systems.",
        pubTitle: "Selected Publication",
        downloadBtn: "Download PDF",
        viewSpringer: "View on Springer",
        lastUpdated: "Last updated: ",
        skillsTitle: "Skills",
        gameTitle: "Mini Game",
        gameTip: "Move your mouse to guide the orb and collect falling fragments.",
        skills: [
            "Java",
            "Spring Boot",
            "Agent Development",
            "LangGraph",
            "Python",
            "PyTorch",
            "LLM",
            "ReAct"
        ],
        phrases: [
            "LLM Agent Researcher",
            "Tool Learning Enthusiast",
            "Open Source Contributor"
        ],
        abstractText: `Large Language Models (LLMs) exhibit promising capabilities as autonomous agents within the ReAct framework, yet they remain vulnerable to cascading errors in multi-step tool invocation scenarios. While introducing a lightweight verifier offers a natural mitigation strategy, we observe that end-to-end textual judgments from such verifiers are often unstable and unreliable. In this paper, we propose LatentReAct, a latent-space verification framework that enhances ReAct agents through decompositional representation validation. Instead of relying on generated text, LatentReAct extracts intermediate-layer latent representations from a frozen 3B-parameter model and decomposes action evaluation into multiple semantic dimensions. A lightweight policy head then scores candidate actions based on these latent features. Experiments on ToolBench and BFCL v4 demonstrate that LatentReAct significantly outperforms strong baselines, achieving 74.47% verification accuracy on ToolBench, improving end-to-end execution accuracy by up to 5 percentage points, and reducing unnecessary reasoning steps by 12–16%.`
    },
    zh: {
        name: "兰政鹏",
        heroIntro: "浙江师范大学 · 软件工程硕士 · 智能体框架研究者",
        navPub: "论文",
        aboutTitle: "关于我",
        aboutText: "我是兰政鹏，浙江师范大学软件工程专业硕士研究生，智能体框架研究者。我的研究聚焦于大模型智能体、工具学习与隐空间验证，致力于构建更稳健、更可靠的自主系统。",
        pubTitle: "代表性论文",
        downloadBtn: "下载 PDF",
        viewSpringer: "Springer 查看",
        lastUpdated: "最近更新：",
        skillsTitle: "技能",
        gameTitle: "互动小游戏",
        gameTip: "移动鼠标控制光球，收集掉落的紫色碎片。",
        skills: [
            "Java",
            "Spring Boot",
            "智能体开发",
            "LangGraph",
            "Python",
            "PyTorch",
            "大语言模型",
            "ReAct"
        ],
        phrases: [
            "大模型智能体研究者",
            "工具学习爱好者",
            "开源贡献者"
        ],
        abstractText: `大语言模型（LLM）在 ReAct 框架下展现出作为自主智能体的广阔前景，但在多步工具调用场景中仍容易受到错误级联的影响。引入轻量级验证器是一种自然的缓解策略，但我们发现这类验证器的端到端文本判断往往不稳定且不可靠。为此，本文提出 LatentReAct，一种基于隐空间的验证框架，通过分解式表示验证来增强 ReAct 智能体。LatentReAct 不再依赖生成的文本，而是从冻结的30亿参数模型中提取中间层隐表示，并将动作评估分解为多个语义维度，再由轻量级策略头基于这些隐特征为候选动作打分。在 ToolBench 与 BFCL v4 上的实验表明，LatentReAct 显著优于强基线方法：在 ToolBench 上验证准确率达 74.47%，端到端执行准确率提升最高5个百分点，并将不必要的推理步骤减少 12–16%。`
    }
};

let currentLang = 'en';
const typewriter = document.getElementById('typewriter');
const lastUpdatedEl = document.getElementById('last-updated');
const skillsGrid = document.getElementById('skills-grid');
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeTimeout;

function formatDate(date, lang) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return lang === 'zh' ? `${year}年${month}月${day}日` : `${year}-${month}-${day}`;
}

function renderSkills(lang) {
    if (!skillsGrid) return;
    skillsGrid.innerHTML = '';
    i18n[lang].skills.forEach(skill => {
        const tag = document.createElement('span');
        tag.className = 'skill-tag';
        tag.textContent = skill;
        skillsGrid.appendChild(tag);
    });
}

function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (i18n[lang][key]) {
            el.textContent = i18n[lang][key];
        }
    });

    renderSkills(lang);

    if (lastUpdatedEl) {
        lastUpdatedEl.textContent = i18n[lang].lastUpdated + formatDate(new Date(), lang);
    }

    document.querySelectorAll('.lang-switch button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    phraseIndex = 0;
    charIndex = 0;
    isDeleting = false;
    clearTimeout(typeTimeout);
    typewriter.textContent = '';
    type();
}

function type() {
    const phrases = i18n[currentLang].phrases;
    const current = phrases[phraseIndex];
    if (isDeleting) {
        typewriter.textContent = current.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typewriter.textContent = current.substring(0, charIndex + 1);
        charIndex++;
    }

    let speed = isDeleting ? 30 : 80;
    if (!isDeleting && charIndex === current.length) {
        speed = 2500;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        speed = 500;
    }
    typeTimeout = setTimeout(type, speed);
}

document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('section').forEach(section => observer.observe(section));

const canvas = document.getElementById('canvas-bg');
const ctx = canvas.getContext('2d');
let particles = [];

// Game state
let score = 0;
let player = { x: 0, y: 0, targetX: 0, targetY: 0, radius: 12, tint: 0 };
let items = [];
let bursts = [];
const scoreEl = document.getElementById('game-score');

function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mixColor(hex1, hex2, t) {
    const c1 = hexToRgb(hex1);
    const c2 = hexToRgb(hex2);
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);
    return `rgb(${r}, ${g}, ${b})`;
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Game input: orb follows mouse/touch anywhere on page
window.addEventListener('mousemove', (e) => {
    player.targetX = e.clientX;
    player.targetY = e.clientY;
});
window.addEventListener('touchmove', (e) => {
    player.targetX = e.touches[0].clientX;
    player.targetY = e.touches[0].clientY;
}, { passive: true });

function spawnItem() {
    items.push({
        x: Math.random() * (canvas.width - 20) + 10,
        y: -10,
        vx: (Math.random() - 0.5) * 1.2,
        speed: Math.random() * 2 + 1.8,
        radius: Math.random() * 3 + 3,
        color: '#c084fc'
    });
    setTimeout(spawnItem, Math.random() * 1000 + 400);
}
setTimeout(spawnItem, 1000);

function drawGame() {
    // Follow mouse almost instantly
    player.x += (player.targetX - player.x) * 0.85;
    player.y += (player.targetY - player.y) * 0.85;

    // Tint fades back to normal
    player.tint *= 0.92;

    // Draw player orb
    const playerColor = player.tint > 0.01 ? mixColor('#f8fafc', '#c084fc', player.tint) : '#f8fafc';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = playerColor;
    ctx.shadowColor = player.tint > 0.5 ? '#c084fc' : '#818cf8';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;

    for (let i = items.length - 1; i >= 0; i--) {
        let item = items[i];
        item.x += item.vx;
        item.y += item.speed;

        // Meteor tail
        const tailLength = item.speed * 18;
        const angle = Math.atan2(item.speed, item.vx);
        const tailX = item.x - Math.cos(angle) * tailLength;
        const tailY = item.y - Math.sin(angle) * tailLength;
        const tailGrad = ctx.createLinearGradient(item.x, item.y, tailX, tailY);
        tailGrad.addColorStop(0, 'rgba(192, 132, 252, 0.9)');
        tailGrad.addColorStop(1, 'rgba(192, 132, 252, 0)');
        ctx.strokeStyle = tailGrad;
        ctx.lineWidth = item.radius * 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(item.x, item.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Meteor head
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f8fafc';
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
            // Burst effect
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
            items.splice(i, 1);
        } else if (item.y > canvas.height || item.x < -50 || item.x > canvas.width + 50) {
            items.splice(i, 1);
        }
    }

    // Update and draw burst particles
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
    const x = canvas.width - 90;
    const y = 90;
    const r = 40;

    // Outer glow
    const glow = ctx.createRadialGradient(x, y, r * 0.7, x, y, r * 3.5);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
    glow.addColorStop(0.4, 'rgba(165, 180, 252, 0.06)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Moon body
    const moonGrad = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.1, x, y, r);
    moonGrad.addColorStop(0, '#f8fafc');
    moonGrad.addColorStop(1, '#a5b4fc');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Soft inner shadow/crater hint
    ctx.fillStyle = 'rgba(99, 102, 241, 0.12)';
    ctx.beginPath();
    ctx.arc(x + r * 0.35, y + r * 0.2, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - r * 0.1, y + r * 0.45, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
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
    requestAnimationFrame(animateParticles);
}
animateParticles();

const avatar = document.getElementById('avatar');
document.addEventListener('mousemove', (e) => {
    if (window.innerWidth > 768) {
        const x = (e.clientX / window.innerWidth - 0.5) * 15;
        const y = (e.clientY / window.innerHeight - 0.5) * 15;
        avatar.style.transform = `translate(${x}px, ${y}px)`;
    }
});

applyLanguage('en');
