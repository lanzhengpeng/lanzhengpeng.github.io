import { useEffect, useState, useCallback, useRef } from 'react';

async function fetchCount(url, signal) {
    const res = await fetch(url, { method: 'GET', signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export function useStats() {
    const [likeCount, setLikeCount] = useState(0);
    const [visitorCount, setVisitorCount] = useState(0);
    const [plusOneCount, setPlusOneCount] = useState(0);
    const [liked, setLiked] = useState(false);
    const abortRef = useRef(null);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        abortRef.current = controller;

        const init = async () => {
            try {
                const likeData = await fetchCount('/like', signal);
                setLikeCount(likeData.count);
                if (likeData.alreadyLikedToday || localStorage.getItem('liked')) {
                    setLiked(true);
                }
            } catch (err) {
                if (err.name !== 'AbortError') console.error('Failed to load like count:', err);
            }

            try {
                const cached = sessionStorage.getItem('visitor_count');
                if (cached !== null) {
                    setVisitorCount(Number(cached));
                } else {
                    const visitorData = await fetchCount('/visitors', signal);
                    setVisitorCount(visitorData.count);
                    sessionStorage.setItem('visitor_count', String(visitorData.count));
                    sessionStorage.setItem('visitor_counted', 'true');
                }
            } catch (err) {
                if (err.name !== 'AbortError') console.error('Failed to load visitor count:', err);
            }

            try {
                const plusData = await fetchCount('/plus-one', signal);
                setPlusOneCount(plusData.count);
            } catch (err) {
                if (err.name !== 'AbortError') console.error('Failed to load +1 count:', err);
            }
        };

        init();

        return () => controller.abort();
    }, []);

    const like = useCallback(async () => {
        if (liked) return;
        try {
            const res = await fetch('/like', { method: 'POST' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setLikeCount(data.count);
            if (data.alreadyLikedToday) {
                setLiked(true);
            } else {
                localStorage.setItem('liked', 'true');
                setLiked(true);
            }
        } catch (err) {
            console.error('Failed to like:', err);
        }
    }, [liked]);

    const plusOne = useCallback(async () => {
        try {
            const res = await fetch('/plus-one', { method: 'POST' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setPlusOneCount(data.count);
        } catch (err) {
            console.error('Failed to +1:', err);
        }
    }, []);

    return { likeCount, visitorCount, plusOneCount, liked, like, plusOne };
}
