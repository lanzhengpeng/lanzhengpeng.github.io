(function() {
    const STORAGE_KEY = 'theme';
    const VALID_THEMES = ['dark', 'light'];
    const SWITCHER_ID = 'theme-switch';

    function getTheme() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return VALID_THEMES.includes(stored) ? stored : 'dark';
    }

    function updateSwitcher(theme) {
        const switcher = document.getElementById(SWITCHER_ID);
        const btn = switcher?.querySelector('button');
        if (!switcher || !btn) return;

        switcher.classList.remove('is-light', 'is-dark');
        switcher.classList.add(`is-${theme}`);
        btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    }

    function setTheme(theme) {
        if (!VALID_THEMES.includes(theme)) return;
        document.documentElement.dataset.theme = theme;
        localStorage.setItem(STORAGE_KEY, theme);
        updateSwitcher(theme);
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }

    function toggleTheme() {
        setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    }

    function initTheme() {
        const theme = getTheme();
        document.documentElement.dataset.theme = theme;
        updateSwitcher(theme);

        const switcher = document.getElementById(SWITCHER_ID);
        const btn = switcher?.querySelector('button');
        if (btn) {
            btn.addEventListener('click', toggleTheme);
        }
    }

    window.__theme = { getTheme, setTheme, toggleTheme, initTheme };
})();
