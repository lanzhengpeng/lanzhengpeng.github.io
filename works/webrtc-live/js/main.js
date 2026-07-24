(function () {
    const themeSwitch = document.getElementById('theme-switch');
    const stored = localStorage.getItem('theme');
    const theme = stored === 'light' || stored === 'dark' ? stored : 'dark';
    document.documentElement.dataset.theme = theme;

    if (themeSwitch) {
        themeSwitch.addEventListener('click', () => {
            const current = document.documentElement.dataset.theme;
            const next = current === 'light' ? 'dark' : 'light';
            document.documentElement.dataset.theme = next;
            localStorage.setItem('theme', next);
        });
    }
})();
