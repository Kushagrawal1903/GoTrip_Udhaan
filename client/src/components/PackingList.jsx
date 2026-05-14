import { useState } from 'react';
import Skeleton from './ui/Skeleton';

/**
 * PackingList — AI-generated packing checklist with interactive checkboxes
 */
export default function PackingList({ packingList, generating, error, onGenerate, onToggle, progress, onDownload }) {
    const [collapsedCategories, setCollapsedCategories] = useState({});

    const toggleCategory = (index) => {
        setCollapsedCategories(prev => ({ ...prev, [index]: !prev[index] }));
    };

    // Empty state — show generate button
    if (!packingList?.categories?.length && !generating) {
        return (
            <div className="glass-card animate-fade-in-up" style={{ padding: '40px 28px', textAlign: 'center', marginTop: 28 }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🧳</div>
                <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                    Smart Packing List
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.6 }}>
                    Generate a personalized packing checklist based on your destination, activities, and trip style — powered by AI.
                </p>
                {error && (
                    <div style={{
                        padding: '12px 18px', borderRadius: 8, marginBottom: 16,
                        background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)',
                        color: '#dc2626', fontSize: '0.85rem',
                    }}>
                        {error}
                    </div>
                )}
                <button
                    className="btn-primary"
                    onClick={onGenerate}
                    aria-label="Generate packing list"
                    style={{ padding: '14px 32px', fontSize: '1rem' }}
                >
                    🧳 Generate Packing List
                </button>
            </div>
        );
    }

    // Loading skeleton
    if (generating) {
        return (
            <div className="glass-card animate-fade-in" style={{ padding: '32px 28px', marginTop: 28 }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12, animation: 'floatBob 2s ease-in-out infinite' }}>🧳</div>
                    <p style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                        Generating your personalized packing list...
                    </p>
                </div>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ marginBottom: 18 }}>
                        <Skeleton height={18} width={160} style={{ marginBottom: 10 }} />
                        <Skeleton height={14} width="90%" style={{ marginBottom: 6 }} />
                        <Skeleton height={14} width="75%" style={{ marginBottom: 6 }} />
                        <Skeleton height={14} width="85%" />
                    </div>
                ))}
            </div>
        );
    }

    // Rendered packing list
    const { checked, total, percent } = progress;

    return (
        <div className="animate-fade-in-up" style={{ marginTop: 28 }}>
            {/* Header with progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    🧳 Packing List
                    <span style={{
                        fontSize: '0.78rem', fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                        background: percent === 100 ? 'rgba(22, 163, 74, 0.1)' : 'rgba(13, 148, 136, 0.1)',
                        color: percent === 100 ? '#16a34a' : '#0d9488',
                    }}>
                        {checked} of {total} packed
                    </span>
                </h3>
                <button
                    onClick={onDownload}
                    className="btn-outline"
                    aria-label="Download packing list as text"
                    style={{ padding: '7px 16px', fontSize: '0.82rem' }}
                >
                    📥 Download List
                </button>
            </div>

            {/* Progress bar */}
            <div style={{
                height: 4, borderRadius: 2, background: 'var(--border-color)', marginBottom: 20, overflow: 'hidden',
            }}>
                <div style={{
                    height: '100%', borderRadius: 2, width: `${percent}%`,
                    background: percent === 100
                        ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                        : 'linear-gradient(90deg, #0d9488, #14b8a6)',
                    transition: 'width 0.4s ease',
                }} />
            </div>

            {/* Error toast */}
            {error && (
                <div style={{
                    padding: '10px 16px', borderRadius: 8, marginBottom: 16,
                    background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)',
                    color: '#dc2626', fontSize: '0.82rem',
                }}>
                    {error}
                </div>
            )}

            {/* Weather note */}
            {packingList.weatherNote && (
                <div style={{
                    padding: '14px 18px', borderRadius: 10, marginBottom: 18,
                    background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.15)',
                    display: 'flex', alignItems: 'center', gap: 10,
                }}>
                    <span style={{ fontSize: '1.2rem' }}>🌤️</span>
                    <p style={{ color: '#2563eb', fontSize: '0.85rem', lineHeight: 1.5 }}>
                        {packingList.weatherNote}
                    </p>
                </div>
            )}

            {/* Categories grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // More flexible for mobile
                gap: 14,
            }}>
                {packingList.categories.map((category, catIdx) => {
                    const isCollapsed = collapsedCategories[catIdx];
                    const catChecked = category.items?.filter(i => i.checked).length || 0;
                    const catTotal = category.items?.length || 0;

                    return (
                        <div key={catIdx} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                            {/* Category header */}
                            <button
                                onClick={() => toggleCategory(catIdx)}
                                aria-label={`Toggle ${category.name} category`}
                                aria-expanded={!isCollapsed}
                                style={{
                                    width: '100%', padding: '12px 16px',
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    textAlign: 'left', color: 'var(--text-primary)',
                                    borderBottom: isCollapsed ? 'none' : '1px solid var(--border-color)',
                                }}
                            >
                                <span style={{ fontSize: '1.2rem' }}>{category.icon || '📦'}</span>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', flex: 1 }}>{category.name}</span>
                                <span style={{
                                    fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                                    background: catChecked === catTotal && catTotal > 0
                                        ? 'rgba(22, 163, 74, 0.1)' : 'var(--bg-glass)',
                                    color: catChecked === catTotal && catTotal > 0
                                        ? '#16a34a' : 'var(--text-muted)',
                                }}>
                                    {catChecked}/{catTotal}
                                </span>
                                <span style={{
                                    fontSize: '0.7rem', transition: 'transform 0.2s',
                                    transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                    color: 'var(--text-muted)',
                                }}>
                                    ▼
                                </span>
                            </button>

                            {/* Items */}
                            {!isCollapsed && (
                                <div style={{ padding: '8px 0' }}>
                                    {category.items?.map((item, itemIdx) => (
                                        <label
                                            key={itemIdx}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 10,
                                                padding: '8px 18px', cursor: 'pointer',
                                                transition: 'background 0.15s',
                                                background: item.checked ? 'rgba(13, 148, 136, 0.03)' : 'transparent',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-glass)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = item.checked ? 'rgba(13, 148, 136, 0.03)' : 'transparent'; }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={item.checked || false}
                                                onChange={() => onToggle && onToggle(catIdx, itemIdx, !item.checked)}
                                                disabled={!onToggle}
                                                aria-label={`Mark ${item.name} as ${item.checked ? 'unpacked' : 'packed'}`}
                                                style={{
                                                    width: 18, height: 18, accentColor: 'var(--color-primary)',
                                                    cursor: onToggle ? 'pointer' : 'default', flexShrink: 0,
                                                    opacity: onToggle ? 1 : 0.7
                                                }}
                                            />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <span style={{
                                                    fontSize: '0.85rem', fontWeight: 500,
                                                    textDecoration: item.checked ? 'line-through' : 'none',
                                                    color: item.checked ? 'var(--text-muted)' : 'var(--text-primary)',
                                                    transition: 'all 0.2s',
                                                }}>
                                                    {item.name}
                                                    {item.quantity > 1 && (
                                                        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (×{item.quantity})</span>
                                                    )}
                                                </span>
                                                {item.note && (
                                                    <span style={{
                                                        display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)',
                                                        marginTop: 2, lineHeight: 1.3,
                                                    }}>
                                                        {item.note}
                                                    </span>
                                                )}
                                            </div>
                                            {item.essential && (
                                                <span style={{
                                                    fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px',
                                                    borderRadius: 4, background: 'rgba(220, 38, 38, 0.08)',
                                                    color: '#dc2626', flexShrink: 0, textTransform: 'uppercase',
                                                    letterSpacing: '0.04em',
                                                }}>
                                                    Essential
                                                </span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Pro tip */}
            {packingList.proTip && (
                <div style={{
                    padding: '14px 18px', borderRadius: 10, marginTop: 18,
                    background: 'rgba(217, 119, 6, 0.06)', border: '1px solid rgba(217, 119, 6, 0.15)',
                    display: 'flex', alignItems: 'center', gap: 10,
                }}>
                    <span style={{ fontSize: '1.2rem' }}>💡</span>
                    <p style={{ color: '#d97706', fontSize: '0.85rem', lineHeight: 1.5, fontWeight: 500 }}>
                        <strong>Pro Tip:</strong> {packingList.proTip}
                    </p>
                </div>
            )}
        </div>
    );
}
