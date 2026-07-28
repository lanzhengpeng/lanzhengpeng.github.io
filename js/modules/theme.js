const STORAGE_KEY = 'theme';
const VALID_THEMES = ['dark', 'light'];
const SWITCHER_ID = 'theme-switch';

export function getTheme() {
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

export function setTheme(theme) {
    if (!VALID_THEMES.includes(theme)) return;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    updateSwitcher(theme);
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

export function toggleTheme() {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

export function initTheme() {
    const theme = getTheme();
    document.documentElement.dataset.theme = theme;
    updateSwitcher(theme);

    const switcher = document.getElementById(SWITCHER_ID);
    const btn = switcher?.querySelector('button');
    if (btn) {
        btn.addEventListener('click', toggleTheme);
    }
}
