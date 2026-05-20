import { useState, useEffect } from 'react';

/**
 * useScrollProgress — tracks vertical scroll progress as 0-100.
 * Uses requestAnimationFrame for smooth updates.
 */
export default function useScrollProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollTop = window.scrollY;
                    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                    const pct = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0;
                    setProgress(pct);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return progress;
}
