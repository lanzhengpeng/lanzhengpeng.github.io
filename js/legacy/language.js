(function() {
    const i18n = window.__i18n;
    const formatDate = window.__helpers.formatDate;
    const typewriter = window.__typewriter;

    let currentLang = 'en';

    const typewriterEl = document.getElementById('typewriter');
    const lastUpdatedEl = document.getElementById('last-updated');
    const skillsGrid = document.getElementById('skills-grid');

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

        typewriter.setPhrases(i18n[lang].phrases);
        typewriter.resetTypewriter();
        typewriter.type();
    }

    document.querySelectorAll('.lang-switch button').forEach(btn => {
        btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
    });

    window.__language = { currentLang: () => currentLang, renderSkills, applyLanguage };
})();
