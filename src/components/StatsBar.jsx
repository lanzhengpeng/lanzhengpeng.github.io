import { formatDate } from '../lib/helpers.js';

export default function StatsBar({
    visitorCount,
    plusOneCount,
    onPlusOne,
    language,
    lastUpdatedText,
}) {
    return (
        <>
            <div className="game-score">
                Score: <span id="game-score">0</span>
            </div>
            <div className="visitor-counter" aria-label="Visitors">
                <span>{language === 'zh' ? '访客' : 'Visitors'}</span>
                <span id="visitor-count" className="stat-count">{visitorCount}</span>
            </div>
            <div className="plus-one-counter" aria-label="Plus one counter">
                <button id="plus-one-btn" className="stat-btn plus-one-btn" onClick={onPlusOne}>+1</button>
                <span id="plus-one-count" className="stat-count">{plusOneCount}</span>
            </div>
            <div className="last-updated-fixed" id="last-updated">
                {lastUpdatedText}{formatDate(new Date(), language)}
            </div>
        </>
    );
}
