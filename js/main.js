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
        gameTip: "Move your mouse to catch the falling energy fragments.",
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
        gameTip: "移动鼠标控制底板，接住掉落的能量碎片。",
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
        abstractText: `大语言模型（LLM）在 ReAct 框架下展现出作为自主智能体的广阔前景，但在多步工具调用场景中仍容易受到错误级联的影响。引入轻量级验证器是一种自然的缓解策略，但我们发现这类验证器的端到端文本判断往往不稳定且不可靠。为此，本文提出 LatentReAct，一种基于隐空间的验证框架，通过分解式表示验证来增强 ReAct 智能体。LatentReAct 不再依赖生成的文本，而是从冻结的 30 亿参数模型中提取中间层隐表示，并将动作评估分解为多个语义维度，再由轻量级策略头基于这些隐特征为候选动作打分。在 ToolBench 与 BFCL v4 上的实验表明，LatentReAct 显著优于强基线方法：在 ToolBench 上验证准确率达 74.47%，端到端执行准确率提升最高 5 个百分点，并将不必要的推理步骤减少 12–16%。`
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
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(129, 140, 248, 0.4)';
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = Math.min(window.innerWidth / 15, 70);
    for (let i = 0; i < count; i++) particles.push(new Particle());
}
initParticles();

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
                ctx.strokeStyle = `rgba(129, 140, 248, ${0.1 * (1 - dist / 100)})`;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
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

// ================= 小游戏逻辑 =================
const gameCanvas = document.getElementById('game-canvas');
const gCtx = gameCanvas.getContext('2d');
const scoreEl = document.getElementById('game-score');

function resizeGame() {
    if (gameCanvas && gameCanvas.parentElement) {
        gameCanvas.width = gameCanvas.parentElement.clientWidth - 48;
        gameCanvas.height = 300;
    }
}
window.addEventListener('resize', resizeGame);
setTimeout(resizeGame, 100);

let score = 0;
let player = { x: 0, width: 80, height: 6 };
let items = [];
let spawnTimeout;

if (gameCanvas) {
    gameCanvas.addEventListener('mousemove', (e) => {
        const rect = gameCanvas.getBoundingClientRect();
        player.x = e.clientX - rect.left - player.width / 2;
    });

    gameCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = gameCanvas.getBoundingClientRect();
        player.x = e.touches[0].clientX - rect.left - player.width / 2;
    }, { passive: false });
}

function spawnItem() {
    if (!gameCanvas) return;
    items.push({
        x: Math.random() * (gameCanvas.width - 20) + 10,
        y: -10,
        speed: Math.random() * 2 + 1.5,
        radius: Math.random() * 3 + 3,
        color: Math.random() > 0.5 ? '#818cf8' : '#c084fc'
    });
    spawnTimeout = setTimeout(spawnItem, Math.random() * 1000 + 400);
}
setTimeout(spawnItem, 1000);

function updateGame() {
    if (!gameCanvas) return;
    gCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > gameCanvas.width) player.x = gameCanvas.width - player.width;

    gCtx.fillStyle = '#f8fafc';
    gCtx.shadowColor = '#818cf8';
    gCtx.shadowBlur = 15;
    gCtx.beginPath();
    if (gCtx.roundRect) {
        gCtx.roundRect(player.x, gameCanvas.height - 20, player.width, player.height, 3);
    } else {
        gCtx.rect(player.x, gameCanvas.height - 20, player.width, player.height);
    }
    gCtx.fill();
    gCtx.shadowBlur = 0;

    for (let i = items.length - 1; i >= 0; i--) {
        let item = items[i];
        item.y += item.speed;

        gCtx.beginPath();
        gCtx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        gCtx.fillStyle = item.color;
        gCtx.shadowColor = item.color;
        gCtx.shadowBlur = 10;
        gCtx.fill();
        gCtx.shadowBlur = 0;

        if (item.y + item.radius >= gameCanvas.height - 20 &&
            item.y - item.radius <= gameCanvas.height - 20 + player.height &&
            item.x >= player.x &&
            item.x <= player.x + player.width) {
            score += 10;
            if (scoreEl) scoreEl.textContent = score;
            items.splice(i, 1);
        } else if (item.y > gameCanvas.height) {
            items.splice(i, 1);
        }
    }
    requestAnimationFrame(updateGame);
}
updateGame();
// ================= 小游戏逻辑结束 =================
