import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const CATEGORY_META = {
    all:       { label: 'All',       emoji: '🌍', color: '#0d9488' },
    beach:     { label: 'Beaches',   emoji: '🏖️', color: '#0ea5e9' },
    mountain:  { label: 'Mountains', emoji: '🏔️', color: '#059669' },
    heritage:  { label: 'Heritage',  emoji: '🏛️', color: '#d97706' },
    nature:    { label: 'Nature',    emoji: '🌿', color: '#16a34a' },
    adventure: { label: 'Adventure', emoji: '🧗', color: '#dc2626' },
};

const STYLE_LABELS = {
    all: 'All Styles', adventure: 'Adventure', relaxation: 'Relaxation',
    cultural: 'Cultural', family: 'Family', romantic: 'Romantic',
};

const STYLE_COLORS = {
    adventure: '#059669', relaxation: '#0d9488', cultural: '#d97706',
    family: '#3b82f6', romantic: '#ec4899',
};

/* ─── Destination Card ─── */
function DestCard({ dest, onPlan }) {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(false);
    const cat = CATEGORY_META[dest.category] || CATEGORY_META.all;

    return (
        <div
            role="button" tabIndex={0}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                border: '1px solid var(--border-color)', background: 'var(--bg-card)',
                transition: 'box-shadow .25s, transform .25s',
                boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                transform: hovered ? 'translateY(-4px)' : 'none',
                display: 'flex', flexDirection: 'column',
            }}
        >
            {/* Image */}
            <div style={{ height: 150, position: 'relative', overflow: 'hidden',
                background: `linear-gradient(135deg, ${cat.color}22, ${cat.color}44)` }}>
                {dest.image ? (
                    <img src={dest.image} alt={dest.name} loading="lazy" style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        transition: 'transform .4s', transform: hovered ? 'scale(1.06)' : 'scale(1)',
                    }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                        {cat.emoji}
                    </div>
                )}
                {/* Category badge */}
                <span style={{
                    position: 'absolute', top: 10, left: 10, padding: '3px 10px',
                    borderRadius: 20, fontSize: '0.68rem', fontWeight: 700,
                    background: 'rgba(0,0,0,.55)', color: '#fff', backdropFilter: 'blur(4px)',
                }}>{cat.emoji} {cat.label}</span>
                {/* Season badge */}
                <span style={{
                    position: 'absolute', top: 10, right: 10, padding: '3px 10px',
                    borderRadius: 20, fontSize: '0.66rem', fontWeight: 600,
                    background: 'rgba(255,255,255,.85)', color: '#1a1a2e',
                }}>📅 {dest.bestSeason?.months}</span>
            </div>

            {/* Body */}
            <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {dest.name}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 10,
                    fontStyle: 'italic' }}>{dest.tagline}</p>

                {/* Style tags */}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                    {(dest.travelStyles || []).slice(0, 3).map(s => (
                        <span key={s} style={{
                            padding: '2px 8px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 700,
                            background: `${STYLE_COLORS[s] || '#666'}14`, color: STYLE_COLORS[s] || '#666',
                            textTransform: 'capitalize',
                        }}>{s}</span>
                    ))}
                </div>

                {/* Budget & Duration */}
                <div style={{ display: 'flex', gap: 12, fontSize: '0.74rem', color: 'var(--text-secondary)',
                    marginBottom: 10 }}>
                    <span>💰 ₹{(dest.budgetRange?.low || 0).toLocaleString()}–₹{(dest.budgetRange?.high || 0).toLocaleString()}/day</span>
                    <span>📆 {dest.suggestedDuration?.min}–{dest.suggestedDuration?.max}d</span>
                </div>

                {/* Highlights */}
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 14,
                    lineHeight: 1.5, flex: 1 }}>
                    {(dest.highlights || []).slice(0, 3).join(' • ')}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={(e) => { e.stopPropagation(); onPlan(dest); }}
                        style={{
                            flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                            background: 'var(--color-primary)', color: '#fff', fontWeight: 700,
                            fontSize: '0.78rem', cursor: 'pointer', transition: 'all .2s',
                        }}>
                        ✨ Plan Trip
                    </button>
                    <button onClick={(e) => {
                        e.stopPropagation();
                        const q = encodeURIComponent(dest.name);
                        window.open(`https://www.google.com/maps/search/${q}`, '_blank');
                    }}
                        style={{
                            padding: '8px 14px', borderRadius: 8,
                            border: '1px solid var(--border-color)', background: 'var(--bg-glass)',
                            color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem',
                            cursor: 'pointer', transition: 'all .2s',
                        }}>
                        🗺️
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Seasonal Pick Card (compact) ─── */
function SeasonalCard({ dest, onPlan }) {
    return (
        <div style={{
            minWidth: 200, padding: '14px 16px', borderRadius: 12,
            border: '1px solid var(--border-color)', background: 'var(--bg-card)',
            cursor: 'pointer', transition: 'all .2s', flexShrink: 0,
        }}
            onClick={() => onPlan(dest)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none'; }}
        >
            <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>
                {CATEGORY_META[dest.category]?.emoji || '🌍'}
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 2 }}>
                {dest.name?.split(',')[0]}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {dest.tagline}
            </div>
        </div>
    );
}

/* ─── Skeleton Card ─── */
function CardSkeleton() {
    return (
        <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border-color)',
            background: 'var(--bg-card)' }}>
            <div className="skeleton" style={{ height: 150, borderRadius: 0 }} />
            <div style={{ padding: '14px 16px' }}>
                <div className="skeleton" style={{ height: 18, width: '70%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: '90%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 28, width: '100%' }} />
            </div>
        </div>
    );
}

/* ─── Main Explore Page ─── */
export default function Explore() {
    const navigate = useNavigate();
    const { searchQuery } = useOutletContext();

    const [category, setCategory] = useState('all');
    const [style, setStyle] = useState('all');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery), 200);
        return () => clearTimeout(t);
    }, [searchQuery]);

    // Fetch destinations
    const { data, isLoading, error } = useQuery({
        queryKey: ['explore-destinations', category, style, debouncedSearch],
        queryFn: async () => {
            const params = new URLSearchParams({ limit: '30' });
            if (category !== 'all') params.set('category', category);
            if (style !== 'all') params.set('style', style);
            if (debouncedSearch) params.set('search', debouncedSearch);
            const res = await api.get(`/explore/destinations?${params}`);
            return res.data.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    // Fetch trending
    const { data: trendingData } = useQuery({
        queryKey: ['explore-trending'],
        queryFn: async () => {
            const res = await api.get('/explore/trending');
            return res.data.data;
        },
        staleTime: 10 * 60 * 1000,
    });

    const destinations = data?.destinations || [];
    const seasonal = trendingData?.seasonal || [];
    const trending = trendingData?.trending || [];

    const handlePlan = useCallback((dest) => {
        const name = dest.name?.split(',')[0]?.trim() || dest.destination?.split(',')[0]?.trim();
        navigate('/plan', { state: { prefill: { destination: dest.name || dest.destination } } });
    }, [navigate]);

    const activeCount = destinations.length;

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: 4 }}>
                    Explore Destinations 🧭
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    Discover where to go next — browse by category, season, or vibe.
                </p>
            </div>

            {/* Seasonal Picks (horizontal scroll) */}
            {seasonal.length > 0 && !debouncedSearch && category === 'all' && style === 'all' && (
                <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 10 }}>
                        🌤️ Best to Visit Right Now
                    </h3>
                    <div style={{
                        display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6,
                        scrollbarWidth: 'thin',
                    }}>
                        {seasonal.map(d => <SeasonalCard key={d.id} dest={d} onPlan={handlePlan} />)}
                    </div>
                </div>
            )}

            {/* Trending (if there's actual data) */}
            {trending.length > 0 && !debouncedSearch && category === 'all' && style === 'all' && (
                <div style={{
                    marginBottom: 24, padding: '16px 20px', borderRadius: 14,
                    background: 'linear-gradient(135deg, rgba(13,148,136,.04), rgba(20,184,166,.02))',
                    border: '1px solid rgba(13,148,136,.12)',
                }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 10 }}>
                        🔥 Trending on GoTrip
                    </h3>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        {trending.slice(0, 5).map((t, i) => (
                            <div key={i} onClick={() => handlePlan(t)} style={{
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                padding: '6px 14px', borderRadius: 10, background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)', transition: 'all .15s',
                                fontSize: '0.82rem',
                            }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                            >
                                <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>#{i + 1}</span>
                                <span style={{ fontWeight: 600 }}>{t.destination?.split(',')[0]}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                                    {t.tripCount} trip{t.tripCount !== 1 ? 's' : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                    <button key={key} onClick={() => setCategory(key)}
                        style={{
                            padding: '7px 16px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                            border: category === key ? `2px solid ${meta.color}` : '1.5px solid var(--border-color)',
                            background: category === key ? `${meta.color}12` : 'var(--bg-card)',
                            color: category === key ? meta.color : 'var(--text-secondary)',
                            cursor: 'pointer', transition: 'all .15s',
                        }}>
                        {meta.emoji} {meta.label}
                    </button>
                ))}
            </div>

            {/* Style Filter Row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Style:</span>
                {Object.entries(STYLE_LABELS).map(([key, label]) => (
                    <button key={key} onClick={() => setStyle(key)}
                        style={{
                            padding: '5px 14px', borderRadius: 16, fontSize: '0.75rem', fontWeight: 600,
                            border: style === key ? '1.5px solid var(--color-primary)' : '1px solid var(--border-color)',
                            background: style === key ? 'rgba(13,148,136,.08)' : 'transparent',
                            color: style === key ? 'var(--color-primary)' : 'var(--text-muted)',
                            cursor: 'pointer', transition: 'all .15s',
                        }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Results count */}
            {!isLoading && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                    {activeCount} destination{activeCount !== 1 ? 's' : ''} found
                    {debouncedSearch ? ` for "${debouncedSearch}"` : ''}
                </p>
            )}

            {/* Grid */}
            {isLoading ? (
                <div className="explore-grid" style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
                }}>
                    {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                </div>
            ) : error ? (
                <div style={{
                    textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)',
                    borderRadius: 16, border: '1px solid var(--border-color)',
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>😞</div>
                    <p style={{ color: 'var(--color-danger)', fontSize: '0.88rem', marginBottom: 12 }}>
                        Failed to load destinations
                    </p>
                    <button className="btn-outline" style={{ padding: '8px 24px', fontSize: '0.82rem' }}
                        onClick={() => window.location.reload()}>Retry</button>
                </div>
            ) : destinations.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)',
                    borderRadius: 16, border: '2px dashed var(--border-color)',
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>
                        No destinations match your filters
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
                        Try a different category or clear your search.
                    </p>
                    <button className="btn-outline" style={{ padding: '8px 24px', fontSize: '0.82rem' }}
                        onClick={() => { setCategory('all'); setStyle('all'); }}>
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="explore-grid" style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
                }}>
                    {destinations.map(d => (
                        <DestCard key={d.id} dest={d} onPlan={handlePlan} />
                    ))}
                </div>
            )}
        </div>
    );
}
