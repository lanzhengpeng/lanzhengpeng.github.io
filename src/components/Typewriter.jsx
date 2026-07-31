import { useEffect, useRef } from 'react';

export default function Typewriter({ phrases, delay = 2500 }) {
    const elRef = useRef(null);
    const phraseIndexRef = useRef(0);
    const charIndexRef = useRef(0);
    const isDeletingRef = useRef(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const el = elRef.current;
        if (!el || !phrases.length) return;

        phraseIndexRef.current = 0;
        charIndexRef.current = 0;
        isDeletingRef.current = false;
        el.textContent = '';
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        const type = () => {
            if (!el) return;
            const current = phrases[phraseIndexRef.current];
            if (isDeletingRef.current) {
                el.textContent = current.substring(0, charIndexRef.current - 1);
                charIndexRef.current--;
            } else {
                el.textContent = current.substring(0, charIndexRef.current + 1);
                charIndexRef.current++;
            }

            let speed = isDeletingRef.current ? 30 : 80;
            if (!isDeletingRef.current && charIndexRef.current === current.length) {
                speed = delay;
                isDeletingRef.current = true;
            } else if (isDeletingRef.current && charIndexRef.current === 0) {
                isDeletingRef.current = false;
                phraseIndexRef.current = (phraseIndexRef.current + 1) % phrases.length;
                speed = 500;
            }
            timeoutRef.current = setTimeout(type, speed);
        };

        type();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [phrases, delay]);

    return <span id="typewriter" ref={elRef} />;
}
