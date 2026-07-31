import { useTheme } from '../contexts/ThemeContext.jsx';

export default function ThemeSwitch() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className={`theme-switch is-${theme}`} aria-label="Toggle theme">
            <button onClick={toggleTheme} aria-label="Toggle theme" aria-pressed={theme === 'dark'}>
                <svg className="icon-light" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
                <svg className="icon-dark" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
            </button>
        </div>
    );
}
