import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
    { title: 'AI-Powered Plans', desc: 'Personalized day-by-day itineraries crafted by Gemma 3 AI in seconds' },
    { title: 'Real Hotels', desc: 'Verified hotel picks with ratings, live images, and Google Maps links' },
    { title: 'Budget Insights', desc: 'Visual cost breakdown — know exactly where every rupee goes' },
    { title: 'Live Maps', desc: 'Embedded Google Maps preview for destinations and every hotel' },
    { title: 'Save & Export', desc: 'Save trips to your dashboard and download as printable PDFs' },
    { title: 'Dark Mode', desc: 'Clean interface with dark mode support and responsive layout' },
];

const DESTINATIONS = [
    { name: 'Goa', emoji: '🏖️', tagline: 'Beaches & Nightlife' },
    { name: 'Manali', emoji: '🏔️', tagline: 'Mountains & Snow' },
    { name: 'Jaipur', emoji: '🏰', tagline: 'Culture & Heritage' },
    { name: 'Kerala', emoji: '🌴', tagline: 'Backwaters & Nature' },
    { name: 'Varanasi', emoji: '🕉️', tagline: 'Spiritual & Ancient' },
    { name: 'Udaipur', emoji: '💕', tagline: 'Romance & Lakes' },
];

const STATS = [
    { value: '50+', label: 'Destinations' },
    { value: '₹0', label: 'Cost to Use' },
    { value: '30s', label: 'Generation Time' },
    { value: '24/7', label: 'AI Available' },
];

export default function Home() {
    const { isAuthenticated } = useAuth();

    return (
        <div style={{ width: '100%' }}>

            {/* ─── HERO ─────────────────────────────── */}
            <section style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '0 24px',
                background: '#0a0e1a',
                position: 'relative',
                overflow: 'hidden',
                marginTop: -64,
                paddingTop: 64,
            }}>
                {/* Subtle grid pattern */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                    backgroundSize: '64px 64px',
                    pointerEvents: 'none',
                }} />
                {/* Warm radial glow — top center */}
                <div style={{
                    position: 'absolute',
                    top: '-20%', left: '50%', transform: 'translateX(-50%)',
                    width: '120%', maxWidth: 900, aspectRatio: '1',
                    background: 'radial-gradient(circle, rgba(217,119,6,0.08) 0%, rgba(13,148,136,0.04) 40%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div className="animate-fade-in-up" style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
                    {/* Pill label */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '6px 16px',
                        borderRadius: 20,
                        border: '1px solid rgba(217,119,6,0.25)',
                        background: 'rgba(217,119,6,0.08)',
                        marginBottom: 24,
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f59e0b', letterSpacing: '0.02em' }}>
                            Powered by Gemma 3 AI
                        </span>
                    </div>

                    <h1 style={{
                        fontWeight: 800,
                        fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
                        color: '#ffffff',
                        marginBottom: 20,
                        lineHeight: 1.08,
                        letterSpacing: '-0.035em',
                    }}>
                        Plan your perfect<br />
                        trip to <span style={{
                            color: '#f59e0b',
                            position: 'relative',
                        }}>anywhere</span>
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                        color: 'rgba(255,255,255,0.5)',
                        maxWidth: 540,
                        margin: '0 auto 40px',
                        lineHeight: 1.7,
                    }}>
                        Get a complete day-by-day itinerary with hotel picks, budget breakdown,
                        and maps — generated in 30 seconds, completely free.
                    </p>

                    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link
                            to={isAuthenticated ? '/plan' : '/register'}
                            className="btn-primary"
                            style={{
                                padding: '16px 40px',
                                background: '#d97706',
                                fontSize: '1.08rem',
                                textDecoration: 'none',
                                borderRadius: 12,
                                boxShadow: '0 4px 20px rgba(217,119,6,0.35), 0 0 60px rgba(217,119,6,0.1)',
                                fontWeight: 700,
                            }}
                        >
                            Start Planning — It's Free
                        </Link>
                        {!isAuthenticated && (
                            <Link
                                to="/login"
                                style={{
                                    padding: '16px 32px',
                                    background: 'rgba(255,255,255,0.06)',
                                    color: 'rgba(255,255,255,0.8)',
                                    fontWeight: 600,
                                    borderRadius: 12,
                                    fontSize: '1rem',
                                    textDecoration: 'none',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    transition: 'all 0.2s',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                }}
                            >
                                Sign In →
                            </Link>
                        )}
                    </div>

                    {/* Trust indicators */}
                    <div style={{
                        marginTop: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 24,
                        flexWrap: 'wrap',
                    }}>
                        {['Gemma 3 AI', 'Google Maps', 'Real Hotels', 'PDF Export'].map((item, i) => (
                            <span key={item} style={{
                                fontSize: '0.76rem',
                                color: 'rgba(255,255,255,0.3)',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                            }}>
                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                                {item}
                            </span>
                        ))}
                    </div>

                    {/* Stats row */}
                    <div style={{
                        marginTop: 40,
                        display: 'flex',
                        gap: 0,
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        padding: '20px 0',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        {STATS.map((s, i) => (
                            <div key={s.label} style={{
                                padding: '10px 32px',
                                borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                            }}>
                                <div style={{
                                    fontWeight: 700,
                                    fontSize: '1.5rem',
                                    color: '#fff',
                                    marginBottom: 2,
                                }}>
                                    {s.value}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── POPULAR DESTINATIONS ──────────────────── */}
            <section style={{
                padding: '72px 24px',
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-color)',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <h2 style={{
                        fontWeight: 700,
                        fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
                        textAlign: 'center',
                        marginBottom: 6,
                        letterSpacing: '-0.01em',
                    }}>
                        Popular Destinations
                    </h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 36, fontSize: '0.92rem' }}>
                        Generate AI itineraries for India's most loved travel spots
                    </p>

                    <div className="stagger-children" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: 14,
                    }}>
                        {DESTINATIONS.map(d => (
                            <Link
                                key={d.name}
                                to={isAuthenticated ? '/plan' : '/register'}
                                className="glass-card"
                                style={{
                                    padding: '24px 16px',
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>{d.emoji}</div>
                                <div style={{
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    color: 'var(--text-primary)',
                                    marginBottom: 4,
                                }}>
                                    {d.name}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.tagline}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FEATURES GRID ───────────────────────────────── */}
            <section style={{ padding: '80px 24px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <h2 style={{
                        fontWeight: 700,
                        fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
                        textAlign: 'center',
                        marginBottom: 6,
                        letterSpacing: '-0.01em',
                    }}>
                        Everything You Need
                    </h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 44, fontSize: '0.92rem' }}>
                        A complete AI travel platform — plan, explore, and save
                    </p>

                    <div
                        className="stagger-children"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: 20,
                        }}
                    >
                        {FEATURES.map((f) => (
                            <div key={f.title} className="glass-card" style={{ padding: '28px 24px' }}>
                                <h3 style={{
                                    fontWeight: 700,
                                    fontSize: '1.05rem',
                                    marginBottom: 8,
                                    color: 'var(--text-primary)',
                                }}>
                                    {f.title}
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.65 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── HOW IT WORKS ────────────────────────────────── */}
            <section style={{
                padding: '80px 24px',
                background: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-color)',
                borderBottom: '1px solid var(--border-color)',
            }}>
                <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{
                        fontWeight: 700,
                        fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
                        marginBottom: 44,
                        letterSpacing: '-0.01em',
                    }}>
                        How It Works
                    </h2>
                    <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {[
                            { step: '1', title: 'Enter Details', desc: 'Pick destination, duration, budget & travel style' },
                            { step: '2', title: 'AI Generates', desc: 'Gemma 3 AI creates your personalized itinerary in ~30s' },
                            { step: '3', title: 'Explore & Save', desc: 'View maps, hotels, budget chart — save or export as PDF' },
                        ].map((s) => (
                            <div key={s.step} style={{ flex: '1 1 200px', minWidth: 180 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 10,
                                    background: 'var(--color-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 14px',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                }}>
                                    {s.step}
                                </div>
                                <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: '1.05rem' }}>{s.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── TECH STACK ────────────────────────── */}
            <section style={{ padding: '44px 24px', textAlign: 'center' }}>
                <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 14,
                    fontWeight: 600,
                }}>
                    Built With
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {['React', 'Node.js', 'MongoDB', 'Gemma 3 AI', 'Google Maps', 'Express'].map(t => (
                        <span key={t} style={{
                            padding: '6px 14px',
                            borderRadius: 6,
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            background: 'var(--bg-glass)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)',
                        }}>
                            {t}
                        </span>
                    ))}
                </div>
            </section>

            {/* ─── CTA BANNER ──────────────────────────────────── */}
            <section style={{
                padding: '80px 24px',
                textAlign: 'center',
                background: '#111827',
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{
                        fontWeight: 700,
                        fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                        marginBottom: 12,
                        color: '#fff',
                        letterSpacing: '-0.01em',
                    }}>
                        Ready to explore India?
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32, fontSize: '0.95rem', maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.7 }}>
                        Create your free account and generate your first AI trip plan in under 30 seconds.
                    </p>
                    <Link
                        to={isAuthenticated ? '/plan' : '/register'}
                        className="btn-primary"
                        style={{
                            padding: '16px 40px',
                            background: '#d97706',
                            fontSize: '1.05rem',
                            textDecoration: 'none',
                            boxShadow: '0 4px 16px rgba(217,119,6,0.3)',
                            borderRadius: 10,
                        }}
                    >
                        Get Started Free
                    </Link>
                </div>
            </section>
        </div>
    );
}
