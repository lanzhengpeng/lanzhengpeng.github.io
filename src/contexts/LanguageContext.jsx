import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { i18n } from '../lib/i18n.js';

const STORAGE_KEY = 'language';
const VALID_LANGS = ['en', 'zh'];

function getStoredLanguage() {
    if (typeof window === 'undefined') return 'en';
    const stored = localStorage.getItem(STORAGE_KEY);
    return VALID_LANGS.includes(stored) ? stored : 'en';
}

const LanguageContext = createContext({
    language: 'en',
    setLanguage: () => {},
    t: () => '',
});

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(getStoredLanguage);

    useEffect(() => {
        document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    }, [language]);

    const setLanguage = useCallback((lang) => {
        if (!VALID_LANGS.includes(lang)) return;
        localStorage.setItem(STORAGE_KEY, lang);
        setLanguageState(lang);
    }, []);

    const t = useCallback(
        (key) => {
            return i18n[language][key] ?? '';
        },
        [language]
    );

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
