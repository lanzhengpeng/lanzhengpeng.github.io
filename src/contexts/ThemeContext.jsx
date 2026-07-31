import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'theme';
const VALID_THEMES = ['dark', 'light'];

function getStoredTheme() {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem(STORAGE_KEY);
    return VALID_THEMES.includes(stored) ? stored : 'dark';
}

const ThemeContext = createContext({
    theme: 'dark',
    toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getStoredTheme);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem(STORAGE_KEY, theme);
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
