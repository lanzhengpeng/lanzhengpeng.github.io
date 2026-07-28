const likeBtn = document.getElementById('like-btn');
const likeCountEl = document.getElementById('like-count');
const visitorCountEl = document.getElementById('visitor-count');
const plusOneBtn = document.getElementById('plus-one-btn');
const plusOneCountEl = document.getElementById('plus-one-count');

let abortController = null;
let listeners = [];

function setText(el, value) {
    if (el) el.textContent = value;
}

async function fetchCount(url, signal) {
    const res = await fetch(url, { method: 'GET', signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

function markLiked(message) {
    if (!likeBtn) return;
    likeBtn.classList.add('liked');
    likeBtn.title = message || 'You can only like once per day';
}

async function initLikeCount(signal) {
    if (!likeCountEl) return;
    try {
        const data = await fetchCount('/like', signal);
        setText(likeCountEl, data.count);
        if (data.alreadyLikedToday) {
            markLiked(data.message);
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Failed to load like count:', err);
        }
    }
}

async function initVisitorCount(signal) {
    if (!visitorCountEl) return;
    try {
        const cached = sessionStorage.getItem('visitor_count');
        if (cached !== null) {
            setText(visitorCountEl, cached);
            return;
        }

        const data = await fetchCount('/visitors', signal);
        setText(visitorCountEl, data.count);
        sessionStorage.setItem('visitor_count', String(data.count));
        sessionStorage.setItem('visitor_counted', 'true');
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Failed to load visitor count:', err);
        }
    }
}

function initLikeButton() {
    if (!likeBtn) return;

    if (localStorage.getItem('liked')) {
        likeBtn.classList.add('liked');
    }

    const handler = async () => {
        if (likeBtn.classList.contains('liked')) return;

        try {
            const res = await fetch('/like', { method: 'POST' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setText(likeCountEl, data.count);

            if (data.alreadyLikedToday) {
                markLiked(data.message);
            } else {
                localStorage.setItem('liked', 'true');
                markLiked();
            }
        } catch (err) {
            console.error('Failed to like:', err);
        }
    };
    likeBtn.addEventListener('click', handler);
    listeners.push({ el: likeBtn, event: 'click', handler });
}

async function initPlusOneCount(signal) {
    if (!plusOneCountEl) return;
    try {
        const data = await fetchCount('/plus-one', signal);
        setText(plusOneCountEl, data.count);
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Failed to load +1 count:', err);
        }
    }
}

function initPlusOneButton() {
    if (!plusOneBtn) return;

    const handler = async () => {
        try {
            const res = await fetch('/plus-one', { method: 'POST' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setText(plusOneCountEl, data.count);
        } catch (err) {
            console.error('Failed to +1:', err);
        }
    };
    plusOneBtn.addEventListener('click', handler);
    listeners.push({ el: plusOneBtn, event: 'click', handler });
}

export function initStats() {
    destroyStats();
    abortController = new AbortController();
    const { signal } = abortController;

    initLikeCount(signal);
    initVisitorCount(signal);
    initLikeButton();
    initPlusOneCount(signal);
    initPlusOneButton();
}

export function destroyStats() {
    if (abortController) {
        abortController.abort();
        abortController = null;
    }
    listeners.forEach(({ el, event, handler }) => el.removeEventListener(event, handler));
    listeners = [];
}
