import { i18n } from '../data/i18n.js';
import { formatDate } from '../utils/helpers.js';
import { setPhrases, resetTypewriter, type } from './typewriter.js';

export let currentLang = 'en';

const typewriterEl = document.getElementById('typewriter');
const lastUpdatedEl = document.getElementById('last-updated');
const skillsGrid = document.getElementById('skills-grid');

export function renderSkills(lang) {
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

document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
});
