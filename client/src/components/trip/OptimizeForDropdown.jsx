import React from 'react';

const OPTIONS = [
    { value: 'balanced', label: '⚡ Balanced (Best Value & Time)', icon: 'ti ti-scale' },
    { value: 'cheapest', label: '💰 Cheapest (Cost-efficient)', icon: 'ti ti-coin' },
    { value: 'fastest', label: '✈️ Fastest (Save travel time)', icon: 'ti ti-bolt' },
    { value: 'comfort', label: '🛋️ Comfort (Luxury/Convenience)', icon: 'ti ti-sofa' }
];

export default function OptimizeForDropdown({ value = 'balanced', onChange, loading }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: 12,
            padding: '8px 16px',
            boxShadow: 'var(--shadow-sm)',
            width: 'fit-content'
        }} className="optimize-dropdown-container">
            <span style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap'
            }}>
                Optimize For:
            </span>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={loading}
                    style={{
                        padding: '6px 36px 6px 12px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        borderRadius: 8,
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        outline: 'none',
                        appearance: 'none',
                        transition: 'border-color 0.2s',
                        minWidth: 220
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                >
                    {OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                {/* Dropdown Chevron */}
                <i className="ti ti-chevron-down" style={{
                    position: 'absolute',
                    right: 12,
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                    fontSize: '0.9rem'
                }} />

                {/* Loading spinner */}
                {loading && (
                    <div style={{
                        marginLeft: 10,
                        width: 16,
                        height: 16,
                        border: '2px solid rgba(13, 148, 136, 0.2)',
                        borderTop: '2px solid var(--wiz-teal)',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                    }} />
                )}
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
