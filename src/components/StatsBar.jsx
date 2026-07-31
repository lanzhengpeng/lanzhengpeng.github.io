import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useStats } from '../hooks/useStats.js';
import { formatDate } from '../lib/helpers.js';

export default function StatsBar() {
    const { t, language } = useLanguage();
    const { likeCount, visitorCount, plusOneCount, liked, like, plusOne } = useStats();

    return (
        <>
            <div className="game-score">
                Score: <span id="game-score">0</span>
            </div>
            <div className="visitor-counter" aria-label="Visitors">
                <span>{t('visitorsLabel')}</span>
                <span id="visitor-count" className="stat-count">{visitorCount}</span>
            </div>
            <div className="plus-one-counter" aria-label="Plus one counter">
                <button id="plus-one-btn" className="stat-btn plus-one-btn" onClick={plusOne}>+1</button>
                <span id="plus-one-count" className="stat-count">{plusOneCount}</span>
            </div>
            <div className="last-updated-fixed" id="last-updated">
                {t('lastUpdated')}{formatDate(new Date(), language)}
            </div>
            <button
                id="like-btn"
                className={`stat-btn like-under-avatar ${liked ? 'liked' : ''}`}
                aria-label="Like"
                onClick={like}
                title={liked ? 'You can only like once per day' : ''}
            >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>{t('likeBtn')}</span>
                <span id="like-count" className="stat-count">{likeCount}</span>
            </button>
        </>
    );
}
