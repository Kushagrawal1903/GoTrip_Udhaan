import { useState, useEffect } from 'react';

/**
 * Skeleton — shimmer loading placeholder with improved visual design
 */
export default function Skeleton({ width = '100%', height = 20, borderRadius = 12, style = {} }) {
    return (
        <div
            className="skeleton"
            style={{ width, height, borderRadius, ...style }}
        />
    );
}

/* ── Loading stage definitions ─────────────────────────── */
const STAGES = [
    { icon: '🌍', label: 'Analyzing your destination...' },
    { icon: '🗺️', label: 'Building your itinerary...' },
    { icon: '🏨', label: 'Finding the best hotels...' },
    { icon: '💰', label: 'Calculating your budget...' },
    { icon: '✈️', label: 'Finalizing your trip plan...' },
];

const FUN_FACTS = [
    'The shortest commercial flight in the world is just 57 seconds ✈️',
    'France is the most visited country in the world 🇫🇷',
    'There are over 4,000 languages spoken around the world 🌏',
    'Japan has over 6,800 islands to explore 🏝️',
    'The Great Wall of China is over 13,000 miles long 🧱',
    'Iceland has no mosquitoes 🦟❌',
    'Venice is built on 118 small islands 🇮🇹',
    'Australia is wider than the Moon 🌙',
];

/**
 * TripSkeleton — immersive, animated loading screen for AI trip generation
 */
export function TripSkeleton() {
    const [activeStage, setActiveStage] = useState(0);
    const [fact, setFact] = useState(() => FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);

    useEffect(() => {
        const stageTimer = setInterval(() => {
            setActiveStage((prev) => (prev + 1) % STAGES.length);
        }, 3000);

        const factTimer = setInterval(() => {
            setFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
        }, 5000);

        return () => {
            clearInterval(stageTimer);
            clearInterval(factTimer);
        };
    }, []);

    return (
        <div className="animate-fade-in" style={{ maxWidth: 600, margin: '0 auto', padding: '60px 20px' }}>
            {/* Main loading card */}
            <div className="glass-card" style={{
                padding: '48px 36px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(13,148,136,0.04), rgba(79,70,229,0.04), rgba(168,85,247,0.04))',
                border: '1px solid var(--border-color)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Subtle animated background glow */}
                <div style={{
                    position: 'absolute',
                    top: '-50%', left: '-50%',
                    width: '200%', height: '200%',
                    background: 'radial-gradient(circle at 50% 50%, rgba(13,148,136,0.06) 0%, transparent 60%)',
                    animation: 'gentleSpin 12s linear infinite',
                    pointerEvents: 'none',
                }} />

                {/* Animated globe icon */}
                <div style={{
                    fontSize: '3.5rem',
                    marginBottom: 20,
                    animation: 'floatBob 3s ease-in-out infinite',
                    position: 'relative',
                    zIndex: 1,
                }}>
                    {STAGES[activeStage].icon}
                </div>

                {/* Title */}
                <h3 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 800,
                    fontSize: '1.4rem',
                    marginBottom: 8,
                    color: 'var(--text-primary)',
                    position: 'relative',
                    zIndex: 1,
                }}>
                    Crafting your perfect trip
                </h3>

                {/* Current stage label */}
                <p style={{
                    color: 'var(--color-primary)',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    marginBottom: 28,
                    minHeight: '1.4em',
                    transition: 'opacity 0.3s ease',
                    position: 'relative',
                    zIndex: 1,
                }}>
                    {STAGES[activeStage].label}
                </p>

                {/* Progress steps */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 10,
                    marginBottom: 28,
                    position: 'relative',
                    zIndex: 1,
                }}>
                    {STAGES.map((_, i) => (
                        <div key={i} style={{
                            width: i === activeStage ? 32 : 10,
                            height: 10,
                            borderRadius: 5,
                            background: i === activeStage
                                ? 'var(--color-primary)'
                                : i < activeStage
                                    ? 'var(--color-primary-light)'
                                    : 'var(--border-color)',
                            opacity: i <= activeStage ? 1 : 0.4,
                            transition: 'all 0.4s ease',
                        }} />
                    ))}
                </div>

                {/* Gradient progress bar */}
                <div style={{
                    height: 4,
                    borderRadius: 2,
                    background: 'var(--border-color)',
                    maxWidth: 320,
                    margin: '0 auto 28px',
                    overflow: 'hidden',
                    position: 'relative',
                    zIndex: 1,
                }}>
                    <div style={{
                        height: '100%',
                        borderRadius: 2,
                        background: 'linear-gradient(90deg, #0d9488, #4f46e5, #a855f7, #0d9488)',
                        backgroundSize: '200% 100%',
                        animation: 'gradientSlide 2s linear infinite',
                    }} />
                </div>

                {/* Fun fact */}
                <div style={{
                    padding: '14px 20px',
                    borderRadius: 10,
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-color)',
                    position: 'relative',
                    zIndex: 1,
                }}>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        marginBottom: 4,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}>
                        ✨ Did you know?
                    </p>
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                        minHeight: '1.5em',
                    }}>
                        {fact}
                    </p>
                </div>
            </div>

            {/* Skeleton preview beneath */}
            <div style={{ marginTop: 28, opacity: 0.5 }}>
                <Skeleton height={14} width={120} style={{ marginBottom: 12 }} />
                <Skeleton height={180} borderRadius={16} style={{ marginBottom: 16 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} height={100} borderRadius={12} />
                    ))}
                </div>
            </div>
        </div>
    );
}
