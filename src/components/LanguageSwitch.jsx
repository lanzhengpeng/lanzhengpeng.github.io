import { useLanguage } from '../contexts/LanguageContext.jsx';

export default function LanguageSwitch() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="lang-switch">
            <button
                data-lang="en"
                className={language === 'en' ? 'active' : ''}
                onClick={() => setLanguage('en')}
            >
                EN
            </button>
            <button
                data-lang="zh"
                className={language === 'zh' ? 'active' : ''}
                onClick={() => setLanguage('zh')}
            >
                中文
            </button>
        </div>
    );
}
