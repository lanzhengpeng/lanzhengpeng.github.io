import { i18n } from '../data/i18n.js';
import { formatDate } from '../utils/helpers.js';
import { setPhrases, resetTypewriter, type } from './typewriter.js';

export let currentLang = 'en';

let langButtons = [];
let clickHandler = null;

function renderSkills(lang) {
    const skillsGrid = document.getElementById('skills-grid');
    if (!skillsGrid) return;
    skillsGrid.innerHTML = '';
    i18n[lang].skills.forEach(skill => {
        const tag = document.createElement('span');
        tag.className = 'skill-tag';
        tag.textContent = skill;
        skillsGrid.appendChild(tag);
    });
}

export function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (i18n[lang][key]) {
            el.textContent = i18n[lang][key];
        }
    });

    renderSkills(lang);

    const lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl) {
        lastUpdatedEl.textContent = i18n[lang].lastUpdated + formatDate(new Date(), lang);
    }

    document.querySelectorAll('.lang-switch button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    setPhrases(i18n[lang].phrases);
    resetTypewriter();
    type();
}

export function initLanguage() {
    destroyLanguage();

    langButtons = Array.from(document.querySelectorAll('.lang-switch button'));
    clickHandler = (e) => {
        const btn = e.target.closest('.lang-switch button');
        if (!btn) return;
        applyLanguage(btn.dataset.lang);
    };
    langButtons.forEach(btn => btn.addEventListener('click', clickHandler));

    applyLanguage(currentLang);
}

export function destroyLanguage() {
    if (clickHandler) {
        langButtons.forEach(btn => btn.removeEventListener('click', clickHandler));
    }
    langButtons = [];
    clickHandler = null;
}
