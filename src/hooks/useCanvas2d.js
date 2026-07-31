import { useEffect, useRef } from 'react';

export function useCanvas2d(canvasRef) {
    const ctxRef = useRef(null);
    const dprRef = useRef(1);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            dprRef.current = dpr;
            canvas.width = Math.floor(window.innerWidth * dpr);
            canvas.height = Math.floor(window.innerHeight * dpr);
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                ctxRef.current = ctx;
            }
        };

        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [canvasRef]);

    return { ctx: ctxRef.current, canvas: canvasRef.current, dpr: dprRef.current };
}
