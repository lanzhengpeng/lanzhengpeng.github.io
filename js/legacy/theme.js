(function() {
    const STORAGE_KEY = 'theme';
    const VALID_THEMES = ['dark', 'light'];

    function getTheme() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return VALID_THEMES.includes(stored) ? stored : 'dark';
    }

    function setTheme(theme) {
        if (!VALID_THEMES.includes(theme)) return;
        document.documentElement.dataset.theme = theme;
        localStorage.setItem(STORAGE_KEY, theme);
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }

    function toggleTheme() {
        setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    }

    function initTheme() {
        const stored = localStorage.getItem(STORAGE_KEY);
        const theme = VALID_THEMES.includes(stored) ? stored : 'dark';
        document.documentElement.dataset.theme = theme;

        const btn = document.querySelector('#theme-switch button');
        if (btn) {
            btn.addEventListener('click', toggleTheme);
        }
    }

    window.__theme = { getTheme, setTheme, toggleTheme, initTheme };
})();
