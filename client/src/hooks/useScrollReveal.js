import { useEffect, useRef } from 'react';

/**
 * useScrollReveal — IntersectionObserver-based scroll reveal.
 * Adds 'revealed' class when element enters viewport.
 * Uses vanilla CSS transitions for 60fps performance.
 */
export default function useScrollReveal(options = {}) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('revealed');
                    observer.unobserve(el);
                }
            },
            { threshold: options.threshold || 0.15, rootMargin: options.rootMargin || '0px 0px -60px 0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return ref;
}
